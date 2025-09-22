"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div 
      className="min-h-screen bg-background"
      style={{
        '--topbar-h': '64px',
        '--sidebar-w': '264px',
      } as React.CSSProperties}
    >
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-[var(--sidebar-w)]">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="pt-4 md:pt-6 lg:pt-8 px-4 md:px-6 xl:px-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
