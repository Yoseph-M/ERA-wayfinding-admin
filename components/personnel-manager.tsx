"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Save, X, User, MapPin, Briefcase, Search, Trash2 } from "lucide-react"
import Image from "next/image"

type Language = "en" | "am"

interface Personnel {
  id: string
  firstName: string
  lastName: string
  position: { en: string; am: string }
  department: { en: string; am: string }
  directorate: string
  location: string
  photoUrl?: string // Added for personnel photo
  fields?: { [key: string]: string }
}

export default function PersonnelManager() {
  const [personnel, setPersonnel] = useState<Personnel[]>([
    {
      id: "1",
      firstName: "Sara",
      lastName: "Ayele",
      position: { en: "HR Manager", am: "የሰው ሃብት ስራ አስኪያጅ" },
      department: { en: "Human Resources", am: "የሰው ሃብት" },
      directorate: "Corporate Services",
      location: "Block A, Room 201",
      photoUrl: "/placeholder.svg?height=100&width=100",
    },
    {
      id: "2",
      firstName: "Girma",
      lastName: "Tefera",
      position: { en: "IT Specialist", am: "የአይቲ ስፔሻሊስት" },
      department: { en: "Information Technology", am: "የመረጃ ቴክኖሎጂ" },
      directorate: "Operations",
      location: "Block B, Room 305",
      photoUrl: "/placeholder.svg?height=100&width=100",
    },
    {
      id: "3",
      firstName: "Abebe",
      lastName: "Tefera",
      position: { en: "Financial Analyst", am: "የፋይናንስ ተንታኝ" },
      department: { en: "Finance Department", am: "የፋይናንስ ክፍል" },
      directorate: "Corporate Services",
      location: "Block A, Room 105",
      photoUrl: "/placeholder.svg?height=100&width=100",
    },
    {
      id: "4",
      firstName: "Haddis",
      lastName: "Alemayew",
      position: { en: "HR Coordinator", am: "የሰው ሃብት አስተባባሪ" },
      department: { en: "Human Resources", am: "የሰው ሃብት" },
      directorate: "Corporate Services",
      location: "Block A, Room 201",
      photoUrl: "/placeholder.svg?height=100&width=100",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Personnel>>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [newPersonnel, setNewPersonnel] = useState<Partial<Personnel>>({
    firstName: "",
    lastName: "",
    position: { en: "", am: "" },
    department: { en: "", am: "" },
    directorate: "",
    location: "",
    photoUrl: "",
  })
  const [currentLang, setCurrentLang] = useState<Language>("en") // State for current language in forms
  const [editLanguages, setEditLanguages] = useState<{ [key: string]: Language }>({}) // Language state for each editing record
  const [showAddField, setShowAddField] = useState<string | null>(null)
  const [fieldKey, setFieldKey] = useState("")
  const [fieldValue, setFieldValue] = useState("")

  const departments = [
    { en: "Human Resources", am: "የሰው ሃብት" },
    { en: "Information Technology", am: "የመረጃ ቴክኖሎጂ" },
    { en: "Finance Department", am: "የፋይናንስ ክፍል" },
    { en: "Marketing", am: "ግብይት" },
    { en: "Operations", am: "ኦፕሬሽኖች" },
    { en: "Legal Affairs", am: "ህጋዊ ጉዳዮች" },
  ]
  const directorates = [
    { en: "Corporate Services", am: "የድርጅት አገልግሎት" },
    { en: "Operations", am: "ኦፕሬሽኖች" },
    { en: "Public Affairs", am: "የህዝብ ጉዳዮች" },
    { en: "Finance & Administration", am: "ፋይናንስ እና አስተዳደር" }
  ]
  const positions = [
    { en: "Manager", am: "አስተዳዳሪ" },
    { en: "Coordinator", am: "አስተባባሪ" },
    { en: "Specialist", am: "ስፔሻሊስት" },
    { en: "Analyst", am: "ተንታኝ" },
    { en: "Assistant", am: "ረዳት" },
    { en: "Director", am: "ዳይሬክተር" },
    { en: "Supervisor", am: "ሱፐርቫይዘር" },
  ]

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

  const handleAddPersonnel = () => {
    const id = Date.now().toString()
    setPersonnel((prev) => [...prev, { ...newPersonnel, id } as Personnel])
    setNewPersonnel({
      firstName: "",
      lastName: "",
      position: { en: "", am: "" },
      department: { en: "", am: "" },
      directorate: "",
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
      {/* Header with title, description, and add button aligned */}
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
        <Card className="bg-alabaster border border-deep-forest/20 shadow-lg">
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
                    {departments.map((dept) => (
                      <SelectItem key={dept.en} value={dept.en} className="text-deep-forest hover:bg-bronze/10">
                        {dept.en}
                      </SelectItem>
                    ))}
                    <SelectItem value="all" className="text-deep-forest hover:bg-bronze/10">All Departments</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add New Personnel Form */}
      {showAddForm && (
        <Card className="bg-alabaster border border-deep-forest/20">
          <CardHeader>
            <CardTitle className="text-deep-forest">Add New Personnel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-end mb-4">
              <Select value={currentLang} onValueChange={(value: Language) => setCurrentLang(value)}>
                <SelectTrigger 
                  className="w-[120px] bg-white border-deep-forest/30 text-deep-forest focus:border-bronze focus:ring-bronze/20"
                >
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent className="bg-white border-deep-forest/20">
                  <SelectItem value="en" className="text-deep-forest hover:bg-bronze/10">English</SelectItem>
                  <SelectItem value="am" className="text-deep-forest hover:bg-bronze/10">Amharic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-firstName">First Name</Label>
                <Input
                  id="new-firstName"
                  value={newPersonnel.firstName || ""}
                  onChange={(e) => setNewPersonnel((prev) => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label htmlFor="new-lastName">Last Name</Label>
                <Input
                  id="new-lastName"
                  value={newPersonnel.lastName || ""}
                  onChange={(e) => setNewPersonnel((prev) => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Enter last name"
                />
              </div>
              <div>
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
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((pos) => (
                      <SelectItem key={pos.en} value={pos[currentLang]}>
                        {pos[currentLang]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
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
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.en} value={dept[currentLang]}>
                        {dept[currentLang]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="new-directorate">Directorate ({currentLang.toUpperCase()})</Label>
                <Select
                  value={newPersonnel.directorate || ""}
                  onValueChange={(value) => setNewPersonnel((prev) => ({ ...prev, directorate: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select directorate" />
                  </SelectTrigger>
                  <SelectContent>
                    {directorates.map((dir) => (
                      <SelectItem key={dir.en} value={dir[currentLang]}>
                        {dir[currentLang]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="new-location">Location</Label>
                <Input
                  id="new-location"
                  value={newPersonnel.location || ""}
                  onChange={(e) => setNewPersonnel((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter location"
                />
              </div>
              <div>
                <Label htmlFor="new-photoUrl">Photo (Optional)</Label>
                <Input
                  id="new-photoUrl"
                  value={newPersonnel.photoUrl || ""}
                  onChange={(e) => setNewPersonnel((prev) => ({ ...prev, photoUrl: e.target.value }))}
                  placeholder="Enter photo (Optional)"
                />
              </div>
            </div>

            <Separator />
            <div className="flex gap-2">
              <Button onClick={handleAddPersonnel} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                Add Personnel
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)} className="border-deep-forest/30 text-deep-forest hover:bg-deep-forest/5 hover:text-deep-forest">
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
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                        <Image src="/placeholder-user.jpg" alt="Personnel Avatar" width={32} height={32} className="object-contain rounded-full" />
                  </div>
                  <div>
                        <CardTitle className="text-lg">{person.firstName} {person.lastName}</CardTitle>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
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
                <div className="space-y-4">
                  {/* Only show Add Data Field card if showAddField === person.id */}
                  {showAddField === person.id ? (
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
                        <div className="flex gap-2 justify-end">
                          <Button
                            type="button"
                            className="bg-deep-forest hover:bg-deep-forest/90 text-white min-w-[160px]"
                            onClick={() => {
                              const finalFieldKey = fieldKey === "other" ? "" : fieldKey;
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
                      {/* Personnel Information */}
                      <div className="bg-alabaster/50 rounded-lg p-4 border border-deep-forest/10">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-deep-forest">
                            Personnel Information
                          </h4>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>First Name</Label>
                      <Input
                        value={editForm.firstName || ""}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, firstName: e.target.value }))}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input
                        value={editForm.lastName || ""}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Enter last name"
                      />
                    </div>
                    <div>
                      <Label>Position ({(editLanguages[person.id] || "en").toUpperCase()})</Label>
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
                        <SelectTrigger>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                          {positions.map((pos) => (
                            <SelectItem key={pos.en} value={pos[editLanguages[person.id] || "en"]}>
                              {pos[editLanguages[person.id] || "en"]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Department ({(editLanguages[person.id] || "en").toUpperCase()})</Label>
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
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.en} value={dept[editLanguages[person.id] || "en"]}>
                              {dept[editLanguages[person.id] || "en"]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-directorate">Directorate ({(editLanguages[person.id] || "en").toUpperCase()})</Label>
                      <Select
                        value={editForm.directorate || ""}
                        onValueChange={(value) => setEditForm((prev) => ({ ...prev, directorate: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select directorate" />
                        </SelectTrigger>
                        <SelectContent>
                          {directorates.map((dir) => (
                            <SelectItem key={dir.en} value={dir[editLanguages[person.id] || "en"]}>
                              {dir[editLanguages[person.id] || "en"]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-location">Location</Label>
                      <Input
                        id="edit-location"
                        value={editForm.location || ""}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, location: e.target.value }))}
                        placeholder="Enter location"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-photoUrl">Photo</Label>
                      <Input
                        id="edit-photoUrl"
                        value={editForm.photoUrl || ""}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, photoUrl: e.target.value }))}
                        placeholder="Enter photo"
                      />
                          </div>
                    </div>
                  </div>
                  <Separator />
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
                            />
                          </div>
                        </div>
                      ))}
                      <div className="flex flex-col sm:flex-row gap-2 mt-6 sm:justify-between">
                  <div className="flex gap-2">
                          <Button
                            onClick={() => handleSave(person.id)}
                            className="bg-bronze hover:bg-bronze/90 text-white min-w-[160px]"
                          >
                      <Save className="w-4 h-4 mr-2" />
                            Save Personnel Info
                          </Button>
                          <Button
                            type="button"
                            className="bg-deep-forest hover:bg-deep-forest/90 text-white min-w-[160px]"
                            onClick={() => setShowAddField(person.id)}
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
                  )}
                </div>
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

      {filteredPersonnel.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No personnel found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
