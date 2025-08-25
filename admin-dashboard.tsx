"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutGrid, LogOut, Users, Settings, Building } from "lucide-react"
import { MdAccountTree, MdInsertComment } from "react-icons/md"

import DepartmentManager from "./components/department-manager"
import SystemSettings from "./components/system-settings"
import BlockManager from "./components/block-manager"
import PersonnelManager from "./components/personnel-manager"
import CommentsManager from "./components/comments-manager"
import Image from "next/image"

interface AdminDashboardProps {
  onLogout?: () => void
}




export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const router = useRouter();
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialTab = searchParams?.get('tab') || "departments";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    // When tab changes, update the URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set('tab', activeTab);
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [activeTab]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('isAuthenticated');
      sessionStorage.removeItem('username');
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <Image src="/era-logo.png" alt="ERA Logo" width={40} height={40} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#B85A1A]">ERA Wayfinding System</h1>
              <p className="text-sm text-gray-600">Administrative Control Panel</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center gap-2 bg-transparent hover:bg-bronze hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5 bg-alabaster border border-deep-forest/20 shadow-lg rounded-none">
            <TabsTrigger 
              value="departments" 
              className="flex items-center gap-2 transition-all duration-300 hover:bg-[#B85A1A] hover:text-white data-[state=active]:bg-[#B85A1A] data-[state=active]:text-white rounded-none"
            >
              <MdAccountTree className="w-4 h-4" />
              Departments
            </TabsTrigger>
            <TabsTrigger 
              value="blocks" 
              className="flex items-center gap-2 transition-all duration-300 hover:bg-[#B85A1A] hover:text-white data-[state=active]:bg-[#B85A1A] data-[state=active]:text-white rounded-none"
            >
              <Building className="w-4 h-4" />
              Blocks
            </TabsTrigger>
            <TabsTrigger 
              value="personnel" 
              className="flex items-center gap-2 transition-all duration-300 hover:bg-[#B85A1A] hover:text-white data-[state=active]:bg-[#B85A1A] data-[state=active]:text-white rounded-none"
            >
              <Users className="w-4 h-4" />
              Personnel
            </TabsTrigger>
            <TabsTrigger 
              value="comments" 
              className="flex items-center gap-2 transition-all duration-300 hover:bg-[#B85A1A] hover:text-white data-[state=active]:bg-[#B85A1A] data-[state=active]:text-white rounded-none"
            >
              <MdInsertComment className="w-4 h-4" />
              Comments
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex items-center gap-2 transition-all duration-300 hover:bg-[#B85A1A] hover:text-white data-[state=active]:bg-[#B85A1A] data-[state=active]:text-white rounded-none"
            >
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="departments" className="space-y-6">
            <Card>
              <CardContent className="pt-10">
                <DepartmentManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blocks" className="space-y-6">
            <Card>
              <CardContent className="pt-10">
                <BlockManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personnel" className="space-y-6">
            <Card>
              <CardContent className="pt-10">
                <PersonnelManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments" className="space-y-6">
            <Card>
              <CardContent className="pt-10">
                <CommentsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure system-wide settings and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <SystemSettings />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
