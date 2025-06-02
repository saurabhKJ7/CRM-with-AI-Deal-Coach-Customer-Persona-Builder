"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"

interface TopDeal {
  id: string
  name: string
  amount: number
  stage: string
  probability: number
  company_name: string
}

export default function TopDeals() {
  const [topDeals, setTopDeals] = React.useState<TopDeal[]>([])
  const [loading, setLoading] = React.useState(true)

  const fetchTopDeals = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('deals')
        .select(`
          id,
          name,
          amount,
          stage,
          probability,
          companies(name)
        `)
        .order('amount', { ascending: false })
        .limit(3)

      if (error) throw error
      
      const formattedDeals = data?.map(deal => ({
        id: deal.id,
        name: deal.name,
        amount: deal.amount || 0,
        stage: deal.stage,
        probability: deal.probability || 0,
        company_name: deal.companies?.name || 'Unknown Company'
      })) || []

      setTopDeals(formattedDeals)
    } catch (error) {
      console.error('Error fetching top deals:', error)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchTopDeals()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          <span>Top Deals</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="space-y-2 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {topDeals.length > 0 ? topDeals.map((deal) => (
              <div key={deal.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{deal.name}</div>
                  <div className="font-medium text-green-600">
                    ${deal.amount?.toLocaleString() || '0'}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div>{deal.company_name}</div>
                  <div className="capitalize">{deal.stage} ({deal.probability}%)</div>
                </div>
              </div>
            )) : (
              <div className="text-center text-gray-500 py-4">
                No deals found
              </div>
            )}
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t">
          <Link href="/deals" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
            View all deals →
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}