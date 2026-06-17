"use client"

import { useRouter, usePathname } from "next/navigation"
import { useRef, useState } from "react"
import { Home, Package, BarChart3, BrainCircuit, Map, BookOpen, Plus, MessageSquare, FileText, Pencil, Trash2, MoreHorizontal, Check, X, Pin } from "lucide-react"

import { DrilldownSidebar } from "@/components/ui/drilldown-sidebar"
import { useClassStore } from "@/store/classStore"
import { usePlannerStore } from "@/store/plannerStore"
import { useAIAssistantStore } from "@/store/aiAssistantStore"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function AppSidebar({ onSearchClick, collapsed }: { onSearchClick?: () => void; collapsed?: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const { classes } = useClassStore()
  const { history: plannerHistory, setCurrentOutput, clearCurrent } = usePlannerStore()
  const { history: aiHistory, deleteChat, updateChatTitle } = useAIAssistantStore()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')

  const getActiveLabel = () => {
    if (pathname === '/dashboard') return 'Beranda'
    if (pathname.startsWith('/asisten-ai')) {
      const chatId = pathname.split('?chat=')[1]
      if (chatId) {
        const chat = aiHistory.find(h => h.id === chatId)
        return chat?.title || 'Asisten AI'
      }
      return 'Asisten AI'
    }
    if (pathname.startsWith('/planner')) {
      const roadmapId = pathname.split('?id=')[1]
      if (roadmapId) {
        const roadmap = plannerHistory.find(h => h.id === roadmapId)
        return roadmap?.subject || 'Roadmap'
      }
      return 'Roadmap'
    }
    if (pathname.startsWith('/class')) {
      const subject = decodeURIComponent(pathname.split('/class/')[1] || '')
      return subject || 'Smart Learning Space'
    }
    if (pathname.startsWith('/p5')) return 'Ruang P5'
    if (pathname.startsWith('/analytics')) return 'Analitik'
    return 'Beranda'
  }

  const menuItems = [
    { 
      label: "Beranda", 
      icon: Home,
      onClick: () => router.push('/dashboard')
    },
    { 
      label: "Asisten AI", 
      icon: BrainCircuit,
      onClick: () => router.push('/asisten-ai'),
      children: [
        { label: "Percakapan Baru", icon: Plus, isNew: true, onClick: () => router.push('/asisten-ai') },
        ...aiHistory.map(h => ({
          id: h.id,
          label: h.title,
          section: "Riwayat Chat",
          icon: MessageSquare,
          onClick: () => router.push(`/asisten-ai?chat=${h.id}`),
          actions: (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                <span className="h-6 w-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground cursor-pointer">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="right" className="w-40">
                <DropdownMenuItem
                  onClick={e => {
                    e.stopPropagation()
                    setEditingId(h.id)
                    setEditingTitle(h.title)
                  }}
                  className="gap-2 text-xs cursor-pointer"
                >
                  <Pencil className="h-3 w-3" /> Edit Judul
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={e => {
                    e.stopPropagation()
                    if (confirm(`Hapus chat "${h.title}"?`)) {
                      deleteChat(h.id)
                      toast.success('Chat dihapus!')
                      if (pathname.includes(h.id)) router.push('/asisten-ai')
                    }
                  }}
                  className="gap-2 text-xs cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-3 w-3" /> Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        }))
      ]
    },
    { 
      label: "Roadmap", 
      icon: Map,
      onClick: () => { clearCurrent(); router.push('/planner') },
      children: [
        { label: "Roadmap Baru", icon: Plus, isNew: true, onClick: () => { clearCurrent(); router.push('/planner') } },
        ...plannerHistory.map(h => ({
          label: h.subject,
          section: "Riwayat Roadmap",
          icon: FileText,
          onClick: () => {
            setCurrentOutput(h)
            router.push(`/planner?id=${h.id}`)
          }
        }))
      ]
    },
    { 
      label: "Smart Learning Space", 
      icon: BookOpen,
      onClick: () => router.push('/class'),
      children: [
        { label: "Kelas Baru", icon: Plus, isNew: true, onClick: () => router.push('/class') },
        ...getUniqueSubjects(classes).map(subject => ({
          label: subject,
          section: "Mata Pelajaran",
          icon: BookOpen,
          onClick: () => router.push(`/class/${encodeURIComponent(subject)}`)
        }))
      ]
    },
    { 
      label: "Ruang P5", 
      icon: Package,
      onClick: () => router.push('/p5/p1')
    },
    { 
      label: "Analitik", 
      icon: BarChart3,
      onClick: () => router.push('/analytics')
    },
  ]

  const editingChat = editingId ? aiHistory.find(h => h.id === editingId) : null;

  return (
    <div ref={sidebarRef} className="relative">
      <DrilldownSidebar
        items={menuItems}
        activeLabel={getActiveLabel()}
        onSearchClick={onSearchClick}
        width="16rem"
        collapsed={collapsed}
        header={
          <div className={cn("sidebar-logo flex items-center", collapsed ? "justify-center" : "gap-3")}>
            <div className="flex aspect-square size-10 items-center justify-center shrink-0">
              <img
                src="/beroang-logo.svg"
                alt="Beroang Logo"
                className="w-10 h-10"
              />
            </div>
            {!collapsed && (
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-bold font-display text-2xl tracking-tight text-foreground">Beroang</span>
              </div>
            )}
          </div>
        }
      />
    {editingChat && (
      <div className="absolute inset-0 z-50 bg-background flex flex-col" style={{ width: '16rem' }}>
        <div className="flex items-center gap-2 px-3 py-3 border-b">
          <button
            type="button"
            onClick={() => setEditingId(null)}
            className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-muted text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium truncate">Edit Judul</span>
        </div>
        <div className="flex-1 p-3 space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Judul Chat</label>
            <Input
              value={editingTitle}
              onChange={e => setEditingTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && editingTitle.trim()) {
                  updateChatTitle(editingId!, editingTitle.trim())
                  setEditingId(null)
                  toast.success('Judul diperbarui!')
                }
              }}
              placeholder="Masukkan judul..."
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="flex-1 h-8 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => {
                if (editingTitle.trim()) {
                  updateChatTitle(editingId!, editingTitle.trim())
                  setEditingId(null)
                  toast.success('Judul diperbarui!')
                }
              }}
              className="flex-1 h-8 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  )
}

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
