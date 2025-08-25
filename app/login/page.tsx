"use client"

import { useState, useEffect, Suspense } from "react"
import { PiEyeClosed, PiEye } from "react-icons/pi"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"


function LoginContent() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [adminCredentials, setAdminCredentials] = useState<{ adminUsername: string; currentPassword: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
    // Load admin credentials from localStorage (set by system-settings)
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('adminCredentials');
      if (stored) {
        try {
          const creds = JSON.parse(stored);
          setAdminCredentials({
            adminUsername: creds.adminUsername,
            currentPassword: creds.currentPassword
          });
        } catch {}
      }
    }
    if (sessionStorage.getItem('isAuthenticated') === 'true') {
      // Already logged in, redirect to intended page or dashboard
      const redirect = searchParams.get('redirect') || "/";
      router.replace(redirect);
    }
  }, [router, searchParams]);

  const handleLogin = () => {
    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }
    if (!adminCredentials) {
      setError("System credentials not loaded. Please contact admin.");
      return;
    }
    if (
      username.trim() === adminCredentials.adminUsername.trim() &&
      password === adminCredentials.currentPassword
    ) {
      sessionStorage.setItem('isAuthenticated', 'true');
      setError("");
      const redirect = searchParams.get('redirect') || "/";
      router.replace(redirect);
    } else {
      setError("Invalid username or password. Please try again.");
    }
  };

  // Prevent hydration mismatch: only render after mount
  if (!mounted) return null;

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
            <div className="space-y-4">
              <Label htmlFor="username" className="flex items-center gap-2">
                <span>Administrator Username</span>
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                className="w-full"
                required
              />
            </div>
            <div className="space-y-4">
              <Label htmlFor="password" className="flex items-center gap-2">
                Administrator Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full pr-10"
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-bronze focus:outline-none"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <PiEye className="w-5 h-5" /> : <PiEyeClosed className="w-5 h-5" />}
                </button>
              </div>
            </div>
            {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
            <Button onClick={handleLogin} className="w-full bg-bronze" style={{ transition: 'none' }}>
              Access Admin Panel
            </Button>
          </div>
          <div className="mt-4 text-xs text-gray-500 text-center">Authorized Personnel Only</div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
