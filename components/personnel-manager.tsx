"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Plus, Edit, Save, X, Search, Trash2 } from "lucide-react"
import Image from "next/image"
import { FaUserCircle } from "react-icons/fa"
import { useRouter } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"

type Language = "en" | "am"

interface Personnel {
  id: string
  fullName: string
  position: { en: string; am: string }
  department: { en: string; am: string }
  photoUrl?: string
}

const initialFormData: Partial<Personnel> = {
  fullName: "",
  position: { en: "", am: "" },
  department: { en: "", am: "" },
  photoUrl: "",
};

export default function PersonnelManager() {
  const router = useRouter()
  const [personnel, setPersonnel] = useState<Personnel[]>([])
  const [blocks, setBlocks] = useState<any[]>([]) // New state for blocks
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Personnel>>(initialFormData);
  const [currentLang, setCurrentLang] = useState<Language>("en")

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem('isAuthenticated') !== 'true') {
      router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }
    fetchPersonnel();
    fetchBlocks(); // Add this line
  }, [router]);

  async function fetchPersonnel() {
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch('/api/personnel');
      if (!res.ok) {
        throw new Error('Failed to fetch personnel data');
      }
      const data = await res.json();
      const personnelArr: Personnel[] = data.map((p: any) => ({
        id: p.id,
        fullName: p.wname,
        position: { en: p.wtitle, am: p.wtitleamh || '' },
        department: { en: p.department, am: '' },
        photoUrl: p.photo_url || '',
        location: ''
      }));
      setPersonnel(personnelArr);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchBlocks() {
    try {
      const res = await fetch('/api/departments'); // Fetch from departments API
      if (!res.ok) {
        throw new Error('Failed to fetch blocks data');
      }
      const data = await res.json();
      // Extract unique block names from department data
      const uniqueBlocks = Array.from(new Set(data.map((row: any) => row.block || row.building || 'Unknown Block')));
      setBlocks(uniqueBlocks);
    } catch (err) {
      console.error('Error fetching blocks:', err);
      // Decide how to handle this error, maybe set a separate error state for blocks
    }
  }

  const departments = Array.from(new Map(personnel.filter(p => p.department.en && p.department.en.trim()).map(p => [p.department.en, { en: p.department.en, am: p.department.am }])).values())
  const positions = Array.from(new Set(personnel.map(p => p.position.en && p.position.en.trim()).filter(Boolean))).map(en => ({ en, am: '' }))

  const filteredPersonnel = useMemo(() => personnel.filter((person) => {
    // Filter out personnel with empty or null fullName
    if (!person.fullName || person.fullName.trim() === '') {
      return false;
    }

    const matchesSearch =
      debouncedSearchTerm === "" ||
      person.fullName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      (person.position.en && person.position.en.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
      (person.department.en && person.department.en.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))

    const matchesDepartment = departmentFilter === "all" || person.department.en === departmentFilter

    return matchesSearch && matchesDepartment
  }), [personnel, debouncedSearchTerm, departmentFilter])

  const handleAddNew = () => {
    setEditingId("new");
    setFormData(initialFormData);
    setCurrentLang("en");
  };

  const handleEdit = (person: Personnel) => {
    setEditingId(person.id)
    setFormData({ ...person })
    setCurrentLang("en")
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData(initialFormData)
  }

  const handleSave = async () => {
    const isNew = editingId === "new";
    const method = isNew ? 'POST' : 'PUT';
    const url = '/api/personnel';

    const body = {
      id: isNew ? undefined : editingId,
      wname: formData.fullName,
      wnameamh: formData.fullName,
      wtitle: formData.position?.en,
      wtitleamh: formData.position?.am,
      wcontact: '',
      department: formData.department?.en,
      photoUrl: formData.photoUrl
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`Failed to ${isNew ? 'add' : 'update'} personnel`);
      }

      await fetchPersonnel(); // Refetch all personnel data
      handleCancel(); // Close form and reset state
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
  };


  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this personnel entry? This action cannot be undone.")) {
      try {
        const res = await fetch(`/api/personnel`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
        if (!res.ok) {
          throw new Error('Failed to delete personnel');
        }
        setPersonnel((prev) => prev.filter((p) => p.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    }
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedFormChange = (field: 'position' | 'department', lang: Language, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value,
      }
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <div className="space-y-6">
      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bronze"></div>
          <p className="text-deep-forest mt-4">Loading personnel data...</p>
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
                PERSONNEL MANAGEMENT
              </h2>
              <p className="text-sm text-bronze mt-1">Manage staff information, assignments, and contact details</p>
            </div>
            {!editingId && (
              <Button 
                onClick={handleAddNew} 
                className="bg-bronze hover:bg-bronze/90 text-white shadow-lg px-6 py-2 font-medium border border-bronze/20 transition-all duration-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                ADD PERSONNEL
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
                          {Array.from(new Set(departments.map(dept => dept.en).filter(name => name && name.trim() !== "")))
                            .sort((a, b) => a.localeCompare(b))
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

            {/* Add/Edit Personnel Form */}
            {editingId && (
              <Card className="mb-4 bg-alabaster border border-deep-forest/20">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                      <FaUserCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <CardTitle className="text-deep-forest">
                      {editingId === 'new' ? 'Add New Personnel' : 'Edit Personnel'}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Personnel Information */}
                  <div className="bg-alabaster/50 rounded-lg p-4 border border-deep-forest">
                    <h4 className="text-lg font-semibold text-deep-forest mb-4">
                      Personnel Information
                    </h4>
                    <div className="flex justify-end mb-4">
                      <ToggleGroup type="single" value={currentLang} onValueChange={(lang: Language) => lang && setCurrentLang(lang)} className="bg-white border border-deep-forest/30">
                        <ToggleGroupItem value="en" className={`px-4 py-1 text-deep-forest font-medium border-none outline-none ${currentLang === "en" ? "bg-bronze text-white !rounded-none !shadow-none border-b-2 border-bronze" : "hover:bg-bronze/10 !rounded-none !shadow-none"}`}>EN</ToggleGroupItem>
                        <ToggleGroupItem value="am" className={`px-4 py-1 text-deep-forest font-medium border-none outline-none ${currentLang === "am" ? "bg-bronze text-white !rounded-none !shadow-none border-b-2 border-bronze" : "hover:bg-bronze/10 !rounded-none !shadow-none"}`}>AM</ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-deep-forest font-medium">Full Name</Label>
                        <Input
                          value={formData.fullName || ''}
                          onChange={e => handleFormChange('fullName', e.target.value)}
                          placeholder="Enter full name"
                          className="bg-white mt-1 border-deep-forest/30 focus:border-bronze focus:ring-bronze/20"
                        />
                      </div>
                      <div>
                        <Label className="text-deep-forest font-medium">Position ({currentLang.toUpperCase()})</Label>
                        <Select
                          value={formData.position?.[currentLang] || ''}
                          onValueChange={value => handleNestedFormChange('position', currentLang, value)}
                        >
                          <SelectTrigger className="bg-white mt-1 border-deep-forest/30 focus:border-bronze focus:ring-bronze/20">
                            <SelectValue placeholder="Select position" />
                          </SelectTrigger>
                          <SelectContent>
                            {positions.map(pos => (
                              <SelectItem key={pos.en} value={pos.en}>{pos.en}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-deep-forest font-medium">Department ({currentLang.toUpperCase()})</Label>
                        <Select
                          value={formData.department?.[currentLang] || ''}
                          onValueChange={value => handleNestedFormChange('department', currentLang, value)}
                        >
                          <SelectTrigger className="bg-white mt-1 border-deep-forest/30 focus:border-bronze focus:ring-bronze/20">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map(dep => (
                              <SelectItem key={dep.en} value={dep.en}>{dep.en}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-deep-forest font-medium">Photo</Label>
                        <Input
                          type="file"
                          onChange={handleFileChange}
                          className="bg-white mt-1 border-deep-forest/30 focus:border-bronze focus:ring-bronze/20"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    <Button onClick={handleSave} className="bg-bronze hover:bg-bronze/90 text-white">
                      <Save className="w-4 h-4 mr-2" />
                      Save Personnel
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
                </CardContent>
              </Card>
            )}

            {/* Personnel List */}
            {!editingId && filteredPersonnel.map((person) => (
              <Card key={person.id} className="bg-alabaster backdrop-blur-xl border border-deep-forest/20 hover:border-2 hover:border-[#EF842D] transition-colors min-h-[120px] shadow-lg">
                <div className="flex items-center justify-between h-full">
                  <div className="flex-1">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                            {person.photoUrl ? (
                              <Image src={person.photoUrl} alt={person.fullName} width={32} height={32} className="object-contain rounded-full" />
                            ) : (
                              <FaUserCircle className="w-8 h-8 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-lg text-deep-forest font-semibold">{person.fullName}</CardTitle>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs border-bronze/50 text-bronze">
                              {person.position.en}
                            </Badge>
                          </div>
                          
                          
                        </div>
                      </div>
                    </CardContent>
                  </div>
                  <div className="flex items-center justify-center h-full px-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(person)}
                      className="bg-deep-forest hover:bg-deep-forest/90 text-white border border-deep-forest/20 shadow-lg transition-all duration-300 mr-2"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(person.id)}
                      className="text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}