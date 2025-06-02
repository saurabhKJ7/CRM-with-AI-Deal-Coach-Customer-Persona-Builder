import { NextResponse } from "next/server"
import { supabase } from '@/lib/supabase/client'

// Real company data from the database
// Example of actual company in the database:
// {
//   "id": "7bed90f0-2505-4318-b6ee-99cf32563af3",
//   "name": "TechCorp Inc.",
//   "industry": "Technology",
//   "website": "https://techcorp.example.com",
//   ...
// }

export async function GET() {
  try {
    console.log('Fetching companies from Supabase...')
    const { data, error, count } = await supabase
      .from('companies')
      .select('id, name, industry, website', { count: 'exact' })
      .order('name')
    
    if (error) {
      console.error('Error fetching companies from Supabase:', error)
      throw error
    }
    
    console.log(`Successfully fetched ${data.length} companies from Supabase`)
    return NextResponse.json({ 
      data: data || [],
      count: count || 0
    })
  } catch (error) {
    console.error('Error in GET /api/companies:', error)
    return NextResponse.json(
      { error: "Failed to fetch companies" }, 
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Create company data with required fields
    const companyData = {
      name: body.name,
      industry: body.industry || null,
      website: body.website || null,
      phone: body.phone || null,
      address_line1: body.address_line1 || null,
      address_line2: body.address_line2 || null,
      city: body.city || null,
      state: body.state || null,
      postal_code: body.postal_code || null,
      country: body.country || null,
      description: body.description || null,
      created_by: '00000000-0000-0000-0000-000000000000', // Default user ID
    }
    
    console.log('Creating new company in Supabase:', companyData)
    
    // Insert the new company into Supabase
    const { data, error } = await supabase
      .from('companies')
      .insert(companyData)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating company in Supabase:', error)
      throw error
    }
    
    console.log('Company created successfully:', data)
    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/companies:', error)
    return NextResponse.json(
      { error: "Failed to create company", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}