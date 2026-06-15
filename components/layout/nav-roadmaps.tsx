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
  const { history } = usePlannerStore()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>AI Teaching Planner</SidebarGroupLabel>
      <SidebarMenu className="gap-1 mt-2">
        <Collapsible asChild defaultOpen={isActivePlanner} className="group/collapsible">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Riwayat Roadmap"
              isActive={isActivePlanner}
              className={
                isActivePlanner
                  ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                  : "hover:bg-transparent hover:text-primary"
              }
            >
              <Link href="/planner">
                <Map />
                <span className="flex-1 text-[15px]">Riwayat Roadmap</span>
              </Link>
            </SidebarMenuButton>
            
            {history.length > 0 && (
              <>
                <CollapsibleTrigger asChild>
                  <SidebarMenuAction
                    className={
                      isActivePlanner
                        ? "text-primary hover:bg-primary/20 hover:text-primary"
                        : "hover:bg-accent hover:text-accent-foreground"
                    }
                  >
                    <ChevronRight className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    <span className="sr-only">Toggle</span>
                  </SidebarMenuAction>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {history.map((h) => {
                      // We don't have a specific page for each roadmap yet, so we just link to planner
                      return (
                        <SidebarMenuSubItem key={h.id}>
<SidebarMenuSubButton
                            asChild
                            className="hover:bg-transparent hover:text-primary"
                          >
                            <Link href={`/planner?id=${h.id}`}>
                              <span className="truncate">{h.subject}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
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
