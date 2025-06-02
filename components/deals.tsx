"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, DollarSign, Calendar, User, Building, Percent } from "lucide-react"
import { sampleDeals, sampleContacts, type Deal } from "@/lib/sample-data"

const stages = [
  { id: "lead", title: "Lead", color: "bg-gray-100" },
  { id: "qualified", title: "Qualified", color: "bg-blue-100" },
  { id: "proposal", title: "Proposal", color: "bg-yellow-100" },
  { id: "negotiation", title: "Negotiation", color: "bg-orange-100" },
  { id: "closed-won", title: "Closed Won", color: "bg-green-100" },
  { id: "closed-lost", title: "Closed Lost", color: "bg-red-100" },
]

export function Deals() {
  const [deals, setDeals] = React.useState<Deal[]>(sampleDeals)
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [draggedDeal, setDraggedDeal] = React.useState<Deal | null>(null)

  const handleAddDeal = (formData: FormData) => {
    const contactId = formData.get("contactId") as string
    const contact = sampleContacts.find((c) => c.id === contactId)

    const newDeal: Deal = {
      id: Date.now().toString(),
      title: formData.get("title") as string,
      value: Number.parseInt(formData.get("value") as string) || 0,
      probability: Number.parseInt(formData.get("probability") as string) || 0,
      stage: formData.get("stage") as Deal["stage"],
      contactId: contactId,
      contactName: contact?.name || "",
      company: contact?.company || "",
      owner: formData.get("owner") as string,
      createdAt: new Date().toISOString().split("T")[0],
      closeDate: formData.get("closeDate") as string,
      description: formData.get("description") as string,
    }

    setDeals([...deals, newDeal])
    setIsAddDialogOpen(false)
  }

  const handleDragStart = (deal: Deal) => {
    setDraggedDeal(deal)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, newStage: Deal["stage"]) => {
    e.preventDefault()
    if (draggedDeal) {
      setDeals(deals.map((deal) => (deal.id === draggedDeal.id ? { ...deal, stage: newStage } : deal)))
      setDraggedDeal(null)
    }
  }

  const getDealsByStage = (stage: Deal["stage"]) => {
    return deals.filter((deal) => deal.stage === stage)
  }

  const getStageValue = (stage: Deal["stage"]) => {
    return getDealsByStage(stage).reduce((sum, deal) => sum + deal.value, 0)
  }

  const DealCard = ({ deal }: { deal: Deal }) => (
    <Card
      className="mb-3 cursor-move hover:shadow-md transition-shadow w-full"
      draggable
      onDragStart={() => handleDragStart(deal)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-gray-900 text-sm">{deal.title}</h4>
            <p className="text-xs text-gray-500 mt-1">{deal.description}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm font-medium text-green-600">
              <DollarSign className="h-3 w-3" />${deal.value.toLocaleString()}
            </div>
            <Badge variant="outline" className="text-xs">
              <Percent className="h-3 w-3 mr-1" />
              {deal.probability}%
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <User className="h-3 w-3" />
              {deal.contactName}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Building className="h-3 w-3" />
              {deal.company}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Calendar className="h-3 w-3" />
              Close: {deal.closeDate}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-500">Owner: {deal.owner}</span>
            <Badge variant="secondary" className="text-xs">
              {deal.stage.replace("-", " ")}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals Pipeline</h1>
          <p className="text-gray-600">Track and manage your sales opportunities through the pipeline.</p>
        </div>
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
            <form action={handleAddDeal} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Deal Title</Label>
                  <Input id="title" name="title" required />
                </div>
                <div>
                  <Label htmlFor="value">Deal Value</Label>
                  <Input id="value" name="value" type="number" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="probability">Probability (%)</Label>
                  <Input id="probability" name="probability" type="number" min="0" max="100" />
                </div>
                <div>
                  <Label htmlFor="stage">Stage</Label>
                  <Select name="stage" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map((stage) => (
                        <SelectItem key={stage.id} value={stage.id}>
                          {stage.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactId">Contact</Label>
                  <Select name="contactId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contact" />
                    </SelectTrigger>
                    <SelectContent>
                      {sampleContacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {contact.name} - {contact.company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="owner">Deal Owner</Label>
                  <Input id="owner" name="owner" required />
                </div>
              </div>

              <div>
                <Label htmlFor="closeDate">Expected Close Date</Label>
                <Input id="closeDate" name="closeDate" type="date" required />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={3} />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Add Deal
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pipeline Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stages.map((stage) => (
          <Card key={stage.id} className="w-full">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {getDealsByStage(stage.id as Deal["stage"]).length}
                </div>
                <div className="text-sm text-gray-600">{stage.title}</div>
                <div className="text-xs text-gray-500 mt-1">
                  ${getStageValue(stage.id as Deal["stage"]).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className="space-y-3 w-full"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.id as Deal["stage"])}
          >
            <Card className={`${stage.color} border-2 border-dashed border-gray-300 w-full`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">
                  {stage.title} ({getDealsByStage(stage.id as Deal["stage"]).length})
                </CardTitle>
                <div className="text-xs text-gray-600">
                  ${getStageValue(stage.id as Deal["stage"]).toLocaleString()}
                </div>
              </CardHeader>
            </Card>

            <div className="space-y-3 min-h-[400px] w-full">
              {getDealsByStage(stage.id as Deal["stage"]).map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
