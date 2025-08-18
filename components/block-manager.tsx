"use client"

import { useState, useEffect, useMemo } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Save, X, Building, ChevronDown, ChevronRight, FileText, Search, Trash2, Plus } from "lucide-react"
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
  const [newDeptName, setNewDeptName] = useState('')
  const [availableDepartments, setAvailableDepartments] = useState<Array<{id: string, name: string}>>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  async function fetchBlocks() {
    try {
      setIsLoading(true)
      setError(null)
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
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      console.error('Error fetching blocks:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem('isAuthenticated') !== 'true') {
      router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    fetchBlocks()
    
    // Fetch available departments
    const fetchAvailableDepartments = async () => {
      try {
        const res = await fetch('/api/departments/available')
        if (res.ok) {
          const data = await res.json()
          setAvailableDepartments(data)
        }
      } catch (error) {
        console.error('Error fetching available departments:', error)
      }
    }
    
    fetchAvailableDepartments()
  }, [])

  const handleEdit = (block: Block) => {
    setEditingId(block.id)
  }

  const handleCancel = () => {
    setEditingId(null)
    setNewDeptName('')
  }

  const handleClose = () => {
    setEditingId(null)
    setNewDeptName('')
  }

  const handleAddDepartment = async (blockId: string) => {
    if (!newDeptName.trim()) return
    
    try {
      const blockName = blocks.find(b => b.id === blockId)?.name || ''
      
      // First, check if the department exists
      const checkRes = await fetch(`/api/departments/check?name=${encodeURIComponent(newDeptName)}`)
      const { exists, id } = await checkRes.json()
      
      let res: Response
      
      if (exists && id) {
        // If department exists, update its block
        res = await fetch(`/api/departments/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ building: blockName })
        })
      } else {
        // If department doesn't exist, create it
        res = await fetch('/api/departments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            department: newDeptName,
            departmentamh: newDeptName, // Using same name for Amharic for now
            floor: '1', // Default floor
            officeNumber: '1', // Default office number
            building: blockName,
          }),
        })
      }
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to add/update department')
      }
      
      // Reset form and refresh data
      setNewDeptName('')
      fetchBlocks()
      alert(`Successfully ${exists ? 'updated' : 'added'} department`)
    } catch (err: any) {
      console.error('Error managing department:', err)
      alert(err.message || 'Failed to manage department')
    }
  }

  

  


  const [showDepartments, setShowDepartments] = useState<string | null>(null)

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
      {/* Loading State: Hide all other components when loading */}
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bronze mx-auto mb-4"></div>
            <p className="text-deep-forest">Loading blocks...</p>
          </div>
        </div>
      ) : (
        <>
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

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="text-red-800 font-medium mb-2">Error Loading Data</h3>
              <p className="text-red-600 text-sm">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 px-4 py-2 bg-bronze text-white rounded shadow"
              >
                Reload
              </button>
            </div>
          )}

          {/* Blocks List: Only show if not error */}
          {!error && (
            <div className="space-y-4">
              {sortedBlocks.map((block) => (
                <Card key={block.id} className="bg-alabaster border border-deep-forest/20 hover:border-2 hover:border-[#EF842D] transition-colors min-h-[96px] shadow-lg">
                  <div>
                    <div className="flex-1">
                      <CardHeader className="pb-3">
                        <div className="flex items-center w-full min-h-[80px] gap-6">
                          {/* Block icon, name, and dropdown chevron aligned left */}
                          <div className="flex items-center gap-3 flex-1 ml-6">
                            <div className="w-8 h-8 flex items-center justify-center font-semibold text-lg text-bronze">
                              Block
                            </div>
                            {editingId === block.id ? (
                              <div className="text-lg font-medium text-deep-forest">
                                {block.name}
                              </div>
                            ) : (
                              <span className="text-lg text-deep-forest font-bold">{block.name}</span>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowDepartments(showDepartments === block.id ? null : block.id)}
                              className="p-1.5 text-bronze hover:[&>svg]:text-alabaster"
                            >
                              {showDepartments === block.id ? (
                                <ChevronDown className="w-7 h-7" />
                              ) : (
                                <ChevronRight className="w-6 h-6" />
                              )}
                            </Button>
                          </div>
                          {/* Department tag aligned right */}
                          <div className="flex-shrink-0 mr-6">
                            <Badge variant="outline" className="text-xs border-bronze/30 text-bronze">
                              {block.departments.length} departments
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {/* ...existing code... */}
                      </CardContent>
                    </div>
                    {/* ...existing code... */}
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
          )}
        </>
      )}
    </div>
  )
}
