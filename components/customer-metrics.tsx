"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Sample data for Customer Acquisition Cost (CAC)
const cacData = [
  { month: "Jan", cac: 350, marketingSpend: 35000, newCustomers: 100 },
  { month: "Feb", cac: 325, marketingSpend: 39000, newCustomers: 120 },
  { month: "Mar", cac: 300, marketingSpend: 36000, newCustomers: 120 },
  { month: "Apr", cac: 275, marketingSpend: 38500, newCustomers: 140 },
  { month: "May", cac: 290, marketingSpend: 40600, newCustomers: 140 },
  { month: "Jun", cac: 260, marketingSpend: 41600, newCustomers: 160 },
]

// Sample data for Customer Lifetime Value (CLV)
const clvData = [
  { month: "Jan", clv: 1200, cacRatio: 3.4 },
  { month: "Feb", clv: 1250, cacRatio: 3.8 },
  { month: "Mar", clv: 1300, cacRatio: 4.3 },
  { month: "Apr", clv: 1350, cacRatio: 4.9 },
  { month: "May", clv: 1400, cacRatio: 4.8 },
  { month: "Jun", clv: 1450, cacRatio: 5.6 },
]

export function CustomerMetrics() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Customer Economics</CardTitle>
        <CardDescription>Customer acquisition cost and lifetime value metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="cac">
          <TabsList className="mb-4">
            <TabsTrigger value="cac">Acquisition Cost</TabsTrigger>
            <TabsTrigger value="clv">Lifetime Value</TabsTrigger>
            <TabsTrigger value="ratio">CLV:CAC Ratio</TabsTrigger>
          </TabsList>

          <TabsContent value="cac" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-500">Current CAC</div>
                  <div className="text-2xl font-bold text-gray-900">$260</div>
                  <div className="text-xs text-green-600">-11% from 6 months ago</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-500">Marketing Spend</div>
                  <div className="text-2xl font-bold text-gray-900">$41.6K</div>
                  <div className="text-xs text-green-600">+19% from 6 months ago</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-500">New Customers</div>
                  <div className="text-2xl font-bold text-gray-900">160</div>
                  <div className="text-xs text-green-600">+60% from 6 months ago</div>
                </CardContent>
              </Card>
            </div>

            <div className="h-[300px]">
              <ChartContainer
                config={{
                  cac: {
                    label: "Customer Acquisition Cost",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cacData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="cac" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </TabsContent>

          <TabsContent value="clv" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-500">Current CLV</div>
                  <div className="text-2xl font-bold text-gray-900">$1,450</div>
                  <div className="text-xs text-green-600">+21% from 6 months ago</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-500">Avg. Revenue per User</div>
                  <div className="text-2xl font-bold text-gray-900">$290</div>
                  <div className="text-xs text-green-600">+16% from 6 months ago</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-500">Retention Rate</div>
                  <div className="text-2xl font-bold text-gray-900">85%</div>
                  <div className="text-xs text-green-600">+5% from 6 months ago</div>
                </CardContent>
              </Card>
            </div>

            <div className="h-[300px]">
              <ChartContainer
                config={{
                  clv: {
                    label: "Customer Lifetime Value",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={clvData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="clv" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </TabsContent>

          <TabsContent value="ratio" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-500">Current CLV:CAC</div>
                  <div className="text-2xl font-bold text-gray-900">5.6:1</div>
                  <div className="text-xs text-green-600">+65% from 6 months ago</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-500">Payback Period</div>
                  <div className="text-2xl font-bold text-gray-900">5.2 mo</div>
                  <div className="text-xs text-green-600">-22% from 6 months ago</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-500">Target Ratio</div>
                  <div className="text-2xl font-bold text-gray-900">3:1</div>
                  <div className="text-xs text-green-600">Currently exceeding target</div>
                </CardContent>
              </Card>
            </div>

            <div className="h-[300px]">
              <ChartContainer
                config={{
                  cacRatio: {
                    label: "CLV:CAC Ratio",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={clvData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="cacRatio" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
