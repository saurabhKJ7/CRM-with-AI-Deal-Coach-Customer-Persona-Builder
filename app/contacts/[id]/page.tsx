"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// Removed tabs import as we're only showing the persona builder
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Edit, 
  Trash2, 
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  FileText
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { CustomerPersonaBuilder } from "@/components/contacts/CustomerPersonaBuilder"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"

export default function ContactDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const contactId = params.id as string
  const [contact, setContact] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const { toast } = useToast()

  const fetchContactWithRelations = async () => {
    try {
      const response = await fetch(`/api/contacts/${contactId}/relations`)
      if (!response.ok) throw new Error('Contact not found')
      const data = await response.json()
      setContact(data.data)
      setLoading(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch contact details",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (contactId) {
      fetchContactWithRelations()
    }
  }, [contactId])

  const handleDeleteContact = async () => {
    if (!confirm("Are you sure you want to delete this contact? This action cannot be undone.")) return

    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Contact deleted successfully",
        })
        // Redirect to contacts list
        router.push("/contacts")
      } else {
        throw new Error("Failed to delete contact")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      })
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      lead: 'bg-gray-100 text-gray-800',
      qualified: 'bg-blue-100 text-blue-800',
      proposal: 'bg-yellow-100 text-yellow-800',
      negotiation: 'bg-purple-100 text-purple-800',
      won: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800',
    }
    return colors[stage] || 'bg-gray-100 text-gray-800'
  }

  // Removed getActivityTypeIcon function as we no longer need it

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex">
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">CRM</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/contacts">Contacts</BreadcrumbLink>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            <div className="flex items-center justify-center h-64">
              <div className="text-lg">Loading contact details...</div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    )
  }

  if (!contact) {
    return (
      <SidebarProvider>
        <div className="flex">
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">CRM</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/contacts">Contacts</BreadcrumbLink>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <div className="text-2xl font-bold">Contact Not Found</div>
              <p className="text-gray-600">The contact you're looking for doesn't exist or has been deleted.</p>
              <Link href="/contacts">
                <Button>Return to Contacts</Button>
              </Link>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    )
  }

  const relatedDeals = contact.deals || [];
  const relatedActivities = contact.activities || [];
  const relatedNotes = contact.notes || [];

  return (
    <SidebarProvider>
      <div className="flex">
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">CRM</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/contacts">Contacts</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/contacts/${contactId}`}>{contact.first_name} {contact.last_name}</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="flex flex-1 flex-col gap-6 p-6">
            <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
            <AvatarFallback className="text-lg bg-blue-100 text-blue-600">
              {getInitials(contact.first_name, contact.last_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {contact.first_name} {contact.last_name}
            </h1>
            <p className="text-gray-600">{contact.job_title} at {contact.companies?.name || 'Unknown Company'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Contact</DialogTitle>
              </DialogHeader>
              {/* ContactForm component would go here */}
              <div className="p-4 text-center text-gray-500">
                Contact edit form placeholder
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={handleDeleteContact} className="text-red-600 hover:bg-red-50">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Persona Builder */}
      <div className="grid grid-cols-1 gap-6">
        {/* Only show Persona Builder */}
        <div className="w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Customer Persona</h3>
          </div>
          <CustomerPersonaBuilder contact={contact} />
        </div>
      </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}