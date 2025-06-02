import { supabaseAdmin } from '@/lib/supabase/admin-client'
import { NextResponse } from 'next/server'
import { generatePersona } from '@/lib/services/persona.service'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { inputs } = await request.json()
    
    // Generate persona using AI
    const generatedPersona = await generatePersona(inputs)

    // Save to database
    const { data, error } = await supabaseAdmin
      .from('customer_personas')
      .insert([
        {
          contact_id: params.id,
          inputs: inputs,
          generated_persona: generatedPersona,
        }
      ])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error generating persona:', error)
    return NextResponse.json(
      { error: 'Failed to generate persona' },
      { status: 500 }
    )
  }
}
