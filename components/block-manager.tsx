"use client"

import { useState, useEffect, useMemo } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Save, X, Building, ChevronDown, ChevronRight, FileText, Search, Trash2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"

interface DepartmentLocation {
  id: string
  name: string
  building: string
  floor: string
  officeNumber: string
}

interface Block {
  id: string
  name: string
  description: string
  departments: DepartmentLocation[]
  fields?: { [key: string]: string }
}

export default function BlockManager() {
  const router = useRouter()
  const [blocks, setBlocks] = useState<Block[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Block>>({})

  async function fetchBlocks() {
    try {
      const res = await fetch('/api/departments')
      if (!res.ok) throw new Error('Failed to fetch departments')
      const data = await res.json()
      // Group departments by block
      const blockMap: { [block: string]: Block } = {}
      data.forEach((row: any) => {
        // Only include departments with a valid name
        if (!row.department) {
          return; // Skip this row if department name is null or empty
        }
        const blockName = row.block || row.building || 'Unknown Block'
        if (!blockMap[blockName]) {
          blockMap[blockName] = {
            id: blockName,
            name: blockName,
            description: '',
            departments: [],
            fields: {},
          }
        }
        blockMap[blockName].departments.push({
          id: row.id,
          name: row.department,
          building: row.building,
          floor: row.floor,
          officeNumber: row.officeno,
        })
      })
      setBlocks(Object.values(blockMap))
    } catch (err) {
      console.error('Error fetching blocks:', err)
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem('isAuthenticated') !== 'true') {
      router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    fetchBlocks()
  }, [])

  const handleEdit = (block: Block) => {
    setEditingId(block.id)
    setEditForm({ ...block })
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleSave = async (id: string) => {
    try {
      const res = await fetch(`/api/blocks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: id,
          name: editForm.name,
          description: editForm.description,
        }),
      })
      if (!res.ok) {
        throw new Error('Failed to update block')
      }
      setEditingId(null)
      setEditForm({})
      fetchBlocks()
    } catch (err) {
      console.error('Error updating block:', err)
    }
  }

  

  


  const [showDepartments, setShowDepartments] = useState<string | null>(null)

  // Departments fetched from CSV for use in add/edit forms
  const [availableDepartments, setAvailableDepartments] = useState<DepartmentLocation[]>([])

  // Extract all unique departments from CSV data after blocks are loaded
  useEffect(() => {
    // Flatten all departments from all blocks
    const allDepts: DepartmentLocation[] = []
    blocks.forEach((block) => {
      block.departments.forEach((dept) => {
        // Avoid duplicates by id
        if (!allDepts.some((d) => d.id === dept.id)) {
          allDepts.push(dept)
        }
      })
    })
    setAvailableDepartments(allDepts)
  }, [blocks])







  const sortedBlocks = useMemo(() => blocks
    .filter(block => block != null && (debouncedSearchTerm === "" || block.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))) // Filter out null or undefined blocks and apply search
    .sort((a, b) => {
      const nameA = (a && a.name) ? a.name : '';
      const nameB = (b && b.name) ? b.name : '';
      return nameA.localeCompare(nameB);
    }), [blocks, debouncedSearchTerm]);

  return (
    <div className="space-y-6">
      {/* Header with title and add button aligned */}
      <div className="flex items-center justify-between">
        <div className="pl-1">
          <h2 className="text-2xl font-bold text-deep-forest">
            BLOCK MANAGEMENT
          </h2>
          <p className="text-sm text-bronze mt-1">Manage building blocks, departments, and locations</p>
        </div>
      </div>

      {/* Search Input */}
      <Card className="bg-alabaster backdrop-blur-xl border border-deep-forest/20 shadow-lg">
        <CardContent className="p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bronze w-4 h-4" />
            <Input
              placeholder="Search blocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full bg-white border-deep-forest/30 text-deep-forest placeholder:text-deep-forest/60 focus:border-bronze focus:ring-bronze/20"
            />
          </div>
        </CardContent>
      </Card>

      {/* Blocks List */}
      <div className="space-y-4">
        {sortedBlocks.map((block) => (
          <Card key={block.id} className="bg-alabaster border border-deep-forest/20 hover:border-2 hover:border-[#EF842D] transition-colors shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDepartments(showDepartments === block.id ? null : block.id)}
                      className="p-1 text-bronze hover:[&>svg]:text-alabaster"
                    >
                      {showDepartments === block.id ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                      <Image src="/era-logo.png" alt="ERA Logo" width={32} height={32} className="object-contain" />
                    </div>
                    <div>
                      {editingId === block.id ? (
                        <Input
                          value={editForm.name ?? ''}
                          onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          className="text-lg text-deep-forest"
                        />
                      ) : (
                        <CardTitle className="text-lg text-deep-forest">{block.name}</CardTitle>
                      )}
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs border-bronze/30 text-bronze">
                          {block.departments.length} departments
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {editingId === block.id ? (
                    <div className="space-y-3">
                      <Input
                        value={editForm.description ?? ''}
                        onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter block description"
                        className="text-sm"
                      />
                      <div className="flex gap-2 mt-2">
                        <Button onClick={() => handleSave(block.id)} size="sm">
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button onClick={handleCancel} size="sm" variant="outline">
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{block.description}</span>
                        </div>
                        {/* Show all custom fields for this block in view mode */}
                        {block.fields && Object.entries(block.fields).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2">
                            <span className="font-medium">{key}:</span> <span>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </div>
              {editingId !== block.id && (
                <div className="px-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(block)}
                    className="bg-deep-forest hover:bg-deep-forest/90 text-white border border-deep-forest/20 shadow-lg transition-all duration-300 mr-2"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
            {showDepartments === block.id && (
              <div className="px-6 pb-4">
                <Separator className="mb-3" style={{ backgroundColor: '#EF842D' }} />
                <div>
                  <Label className="text-sm font-medium">Departments in this Block:</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {block.departments.length > 0 ? (
                      block.departments
                        .filter(dept => dept != null) // Filter out null or undefined departments
                        .sort((a, b) => {
                          const nameA = a?.name || '';
                          const nameB = b?.name || '';
                          return nameA.localeCompare(nameB);
                        })
                        .map((dept) => (
                          <div key={dept.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                            <Building className="w-4 h-4 text-[#EF842D]" />
                            <div>
                              <span className="font-medium text-sm">{dept.name}</span>
                              <p className="text-xs text-gray-600">
                                <span className="text-bronze">Floor {dept.floor}, Office No. {dept.officeNumber}</span>
                              </p>
                            </div>
                          </div>
                        ))
                    ) : (
                      <p className="text-sm text-gray-500">No departments assigned to this block.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
