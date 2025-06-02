"use client"

import { useState, useEffect } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from '@/lib/utils'

interface Deal {
  id: string
  name: string
  amount: number | null
  created_at: string
  updated_at: string
  [key: string]: any
}

interface DealAnalysisListProps {
  deals: Deal[]
  loading: boolean
  onSelectDeal: (deal: Deal) => void
  type: 'win' | 'loss'
}

export function DealAnalysisList({ deals, loading, onSelectDeal, type }: DealAnalysisListProps) {
  const [analysisStatus, setAnalysisStatus] = useState<Record<string, boolean>>({})
  
  useEffect(() => {
    async function checkAnalysisStatus() {
      const statusMap: Record<string, boolean> = {}
      
      for (const deal of deals) {
        try {
          const response = await fetch(`/api/deal-analysis?dealId=${deal.id}`)
          const data = await response.json()
          statusMap[deal.id] = !!data.analysis
        } catch (error) {
          console.error(`Error checking analysis for deal ${deal.id}:`, error)
          statusMap[deal.id] = false
        }
      }
      
      setAnalysisStatus(statusMap)
    }
    
    if (deals.length > 0) {
      checkAnalysisStatus()
    }
  }, [deals])
  
  if (loading) {
    return (
      <div className="space-y-4 mt-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }
  
  if (deals.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No {type === 'win' ? 'won' : 'lost'} deals found
      </div>
    )
  }
  
  return (
    <div className="mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Deal Name</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date {type === 'win' ? 'Won' : 'Lost'}</TableHead>
            <TableHead>Analysis</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deals.map((deal) => (
            <TableRow key={deal.id}>
              <TableCell className="font-medium">{deal.name}</TableCell>
              <TableCell>{deal.amount ? formatCurrency(deal.amount) : 'N/A'}</TableCell>
              <TableCell>{new Date(deal.updated_at).toLocaleDateString()}</TableCell>
              <TableCell>
                {analysisStatus[deal.id] ? (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    Completed
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                    Not Analyzed
                  </span>
                )}
              </TableCell>
              <TableCell>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onSelectDeal(deal)}
                >
                  {analysisStatus[deal.id] ? 'View Analysis' : 'Create Analysis'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
