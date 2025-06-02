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
import { Search, Plus, Edit, Trash2, Building, User, Filter, DollarSign } from "lucide-react"

type Deal = {
  id: string;
  title: string;
  description: string | null;
  amount: number | null;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  probability: number;
  expected_close_date: string | null;
  contact_id: string | null;
  company_id: string | null;
  assigned_to: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export default function DealList() {
  const [deals, setDeals] = React.useState<Deal[]>([])
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedDeal, setSelectedDeal] = React.useState<Deal | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const { toast } = useToast()

  // Fetch deals
  const fetchDeals = async (search?: string) => {
    try {
      const url = search ? `/api/deals?search=${encodeURIComponent(search)}` : "/api/deals"
      const response = await fetch(url)
      const data = await response.json()
      setDeals(data.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch deals",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchDeals()
  }, [])

  React.useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm) {
        fetchDeals(searchTerm)
      } else {
        fetchDeals()
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  const handleDeleteDeal = async (dealId: string) => {
    if (!confirm("Are you sure you want to delete this deal?")) return

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
        throw new Error("Failed to delete deal")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete deal",
        variant: "destructive",
      })
    }
  }

  const getStageColor = (stage: Deal['stage']) => {
    const colors = {
      lead: 'bg-gray-100 text-gray-800',
      qualified: 'bg-blue-100 text-blue-800',
      proposal: 'bg-yellow-100 text-yellow-800',
      negotiation: 'bg-purple-100 text-purple-800',
      won: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800',
    }
    return colors[stage] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading deals...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deals</h1>
          <p className="text-gray-600 mt-1">Manage your sales pipeline and track deals.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Deal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Deal</DialogTitle>
              </DialogHeader>
              {/* TODO: Add DealForm component */}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{deals.length}</div>
            <div className="text-sm text-gray-600">Total Deals</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {deals.filter((d) => d.stage === 'won').length}
            </div>
            <div className="text-sm text-gray-600">Won Deals</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              ${deals.reduce((sum, d) => sum + (d.amount || 0), 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Pipeline Value</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {deals.filter((d) => d.stage === 'negotiation').length}
            </div>
            <div className="text-sm text-gray-600">In Negotiation</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search deals by title, company, or amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Deals Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">All Deals ({deals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deal</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Probability</TableHead>
                <TableHead>Close Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deals.map((deal) => (
                <TableRow key={deal.id}>
                  <TableCell>
                    <div className="font-medium text-gray-900">{deal.title}</div>
                    <div className="text-sm text-gray-500">{deal.description}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStageColor(deal.stage)}>
                      {deal.stage.charAt(0).toUpperCase() + deal.stage.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{deal.amount?.toLocaleString() || '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{deal.company_id || '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-900">{deal.probability}%</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-600">
                      {deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : '-'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedDeal(deal)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit Deal</DialogTitle>
                          </DialogHeader>
                          {/* TODO: Add DealForm component */}
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDeal(deal.id)}
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
        </CardContent>
      </Card>
    </div>
  )
}