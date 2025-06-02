"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Plus, DollarSign, Calendar, User, Building, Percent, TrendingUp, Target, MessageSquare, MoveHorizontal } from "lucide-react"
import type { Deal, DealWithRelations, Contact, Company, PaginatedResponse, ApiResponse } from "@/lib/types"
import DealForm from "@/components/deals/DealForm"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import ConversationForm from "@/components/conversations/ConversationForm"
import ConversationsList from "@/components/conversations/ConversationsList"
import DealCoachAI from "@/components/conversations/DealCoachAI"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { AppSidebar } from "@/components/app-sidebar"

const stages: Array<{
  id: Deal['stage']
  title: string
  color: string
}> = [
  { id: "lead", title: "Lead", color: "bg-gray-100 border-gray-300" },
  { id: "qualified", title: "Qualified", color: "bg-blue-100 border-blue-300" },
  { id: "proposal", title: "Proposal", color: "bg-yellow-100 border-yellow-300" },
  { id: "negotiation", title: "Negotiation", color: "bg-orange-100 border-orange-300" },
  { id: "won", title: "Won", color: "bg-green-100 border-green-300" },
  { id: "lost", title: "Lost", color: "bg-red-100 border-red-300" },
]

export default function DealsPage() {
  const [deals, setDeals] = React.useState<DealWithRelations[]>([])
  const [contacts, setContacts] = React.useState<Contact[]>([])
  const [companies, setCompanies] = React.useState<Company[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isConversationDialogOpen, setIsConversationDialogOpen] = React.useState(false)
  const [isConversationsListOpen, setIsConversationsListOpen] = React.useState(false)
  const [isChatbotOpen, setIsChatbotOpen] = React.useState(false)
  const [selectedDeal, setSelectedDeal] = React.useState<DealWithRelations | null>(null)
  const [draggedDeal, setDraggedDeal] = React.useState<DealWithRelations | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const { toast } = useToast()

  // Use state to track if we're on the client side
  const [isClient, setIsClient] = React.useState(false)
  
  // This effect runs only on the client
  React.useEffect(() => {
    setIsClient(true)
  }, [])

  // Fetch deals and contacts
  const fetchDeals = async () => {
    try {
      setError(null);
      // Use a cache-busting query parameter to ensure fresh data
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/deals?_t=${timestamp}`);
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json() as PaginatedResponse<DealWithRelations>;
      console.log("Fetched deals:", data.data);
      
      // Debug the first deal to see its structure
      if (data.data && data.data.length > 0) {
        console.log("First deal structure:", JSON.stringify(data.data[0], null, 2));
        console.log("Deal title field:", data.data[0].title);
        console.log("Deal name field:", (data.data[0] as any).name);
      }
      
      // Ensure data.data is always an array
      const dealsArray = Array.isArray(data.data) ? data.data : [];
      
      // Set the deals directly without merging to ensure a complete refresh
      setDeals(dealsArray);
      
      return dealsArray;
    } catch (error) {
      console.error("Error fetching deals:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch deals");
      toast({
        title: "Error",
        description: "Failed to fetch deals",
        variant: "destructive",
      });
      return [];
    }
  }

  const fetchContacts = async () => {
    try {
      const response = await fetch("/api/contacts");
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json() as PaginatedResponse<Contact>;
      
      // Ensure data.data is always an array
      const contactsArray = Array.isArray(data.data) ? data.data : [];
      
      setContacts(contactsArray);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch contacts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  // Fetch companies data
  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/companies");
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json() as PaginatedResponse<Company>;
      
      // Ensure data.data is always an array
      const companiesArray = Array.isArray(data.data) ? data.data : [];
      
      setCompanies(companiesArray);
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast({
        title: "Error",
        description: "Failed to fetch companies",
        variant: "destructive",
      });
    }
  }

  // Use separate useEffect hooks for client-side initialization
  // This helps prevent hydration mismatches
  React.useEffect(() => {
    // Fetch data only on the client side
    fetchDeals()
    fetchContacts()
    fetchCompanies()
  }, [])

  const handleAddDeal = async (formData: FormData) => {
    try {
      const response = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData)),
      })

      const data = await response.json() as ApiResponse<Deal>

      if (response.ok) {
        toast({
          title: "Success",
          description: "Deal added successfully",
        })
        setIsAddDialogOpen(false)
        fetchDeals()
      } else {
        throw new Error(data.error || "Failed to add deal")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add deal",
        variant: "destructive",
      })
    }
  }

  const handleEditDeal = async (formData: FormData) => {
    if (!selectedDeal) return

    try {
      const response = await fetch(`/api/deals/${selectedDeal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData)),
      })

      const data = await response.json() as ApiResponse<Deal>

      if (response.ok) {
        toast({
          title: "Success",
          description: "Deal updated successfully",
        })
        setIsEditDialogOpen(false)
        setSelectedDeal(null)
        fetchDeals()
      } else {
        throw new Error(data.error || "Failed to update deal")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update deal",
        variant: "destructive",
      })
    }
  }

  const handleDragStart = (deal: DealWithRelations) => {
    setDraggedDeal(deal)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, newStage: Deal["stage"]) => {
    e.preventDefault()
    console.log("Drop event - Dragged deal:", draggedDeal, "New stage:", newStage);
    
    if (draggedDeal && draggedDeal.stage !== newStage) {
      // Store a copy of the original dragged deal for potential rollback
      const originalDeal = {...draggedDeal};
      console.log("Original deal before update:", originalDeal);
      
      // Create updated deal with new stage
      const updatedDeal = { 
        ...draggedDeal, 
        stage: newStage 
      };
      
      try {
        // Optimistically update the UI
        setDeals(prevDeals => 
          prevDeals.map(deal => 
            deal.id === draggedDeal.id ? updatedDeal : deal
          )
        );
        
        // Send update to server
        const response = await fetch(`/api/deals/${draggedDeal.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage: newStage }),
        });
        
        const data = await response.json() as ApiResponse<Deal>;
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to update deal stage");
        }
        
        // Refresh deals to ensure data consistency
        fetchDeals();
        
        toast({
          title: "Deal Updated",
          description: `Deal moved to ${stages.find(s => s.id === newStage)?.title || newStage}`,
        });
      } catch (error) {
        console.error("Error updating deal stage:", error);
        
        // Rollback the optimistic update
        setDeals(prevDeals => 
          prevDeals.map(deal => 
            deal.id === draggedDeal.id ? originalDeal : deal
          )
        );
        
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to update deal stage",
          variant: "destructive",
        });
      }
    }
    
    setDraggedDeal(null);
  }

  const handleDeleteDeal = async (dealId: string) => {
    if (!dealId) return

    try {
      const response = await fetch(`/api/deals/${dealId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Deal deleted successfully",
        })
        fetchDeals()
      } else {
        const data = await response.json() as ApiResponse<null>
        throw new Error(data.error || "Failed to delete deal")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete deal",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (deal: DealWithRelations) => {
    setSelectedDeal(deal)
    setIsEditDialogOpen(true)
  }

  const openConversationDialog = (deal: DealWithRelations) => {
    setSelectedDeal(deal)
    setIsConversationDialogOpen(true)
  }

  const openConversationsList = (deal: DealWithRelations) => {
    setSelectedDeal(deal)
    setIsConversationsListOpen(true)
  }

  const openChatbot = (deal: DealWithRelations) => {
    setSelectedDeal(deal)
    setIsChatbotOpen(true)
  }

  // Render loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-3xl">Loading Deals...</div>
          <div className="text-sm text-gray-500">Please wait while we fetch your pipeline data</div>
        </div>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-3xl text-red-500">Error Loading Deals</div>
          <div className="mb-6 text-gray-700">{error}</div>
          <Button 
            onClick={() => {
              setLoading(true)
              fetchDeals().finally(() => setLoading(false))
            }}
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // Render loading state when refreshing data
  if (loading) {
    return (
      <div>
        <AppSidebar />
        <SidebarInset>
          <div className="flex h-screen items-center justify-center">
            <div className="text-center">
              <div className="mb-4 text-3xl">Refreshing Deals...</div>
              <div className="text-sm text-gray-500">Please wait while we refresh the pipeline data</div>
            </div>
          </div>
        </SidebarInset>
      </div>
    )
  }

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
                <BreadcrumbLink href="/deals">Deals</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Deals Pipeline</h1>
                <p className="text-gray-600 mt-1">Track and manage your sales opportunities through the pipeline.</p>
              </div>
              <div className="flex gap-2">
                <Button 
                    variant="outline"
                    onClick={() => {
                      setLoading(true);
                      fetchDeals().then(() => {
                        toast({
                          title: "Refreshed",
                          description: "Deal pipeline has been refreshed"
                        });
                        setLoading(false);
                      });
                    }}
                    className="min-w-fit"
                  >
                    Refresh Pipeline
                  </Button>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Deal
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Add New Deal</DialogTitle>
                    </DialogHeader>
                    <DealForm 
                      contacts={contacts}
                      companies={companies}
                      onSubmit={handleAddDeal}
                      onCancel={() => setIsAddDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-blue-50 border transition-all hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Pipeline</p>
                      <p className="text-2xl font-bold mt-1">
                        {deals.filter(d => !['won', 'lost'].includes(d.stage)).reduce((sum, d) => sum + (d.amount || 0), 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div>
                      <DollarSign className="h-8 w-8 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-green-50 border transition-all hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Won Deals</p>
                      <p className="text-2xl font-bold mt-1">
                        {deals.filter(d => d.stage === 'won').reduce((sum, d) => sum + (d.amount || 0), 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div>
                      <TrendingUp className="h-8 w-8 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-purple-50 border transition-all hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
                      <p className="text-2xl font-bold mt-1">
                        {deals.length > 0 ? Math.round((deals.filter(d => d.stage === 'won').length / deals.length) * 100) : 0}%
                      </p>
                    </div>
                    <div>
                      <Percent className="h-8 w-8 text-purple-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-orange-50 border transition-all hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Avg Deal Size</p>
                      <p className="text-2xl font-bold mt-1">
                        {deals.filter(d => d.amount && d.amount > 0).length > 0 
                          ? (deals.filter(d => d.amount && d.amount > 0).reduce((sum, d) => sum + (d.amount || 0), 0) / deals.filter(d => d.amount && d.amount > 0).length).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
                          : '$0'}
                      </p>
                    </div>
                    <div>
                      <Target className="h-8 w-8 text-orange-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Kanban Instructions */}
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md mb-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <MoveHorizontal className="h-4 w-4 text-blue-700" />
              </div>
              <div>
                <h3 className="font-medium text-blue-900">Kanban Board</h3>
                <p className="text-sm text-blue-700">Drag and drop deals between columns to update their status.</p>
              </div>
            </div>

            {/* Pipeline */}
            {isClient ? (
              <div className="flex overflow-x-auto pb-4 gap-4 w-full min-h-[calc(100vh-16rem)]">
                {stages.map((stage) => (
                  <div 
                    key={stage.id}
                    className="flex-shrink-0 flex flex-col w-[280px] h-full min-h-[300px]"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, stage.id)}
                  >
                    <div className={`mb-4 rounded-md border px-3 py-2.5 w-full shadow-sm ${                      
                      stage.id === 'lead' ? 'bg-blue-100' : 
                      stage.id === 'qualified' ? 'bg-green-100' : 
                      stage.id === 'proposal' ? 'bg-yellow-100' : 
                      stage.id === 'negotiation' ? 'bg-orange-100' : 
                      stage.id === 'won' ? 'bg-emerald-100' : 
                      stage.id === 'lost' ? 'bg-red-100' : 'bg-white'
                    }`}>
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 text-base">{stage.title}</h3>
                        <Badge variant="outline" className="bg-white">
                          {deals.filter(deal => deal.stage === stage.id).length}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 w-full overflow-y-auto px-0.5">
                      {deals
                        .filter(deal => deal.stage === stage.id)
                        .map(deal => (
                          <Card 
                            key={deal.id}
                            className="cursor-pointer transition-all hover:shadow-md w-full mb-3 overflow-hidden relative z-0 border"
                            draggable
                            onDragStart={() => handleDragStart(deal)}
                          >
                            <CardHeader className="px-3 py-2.5 pb-1.5">
                              <CardTitle className="flex items-center justify-between text-sm">
                                <span className="truncate max-w-[60%] font-medium">{deal.name || deal.title || 'Untitled Deal'}</span>
                                <Badge variant="outline" className="ml-2 shrink-0 text-xs bg-white">
                                  ${deal.amount ? deal.amount.toLocaleString() : '0'}
                                </Badge>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 pt-1">
                              <div className="flex flex-col gap-1 text-xs">
                                <div className="flex items-center text-gray-500">
                                  <Calendar className="mr-1 h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">
                                    {deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : 'No date'}
                                  </span>
                                </div>
                                {deal.contact && (
                                  <div className="flex items-center text-gray-500">
                                    <User className="mr-1 h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">
                                      {`${deal.contact.first_name || ''} ${deal.contact.last_name || ''}`}
                                    </span>
                                  </div>
                                )}
                                {/* Fallback for when data comes as 'contacts' instead of 'contact' */}
                                {!deal.contact && (deal as any).contacts && (
                                  <div className="flex items-center text-gray-500">
                                    <User className="mr-1 h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">
                                      {`${(deal as any).contacts.first_name || ''} ${(deal as any).contacts.last_name || ''}`}
                                    </span>
                                  </div>
                                )}
                                {deal.company && (
                                  <div className="flex items-center text-gray-500">
                                    <Building className="mr-1 h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">
                                      {deal.company.name}
                                    </span>
                                  </div>
                                )}
                                {/* Fallback for when data comes as 'companies' instead of 'company' */}
                                {!deal.company && (deal as any).companies && (
                                  <div className="flex items-center text-gray-500">
                                    <Building className="mr-1 h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">
                                      {(deal as any).companies.name}
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-center text-gray-500">
                                  <Percent className="mr-1 h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{deal.probability}% probability</span>
                                </div>
                              </div>
                              <div className="mt-2 flex gap-1">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1 h-7 px-1 py-0"
                                  onClick={() => openEditDialog(deal)}
                                >
                                  <TrendingUp className="mr-1 h-3 w-3" />
                                  <span className="text-xs">Edit</span>
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1 h-7 px-1 py-0"
                                  onClick={() => openConversationDialog(deal)}
                                >
                                  <MessageSquare className="mr-1 h-3 w-3" />
                                  <span className="text-xs">Log</span>
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1 h-7 px-1 py-0"
                                  onClick={(e) => {
                                    e.preventDefault(); // Prevent default behavior
                                    e.stopPropagation(); // Prevent event bubbling
                                    openChatbot(deal);
                                  }}
                                >
                                  <Target className="mr-1 h-3 w-3" />
                                  <span className="text-xs">AI</span>
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-center p-8">
                <div className="text-center">
                  <div className="mb-4 text-xl">Loading pipeline...</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
      </div>

      {/* Edit Deal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Deal</DialogTitle>
          </DialogHeader>
          {selectedDeal && (
            <DealForm 
              deal={selectedDeal}
              contacts={contacts}
              companies={companies}
              onSubmit={handleEditDeal}
              onCancel={() => setIsEditDialogOpen(false)}
              onDelete={() => {
                handleDeleteDeal(selectedDeal.id)
                setIsEditDialogOpen(false)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add Conversation Dialog */}
      <Dialog open={isConversationDialogOpen} onOpenChange={setIsConversationDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Log Conversation</DialogTitle>
          </DialogHeader>
          {selectedDeal && (
            <ConversationForm 
              dealId={selectedDeal.id}
              onSuccess={() => {
                setIsConversationDialogOpen(false)
                fetchDeals()
              }}
              onCancel={() => setIsConversationDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Conversations List Dialog */}
      <Dialog open={isConversationsListOpen} onOpenChange={setIsConversationsListOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Conversations History</DialogTitle>
          </DialogHeader>
          {selectedDeal && (
            <ConversationsList 
              dealId={selectedDeal.id}
              onClose={() => setIsConversationsListOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Chatbot Dialog */}
      <Dialog open={isChatbotOpen} onOpenChange={setIsChatbotOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI Deal Assistant</DialogTitle>
          </DialogHeader>
          {selectedDeal && (
            <DealCoachAI 
              deals={[selectedDeal]}
              onConversationComplete={() => {
                setIsChatbotOpen(false); // Close the dialog after coaching
                fetchDeals();
                toast({
                  title: "AI Coaching Complete",
                  description: "Your coaching session has been saved"
                });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
