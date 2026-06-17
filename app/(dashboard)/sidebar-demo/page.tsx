"use client"

import * as React from "react"
import { DrilldownSidebar, type DrilldownMenuItem } from "@/components/ui/drilldown-sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const sampleMenu: DrilldownMenuItem[] = [
  {
    label: "Dashboard",
    icon: undefined,
  },
  {
    label: "Analytics",
    icon: undefined,
    children: [
      { label: "Overview", onClick: () => console.log("Overview") },
      { label: "Reports", onClick: () => console.log("Reports") },
      { section: "Export", label: "Export Data", onClick: () => console.log("Export") },
      { section: "Export", label: "Scheduled Reports", onClick: () => console.log("Scheduled") },
    ],
  },
  {
    label: "Content",
    icon: undefined,
    badge: "New",
    children: [
      { label: "All Content", onClick: () => console.log("All Content") },
      { label: "Categories", onClick: () => console.log("Categories") },
      { label: "Tags", onClick: () => console.log("Tags") },
      { section: "Drafts", label: "Pending Review", onClick: () => console.log("Pending") },
      { section: "Drafts", label: "Scheduled", onClick: () => console.log("Scheduled") },
    ],
  },
  {
    label: "Settings",
    icon: undefined,
    children: [
      { section: "General", label: "Profile", onClick: () => console.log("Profile") },
      { section: "General", label: "Preferences", onClick: () => console.log("Preferences") },
      { section: "Workspace", label: "Members", onClick: () => console.log("Members") },
      { section: "Workspace", label: "Billing", onClick: () => console.log("Billing") },
    ],
  },
  {
    label: "Help Center",
    icon: undefined,
  },
]

export default function SidebarDemoPage() {
  const [active, setActive] = React.useState<string | null>(null)

  return (
    <div className="flex h-screen">
      <DrilldownSidebar
        items={sampleMenu}
        user={
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarFallback className="rounded-lg">UN</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">User Name</p>
              <p className="text-xs text-muted-foreground truncate">user@email.com</p>
            </div>
          </div>
        }
        activeLabel={active ?? undefined}
        onActiveChange={setActive}
        width="16rem"
      />
      <main className="flex-1 flex items-center justify-center bg-muted/20">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Active item:</p>
          <p className="text-lg font-semibold">{active ?? "(none)"}</p>
        </div>
      </main>
    </div>
  )
}
