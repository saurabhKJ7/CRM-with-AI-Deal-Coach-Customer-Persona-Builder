"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { 
  Users, 
  BadgeDollarSign, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Target, 
  Calendar, 
  CheckCircle 
} from "lucide-react"

type MetricsCardsProps = {
  className?: string
}

type MetricsState = {
  totalContacts: number
  totalDeals: number
  activeDeals: number
  wonDeals: number
  lostDeals: number
  totalRevenue: number
  pipelineValue: number
  averageDealSize: number
  conversionRate: number
  activitiesCompleted: number
  activitiesPending: number
  overdueTasks: number
}

export default function MetricsCards({ className }: MetricsCardsProps) {
  const [loading, setLoading] = React.useState(true)
  const [metrics, setMetrics] = React.useState<MetricsState>({
    totalContacts: 0,
    totalDeals: 0,
    activeDeals: 0,
    wonDeals: 0,
    lostDeals: 0,
    totalRevenue: 0,
    pipelineValue: 0,
    averageDealSize: 0,
    conversionRate: 0,
    activitiesCompleted: 0,
    activitiesPending: 0,
    overdueTasks: 0
  })
  const { toast } = useToast()

  const fetchMetrics = async () => {
        try {
          // We'll set placeholder data directly to avoid setTimeout issues with hydration
          if (loading) {
            // Set placeholder data to show something quickly - commenting out to fix hydration issues
            /*
            setMetrics({
              totalContacts: 200,
              totalDeals: 25,
              activeDeals: 18,
              wonDeals: 5,
              lostDeals: 2,
              totalRevenue: 150000,
              pipelineValue: 350000,
              averageDealSize: 30000,
              conversionRate: 20,
              activitiesCompleted: 15,
              activitiesPending: 8,
              overdueTasks: 3
            });
            */
          }
      
        // Fetch all data in parallel for better performance
        const [contactsRes, dealsRes, activitiesRes] = await Promise.all([
          fetch('/api/contacts'),
          fetch('/api/deals'),
          fetch('/api/activities')
        ]);
      
        // Parse all responses in parallel
        const [contactsData, dealsData, activitiesData] = await Promise.all([
          contactsRes.json(),
          dealsRes.json(),
          activitiesRes.json()
        ]);
      
        const totalContacts = contactsData.pagination?.total || contactsData.data?.length || 0;
        const deals = dealsData.data || [];
        const activities = activitiesData.data || [];
      
        // Use a single pass through deals array for better performance
        let activeDeals = 0, wonDeals = 0, lostDeals = 0;
        let totalRevenue = 0, pipelineValue = 0;
      
        deals.forEach((d: any) => {
          if (d.stage === 'won') {
            wonDeals++;
            totalRevenue += (d.amount || 0);
          } else if (d.stage === 'lost') {
            lostDeals++;
          } else {
            activeDeals++;
            pipelineValue += (d.amount || 0);
          }
        });
      
        const totalDeals = deals.length;
        const averageDealSize = wonDeals > 0 ? Math.round(totalRevenue / wonDeals) : 0;
        const conversionRate = totalDeals > 0 ? Math.round((wonDeals / totalDeals) * 100) : 0;
      
        // Use a single pass through activities array
        let activitiesCompleted = 0, activitiesPending = 0, overdueTasks = 0;
        const now = new Date();
      
        activities.forEach((a: any) => {
          if (a.completed) {
            activitiesCompleted++;
          } else {
            activitiesPending++;
            if (a.due_date && new Date(a.due_date) < now) {
              overdueTasks++;
            }
          }
        });
      
        // Update with real data
        setMetrics({
          totalContacts,
          totalDeals,
          activeDeals,
          wonDeals,
          lostDeals,
          totalRevenue,
          pipelineValue,
          averageDealSize,
          conversionRate,
          activitiesCompleted,
          activitiesPending,
          overdueTasks
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load dashboard metrics",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

  React.useEffect(() => {
    // Only run on client-side to prevent hydration mismatch
    if (typeof window !== 'undefined') {
      fetchMetrics();
    }
  }, [])

  // Create loading skeleton (no useMemo to avoid hook ordering issues)
  const loadingSkeleton = (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {Array(8).fill(0).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-6 h-24 flex items-center justify-center">
            <div className="h-10 bg-gray-200 rounded w-3/4"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
  
  if (loading) {
    return loadingSkeleton;
  }

  // Define card data (without useMemo to fix hook ordering)
  const cardData = [
    {
      title: "Total Contacts",
      value: metrics.totalContacts.toLocaleString(),
      icon: <Users className="h-8 w-8 text-blue-500" />,
      color: "bg-blue-50"
    },
    {
      title: "Active Deals",
      value: metrics.activeDeals.toLocaleString(),
      icon: <Target className="h-8 w-8 text-indigo-500" />,
      color: "bg-indigo-50"
    },
    {
      title: "Total Revenue",
      value: `$${metrics.totalRevenue.toLocaleString()}`,
      icon: <BadgeDollarSign className="h-8 w-8 text-green-500" />,
      color: "bg-green-50"
    },
    {
      title: "Pipeline Value",
      value: `$${metrics.pipelineValue.toLocaleString()}`,
      icon: <BarChart3 className="h-8 w-8 text-purple-500" />,
      color: "bg-purple-50"
    },
    {
      title: "Average Deal Size",
      value: `$${metrics.averageDealSize.toLocaleString()}`,
      icon: <PieChart className="h-8 w-8 text-orange-500" />,
      color: "bg-orange-50"
    },
    {
      title: "Conversion Rate",
      value: `${metrics.conversionRate}%`,
      icon: <TrendingUp className="h-8 w-8 text-teal-500" />,
      color: "bg-teal-50"
    },
    {
      title: "Activities Completed",
      value: metrics.activitiesCompleted.toLocaleString(),
      icon: <CheckCircle className="h-8 w-8 text-emerald-500" />,
      color: "bg-emerald-50"
    },
    {
      title: "Overdue Tasks",
      value: metrics.overdueTasks.toLocaleString(),
      icon: <Calendar className="h-8 w-8 text-red-500" />,
      color: "bg-red-50"
    }
  ];

  // Render grid directly without useMemo to fix hook ordering
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {cardData.map((card, index) => (
        <Card key={index} className={`${card.color} border transition-all hover:shadow-md`}>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
              </div>
              <div>{card.icon}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}