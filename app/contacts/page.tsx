"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Search, Plus, Edit, Trash2, Phone, Mail, Building, User, Users, Filter, Download, Upload, Info } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import type { Contact } from "@/lib/types"

type ContactWithCompany = Contact & {
  companies?: {
    id: string;
    name: string;
  } | null;
}
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { AppSidebar } from "@/components/app-sidebar"

export default function ContactsPage() {
  const [contacts, setContacts] = React.useState<ContactWithCompany[]>([])
  const [companies, setCompanies] = React.useState<{id: string, name: string}[]>([])
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedContact, setSelectedContact] = React.useState<ContactWithCompany | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [filterStatus, setFilterStatus] = React.useState<string | null>(null)
  const [filterSource, setFilterSource] = React.useState<string | null>(null)
  const [filterCompany, setFilterCompany] = React.useState<string | null>(null)
  const { toast } = useToast()

  // Status and source options
  const statusOptions = ["Lead", "Prospect", "Customer", "Partner", "Inactive"]
  const sourceOptions = ["Website", "Referral", "Cold Outreach", "Social Media", "Events", "Advertisement"]

  // Fetch contacts
  const fetchContacts = async () => {
    try {
      setLoading(true)
      console.log('Fetching contacts...')
      const response = await fetch("/api/contacts")
      const data = await response.json()
      console.log('Contacts fetched:', data)
      
      if (data.data && Array.isArray(data.data)) {
        setContacts(data.data)
      } else {
        console.error('Invalid contacts data format:', data)
        setContacts([])
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
      toast({
        title: "Error",
        description: "Failed to fetch contacts",
        variant: "destructive",
      })
      setContacts([])
    } finally {
      setLoading(false)
    }
  }
  // Fetch companies
  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/companies")
      if (response.ok) {
        const data = await response.json()
        setCompanies(data.data?.map((company: any) => ({
          id: company.id,
          name: company.name
        })) || [])
      }
    } catch (error) {
      console.error("Failed to fetch companies:", error)
    }
  }

  React.useEffect(() => {
    fetchContacts()
    fetchCompanies()
  }, [])

  // Get company name from joined company data
  const getCompanyName = (contact: ContactWithCompany) => {
    // If contact has joined company data, use it
    if (contact.companies?.name) {
      return contact.companies.name
    }
    
    // Fallback to company_name field if available
    if (contact.company_name) {
      return contact.company_name
    }
    
    // Last resort: try to resolve company_id to company name from companies state
    if (contact.company_id) {
      const company = companies.find(c => c.id === contact.company_id)
      return company?.name || 'Unknown Company'
    }
    
    return 'Not assigned'
  }

  // Filter contacts based on search and filters
  const filteredContacts = React.useMemo(() => {
    return contacts.filter((contact) => {
      const matchesSearch = 
        contact.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCompanyName(contact).toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = !filterStatus || contact.status === filterStatus
      const matchesSource = !filterSource || contact.source === filterSource
      const matchesCompany = !filterCompany || getCompanyName(contact) === filterCompany
      
      return matchesSearch && matchesStatus && matchesSource && matchesCompany
    })
  }, [contacts, searchTerm, filterStatus, filterSource, filterCompany])

  // Get unique values for filter dropdowns
  const getUniqueStatuses = () => {
    const statuses = contacts.map(c => c.status).filter((status): status is string => Boolean(status))
    return [...new Set(statuses)]
  }

  const getUniqueSources = () => {
    const sources = contacts.map(c => c.source).filter((source): source is string => Boolean(source))
    return [...new Set(sources)]
  }

  const getUniqueCompanies = () => {
    const companyNames = contacts.map(c => getCompanyName(c)).filter(name => name !== 'Not assigned')
    return [...new Set(companyNames)]
  }

  const handleAddContact = async (formData: FormData) => {
    try {
      const companyId = formData.get("company_id") as string
      const contactData = {
        first_name: formData.get("first_name") as string,
        last_name: formData.get("last_name") as string,
        email: formData.get("email") || null,
        phone: formData.get("phone") || null,
        job_title: formData.get("job_title") || null,
        company_id: companyId && companyId.trim() !== "" ? companyId : null,
        status: formData.get("status") || null,
        source: formData.get("source") || null,
      }

      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Contact added successfully",
        })
        setIsAddDialogOpen(false)
        fetchContacts()
      } else {
        throw new Error("Failed to add contact")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add contact",
        variant: "destructive",
      })
    }
  }

  const handleEditContact = async (formData: FormData) => {
    if (!selectedContact) return

    try {
      const companyId = formData.get("company_id") as string
      const contactData = {
        first_name: formData.get("first_name") as string,
        last_name: formData.get("last_name") as string,
        email: formData.get("email") || null,
        phone: formData.get("phone") || null,
        job_title: formData.get("job_title") || null,
        company_id: companyId && companyId.trim() !== "" ? companyId : null,
        status: formData.get("status") || null,
        source: formData.get("source") || null,
      }

      const response = await fetch(`/api/contacts/${selectedContact.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Contact updated successfully",
        })
        setIsEditDialogOpen(false)
        setSelectedContact(null)
        fetchContacts()
      } else {
        throw new Error("Failed to update contact")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update contact",
        variant: "destructive",
      })
    }
  }

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return

    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Contact deleted successfully",
        })
        fetchContacts()
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

  const ContactForm = ({ contact, onSubmit, companies }: { contact?: ContactWithCompany; onSubmit: (formData: FormData) => void; companies: {id: string, name: string}[] }) => {
    // Pass statusOptions and sourceOptions as props to the component
    const statusOptions = ["Lead", "Prospect", "Customer", "Partner", "Inactive"]
    const sourceOptions = ["Website", "Referral", "Cold Outreach", "Social Media", "Events", "Advertisement"]
    const [selectedStatus, setSelectedStatus] = React.useState<string>(contact?.status || "none")
    const [selectedSource, setSelectedSource] = React.useState<string>(contact?.source || "none")

    const handleSubmit = (formData: FormData) => {
      // Add the selected values to form data, converting "none" to null
      formData.set("status", selectedStatus === "none" ? "" : selectedStatus)
      formData.set("source", selectedSource === "none" ? "" : selectedSource)
      onSubmit(formData)
    }

    return (
      <form action={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="first_name">First Name *</Label>
            <Input id="first_name" name="first_name" defaultValue={contact?.first_name} required />
          </div>
          <div>
            <Label htmlFor="last_name">Last Name *</Label>
            <Input id="last_name" name="last_name" defaultValue={contact?.last_name} required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={contact?.email || ""} />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" defaultValue={contact?.phone || ""} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="job_title">Job Title</Label>
            <Input id="job_title" name="job_title" defaultValue={contact?.job_title || ""} />
          </div>
          <div>
            <Label htmlFor="company_name">Company</Label>
            <Select name="company_id" defaultValue={contact?.company_id || ""} onValueChange={(value) => {
              const formElement = document.querySelector('form');
              if (formElement) {
                const formData = new FormData(formElement);
                formData.set('company_id', value);
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select company">
                  {contact?.companies?.name || companies.find(c => c.id === contact?.company_id)?.name || "No Company"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No Company</SelectItem>
                {companies.map(company => {
                  return (
                    <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Status</Label>
            <Select name="status" defaultValue="none" onValueChange={(value) => {
                setSelectedStatus(value);
              }}>
              <SelectTrigger>
                <SelectValue placeholder="Select status">
                  {selectedStatus === "none" ? "None" : selectedStatus}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {statusOptions.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Source</Label>
            <Select name="source" defaultValue="none" onValueChange={(value) => {
                setSelectedSource(value);
              }}>
              <SelectTrigger>
                <SelectValue placeholder="Select source">
                  {selectedSource === "none" ? "None" : selectedSource}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {sourceOptions.map(source => (
                  <SelectItem key={source} value={source}>{source}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
          {contact ? "Update Contact" : "Add Contact"}
        </Button>
      </form>
    )
  }

  if (loading) {
    return (
      <SidebarProvider>
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
                  <BreadcrumbPage>Contacts</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading contacts...</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
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
                <BreadcrumbPage>Contacts</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
                <p className="text-gray-600 mt-1">Manage your customer relationships and contact information.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                  <Link href="/contacts/add">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Link>
                </Button>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Contact</DialogTitle>
                    </DialogHeader>
                    <ContactForm onSubmit={handleAddContact} companies={companies} />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-blue-50 border transition-all hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Contacts</p>
                      <p className="text-2xl font-bold mt-1">{filteredContacts.length}</p>
                    </div>
                    <div>
                      <Users className="h-8 w-8 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-green-50 border transition-all hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Leads</p>
                      <p className="text-2xl font-bold mt-1">{filteredContacts.filter((c) => c.status === "Lead").length}</p>
                    </div>
                    <div>
                      <User className="h-8 w-8 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-purple-50 border transition-all hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Referrals</p>
                      <p className="text-2xl font-bold mt-1">{filteredContacts.filter(c => c.source === "Referral").length}</p>
                    </div>
                    <div>
                      <Mail className="h-8 w-8 text-purple-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-orange-50 border transition-all hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Companies</p>
                      <p className="text-2xl font-bold mt-1">{new Set(filteredContacts.map((c) => getCompanyName(c)).filter(name => name !== 'Not assigned')).size}</p>
                    </div>
                    <div>
                      <Building className="h-8 w-8 text-orange-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search contacts by name, email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="w-[150px]">
                    <Select value={filterStatus || "all"} onValueChange={(value) => setFilterStatus(value === "all" ? null : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {getUniqueStatuses().map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-[150px]">
                    <Select value={filterSource || "all"} onValueChange={(value) => setFilterSource(value === "all" ? null : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        {getUniqueSources().map(source => (
                          <SelectItem key={source} value={source}>{source}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-[200px]">
                    <Select value={filterCompany || "all"} onValueChange={(value) => setFilterCompany(value === "all" ? null : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Company" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Companies</SelectItem>
                        {getUniqueCompanies().map(companyName => (
                          <SelectItem key={companyName} value={companyName}>{companyName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contacts Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">All Contacts ({filteredContacts.length})</CardTitle>
                <div className="mt-2 flex items-center gap-2 bg-blue-50 p-3 rounded-md border border-blue-100">
                  <Info className="h-5 w-5 text-blue-500" />
                  <p className="text-sm text-blue-700">Click on any contact name to view details and create a customer persona.</p>
                </div>
              </CardHeader>
              <CardContent>
                {filteredContacts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No contacts found matching your criteria.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Contact</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Contact Info</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredContacts.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell>
                            <Link href={`/contacts/${contact.id}`}>
                              <div className="flex items-center gap-3 hover:underline">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                  <User className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{contact.first_name} {contact.last_name}</div>
                                  <div className="text-sm text-gray-500">{contact.job_title}</div>
                                </div>
                              </div>
                            </Link>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-900">{getCompanyName(contact)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-3 w-3 text-gray-400" />
                                <span className="text-gray-600">{contact.email || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-3 w-3 text-gray-400" />
                                <span className="text-gray-600">{contact.phone || 'N/A'}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {contact.status && (
                              <Badge variant="secondary" className="text-xs">
                                {contact.status}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {contact.source || 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Dialog open={isEditDialogOpen && selectedContact?.id === contact.id} onOpenChange={(open) => {
                                setIsEditDialogOpen(open);
                                if (open) setSelectedContact(contact);
                              }}>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Edit Contact</DialogTitle>
                                  </DialogHeader>
                                  <ContactForm contact={selectedContact || undefined} onSubmit={handleEditContact} companies={companies} />
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteContact(contact.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}