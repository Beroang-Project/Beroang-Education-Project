"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, ChevronRight, FolderOpen } from "lucide-react"
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

// Group classes by subject and return unique subjects
function getUniqueSubjects(classes: { id: string; name: string; subject: string }[]) {
  const seen = new Set<string>()
  const result: string[] = []
  for (const cls of classes) {
    if (!seen.has(cls.subject)) {
      seen.add(cls.subject)
      result.push(cls.subject)
    }
  }
  return result
}

export function NavClasses({
  classes,
}: {
  classes: {
    id: string
    name: string
    subject: string
  }[]
}) {
  const pathname = usePathname()
  const isActiveSLS = pathname.startsWith('/class')
  const subjects = getUniqueSubjects(classes)

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Ruang Kelas</SidebarGroupLabel>
      <SidebarMenu className="gap-1 mt-2">
        <Collapsible asChild defaultOpen={isActiveSLS} className="group/collapsible">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Smart Learning Space"
              isActive={isActiveSLS}
              className={
                isActiveSLS
                  ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                  : "hover:bg-transparent hover:text-primary"
              }
            >
              <Link href="/class">
                <BookOpen />
                <span className="flex-1 text-[15px]">Smart Learning Space</span>
              </Link>
            </SidebarMenuButton>
            <CollapsibleTrigger asChild>
              <SidebarMenuAction className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 hover:bg-black/5">
                <ChevronRight className="h-4 w-4" />
              </SidebarMenuAction>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <SidebarMenuSub>
                {/* File Tree: Setiap mata pelajaran */}
                {subjects.map((subject) => {
                  const encodedSubject = encodeURIComponent(subject)
                  const href = `/class/${encodedSubject}`
                  const isActive = pathname === href

                  return (
                    <SidebarMenuSubItem key={subject}>
                      <SidebarMenuSubButton
                        asChild
                        isActive={isActive}
                        className={
                          isActive
                            ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                            : "hover:bg-transparent hover:text-primary"
                        }
                      >
                        <Link href={href} className="py-2">
                          <span className="truncate">{subject}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  )
                })}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  )
}

// Lightweight color helpers (matches getDefaultFolderColor logic)
function getSubjectBg(subject: string): string {
  const s = subject.toLowerCase()
  if (s.includes('biologi') || s.includes('kimia')) return '#DCFCE7'
  if (s.includes('fisika') || s.includes('matematika') || s.includes('informatika')) return '#DBEAFE'
  if (s.includes('ekonomi') || s.includes('geografi')) return '#FFEDD5'
  if (s.includes('indonesia') || s.includes('sastra')) return '#FCE7F3'
  if (s.includes('sejarah') || s.includes('pkn') || s.includes('sosiologi')) return '#FEE2E2'
  if (s.includes('seni') || s.includes('prakarya') || s.includes('penjasorkes')) return '#FEF9C3'
  if (s.includes('inggris') || s.includes('bahasa')) return '#E0F2FE'
  return '#EDE9FE'
}

function getSubjectText(subject: string): string {
  const s = subject.toLowerCase()
  if (s.includes('biologi') || s.includes('kimia')) return '#166534'
  if (s.includes('fisika') || s.includes('matematika') || s.includes('informatika')) return '#1E40AF'
  if (s.includes('ekonomi') || s.includes('geografi')) return '#9A3412'
  if (s.includes('indonesia') || s.includes('sastra')) return '#9D174D'
  if (s.includes('sejarah') || s.includes('pkn') || s.includes('sosiologi')) return '#991B1B'
  if (s.includes('seni') || s.includes('prakarya') || s.includes('penjasorkes')) return '#713F12'
  if (s.includes('inggris') || s.includes('bahasa')) return '#075985'
  return '#5B21B6'
}
