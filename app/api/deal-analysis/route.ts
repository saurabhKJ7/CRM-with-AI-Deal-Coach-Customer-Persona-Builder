import { NextResponse } from 'next/server'
import { openAIService } from '@/lib/openai-service'
import { DealAnalysisService } from '@/lib/services/deal-analysis.service'
import { DealService } from '@/lib/services/deal.service'

const dealAnalysisService = new DealAnalysisService()
const dealService = new DealService()

export async function POST(request: Request) {
  try {
    const { dealId, formData } = await request.json()
    
    if (!dealId || !formData) {
      return NextResponse.json(
        { error: 'Deal ID and form data are required' },
        { status: 400 }
      )
    }
    
    // Get deal data
    let deal;
    try {
      deal = await dealService.getById(dealId)
      console.log('Deal fetched successfully:', deal?.id, deal?.name)
    } catch (dealError: any) {
      console.error('Error fetching deal:', dealError)
      return NextResponse.json(
        { error: `Failed to fetch deal: ${dealError?.message || 'Unknown error'}` },
        { status: 404 }
      )
    }
    
    // Generate AI analysis
    let aiAnalysis;
    try {
      aiAnalysis = await openAIService.generateWinLossAnalysis(
        formData.analysisType,
        deal,
        formData
      )
      console.log('AI analysis generated successfully')
    } catch (aiError: any) {
      console.error('Error generating AI analysis:', aiError)
      return NextResponse.json(
        { error: `Failed to generate AI analysis: ${aiError?.message || 'Unknown error'}` },
        { status: 500 }
      )
    }
    
    // Ensure arrays are properly formatted
    const keyFactors = Array.isArray(formData.keyFactors) ? 
      formData.keyFactors.filter((item: string) => item && item.trim()) : []
    
    const missingFeatures = Array.isArray(formData.missingFeatures) ? 
      formData.missingFeatures.filter((item: string) => item && item.trim()) : []
    
    // Save analysis with form data and AI response
    const analysisData = {
      deal_id: dealId,
      analysis_type: formData.analysisType,
      decision_maker_role: formData.decisionMakerRole || '',
      competing_solutions: formData.competingSolutions || '',
      budget_constraints: !!formData.budgetConstraints,
      budget_notes: formData.budgetNotes || '',
      timeline_pressure: formData.timelinePressure || 'normal',
      key_factors: keyFactors,
      missing_features: missingFeatures,
      ai_analysis: aiAnalysis
    }
    
    console.log('Saving analysis data:', JSON.stringify(analysisData, null, 2))
    
    let savedAnalysis;
    try {
      savedAnalysis = await dealAnalysisService.createAnalysis(analysisData)
      console.log('Analysis saved successfully:', savedAnalysis?.id)
    } catch (saveError: any) {
      console.error('Error saving analysis:', saveError)
      return NextResponse.json(
        { error: `Failed to save analysis: ${saveError?.message || 'Unknown error'}` },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ analysis: savedAnalysis })
  } catch (error: any) {
    console.error('Error creating deal analysis:', error)
    return NextResponse.json(
      { error: `Failed to create deal analysis: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dealId = searchParams.get('dealId')
    
    if (dealId) {
      const analysis = await dealAnalysisService.getAnalysisForDeal(dealId)
      return NextResponse.json({ analysis })
    } else {
      const wonDeals = await dealAnalysisService.getWonDeals()
      const lostDeals = await dealAnalysisService.getLostDeals()
      
      return NextResponse.json({ 
        wonDeals,
        lostDeals
      })
    }
  } catch (error: any) {
    console.error('Error fetching deal analysis:', error)
    return NextResponse.json(
      { error: `Failed to fetch deal analysis: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    )
  }
}
