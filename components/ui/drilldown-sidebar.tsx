"use client"

import * as React from "react"
import { ChevronRight, ChevronLeft, Search, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { gsap } from "@/lib/gsap-config"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export interface DrilldownSubMenuItem {
  id?: string
  label: string
  labelContent?: React.ReactNode
  section?: string
  icon?: LucideIcon
  isNew?: boolean
  onClick?: () => void
  actions?: React.ReactNode
}

export interface DrilldownMenuItem {
  label: string
  icon?: LucideIcon
  badge?: string
  onClick?: () => void
  children?: DrilldownSubMenuItem[]
}

interface DrilldownSidebarProps {
  items: DrilldownMenuItem[]
  user?: React.ReactNode
  activeLabel?: string
  onActiveChange?: (label: string | null) => void
  onSearchClick?: () => void
  className?: string
  width?: string
  collapsedWidth?: string
  header?: React.ReactNode
  collapsed?: boolean
}

export function DrilldownSidebar({
  items,
  user,
  activeLabel,
  onActiveChange,
  onSearchClick,
  className,
  width = "16rem",
  collapsedWidth = "4.5rem",
  header,
  collapsed = false,
}: DrilldownSidebarProps) {
  const [drillStack, setDrillStack] = React.useState<{ parent: DrilldownMenuItem }[]>([])
  const [showLevel2, setShowLevel2] = React.useState(false)

  const level1Ref = React.useRef<HTMLDivElement>(null)
  const level2Ref = React.useRef<HTMLDivElement>(null)
  const isAnimating = React.useRef(false)

  const currentParent = drillStack.length > 0 ? drillStack[drillStack.length - 1].parent : null

  const openSubmenu = React.useCallback((item: DrilldownMenuItem) => {
    if (!item.children || isAnimating.current) return
    isAnimating.current = true

    const tl = gsap.timeline({
      onComplete: () => {
        setDrillStack((prev) => [...prev, { parent: item }])
        setShowLevel2(true)
        isAnimating.current = false
      }
    })

    tl.to(level1Ref.current, {
      opacity: 0,
      x: -15,
      duration: 0.15,
      ease: "power2.in",
    })
  }, [])

  const goBack = React.useCallback(() => {
    if (isAnimating.current) return
    isAnimating.current = true

    gsap.to(level2Ref.current, {
      opacity: 0,
      x: 15,
      duration: 0.15,
      ease: "power2.in",
      onComplete: () => {
        gsap.set(level2Ref.current, { clearProps: "all" })
        setDrillStack((prev) => prev.slice(0, -1))
        setShowLevel2(false)
        isAnimating.current = false
      }
    })
  }, [])

  React.useEffect(() => {
    if (showLevel2 && level2Ref.current) {
      gsap.fromTo(level2Ref.current,
        { opacity: 0, x: 15 },
        { opacity: 1, x: 0, duration: 0.2, ease: "power2.out", clearProps: "transform" }
      )
    }
    if (!showLevel2 && level1Ref.current) {
      gsap.fromTo(level1Ref.current,
        { opacity: 0, x: -15 },
        { opacity: 1, x: 0, duration: 0.2, ease: "power2.out", clearProps: "transform" }
      )
    }
  }, [showLevel2])

  React.useEffect(() => {
    if (collapsed && showLevel2) {
      gsap.set(level1Ref.current, { clearProps: "all" })
      gsap.set(level2Ref.current, { clearProps: "all" })
      setDrillStack([])
      setShowLevel2(false)
      isAnimating.current = false
    }
  }, [collapsed])

  const handleItemClick = React.useCallback(
    (item: DrilldownMenuItem) => {
      if (!collapsed && item.children && item.children.length > 0) {
        openSubmenu(item)
      }
      item.onClick?.()
      onActiveChange?.(item.label)
    },
    [openSubmenu, onActiveChange, collapsed]
  )

  const handleSubItemClick = React.useCallback(
    (subItem: DrilldownSubMenuItem) => {
      subItem.onClick?.()
      onActiveChange?.(subItem.label)
    },
    [onActiveChange]
  )

  const currentItems = React.useMemo(() => currentParent?.children ?? [], [currentParent])

  const groupedSubItems = React.useMemo(() => {
    const groups: { section?: string; items: DrilldownSubMenuItem[] }[] = []
    for (const item of currentItems) {
      const last = groups[groups.length - 1]
      if (item.section) {
        if (last && last.section === item.section) {
          last.items.push(item)
        } else {
          groups.push({ section: item.section, items: [item] })
        }
      } else {
        if (last && !last.section) {
          last.items.push(item)
        } else {
          groups.push({ items: [item] })
        }
      }
    }
    return groups
  }, [currentItems])

  return (
    <TooltipProvider>
      <div
        className={cn("flex flex-col h-full bg-background border-r border-border overflow-hidden", className)}
        style={{ width: collapsed ? collapsedWidth : width }}
      >
        {header && (
          <div className={cn("shrink-0 border-b border-border", collapsed ? "px-2 py-3 flex justify-center" : "px-3 py-3")}>
            {header}
          </div>
        )}

        {!collapsed && (
          <div className="shrink-0 px-3 py-3">
            <button
              type="button"
              onClick={onSearchClick}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/50 text-muted-foreground text-sm hover:bg-muted hover:border-primary/40 transition-colors cursor-pointer"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">Cari...</span>
              <kbd className="px-1.5 py-0.5 rounded bg-background border border-border text-[10px]">
                Ctrl+K
              </kbd>
            </button>
          </div>
        )}

        <Separator />

        <div className="flex-1 overflow-hidden relative">
          {/* Level 1 */}
          <div
            ref={level1Ref}
            className={cn("absolute inset-0", showLevel2 && "invisible")}
          >
            <nav className={cn("space-y-1 overflow-y-auto max-h-full p-2")}>
              {items.map((item, idx) => (
                <React.Fragment key={item.label}>
                  {idx > 0 && !item.badge && !items[idx - 1]?.badge && (
                    <Separator className="my-2" />
                  )}
                  {collapsed && item.children && item.children.length > 0 ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className={cn(
                                  "flex items-center gap-3 rounded-lg text-sm text-left w-full justify-center px-2 py-2.5",
                                  "hover:bg-primary/10 hover:text-primary",
                                  activeLabel === item.label && !showLevel2 && "bg-primary/10 text-primary font-medium"
                                )}
                              >
                                {item.icon && (
                                  <span className="shrink-0 w-5 h-5 flex items-center justify-center text-muted-foreground">
                                    <item.icon className="h-5 h-5" />
                                  </span>
                                )}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" sideOffset={8}>
                              {item.label}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        side="right"
                        sideOffset={8}
                        align="start"
                        className="w-56"
                      >
                        <DropdownMenuLabel className="flex items-center gap-2">
                          {item.icon && <item.icon className="h-4 w-4" />}
                          {item.label}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          {item.children.map((subItem) => (
                            <DropdownMenuItem
                              key={subItem.id || subItem.label}
                              onClick={() => handleSubItemClick(subItem)}
                              className={cn(
                                "gap-2 cursor-pointer",
                                subItem.isNew && "border border-dashed border-primary/40 bg-primary/5 text-primary"
                              )}
                            >
                              {subItem.icon && <subItem.icon className="h-4 w-4" />}
                              {subItem.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : collapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => handleItemClick(item)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg text-sm text-left w-full justify-center px-2 py-2.5",
                            "hover:bg-primary/10 hover:text-primary",
                            activeLabel === item.label && !showLevel2 && "bg-primary/10 text-primary font-medium"
                          )}
                        >
                          {item.icon && (
                            <span className="shrink-0 w-5 h-5 flex items-center justify-center text-muted-foreground">
                              <item.icon className="h-5 h-5" />
                            </span>
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" sideOffset={8}>
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleItemClick(item)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg text-sm text-left",
                        "hover:bg-primary/10 hover:text-primary",
                        activeLabel === item.label && !showLevel2 && "bg-primary/10 text-primary font-medium",
                        "w-full px-3 py-2.5"
                      )}
                    >
                      {item.icon && (
                        <span className="shrink-0 w-5 h-5 flex items-center justify-center text-muted-foreground">
                          <item.icon className="h-5 h-5" />
                        </span>
                      )}
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">
                          {item.badge}
                        </span>
                      )}
                      {item.children && (
                        <ChevronRight className="shrink-0 h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Level 2 */}
          <div
            ref={level2Ref}
            className={cn("absolute inset-0", !showLevel2 && "invisible")}
          >
            <div className="flex flex-col h-full">
              <div className="shrink-0 p-2 flex items-center justify-center gap-2 border-b border-border relative">
                <button
                  type="button"
                  onClick={goBack}
                  className="absolute left-2 flex items-center justify-center w-8 h-8 rounded-lg hover:bg-primary/10 hover:text-primary"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {!collapsed && <span className="text-sm font-medium truncate">{currentParent?.label}</span>}
              </div>
              <nav className="flex-1 p-2 space-y-2 overflow-y-auto">
                {groupedSubItems.map((group, gi) => (
                  <div key={gi}>
                    {!collapsed && group.section && (
                      <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {group.section}
                      </p>
                    )}
                    <div className="space-y-0.5">
                      {group.items.map((subItem, idx) => {
                        const isEditing = !!subItem.labelContent
                        const Wrapper = isEditing ? "div" : "button"
                        return (
                        <div key={subItem.id || `${subItem.label}-${idx}`} className="relative group/item">
                          <Wrapper
                            {...(!isEditing ? { type: "button", onClick: () => handleSubItemClick(subItem) } : {})}
                            className={cn(
                              "flex items-center gap-3 rounded-lg text-sm text-left",
                              subItem.isNew
                                ? "border border-dashed border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 font-medium"
                                : "hover:bg-primary/10 hover:text-primary",
                              activeLabel === subItem.label && !subItem.isNew && "bg-primary/10 text-primary font-medium",
                              collapsed ? "w-full justify-center px-2 py-2" : "w-full px-3 py-2"
                            )}
                            title={collapsed ? subItem.label : undefined}
                          >
                            {subItem.icon && (
                              <span className={cn(
                                "shrink-0 w-5 h-5 flex items-center justify-center",
                                subItem.isNew ? "text-primary" : "text-muted-foreground"
                              )}>
                                <subItem.icon className="h-4 w-4" />
                              </span>
                            )}
                            {!collapsed && (
                              <span className={cn("flex-1", isEditing ? "min-w-0" : "truncate")}>
                                {subItem.labelContent || subItem.label}
                              </span>
                            )}
                          </Wrapper>
                          {!collapsed && subItem.actions && (
                            <div className="absolute right-1 top-1/2 -translate-y-1/2 z-10" onClick={e => e.stopPropagation()}>
                              {subItem.actions}
                            </div>
                          )}
                        </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {user && (
          <>
            <Separator />
            <div className={cn("shrink-0", collapsed ? "p-2 flex justify-center" : "p-3")}>
              {user}
            </div>
          </>
        )}
      </div>
    </TooltipProvider>
  )
}
