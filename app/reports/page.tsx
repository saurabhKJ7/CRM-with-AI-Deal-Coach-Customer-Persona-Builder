"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { Download, Calendar, TrendingUp, Users, DollarSign, Target } from "lucide-react"
import type { Contact, Deal, Activity as ActivityType } from "@/lib/types"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { AppSidebar } from "@/components/app-sidebar"

// Custom hook to determine client-side rendering
const useIsClient = () => {
  const [isClient, setIsClient] = React.useState(false);
  
  React.useEffect(() => {
    setIsClient(true);
  }, []);
  
  return isClient;
};

export default function ReportsPage() {
  const isClient = useIsClient()
  const [contacts, setContacts] = React.useState<Contact[]>([])
  const [deals, setDeals] = React.useState<Deal[]>([])
  const [activities, setActivities] = React.useState<ActivityType[]>([])
  const [timeRange, setTimeRange] = React.useState("30")
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (!isClient) return; // Only fetch data on the client side
    
    const fetchData = async () => {
      try {
        const [contactsRes, dealsRes, activitiesRes] = await Promise.all([
          fetch("/api/contacts"),
          fetch("/api/deals"),
          fetch("/api/activities"),
        ])

        const [contactsData, dealsData, activitiesData] = await Promise.all([
          contactsRes.json(),
          dealsRes.json(),
          activitiesRes.json(),
        ])

        setContacts(contactsData.data || [])
        setDeals(dealsData.data || [])
        setActivities(activitiesData.data || [])
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isClient])

  // Calculate metrics
  const getMetrics = () => {
    const totalContacts = contacts?.length || 0
    const totalDeals = deals?.length || 0
    const totalRevenue = deals?.filter((d) => d?.stage === "won").reduce((sum, d) => sum + (d?.amount || 0), 0) || 0
    const pipelineValue = deals
      ?.filter((d) => !["won", "lost"].includes(d?.stage))
      .reduce((sum, d) => sum + (d?.amount || 0), 0) || 0
    const winRate = totalDeals > 0 ? (deals?.filter((d) => d?.stage === "won").length / totalDeals) * 100 : 0
    const avgDealSize = totalDeals > 0 ? totalRevenue / (deals?.filter((d) => d?.stage === "won").length || 1) : 0

    return {
      totalContacts,
      totalDeals,
      totalRevenue,
      pipelineValue,
      winRate,
      avgDealSize: avgDealSize || 0,
    }
  }

  // Sales pipeline data
  const getPipelineData = () => {
    const stages = ["lead", "qualified", "proposal", "negotiation", "won", "lost"]
    return stages.map((stage) => ({
      stage: stage.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      count: deals?.filter((d) => d?.stage === stage)?.length || 0,
      value: deals?.filter((d) => d?.stage === stage)?.reduce((sum, d) => sum + (d?.amount || 0), 0) || 0,
    }))
  }

  // Revenue trend data (static mock monthly data to prevent hydration errors)
  const getRevenueData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    const values = [75000, 92000, 63000, 110000, 87000, 120000]
    const dealCounts = [8, 10, 6, 12, 9, 14]
    
    return months.map((month, index) => ({
      month,
      revenue: values[index],
      deals: dealCounts[index],
    }))
  }

  // Activity distribution
  const getActivityData = () => {
    const types = ["call", "email", "meeting", "task", "note"]
    return types.map((type) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count: activities?.filter((a) => a?.type === type)?.length || 0,
    }))
  }

  // Deal sources (mock data)
  const getDealSourceData = () => {
    return [
      { source: "Website", value: 35, color: "#3B82F6" },
      { source: "Referral", value: 25, color: "#10B981" },
      { source: "Cold Outreach", value: 20, color: "#F59E0B" },
      { source: "Social Media", value: 15, color: "#EF4444" },
      { source: "Events", value: 5, color: "#8B5CF6" },
    ]
  }

  // Top performers (mock data)
  const getTopPerformers = () => {
    return [
      { name: "Alex Thompson", deals: 12, revenue: 450000 },
      { name: "Maria Garcia", deals: 8, revenue: 320000 },
      { name: "David Wilson", deals: 6, revenue: 280000 },
      { name: "Sarah Johnson", deals: 5, revenue: 210000 },
    ]
  }

  const metrics = getMetrics()
  const pipelineData = getPipelineData()
  const revenueData = getRevenueData()
  const activityData = getActivityData()
  const dealSourceData = getDealSourceData()
  const topPerformers = getTopPerformers()

  // Show a loading state while on server or when data is loading
  if (!isClient || loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">CRM</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Reports</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="flex flex-1 flex-col gap-6 p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-lg">Loading reports...</div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">CRM</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Reports</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into your sales performance and metrics.</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Custom Range
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Contacts</p>
                <p className="text-2xl font-bold mt-1">{metrics.totalContacts}</p>
              </div>
              <div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Deals</p>
                <p className="text-2xl font-bold mt-1">{metrics.totalDeals}</p>
              </div>
              <div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold mt-1">${(metrics.totalRevenue / 1000).toFixed(0)}K</p>
              </div>
              <div>
                <DollarSign className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Win Rate</p>
                <p className="text-2xl font-bold mt-1">{metrics.winRate.toFixed(1)}%</p>
              </div>
              <div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Pipeline */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Sales Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Distribution */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Activity Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activityData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ type, count }) => `${type}: ${count}`}
                  >
                    {activityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Deal Sources */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Deal Sources</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dealSourceData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ source, value }) => `${source}: ${value}%`}
                  >
                    {dealSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((performer, index) => (
                <div key={performer.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{performer.name}</div>
                      <div className="text-sm text-gray-600">{performer.deals} deals closed</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">${performer.revenue.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Revenue</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Key Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="font-medium text-blue-900">Pipeline Health</div>
                <div className="text-sm text-blue-700 mt-1">
                  Your pipeline value is ${metrics.pipelineValue.toLocaleString()}. Consider focusing on moving deals
                  from proposal to negotiation stage.
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                <div className="font-medium text-green-900">Win Rate Improvement</div>
                <div className="text-sm text-green-700 mt-1">
                  Your current win rate of {metrics.winRate.toFixed(1)}% is above industry average. Keep up the great
                  work!
                </div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                <div className="font-medium text-orange-900">Activity Recommendation</div>
                <div className="text-sm text-orange-700 mt-1">
                  Increase follow-up calls by 20% to improve deal velocity and close rates.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
