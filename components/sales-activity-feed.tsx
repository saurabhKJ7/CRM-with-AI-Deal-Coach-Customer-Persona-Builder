"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DollarSign, Users, Calendar, Phone, Mail, CheckCircle, Clock } from "lucide-react"

// Sample data for the activity feed
const initialActivities = [
  {
    id: 1,
    type: "deal_created",
    user: "Alex Thompson",
    userInitial: "AT",
    action: "created a new deal",
    target: "Enterprise Software License",
    value: "$50,000",
    time: "2 minutes ago",
  },
  {
    id: 2,
    type: "contact_added",
    user: "Maria Garcia",
    userInitial: "MG",
    action: "added a new contact",
    target: "Sarah Johnson from Innovate Solutions",
    time: "15 minutes ago",
  },
  {
    id: 3,
    type: "meeting_scheduled",
    user: "David Wilson",
    userInitial: "DW",
    action: "scheduled a meeting with",
    target: "Michael Chen",
    time: "32 minutes ago",
  },
  {
    id: 4,
    type: "deal_closed",
    user: "Alex Thompson",
    userInitial: "AT",
    action: "closed a deal with",
    target: "GlobalTech",
    value: "$75,000",
    time: "1 hour ago",
  },
  {
    id: 5,
    type: "call_logged",
    user: "Maria Garcia",
    userInitial: "MG",
    action: "logged a call with",
    target: "John Smith",
    time: "2 hours ago",
  },
]

// Additional activities that will be added in real-time
const additionalActivities = [
  {
    id: 6,
    type: "email_sent",
    user: "Alex Thompson",
    userInitial: "AT",
    action: "sent an email to",
    target: "Emily Davis",
    time: "just now",
  },
  {
    id: 7,
    type: "task_completed",
    user: "David Wilson",
    userInitial: "DW",
    action: "completed a task",
    target: "Prepare proposal for StartupX",
    time: "just now",
  },
  {
    id: 8,
    type: "deal_updated",
    user: "Maria Garcia",
    userInitial: "MG",
    action: "updated deal stage to Negotiation",
    target: "Cloud Migration Project",
    value: "$25,000",
    time: "just now",
  },
]

export function SalesActivityFeed() {
  const [activities, setActivities] = useState(initialActivities)
  const [loading, setLoading] = useState(false)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (additionalActivities.length > 0) {
        setLoading(true)

        // Simulate network delay
        setTimeout(() => {
          const newActivity = additionalActivities.shift()
          if (newActivity) {
            setActivities((prev) => [
              { ...newActivity, time: "just now" },
              ...prev.slice(0, 4), // Keep only the 5 most recent
            ])
          }
          setLoading(false)
        }, 500)
      }
    }, 15000) // Add a new activity every 15 seconds

    return () => clearInterval(interval)
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "deal_created":
      case "deal_closed":
      case "deal_updated":
        return <DollarSign className="h-4 w-4 text-green-600" />
      case "contact_added":
        return <Users className="h-4 w-4 text-blue-600" />
      case "meeting_scheduled":
        return <Calendar className="h-4 w-4 text-purple-600" />
      case "call_logged":
        return <Phone className="h-4 w-4 text-orange-600" />
      case "email_sent":
        return <Mail className="h-4 w-4 text-indigo-600" />
      case "task_completed":
        return <CheckCircle className="h-4 w-4 text-teal-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getActivityBadge = (type: string) => {
    switch (type) {
      case "deal_created":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">New Deal</Badge>
      case "deal_closed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Closed Won</Badge>
      case "deal_updated":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Updated</Badge>
      case "contact_added":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">New Contact</Badge>
      case "meeting_scheduled":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Meeting</Badge>
      case "call_logged":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Call</Badge>
      case "email_sent":
        return <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">Email</Badge>
      case "task_completed":
        return <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-100">Completed</Badge>
      default:
        return <Badge>Activity</Badge>
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900">Real-time Sales Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 relative">
        {loading && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-100">
            <div className="h-full bg-blue-600 animate-pulse" style={{ width: "30%" }}></div>
          </div>
        )}

        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">{activity.userInitial}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{activity.user}</span>
                {getActivityBadge(activity.type)}
              </div>
              <p className="text-sm text-gray-600">
                {activity.action} <span className="font-medium">{activity.target}</span>
                {activity.value && <span className="text-green-600 font-medium"> ({activity.value})</span>}
              </p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{activity.time}</span>
              </div>
            </div>
            <div className="flex-shrink-0">{getActivityIcon(activity.type)}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
