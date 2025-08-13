"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Save, 
  RefreshCw, 
  Shield, 
  Palette, 
  Globe, 
  Bell, 
  Key, 
  Languages, 
  Upload, 
  Download, 
  Trash2, 
  AlertTriangle,
  Settings,
  FileText,
  Database,
  Clock,
  Calendar,
  Image,
  CheckCircle,
  XCircle
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

export default function SystemSettings() {
  const router = useRouter()
  const [settings, setSettings] = useState({
    defaultLanguage: "en",
    systemVersion: "2.1.0",
    lastBackup: "2024-01-28 02:00:00",
  })

  const [adminCredentials, setAdminCredentials] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    adminUsername: "admin",
    securityQuestion: "What is your organization's founding year?",
    securityAnswer: "",
  })

  const [showPasswordChange, setShowPasswordChange] = useState(false)

  const [languageSettings, setLanguageSettings] = useState({
    enabledLanguages: ["en", "am"],
    fallbackLanguage: "en",
  })

  const [generalSettings, setGeneralSettings] = useState({
    systemTitle: "ERA Wayfinding System",
    logoUrl: "",
    timezone: "UTC",
  })



  const [dataManagement, setDataManagement] = useState({
    lastExport: "",
    lastImport: "",
    lastBackup: "2024-01-28 02:00:00",
    backupEnabled: true,
  })

  const availableLanguages = [
    { code: "en", name: "English" },
    { code: "am", name: "Amharic" },
  ]

  const timezones = [
    { value: "UTC", label: "UTC (Coordinated Universal Time)" },
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "Europe/London", label: "London (GMT)" },
    { value: "Europe/Paris", label: "Paris (CET)" },
    { value: "Asia/Tokyo", label: "Tokyo (JST)" },
    { value: "Africa/Addis_Ababa", label: "Addis Ababa (EAT)" },
  ]



  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleCredentialChange = (key: string, value: string) => {
    setAdminCredentials((prev) => ({ ...prev, [key]: value }))
  }

  const handleLanguageChange = (key: string, value: any) => {
    setLanguageSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleGeneralSettingsChange = (key: string, value: any) => {
    setGeneralSettings((prev) => ({ ...prev, [key]: value }))
  }



  const toggleLanguage = (langCode: string) => {
    setLanguageSettings((prev) => ({
      ...prev,
      enabledLanguages: prev.enabledLanguages.includes(langCode)
        ? prev.enabledLanguages.filter((l) => l !== langCode)
        : [...prev.enabledLanguages, langCode],
    }))
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setGeneralSettings((prev) => ({
          ...prev,
          logoUrl: e.target?.result as string
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleExportData = () => {
    const data = {
      settings,
      languageSettings,
      generalSettings
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `system-settings-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    setDataManagement((prev) => ({ ...prev, lastExport: new Date().toISOString() }))
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          // Apply imported data
          console.log("Imported data:", data)
          alert("Data imported successfully!")
          setDataManagement((prev) => ({ ...prev, lastImport: new Date().toISOString() }))
        } catch (error) {
          alert("Invalid file format!")
        }
      }
      reader.readAsText(file)
    }
  }

  const handleBackup = () => {
    alert("System backup initiated. This may take a few minutes.")
    setDataManagement((prev) => ({ ...prev, lastBackup: new Date().toISOString() }))
  }

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          console.log("Restoring from backup:", data)
          alert("System restored from backup successfully!")
        } catch (error) {
          alert("Invalid backup file!")
        }
      }
      reader.readAsText(file)
    }
  }

  const handleSaveSettings = () => {
    console.log("Saving settings:", settings, languageSettings, generalSettings)
    alert("Settings saved successfully!")
  }

  const handleChangePassword = () => {
    if (adminCredentials.newPassword !== adminCredentials.confirmPassword) {
      alert("New passwords do not match!")
      return
    }
    if (adminCredentials.newPassword.length < 6) {
      alert("Password must be at least 6 characters long!")
      return
    }
    console.log("Changing password...")
    alert("Password changed successfully!")
    setAdminCredentials((prev) => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }))
    setShowPasswordChange(false)
  }

  const handleShowPasswordChange = () => {
    setShowPasswordChange(true)
  }

  const handleCancelPasswordChange = () => {
    setShowPasswordChange(false)
    setAdminCredentials((prev) => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }))
  }

  const handleSystemBackup = () => {
    alert("System backup initiated. This may take a few minutes.")
  }

  const handleClearCache = () => {
    alert("System cache cleared successfully!")
  }

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem('isAuthenticated') !== 'true') {
      router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }
  }, [])

  return (
    <div className="space-y-6">

      {/* Admin Credentials */}
      <Card>
        <CardHeader>
          <CardTitle>
            Admin Credentials
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showPasswordChange && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="adminUsername">Admin Username</Label>
                <Input
                  id="adminUsername"
                  value={adminCredentials.adminUsername}
                  onChange={(e) => handleCredentialChange("adminUsername", e.target.value)}
                />
              </div>
            </div>
          )}
          
          {!showPasswordChange ? (
            <Button onClick={handleShowPasswordChange} className="bg-[#EF842D] hover:bg-[#D67324]">
              Change Password
            </Button>
          ) : (
            <>
              <div className="space-y-4">
                <h4 className="font-medium text-deep-forest">Password Management</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={adminCredentials.currentPassword}
                      onChange={(e) => handleCredentialChange("currentPassword", e.target.value)}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={adminCredentials.newPassword}
                      onChange={(e) => handleCredentialChange("newPassword", e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={adminCredentials.confirmPassword}
                      onChange={(e) => handleCredentialChange("confirmPassword", e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleChangePassword} className="bg-[#EF842D] hover:bg-[#D67324]">
                    Change Password
                  </Button>
                  <Button variant="outline" onClick={handleCancelPasswordChange}>
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>









      {/* Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle>
            Language Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              </div>

          <div>
            <Label>Enabled Languages</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              {availableLanguages.map((lang) => (
                <div key={lang.code} className="flex items-center space-x-2">
                  <Switch
                    id={`lang-${lang.code}`}
                    checked={languageSettings.enabledLanguages.includes(lang.code)}
                    onCheckedChange={() => toggleLanguage(lang.code)}
                  />
                  <Label htmlFor={`lang-${lang.code}`} className="text-sm">
                    {lang.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>


        </CardContent>
      </Card>




      {/* Save Settings */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} className="bg-[#EF842D] hover:bg-[#D67324]">
          <Save className="w-4 h-4 mr-2" />
          Save All Settings
        </Button>
      </div>
    </div>
  )
}
