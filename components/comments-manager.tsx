'use client'

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Search, Trash2, ChevronDown, ChevronRight } from "lucide-react"
import { TbReportAnalytics } from "react-icons/tb";
import { RiFeedbackFill } from "react-icons/ri";
import { FaBug, FaUserCircle } from "react-icons/fa";
import { useRouter } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"

interface GeneralComment {
  id: number;
  date: string;
  comment_type: string;
  comment: string;
  category: string; // This is no longer used for categorization, but we'll keep it to avoid breaking the interface
}

interface PersonnelComment {
  id: number;
  department: string;
  title: string;
  name: string;
  feedback_date: string;
  feedback_text: string;
}

function GeneralCommentList({ comments, onDelete }: { comments: GeneralComment[], onDelete: (id: number) => void }) {
  const sortedComments = useMemo(() => {
    return [...comments].sort((a, b) => a.comment_type.localeCompare(b.comment_type));
  }, [comments]);

  return (
    <div className="px-6 pb-4">
      <Separator className="mb-3" style={{ backgroundColor: '#EF842D' }} />
      <div className="space-y-3 mt-2">
        {sortedComments.length > 0 ? (
          sortedComments.map((comment) => (
            <div key={comment.id} className="flex items-center p-2 bg-deep-forest/15 rounded-md">
              {/* Left Section: Comment Text */}
              <div className="flex-1 text-left ml-8">
                <p className="text-xs text-bronze font-bold">
                  {comment.comment}
                </p>
              </div>

              {/* Middle Section: Date */}
              <div className="flex-1 flex justify-center">
                <span className="text-xs text-bronze font-semibold">{new Date(comment.date).toLocaleDateString()}</span>
              </div>

              {/* Right Section: Delete Button */}
              <div className="flex-1 flex justify-end mr-8">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="bg-red-500 hover:bg-red-500">
                      <Trash2 className="w-4 h-4 text-white hover:text-white" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the comment.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="hover:bg-deep-forest">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(comment.id)} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-bronze">No comments in this category.</p>
        )}
      </div>
    </div>
  )
}

function PersonnelCommentList({ comments, onDelete, showComments, setShowComments }: { comments: PersonnelComment[], onDelete: (id: number) => void, showComments: string | null, setShowComments: (name: string | null) => void }) {
  const commentsByPerson = useMemo(() => {
    return comments.reduce((acc, comment) => {
      if (!acc[comment.name]) {
        acc[comment.name] = [];
      }
      acc[comment.name].push(comment);
      return acc;
    }, {} as Record<string, PersonnelComment[]>);
  }, [comments]);

  return (
    <div className="space-y-4">
      {Object.entries(commentsByPerson).map(([name, personComments]) => (
        <Card key={name} className="bg-alabaster border border-deep-forest/20 hover:border-2 hover:border-[#EF842D] transition-colors min-h-[96px] shadow-lg">
          <div>
            <CardHeader className="pb-3">
                <div className="flex items-center w-full min-h-[80px] gap-6">
                  <div className="flex items-center gap-3 flex-1 ml-6">
                    <span className="text-lg text-deep-forest font-bold">{name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowComments(showComments === name ? null : name)}
                      className="p-1.5 text-bronze hover:[&>svg]:text-alabaster"
                    >
                      {showComments === name ? (
                        <ChevronDown className="w-7 h-7" />
                      ) : (
                        <ChevronRight className="w-6 h-6" />
                      )}
                    </Button>
                  </div>
                  <div className="flex-shrink-0 mr-6">
                    <Badge variant="outline" className="text-xs border-bronze/30 text-bronze">
                      {personComments.length} comments
                    </Badge>
                  </div>
                </div>
              </CardHeader>
          </div>
          {showComments === name && (
            <div className="px-6 pb-4">
              <Separator className="mb-3" style={{ backgroundColor: '#EF842D' }} />
              <div className="space-y-3 mt-2">
                {personComments.map((comment) => (
                  <div key={comment.id} className="flex items-center p-2 bg-deep-forest/15 rounded-md">
                    <div className="flex-1 text-left ml-8">
                      <p className="text-xs text-bronze font-bold">
                        {comment.feedback_text}
                      </p>
                    </div>
                    <div className="flex-1 flex justify-center">
                      <span className="text-xs text-bronze font-semibold">{new Date(comment.feedback_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex-1 flex justify-end mr-8">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="bg-red-500 hover:bg-red-500">
                            <Trash2 className="w-4 h-4 text-white hover:text-white" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the comment.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="hover:bg-deep-forest">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(comment.id)} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}


export default function CommentsManager() {
  const router = useRouter()
  const [generalComments, setGeneralComments] = useState<GeneralComment[]>([])
  const [personnelComments, setPersonnelComments] = useState<PersonnelComment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("general")
  const [showComments, setShowComments] = useState<string | null>(null)
  const [showPersonnelComments, setShowPersonnelComments] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [personnelDepartmentFilter, setPersonnelDepartmentFilter] = useState("all")

  // Check authentication
  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem('isAuthenticated') !== 'true') {
      router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }
  }, [router])

  // Load all comments data
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [generalRes, personnelRes] = await Promise.all([
          fetch('/api/general_comm'),
          fetch('/api/personnel_comm'),
        ]);

        if (!generalRes.ok || !personnelRes.ok) {
          throw new Error('Failed to fetch comments');
        }

        const generalData = await generalRes.json();
        const personnelData = await personnelRes.json();

        setGeneralComments(generalData);
        setPersonnelComments(personnelData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleDelete = async (id: number, type: 'general' | 'personnel') => {
    try {
      const url = type === 'general' ? '/api/general_comm' : '/api/personnel_comm';
      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error('Failed to delete comment');
      }

      if (type === 'general') {
        setGeneralComments((prev) => prev.filter((comment) => comment.id !== id));
      } else {
        setPersonnelComments((prev) => prev.filter((comment) => comment.id !== id));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const feedbackComments = useMemo(() => generalComments.filter(c => c.comment_type === 'Feedback'), [generalComments]);
  const issueComments = useMemo(() => generalComments.filter(c => c.comment_type === 'Issue'), [generalComments]);
  const reportComments = useMemo(() => generalComments.filter(c => c.comment_type === 'Report'), [generalComments]);

  const filteredPersonnelComments = useMemo(() => {
    return personnelComments.filter((comment) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        comment.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        comment.department.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        comment.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        comment.feedback_text.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesDepartment =
        personnelDepartmentFilter === "all" || comment.department === personnelDepartmentFilter;
      return matchesSearch && matchesDepartment;
    });
  }, [personnelComments, debouncedSearchTerm, personnelDepartmentFilter]);

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bronze mx-auto mb-4"></div>
            <p className="text-deep-forest">Loading comments...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="text-red-800 font-medium mb-2">Error Loading Data</h3>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Header */}
      {!isLoading && (
        <>
          <div className="flex items-center justify-between">
            <div className="pl-1">
              <h2 className="text-2xl font-bold text-deep-forest">
                COMMENTS MANAGEMENT
              </h2>
              <p className="text-sm text-bronze mt-1">Manage general and personnel-specific comments</p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-alabaster border border-deep-forest/20 shadow-lg">
              <TabsTrigger
                value="general"
                className="flex items-center gap-2 transition-all duration-300 hover:bg-bronze hover:text-white data-[state=active]:bg-bronze data-[state=active]:text-alabaster rounded-none"
              >
                General Comments
              </TabsTrigger>
              <TabsTrigger
                value="personnel"
                className="flex items-center gap-2 transition-all duration-300 hover:bg-bronze hover:text-alabaster data-[state=active]:bg-bronze data-[state=active]:text-alabaster rounded-none"
              >
                Personnel Comments
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <div className="space-y-4">
                <Card className="bg-alabaster border border-deep-forest/20 hover:border-2 hover:border-[#EF842D] transition-colors min-h-[96px] shadow-lg">
                  <div>
                    <div className="flex-1">
                      <CardHeader className="pb-3">
                        <div className="flex items-center w-full min-h-[80px] gap-6">
                          <div className="flex items-center gap-3 flex-1 ml-6">
                            <div className="w-8 h-8 flex items-center justify-center font-semibold text-lg text-bronze">
                              <RiFeedbackFill />
                            </div>
                            <span className="text-lg text-deep-forest font-bold">Feedback</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowComments(showComments === 'feedback' ? null : 'feedback')}
                              className="p-1.5 text-bronze hover:[&>svg]:text-alabaster"
                            >
                              {showComments === 'feedback' ? (
                                <ChevronDown className="w-7 h-7" />
                              ) : (
                                <ChevronRight className="w-6 h-6" />
                              )}
                            </Button>
                          </div>
                          <div className="flex-shrink-0 mr-6">
                            <Badge variant="outline" className="text-xs border-bronze/30 text-bronze">
                              {feedbackComments.length} comments
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                    </div>
                  </div>
                  {showComments === 'feedback' && (
                    <GeneralCommentList comments={feedbackComments} onDelete={(id) => handleDelete(id, 'general')} />
                  )}
                </Card>
                <Card className="bg-alabaster border border-deep-forest/20 hover:border-2 hover:border-[#EF842D] transition-colors min-h-[96px] shadow-lg">
                  <div>
                    <div className="flex-1">
                      <CardHeader className="pb-3">
                        <div className="flex items-center w-full min-h-[80px] gap-6">
                          <div className="flex items-center gap-3 flex-1 ml-6">
                            <div className="w-8 h-8 flex items-center justify-center font-semibold text-lg text-bronze">
                              <FaBug />
                            </div>
                            <span className="text-lg text-deep-forest font-bold">Issue</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowComments(showComments === 'issue' ? null : 'issue')}
                              className="p-1.5 text-bronze hover:[&>svg]:text-alabaster"
                            >
                              {showComments === 'issue' ? (
                                <ChevronDown className="w-7 h-7" />
                              ) : (
                                <ChevronRight className="w-6 h-6" />
                              )}
                            </Button>
                          </div>
                          <div className="flex-shrink-0 mr-6">
                            <Badge variant="outline" className="text-xs border-bronze/30 text-bronze">
                              {issueComments.length} comments
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                    </div>
                  </div>
                  {showComments === 'issue' && (
                    <GeneralCommentList comments={issueComments} onDelete={(id) => handleDelete(id, 'general')} />
                  )}
                </Card>
                <Card className="bg-alabaster border border-deep-forest/20 hover:border-2 hover:border-[#EF842D] transition-colors min-h-[96px] shadow-lg">
                  <div>
                    <div className="flex-1">
                      <CardHeader className="pb-3">
                        <div className="flex items-center w-full min-h-[80px] gap-6">
                          <div className="flex items-center gap-3 flex-1 ml-6">
                            <div className="w-8 h-8 flex items-center justify-center font-semibold text-lg text-bronze">
                              <TbReportAnalytics />
                            </div>
                            <span className="text-lg text-deep-forest font-bold">Report</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowComments(showComments === 'report' ? null : 'report')}
                              className="p-1.5 text-bronze hover:[&>svg]:text-alabaster"
                            >
                              {showComments === 'report' ? (
                                <ChevronDown className="w-7 h-7" />
                              ) : (
                                <ChevronRight className="w-6 h-6" />
                              )}
                            </Button>
                          </div>
                          <div className="flex-shrink-0 mr-6">
                            <Badge variant="outline" className="text-xs border-bronze/30 text-bronze">
                              {reportComments.length} comments
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                    </div>
                  </div>
                  {showComments === 'report' && (
                    <GeneralCommentList comments={reportComments} onDelete={(id) => handleDelete(id, 'general')} />
                  )}
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="personnel">
              <div className="bg-alabaster backdrop-blur-sm border border-deep-forest/20 shadow-lg mb-4">
                <div className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bronze w-4 h-4" />
                      <Input
                        placeholder="Search personnel comments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full bg-white border-deep-forest/30 text-deep-forest placeholder:text-deep-forest/60 focus:border-bronze focus:ring-bronze/20"
                      />
                    </div>
                    <div className="w-80">
                      <Select value={personnelDepartmentFilter} onValueChange={setPersonnelDepartmentFilter}>
                        <SelectTrigger
                          className="bg-white border-deep-forest/30 text-deep-forest focus:border-bronze focus:ring-bronze/20"
                        >
                          <SelectValue placeholder="Filter by department" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-deep-forest/20">
                          {Array.from(new Set(personnelComments.map(comment => comment.department).filter(department => department && department.trim() !== "")))
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
                </div>
              </div>
              <PersonnelCommentList comments={filteredPersonnelComments} onDelete={(id) => handleDelete(id, 'personnel')} showComments={showPersonnelComments} setShowComments={setShowPersonnelComments} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}