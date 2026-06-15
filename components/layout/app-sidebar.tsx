"use client"

import * as React from "react"
import { Home, Package, BarChart3, BrainCircuit } from "lucide-react"

import { NavMain } from "@/components/layout/nav-main"
import { NavClasses } from "@/components/layout/nav-classes"
import { NavRoadmaps } from "@/components/layout/nav-roadmaps"
import { NavUser } from "@/components/layout/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useClassStore } from "@/store/classStore"

const data = {
  user: {
    name: "Guru Utama",
    school: "SMA Negeri 1",
    avatar: "",
    initials: "GU"
  },
  navMain: [
    { title: "Beranda", url: "/dashboard", icon: Home },
    { title: "Asisten AI", url: "/asisten-ai", icon: BrainCircuit, isAI: true },
    { title: "Ruang P5", url: "/p5/p1", icon: Package },
    { title: "Analitik", url: "/analytics", icon: BarChart3 },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { classes } = useClassStore()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="group-data-[collapsible=icon]:p-2 px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex aspect-square size-10 group-data-[collapsible=icon]:size-8 items-center justify-center shrink-0 transition-all">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/beroang-logo.svg"
              alt="Beroang Logo"
              className="w-10 h-10 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 transition-all"
            />
          </div>
          <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-bold font-display text-2xl tracking-tight text-foreground">Beroang</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavRoadmaps />
        <NavClasses classes={classes} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
