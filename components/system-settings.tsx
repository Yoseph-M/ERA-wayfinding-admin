"use client"

import { useState } from "react"
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

export default function SystemSettings() {
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

  const [languageSettings, setLanguageSettings] = useState({
    enabledLanguages: ["en", "am", "om"],
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
    { code: "om", name: "Afaan Oromo" },
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
  }

  const handleSystemBackup = () => {
    alert("System backup initiated. This may take a few minutes.")
  }

  const handleClearCache = () => {
    alert("System cache cleared successfully!")
  }



  return (
    <div className="space-y-6">

      {/* Admin Credentials */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Admin Credentials
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="adminUsername">Admin Username</Label>
              <Input
                id="adminUsername"
                value={adminCredentials.adminUsername}
                onChange={(e) => handleCredentialChange("adminUsername", e.target.value)}
              />
            </div>
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
          <div>
            <Label htmlFor="securityQuestion">Security Question</Label>
            <Input
              id="securityQuestion"
              value={adminCredentials.securityQuestion}
              onChange={(e) => handleCredentialChange("securityQuestion", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="securityAnswer">Security Answer</Label>
            <Input
              id="securityAnswer"
              value={adminCredentials.securityAnswer}
              onChange={(e) => handleCredentialChange("securityAnswer", e.target.value)}
              placeholder="Enter security answer"
            />
          </div>
          <Button onClick={handleChangePassword} className="bg-[#EF842D] hover:bg-[#D67324]">
            <Key className="w-4 h-4 mr-2" />
            Change Password
          </Button>
        </CardContent>
      </Card>









      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="systemTitle">System Title</Label>
              <Input
                id="systemTitle"
                value={generalSettings.systemTitle}
                onChange={(e) => handleGeneralSettingsChange("systemTitle", e.target.value)}
                placeholder="Enter system name"
              />
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={generalSettings.timezone}
                onValueChange={(value) => handleGeneralSettingsChange("timezone", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="logoUpload">Logo Upload</Label>
              <div className="flex gap-2">
                <Input
                  id="logoUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="flex-1"
                />
                {generalSettings.logoUrl && (
                  <div className="w-10 h-10 rounded border overflow-hidden">
                    <img src={generalSettings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>
          

        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5" />
            Language Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <Label htmlFor="fallbackLanguage">Fallback Language</Label>
              <Select
                value={languageSettings.fallbackLanguage}
                onValueChange={(value) => handleLanguageChange("fallbackLanguage", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label>Export Data</Label>
                <p className="text-sm text-gray-600 mb-2">Download all system settings as JSON</p>
                <Button onClick={handleExportData} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Settings
                </Button>
                {dataManagement.lastExport && (
                  <p className="text-xs text-gray-500 mt-1">
                    Last exported: {new Date(dataManagement.lastExport).toLocaleString()}
                  </p>
                )}
              </div>
              
              <div>
                <Label>Import Data</Label>
                <p className="text-sm text-gray-600 mb-2">Upload settings from JSON file</p>
                <Input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="mb-2"
                />
                {dataManagement.lastImport && (
                  <p className="text-xs text-gray-500">
                    Last imported: {new Date(dataManagement.lastImport).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Backup System</Label>
                <p className="text-sm text-gray-600 mb-2">Create a complete system backup</p>
                <Button onClick={handleBackup} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Create Backup
                </Button>
                {dataManagement.lastBackup && (
                  <p className="text-xs text-gray-500 mt-1">
                    Last backup: {new Date(dataManagement.lastBackup).toLocaleString()}
                  </p>
                )}
              </div>
              
              <div>
                <Label>Restore from Backup</Label>
                <p className="text-sm text-gray-600 mb-2">Restore system from backup file</p>
                <Input
                  type="file"
                  accept=".json"
                  onChange={handleRestore}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Reset All Data
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset All Data</DialogTitle>
                  <DialogDescription>
                    This action will permanently delete all system data including departments, 
                    locations, and settings. This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    const closeButton = document.querySelector('[data-radix-dialog-close]') as HTMLButtonElement
                    closeButton?.click()
                  }}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      alert("All data has been reset!")
                      const closeButton = document.querySelector('[data-radix-dialog-close]') as HTMLButtonElement
                      closeButton?.click()
                    }}
                  >
                    Reset All Data
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete All Departments
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete All Departments</DialogTitle>
                  <DialogDescription>
                    This action will permanently delete all departments and their associated data. 
                    This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    const closeButton = document.querySelector('[data-radix-dialog-close]') as HTMLButtonElement
                    closeButton?.click()
                  }}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      alert("All departments have been deleted!")
                      const closeButton = document.querySelector('[data-radix-dialog-close]') as HTMLButtonElement
                      closeButton?.click()
                    }}
                  >
                    Delete All Departments
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Reset to Default Settings
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset to Default Settings</DialogTitle>
                  <DialogDescription>
                    This action will reset all system settings to their default values. 
                    Custom configurations will be lost.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    const closeButton = document.querySelector('[data-radix-dialog-close]') as HTMLButtonElement
                    closeButton?.click()
                  }}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      alert("Settings have been reset to defaults!")
                      const closeButton = document.querySelector('[data-radix-dialog-close]') as HTMLButtonElement
                      closeButton?.click()
                    }}
                  >
                    Reset Settings
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="bg-red-100 border border-red-300 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="font-medium text-red-700">Warning</span>
            </div>
            <p className="text-sm text-red-600">
              All actions in this section are irreversible and will permanently delete data. 
              Please ensure you have proper backups before proceeding.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* System Maintenance */}
      <Card>
        <CardHeader>
          <CardTitle>System Maintenance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Last Backup</Label>
              <p className="text-sm text-gray-600 mb-2">{settings.lastBackup}</p>
              <Button variant="outline" onClick={handleSystemBackup}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Create Backup
              </Button>
            </div>
            <div>
              <Label>System Cache</Label>
              <p className="text-sm text-gray-600 mb-2">Clear cached data and temporary files</p>
              <Button variant="outline" onClick={handleClearCache}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Clear Cache
              </Button>
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
