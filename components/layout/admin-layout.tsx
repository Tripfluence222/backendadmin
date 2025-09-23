"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { LayoutDebugToggle } from "../dev/LayoutDebugToggle";
import { ClickProbe } from "../dev/ClickProbe";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div 
      className="grid min-h-screen bg-background"
      style={{ 
        gridTemplateColumns: "var(--sidebar-w, 264px) 1fr",
        gridTemplateRows: "var(--topbar-h, 64px) 1fr"
      }}
    >
      {/* Sidebar - spans full height */}
      <div className="lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>
      
      {/* Topbar - spans top row */}
      <div className="lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-2">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
      </div>
      
      {/* Main content - spans bottom row */}
      <main className="lg:col-start-2 lg:col-end-3 lg:row-start-2 lg:row-end-3 min-h-[calc(100vh-var(--topbar-h,64px))] container-admin pt-4 md:pt-6 relative z-10">
        {children}
      </main>
      
      {/* Debug components - only in development */}
      <LayoutDebugToggle />
      <ClickProbe />
    </div>
  );
}
