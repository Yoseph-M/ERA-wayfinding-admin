"use client"

import AdminDashboard from "../admin-dashboard";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (sessionStorage.getItem('isAuthenticated') === 'true') {
      setIsAuthenticated(true);
    } else {
      router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [router]);

  if (!mounted) return null;
  if (isAuthenticated) {
    return <AdminDashboard />;
  }
  return null;
}
