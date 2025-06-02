import { NextResponse } from 'next/server'
import { openAIService } from '@/lib/openai-service'
import type { Deal } from '@/lib/types'

export async function POST(request: Request) {
  try {
    const { objection } = await request.json()

    if (!objection) {
      return NextResponse.json(
        { error: 'Objection is required' },
        { status: 400 }
      )
    }

    const aiResponse = await openAIService.generateObjectionResponse(objection)

    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    console.error('Error handling objection:', error)
    return NextResponse.json(
      { error: 'Failed to process objection' },
      { status: 500 }
    )
  }
}
