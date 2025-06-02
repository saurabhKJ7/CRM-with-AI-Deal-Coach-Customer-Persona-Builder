"use client"

import { useState, useEffect } from 'react'
import { DealAnalysisList, DealAnalysisForm } from '@/components/deal-analysis'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Award, AlertTriangle, BarChart2 } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { formatCurrency } from '@/lib/utils'

export default function DealAnalysisPage() {
  const [deals, setDeals] = useState({ wonDeals: [], lostDeals: [] })
  const [selectedDeal, setSelectedDeal] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('won')

  useEffect(() => {
    async function fetchDeals() {
      try {
        setLoading(true)
        const response = await fetch('/api/deal-analysis')
        const data = await response.json()
        setDeals(data)
      } catch (error) {
        console.error('Error fetching deals:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDeals()
  }, [])

  const handleDealSelect = (deal: any) => {
    setSelectedDeal(deal)
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="p-0 bg-gray-50">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">CRM</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Deal Analysis</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="container mx-auto py-6">
          <div className="flex flex-col space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Deal Analysis</h1>
              {selectedDeal && (
                <button 
                  className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1 rounded-md border border-blue-200 hover:bg-blue-50 transition-colors flex items-center gap-1"
                  onClick={() => setSelectedDeal(null)}
                >
                  <span>←</span> Back to deals
                </button>
              )}
            </div>

            {/* Metrics Cards */}
            {!selectedDeal && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-green-50 border transition-all hover:shadow-md hover:scale-[1.01]">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Won Deals</p>
                        <p className="text-2xl font-bold mt-1">{deals.wonDeals.length}</p>
                      </div>
                      <div>
                        <Award className="h-8 w-8 text-green-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-red-50 border transition-all hover:shadow-md hover:scale-[1.01]">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Lost Deals</p>
                        <p className="text-2xl font-bold mt-1">{deals.lostDeals.length}</p>
                      </div>
                      <div>
                        <AlertTriangle className="h-8 w-8 text-red-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>
            )}

        {!selectedDeal ? (
          <Card className="bg-white border shadow-sm hover:shadow-md transition-all">
            <CardHeader className="bg-blue-50 bg-opacity-50 border-b">
              <div className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-blue-600" />
                <CardTitle>Win-Loss Analysis</CardTitle>
              </div>
              <CardDescription>
                Analyze why deals were won or lost to improve your sales process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="won" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="won">Won Deals</TabsTrigger>
                  <TabsTrigger value="lost">Lost Deals</TabsTrigger>
                </TabsList>
                <TabsContent value="won">
                  <DealAnalysisList 
                    deals={deals.wonDeals} 
                    loading={loading} 
                    onSelectDeal={handleDealSelect} 
                    type="win"
                  />
                </TabsContent>
                <TabsContent value="lost">
                  <DealAnalysisList 
                    deals={deals.lostDeals} 
                    loading={loading} 
                    onSelectDeal={handleDealSelect} 
                    type="loss"
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <DealAnalysisForm 
            deal={selectedDeal} 
            analysisType={activeTab === 'won' ? 'win' : 'loss'} 
            onComplete={() => setSelectedDeal(null)}
          />
        )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
