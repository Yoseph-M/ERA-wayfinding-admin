
"use client"

// Reset file input and error when switching between personnel
// (must be after hooks are defined)

import { useState, useEffect, useMemo, useRef } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Separator } from "../components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../components/ui/alert-dialog"
import { Plus, Edit, Save, X, Search, Trash2 } from "lucide-react"
import Image from "next/image"
import { FaUserCircle } from "react-icons/fa"
import { useRouter } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"
import { toast } from "@/hooks/use-toast"

type Language = "en" | "am"

interface Personnel {
  id: string
  fullName: { en: string; am: string }
  position: { en: string; am: string }
  department: { en: string; am: string }
  phoneNumber?: string;
  photo?: string;
}

const initialFormData: Partial<Personnel> = {
  fullName: { en: "", am: "" },
  position: { en: "", am: "" },
  department: { en: "", am: "" },
  phoneNumber: "",
  photo: "",
};

export default function PersonnelManager() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter()
  const [personnel, setPersonnel] = useState<Personnel[]>([])
  const [blocks, setBlocks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Personnel>>(initialFormData);
  const [currentLang, setCurrentLang] = useState<Language>("en")
  const [isFormDirty, setIsFormDirty] = useState(false);
  const originalFormData = useRef<Partial<Personnel>>(initialFormData);
  const [saveDialogMessage, setSaveDialogMessage] = useState("Are you sure you want to save these changes?");
  const [isSaveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [isCancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  // Dynamically loaded list of available images in public/era_Images
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  useEffect(() => {
    async function fetchImages() {
      try {
        const res = await fetch('/api/era_images');
        if (!res.ok) throw new Error('Failed to fetch images');
        const data = await res.json();
        setAvailableImages(data.images || []);
      } catch (err) {
        setAvailableImages([]);
      }
    }
    fetchImages();
  }, []);

  const isSaveButtonDisabled = useMemo(() => {
    const isNewEntry = editingId === "new";
    const isFullNameEmpty = !formData.fullName?.en; // Only check English for primary validation
    const isPositionEmpty = !formData.position?.en; // Only check English for primary validation

    // If it's a new entry, disable if full name or position (English) are empty
    if (isNewEntry) {
      return isFullNameEmpty || isPositionEmpty;
    } else {
      // If editing existing, disable if no changes or if full name or position (English) become empty
      return !isFormDirty || isFullNameEmpty || isPositionEmpty;
    }
  }, [formData, isFormDirty, editingId]);

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
      const imageFiles = [
        "Ato alemayehu Ayele.jpg",
        "Ato Daniel Girma.jpg",
        "Ato Daniel Mengiste.jpg",
        "Ato Dereje.jpg",
        "Ato Kasaye tsige.jpg",
        "Ato Robel Bekele.jpg",
        "Ato samson.jpg",
        "Ato sisay Bekele.jpg",
        "Ato Tsega Seboka.jpg",
        "Ato Yared Shewangizaw.jpg",
        "Ato yetimgeta.jpg",
        "Eng Dejene Gutu.jpg",
        "Eng Genet Alemayehu.jpg",
        "Eng Melka Bekele.jpg",
        "Eng Zekariyas.jpg",
        "Eng Zeyineba.jpg",
        "Eng. Hirut.jpg",
        "Eng.Mohammed.jpg",
        "Female.jpg",
        "Male.jpg",
        "Wro Aster.jpg",
        "Wro Brehan.jpg",
        "Wrt Misrak Gashaw.jpg"
      ];

    const personnelArr: Personnel[] = data
      .map((p: any) => {
        const fullNameEn = p.wname ?? "";
        return {
          id: p.id,
          fullName: { en: fullNameEn, am: p.wnameamh ?? "" },
          position: { en: p.wtitle ?? "", am: p.wtitleamh ?? "" },
          department: { en: p.department ?? "", am: p.departmentamh ?? "" },
          phoneNumber: p.wcontact ?? "",
          photo: p.photo ?? "",
        };
      });
      // Only sort by fullName, and handle possible null/empty values
      personnelArr.sort((a, b) => {
        const nameA = a.fullName?.en?.toLowerCase() || "";
        const nameB = b.fullName?.en?.toLowerCase() || "";
        return nameA.localeCompare(nameB);
      });
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

  const departments = Array.from(new Map(personnel.filter(p => (p.department.en && p.department.en.trim()) || (p.department.am && p.department.am.trim())).map(p => [p.department.en, { en: p.department.en, am: p.department.am }])).values())
  const positions = Array.from(new Map(personnel.filter(p => (p.position.en && p.position.en.trim()) || (p.position.am && p.position.am.trim())).map(p => [p.position.en, { en: p.position.en, am: p.position.am }])).values())

  const filteredPersonnel = useMemo(() => personnel.filter((person) => {
    // Filter out personnel with empty or null fullName
    if (!person.fullName || person.fullName.en.trim() === '') {
      return false;
    }

    const matchesSearch =
      debouncedSearchTerm === "" ||
      person.fullName.en.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      (person.position.en && person.position.en.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
      (person.department.en && person.department.en.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))

    const matchesDepartment = departmentFilter === "all" || person.department.en === departmentFilter

    return matchesSearch && matchesDepartment
  }), [personnel, debouncedSearchTerm, departmentFilter])

  const handleAddNew = () => {
    setEditingId("new");
    setFormData(initialFormData);
    setCurrentLang("en");
    setIsFormDirty(false); // New form is clean
    originalFormData.current = initialFormData; // Set original for new form
  };

  const handleEdit = (person: Personnel) => {
    setEditingId(person.id)
    setFormData({ ...person })
    setCurrentLang("en")
    setIsFormDirty(false); // Editing an existing, so initially clean
    originalFormData.current = { ...person }; // Store original data
  }

  const handleCancel = () => {
    setEditingId(null);
    setFormData(initialFormData);
    setIsFormDirty(false); // Form is no longer dirty after cancel
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newFormData = { ...prev, [name]: value };
      setIsFormDirty(!areFormsEqual(newFormData, originalFormData.current));
      return newFormData;
    });
  };

  const handleNestedFormChange = (field: keyof Personnel, lang: Language, value: string) => {
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [field]: {
          ...(prev[field] as { en: string; am: string }),
          [lang]: value,
        },
      };
      setIsFormDirty(!areFormsEqual(newFormData, originalFormData.current));
      return newFormData;
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select a valid image file.');
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => {
        const newFormData = { ...prev, photo: reader.result as string };
        setIsFormDirty(!areFormsEqual(newFormData, originalFormData.current));
        return newFormData;
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.onerror = () => {
      setPhotoError('Failed to read image file.');
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!formData.fullName || !formData.position?.en) {
      alert("Please fill in all required fields (Full Name, Position) before saving.");
      return
    }

    const isNew = editingId === "new";
    const method = isNew ? 'POST' : 'PUT';
    const url = '/api/personnel';

    const body = {
      id: isNew ? undefined : editingId,
      wname: formData.fullName?.en,
      wnameamh: formData.fullName?.am,
      wtitle: formData.position?.en,
      wtitleamh: formData.position?.am,
      wcontact: formData.phoneNumber || '',
      department: formData.department?.en,
      departmentamh: formData.department?.am,
      photo: formData.photo || '',
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

      const data = await res.json();

      // Optimistically update local state instead of full reload
      if (isNew) {
        setPersonnel(prev => [
          {
            id: data.id || Math.random().toString(),
            fullName: { en: formData.fullName?.en || '', am: formData.fullName?.am || '' },
            position: { en: formData.position?.en || '', am: formData.position?.am || '' },
            department: { en: formData.department?.en || '', am: formData.department?.am || '' },
            phoneNumber: formData.phoneNumber || '',
            photo: formData.photo || '',
          },
          ...prev,
        ]);
      } else {
        setPersonnel(prev => prev.map(p =>
          p.id === editingId
            ? {
                ...p,
                fullName: { en: formData.fullName?.en || '', am: formData.fullName?.am || '' },
                position: { en: formData.position?.en || '', am: formData.position?.am || '' },
                department: { en: formData.department?.en || '', am: formData.department?.am || '' },
                phoneNumber: formData.phoneNumber || '',
                photo: formData.photo || '',
              }
            : p
        ));
      }
      toast({
        title: `Personnel ${isNew ? 'added' : 'updated'} successfully!`,
        description: `${formData.fullName?.en || ''} has been ${isNew ? 'added' : 'updated'}.`,
      });
      handleCancel();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
  };


  const handleDelete = async (id: string) => {
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
  };

  // Helper to compare form data (simple deep comparison for relevant fields)
  const areFormsEqual = (form1: Partial<Personnel>, form2: Partial<Personnel>) => {
    return (
      form1.fullName?.en === form2.fullName?.en &&
      form1.fullName?.am === form2.fullName?.am &&
      form1.position?.en === form2.position?.en &&
      form1.position?.am === form2.position?.am &&
      form1.department?.en === form2.department?.en &&
      form1.department?.am === form2.department?.am &&
      form1.phoneNumber === form2.phoneNumber &&
      form1.photo === form2.photo
    );
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
                            {departments
                              .filter(dep => dep.en && dep.en.trim()) // Keep existing filter
                              .sort((a, b) => (a.en || "").localeCompare(b.en || ""))
                              .map((department) => (
                                <SelectItem key={department.en} value={department.en} className="text-deep-forest hover:bg-bronze/10">
                                  {department[currentLang]}
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
                        <Label className="text-deep-forest font-medium">Full Name ({currentLang.toUpperCase()})</Label>
                        <Input
                          value={formData.fullName?.[currentLang] || ''}
                          onChange={e => handleNestedFormChange('fullName', currentLang, e.target.value)}
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
                            <SelectValue placeholder="Select position">{formData.position?.[currentLang]}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {positions
                              .sort((a, b) => (a[currentLang] || "").localeCompare(b[currentLang] || ""))
                              .map(pos => (
                                <SelectItem key={pos.en} value={pos.en}>{pos[currentLang]}</SelectItem>
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
                            <SelectValue placeholder="Select department">{formData.department?.[currentLang]}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {departments
                              .sort((a, b) => (a.en || "").localeCompare(b.en || ""))
                              .map(dep => (
                                <SelectItem key={dep.en} value={dep.en}>{dep[currentLang]}</SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-deep-forest font-medium">Phone Number</Label>
                        <Input
                          type="tel"
                          name="phoneNumber"
                          value={formData.phoneNumber || ''}
                          onChange={handleInputChange}
                          placeholder="Enter phone number"
                          className="bg-white mt-1 border-deep-forest/30 focus:border-bronze focus:ring-bronze/20"
                        />
                      </div>
                      <div>
                        <Label className="text-deep-forest font-medium">Photo</Label>
                        {/* Only show avatar preview after image is uploaded/selected */}
                        {formData.photo && formData.photo !== '' && !photoError && (
                          <div className="mt-2 mb-2 w-24 h-24 relative rounded-full overflow-hidden border-4 border-bronze flex items-center justify-center bg-white shadow-lg">
                            <img
                              src={formData.photo}
                              alt="Personnel Photo"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                setPhotoError('Failed to display image.');
                              }}
                            />
                          </div>
                        )}
                        {photoError && (
                          <div className="text-xs text-red-600 mb-2">{photoError}</div>
                        )}
                        {/* Select image from public/era_Images */}
                        <div className="mb-2">
                          <Label className="text-deep-forest text-xs">Choose from existing images</Label>
                          <Select
                            value={formData.photo && formData.photo.startsWith('/era_Images/') ? formData.photo : ''}
                            onValueChange={val => {
                              setFormData(prev => {
                                const newFormData = { ...prev, photo: val };
                                setIsFormDirty(!areFormsEqual(newFormData, originalFormData.current));
                                return newFormData;
                              });
                              setPhotoError(null);
                            }}
                          >
                            <SelectTrigger className="w-full mt-1 border-deep-forest/30 focus:border-bronze focus:ring-bronze/20 bg-white text-deep-forest flex justify-center items-center">
                              <span className="w-full flex justify-center items-center">
                                <SelectValue 
                                  placeholder="-- Select an image --"
                                  className="text-center text-[#888] w-full" 
                                  style={{ textAlign: 'center', color: '#888', width: '100%' }}
                                />
                              </span>
                            </SelectTrigger>
                            <SelectContent className="bg-white border-deep-forest/20">
                              {availableImages.length === 0 ? (
                                <div className="text-center text-xs text-gray-400 p-2">No images available</div>
                              ) : (
                                availableImages.slice().sort((a, b) => a.localeCompare(b)).map(img => (
                                  <SelectItem key={img} value={`/era_Images/${img}`}>{img}</SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        {/* Remove file input field (choose file) as requested */}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:justify-end w-full">
                    <Button
                      className="bg-bronze hover:bg-bronze/90 text-white min-w-[160px]"
                      disabled={isSaveButtonDisabled}
                      onClick={() => {
                        if (!formData.fullName?.en || !formData.position?.en) {
                          setSaveDialogMessage("Please fill in all required fields (Full Name, Department, Position) before saving.");
                          setSaveConfirmOpen(true);
                        } else if (!isFormDirty) {
                          setSaveDialogMessage("You must make a change to save.");
                          setSaveConfirmOpen(true);
                        } else {
                          setSaveDialogMessage("Are you sure you want to save these changes? This action cannot be undone.");
                          setSaveConfirmOpen(true);
                        }
                      }}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Personnel info
                    </Button>
                    <AlertDialog open={isSaveConfirmOpen} onOpenChange={setSaveConfirmOpen}>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirm Save</AlertDialogTitle>
                          <AlertDialogDescription>{saveDialogMessage}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel 
                            className="!bg-deep-forest !text-alabaster !shadow-none !ring-0 !filter-none" 
                            onClick={() => setSaveConfirmOpen(false)}
                          >Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            className="!bg-[#B85A1A] !text-white !shadow-none !ring-0 !filter-none"
                            onClick={() => {
                              handleSave();
                              setSaveConfirmOpen(false);
                            }}
                          >{saveDialogMessage.includes("Please fill in all required fields") || saveDialogMessage.includes("You must make a change to save.") ? "Ok" : "Save"}</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-deep-forest/30 text-deep-forest hover:bg-deep-forest hover:text-alabaster min-w-[160px]"
                      onClick={() => {
                        if (isFormDirty) {
                          setCancelConfirmOpen(true);
                        } else {
                          handleCancel();
                        }
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <AlertDialog open={isCancelConfirmOpen} onOpenChange={setCancelConfirmOpen}>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirm Cancel</AlertDialogTitle>
                          <AlertDialogDescription>Are you sure you want to cancel? Any unsaved changes will be lost.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel 
                            className="!bg-deep-forest !text-alabaster !shadow-none !ring-0 !filter-none !hover:bg-deep-forest !focus:bg-deep-forest !active:bg-deep-forest" 
                            onClick={() => setCancelConfirmOpen(false)}
                          >Keep Editing</AlertDialogCancel>
                          <AlertDialogAction 
                            className="!bg-[#B85A1A] !text-alabaster !shadow-none !ring-0 !filter-none"
                            onClick={() => {
                              handleCancel();
                              setCancelConfirmOpen(false);
                            }}
                          >Cancel</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Personnel List */}
            {!editingId && filteredPersonnel.map((person) => (
              <Card key={person.id} className="bg- alabaster backdrop-blur-xl border border-deep-forest/20 hover:border-2 hover:border-bronze transition-colors min-h-[120px] shadow-lg flex items-center">
                <div className="flex w-full min-h-[120px] items-center ml-6">
                  <div className="flex-1 flex items-center">
                    <div className="flex items-center gap-6 w-full">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-deep-forest flex items-center justify-center bg-white shadow-lg">
                        {person.photo ? (
                          <div className="w-full h-full relative rounded-full overflow-hidden">
                            <Image
                              src={person.photo}
                              alt={person.fullName.en || "Personnel Photo"}
                              fill
                              style={{ objectFit: "cover" }}
                            />
                          </div>
                        ) : (
                          <FaUserCircle className="w-14 h-14 text-[#B85A1A]" />
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-lg text-deep-forest font-semibold">{person.fullName[currentLang]}</span>
                        <Badge variant="outline" className="text-xs border-bronze/85 text-bronze">
                          {person.position.en}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center px-6">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(person)}
                        className="!bg-deep-forest !text-white !shadow-none !ring-0 !filter-none border border-deep-forest/20 mr-2"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="!bg-red-600 !text-white !shadow-none !ring-0 !filter-none" onClick={() => setDeleteConfirmOpen(person.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the personnel entry.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="!bg-deep-forest !text-alabaster !shadow-none !ring-0 !filter-none" onClick={() => setDeleteConfirmOpen(null)}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => { handleDelete(person.id); setDeleteConfirmOpen(null); }} className="!bg-red-600 !text-white !shadow-none !ring-0 !filter-none">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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