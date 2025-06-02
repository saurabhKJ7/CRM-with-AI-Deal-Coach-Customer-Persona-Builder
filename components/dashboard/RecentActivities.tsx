"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { format, isToday, isYesterday } from "date-fns"
import { Calendar, Phone, Mail, Users, CheckSquare, User, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type Activity = {
  id: string;
  subject: string;
  type: 'call' | 'email' | 'meeting' | 'task';
  due_date: string | null;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  description: string | null;
  contact_id: string | null;
  deal_id: string | null;
  assigned_to: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

type RecentActivitiesProps = {
  className?: string;
  limit?: number;
}

export default function RecentActivities({ className, limit = 5 }: RecentActivitiesProps) {
  const [activities, setActivities] = React.useState<Activity[]>([])
  const [loading, setLoading] = React.useState(true)
  const { toast } = useToast()

  const fetchActivities = async () => {
    try {
      // Removed placeholder data with random values and setTimeout to fix hydration issues

      // Fetch real data
      const response = await fetch(`/api/activities?pageSize=${limit}`)
      const data = await response.json()
      setActivities(data.data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch recent activities",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    // Only run on client-side to prevent hydration mismatch
    if (typeof window !== 'undefined') {
      fetchActivities();
    }
  }, [limit])

  // Regular function for getting activity icons to prevent hydration issues
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'call':
        return <Phone className="h-4 w-4 text-blue-500" />
      case 'email':
        return <Mail className="h-4 w-4 text-purple-500" />
      case 'meeting':
        return <Users className="h-4 w-4 text-green-500" />
      case 'task':
        return <CheckSquare className="h-4 w-4 text-orange-500" />
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />
    }
  }

  // Regular date formatting function to prevent hydration issues
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    }
    if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    }
    return format(date, 'MMM d, yyyy');
  }

  // Regular loading skeleton without memoization to prevent hydration issues
  const loadingSkeleton = (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array(limit).fill(0).map((_, i) => (
            <div key={i} className="flex items-start gap-4 animate-pulse">
              <div className="h-8 w-8 rounded-full bg-gray-200"></div>
              <div className="flex-1">
                <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-3 w-1/2 bg-gray-200 rounded mt-2"></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
  
  if (loading) {
    return loadingSkeleton;
  }

  // Regular function to render activity list without memoization
  const renderActivityList = () => {
    if (activities.length === 0) {
      return (
        <div className="text-center py-6 text-gray-500">
          No recent activities to display
        </div>
      );
    }
    
    return (
      <div className="space-y-5">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
              activity.completed ? 'bg-green-100' : 'bg-blue-100'
            }`}>
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm text-gray-900">{activity.subject}</div>
                <Badge 
                  variant="outline" 
                  className="capitalize text-xs"
                >
                  {activity.type}
                </Badge>
              </div>
              
              <div className="text-xs text-gray-500 mt-1">
                {activity.description ? 
                  (activity.description.length > 50 ? 
                    `${activity.description.substring(0, 50)}...` : 
                    activity.description) 
                  : ''}
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center text-xs text-gray-500">
                  <User className="h-3 w-3 mr-1" />
                  {activity.assigned_to || 'Unassigned'}
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {activity.due_date ? formatDate(activity.due_date) : 'No due date'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Regular header without memoization
  const cardHeader = (
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle>Recent Activities</CardTitle>
      <Link href="/activities">
        <Button variant="ghost" size="sm">
          View all
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </Link>
    </CardHeader>
  );

  return (
    <Card className={className}>
      {cardHeader}
      <CardContent>
        {renderActivityList()}
      </CardContent>
    </Card>
  )
}