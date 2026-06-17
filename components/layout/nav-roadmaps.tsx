"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Map, ChevronRight } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarMenuAction,
} from "@/components/ui/sidebar"
import { usePlannerStore } from "@/store/plannerStore"

export function NavRoadmaps() {
  const pathname = usePathname()
  const isActivePlanner = pathname.startsWith('/planner')
  const { history, clearCurrent } = usePlannerStore()

  const handleMainClick = () => {
    clearCurrent()
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>AI Teaching Planner</SidebarGroupLabel>
      <SidebarMenu className="gap-1 mt-2">
        <Collapsible asChild defaultOpen={isActivePlanner} className="group/collapsible">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Roadmap"
              isActive={isActivePlanner}
            >
              <Link href="/planner" onClick={handleMainClick}>
                <Map />
                <span className="flex-1 text-[15px]">Roadmap</span>
              </Link>
            </SidebarMenuButton>
            
            {history.length > 0 && (
              <>
                <CollapsibleTrigger asChild>
                  <SidebarMenuAction>
                    <ChevronRight className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    <span className="sr-only">Toggle</span>
                  </SidebarMenuAction>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {history.map((h) => (
                      <SidebarMenuSubItem key={h.id}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname === `/planner?id=${h.id}`}
                        >
                          <Link href={`/planner?id=${h.id}`}>
                            <span className="truncate">{h.subject}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </>
            )}
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  )
}
