"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from '@/lib/utils'
import { DealAnalysisResult } from '@/components/deal-analysis'

interface Deal {
  id: string
  name: string
  amount: number | null
  [key: string]: any
}

interface DealAnalysisFormProps {
  deal: Deal
  analysisType: 'win' | 'loss'
  onComplete: () => void
}

export function DealAnalysisForm({ deal, analysisType, onComplete }: DealAnalysisFormProps) {
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [existingAnalysis, setExistingAnalysis] = useState<any>(null)
  const [formData, setFormData] = useState<{
    analysisType: 'win' | 'loss';
    decisionMakerRole: string;
    competingSolutions: string;
    budgetConstraints: boolean;
    budgetNotes: string;
    timelinePressure: string;
    keyFactors: string[];
    missingFeatures: string[];
    [key: string]: any; // Add index signature for dynamic access
  }>({
    analysisType,
    decisionMakerRole: '',
    competingSolutions: '',
    budgetConstraints: false,
    budgetNotes: '',
    timelinePressure: 'normal',
    keyFactors: [''],
    missingFeatures: ['']
  })

  useEffect(() => {
    async function checkExistingAnalysis() {
      try {
        setLoading(true)
        const response = await fetch(`/api/deal-analysis?dealId=${deal.id}`)
        const data = await response.json()
        
        if (data.analysis) {
          setExistingAnalysis(data.analysis)
          
          // Populate form with existing data
          setFormData({
            analysisType: data.analysis.analysis_type,
            decisionMakerRole: data.analysis.decision_maker_role || '',
            competingSolutions: data.analysis.competing_solutions || '',
            budgetConstraints: data.analysis.budget_constraints || false,
            budgetNotes: data.analysis.budget_notes || '',
            timelinePressure: data.analysis.timeline_pressure || 'normal',
            keyFactors: data.analysis.key_factors?.length ? data.analysis.key_factors : [''],
            missingFeatures: data.analysis.missing_features?.length ? data.analysis.missing_features : ['']
          })
        }
      } catch (error) {
        console.error('Error checking existing analysis:', error)
      } finally {
        setLoading(false)
      }
    }

    checkExistingAnalysis()
  }, [deal.id])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArrayItemChange = (field: string, index: number, value: string) => {
    setFormData(prev => {
      const newArray = [...prev[field]]
      newArray[index] = value
      return {
        ...prev,
        [field]: newArray
      }
    })
  }

  const addArrayItem = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => {
      const newArray = [...prev[field]]
      newArray.splice(index, 1)
      return {
        ...prev,
        [field]: newArray.length ? newArray : ['']
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSubmitting(true)
      
      // Filter out empty array items
      const cleanedFormData = {
        ...formData,
        keyFactors: formData.keyFactors.filter(item => item.trim()),
        missingFeatures: formData.missingFeatures.filter(item => item.trim())
      }
      
      const response = await fetch('/api/deal-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dealId: deal.id,
          formData: cleanedFormData
        })
      })
      
      const data = await response.json()
      
      if (data.analysis) {
        setExistingAnalysis(data.analysis)
      }
    } catch (error) {
      console.error('Error submitting analysis:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Card className="bg-white border shadow-sm">
        <CardContent className="p-6 flex justify-center items-center min-h-[300px] bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto mb-4"></div>
            <p>Loading analysis data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (existingAnalysis && existingAnalysis.ai_analysis) {
    return (
      <DealAnalysisResult 
        deal={deal}
        analysis={existingAnalysis}
        onBack={onComplete}
      />
    )
  }

  return (
    <Card className="bg-white border shadow-sm">
      <form onSubmit={handleSubmit}>
        <CardHeader className="bg-blue-50 bg-opacity-50">
          <CardTitle>
            {analysisType === 'win' ? 'Win Analysis' : 'Loss Analysis'}: {deal.name}
          </CardTitle>
          <CardDescription>
            Deal value: {formatCurrency(deal.amount || 0)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 bg-white">
          <div className="space-y-4">
            <div>
              <Label htmlFor="decisionMakerRole">Primary Decision Maker Role</Label>
              <Input
                id="decisionMakerRole"
                value={formData.decisionMakerRole}
                onChange={(e) => handleInputChange('decisionMakerRole', e.target.value)}
                placeholder="e.g. CTO, VP of Sales, etc."
              />
            </div>
            
            <div>
              <Label htmlFor="competingSolutions">Competing Solutions Considered</Label>
              <Textarea
                id="competingSolutions"
                value={formData.competingSolutions}
                onChange={(e) => handleInputChange('competingSolutions', e.target.value)}
                placeholder="List any competing products or solutions that were considered"
                rows={2}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="budgetConstraints"
                checked={formData.budgetConstraints}
                onCheckedChange={(checked) => handleInputChange('budgetConstraints', checked)}
              />
              <Label htmlFor="budgetConstraints">Budget Constraints</Label>
            </div>
            
            {formData.budgetConstraints && (
              <div>
                <Label htmlFor="budgetNotes">Budget Notes</Label>
                <Textarea
                  id="budgetNotes"
                  value={formData.budgetNotes}
                  onChange={(e) => handleInputChange('budgetNotes', e.target.value)}
                  placeholder="Describe any budget constraints or considerations"
                  rows={2}
                />
              </div>
            )}
            
            <div>
              <Label>Timeline Pressure</Label>
              <RadioGroup
                value={formData.timelinePressure}
                onValueChange={(value) => handleInputChange('timelinePressure', value)}
                className="flex space-x-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="urgent" id="urgent" />
                  <Label htmlFor="urgent">Urgent</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="normal" id="normal" />
                  <Label htmlFor="normal">Normal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="flexible" id="flexible" />
                  <Label htmlFor="flexible">Flexible</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          <Separator />
          
          {analysisType === 'win' ? (
            <div className="space-y-4">
              <Label>Key Factors That Led to Win</Label>
              {formData.keyFactors.map((factor, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    value={factor}
                    onChange={(e) => handleArrayItemChange('keyFactors', index, e.target.value)}
                    placeholder="e.g. Product features, pricing, relationship, etc."
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeArrayItem('keyFactors', index)}
                    disabled={formData.keyFactors.length === 1}
                  >
                    -
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('keyFactors')}
              >
                Add Factor
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Label>Missing Features or Capabilities</Label>
              {formData.missingFeatures.map((feature, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    value={feature}
                    onChange={(e) => handleArrayItemChange('missingFeatures', index, e.target.value)}
                    placeholder="e.g. Integration with specific system, feature X, etc."
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeArrayItem('missingFeatures', index)}
                    disabled={formData.missingFeatures.length === 1}
                  >
                    -
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('missingFeatures')}
              >
                Add Missing Feature
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between bg-gray-50">
          <Button variant="outline" type="button" onClick={onComplete}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Generating Analysis...' : 'Generate Analysis'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
