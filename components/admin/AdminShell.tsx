"use client";

import { useEffect } from "react";
import AdminHeader from "@/components/admin/AdminHeader";

interface AdminShellProps {
  children: React.ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {

  // Hide public header/footer in admin area
  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.setAttribute("data-admin-hide-chrome", "");
    styleEl.innerHTML = `
      [data-site-chrome="header"], [data-site-chrome="footer"] { display: none !important; }
    `;
    document.head.appendChild(styleEl);
    return () => {
      try {
        document.head.removeChild(styleEl);
      } catch {}
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header - sticky */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm shadow-sm">
        <AdminHeader />
      </div>

      {/* Page content */}
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-screen-2xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
