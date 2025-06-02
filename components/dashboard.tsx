"use client"

import { Separator } from "@/components/ui/separator"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Phone,
  Mail,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Target,
  RefreshCw,
  ChevronRight,
  Clock,
  AlertCircle,
  CheckCircle,
  BarChart3,
  LineChartIcon,
  Activity,
} from "lucide-react"
import { dashboardMetrics, sampleActivities, sampleDeals } from "@/lib/sample-data"
import { Progress } from "@/components/ui/progress"

// Pipeline data
const pipelineData = [
  { stage: "Lead", count: 12, value: 180000 },
  { stage: "Qualified", count: 8, value: 240000 },
  { stage: "Proposal", count: 5, value: 350000 },
  { stage: "Negotiation", count: 3, value: 450000 },
  { stage: "Closed", count: 2, value: 125000 },
]

// Revenue data
const revenueData = [
  { month: "Jan", revenue: 185000, target: 170000, deals: 8 },
  { month: "Feb", revenue: 220000, target: 200000, deals: 12 },
  { month: "Mar", revenue: 195000, target: 210000, deals: 9 },
  { month: "Apr", revenue: 245000, target: 220000, deals: 14 },
  { month: "May", revenue: 280000, target: 250000, deals: 16 },
  { month: "Jun", revenue: 310000, target: 280000, deals: 18 },
]

// Sales by product
const productData = [
  { name: "Software License", value: 45 },
  { name: "Consulting", value: 25 },
  { name: "Support", value: 15 },
  { name: "Training", value: 10 },
  { name: "Hardware", value: 5 },
]

// Sales by region
const regionData = [
  { name: "North America", value: 55 },
  { name: "Europe", value: 25 },
  { name: "Asia Pacific", value: 15 },
  { name: "Latin America", value: 5 },
]

// Sales forecast
const forecastData = [
  { month: "Jul", forecast: 330000, worstCase: 290000, bestCase: 370000 },
  { month: "Aug", forecast: 350000, worstCase: 310000, bestCase: 390000 },
  { month: "Sep", forecast: 380000, worstCase: 330000, bestCase: 420000 },
  { month: "Oct", forecast: 400000, worstCase: 350000, bestCase: 450000 },
  { month: "Nov", forecast: 420000, worstCase: 370000, bestCase: 470000 },
  { month: "Dec", forecast: 450000, worstCase: 390000, bestCase: 510000 },
]

// Team performance
const teamData = [
  { name: "Alex", deals: 12, revenue: 450000, target: 400000, conversion: 35 },
  { name: "Maria", deals: 8, revenue: 320000, target: 350000, conversion: 42 },
  { name: "David", deals: 10, revenue: 380000, target: 350000, conversion: 38 },
  { name: "Sarah", deals: 7, revenue: 290000, target: 300000, conversion: 30 },
]

// Deal conversion funnel
const funnelData = [
  { name: "Leads", value: 120 },
  { name: "Qualified", value: 80 },
  { name: "Proposals", value: 40 },
  { name: "Negotiations", value: 20 },
  { name: "Closed Won", value: 12 },
]

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"]

