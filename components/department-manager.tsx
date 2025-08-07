"use client"

import { useState, useEffect } from "react"
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

type Language = "en" | "am"

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
}

function ConfirmDialog({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  variant = "default"
}: ConfirmDialogProps) {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when dialog is open
      document.body.style.overflow = 'hidden'
      
      // Focus trap for accessibility
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onCancel()
        } else if (e.key === 'Enter') {
          onConfirm()
        }
      }
      
      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen, onConfirm, onCancel])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ 
      position: 'fixed', 
      top: '-50px', 
      left: '-50px', 
      right: '-50px', 
      bottom: '-50px', 
      width: 'calc(100vw + 100px)', 
      height: 'calc(100vh + 100px)',
      minHeight: '100vh',
      zIndex: 9999
    }}>
      {/* Backdrop with simple overlay */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
        style={{ 
          position: 'absolute',
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          width: '100%', 
          height: '100%',
          minHeight: '100vh'
        }}
      />
      
      {/* Dialog */}
      <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all border border-deep-forest/20">
        <div className="p-6">
          {/* Header */}
        <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              variant === "destructive" ? "bg-red-500/20" : "bg-bronze/20"
            }`}>
              <AlertTriangle className={`w-5 h-5 ${
                variant === "destructive" ? "text-red-500" : "text-bronze"
              }`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-deep-forest">{title}</h3>
            </div>
        </div>
          
          {/* Message */}
          <p className="text-deep-forest/80 mb-6 leading-relaxed whitespace-pre-line">{message}</p>
          
          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="min-w-[80px] border-deep-forest/30 text-deep-forest bg-white hover:bg-deep-forest/5"
            >
              {cancelText}
          </Button>
            <Button 
              onClick={onConfirm}
              className={`min-w-[80px] ${
                variant === "destructive" 
                  ? "bg-red-500 hover:bg-red-600 text-white" 
                  : "bg-bronze hover:bg-bronze/90 text-white"
              }`}
            >
              {confirmText}
          </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


interface Department {
  id: string
  name: string
  floor: string
  officeNumber: string
  building: string
  language?: string
  fields?: { [key: string]: string }
}

export default function DepartmentManager() {
  const [currentLang, setCurrentLang] = useState<Language>("en")
  const [editLanguages, setEditLanguages] = useState<Record<string, Language>>({})
  const [metadataLanguages, setMetadataLanguages] = useState<Record<string, Language>>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")

  const [departments, setDepartments] = useState<Department[]>([
    {
      id: "1",
      name: "Human Resources",
      floor: "2nd Floor",
      officeNumber: "201",
      building: "Block A",
    },
    {
      id: "2",
      name: "Information Technology",
      floor: "3rd Floor",
      officeNumber: "305",
      building: "Block B",
    },
    {
      id: "3",
      name: "Finance Department",
      floor: "1st Floor",
      officeNumber: "105",
      building: "Block C",
    },
  ])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Department>>({})
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
  const filteredDepartments = departments.filter((dept) => {
    const matchesSearch =
      searchTerm === "" ||
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.floor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.officeNumber.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesBuilding = departmentFilter === "all" || dept.name === departmentFilter
    
    return matchesSearch && matchesBuilding
  })

  const handleEdit = (dept: Department) => {
    setEditingId(dept.id)
    setEditForm({ ...dept })
    setEditLanguages(prev => ({ ...prev, [dept.id]: "en" })) // Initialize language for this record
  }

  const handleSave = (id: string) => {
    // Check for empty required fields
    if (!editForm.name?.trim() || !editForm.building?.trim() || !editForm.floor?.trim() || !editForm.officeNumber?.trim()) {
      alert("Please fill in all required fields (Department Name, Block, Floor, Office Number) before saving.")
      return
    }

    setConfirmDialog({
      isOpen: true,
      title: "Save Changes",
      message: "Are you sure you want to save the changes to this department?",
      variant: "default",
      confirmText: "Save",
      cancelText: "Discard",
      onConfirm: () => {
        setDepartments((prev) => prev.map((dept) => (dept.id === id ? { ...dept, ...editForm } : dept)))
        setEditingId(null)
        setEditForm({})
        // Clean up language state for this record
        setEditLanguages(prev => {
          const newState = { ...prev }
          delete newState[id as string]
          return newState
        })
        setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: () => {} })
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

  const handleAddDepartment = () => {
    const id = Date.now().toString()
    setDepartments((prev) => [...prev, { ...newDepartment, id } as Department])
    setNewDepartment({
      name: "",
      floor: "",
      officeNumber: "",
      building: "",
    })
  }

  const handleDelete = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Department",
      message: "Are you sure you want to delete this department? This action cannot be undone.",
      variant: "destructive",
      confirmText: "Delete",
      cancelText: "Discard",
      onConfirm: () => {
        setDepartments((prev) => prev.filter((d) => d.id !== id))
        setEditingId(null)
        setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: () => {} })
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

      {/* Department List */}
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
                    {Array.from(new Set(departments.map(dept => dept.name).filter(name => name && name.trim() !== ""))).map((department) => (
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
          <CardContent className="space-y-6">
            {/* Department Information */}
            <div className="bg-alabaster/50 rounded-lg p-4 border border-deep-forest/10">
              <h4 className="text-lg font-semibold text-deep-forest mb-4">
                Department Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-deep-forest font-medium">Department Name</Label>
                  <Input
                    value={addForm.name}
                    onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Enter department name"
                    className="border-deep-forest/30 focus:border-bronze focus:ring-bronze/20 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-deep-forest font-medium">Building</Label>
                  <Input
                    value={addForm.building}
                    onChange={e => setAddForm(f => ({ ...f, building: e.target.value }))}
                    placeholder="Enter building"
                    className="border-deep-forest/30 focus:border-bronze focus:ring-bronze/20 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-deep-forest font-medium">Floor</Label>
                  <Input
                    value={addForm.floor}
                    onChange={e => setAddForm(f => ({ ...f, floor: e.target.value }))}
                    placeholder="Enter floor"
                    className="border-deep-forest/30 focus:border-bronze focus:ring-bronze/20 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-deep-forest font-medium">Office Number</Label>
                  <Input
                    value={addForm.officeNumber}
                    onChange={e => setAddForm(f => ({ ...f, officeNumber: e.target.value }))}
                    placeholder="Enter office number"
                    className="border-deep-forest/30 focus:border-bronze focus:ring-bronze/20 mt-1"
                  />
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button onClick={() => {
                // Check for empty fields
                if (!addForm.name.trim() || !addForm.building.trim() || !addForm.floor.trim() || !addForm.officeNumber.trim()) {
                  alert("Please fill in all required fields before adding a department.")
                  return
                }
                setDepartments(prev => [
                  ...prev,
                  {
                    id: Date.now().toString(),
                    name: addForm.name,
                    building: addForm.building,
                    floor: addForm.floor,
                    officeNumber: addForm.officeNumber,
                  }
                ])
                setAddForm({ name: "", building: "", floor: "", officeNumber: "" })
                setShowAddForm(false)
              }} className="bg-bronze hover:bg-bronze/90 text-white">
                <Save className="w-4 h-4 mr-2" />
                Add Department
              </Button>
              <Button variant="outline" onClick={() => {
                setConfirmDialog({
                  isOpen: true,
                  title: "Cancel Adding Department",
                  message: "Are you sure you want to cancel adding this department? This action cannot be undone.",
                  variant: "default",
                  confirmText: "Cancel",
                  cancelText: "Discard",
                  onConfirm: () => {
                  setShowAddForm(false);
                  setAddForm({ name: "", building: "", floor: "", officeNumber: "" });
                    setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: () => {} })
                }
                })
              }} className="border-deep-forest/30 text-deep-forest hover:bg-deep-forest/5 hover:text-deep-forest">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
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
                    <div className="bg-alabaster/50 rounded-lg p-4 border border-deep-forest/10">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-deep-forest font-medium">Department Name</Label>
                          <Input
                            value={editForm.name}
                            onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter department name"
                            className="mt-1 border-deep-forest/30 focus:border-bronze focus:ring-bronze/20"
                          />
                        </div>
                        <div>
                          <Label className="text-deep-forest font-medium">Block</Label>
                          <Input
                            value={editForm.building}
                            onChange={e => setEditForm(prev => ({ ...prev, building: e.target.value }))}
                            placeholder="Enter block"
                            className="mt-1 border-deep-forest/30 focus:border-bronze focus:ring-bronze/20"
                          />
                        </div>
                        <div>
                          <Label className="text-deep-forest font-medium">Floor</Label>
                          <Input
                            value={editForm.floor}
                            onChange={e => setEditForm(prev => ({ ...prev, floor: e.target.value }))}
                            placeholder="Enter floor"
                            className="mt-1 border-deep-forest/30 focus:border-bronze focus:ring-bronze/20"
                          />
                        </div>
                        <div>
                          <Label className="text-deep-forest font-medium">Office Number</Label>
                          <Input
                            value={editForm.officeNumber}
                            onChange={e => setEditForm(prev => ({ ...prev, officeNumber: e.target.value }))}
                            placeholder="Enter office number"
                            className="mt-1 border-deep-forest/30 focus:border-bronze focus:ring-bronze/20"
                          />
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
                        {/* Existing Metadata Fields */}
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

                  {/* Add New Data Field - Independent Connected Section */}
                  {showAddField === dept.id && (
                    <Card className="bg-alabaster/80 border border-bronze/30 shadow-md">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-bronze/20">
                              <Plus className="w-5 h-5 text-bronze" />
                            </div>
                            <CardTitle className="text-deep-forest">Add New Data Field</CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select 
                              value={metadataLanguages[dept.id] || "en"} 
                              onValueChange={(value: Language) => setMetadataLanguages(prev => ({ ...prev, [dept.id]: value }))}
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
                                <SelectItem value="other" className="text-deep-forest hover:bg-bronze/10">Others</SelectItem>
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
                              const finalFieldKey = fieldKey === "custom" ? "" : fieldKey
                              if (!finalFieldKey.trim() || !fieldValue.trim()) {
                                alert("Please fill in both Data Type and Value fields before adding a data field.")
                                return
                              }
                              setEditForm((prev) => ({
                                ...prev,
                                fields: { ...prev.fields, [finalFieldKey]: fieldValue }
                              }))
                              setFieldKey("")
                              setFieldValue("")
                              setShowAddField(null)
                              setMetadataVisible((prev) => ({ ...prev, [dept.id]: true }));
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
                              setFieldKey("")
                              setFieldValue("")
                              setShowAddField(null)
                            }}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Action Buttons - Only show when not adding metadata */}
                  {showAddField !== dept.id && (
                    <div className="flex flex-col sm:flex-row gap-2 mt-6 sm:justify-between">
                      <div className="flex gap-2 items-center">
                        <Button
                          type="button"
                          className="bg-bronze hover:bg-bronze/90 text-white"
                          onClick={() => {
                            // Save logic here
                            setEditingId(null)
                            setEditForm({ name: "", building: "", floor: "", officeNumber: "", fields: {} })
                          }}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Department Info
                        </Button>
                        <Button
                          type="button"
                          className="bg-deep-forest hover:bg-deep-forest/90 text-white min-w-[160px]"
                          onClick={() => {
                            setShowAddField(dept.id);
                            setMetadataVisible((prev) => ({ ...prev, [dept.id]: false }));
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add New Data Field
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="border-deep-forest/30 text-deep-forest hover:bg-deep-forest hover:text-alabaster min-w-[160px]"
                          onClick={() => {
                            setEditingId(null)
                            setEditForm({ name: "", building: "", floor: "", officeNumber: "", fields: {} })
                          }}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          className="text-white min-w-[160px]"
                          onClick={() => {
                            // Delete logic here
                            setEditingId(null)
                            setEditForm({ name: "", building: "", floor: "", officeNumber: "", fields: {} })
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Department
                        </Button>
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-bronze" />
                      <span className="text-sm text-deep-forest">
                        {dept.building} | {dept.floor} | {dept.officeNumber}
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingId(editingId === dept.id ? null : dept.id)}
                    className="bg-deep-forest hover:bg-deep-forest/90 text-white border border-deep-forest/20 shadow-lg transition-all duration-300"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

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


