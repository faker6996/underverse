"use client";

import { useState, useEffect } from "react";
import { APP_ROLE } from "@/lib/constants/enum";

export function useUserRole() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read role from cookie
    const cookies = document.cookie.split(';');
    const roleCookie = cookies.find(c => c.trim().startsWith('role='));

    if (roleCookie) {
      const roleValue = roleCookie.split('=')[1];
      setRole(roleValue);
    }

    setLoading(false);
  }, []);

  const isAdmin = role === APP_ROLE.ADMIN || role === APP_ROLE.SUPER_ADMIN;
  const isSuperAdmin = role === APP_ROLE.SUPER_ADMIN;

  return {
    role,
    loading,
    isAdmin,
    isSuperAdmin,
  };
}