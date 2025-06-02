"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

export default function AddContactPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [companies, setCompanies] = React.useState<{id: string, name: string}[]>([])
  const [loading, setLoading] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)
  
  // Form state
  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [jobTitle, setJobTitle] = React.useState("")
  const [companyId, setCompanyId] = React.useState("")
  const [status, setStatus] = React.useState("")
  const [source, setSource] = React.useState("")
  const [notes, setNotes] = React.useState("")
  
  // Status and source options
  const statusOptions = ["Lead", "Prospect", "Customer", "Partner", "Inactive"]
  const sourceOptions = ["Website", "Referral", "Cold Outreach", "Social Media", "Events", "Advertisement"]

  // Fetch companies on mount
  React.useEffect(() => {
    async function fetchCompanies() {
      try {
        const response = await fetch('/api/companies')
        if (!response.ok) {
          throw new Error('Failed to fetch companies')
        }
        const data = await response.json()
        // API returns data in { data: [...companies] } format
        setCompanies(data.data || [])
      } catch (error) {
        console.error('Error fetching companies:', error)
        toast({
          title: "Error",
          description: "Failed to load companies. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchCompanies()
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      // Create contact data object
      const contactData = {
        first_name: firstName,
        last_name: lastName,
        email: email || null,
        phone: phone || null,
        job_title: jobTitle || null,
        company_id: companyId && companyId.trim() !== "" ? companyId : null,
        status: status || null,
        source: source || null,
        notes: notes || null,
        assigned_to: "00000000-0000-0000-0000-000000000000", // Required UUID
        created_by: "00000000-0000-0000-0000-000000000000" // Required UUID
      }
      
      // Submit to API
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      })
      
      if (!response.ok) {
        // Get detailed error message from response
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error(errorData.details || errorData.error || 'Failed to create contact')
      }
      
      toast({
        title: "Success",
        description: "Contact created successfully!",
      })
      
      // Redirect back to contacts page with a full refresh to ensure data is reloaded
      router.push('/contacts')
      
      // Force a complete refresh of the page to ensure new data is fetched
      setTimeout(() => {
        window.location.href = '/contacts'
      }, 100)
    } catch (error) {
      console.error('Error creating contact:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create contact. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/contacts">Contacts</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Add Contact</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <Card>
        <CardHeader>
          <CardTitle>Add New Contact</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name *</Label>
                <Input 
                  id="first_name" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required 
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name *</Label>
                <Input 
                  id="last_name" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="job_title">Job Title</Label>
                <Input 
                  id="job_title" 
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="company_id">Company</Label>
                <select
                  id="company_id"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                >
                  <option value="">No Company</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">None</option>
                  {statusOptions.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="source">Source</Label>
                <select
                  id="source"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                >
                  <option value="">None</option>
                  {sourceOptions.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this contact..."
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" type="button" asChild>
                <Link href="/contacts">Cancel</Link>
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create Contact"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
