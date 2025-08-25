"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PiEye, PiEyeClosed } from "react-icons/pi"
import { Label } from "../components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { useRouter } from "next/navigation"

export default function SystemSettings() {
  const router = useRouter()
  // Load from localStorage or use defaults
  const getInitialAdminCredentials = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("adminCredentials");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // ignore parse error
        }
      }
    }
    return {
      currentPassword: "admin123",
      newPassword: "",
      confirmPassword: "",
      adminUsername: "admin",
    };
  };

  type AdminCredentials = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    adminUsername: string;
    newUsername?: string;
  };
  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials>(getInitialAdminCredentials);

  // Save to localStorage on change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("adminCredentials", JSON.stringify(adminCredentials));
    }
  }, [adminCredentials]);

  const [settings, setSettings] = useState({
    defaultLanguage: "en",
    systemVersion: "2.1.0",
    lastBackup: "2024-01-28 02:00:00",
  });
  const [settingsChanged, setSettingsChanged] = useState(false);

  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [showAdminPassword, setShowAdminPassword] = useState(false)
  const [showVerifyPassword, setShowVerifyPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [step, setStep] = useState<'verify' | 'change'>("verify");
  const [verifyInputs, setVerifyInputs] = useState({
    username: "",
    password: "",
  });
  const [verifyError, setVerifyError] = useState("");

  // Only keep what's actually used in the UI
  const handleCredentialChange = (key: keyof AdminCredentials, value: string) => {
    setAdminCredentials((prev) => ({ ...prev, [key]: value }));
    setSettingsChanged(true);
  }
  const handleSettingsChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSettingsChanged(true);
  }
  const handleSaveSettings = () => {
    console.log("Saving settings:", settings);
    alert("Settings saved successfully!");
    setSettingsChanged(false);
  }

  const handleChangePassword = () => {
    // Use newUsername if provided, otherwise keep the old one
    const newUsername = adminCredentials.newUsername && adminCredentials.newUsername.trim() !== ""
      ? adminCredentials.newUsername.trim()
      : adminCredentials.adminUsername;
    if (adminCredentials.newPassword !== adminCredentials.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    if (adminCredentials.newPassword.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }
    setAdminCredentials((prev) => ({
      ...prev,
      adminUsername: newUsername,
      currentPassword: prev.newPassword,
      newPassword: "",
      confirmPassword: "",
      newUsername: ""
    }));
    alert("Admin username and password changed successfully!");
    setShowPasswordChange(false);
  }

  const handleShowPasswordChange = () => {
    setShowPasswordChange(true);
    setStep("verify");
    setVerifyInputs({ username: "", password: "" });
    setVerifyError("");
  }

  const handleCancelPasswordChange = () => {
    setShowPasswordChange(false);
    setStep("verify");
    setVerifyInputs({ username: "", password: "" });
    setVerifyError("");
    setAdminCredentials((prev) => ({ ...prev, newPassword: "", confirmPassword: "" }));
  }

  const handleVerify = () => {
    // Compare with trimmed values to avoid whitespace issues
    if (
      verifyInputs.username.trim() === adminCredentials.adminUsername.trim() &&
      verifyInputs.password === adminCredentials.currentPassword
    ) {
      setStep("change");
      setVerifyError("");
    } else {
      setVerifyError("Incorrect username or password.");
    }
  }


  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem('isAuthenticated') !== 'true') {
      router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
    }
  }, [router])

  return (
    <div className="max-w-6xl mx-auto py-8">
      <Card className="mb-8 bg-alabaster">
        <CardHeader>
          <CardTitle>Admin Credentials</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Main Admin Credentials Card */}
            {!showPasswordChange && (
              <>
                <div className="flex flex-col gap-6">
                  <div>
                    <Label htmlFor="admin-username">Username</Label>
                    <Input
                      id="admin-username"
                      value={adminCredentials.adminUsername}
                      readOnly
                      autoComplete="username"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="admin-password">Password</Label>
                    <div className="relative flex items-center mt-2">
                      <Input
                        id="admin-password"
                        type={showAdminPassword ? "text" : "password"}
                        value={adminCredentials.currentPassword}
                        readOnly
                        autoComplete="current-password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 flex items-center justify-center"
                        onClick={() => setShowAdminPassword(v => !v)}
                        tabIndex={-1}
                        aria-label={showAdminPassword ? "Hide password" : "Show password"}
                      >
                        {showAdminPassword ? <PiEyeClosed className="w-5 h-5" /> : <PiEye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={handleShowPasswordChange}
                    className="mt-2 bg-[#B85A1A] text-alabaster border-none hover:bg-[#B85A1A] hover:text-alabaster focus:bg-[#B85A1A] focus:text-alabaster"
                    style={{ boxShadow: 'none' }}
                  >
                    Change Admin Credentials
                  </Button>
                </div>
              </>
            )}
            {showPasswordChange && (
              <div className="mt-4 border-t pt-4" style={{ borderTopColor: '#B85A1A', borderTopWidth: 2 }}>
                {step === "verify" ? (
                  <div className="flex flex-col gap-6">
                     <Label className="font-xxs">Verify Current Credentials</Label>
                    <div>
                      <Label>Username</Label>
                      <Input
                        placeholder="Username"
                        value={verifyInputs.username}
                        onChange={e => setVerifyInputs(v => ({ ...v, username: e.target.value }))}
                        autoComplete="username"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Password</Label>
                      <div className="relative flex items-center mt-2">
                        <Input
                          placeholder="Password"
                          type={showVerifyPassword ? "text" : "password"}
                          value={verifyInputs.password}
                          onChange={e => setVerifyInputs(v => ({ ...v, password: e.target.value }))}
                          autoComplete="current-password"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 flex items-center justify-center"
                          onClick={() => setShowVerifyPassword(v => !v)}
                          tabIndex={-1}
                          aria-label={showVerifyPassword ? "Hide password" : "Show password"}
                        >
                          {showVerifyPassword ? <PiEyeClosed className="w-5 h-5" /> : <PiEye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    {verifyError && <div className="text-red-500 text-sm">{verifyError}</div>}
                    <div className="flex gap-2 mt-2 justify-end">
                      <Button onClick={handleVerify} type="button" className="bg-[#B85A1A] text-alabaster border-none hover:bg-[#B85A1A] hover:text-alabaster focus:bg-[#B85A1A] focus:text-alabaster" style={{ boxShadow: 'none' }}>Verify</Button>
                      <Button onClick={handleCancelPasswordChange} type="button" variant="ghost" className="border border-deep-forest hover:bg-deep-forest hover:text-alabaster">Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    <div>
                      <Label>New Username</Label>
                      <Input
                        value={adminCredentials.newUsername || ""}
                        onChange={e => handleCredentialChange("newUsername", e.target.value)}
                        autoComplete="username"
                        placeholder="Enter new username"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>New Password</Label>
                      <div className="relative flex items-center mt-2">
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          value={adminCredentials.newPassword}
                          onChange={e => handleCredentialChange("newPassword", e.target.value)}
                          autoComplete="new-password"
                          placeholder="Enter new password"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 flex items-center justify-center"
                          onClick={() => setShowNewPassword(v => !v)}
                          tabIndex={-1}
                          aria-label={showNewPassword ? "Hide password" : "Show password"}
                        >
                          {showNewPassword ? <PiEyeClosed className="w-5 h-5" /> : <PiEye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label>Confirm New Password</Label>
                      <div className="relative flex items-center mt-2">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          value={adminCredentials.confirmPassword}
                          onChange={e => handleCredentialChange("confirmPassword", e.target.value)}
                          autoComplete="new-password"
                          placeholder="Confirm new password"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 flex items-center justify-center"
                          onClick={() => setShowConfirmPassword(v => !v)}
                          tabIndex={-1}
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? <PiEyeClosed className="w-5 h-5" /> : <PiEye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2 justify-end">
                      <Button onClick={handleChangePassword} type="button" className="bg-[#B85A1A] text-alabaster border-none hover:bg-[#B85A1A] hover:text-alabaster focus:bg-[#B85A1A] focus:text-alabaster" style={{ boxShadow: 'none' }}>Save</Button>
                      <Button onClick={handleCancelPasswordChange} type="button" variant="ghost" className="border border-deep-forest hover:bg-deep-forest hover:text-alabaster">Cancel</Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Save Settings button removed as requested */}
    </div>
  );
}