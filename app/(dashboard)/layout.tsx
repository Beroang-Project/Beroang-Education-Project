'use client'

import { useState, useEffect } from 'react'
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [openSearch, setOpenSearch] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed') === 'true';
    setSidebarCollapsed(saved);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('sidebar-collapsed', String(sidebarCollapsed));
    }
  }, [sidebarCollapsed, mounted]);

  return (
    <div className="flex h-screen">
      <AppSidebar
        onSearchClick={() => setOpenSearch(true)}
        collapsed={mounted ? sidebarCollapsed : false}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader
          openSearch={openSearch}
          setOpenSearch={setOpenSearch}
          sidebarCollapsed={mounted ? sidebarCollapsed : false}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
