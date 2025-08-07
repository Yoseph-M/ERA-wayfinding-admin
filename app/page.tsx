"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock } from "lucide-react"
import AdminDashboard from "../admin-dashboard"
import Image from "next/image"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState("")

  // Check for existing authentication on component mount
  useEffect(() => {
    const authStatus = sessionStorage.getItem('isAuthenticated')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = () => {
    // Require both username and password
    if (!username || !password) {
      setError("Please enter both username and password.")
      return
    }
    // Simple username/password check - in production, this would be properly secured
    if (username === "admin" && password === "1234") {
      setIsAuthenticated(true)
      sessionStorage.setItem('isAuthenticated', 'true')
      sessionStorage.setItem('username', username)
      setError("")
    } else {
      setError("Invalid username or password. Please try again.")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleLogin()
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('isAuthenticated')
    sessionStorage.removeItem('username')
    window.location.reload()
  }

  if (isAuthenticated) {
    return <AdminDashboard onLogout={handleLogout} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-lg flex items-center justify-center">
              <Image src="/era-logo.png" alt="ERA Logo" width={64} height={64} />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-[#B85A1A]">ERA Wayfinding</CardTitle>
            <CardDescription className="text-[#EF842D]">Admin Control Panel</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter username"
                className="w-full"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                Administrator Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter admin password"
                className="w-full"
                required
              />
            </div>
            {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
            <Button onClick={handleLogin} className="w-full bg-[#EF842D] hover:bg-[#D67324]">
              Access Admin Panel
            </Button>
          </div>
          <div className="mt-4 text-xs text-gray-500 text-center">Authorized Personnel Only</div>
        </CardContent>
      </Card>
    </div>
  )
}
