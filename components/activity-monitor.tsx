"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, Users, Search, Download, Calendar } from "lucide-react"

interface SearchData {
  department: string
  searches: number
  trend: "up" | "down" | "stable"
  percentage: number
}

interface ActivityLog {
  id: string
  timestamp: string
  action: string
  department: string
  user: string
}

export default function ActivityMonitor() {
  const [searchData] = useState<SearchData[]>([
    { department: "Human Resources", searches: 245, trend: "up", percentage: 85 },
    { department: "Information Technology", searches: 189, trend: "up", percentage: 65 },
    { department: "Finance Department", searches: 156, trend: "stable", percentage: 54 },
    { department: "Marketing", searches: 134, trend: "down", percentage: 46 },
    { department: "Operations", searches: 98, trend: "up", percentage: 34 },
    { department: "Legal", searches: 67, trend: "stable", percentage: 23 },
    { department: "Facilities", searches: 45, trend: "down", percentage: 16 },
    { department: "Security", searches: 23, trend: "stable", percentage: 8 },
  ])

  const [activityLogs] = useState<ActivityLog[]>([
    {
      id: "1",
      timestamp: "2024-01-28 10:30:15",
      action: "Department Search",
      department: "Human Resources",
      user: "Anonymous User",
    },
    {
      id: "2",
      timestamp: "2024-01-28 10:28:42",
      action: "Floor Navigation",
      department: "IT Department",
      user: "Anonymous User",
    },
    {
      id: "3",
      timestamp: "2024-01-28 10:25:33",
      action: "Contact Info Viewed",
      department: "Finance Department",
      user: "Anonymous User",
    },
    {
      id: "4",
      timestamp: "2024-01-28 10:22:18",
      action: "Department Search",
      department: "Marketing",
      user: "Anonymous User",
    },
    {
      id: "5",
      timestamp: "2024-01-28 10:20:05",
      action: "Emergency Contact Accessed",
      department: "Security",
      user: "Anonymous User",
    },
  ])

  const totalSearches = searchData.reduce((sum, item) => sum + item.searches, 0)
  const maxSearches = Math.max(...searchData.map((item) => item.searches))

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case "down":
        return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-600"
      case "down":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Searches</p>
                <p className="text-2xl font-bold text-[#B85A1A]">{totalSearches.toLocaleString()}</p>
              </div>
              <Search className="w-8 h-8 text-[#EF842D]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-[#B85A1A]">1,247</p>
              </div>
              <Users className="w-8 h-8 text-[#EF842D]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Peak Hour</p>
                <p className="text-2xl font-bold text-[#B85A1A]">10-11 AM</p>
              </div>
              <Calendar className="w-8 h-8 text-[#EF842D]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Session</p>
                <p className="text-2xl font-bold text-[#B85A1A]">2.3 min</p>
              </div>
              <BarChart3 className="w-8 h-8 text-[#EF842D]" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="search-analytics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="search-analytics">Search Analytics</TabsTrigger>
          <TabsTrigger value="activity-logs">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="search-analytics" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Department Search Frequency</CardTitle>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {searchData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.department}</span>
                        {getTrendIcon(item.trend)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{item.searches} searches</span>
                        <Badge variant="outline" className={getTrendColor(item.trend)}>
                          {item.percentage}%
                        </Badge>
                      </div>
                    </div>
                    <Progress value={(item.searches / maxSearches) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity-logs" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Logs
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activityLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{log.action}</span>
                        <Badge variant="outline" className="text-xs">
                          {log.department}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {log.timestamp} • {log.user}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline">Load More Logs</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
