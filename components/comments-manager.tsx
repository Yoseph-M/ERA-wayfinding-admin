"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, MessageSquare, User, Search, Trash2, Calendar, Clock, X } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface Comment {
  id: string
  content: string
  type: "general" | "personnel"
  personnelId?: string
  personnelName?: string
  createdAt: Date
  updatedAt?: Date
  tags?: string[]
}

interface Personnel {
  id: string
  firstName: string
  lastName: string
  position: { en: string; am: string }
  department: { en: string; am: string }
}

export default function CommentsManager() {
  const router = useRouter()
  const [comments, setComments] = useState<Comment[]>([])
  const [personnel, setPersonnel] = useState<Personnel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("general")
  const [searchTerm, setSearchTerm] = useState("")

  // Check authentication
  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem('isAuthenticated') !== 'true') {
      router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }
  }, [router])

  // Load personnel data for personnel comments
  useEffect(() => {
    async function fetchPersonnel() {
      try {
        const res = await fetch('/api/departments')
        if (res.ok) {
          const csvText = await res.text()
          // Parse CSV and extract personnel data
          // This is a simplified version - you might want to use Papa.parse
          const lines = csvText.split('\n').slice(1) // Skip header
          const personnelData: Personnel[] = []
          const seenIds = new Set<string>()
          
          lines.forEach((line, idx) => {
            const columns = line.split(',')
            if (columns.length > 0 && columns[0]?.trim()) {
              const wname = columns[0]?.trim()
              if (wname) {
                const [firstName, ...rest] = wname.split(' ')
                const lastName = rest.join(' ')
                const id = `personnel_${idx}`
                if (!seenIds.has(id)) {
                  seenIds.add(id)
                  personnelData.push({
                    id,
                    firstName: firstName || '',
                    lastName: lastName || '',
                    position: { en: columns[1] || '', am: columns[2] || '' },
                    department: { en: columns[3] || '', am: columns[4] || '' }
                  })
                }
              }
            }
          })
          setPersonnel(personnelData)
        }
      } catch (err) {
        console.error('Error fetching personnel:', err)
      }
    }
    fetchPersonnel()
  }, [])

  // Load sample comments data
  useEffect(() => {
    const sampleComments: Comment[] = [
      {
        id: "1",
        content: "Need to update the wayfinding system for Block A",
        type: "general",
        createdAt: new Date("2024-01-15"),
      },
      {
        id: "2",
        content:  "The interface is shit",
        type: "general",
        createdAt: new Date("2024-01-14"),
      },
      {
        id: "3",
        content: "Request for additional access permissions",
        type: "personnel",
        personnelId: "personnel_1",
        personnelName: "John Daniel",
        createdAt: new Date("2024-01-13"),
      },
      {
        id: "4", 
        content: "my eyes are blind after seeing this interface what a piec",
        type: "general",
        createdAt: new Date("2025-04-23"),
      }
    ]
    setComments(sampleComments)
    setIsLoading(false)
  }, [])

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this comment? This action cannot be undone.")) {
      setComments((prev) => prev.filter((comment) => comment.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bronze mx-auto mb-4"></div>
            <p className="text-deep-forest">Loading comments...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="text-red-800 font-medium mb-2">Error Loading Data</h3>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Header */}
      {!isLoading && (
        <>
          <div className="flex items-center justify-between">
            <div className="pl-1">
              <h2 className="text-2xl font-bold text-deep-forest">
                COMMENTS MANAGEMENT
              </h2>
              <p className="text-sm text-bronze mt-1">Manage general and personnel-specific comments</p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-alabaster border border-deep-forest/20 shadow-lg">
              <TabsTrigger 
                value="general" 
                className="flex items-center gap-2 transition-all duration-300 hover:bg-bronze hover:text-white data-[state=active]:bg-bronze data-[state=active]:text-alabaster rounded-none"
              >
                General Comments
              </TabsTrigger>
              <TabsTrigger 
                value="personnel" 
                className="flex items-center gap-2 transition-all duration-300 hover:bg-bronze hover:text-alabaster data-[state=active]:bg-bronze data-[state=active]:text-alabaster rounded-none"
              >
                Personnel Comments
              </TabsTrigger>
            </TabsList>

            {/* Search and Filters - Only show for personnel comments */}
            {activeTab === "personnel" && (
              <Card className="bg-alabaster border border-deep-forest/20 shadow-lg">
                <CardContent className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bronze w-4 h-4" />
                    <Input
                      placeholder="Search personnel comments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full bg-white border-deep-forest/30 text-deep-forest placeholder:text-deep-forest/60 focus:border-bronze focus:ring-bronze/20"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Search for general comments - simplified */}
            {activeTab === "general" && (
              <Card className="bg-alabaster border border-deep-forest/20 shadow-lg">
                <CardContent className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bronze w-4 h-4" />
                    <Input
                      placeholder="Search general comments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full bg-white border-deep-forest/30 text-deep-forest placeholder:text-deep-forest/60 focus:border-bronze focus:ring-bronze/20"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </Tabs>
        </>
      )}
    </div>
  )
}
