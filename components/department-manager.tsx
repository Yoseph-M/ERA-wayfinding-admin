"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Separator } from "../components/ui/separator"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Plus, Edit, Save, X, MapPin, Phone, Mail, User, Map, ImageIcon, Trash2, Search, AlertTriangle } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { FiGrid } from "react-icons/fi"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"

type Language = "en" | "am"


import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog";


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
  const [isFormDirty, setIsFormDirty] = useState(false); // New state for form dirty status
  const originalFormData = useRef<Partial<Department>>({}); // New ref to store original form data

  // State for dropdown options
  const [blockOptions, setBlockOptions] = useState<string[]>([])
  const [floorOptions, setFloorOptions] = useState<string[]>([])
  const [officeOptions, setOfficeOptions] = useState<string[]>([])

  // Helper to compare form data
  const areFormsEqual = (form1: Partial<Department>, form2: Partial<Department>) => {
    return (
      form1.name === form2.name &&
      form1.departmentamh === form2.departmentamh &&
      form1.floor === form2.floor &&
      form1.officeNumber === form2.officeNumber &&
      form1.building === form2.building
    );
  };

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

      departments.sort((a: Department, b: Department) => {
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

  useEffect(() => {
    if (editingId && editingId !== 'new' && originalFormData.current) {
      const isEqual = areFormsEqual(editForm, originalFormData.current);
      setIsFormDirty(!isEqual);
    }
  }, [editForm, editingId]);
  
  // Dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    variant?: "default" | "destructive"
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
    const initialData = { ...dept };
    setEditForm(initialData)
    originalFormData.current = initialData;
    setOriginalDepartmentName(dept.name) // Set original name when editing starts
    setEditLanguages(prev => ({ ...prev, [dept.id]: "en" })) // Initialize language for this record
    setIsFormDirty(false); // Editing an existing, so initially clean
  }

  const handleSave = async (id: string | null) => {
    const isNew = id === 'new';
    const departmentData = isNew ? newDepartment : editForm;

    // Show warning if required fields are missing
    if (!(departmentData.name?.toString() || '').trim() || !(departmentData.building?.toString() || '').trim() || !(departmentData.floor?.toString() || '').trim() || !(departmentData.officeNumber?.toString() || '').trim()) {
      setConfirmDialog({
        isOpen: true,
        title: "Missing Information",
        message: "Please fill in all required fields (Department Name, Block, Floor, Office Number) before saving.",
        variant: "default",
        onConfirm: () => setConfirmDialog(c => ({ ...c, isOpen: false })),
      });
      return;
    }

    // Show warning if no changes
    if (!isNew && !isFormDirty) {
      setConfirmDialog({
        isOpen: true,
        title: "No Changes Detected",
        message: "You must make a change to save.",
        variant: "default",
        onConfirm: () => setConfirmDialog(c => ({ ...c, isOpen: false })),
      });
      return;
    }

    // Confirm save/add
    setConfirmDialog({
      isOpen: true,
      title: "Confirm Save",
      message: isNew ? "Are you sure you want to add this department to the system?" : "Are you sure you want to save the changes to this department?",
      variant: "default",
      onConfirm: async () => {
        try {
          const payload = {
            id: isNew ? undefined : id,
            newDepartment: departmentData.name,
            newDepartmentAmh: departmentData.departmentamh,
            floor: departmentData.floor,
            officeNumber: departmentData.officeNumber,
            building: departmentData.building,
          };
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/departments`, {
            method: isNew ? 'POST' : 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (!res.ok) {
            const errorData = await res.json();
            setConfirmDialog({
              isOpen: true,
              title: 'Department Error',
              message: errorData.error || `Failed to ${isNew ? 'add' : 'update'} department`,
              variant: 'destructive',
              onConfirm: () => setConfirmDialog(c => ({ ...c, isOpen: false })),
            });
            throw new Error(errorData.error || `Failed to ${isNew ? 'add' : 'update'} department`);
          }
          setEditingId(null);
          setEditForm({});
          setNewDepartment({ name: "", floor: "", officeNumber: "", building: "" });
          setOriginalDepartmentName(null);
          setIsFormDirty(false);
          setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: () => {} });
          fetchDepartments();
        } catch (err: any) {
          setConfirmDialog({
            isOpen: true,
            title: 'Department Error',
            message: `Error ${isNew ? 'adding' : 'updating'} department: ${err instanceof Error ? err.message : 'Unknown error'}`,
            variant: 'destructive',
            onConfirm: () => setConfirmDialog(c => ({ ...c, isOpen: false })),
          });
        }
      }
    });
  };

  const handleCancel = () => {
    const isNew = editingId === 'new';
    const isDirty = isNew ? (newDepartment.name !== "" || newDepartment.building !== "" || newDepartment.floor !== "" || newDepartment.officeNumber !== "") : isFormDirty;

    if (!isDirty) {
      setEditingId(null);
      setEditForm({});
      setNewDepartment({ name: "", floor: "", officeNumber: "", building: "" });
      if (editingId) {
        setEditLanguages(prev => {
          const newState = { ...prev };
          delete newState[editingId as string];
          return newState;
        });
      }
      setIsFormDirty(false);
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: "Confirm Cancel",
      message: "You have unsaved changes. Are you sure you want to cancel them?",
      variant: "destructive",
      onConfirm: () => {
        setEditingId(null);
        setEditForm({});
        setNewDepartment({ name: "", building: "", floor: "", officeNumber: "" });
        setIsFormDirty(false);
        if (editingId) {
          setEditLanguages(prev => {
            const newState = { ...prev };
            delete newState[editingId as string];
            return newState;
          });
        }
        setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: () => {} });
      }
    });
  };

  

  

  // DELETE
  const handleDelete = (departmentName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Are you sure?",
      message: "Are you sure you want to delete this department? This action cannot be undone.",
      variant: "destructive",
      onConfirm: async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/departments`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ department: departmentName })
          });
          if (!res.ok && res.status !== 204) {
            setConfirmDialog({
              isOpen: true,
              title: 'Department Error',
              message: 'Failed to delete department',
              variant: 'destructive',
              onConfirm: () => setConfirmDialog(c => ({ ...c, isOpen: false })),
            });
            throw new Error('Failed to delete department');
          }
          setEditingId(null);
          setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: () => {} });
          fetchDepartments();
        } catch (err: any) {
          setConfirmDialog({
            isOpen: true,
            title: 'Department Error',
            message: 'Error deleting department',
            variant: 'destructive',
            onConfirm: () => setConfirmDialog(c => ({ ...c, isOpen: false })),
          });
        }
      }
    });
  };

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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B85A1A] mx-auto mb-4"></div>
            <p className="text-deep-forest">Loading departments...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <AlertDialog open={!!error} onOpenChange={() => setError(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Error Loading Data</AlertDialogTitle>
              <AlertDialogDescription>{error}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="hover:bg-deep-forest/10" onClick={() => setError(null)}>
                Dismiss
              </AlertDialogCancel>
              <AlertDialogAction onClick={() => window.location.reload()}>
                Try Again
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
              <p className="text-sm text-[#B85A1A] mt-1">Manage departments and organizational structure</p>
            </div>
            {!editingId && (
              <Button 
                onClick={() => setEditingId('new')} 
                className="!bg-[#B85A1A] !text-white !shadow-none !ring-0 !filter-none px-6 py-2 font-medium border border-[#B85A1A]/20 !hover:bg-[#B85A1A] !focus:bg-[#B85A1A] !active:bg-[#B85A1A]"
              >
                <Plus className="w-4 h-4 mr-2" />
                ADD DEPARTMENT
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {/* Search and Filters */}
            {!editingId && (
              <Card className="bg-alabaster backdrop-blur-xl border border-deep-forest/20 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B85A1A] w-4 h-4" />
                      <Input
                        placeholder="Search departments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full bg-white border-deep-forest/30 text-deep-forest placeholder:text-deep-forest/60 focus:border-[#B85A1A] focus:ring-[#B85A1A]/20"
                      />
                    </div>
                    <div className="w-80">
                      <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                        <SelectTrigger 
                          className="bg-white border-deep-forest/30 text-deep-forest focus:border-[#B85A1A] focus:ring-[#B85A1A]/20"
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
                              <SelectItem key={department} value={department} className="text-deep-forest hover:bg-[#B85A1A]/10">
                                {department}
                              </SelectItem>
                            ))}
                          <SelectItem value="all" className="text-deep-forest hover:bg-[#B85A1A]/10">ALL DEPARTMENTS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            

            {/* Department List */}
            {!editingId && filteredDepartments.map((dept) => (
              <Card key={dept.id} className="bg-alabaster backdrop-blur-xl border border-deep-forest/20 hover:border-2 hover:border-[#B85A1A] transition-colors min-h-[120px] shadow-lg">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#B85A1A]" />
                            <span className="text-sm text-deep-forest">
                              {dept.building ? `Block ${dept.building}` : ''}
                              {dept.floor ? `${dept.building ? ', ' : ''}Floor ${dept.floor}` : ''}
                              {dept.officeNumber ? `${dept.building || dept.floor ? ', ' : ''}Room ${dept.officeNumber}` : ''}
                            </span>
                          </div>
                          {/* Show all custom fields for this department in view mode */}
                          {dept.fields && Object.entries(dept.fields).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-2">
                              <span className="font-medium text-[#B85A1A]">{key}:</span> <span className="text-deep-forest">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </div>
                  <div className="flex items-center justify-center h-full px-6">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(dept)}
                        className="!bg-deep-forest !text-white !shadow-none !ring-0 !filter-none border border-deep-forest/20 mr-2"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(dept.name)}
                        className="!bg-red-600 !text-white !shadow-none !ring-0 !filter-none"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {editingId && (
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
                    <CardTitle className="text-deep-forest">{editingId === 'new' ? 'Add New Department' : 'Edit Department'}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Department Information */}
                  <div className="bg-alabaster/50 rounded-lg p-4 border border-deep-forest">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold text-deep-forest">
                        Department Information
                      </h4>
                      <ToggleGroup type="single" value={currentLang} onValueChange={(lang: Language) => lang && setCurrentLang(lang)} className="bg-white border border-deep-forest/30">
                          <ToggleGroupItem value="en" className={`px-4 py-1 text-deep-forest font-medium border-none outline-none ${currentLang === "en" ? "bg-[#B85A1A] text-white !rounded-none !shadow-none border-b-2 border-[#B85A1A]" : "hover:bg-[#B85A1A]/10 !rounded-none !shadow-none"}`}>EN</ToggleGroupItem>
                          <ToggleGroupItem value="am" className={`px-4 py-1 text-deep-forest font-medium border-none outline-none ${currentLang === "am" ? "bg-[#B85A1A] text-white !rounded-none !shadow-none border-b-2 border-[#B85A1A]" : "hover:bg-[#B85A1A]/10 !rounded-none !shadow-none"}`}>AM</ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-12">
                        <Label className="text-deep-forest font-medium">Department Name ({currentLang.toUpperCase()})</Label>
                        <Input
                          value={currentLang === 'en' ? (editingId === 'new' ? (newDepartment.name ?? "") : (editForm.name ?? "")) : (editingId === 'new' ? (newDepartment.departmentamh ?? "") : (editForm.departmentamh ?? ""))}
                          onChange={e => {
                            const value = e.target.value;
                            const field = currentLang === 'en' ? 'name' : 'departmentamh';
                            if (editingId === 'new') {
                              setNewDepartment(f => ({ ...f, [field]: value }));
                            } else {
                              setEditForm(f => ({ ...f, [field]: value }));
                            }
                          }}
                          placeholder={`Enter department name in ${currentLang === 'en' ? 'English' : 'Amharic'}`}
                          className="bg-white border-deep-forest/30 focus:border-[#B85A1A] focus:ring-[#B85A1A]/20 mt-1"
                        />
                      </div>
                      <div className="md:col-span-4">
                        <Label className="text-deep-forest font-medium">Block</Label>
                        <Select
                          value={editingId === 'new' ? (newDepartment.building ?? "") : (editForm.building ?? "")}
                          onValueChange={val => {
                            if (editingId === 'new') {
                              setNewDepartment(f => ({ ...f, building: val }));
                            } else {
                              setEditForm(f => ({ ...f, building: val }));
                            }
                          }}
                        >
                          <SelectTrigger className="border-deep-forest/30 focus:border-[#B85A1A] focus:ring-[#B85A1A]/20 mt-1 bg-white text-deep-forest">
                            <SelectValue placeholder="Select block" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-deep-forest/20">
                            {blockOptions.map(block => (
                              <SelectItem key={block} value={block} className="text-deep-forest hover:bg-[#B85A1A]/10">{block}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-4">
                        <Label className="text-deep-forest font-medium">Floor</Label>
                        <Select
                          value={editingId === 'new' ? (newDepartment.floor ?? "") : (editForm.floor ?? "")}
                          onValueChange={val => {
                            if (editingId === 'new') {
                              setNewDepartment(f => ({ ...f, floor: val }));
                            } else {
                              setEditForm(f => ({ ...f, floor: val }));
                            }
                          }}
                        >
                          <SelectTrigger className="border-deep-forest/30 focus:border-[#B85A1A] focus:ring-[#B85A1A]/20 mt-1 bg-white text-deep-forest">
                            <SelectValue placeholder="Select floor" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-deep-forest/20">
                            {floorOptions.map(floor => (
                              <SelectItem key={floor} value={floor} className="text-deep-forest hover:bg-[#B85A1A]/10">{floor}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-4">
                        <Label className="text-deep-forest font-medium">Office Number</Label>
                        <Select
                          value={editingId === 'new' ? (newDepartment.officeNumber ?? "") : (editForm.officeNumber ?? "")}
                          onValueChange={val => {
                            if (editingId === 'new') {
                              setNewDepartment(f => ({ ...f, officeNumber: val }));
                            } else {
                              setEditForm(f => ({ ...f, officeNumber: val }));
                            }
                          }}
                        >
                          <SelectTrigger className="border-deep-forest/30 focus:border-[#B85A1A] focus:ring-[#B85A1A]/20 mt-1 bg-white text-deep-forest">
                            <SelectValue placeholder="Select office number" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-deep-forest/20">
                            {officeOptions.map(office => (
                              <SelectItem key={office} value={office} className="text-deep-forest hover:bg-[#B85A1A]/10">{office}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    <Button
                      onClick={() => handleSave(editingId)}
                      className="!bg-[#B85A1A] !text-white !shadow-none !ring-0 !filter-none !hover:bg-[#B85A1A] !focus:bg-[#B85A1A] !active:bg-[#B85A1A]"
                      disabled={editingId === 'new' ? !(newDepartment.name?.trim() && newDepartment.building?.trim() && newDepartment.floor?.trim() && newDepartment.officeNumber?.trim()) : !isFormDirty}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingId === 'new' ? 'Add Department Info' : 'Save Department Info'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="!bg-deep-forest !text-alabaster !shadow-none !ring-0 !filter-none min-w-[160px] !hover:bg-deep-forest !focus:bg-deep-forest !active:bg-deep-forest"
                      onClick={() => handleCancel()}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      {/* Custom Confirm Dialog (replaces warning cards) */}
      <AlertDialog open={confirmDialog.isOpen} onOpenChange={open => setConfirmDialog(c => ({ ...c, isOpen: open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDialog.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className={
                confirmDialog.title === 'Confirm Cancel'
                  ? (confirmDialog.variant === 'destructive'
                      ? '!bg-deep-forest !text-alabaster !shadow-none !ring-0 !filter-none !hover:bg-deep-forest !focus:bg-deep-forest !active:bg-deep-forest'
                      : '!bg-[#B85A1A] !text-white !shadow-none !ring-0 !filter-none !hover:bg-[#B85A1A] !focus:bg-[#B85A1A] !active:bg-[#B85A1A]')
                  : confirmDialog.title === 'Are you sure?'
                  ? '!bg-deep-forest !text-alabaster !shadow-none !ring-0 !filter-none'
                  : confirmDialog.title === 'Confirm Save'
                  ? '!bg-deep-forest !text-alabaster !shadow-none !ring-0 !filter-none'
                  : ''
              }
              onClick={() => setConfirmDialog(c => ({ ...c, isOpen: false }))}
            >
              {confirmDialog.title === 'Confirm Cancel' ? 'Keep Editing' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              className={
                confirmDialog.variant === 'destructive' && confirmDialog.title === 'Confirm Cancel'
                  ? ''
                  : confirmDialog.variant === 'destructive'
                  ? '!bg-red-600 !text-white !shadow-none !ring-0 !filter-none !hover:bg-red-600 !focus:bg-red-600 !active:bg-red-600'
                  : confirmDialog.title === 'Confirm Save'
                  ? '!bg-[#B85A1A] !text-white !shadow-none !ring-0 !filter-none !hover:bg-[#B85A1A] !focus:bg-[#B85A1A] !active:bg-[#B85A1A]'
                  : ''
              }
              onClick={() => {
                confirmDialog.onConfirm();
                setConfirmDialog(c => ({ ...c, isOpen: false }));
              }}
            >
              {confirmDialog.title === 'Confirm Cancel' ? 'Cancel' : confirmDialog.variant === 'destructive' ? 'Delete' : confirmDialog.title === 'Confirm Save' ? 'Save' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}