export function Dashboard() {
  const [timeRange, setTimeRange] = useState("month")
  const [chartType, setChartType] = useState("bar")
  const recentActivities = sampleActivities.slice(0, 5)
  const upcomingDeals = sampleDeals
    .filter((deal) => deal.stage !== "closed-won" && deal.stage !== "closed-lost")
    .slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your sales.</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Quick Add
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{dashboardMetrics.totalContacts.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +12% from last month
            </div>
            <Progress value={75} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Deals</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{dashboardMetrics.activeDeals}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +8% from last month
            </div>
            <Progress value={65} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ${(dashboardMetrics.totalRevenue / 1000000).toFixed(1)}M
            </div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />+{dashboardMetrics.monthlyGrowth}% from last month
            </div>
            <Progress value={82} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{dashboardMetrics.conversionRate}%</div>
            <div className="flex items-center text-xs text-red-600 mt-1">
              <ArrowDownRight className="h-3 w-3 mr-1" />
              -2% from last month
            </div>
            <Progress value={55} className="h-1 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Sales Overview with Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">Sales Overview</CardTitle>
            <div className="flex items-center gap-2">
              <Tabs defaultValue="revenue" className="w-[400px]">
                <TabsList>
                  <TabsTrigger value="revenue">Revenue</TabsTrigger>
                  <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
                  <TabsTrigger value="forecast">Forecast</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => setChartType("bar")}>
                  <BarChart3 className={`h-4 w-4 ${chartType === "bar" ? "text-blue-600" : "text-gray-400"}`} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setChartType("line")}>
                  <LineChartIcon className={`h-4 w-4 ${chartType === "line" ? "text-blue-600" : "text-gray-400"}`} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setChartType("area")}>
                  <Activity className={`h-4 w-4 ${chartType === "area" ? "text-blue-600" : "text-gray-400"}`} />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ChartContainer
              config={{
                revenue: {
                  label: "Revenue",
                  color: "hsl(var(--chart-1))",
                },
                target: {
                  label: "Target",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "bar" ? (
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="target" fill="#10B981" name="Target" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : chartType === "line" ? (
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#3B82F6" name="Revenue" strokeWidth={2} />
                    <Line type="monotone" dataKey="target" stroke="#10B981" name="Target" strokeWidth={2} />
                  </LineChart>
                ) : (
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.2}
                      name="Revenue"
                    />
                    <Area
                      type="monotone"
                      dataKey="target"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.2}
                      name="Target"
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Sales Distribution and Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">Sales Distribution</CardTitle>
              <Tabs defaultValue="product" className="w-[250px]">
                <TabsList>
                  <TabsTrigger value="product">By Product</TabsTrigger>
                  <TabsTrigger value="region">By Region</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {productData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sales Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Deal Conversion Funnel</CardTitle>
            <CardDescription>Conversion rate from leads to closed deals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {funnelData.map((stage, index) => (
                <div key={stage.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{stage.name}</span>
                    <span className="text-sm text-gray-500">
                      {stage.value} ({((stage.value / funnelData[0].value) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <Progress
                    value={(stage.value / funnelData[0].value) * 100}
                    className="h-2"
                    indicatorClassName={`bg-gradient-to-r from-${COLORS[index % COLORS.length].replace(
                      "#",
                      "",
                    )} to-${COLORS[(index + 1) % COLORS.length].replace("#", "")}`}
                  />
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <div className="text-sm text-gray-500">Lead to Deal Conversion</div>
              <div className="text-2xl font-bold text-gray-900">
                {((funnelData[funnelData.length - 1].value / funnelData[0].value) * 100).toFixed(1)}%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance and Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Team Performance</CardTitle>
            <CardDescription>Sales performance by team member</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamData.map((member) => (
                <div key={member.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        {member.name.charAt(0)}
                      </div>
                      <span className="font-medium">{member.name}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">${member.revenue.toLocaleString()}</span>
                      <span className="text-gray-500 ml-1">
                        ({((member.revenue / member.target) * 100).toFixed(0)}% of target)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={(member.revenue / member.target) * 100}
                      className="h-2 flex-1"
                      indicatorClassName={member.revenue >= member.target ? "bg-green-600" : "bg-blue-600"}
                    />
                    <span className="text-xs text-gray-500 w-12">{member.deals} deals</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sales Forecast */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Sales Forecast</CardTitle>
            <CardDescription>Projected revenue for the next 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ChartContainer
                config={{
                  forecast: {
                    label: "Forecast",
                    color: "hsl(var(--chart-3))",
                  },
                  bestCase: {
                    label: "Best Case",
                    color: "hsl(var(--chart-4))",
                  },
                  worstCase: {
                    label: "Worst Case",
                    color: "hsl(var(--chart-5))",
                  },
                }}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="bestCase"
                      stackId="1"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.1}
                    />
                    <Area
                      type="monotone"
                      dataKey="forecast"
                      stackId="2"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="worstCase"
                      stackId="3"
                      stroke="#F59E0B"
                      fill="#F59E0B"
                      fillOpacity={0.1}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities and Upcoming Deals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">Recent Activities</CardTitle>
            <Button variant="ghost" size="sm" className="text-blue-600">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <div className="flex-shrink-0">
                  {activity.type === "call" && <Phone className="h-4 w-4 text-blue-600" />}
                  {activity.type === "email" && <Mail className="h-4 w-4 text-green-600" />}
                  {activity.type === "meeting" && <Calendar className="h-4 w-4 text-purple-600" />}
                  {activity.type === "task" && <Target className="h-4 w-4 text-orange-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                  <p className="text-xs text-gray-600">{activity.contactName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={
                        activity.priority === "high"
                          ? "destructive"
                          : activity.priority === "medium"
                            ? "default"
                            : "secondary"
                      }
                      className="text-xs"
                    >
                      {activity.priority}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {activity.dueDate}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Deals */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">Upcoming Deals</CardTitle>
            <Button variant="ghost" size="sm" className="text-blue-600">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingDeals.map((deal) => (
              <div key={deal.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <DollarSign className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{deal.title}</p>
                  <p className="text-xs text-gray-600">{deal.company}</p>
                  <div className="flex items-center justify-between mt-1">
                    <Badge variant="outline" className="text-xs">
                      ${deal.value.toLocaleString()}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {deal.closeDate}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Task Summary */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">Task Summary</CardTitle>
            <Button variant="ghost" size="sm" className="text-blue-600">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Overdue</p>
                    <p className="text-xs text-gray-500">Tasks past due date</p>
                  </div>
                </div>
                <div className="text-xl font-bold text-orange-600">3</div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Due Today</p>
                    <p className="text-xs text-gray-500">Tasks due today</p>
                  </div>
                </div>
                <div className="text-xl font-bold text-blue-600">5</div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Completed</p>
                    <p className="text-xs text-gray-500">Tasks completed today</p>
                  </div>
                </div>
                <div className="text-xl font-bold text-green-600">7</div>
              </div>
              <Separator />
              <div className="pt-2">
                <Button className="w-full" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Task
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button className="flex flex-col h-auto py-4 bg-blue-600 hover:bg-blue-700">
            <Users className="h-6 w-6 mb-2" />
            <span>Add Contact</span>
          </Button>
          <Button className="flex flex-col h-auto py-4 bg-green-600 hover:bg-green-700">
            <DollarSign className="h-6 w-6 mb-2" />
            <span>Create Deal</span>
          </Button>
          <Button className="flex flex-col h-auto py-4 bg-purple-600 hover:bg-purple-700">
            <Calendar className="h-6 w-6 mb-2" />
            <span>Schedule Meeting</span>
          </Button>
          <Button className="flex flex-col h-auto py-4 bg-orange-600 hover:bg-orange-700">
            <Phone className="h-6 w-6 mb-2" />
            <span>Log Call</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
