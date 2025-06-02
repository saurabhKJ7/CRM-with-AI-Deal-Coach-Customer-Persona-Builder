"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  Edit, 
  Trash2, 
  PlusCircle, 
  FileText,
  Calendar,
  DollarSign,
  Clock,
  ArrowUpRight,
  CheckCircle,
  XCircle,
  Tag,
  AlertCircle
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

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone className="h-4 w-4 text-blue-500" />
      case 'email':
        return <Mail className="h-4 w-4 text-purple-500" />
      case 'meeting':
        return <Calendar className="h-4 w-4 text-green-500" />
      case 'task':
        return <FileText className="h-4 w-4 text-orange-500" />
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />
    }
  }

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
            <p className="text-gray-600">{contact.job_title} at {contact.company?.name || 'Unknown Company'}</p>
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

      {/* Contact Details and Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </div>
              <div className="pl-6 font-medium">{contact.email || 'No email provided'}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4" />
                <span>Phone</span>
              </div>
              <div className="pl-6 font-medium">{contact.phone || 'No phone provided'}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Building className="h-4 w-4" />
                <span>Company</span>
              </div>
              <div className="pl-6 font-medium">{contact.company?.name || 'No company provided'}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>Address</span>
              </div>
              <div className="pl-6 font-medium">
                {contact.address || 'No address provided'}
                {contact.city && contact.state && (
                  <div>{contact.city}, {contact.state} {contact.postal_code}</div>
                )}
                {contact.country && <div>{contact.country}</div>}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <User className="h-4 w-4" />
                <span>Owner</span>
              </div>
              <div className="pl-6 font-medium">{contact.assigned_to || 'Unassigned'}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Tag className="h-4 w-4" />
                <span>Tags</span>
              </div>
              <div className="pl-6">
                {contact.tags && contact.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {contact.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500">No tags</span>
                )}
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t mt-4">
              <div className="text-xs text-gray-500">Created on {format(new Date(contact.created_at), 'PPP')}</div>
              <div className="text-xs text-gray-500">Last updated {format(new Date(contact.updated_at), 'PPP')}</div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Related Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="deals">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="deals">
                Deals ({relatedDeals.length})
              </TabsTrigger>
              <TabsTrigger value="activities">
                Activities ({relatedActivities.length})
              </TabsTrigger>
              <TabsTrigger value="notes">
                Notes ({relatedNotes.length})
              </TabsTrigger>
              <TabsTrigger value="persona">
                Persona
              </TabsTrigger>
            </TabsList>

            <TabsContent value="deals" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Related Deals</h3>
                <Link href={`/deals/new?contactId=${contactId}`}>
                  <Button size="sm">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Deal
                  </Button>
                </Link>
              </div>

              {relatedDeals.length > 0 ? (
                <div className="space-y-4">
                  {relatedDeals.map((deal: any) => (
                    <Card key={deal.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <Link href={`/deals/${deal.id}`} className="font-medium text-blue-600 hover:underline">
                                {deal.title}
                              </Link>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">{deal.description}</div>
                          </div>
                          <Badge className={getStageColor(deal.stage)}>
                            {deal.stage.charAt(0).toUpperCase() + deal.stage.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="mt-4 flex justify-between">
                          <div className="text-sm">
                            <span className="font-medium">${deal.amount?.toLocaleString() || 0}</span>
                            <span className="text-gray-500 ml-2">({deal.probability}% probability)</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {deal.expected_close_date ? format(new Date(deal.expected_close_date), 'MMM d, yyyy') : 'No close date'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center text-gray-500">
                    <div className="mb-2">No deals associated with this contact yet.</div>
                    <Link href={`/deals/new?contactId=${contactId}`}>
                      <Button size="sm" variant="outline">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create a deal
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="activities" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Related Activities</h3>
                <Link href={`/activities/new?contactId=${contactId}`}>
                  <Button size="sm">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Activity
                  </Button>
                </Link>
              </div>

              {relatedActivities.length > 0 ? (
                <div className="space-y-4">
                  {relatedActivities.map((activity: any) => (
                    <Card key={activity.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-3">
                            <div className="mt-1">{getActivityTypeIcon(activity.type)}</div>
                            <div>
                              <div className="font-medium">
                                {activity.subject}
                                {activity.completed && (
                                  <Badge variant="outline" className="ml-2 text-green-600 bg-green-50">
                                    Completed
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">{activity.description}</div>
                            </div>
                          </div>
                          <Badge variant="outline">
                            {activity.priority.charAt(0).toUpperCase() + activity.priority.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="mt-4 flex justify-between items-center">
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-1" />
                            {activity.due_date ? format(new Date(activity.due_date), 'MMM d, yyyy') : 'No due date'}
                          </div>
                          <Link href={`/activities/${activity.id}`}>
                            <Button size="sm" variant="ghost" className="h-8">
                              <ArrowUpRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center text-gray-500">
                    <div className="mb-2">No activities associated with this contact yet.</div>
                    <Link href={`/activities/new?contactId=${contactId}`}>
                      <Button size="sm" variant="outline">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Schedule an activity
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Notes</h3>
                <Button size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </div>

              {relatedNotes.length > 0 ? (
                <div className="space-y-4">
                  {relatedNotes.map((note: any) => (
                    <Card key={note.id}>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm text-gray-500">
                                {format(new Date(note.created_at), 'PPp')}
                              </p>
                              <p className="text-sm">{note.content}</p>
                            </div>
                            <div className="text-sm text-gray-500">
                              {note.created_by}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No notes yet
                </div>
              )}
            </TabsContent>

            <TabsContent value="persona" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Customer Persona</h3>
              </div>
              <CustomerPersonaBuilder />
            </TabsContent>
          </Tabs>
        </div>
      </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}