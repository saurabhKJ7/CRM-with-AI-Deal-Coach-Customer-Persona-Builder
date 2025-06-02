"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

// Generate sample data for the heatmap
const generateHeatmapData = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const hours = Array.from({ length: 24 }, (_, i) => i)

  const data = days.map((day) => {
    return {
      day,
      hours: hours.map((hour) => {
        // Generate more realistic patterns
        let value = Math.floor(Math.random() * 10)

        // Business hours have higher activity
        if (hour >= 9 && hour <= 17 && day !== "Sat" && day !== "Sun") {
          value += Math.floor(Math.random() * 15)
        }

        // Lunch hours might have less activity
        if (hour >= 12 && hour <= 13) {
          value = Math.max(0, value - 5)
        }

        // Weekends have less activity
        if (day === "Sat" || day === "Sun") {
          value = Math.floor(value / 2)
        }

        return {
          hour: `${hour}:00`,
          value,
        }
      }),
    }
  })

  return data
}

const heatmapData = generateHeatmapData()

const getColorForValue = (value: number) => {
  if (value === 0) return "bg-gray-100"
  if (value < 5) return "bg-blue-100"
  if (value < 10) return "bg-blue-200"
  if (value < 15) return "bg-blue-300"
  if (value < 20) return "bg-blue-400"
  return "bg-blue-500"
}

export function SalesHeatmap() {
  const [metric, setMetric] = useState("activity")

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold text-gray-900">Activity Heatmap</CardTitle>
          <CardDescription>When your team is most active</CardDescription>
        </div>
        <Select value={metric} onValueChange={setMetric}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select metric" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="activity">All Activity</SelectItem>
            <SelectItem value="calls">Calls</SelectItem>
            <SelectItem value="emails">Emails</SelectItem>
            <SelectItem value="meetings">Meetings</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="flex mb-1">
              <div className="w-12"></div>
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="flex-1 text-center text-xs text-gray-500">
                  {i % 3 === 0 && `${i}:00`}
                </div>
              ))}
            </div>

            {heatmapData.map((day) => (
              <div key={day.day} className="flex items-center mb-1">
                <div className="w-12 text-xs font-medium text-gray-700">{day.day}</div>
                {day.hours.map((hour, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-8 ${getColorForValue(hour.value)} hover:opacity-80 transition-opacity`}
                    title={`${day.day} ${hour.hour}: ${hour.value} activities`}
                  ></div>
                ))}
              </div>
            ))}

            <div className="flex items-center mt-4 justify-center">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-100"></div>
                <span className="text-xs text-gray-500">0</span>
              </div>
              <div className="w-24 h-2 mx-1 bg-gradient-to-r from-blue-100 to-blue-500"></div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500"></div>
                <span className="text-xs text-gray-500">20+</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
