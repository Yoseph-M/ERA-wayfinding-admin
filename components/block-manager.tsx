"use client"

import { useState, useEffect } from "react"
import Papa from "papaparse"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Save, X, Building, Trash2, ChevronDown, ChevronRight, FileText } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

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

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem('isAuthenticated') !== 'true') {
      router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    async function fetchBlocks() {
      try {
        const res = await fetch('/api/departments')
        if (!res.ok) throw new Error('Failed to fetch CSV')
        const csvText = await res.text()
        const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true })
        // Group departments by block
        const blockMap: { [block: string]: Block } = {}
        parsed.data.forEach((row: any, idx: number) => {
          const blockName = row.block || row.building || 'Unknown Block'
          if (!blockMap[blockName]) {
            blockMap[blockName] = {
              id: blockName,
              name: blockName,
              description: '',
              departments: [],
            }
          }
          blockMap[blockName].departments.push({
            id: row.id || (idx + 1).toString(),
            name: row.department || row.name || '',
            building: blockName,
            floor: row.floor || '',
            officeNumber: row.officeno || row.officeNumber || '',
          })
        })
        setBlocks(Object.values(blockMap))
      } catch (err) {
        console.error('Error fetching blocks:', err)
      }
    }
    fetchBlocks()
  }, [])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Block>>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [showDepartments, setShowDepartments] = useState<string | null>(null)
  const [showAddField, setShowAddField] = useState<string | null>(null)
  const [fieldKey, setFieldKey] = useState("")
  const [fieldValue, setFieldValue] = useState("")
  const [newBlock, setNewBlock] = useState<Partial<Block>>({
    name: "",
    description: "",
    departments: [],
  })

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

  const handleEdit = (block: Block) => {
    setEditingId(block.id)
    setEditForm({ ...block })
  }

  const handleSave = (id: string) => {
    setBlocks((prev) => prev.map((blk) => (blk.id === id ? { ...blk, ...editForm } : blk)))
    setEditingId(null)
    setEditForm({})
  }

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel?")) {
    setEditingId(null)
    setEditForm({})
    }
  }

  const handleAddBlock = () => {
    const id = Date.now().toString()
    setBlocks((prev) => [...prev, { ...newBlock, id } as Block])
    setNewBlock({
      name: "",
      description: "",
      departments: [],
    })
    setShowAddForm(false)
  }

  const removeDepartmentFromBlock = (blockId: string, deptId: string) => {
    setBlocks((prev) =>
      prev.map((blk) =>
        blk.id === blockId ? { ...blk, departments: blk.departments.filter((d) => d.id !== deptId) } : blk,
      ),
    )
  }

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
        {!showAddForm && (
          <Button 
            onClick={() => setShowAddForm(!showAddForm)} 
            className="bg-bronze hover:bg-bronze/90 text-white shadow-lg px-6 py-2 font-medium border border-bronze/20 transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Block
          </Button>
        )}
      </div>

      {/* Add New Block Form */}
      {showAddForm && (
        <Card className="bg-alabaster border border-deep-forest/20">
          <CardHeader>
            <CardTitle className="text-deep-forest">Add New Block</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-name" className="mb-2 text-deep-forest">Block Name</Label>
                <Input
                  id="new-name"
                  value={newBlock.name || ""}
                  onChange={(e) => setNewBlock((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter block name"
                  className="bg-white border-deep-forest/30 focus:border-bronze focus:ring-bronze/20 mt-1"
                />
              </div>
              <div>
                <Label className="text-deep-forest">Add Department</Label>
                <Select
                  value={newBlock.departments && newBlock.departments.length > 0 ? newBlock.departments[0].id : ""}
                  onValueChange={(deptId) => {
                    const dept = availableDepartments.find((d) => d.id === deptId)
                    if (dept) {
                      setNewBlock((prev) => ({
                        ...prev,
                        departments: [dept],
                      }))
                    }
                  }}
                >
                  <SelectTrigger className="bg-white border-deep-forest/30 text-deep-forest focus:border-bronze focus:ring-bronze/20 mt-1">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-deep-forest/20">
                    {availableDepartments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id} className="text-deep-forest hover:bg-bronze/10">
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button onClick={handleAddBlock} className="bg-bronze hover:bg-bronze/90 text-white min-w-[160px]">
                <Save className="w-4 h-4 mr-6" />
                Add Block
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-deep-forest/30 text-deep-forest hover:bg-deep-forest hover:text-alabaster min-w-[160px]"
                onClick={() => {
                  setShowAddForm(false);
                  setNewBlock({ name: "", description: "", departments: [] });
                }}
              >
                <X className="w-4 h-4 mr-6" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Blocks List */}
      <div className="space-y-4">
        {blocks
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((block) => (
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
                    <CardTitle className="text-lg text-deep-forest">{block.name}</CardTitle>
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
                  <div className="space-y-4">
                    {/* Only show Add Data Field card if showAddField === block.id */}
                    {showAddField === block.id ? (
                      <Card className="mb-4">
                        <CardHeader>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-bronze/20">
                              <Plus className="w-5 h-5 text-bronze" />
                            </div>
                            <CardTitle className="text-deep-forest">Add New Data Field</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-deep-forest font-medium">Data Type</Label>
                              <Select value={fieldKey} onValueChange={setFieldKey}>
                                <SelectTrigger className="mt-1 bg-white border-deep-forest/30 text-deep-forest focus:border-bronze focus:ring-bronze/20">
                                  <SelectValue placeholder="Select or enter data type" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-deep-forest/20">
                                  <SelectItem value="Phone" className="text-deep-forest hover:bg-bronze/10">Phone</SelectItem>
                                  <SelectItem value="Email" className="text-deep-forest hover:bg-bronze/10">Email</SelectItem>
                                  <SelectItem value="Website" className="text-deep-forest hover:bg-bronze/10">Website</SelectItem>
                                  <SelectItem value="Manager" className="text-deep-forest hover:bg-bronze/10">Manager</SelectItem>
                                  <SelectItem value="Capacity" className="text-deep-forest hover:bg-bronze/10">Capacity</SelectItem>
                                  <SelectItem value="custom" className="text-deep-forest hover:bg-bronze/10">Others</SelectItem>
                                </SelectContent>
                              </Select>
                              {fieldKey === "custom" && (
                                <Input
                                  value={fieldKey === "custom" ? "" : fieldKey}
                                  onChange={e => setFieldKey(e.target.value)}
                                  placeholder="Enter custom data type"
                                  className="mt-2 border-deep-forest/30 focus:border-bronze focus:ring-bronze/20"
                                />
                              )}
                            </div>
                            <div>
                              <Label className="text-deep-forest font-medium">Value</Label>
                              <Input
                                value={fieldValue}
                                onChange={e => setFieldValue(e.target.value)}
                                placeholder="Enter value"
                                className="mt-1 border-deep-forest/30 focus:border-bronze focus:ring-bronze/20"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button
                              type="button"
                              className="bg-deep-forest hover:bg-deep-forest/90 text-white min-w-[160px]"
                              onClick={() => {
                                const finalFieldKey = fieldKey === "custom" ? "" : fieldKey;
                                if (!finalFieldKey.trim() || !fieldValue.trim()) {
                                  alert("Please fill in both Data Type and Value fields before adding a data field.");
                                  return;
                                }
                                setEditForm((prev) => ({
                                  ...prev,
                                  fields: { ...prev.fields, [finalFieldKey]: fieldValue }
                                }));
                                setFieldKey("");
                                setFieldValue("");
                                setShowAddField(null);
                              }}
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Add Data Field
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="border-deep-forest/30 text-deep-forest hover:bg-deep-forest hover:text-alabaster min-w-[160px]"
                              onClick={() => {
                                setFieldKey("");
                                setFieldValue("");
                                setShowAddField(null);
                              }}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Block Name</Label>
                        <Input
                          value={editForm.name || ""}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter block name"
                          className="bg-white mt-1 border-deep-forest/30 text-deep-forest focus:border-bronze focus:ring-bronze/20"
                        />
                      </div>
                      <div>
                        <Label>Add Department</Label>
                        <Select
                          value={editForm.departments && editForm.departments.length > 0 ? editForm.departments[0].id : ""}
                          onValueChange={(deptId) => {
                            const dept = availableDepartments.find((d) => d.id === deptId)
                            if (dept) {
                              setEditForm((prev) => ({
                                ...prev,
                                departments: [dept],
                              }))
                            }
                          }}
                        >
                          <SelectTrigger className="bg-white border-deep-forest/30 text-deep-forest focus:border-bronze focus:ring-bronze/20 mt-1">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-deep-forest/20">
                            {availableDepartments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id} className="text-deep-forest hover:bg-bronze/10">
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                      {/* Show all custom fields for this block */}
                      {editForm.fields && Object.entries(editForm.fields).map(([key, value]) => (
                        <div key={key} className="col-span-1">
                          <Label>{key}</Label>
                          <div className="flex gap-2 items-center">
                            <Input
                              value={value}
                              onChange={e => setEditForm((prev) => ({
                                ...prev,
                                fields: { ...prev.fields, [key]: e.target.value }
                              }))}
                            />
                          </div>
                        </div>
                      ))}
                    <div>
                      {/* Department text field removed as requested */}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 mt-6 sm:justify-between">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleSave(block.id)}
                            className="bg-bronze hover:bg-bronze/90 text-white min-w-[160px]"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save Block Info
                          </Button>
                          <Button
                            type="button"
                            className="bg-deep-forest hover:bg-deep-forest/90 text-white min-w-[160px]"
                            onClick={() => setShowAddField(block.id)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Data Field
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={handleCancel}
                            className="border-deep-forest/30 text-deep-forest hover:bg-deep-forest hover:text-alabaster min-w-[160px]"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                          <Button 
                            variant="destructive" 
                            className="text-white min-w-[160px]" 
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this block? This action cannot be undone.")) {
                                setBlocks((prev) => prev.filter((b) => b.id !== block.id))
                                setEditingId(null)
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Block
                          </Button>
                        </div>
                      </div>
                      </>
                    )}
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
              <div className="flex items-center justify-center h-full px-6">
                {editingId !== block.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newEditingId = editingId === block.id ? null : block.id
                      setEditingId(newEditingId)
                    }}
                    className="bg-deep-forest hover:bg-deep-forest/90 text-white border border-deep-forest/20 shadow-lg transition-all duration-300"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            {showDepartments === block.id && (
                <div className="px-6 pb-4">
                  <Separator className="mb-3" style={{ backgroundColor: '#EF842D' }} />
                    <div>
                      <Label className="text-sm font-medium">Departments in this Block:</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                        {block.departments.length > 0 ? (
                          block.departments
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map((dept) => (
                            <div key={dept.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                              <Building className="w-4 h-4 text-[#EF842D]" />
                              <div>
                                <span className="font-medium text-sm">{dept.name}</span>
                                <p className="text-xs text-gray-600">
                                  {dept.building}, {dept.floor}, Office {dept.officeNumber}
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
