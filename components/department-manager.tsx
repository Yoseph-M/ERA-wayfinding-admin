"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Save, X, MapPin, Phone, Mail, User, Map, ImageIcon, Trash2, Search, AlertTriangle } from "lucide-react"
import { FiGrid } from "react-icons/fi"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"

type Language = "en" | "am"

import { ConfirmDialog } from "@/components/ui/confirm-dialog"


interface Department {
  id: string
  name: string // maps to department
  departmentamh?: string // maps to departmentamh
  floor: string
  officeNumber: string // maps to officeno
  building: string // maps to block
  decat?: string
  wcontact?: string
  wid?: string
  wname?: string
  wnameamh?: string
  wtitle?: string
  wtitleamh?: string
  language?: string
  fields?: { [key: string]: string }
}

export default function DepartmentManager() {
  const router = useRouter()
  const [currentLang, setCurrentLang] = useState<Language>("en")
  const [editLanguages, setEditLanguages] = useState<Record<string, Language>>({})
  const [metadataLanguages, setMetadataLanguages] = useState<Record<string, Language>>({})
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for dropdown options
  const [blockOptions, setBlockOptions] = useState<string[]>([])
  const [floorOptions, setFloorOptions] = useState<string[]>([])
  const [officeOptions, setOfficeOptions] = useState<string[]>([])

  async function fetchDepartments() { // Moved here
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/era_data`)
      if (!res.ok) throw new Error('Failed to fetch departments')
      const data = await res.json()
      
      // Map database rows to Department objects
      const departments = data.map((row: any) => ({
        id: row.id.toString(), // Ensure id is string for consistency
        name: row.department || '',
        departmentamh: row.departmentamh || '',
        floor: row.floor ? row.floor.toString() : '',
        officeNumber: row.officeno ? row.officeno.toString() : '',
        building: row.block || '',
        decat: row.decat || '',
        wcontact: row.wcontact || '',
        wid: row.wid || '',
        wname: row.wname || '',
        wnameamh: row.wnameamh || '',
        wtitle: row.wtitle || '',
        wtitleamh: row.wtitleamh || '',
      }))

      departments.sort((a, b) => {
        const nameA = a.name?.toLowerCase() || "";
        const nameB = b.name?.toLowerCase() || "";
        return nameA.localeCompare(nameB);
      });

      setDepartments(departments)

      // Extract unique options for dropdowns and sort them
      // Block: sort alphabetically
      const blockSet = new Set(data.map((row: any) => (row.block || '').toString()).filter((v: string) => v.trim() !== '') as string[])
      const blockArr = Array.from(blockSet).sort((a: string, b: string) => a.localeCompare(b))
      setBlockOptions(blockArr)

      // Floor: sort numerically ascending
      const floorSet = new Set(data.map((row: any) => (row.floor || '').toString()).filter((v: string) => v.trim() !== '') as string[])
      const floorArr = Array.from(floorSet).sort((a: string, b: string) => {
        const aNum = parseFloat(a)
        const bNum = parseFloat(b)
        if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum
        if (!isNaN(aNum)) return -1
        if (!isNaN(bNum)) return 1
        return a.localeCompare(b)
      })
      setFloorOptions(floorArr)

      // Office: sort numerically ascending
      const officeSet = new Set(data.map((row: any) => (row.officeno || '').toString()).filter((v: string) => v.trim() !== '') as string[])
      const officeArr = Array.from(officeSet).sort((a: string, b: string) => {
        const aNum = parseFloat(a)
        const bNum = parseFloat(b)
        if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum
        if (!isNaN(aNum)) return -1
        if (!isNaN(bNum)) return 1
        return a.localeCompare(b)
      })
      setOfficeOptions(officeArr)
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      console.error('Error fetching departments:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem('isAuthenticated') !== 'true') {
      router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }
    fetchDepartments() // Call it here
  }, [])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Department>>({})
  const [originalDepartmentName, setOriginalDepartmentName] = useState<string | null>(null)
  const [newDepartment, setNewDepartment] = useState<Partial<Department>>({
    name: "",
    floor: "",
    officeNumber: "",
    building: "",
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState({
    name: "",
    building: "",
    floor: "",
    officeNumber: ""
  })
  const [addRecordFormFor, setAddRecordFormFor] = useState<string | null>(null)
  const [addRecordForm, setAddRecordForm] = useState({
    name: "",
    building: "",
    floor: "",
    officeNumber: ""
  })
  const [showAddField, setShowAddField] = useState<string | null>(null)
  const [fieldKey, setFieldKey] = useState("")
  const [fieldValue, setFieldValue] = useState("")
  const [showMetadataSection, setShowMetadataSection] = useState(false)
  const [metadataVisible, setMetadataVisible] = useState<Record<string, boolean>>({});
  
  // Dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    variant?: "default" | "destructive"
    confirmText?: string
    cancelText?: string
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    variant: "default"
  })


  const iconOptions = ["building", "users", "monitor", "dollar-sign", "phone", "mail", "settings", "shield"]

  // Filter departments based on search term
  const filteredDepartments = useMemo(() => departments.filter((dept) => {
    // Filter out departments with empty or null name
    if (!dept.name || dept.name.trim() === '') {
      return false;
    }

    const matchesSearch =
      debouncedSearchTerm === "" ||
      dept.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      dept.building.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      dept.floor.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      dept.officeNumber.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    
    const matchesBuilding = departmentFilter === "all" || dept.name === departmentFilter
    
    return matchesSearch && matchesBuilding
  }), [departments, debouncedSearchTerm, departmentFilter])

  const handleEdit = (dept: Department) => {
    setEditingId(dept.id)
    setEditForm({ ...dept })
    setOriginalDepartmentName(dept.name) // Set original name when editing starts
    setEditLanguages(prev => ({ ...prev, [dept.id]: "en" })) // Initialize language for this record
  }

  // UPDATE
  const handleSave = async (id: string) => {
    if (!(editForm.name?.toString() || '').trim() || !(editForm.building?.toString() || '').trim() || !(editForm.floor?.toString() || '').trim() || !(editForm.officeNumber?.toString() || '').trim()) {
      setConfirmDialog({
        isOpen: true,
        title: "Missing Information",
        message: "Please fill in all required fields (Department Name, Block, Floor, Office Number) before saving.",
        variant: "default",
        confirmText: "OK",
        onConfirm: () => setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: () => {} }),
        onCancel: () => setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: () => {} })
      })
      return
    }
    setConfirmDialog({
      isOpen: true,
      title: "Save Changes",
      message: "Are you sure you want to save the changes to this department?",
      variant: "default",
      confirmText: "Save",
      cancelText: "Discard",
      onConfirm: async () => {
        try {
          // Only send flat fields to the backend
          const updatePayload = {
            id: id,
            oldDepartment: originalDepartmentName,
            newDepartment: editForm.name,
            newDepartmentAmh: editForm.departmentamh,
            floor: editForm.floor,
            officeNumber: editForm.officeNumber,
            building: editForm.building,
          };
          console.log("Attempting to save department:");
          console.log("originalDepartmentName:", originalDepartmentName);
          console.log("newDepartment (editForm.name):", editForm.name);
          console.log("newDepartmentAmh (editForm.departmentamh):", editForm.departmentamh);
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/departments`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatePayload)
          })
          if (!res.ok) {
            const errorData = await res.json(); // Parse the error response
            throw new Error(errorData.error || 'Failed to update department'); // Use backend error or generic
          }
          setEditingId(null)
          setEditForm({})
          setOriginalDepartmentName(null) // Clear original name after save
          setEditLanguages(prev => {
            const newState = { ...prev }
            delete newState[id as string]
            return newState
          })
          setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: () => {} })
          fetchDepartments()
        } catch (err: any) {
          console.error('Frontend Error updating department:', err);
          alert(`Error updating department: ${err.message}`)
        }
      }
    })
  }

  const handleCancel = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Cancel Editing",
      message: "Are you sure you want to cancel editing this department? This action cannot be undone.",
      variant: "default",
      confirmText: "Cancel",
      cancelText: "Discard",
      onConfirm: () => {
        setEditingId(null)
        setEditForm({})
        // Clean up language state for the current editing record
        if (editingId) {
          setEditLanguages(prev => {
            const newState = { ...prev }
            delete newState[editingId as string]
            return newState
          })
        }
        setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: () => {} })
      }
    })
  }

  // CREATE
  const handleAddDepartment = () => {
    if (!(newDepartment.name?.toString() || '').trim() || !(newDepartment.building?.toString() || '').trim() || !(newDepartment.floor?.toString() || '').trim() || !(newDepartment.officeNumber?.toString() || '').trim()) {
      setConfirmDialog({
        isOpen: true,
        title: "Missing Information",
        message: "Please fill in all required fields (Department Name, Block, Floor, Office Number) before adding.",
        variant: "default",
        confirmText: "OK",
        onConfirm: () => setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: () => {} }),
        onCancel: () => setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: () => {} })
      })
      return
    }
    setConfirmDialog({
      isOpen: true,
      title: "Add New Department",
      message: "Are you sure you want to add this department to the system?",
      variant: "default",
      confirmText: "Add Department",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          const payload = {
            department: newDepartment.name,
            departmentamh: newDepartment.departmentamh,
            floor: newDepartment.floor,
            officeNumber: newDepartment.officeNumber,
            building: newDepartment.building,
          };
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/departments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to add department');
          }
          setNewDepartment({ name: "", floor: "", officeNumber: "", building: "" })
          setShowAddForm(false);
          setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: () => {} })
          fetchDepartments()
        } catch (err: any) {
          alert(`Error adding department: ${err instanceof Error ? err.message : 'Unknown error'}`)
          setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: () => {} })
        }
      }
    })
  }

  const handleCancelAdd = () => {
    const isDirty = newDepartment.name || newDepartment.building || newDepartment.floor || newDepartment.officeNumber;
    if (isDirty) {
        setConfirmDialog({
            isOpen: true,
            title: "Discard Changes",
            message: "You have unsaved changes. Are you sure you want to discard them?",
            variant: "destructive",
            confirmText: "Discard",
            cancelText: "Keep Editing",
            onConfirm: () => {
                setShowAddForm(false);
                setNewDepartment({ name: "", building: "", floor: "", officeNumber: "" });
                setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: () => {} });
            }
        });
    } else {
        setShowAddForm(false);
        setNewDepartment({ name: "", building: "", floor: "", officeNumber: "" });
    }
  };

  // DELETE
  const handleDelete = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Department",
      message: "Are you sure you want to delete this department? This action cannot be undone.",
      variant: "destructive",
      confirmText: "Delete",
      cancelText: "Discard",
      onConfirm: async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/departments`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
          })
          if (!res.ok && res.status !== 204) throw new Error('Failed to delete department')
          setEditingId(null)
          setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: () => {} })
          fetchDepartments()
        } catch (err: any) {
          alert('Error deleting department')
        }
      }
    })
  }

  const handleAddRecord = () => {
    const id = Date.now().toString()
    const newDepartment: Department = {
      id,
      name: editForm.name || "New Department",
      floor: editForm.floor || "",
      officeNumber: editForm.officeNumber || "",
      building: editForm.building || "",
    }
    setDepartments((prev) => [...prev, newDepartment])
    setEditingId(null)
    setEditForm({})
  }

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bronze mx-auto mb-4"></div>
            <p className="text-deep-forest">Loading departments...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="text-red-800 font-medium mb-2">Error Loading Data</h3>
          <p className="text-red-600 text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-red-600 hover:text-red-800 underline text-sm"
          >
            Try again
          </button>
        </div>
      )}

      {/* Main Content: Only show if not loading and not error */}
      {!isLoading && !error && (
        <>
          {/* Header with title and add button aligned */}
          <div className="flex items-center justify-between">
            <div className="pl-1">
              <h2 className="text-2xl font-bold text-deep-forest">
                DEPARTMENT MANAGEMENT
              </h2>
              <p className="text-sm text-bronze mt-1">Manage departments and organizational structure</p>
            </div>
            {!showAddForm && (
              <Button 
                onClick={() => setShowAddForm(true)} 
                className="bg-bronze hover:bg-bronze/90 text-white shadow-lg px-6 py-2 font-medium border border-bronze/20 transition-all duration-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                ADD DEPARTMENT
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {/* Search and Filters */}
            {!showAddForm && (
              <Card className="bg-alabaster backdrop-blur-xl border border-deep-forest/20 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bronze w-4 h-4" />
                      <Input
                        placeholder="Search departments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full bg-white border-deep-forest/30 text-deep-forest placeholder:text-deep-forest/60 focus:border-bronze focus:ring-bronze/20"
                      />
                    </div>
                    <div className="w-80">
                      <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                        <SelectTrigger 
                          className="bg-white border-deep-forest/30 text-deep-forest focus:border-bronze focus:ring-bronze/20"
                        >
                          <SelectValue placeholder="Filter by department" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-deep-forest/20">
                          {Array.from(new Set(departments.map(dept => dept.name).filter(name => name && name.trim() !== "")))
                            .sort((a, b) => {
                              // Try to sort Department A, Department B, ... before others
                              const depPattern = /^department\s*([a-z])/i
                              const aMatch = a.match(depPattern)
                              const bMatch = b.match(depPattern)
                              if (aMatch && bMatch) {
                                return aMatch[1].localeCompare(bMatch[1])
                              } else if (aMatch) {
                                return -1
                              } else if (bMatch) {
                                return 1
                              }
                              return a.localeCompare(b)
                            })
                            .map((department) => (
                              <SelectItem key={department} value={department} className="text-deep-forest hover:bg-bronze/10">
                                {department}
                              </SelectItem>
                            ))}
                          <SelectItem value="all" className="text-deep-forest hover:bg-bronze/10">ALL DEPARTMENTS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Add Department Form */}
            {showAddForm && (
              <Card className="mb-4 bg-alabaster border border-deep-forest/20">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                      <Image 
                        src="/era-logo.png" 
                        alt="ERA Logo" 
                        width={32} 
                        height={32} 
                        className="object-contain" 
                      />
                    </div>
                    <CardTitle className="text-deep-forest">Add New Department</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Department Information */}
                  <div className="bg-alabaster/50 rounded-lg p-4 border border-deep-forest">
                    <h4 className="text-lg font-semibold text-deep-forest mb-4">
                      Department Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-6">
                        <Label className="text-deep-forest font-medium">Department Name</Label>
                        <Input
                          value={newDepartment.name}
                          onChange={e => setNewDepartment(f => ({ ...f, name: e.target.value }))}
                          placeholder="Enter department name"
                          className="bg-white border-deep-forest/30 focus:border-bronze focus:ring-bronze/20 mt-1"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-deep-forest font-medium">Block</Label>
                        <Select
                          value={newDepartment.building}
                          onValueChange={val => setNewDepartment(f => ({ ...f, building: val }))}
                        >
                          <SelectTrigger className="border-deep-forest/30 focus:border-bronze focus:ring-bronze/20 mt-1 bg-white text-deep-forest">
                            <SelectValue placeholder="Select block" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-deep-forest/20">
                            {blockOptions.map(block => (
                              <SelectItem key={block} value={block} className="text-deep-forest hover:bg-bronze/10">{block}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-deep-forest font-medium">Floor</Label>
                        <Select
                          value={newDepartment.floor}
                          onValueChange={val => setNewDepartment(f => ({ ...f, floor: val }))}
                        >
                          <SelectTrigger className="border-deep-forest/30 focus:border-bronze focus:ring-bronze/20 mt-1 bg-white text-deep-forest">
                            <SelectValue placeholder="Select floor" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-deep-forest/20">
                            {floorOptions.map(floor => (
                              <SelectItem key={floor} value={floor} className="text-deep-forest hover:bg-bronze/10">{floor}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-deep-forest font-medium">Office Number</Label>
                        <Select
                          value={newDepartment.officeNumber}
                          onValueChange={val => setNewDepartment(f => ({ ...f, officeNumber: val }))}
                        >
                          <SelectTrigger className="border-deep-forest/30 focus:border-bronze focus:ring-bronze/20 mt-1 bg-white text-deep-forest">
                            <SelectValue placeholder="Select office number" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-deep-forest/20">
                            {officeOptions.map(office => (
                              <SelectItem key={office} value={office} className="text-deep-forest hover:bg-bronze/10">{office}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    <Button onClick={handleAddDepartment} className="bg-bronze hover:bg-bronze/90 text-white">
                      <Save className="w-4 h-4 mr-2" />
                      Add Department
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-deep-forest/30 text-deep-forest hover:bg-deep-forest hover:text-alabaster min-w-[160px]"
                      onClick={handleCancelAdd}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Department List */}
            {filteredDepartments.map((dept) => (
              <Card key={dept.id} className="bg-alabaster backdrop-blur-xl border border-deep-forest/20 hover:border-2 hover:border-[#EF842D] transition-colors min-h-[120px] shadow-lg">
                <div className="flex items-center justify-between h-full">
                  <div className="flex-1">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                            <Image 
                              src="/era-logo.png" 
                              alt="ERA Logo" 
                              width={32} 
                              height={32} 
                              className="object-contain" 
                            />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-deep-forest font-semibold">{dept.name}</CardTitle>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {editingId === dept.id ? (
                          <div className="space-y-6">
                            {/* Department Information Section */}
                            {showAddField !== dept.id && (
                              <div className="bg-alabaster/50 rounded-lg p-4 border border-deep-forest">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="text-lg font-semibold text-deep-forest">
                                    Department Information
                                  </h4>
                                  <Select 
                                    value={editLanguages[dept.id] || "en"} 
                                    onValueChange={(value: Language) => setEditLanguages(prev => ({ ...prev, [dept.id]: value }))}
                                  >
                                    <SelectTrigger 
                                      className="w-[120px] bg-white border-deep-forest/30 text-deep-forest focus:border-bronze focus:ring-bronze/20"
                                    >
                                      <SelectValue placeholder="Language" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-deep-forest/20">
                                      <SelectItem value="en" className="text-deep-forest hover:bg-bronze/10">ENGLISH</SelectItem>
                                      <SelectItem value="am" className="text-deep-forest hover:bg-bronze/10">AMHARIC</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                  <div className="md:col-span-6">
                                    <Label className="text-deep-forest font-medium">Department Name</Label>
                                    <Input
                                      value={editForm.name ?? ''}
                                      onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                      placeholder="Enter department name"
                                      className="bg-white mt-1 border-deep-forest/30 focus:border-bronze focus:ring-bronze/20"
                                    />
                                  </div>
                                  <div className="md:col-span-2">
                                    <Label className="text-deep-forest font-medium">Block</Label>
                                    <Select
                                      value={editForm.building ?? ''}
                                      onValueChange={val => setEditForm(prev => ({ ...prev, building: val }))}
                                    >
                                      <SelectTrigger className="mt-1 border-deep-forest/30 focus:border-bronze focus:ring-bronze/20 bg-white text-deep-forest">
                                        <SelectValue placeholder="Select block" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-white border-deep-forest/20">
                                        {blockOptions.map(block => (
                                          <SelectItem key={block} value={block} className="text-deep-forest hover:bg-bronze/10">{block}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="md:col-span-2">
                                    <Label className="text-deep-forest font-medium">Floor</Label>
                                    <Select
                                      value={editForm.floor ?? ''}
                                      onValueChange={val => setEditForm(prev => ({ ...prev, floor: val }))}
                                    >
                                      <SelectTrigger className="mt-1 border-deep-forest/30 focus:border-bronze focus:ring-bronze/20 bg-white text-deep-forest">
                                        <SelectValue placeholder="Select floor" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-white border-deep-forest/20">
                                        {floorOptions.map(floor => (
                                          <SelectItem key={floor} value={floor} className="text-deep-forest hover:bg-bronze/10">{floor}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="md:col-span-2">
                                    <Label className="text-deep-forest font-medium">Office Number</Label>
                                    <Select
                                      value={editForm.officeNumber ?? ''}
                                      onValueChange={val => setEditForm(prev => ({ ...prev, officeNumber: val }))}
                                    >
                                      <SelectTrigger className="mt-1 border-deep-forest/30 focus:border-bronze focus:ring-bronze/20 bg-white text-deep-forest">
                                        <SelectValue placeholder="Select office number" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-white border-deep-forest/20">
                                        {officeOptions.map(office => (
                                          <SelectItem key={office} value={office} className="text-deep-forest hover:bg-bronze/10">{office}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Metadata Fields Section */}
                            {showAddField !== dept.id && metadataVisible[dept.id] && (
                              <Card className="bg-white/90 border border-bronze/20 shadow-lg">
                                <CardHeader>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-bronze/10">
                                        <Map className="w-5 h-5 text-bronze" />
                                      </div>
                                      <CardTitle className="text-deep-forest">Additional Metadata</CardTitle>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  {/* Existing data Fields */}
                                  {editForm.fields && Object.entries(editForm.fields).length > 0 && (
                                    <div className="mb-4">
                                      <h5 className="text-sm font-medium text-deep-forest mb-2">Current Metadata Fields:</h5>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {Object.entries(editForm.fields).map(([key, value]) => (
                                          <div key={key} className="flex items-center gap-2 p-2 bg-alabaster/50 rounded border border-deep-forest/10">
                                            <span className="text-xs font-medium text-bronze bg-bronze/10 px-2 py-1 rounded">{key}</span>
                                            <span className="text-sm text-deep-forest flex-1">{value}</span>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => {
                                                const newFields = { ...editForm.fields }
                                                delete newFields[key]
                                                setEditForm(prev => ({ ...prev, fields: newFields }))
                                                if (Object.keys(newFields).length === 0) {
                                                  setMetadataVisible(prev => ({ ...prev, [dept.id]: false }));
                                                }
                                              }}
                                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                              <X className="w-3 h-3" />
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            )}



                            {/* Action Buttons - Only show when not adding metadata */}
                            {showAddField !== dept.id && (
                              <div className="flex flex-col sm:flex-row gap-2 mt-6 sm:justify-end">
                                  <Button
                                    type="button"
                                    className="bg-bronze hover:bg-bronze/90 text-white"
                                    onClick={() => handleSave(dept.id)}
                                  >
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Department Info
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="border-deep-forest/30 text-deep-forest hover:bg-deep-forest hover:text-alabaster min-w-[160px]"
                                    onClick={handleCancel}
                                  >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                  </Button>
                              </div>
                            )}

                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-bronze" />
                                <span className="text-sm text-deep-forest">
                                  {dept.building ? `Block ${dept.building}` : ''}
                                  {dept.floor ? `${dept.building ? ', ' : ''}Floor ${dept.floor}` : ''}
                                  {dept.officeNumber ? `${dept.building || dept.floor ? ', ' : ''}Room ${dept.officeNumber}` : ''}
                                </span>
                              </div>
                              {/* Show all custom fields for this department in view mode */}
                              {dept.fields && Object.entries(dept.fields).map(([key, value]) => (
                                <div key={key} className="flex items-center gap-2">
                                  <span className="font-medium text-bronze">{key}:</span> <span className="text-deep-forest">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </div>
                  <div className="flex items-center justify-center h-full px-6">
                    {editingId !== dept.id && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(dept)}
                          className="bg-deep-forest hover:bg-deep-forest/90 text-white border border-deep-forest/20 shadow-lg transition-all duration-300 mr-2"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(dept.id)}
                          className="text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Custom Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: () => {} })}
        variant={confirmDialog.variant}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
      />
    </div>
  )
}