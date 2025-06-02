"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { CalendarIcon, Trash2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { Contact, Company, Deal as DealType } from "@/lib/types"



interface DealFormProps {
  deal?: DealType;
  contacts: Contact[];
  companies: Company[];
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => void;
}

export default function DealForm({ deal, contacts, companies, onSubmit, onCancel, onDelete }: DealFormProps) {
  const [loading, setLoading] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    deal?.expected_close_date ? new Date(deal.expected_close_date) : undefined
  )
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      
      // Handle date
      if (selectedDate) {
        formData.set('expected_close_date', selectedDate.toISOString().split('T')[0])
      }
      
      // Convert 'none' values to empty strings for contact_id and company_id
      if (formData.get('contact_id') === 'none') {
        formData.set('contact_id', '')
      }
      
      // Handle company_id - ensure it's a valid UUID or empty string
      const companyId = formData.get('company_id');
      if (companyId === 'none' || companyId === '3' || typeof companyId === 'string' && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(companyId)) {
        formData.set('company_id', '')
      }
      
      await onSubmit(formData)
      toast({
        title: "Success",
        description: deal ? "Deal updated successfully" : "Deal created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: deal ? "Failed to update deal" : "Failed to create deal",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Deal Title *</Label>
          <Input
            id="name"
            name="name"
            defaultValue={deal?.name || deal?.title || ""}
            required
            placeholder="Enterprise Software License"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={deal?.description || ""}
            placeholder="Deal details and notes"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              min="0"
              step="0.01"
              defaultValue={deal?.amount || ""}
              placeholder="10000.00"
            />
          </div>

          <div>
            <Label htmlFor="probability">Probability (%)</Label>
            <Input
              id="probability"
              name="probability"
              type="number"
              min="0"
              max="100"
              defaultValue={deal?.probability || 0}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="stage">Stage *</Label>
            <Select name="stage" defaultValue={deal?.stage || "lead"} required>
              <SelectTrigger>
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="negotiation">Negotiation</SelectItem>
                <SelectItem value="won">Won</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Expected Close Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contact_id">Contact</Label>
            <Select name="contact_id" defaultValue={deal?.contact_id || "none"}>
              <SelectTrigger>
                <SelectValue placeholder="Select a contact" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.first_name} {contact.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_id">Company</Label>
            <Select name="company_id" defaultValue={deal?.company_id || 'none'}>
              <SelectTrigger>
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="assigned_to">Assigned To</Label>
          <Input
            id="assigned_to"
            name="assigned_to"
            defaultValue={deal?.assigned_to || ""}
            placeholder="User ID of assignee"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onDelete && deal && (
          <Button 
            type="button" 
            variant="destructive" 
            onClick={onDelete} 
            className="mr-auto"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {deal ? "Update Deal" : "Create Deal"}
        </Button>
      </div>
    </form>
  )
}