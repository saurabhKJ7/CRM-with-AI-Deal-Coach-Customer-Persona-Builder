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
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, Phone, Mail, Users, Target, Plus, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { sampleActivities, sampleContacts, sampleDeals, type Activity } from "@/lib/sample-data"

export function Activities() {
  const [activities, setActivities] = React.useState<Activity[]>(sampleActivities)
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [filter, setFilter] = React.useState<"all" | "pending" | "completed">("all")

  const handleAddActivity = (formData: FormData) => {
    const contactId = formData.get("contactId") as string
    const dealId = formData.get("dealId") as string
    const contact = sampleContacts.find((c) => c.id === contactId)
    const deal = sampleDeals.find((d) => d.id === dealId)

    const newActivity: Activity = {
      id: Date.now().toString(),
      type: formData.get("type") as Activity["type"],
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      contactId: contactId || undefined,
      dealId: dealId || undefined,
      contactName: contact?.name,
      dealTitle: deal?.title,
      dueDate: formData.get("dueDate") as string,
      completed: false,
      priority: formData.get("priority") as Activity["priority"],
      createdAt: new Date().toISOString().split("T")[0],
      owner: formData.get("owner") as string,
    }

    setActivities([newActivity, ...activities])
    setIsAddDialogOpen(false)
  }

  const handleToggleComplete = (activityId: string) => {
    setActivities(
      activities.map((activity) =>
        activity.id === activityId ? { ...activity, completed: !activity.completed } : activity,
      ),
    )
  }

  const filteredActivities = activities.filter((activity) => {
    if (filter === "pending") return !activity.completed
    if (filter === "completed") return activity.completed
    return true
  })

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "call":
        return <Phone className="h-4 w-4" />
      case "email":
        return <Mail className="h-4 w-4" />
      case "meeting":
        return <Users className="h-4 w-4" />
      case "task":
        return <Target className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: Activity["type"]) => {
    switch (type) {
      case "call":
        return "text-blue-600 bg-blue-100"
      case "email":
        return "text-green-600 bg-green-100"
      case "meeting":
        return "text-purple-600 bg-purple-100"
      case "task":
        return "text-orange-600 bg-orange-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getPriorityColor = (priority: Activity["priority"]) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
    }
  }

  const isOverdue = (dueDate: string, completed: boolean) => {
    if (completed) return false
    return new Date(dueDate) < new Date()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
          <p className="text-gray-600">Manage tasks, calls, meetings, and follow-ups.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Activity
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Activity</DialogTitle>
            </DialogHeader>
            <form action={handleAddActivity} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Activity Type</Label>
                  <Select name="type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="task">Task</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select name="priority" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={3} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactId">Related Contact</Label>
                  <Select name="contactId">
                    <SelectTrigger>
                      <SelectValue placeholder="Select contact (optional)" />
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
                  <Label htmlFor="dealId">Related Deal</Label>
                  <Select name="dealId">
                    <SelectTrigger>
                      <SelectValue placeholder="Select deal (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {sampleDeals.map((deal) => (
                        <SelectItem key={deal.id} value={deal.id}>
                          {deal.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input id="dueDate" name="dueDate" type="date" required />
                </div>
                <div>
                  <Label htmlFor="owner">Owner</Label>
                  <Input id="owner" name="owner" required />
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Add Activity
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Tabs */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
              className={filter === "all" ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              All Activities ({activities.length})
            </Button>
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("pending")}
              className={filter === "pending" ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              Pending ({activities.filter((a) => !a.completed).length})
            </Button>
            <Button
              variant={filter === "completed" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("completed")}
              className={filter === "completed" ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              Completed ({activities.filter((a) => a.completed).length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activities Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredActivities.map((activity, index) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={activity.completed} onCheckedChange={() => handleToggleComplete(activity.id)} />
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${getActivityColor(activity.type)}`}
                  >
                    {getActivityIcon(activity.type)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4
                        className={`font-medium ${activity.completed ? "line-through text-gray-500" : "text-gray-900"}`}
                      >
                        {activity.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>

                      <div className="flex items-center gap-4 mt-2">
                        {activity.contactName && (
                          <span className="text-xs text-gray-500">Contact: {activity.contactName}</span>
                        )}
                        {activity.dealTitle && (
                          <span className="text-xs text-gray-500">Deal: {activity.dealTitle}</span>
                        )}
                        <span className="text-xs text-gray-500">Owner: {activity.owner}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Badge variant={getPriorityColor(activity.priority)} className="text-xs">
                        {activity.priority}
                      </Badge>

                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        {isOverdue(activity.dueDate, activity.completed) ? (
                          <AlertCircle className="h-3 w-3 text-red-500" />
                        ) : activity.completed ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        <span
                          className={isOverdue(activity.dueDate, activity.completed) ? "text-red-600 font-medium" : ""}
                        >
                          {activity.dueDate}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
