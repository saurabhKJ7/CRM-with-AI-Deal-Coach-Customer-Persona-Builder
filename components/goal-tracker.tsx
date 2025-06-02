"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, TrendingUp, Users, DollarSign } from "lucide-react"

const goals = [
  {
    id: 1,
    name: "Monthly Revenue",
    target: 500000,
    current: 425000,
    unit: "$",
    icon: DollarSign,
    color: "text-green-600",
    trend: "+12%",
    trendDirection: "up",
  },
  {
    id: 2,
    name: "New Customers",
    target: 50,
    current: 38,
    unit: "",
    icon: Users,
    color: "text-blue-600",
    trend: "+8%",
    trendDirection: "up",
  },
  {
    id: 3,
    name: "Deals Closed",
    target: 25,
    current: 18,
    unit: "",
    icon: Target,
    color: "text-purple-600",
    trend: "+5%",
    trendDirection: "up",
  },
  {
    id: 4,
    name: "Conversion Rate",
    target: 30,
    current: 24.8,
    unit: "%",
    icon: TrendingUp,
    color: "text-orange-600",
    trend: "-2%",
    trendDirection: "down",
  },
]

export function GoalTracker() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Goal Tracker</CardTitle>
        <CardDescription>Progress towards monthly targets</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {goals.map((goal) => {
          const progress = Math.round((goal.current / goal.target) * 100)
          const Icon = goal.icon

          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`${goal.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-medium">{goal.name}</span>
                </div>
                <Badge variant={goal.trendDirection === "up" ? "default" : "destructive"} className="text-xs">
                  {goal.trend}
                </Badge>
              </div>

              <Progress value={progress} className="h-2" />

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {goal.unit}
                  {goal.current.toLocaleString()}
                </span>
                <span className="font-medium">
                  {progress}% of {goal.unit}
                  {goal.target.toLocaleString()}
                </span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
