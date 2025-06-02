"use client"

import * as React from "react"
import MetricsCards from "./MetricsCards"
import RecentActivities from "./RecentActivities"
import PipelineSummary from "./PipelineSummary"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Mail, PhoneCall, RefreshCcw, Star, BarChart3, User, Calendar } from "lucide-react"
import Link from "next/link"
import TopDeals from "./TopDeals"
import RecentContacts from "./RecentContacts"

export default function Dashboard() {
  const [loading, setLoading] = React.useState(false)
  const [lastUpdated, setLastUpdated] = React.useState<Date>(new Date())
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  const refreshData = () => {
    setLoading(true)
    // This would typically trigger a refresh of the components' data
    // For now, we'll just simulate a delay
    setTimeout(() => {
      setLoading(false)
      setLastUpdated(new Date())
    }, 1000)
  }



  const quickActionsCard = (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-500" />
          <span>Quick Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Link href="/contacts/new">
            <Button variant="outline" className="w-full justify-start">
              <User className="mr-2 h-4 w-4" />
              Add New Contact
            </Button>
          </Link>
          
          <Link href="/deals/new">
            <Button variant="outline" className="w-full justify-start">
              <DollarSign className="mr-2 h-4 w-4" />
              Create New Deal
            </Button>
          </Link>
          
          <Link href="/activities/new">
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Activity
            </Button>
          </Link>
          
          <Link href="/reports">
            <Button variant="outline" className="w-full justify-start">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Reports
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome to your CRM dashboard. Here's an overview of your sales and activity metrics.
          </p>
        </div>
        <Button 
          onClick={refreshData} 
          variant="outline" 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="text-xs text-gray-500 text-right">
        Last updated: {isClient ? lastUpdated.toLocaleTimeString() : "--:--:--"}
      </div>

      {isClient ? <MetricsCards /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 h-24 flex items-center justify-center">
                <div className="h-10 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isClient ? <PipelineSummary /> : (
          <Card>
            <CardHeader>
              <CardTitle>Sales Pipeline</CardTitle>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              <div className="animate-pulse flex flex-col items-center space-y-4">
                <div className="h-40 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {isClient ? <RecentActivities /> : (
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
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
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TopDeals />
        <RecentContacts />
        {quickActionsCard}
      </div>
    </div>
  )
}