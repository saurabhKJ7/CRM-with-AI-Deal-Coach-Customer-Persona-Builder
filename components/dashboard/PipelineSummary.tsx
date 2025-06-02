"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, Legend } from "recharts"

type PipelineSummaryProps = {
  className?: string
}

type PipelineData = {
  stage: string
  count: number
  value: number
  color: string
}

const STAGE_COLORS = {
  lead: "#94a3b8", // slate-400
  qualified: "#60a5fa", // blue-400
  proposal: "#fbbf24", // amber-400
  negotiation: "#c084fc", // purple-400
  won: "#34d399", // emerald-400
  lost: "#f87171", // red-400
}

const STAGE_LABELS = {
  lead: "Lead",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
}

export default function PipelineSummary({ className }: PipelineSummaryProps) {
  const [loading, setLoading] = React.useState(true)
  const [pipelineData, setPipelineData] = React.useState<PipelineData[]>([])
  const [viewMode, setViewMode] = React.useState<'count' | 'value'>('count')
  const { toast } = useToast()

  const fetchPipelineData = async () => {
    try {
      // Define stage order
      const stageOrder = ['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost']
      
      // Removed random placeholder data and setTimeout to fix hydration issues
      
      // Fetch real data
      const response = await fetch('/api/deals/pipeline')
      const data = await response.json()
      
      if (data.data) {
        // Transform the data for the chart
        const chartData = Object.entries(data.data).map(([stage, stats]: [string, any]) => ({
          stage,
          count: stats.count,
          value: stats.value,
          color: STAGE_COLORS[stage as keyof typeof STAGE_COLORS] || "#cbd5e1"
        }))
        
        // Sort the data in pipeline order
        chartData.sort((a, b) => stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage))
        
        setPipelineData(chartData)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load pipeline data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    // Only run on client-side to prevent hydration mismatch
    if (typeof window !== 'undefined') {
      fetchPipelineData();
    }
  }, [])

  // Regular function component for tooltip to prevent hydration issues
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-medium">{STAGE_LABELS[data.stage as keyof typeof STAGE_LABELS]}</p>
          <p className="text-sm">Deals: {data.count}</p>
          <p className="text-sm">Value: ${data.value.toLocaleString()}</p>
        </div>
      )
    }
    return null
  }

  const toggleViewMode = () => {
    setViewMode(viewMode === 'count' ? 'value' : 'count')
  }

  // Regular loading skeleton without memoization to prevent hydration issues
  const loadingSkeleton = (
    <Card className={className}>
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
  );
  
  if (loading) {
    return loadingSkeleton;
  }

  // Regular function to render chart content without memoization
  const renderChartContent = () => {
    if (pipelineData.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-gray-500">
          No pipeline data available
        </div>
      );
    }
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={pipelineData}
          margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
        >
          <XAxis 
            dataKey="stage" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => STAGE_LABELS[value as keyof typeof STAGE_LABELS] || value}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => 
              viewMode === 'value' 
                ? `$${value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}` 
                : value.toString()
            }
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey={viewMode} 
            name={viewMode === 'count' ? 'Number of Deals' : 'Deal Value ($)'}
          >
            {pipelineData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };
  
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Sales Pipeline</CardTitle>
        <div className="flex text-sm">
          <button
            onClick={toggleViewMode}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            View by {viewMode === 'count' ? 'Value ($)' : 'Count (#)'}
          </button>
        </div>
      </CardHeader>
      <CardContent className="h-80">
        {renderChartContent()}
      </CardContent>
    </Card>
  )
}