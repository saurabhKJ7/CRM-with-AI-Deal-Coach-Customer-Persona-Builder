"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from '@/lib/utils'

interface Deal {
  id: string
  name: string
  amount: number | null
  [key: string]: any
}

interface Analysis {
  id: string
  deal_id: string
  analysis_type: 'win' | 'loss'
  decision_maker_role: string
  competing_solutions: string
  budget_constraints: boolean
  budget_notes: string
  timeline_pressure: string
  key_factors: string[]
  missing_features: string[]
  ai_analysis: string
  created_at: string
  updated_at: string
}

interface DealAnalysisResultProps {
  deal: Deal
  analysis: Analysis
  onBack: () => void
}

export function DealAnalysisResult({ deal, analysis, onBack }: DealAnalysisResultProps) {
  // Convert the AI analysis text to paragraphs
  const analysisContent = analysis.ai_analysis.split('\n\n').filter(p => p.trim());
  
  return (
    <Card className="mb-8 bg-white border shadow-sm">
      <CardHeader className="bg-blue-50 bg-opacity-50">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              {deal.name}
              <Badge variant={analysis.analysis_type === 'win' ? 'success' : 'destructive'}>
                {analysis.analysis_type === 'win' ? 'Won' : 'Lost'}
              </Badge>
            </CardTitle>
            <CardDescription>
              {deal.amount ? `Deal value: ${formatCurrency(deal.amount)}` : 'No deal value specified'}
            </CardDescription>
          </div>
          <div className="text-sm text-gray-500">
            Analysis created: {new Date(analysis.created_at).toLocaleDateString()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Deal Context</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium">Decision Maker:</span>{' '}
                <span>{analysis.decision_maker_role || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-sm font-medium">Competing Solutions:</span>{' '}
                <span>{analysis.competing_solutions || 'None mentioned'}</span>
              </div>
              <div>
                <span className="text-sm font-medium">Budget Constraints:</span>{' '}
                <span>{analysis.budget_constraints ? 'Yes' : 'No'}</span>
              </div>
              {analysis.budget_constraints && (
                <div>
                  <span className="text-sm font-medium">Budget Notes:</span>{' '}
                  <span>{analysis.budget_notes}</span>
                </div>
              )}
              <div>
                <span className="text-sm font-medium">Timeline Pressure:</span>{' '}
                <span className="capitalize">{analysis.timeline_pressure || 'Normal'}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              {analysis.analysis_type === 'win' ? 'Key Success Factors' : 'Missing Features'}
            </h3>
            {analysis.analysis_type === 'win' ? (
              <ul className="list-disc pl-5 space-y-1">
                {analysis.key_factors?.length ? (
                  analysis.key_factors.map((factor, index) => (
                    <li key={index}>{factor}</li>
                  ))
                ) : (
                  <li>No key factors specified</li>
                )}
              </ul>
            ) : (
              <ul className="list-disc pl-5 space-y-1">
                {analysis.missing_features?.length ? (
                  analysis.missing_features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))
                ) : (
                  <li>No missing features specified</li>
                )}
              </ul>
            )}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">AI Analysis</h3>
          <div className="bg-green-50 p-4 rounded-md border border-green-100">
            {analysisContent.map((paragraph, index) => (
              <p key={index} className={index > 0 ? 'mt-4' : ''}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50">
        <Button onClick={onBack}>Back to Deals</Button>
      </CardFooter>
    </Card>
  )
}
