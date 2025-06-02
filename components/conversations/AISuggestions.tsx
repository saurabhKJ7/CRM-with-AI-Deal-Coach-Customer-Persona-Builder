"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, AlertCircle, MessageSquare, ArrowRight, Lightbulb, PieChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import type { DealAiSuggestion } from "@/lib/types"

interface AISuggestionsProps {
  suggestions: DealAiSuggestion | null
  isLoading?: boolean
  onRefresh?: () => void
}

export default function AISuggestions({ suggestions, isLoading = false, onRefresh }: AISuggestionsProps) {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-blue-500" />
            AI Deal Coach
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6">
            <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="animate-pulse h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="animate-pulse h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="animate-pulse h-20 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!suggestions) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-blue-500" />
            AI Deal Coach
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No AI analysis available</h3>
            <p className="text-gray-500 mb-4">
              The AI hasn't analyzed this conversation yet. Click below to generate insights.
            </p>
            <Button onClick={onRefresh} disabled={!onRefresh}>
              Generate AI Insights
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const sentimentColor = 
    suggestions.sentiment_analysis.includes('positive') ? 'bg-green-100 text-green-800 border-green-200' :
    suggestions.sentiment_analysis.includes('negative') ? 'bg-red-100 text-red-800 border-red-200' :
    suggestions.sentiment_analysis.includes('mixed') ? 'bg-amber-100 text-amber-800 border-amber-200' :
    'bg-gray-100 text-gray-800 border-gray-200';

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lightbulb className="h-5 w-5 mr-2 text-blue-500" />
          AI Deal Coach
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="mb-4">
          <Badge variant="outline" className={cn("px-3 py-1", sentimentColor)}>
            <PieChart className="h-3 w-3 mr-1" />
            Sentiment: {suggestions.sentiment_analysis}
          </Badge>
        </div>

        <Accordion type="single" collapsible defaultValue="nextSteps">
          <AccordionItem value="nextSteps">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center">
                <ArrowRight className="h-4 w-4 mr-2 text-blue-500" />
                Recommended Next Steps
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pl-6 pt-2">
                {suggestions.next_steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <p className="text-sm">{step}</p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="keyPoints">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center">
                <Lightbulb className="h-4 w-4 mr-2 text-amber-500" />
                Key Points Identified
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pl-6 pt-2">
                {suggestions.key_points.map((point, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-amber-400 mt-1.5"></div>
                    <p className="text-sm">{point}</p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {suggestions.objections_identified.length > 0 && (
            <AccordionItem value="objections">
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                  Potential Objections
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-6 pt-2">
                  {suggestions.objections_identified.map((objection, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-400 mt-1.5"></div>
                      <p className="text-sm">{objection}</p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          <AccordionItem value="followUpQuestions">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2 text-indigo-500" />
                Suggested Follow-up Questions
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pl-6 pt-2">
                {suggestions.follow_up_questions.map((question, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-indigo-400 mt-1.5"></div>
                    <p className="text-sm">{question}</p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {onRefresh && (
          <div className="flex justify-end mt-4">
            <Button variant="outline" size="sm" onClick={onRefresh}>
              Refresh Analysis
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}