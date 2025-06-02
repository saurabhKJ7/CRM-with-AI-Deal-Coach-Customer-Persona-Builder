"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"

type Activity = {
  id: string;
  subject: string;
  type: 'call' | 'email' | 'meeting' | 'task';
  due_date: string | null;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  description: string | null;
  contact_id: string | null;
  deal_id: string | null;
  assigned_to: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

interface ActivityFormProps {
  activity?: Activity;
  onSubmitAction: (data: any) => Promise<void>;
  onCancelAction: () => void;
}

export default function ActivityForm({ activity, onSubmitAction, onCancelAction }: ActivityFormProps) {
  const [loading, setLoading] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    activity?.due_date ? new Date(activity.due_date) : undefined
  )
  const [isCompleted, setIsCompleted] = React.useState(activity?.completed || false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      
      // Convert FormData to JSON object
      const data: any = {}
      for (const [key, value] of formData.entries()) {
        data[key] = value
      }
      
      // Add the date value
      if (selectedDate) {
        data.due_date = selectedDate.toISOString().split('T')[0]
      }
      
      // Add completed status
      data.completed = isCompleted
      
      await onSubmitAction(data)
      toast({
        title: "Success",
        description: activity ? "Activity updated successfully" : "Activity created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: activity ? "Failed to update activity" : "Failed to create activity",
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
          <Label htmlFor="subject">Subject *</Label>
          <Input
            id="subject"
            name="subject"
            defaultValue={activity?.subject || ""}
            required
            placeholder="Follow up call with client"
          />
        </div>

        <div>
          <Label htmlFor="type">Activity Type *</Label>
          <Select name="type" defaultValue={activity?.type || "task"} required>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="call">Call</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="task">Task</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={activity?.description || ""}
            placeholder="Activity details and notes"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Due Date</Label>
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

          <div>
            <Label htmlFor="priority">Priority *</Label>
            <Select name="priority" defaultValue={activity?.priority || "medium"} required>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contact_id">Contact ID</Label>
            <Input
              id="contact_id"
              name="contact_id"
              defaultValue={activity?.contact_id || ""}
              placeholder="Contact reference"
            />
          </div>

          <div>
            <Label htmlFor="deal_id">Deal ID</Label>
            <Input
              id="deal_id"
              name="deal_id"
              defaultValue={activity?.deal_id || ""}
              placeholder="Deal reference"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="assigned_to">Assigned To</Label>
          <Input
            id="assigned_to"
            name="assigned_to"
            defaultValue={activity?.assigned_to || ""}
            placeholder="User ID of assignee"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="completed" 
            checked={isCompleted} 
            onCheckedChange={(checked) => setIsCompleted(checked as boolean)} 
          />
          <Label htmlFor="completed">Mark as completed</Label>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancelAction}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : activity ? "Update Activity" : "Create Activity"}
        </Button>
      </div>
    </form>
  )
}