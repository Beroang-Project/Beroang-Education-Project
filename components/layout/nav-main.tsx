"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { type LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    badge?: string
  }[]
}) {
  const pathname = usePathname()

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
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild 
                isActive={active} 
                tooltip={item.title}
                className={active ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary" : "hover:bg-transparent hover:text-primary"}
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
