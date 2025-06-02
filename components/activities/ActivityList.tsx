"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Search, Plus, Edit, Trash2, Calendar, Phone, Mail, MessageSquare, Clock, User, Filter, Users, CheckSquare } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import ActivityForm from "./ActivityForm"

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

export default function ActivityList() {
  const [activities, setActivities] = React.useState<Activity[]>([])
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedActivity, setSelectedActivity] = React.useState<Activity | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [filterType, setFilterType] = React.useState<string | null>(null)
  const [filterCompleted, setFilterCompleted] = React.useState<string | null>(null)
  const [filterPriority, setFilterPriority] = React.useState<string | null>(null)
  const { toast } = useToast()

  // Filter activities based on search and filters
  const filteredActivities = React.useMemo(() => {
    return activities.filter((activity) => {
      const matchesSearch = activity.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.type.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesType = !filterType || activity.type === filterType
      const matchesCompleted = !filterCompleted || activity.completed.toString() === filterCompleted
      const matchesPriority = !filterPriority || activity.priority === filterPriority
      
      return matchesSearch && matchesType && matchesCompleted && matchesPriority
    })
  }, [activities, searchTerm, filterType, filterCompleted, filterPriority])

  // Fetch activities
  const fetchActivities = async () => {
    try {
      let url = "/api/activities"
      const params = new URLSearchParams()
      
      if (filterType) params.append("type", filterType)
      if (filterCompleted) params.append("completed", filterCompleted)
      if (filterPriority) params.append("priority", filterPriority)
      
      // Always set pageSize to 100 to ensure we get all records
      params.append("pageSize", "100")
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }
      
      console.log('Fetching activities from:', url)
      const response = await fetch(url)
      const data = await response.json()
      console.log(`Fetched ${data.data?.length || 0} activities out of ${data.pagination?.total || 0} total`)
      setActivities(data.data || [])
    } catch (error) {
      console.error('Error fetching activities:', error)
      toast({
        title: "Error",
        description: "Failed to fetch activities",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchActivities()
  }, [filterType, filterCompleted, filterPriority])

  const handleDeleteActivity = async (activityId: string) => {
    if (!confirm("Are you sure you want to delete this activity?")) return

    try {
      const response = await fetch(`/api/activities/${activityId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Activity deleted successfully",
        })
        fetchActivities()
      } else {
        throw new Error("Failed to delete activity")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete activity",
        variant: "destructive",
      })
    }
  }

  const handleToggleComplete = async (activityId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/activities/${activityId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: completed ? "Activity marked as incomplete" : "Activity marked as complete",
        })
        fetchActivities()
      } else {
        throw new Error("Failed to update activity")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update activity status",
        variant: "destructive",
      })
    }
  }

  const handleAddActivity = async (data: any) => {
    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setIsAddDialogOpen(false)
        fetchActivities()
      } else {
        throw new Error('Failed to create activity')
      }
    } catch (error) {
      throw error
    }
  }

  const handleEditActivity = async (data: any) => {
    if (!selectedActivity) return

    try {
      const response = await fetch(`/api/activities/${selectedActivity.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setIsEditDialogOpen(false)
        setSelectedActivity(null)
        fetchActivities()
      } else {
        throw new Error('Failed to update activity')
      }
    } catch (error) {
      throw error
    }
  }

  const getActivityTypeIcon = (type: Activity['type']) => {
    switch (type) {
      case 'call':
        return <Phone className="h-4 w-4 text-blue-500" />
      case 'email':
        return <Mail className="h-4 w-4 text-purple-500" />
      case 'meeting':
        return <Users className="h-4 w-4 text-green-500" />
      case 'task':
        return <CheckSquare className="h-4 w-4 text-orange-500" />
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityBadge = (priority: Activity['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High</Badge>
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
      case 'low':
        return <Badge className="bg-blue-100 text-blue-800">Low</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading activities...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activities</h1>
          <p className="text-gray-600 mt-1">Manage your tasks, calls, meetings, and follow-ups.</p>
        </div>
        <div className="flex gap-2">
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
              <ActivityForm
                onSubmitAction={handleAddActivity}
                onCancelAction={() => setIsAddDialogOpen(false)}
              />
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
                <p className="text-sm font-medium text-gray-500">Total Activities</p>
                <p className="text-2xl font-bold mt-1">{filteredActivities.length}</p>
              </div>
              <div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-bold mt-1">{filteredActivities.filter((a) => a.completed).length}</p>
              </div>
              <div>
                <CheckSquare className="h-8 w-8 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Overdue</p>
                <p className="text-2xl font-bold mt-1">{filteredActivities.filter((a) => !a.completed && a.due_date && new Date(a.due_date) < new Date()).length}</p>
              </div>
              <div>
                <Clock className="h-8 w-8 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">High Priority</p>
                <p className="text-2xl font-bold mt-1">{filteredActivities.filter((a) => a.priority === 'high' && !a.completed).length}</p>
              </div>
              <div>
                <MessageSquare className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="w-[150px]">
              <Select value={filterType || "all"} onValueChange={(value) => setFilterType(value === "all" ? null : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="call">Calls</SelectItem>
                  <SelectItem value="email">Emails</SelectItem>
                  <SelectItem value="meeting">Meetings</SelectItem>
                  <SelectItem value="task">Tasks</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-[150px]">
              <Select value={filterCompleted || "all"} onValueChange={(value) => setFilterCompleted(value === "all" ? null : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">Completed</SelectItem>
                  <SelectItem value="false">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-[150px]">
              <Select value={filterPriority || "all"} onValueChange={(value) => setFilterPriority(value === "all" ? null : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activities Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">All Activities ({filteredActivities.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No activities found matching your criteria.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Status</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.map((activity) => (
                <TableRow key={activity.id} className={activity.completed ? "bg-gray-50" : ""}>
                  <TableCell>
                    <Checkbox 
                      checked={activity.completed}
                      onCheckedChange={() => handleToggleComplete(activity.id, activity.completed)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className={`font-medium ${activity.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {activity.subject}
                    </div>
                    {activity.description && (
                      <div className="text-sm text-gray-500 mt-1 line-clamp-1">{activity.description}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getActivityTypeIcon(activity.type)}
                      <span className="capitalize">{activity.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {activity.due_date ? (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className={`text-sm ${new Date(activity.due_date) < new Date() && !activity.completed ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                          {format(new Date(activity.due_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">No date</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {getPriorityBadge(activity.priority)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{activity.assigned_to || 'Unassigned'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedActivity(activity)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit Activity</DialogTitle>
                          </DialogHeader>
                          {selectedActivity && (
                            <ActivityForm
                              activity={selectedActivity}
                              onSubmitAction={handleEditActivity}
                              onCancelAction={() => {
                                setIsEditDialogOpen(false)
                                setSelectedActivity(null)
                              }}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteActivity(activity.id)}
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
  )
}