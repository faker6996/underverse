"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopHeader } from "@/components/layout/TopHeader";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarWidth, setSidebarWidth] = useState(256); // 64 * 4 = 256px (w-64)

  // Listen for sidebar width changes
  useEffect(() => {
    const handleSidebarToggle = (event: CustomEvent) => {
      setSidebarWidth(event.detail.isExpanded ? 256 : 80); // w-64 : w-20
    };

    window.addEventListener('sidebarToggle', handleSidebarToggle as EventListener);
    
    return () => {
      window.removeEventListener('sidebarToggle', handleSidebarToggle as EventListener);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Sidebar */}
      <Sidebar />
      
      {/* Fixed Header */}
      <TopHeader />
      
      {/* Main Content Area with margins for fixed elements */}
      <main 
        className="pt-16 overflow-y-auto transition-all duration-300 ease-in-out"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}