"use client"

import { useState, useEffect } from "react"
import Papa from "papaparse"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Plus, Edit, Save, X, User, MapPin, Briefcase, Search, Trash2 } from "lucide-react"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FaUserCircle } from "react-icons/fa"
import { useRouter } from "next/navigation"

type Language = "en" | "am"

interface Personnel {
  id: string
  firstName: string
  lastName: string
  position: { en: string; am: string }
  department: { en: string; am: string }
  location: string
  photoUrl?: string // Added for personnel photo
  fields?: { [key: string]: string }
}

export default function PersonnelManager() {
  const router = useRouter()
  const [personnel, setPersonnel] = useState<Personnel[]>([])
  const [blocks, setBlocks] = useState<string[]>([])
  const [floors, setFloors] = useState<string[]>([])
  const [offices, setOffices] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem('isAuthenticated') !== 'true') {
      router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    async function fetchPersonnel() {
      try {
        setIsLoading(true)
        setError(null)
        console.log('Fetching personnel data...')
        const res = await fetch('/api/departments')
        if (!res.ok) {
          console.error('Failed to fetch CSV:', res.status, res.statusText)
          throw new Error('Failed to fetch CSV')
        }
        const csvText = await res.text()
        console.log('CSV data received, length:', csvText.length)
        const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true })
        console.log('Parsed CSV data:', parsed.data.length, 'rows')
        // Extract unique blocks, floors, offices, and personnel (wname)
        const blockSet = new Set<string>()
        const floorSet = new Set<string>()
        const officeSet = new Set<string>()
        const personnelArr: Personnel[] = []
        const seenIds = new Set<string>()
        parsed.data.forEach((row: any, idx: number) => {
          // Only add if wname exists
          if (row.wname && row.wname.trim()) {
            // Try to split wname into first/last name (best effort)
            const [firstName, ...rest] = row.wname.split(' ')
            const lastName = rest.join(' ')
            // Compose a unique id using wid, officeno, and idx
            let baseId = row.wid || row.officeno || (idx + 1).toString()
            let uniqueId = baseId
            let suffix = 1
            while (seenIds.has(uniqueId)) {
              uniqueId = `${baseId}_${suffix}`
              suffix++
            }
            seenIds.add(uniqueId)
            personnelArr.push({
              id: uniqueId,
              firstName: firstName || '',
              lastName: lastName || '',
              position: { en: row.wtitle || '', am: row.wtitleamh || '' },
              department: { en: row.department || '', am: row.departmentamh || '' },
              location: `${row.block ? 'Block ' + row.block : ''}${row.floor ? ', Floor ' + row.floor : ''}${row.officeno ? ', Room ' + row.officeno : ''}`,
              photoUrl: '',
            })
          }
          if (row.block && row.block.trim()) blockSet.add(row.block)
          if (row.floor && row.floor.trim()) floorSet.add(row.floor)
          if (row.officeno && row.officeno.trim()) officeSet.add(row.officeno)
        })
        console.log('Processed personnel:', personnelArr.length, 'people')
        setPersonnel(personnelArr)
        setBlocks(Array.from(blockSet).sort())
        setFloors(Array.from(floorSet).sort((a, b) => Number(a) - Number(b)))
        setOffices(Array.from(officeSet).sort((a, b) => Number(a) - Number(b)))
      } catch (err) {
        console.error('Error fetching personnel/blocks:', err)
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
        // Set empty arrays to prevent infinite loading state
        setPersonnel([])
        setBlocks([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchPersonnel()
  }, [])

  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Personnel>>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [newPersonnel, setNewPersonnel] = useState<any>({
    firstName: "",
    lastName: "",
    position: { en: "", am: "" },
    department: { en: "", am: "" },
    block: "",
    floor: "",
    office: "",
    location: "",
    photoUrl: "",
  })
  const [currentLang, setCurrentLang] = useState<Language>("en") // State for current language in forms
  const [editLanguages, setEditLanguages] = useState<{ [key: string]: Language }>({}) // Language state for each editing record
  const [showAddField, setShowAddField] = useState<string | null>(null)
  const [fieldKey, setFieldKey] = useState("")
  const [fieldValue, setFieldValue] = useState("")

  // Departments, directorates, and positions will be derived from CSV if needed
  // Build departments array with both English and Amharic from personnel
  const departments = Array.from(
    new Map(
      personnel
        .filter(p => p.department.en && p.department.en.trim())
        .map(p => [p.department.en, { en: p.department.en, am: p.department.am }])
    ).values()
  )
  const positions = Array.from(new Set(personnel.map(p => p.position.en && p.position.en.trim()).filter(Boolean)))
    .filter(en => en && en !== "")
    .map(en => ({ en, am: '' }))

  const filteredPersonnel = personnel.filter((person) => {
    const matchesSearch =
      searchTerm === "" ||
      `${person.firstName} ${person.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.position[currentLang].toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.department[currentLang].toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDepartment = departmentFilter === "all" || person.department.en === departmentFilter // Filter by English department name

    return matchesSearch && matchesDepartment
  })

  const handleEdit = (person: Personnel) => {
    setEditingId(person.id)
    setEditForm({ ...person })
    setEditLanguages(prev => ({ ...prev, [person.id]: "en" })) // Initialize language for this record
  }

  const handleSave = (id: string) => {
    setPersonnel((prev) => prev.map((person) => (person.id === id ? { ...person, ...editForm } : person)))
    setEditingId(null)
    setEditForm({})
    // Clean up language state for this record
    setEditLanguages(prev => {
      const newState = { ...prev }
      delete newState[id]
      return newState
    })
  }

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel?")) {
      setEditingId(null)
      setEditForm({})
      // Clean up language state for the current editing record
      if (editingId) {
        setEditLanguages(prev => {
          const newState = { ...prev }
          delete newState[editingId]
          return newState
        })
      }
    }
  }

  function composeLocation(block?: string, floor?: string, office?: string) {
    let loc = ""
    if (block) loc += `Block ${block}`
    if (floor) loc += (loc ? ", " : "") + `Floor ${floor}`
    if (office) loc += (loc ? ", " : "") + `Room ${office}`
    return loc
  }

  const handleAddPersonnel = () => {
    const id = Date.now().toString()
    const location = composeLocation(newPersonnel.block, newPersonnel.floor, newPersonnel.office)
    setPersonnel((prev) => [...prev, { ...newPersonnel, id, location } as Personnel])
    setNewPersonnel({
      firstName: "",
      lastName: "",
      position: { en: "", am: "" },
      department: { en: "", am: "" },
      block: "",
      floor: "",
      office: "",
      location: "",
      photoUrl: "",
    })
    setShowAddForm(false)
    setCurrentLang("en") // Reset language to English after adding
  }

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this personnel entry? This action cannot be undone.")) {
      setPersonnel((prev) => prev.filter((person) => person.id !== id))
      setEditingId(null) // Close edit form after deletion
    }
  }

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bronze mx-auto mb-4"></div>
            <p className="text-deep-forest">Loading personnel data...</p>
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

      {/* Header with title, description, and add button aligned */}
      {!isLoading && (
        <>
          <div className="flex items-center justify-between">
            <div className="pl-1">
              <h2 className="text-2xl font-bold text-deep-forest">
                PERSONNEL MANAGEMENT
              </h2>
              <p className="text-sm text-bronze mt-1">Manage staff information, assignments, and contact details</p>
            </div>
            {!showAddForm && (
              <Button 
                onClick={() => setShowAddForm(!showAddForm)} 
                className="bg-bronze hover:bg-bronze/90 text-white shadow-lg px-6 py-2 font-medium border border-bronze/20 transition-all duration-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Personnel
              </Button>
            )}
          </div>

          {/* Search and Filters */}
          {!showAddForm && (
            <Card className="bg-alabaster backdrop-blur-xl border border-deep-forest/20 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bronze w-4 h-4" />
                    <Input
                      placeholder="Search personnel..."
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
                        {Array.from(new Set(personnel.map(person => person.department.en).filter(name => name && name.trim() !== ""))).map((department) => (
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
        </>
      )}

      {/* Add New Personnel Form */}
      {showAddForm && (
        <Card className="bg-alabaster border border-deep-forest/20">
          <CardHeader>
            <CardTitle className="text-deep-forest">Add New Personnel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-end mt-0 mb-4">
              <ToggleGroup
                type="single"
                value={currentLang}
                onValueChange={value => value && setCurrentLang(value as Language)}
                className="bg-white border border-deep-forest/30 p-0 h-9"
              >
                <ToggleGroupItem
                  value="en"
                  className={
                    "px-5 py-1 text-deep-forest font-medium border-none outline-none !rounded-none !shadow-none h-9 "+
                    (currentLang === "en"
                      ? "bg-bronze text-white"
                      : "hover:bg-bronze/10")
                  }
                  style={{ marginRight: 0 }}
                >
                  EN
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="am"
                  className={
                    "px-5 py-1 text-deep-forest font-medium border-none outline-none !rounded-none !shadow-none h-9 "+
                    (currentLang === "am"
                      ? "bg-bronze text-white"
                      : "hover:bg-bronze/10")
                  }
                  style={{ marginLeft: 0 }}
                >
                  AM
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {/* First row: First Name and Last Name side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-firstName">First Name</Label>
                  <Input
                    id="new-firstName"
                    value={newPersonnel.firstName || ""}
                    onChange={(e) => setNewPersonnel((prev) => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter first name"
                    className="bg-white"
                  />
                </div>
                <div>
                  <Label htmlFor="new-lastName">Last Name</Label>
                  <Input
                    id="new-lastName"
                    value={newPersonnel.lastName || ""}
                    onChange={(e) => setNewPersonnel((prev) => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter last name"
                    className="bg-white"
                  />
                </div>
              </div>

              {/* Second row: Position dropdown (full width) */}
              <div className="mt-4">
                <Label htmlFor="new-position">Position ({currentLang.toUpperCase()})</Label>
                <Select
                  value={newPersonnel.position?.[currentLang] || ""}
                  onValueChange={(value) =>
                    setNewPersonnel((prev) => ({ 
                      ...prev, 
                      position: { 
                        en: prev.position?.en || "", 
                        am: prev.position?.am || "", 
                        [currentLang]: value 
                      } 
                    }))
                  }
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions
                      .filter((pos) => pos[currentLang] && pos[currentLang] !== "")
                      .map((pos) => (
                        <SelectItem key={pos.en} value={pos[currentLang]}>
                          {pos[currentLang]}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Third row: Department dropdown (full width) */}
              <div className="mt-4">
                <Label htmlFor="new-department">Department ({currentLang.toUpperCase()})</Label>
                <Select
                  value={newPersonnel.department?.[currentLang] || ""}
                  onValueChange={(value) =>
                    setNewPersonnel((prev) => ({ 
                      ...prev, 
                      department: { 
                        en: prev.department?.en || "", 
                        am: prev.department?.am || "", 
                        [currentLang]: value 
                      } 
                    }))
                  }
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments
                      .filter((dept) => dept[currentLang] && dept[currentLang] !== "")
                      .map((dept) => (
                        <SelectItem key={dept.en} value={dept[currentLang]}>
                          {dept[currentLang]}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fourth row: Location dropdowns in a single row */}
              <div className="mt-4">
                <Label htmlFor="new-location">Location</Label>
                <div className="flex gap-2 mt-1">
                  <Select
                    value={newPersonnel.block || ""}
                    onValueChange={value => {
                      setNewPersonnel((prev: any) => ({
                        ...prev,
                        block: value,
                        location: composeLocation(value, prev.floor, prev.office)
                      }))
                    }}
                  >
                    <SelectTrigger className="w-28 bg-white"><SelectValue placeholder="Block" /></SelectTrigger>
                    <SelectContent>
                      {blocks.map(block => (
                        <SelectItem key={block} value={block}>{block}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={newPersonnel.floor || ""}
                    onValueChange={value => {
                      setNewPersonnel((prev: any) => ({
                        ...prev,
                        floor: value,
                        location: composeLocation(prev.block, value, prev.office)
                      }))
                    }}
                  >
                    <SelectTrigger className="w-28 bg-white"><SelectValue placeholder="Floor" /></SelectTrigger>
                    <SelectContent>
                      {floors.map(floor => (
                        <SelectItem key={floor} value={floor}>{floor}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={newPersonnel.office || ""}
                    onValueChange={value => {
                      setNewPersonnel((prev: any) => ({
                        ...prev,
                        office: value,
                        location: composeLocation(prev.block, prev.floor, value)
                      }))
                    }}
                  >
                    <SelectTrigger className="w-32 bg-white"><SelectValue placeholder="Office No." /></SelectTrigger>
                    <SelectContent>
                      {offices.map(office => (
                        <SelectItem key={office} value={office}>{office}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  id="new-location"
                  value={composeLocation(newPersonnel.block, newPersonnel.floor, newPersonnel.office) || ""}
                  readOnly
                  className="mt-2 bg-white"
                  placeholder="Location will be composed automatically"
                />
              </div>

              {/* Fifth row: Profile Photo upload (full width, modern drag/drop style) */}
              <div className="mt-4">
                <Label htmlFor="new-photoUrl" className="block font-semibold mb-1">Profile Photo</Label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-bronze/40 rounded-lg p-4 bg-white/60 relative group transition-all duration-200">
                  <div className="flex flex-col items-center w-full">
                    <span className="text-2xl mb-2">📁</span>
                    <label htmlFor="new-photoUrl" className="cursor-pointer px-4 py-2 bg-bronze text-white rounded shadow hover:bg-bronze/90 transition-all text-sm font-medium mb-1">Upload Photo</label>
                    <span className="text-xs text-gray-500 mb-2">or drag image here</span>
                    <Input
                      id="new-photoUrl"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = (e.target as HTMLInputElement).files?.[0]
                        if (file) {
                          const url = URL.createObjectURL(file)
                          setNewPersonnel((prev) => ({ ...prev, photoUrl: url }))
                        }
                      }}
                    />
                    <div
                      className="w-full h-24 flex items-center justify-center mt-2 border border-dashed border-bronze/30 rounded bg-alabaster/60"
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file && file.type.startsWith('image/')) {
                          const url = URL.createObjectURL(file);
                          setNewPersonnel((prev) => ({ ...prev, photoUrl: url }));
                        }
                      }}
                    >
                      {newPersonnel.photoUrl ? (
                        <Image src={newPersonnel.photoUrl} alt="Preview" width={64} height={64} className="rounded-full object-contain" />
                      ) : (
                        <span className="text-gray-400 text-xs">Preview area</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />
            <div className="flex justify-end gap-2">
              <Button onClick={handleAddPersonnel} className="bg-bronze hover:bg-bronze/90 text-white">
                <Save className="w-4 h-4 mr-2" />
                Add Personnel
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-deep-forest/30 text-deep-forest hover:bg-deep-forest hover:text-alabaster min-w-[160px]"
                onClick={() => {
                  setShowAddForm(false);
                  setNewPersonnel({
                    firstName: "",
                    lastName: "",
                    position: { en: "", am: "" },
                    department: { en: "", am: "" },
                    location: "",
                    photoUrl: "",
                  });
                  setCurrentLang("en");
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personnel List */}
      <div className="space-y-4">
        {filteredPersonnel.map((person) => (
          <Card key={person.id} className="bg-alabaster hover:border-2 hover:border-[#EF842D] transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100">
                        {person.photoUrl && person.photoUrl !== ""
                          ? <Image src={person.photoUrl} alt="Personnel Avatar" width={32} height={32} className="object-contain rounded-full" />
                          : <FaUserCircle className="w-8 h-8 text-gray-400" />}
                      </div>
                  <div>
                        <CardTitle className="text-lg">{person.firstName} {person.lastName}</CardTitle>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-xs border-bronze/50 text-bronze">
                        {person.position[editLanguages[person.id] || "en"]}
                      </Badge>
                    </div>
                  </div>
                </div>
                {editingId === person.id && (
                  null
                )}
                  </div>
                </CardHeader>
            <CardContent>
              {editingId === person.id ? (
                <>
                  {/* Only show Add Data Field card if showAddField === person.id */}
                  {showAddField === person.id && (
                    <Card className="bg-alabaster/80 border border-bronze/30 shadow-md mb-4">
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-bronze/20">
                              <Plus className="w-5 h-5 text-bronze" />
                            </div>
                            <CardTitle className="text-deep-forest">Add New Data Field</CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select 
                              value={editLanguages[person.id] || "en"} 
                              onValueChange={(value: Language) => setEditLanguages(prev => ({ ...prev, [person.id]: value }))}
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
                            {fieldKey === "other" && (
                              <Input
                                value={fieldKey === "other" ? "" : fieldKey}
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
                        {/* Action buttons for Add Data Field moved below the card */}
                      </CardContent>
                    </Card>
                  )}
                  {/* Personnel Information Card only */}
                  <div className="space-y-4">
                    <div className="flex justify-end mb-4">
                      <ToggleGroup type="single" value={editLanguages[person.id] || "en"} onValueChange={(value) => value && setEditLanguages(prev => ({ ...prev, [person.id]: value as Language }))} className="bg-white border border-deep-forest/30">
                        <ToggleGroupItem value="en" className={"px-4 py-1 text-deep-forest font-medium border-none outline-none "+((editLanguages[person.id]||"en")==="en"?"bg-bronze text-white !rounded-none !shadow-none border-b-2 border-bronze":"hover:bg-bronze/10 !rounded-none !shadow-none")}>EN</ToggleGroupItem>
                        <ToggleGroupItem value="am" className={"px-4 py-1 text-deep-forest font-medium border-none outline-none "+((editLanguages[person.id]||"en")==="am"?"bg-bronze text-white !rounded-none !shadow-none border-b-2 border-bronze":"hover:bg-bronze/10 !rounded-none !shadow-none")}>AM</ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {/* First row: First Name and Last Name side by side */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="edit-firstName">First Name</Label>
                          <Input
                            id="edit-firstName"
                            value={editForm.firstName || ""}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, firstName: e.target.value }))}
                            placeholder="Enter first name"
                            className="bg-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-lastName">Last Name</Label>
                          <Input
                            id="edit-lastName"
                            value={editForm.lastName || ""}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, lastName: e.target.value }))}
                            placeholder="Enter last name"
                            className="bg-white"
                          />
                        </div>
                      </div>

                      {/* Second row: Position dropdown (full width) */}
                      <div className="mt-4">
                        <Label htmlFor="edit-position">Position ({(editLanguages[person.id] || "en").toUpperCase()})</Label>
                        <Select
                          value={editForm.position?.[editLanguages[person.id] || "en"] || ""}
                          onValueChange={(value) =>
                            setEditForm((prev) => ({ 
                              ...prev, 
                              position: { 
                                en: prev.position?.en || "", 
                                am: prev.position?.am || "", 
                                [editLanguages[person.id] || "en"]: value 
                              } 
                            }))
                          }
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select position" />
                          </SelectTrigger>
                          <SelectContent>
                            {positions
                              .filter((pos) => pos[editLanguages[person.id] || "en"] && pos[editLanguages[person.id] || "en"] !== "")
                              .map((pos) => (
                                <SelectItem key={pos.en} value={pos[editLanguages[person.id] || "en"]}>
                                  {pos[editLanguages[person.id] || "en"]}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Third row: Department dropdown (full width) */}
                      <div className="mt-4">
                        <Label htmlFor="edit-department">Department ({(editLanguages[person.id] || "en").toUpperCase()})</Label>
                        <Select
                          value={editForm.department?.[editLanguages[person.id] || "en"] || ""}
                          onValueChange={(value) =>
                            setEditForm((prev) => ({ 
                              ...prev, 
                              department: { 
                                en: prev.department?.en || "", 
                                am: prev.department?.am || "", 
                                [editLanguages[person.id] || "en"]: value 
                              } 
                            }))
                          }
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments
                              .filter((dept) => {
                                const lang = editLanguages[person.id] || "en";
                                return dept[lang] && dept[lang] !== "";
                              })
                              .map((dept) => {
                                const lang = editLanguages[person.id] || "en";
                                return (
                                  <SelectItem key={dept.en} value={dept[lang]}>
                                    {dept[lang]}
                                  </SelectItem>
                                );
                              })}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Fourth row: Location dropdowns in a single row */}
                      <div className="mt-4">
                        <Label htmlFor="edit-location">Location</Label>
                        <div className="flex gap-2 mt-1">
                          <Select
                            value={editForm.block || ""}
                            onValueChange={value => {
                              setEditForm((prev: any) => ({
                                ...prev,
                                block: value,
                                location: composeLocation(value, prev.floor, prev.office)
                              }))
                            }}
                          >
                            <SelectTrigger className="w-28 bg-white"><SelectValue placeholder="Block" /></SelectTrigger>
                            <SelectContent>
                              {blocks.map(block => (
                                <SelectItem key={block} value={block}>{block}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={editForm.floor || ""}
                            onValueChange={value => {
                              setEditForm((prev: any) => ({
                                ...prev,
                                floor: value,
                                location: composeLocation(prev.block, value, prev.office)
                              }))
                            }}
                          >
                            <SelectTrigger className="w-28 bg-white"><SelectValue placeholder="Floor" /></SelectTrigger>
                            <SelectContent>
                              {floors.map(floor => (
                                <SelectItem key={floor} value={floor}>{floor}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={editForm.office || ""}
                            onValueChange={value => {
                              setEditForm((prev: any) => ({
                                ...prev,
                                office: value,
                                location: composeLocation(prev.block, prev.floor, value)
                              }))
                            }}
                          >
                            <SelectTrigger className="w-32 bg-white"><SelectValue placeholder="Office No." /></SelectTrigger>
                            <SelectContent>
                              {offices.map(office => (
                                <SelectItem key={office} value={office}>{office}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Input
                          id="edit-location"
                          value={composeLocation(editForm.block, editForm.floor, editForm.office) || ""}
                          readOnly
                          className="mt-2 bg-white"
                          placeholder="Location will be composed automatically"
                        />
                      </div>

                      {/* Fifth row: Profile Photo upload (full width, modern drag/drop style) */}
                      <div className="mt-6">
                        <Label htmlFor="edit-photoUrl" className="block font-semibold mb-1">Profile Photo</Label>
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-bronze/40 rounded-lg p-4 bg-white/60 relative group transition-all duration-200">
                          <div className="flex flex-col items-center w-full">
                            <span className="text-2xl mb-2">📁</span>
                            <label htmlFor="edit-photoUrl" className="cursor-pointer px-4 py-2 bg-bronze text-white rounded shadow hover:bg-bronze/90 transition-all text-sm font-medium mb-1">Upload Photo</label>
                            <span className="text-xs text-gray-500 mb-2">or drag image here</span>
                            <Input
                              id="edit-photoUrl"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = (e.target as HTMLInputElement).files?.[0]
                                if (file) {
                                  const url = URL.createObjectURL(file)
                                  setEditForm((prev) => ({ ...prev, photoUrl: url }))
                                }
                              }}
                            />
                            <div
                              className="w-full h-24 flex items-center justify-center mt-2 border border-dashed border-bronze/30 rounded bg-alabaster/60"
                              onDragOver={e => e.preventDefault()}
                              onDrop={e => {
                                e.preventDefault();
                                const file = e.dataTransfer.files?.[0];
                                if (file && file.type.startsWith('image/')) {
                                  const url = URL.createObjectURL(file);
                                  setEditForm((prev) => ({ ...prev, photoUrl: url }));
                                }
                              }}
                            >
                              {editForm.photoUrl ? (
                                <Image src={editForm.photoUrl} alt="Preview" width={64} height={64} className="rounded-full object-contain" />
                              ) : (
                                <span className="text-gray-400 text-xs">Preview area</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Show all custom fields for this personnel */}
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
                            className="bg-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Action buttons OUTSIDE the Personnel Information card */}
                  <div className="flex flex-col sm:flex-row gap-2 mt-6 sm:justify-between">
                    <div className="flex gap-2 mt-4 mb-4">
                      <Button
                        onClick={() => handleSave(person.id)}
                        className="bg-bronze hover:bg-bronze/90 text-white min-w-[160px] mr-1"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Personnel Info
                      </Button>
                      <Button
                        type="button"
                        className="bg-deep-forest hover:bg-deep-forest/90 text-white min-w-[160px] ml-2"
                        onClick={() => setShowAddField(person.id)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Data Field
                      </Button>
                    </div>
                    <div className="flex gap-2 mt-4 mb-4">
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        className="border-deep-forest/30 text-deep-forest hover:bg-deep-forest hover:text-alabaster min-w-[160px] mr-2"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="text-white min-w-[160px] ml-2" 
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this personnel? This action cannot be undone.")) {
                            setPersonnel((prev) => prev.filter((p) => p.id !== person.id))
                            setEditingId(null)
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Personnel
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#EF842D]" />
                      <span className="text-sm">{person.location}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
              </div>
              <div className="flex items-center justify-center h-full px-6">
                {editingId !== person.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingId(editingId === person.id ? null : person.id)}
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

      {/* No personnel found card removed as requested */}
    </div>
  )
}


