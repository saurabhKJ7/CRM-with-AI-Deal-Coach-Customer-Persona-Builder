"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PhoneCall } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"

interface RecentContact {
  id: string
  first_name: string
  last_name: string
  job_title: string
  company_name: string
}

export default function RecentContacts() {
  const [recentContacts, setRecentContacts] = React.useState<RecentContact[]>([])
  const [loading, setLoading] = React.useState(true)

  const fetchRecentContacts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          id,
          first_name,
          last_name,
          job_title,
          companies(name)
        `)
        .order('created_at', { ascending: false })
        .limit(3)

      if (error) throw error
      
      const formattedContacts = data?.map(contact => ({
        id: contact.id,
        first_name: contact.first_name,
        last_name: contact.last_name,
        job_title: contact.job_title || 'Unknown Position',
        company_name: contact.companies?.name || 'Unknown Company'
      })) || []

      setRecentContacts(formattedContacts)
    } catch (error) {
      console.error('Error fetching recent contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchRecentContacts()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PhoneCall className="h-5 w-5 text-blue-500" />
          <span>Recent Contacts</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="space-y-2 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="flex items-center justify-between">
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {recentContacts.length > 0 ? recentContacts.map((contact) => (
              <div key={contact.id} className="space-y-2">
                <div className="font-medium">{contact.first_name} {contact.last_name}</div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div>{contact.company_name}</div>
                  <div>{contact.job_title}</div>
                </div>
              </div>
            )) : (
              <div className="text-center text-gray-500 py-4">
                No contacts found
              </div>
            )}
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t">
          <Link href="/contacts" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
            View all contacts →
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}