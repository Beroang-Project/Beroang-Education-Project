"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { type LucideIcon } from "lucide-react"
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
  SidebarMenuBadge,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarMenuAction,
} from "@/components/ui/sidebar"
import { useAIAssistantStore } from "@/store/aiAssistantStore"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    badge?: string
    isAI?: boolean
  }[]
}) {
  const pathname = usePathname()
  const { history } = useAIAssistantStore()

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
      <SidebarMenu className="gap-1 mt-2">
        {items.map((item) => {
          const active = isActive(item.url)

          if (item.isAI) {
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={active}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={active}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span className="flex-1 text-[15px]">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>

                  {history.length > 0 && (
                    <>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuAction>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                          >
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                          <span className="sr-only">Toggle</span>
                        </SidebarMenuAction>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {history.map((h) => (
                            <SidebarMenuSubItem key={h.id}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname === `/asisten-ai?chat=${h.id}`}
                              >
                                <Link href={`/asisten-ai?chat=${h.id}`}>
                                  <span className="truncate">{h.title}</span>
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
            )
          }

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={active}
                tooltip={item.title}
                className={
                  active
                    ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                    : "hover:bg-transparent hover:text-primary"
                }
              >
                <Link href={item.url} className="py-5 text-[15px]">
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
              {item.badge && (
                <SidebarMenuBadge className="bg-primary/20 text-primary border border-primary/30 font-bold px-1.5 h-4 text-[9px] right-2">
                  {item.badge}
                </SidebarMenuBadge>
              )}
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
