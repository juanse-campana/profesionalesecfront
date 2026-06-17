"use client"

import type { ComponentType } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Contact, GraduationCap, Home, LogOut, Users, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { clearAuthSession } from "@/lib/auth-session"
import { USUARIO_NAV_ITEMS } from "@/lib/usuario-nav"

const COLLAPSED_WIDTH = 70
const EXPANDED_WIDTH = 312

const SITE_NAV_ITEMS = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/profesionales", label: "Profesionales", icon: Users },
  { href: "/conversatorios", label: "Educación", icon: GraduationCap },
  { href: "/cursos", label: "Cursos", icon: BookOpen },
  { href: "/contacto", label: "Contacto", icon: Contact },
]

type UsuarioSidebarProps = {
  expanded: boolean
  onToggle: () => void
}

export default function UsuarioSidebar({ expanded, onToggle }: UsuarioSidebarProps) {
  const pathname = usePathname()

  const handleLogout = () => {
    clearAuthSession()
    window.location.href = "/"
  }

  const renderNavLink = (
    href: string,
    label: string,
    Icon: ComponentType<{ className?: string }>,
    isActive: boolean,
    activeClasses: string,
  ) => (
    <Link
      key={href}
      href={href}
      title={label}
      className={cn(
        "relative flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors whitespace-nowrap",
        expanded ? "gap-3 px-3" : "justify-center px-0",
        isActive ? activeClasses : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span
        className={cn(
          "overflow-hidden transition-[opacity,width] duration-300 ease-in-out",
          expanded && "text-sm font-medium",
          isActive && activeClasses.includes("text-white") ? "text-white" : "text-gray-900",
        )}
        style={{ opacity: expanded ? 1 : 0, width: expanded ? "auto" : 0 }}
      >
        {label}
      </span>
    </Link>
  )

  return (
    <nav
      className="hidden lg:flex fixed top-0 left-0 z-40 h-full flex-col border-r border-gray-200 bg-white shadow-lg transition-[width] duration-300 ease-in-out"
      style={{ width: expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH, overflow: "hidden" }}
    >
      <div className={cn("flex items-center border-b border-gray-100 py-6", expanded ? "justify-between gap-3 px-3" : "justify-center px-0")}>
        <span
          className={cn(
            "overflow-hidden whitespace-nowrap font-heading text-2xl font-semibold text-gray-900 transition-[opacity,width] duration-300 ease-in-out",
            expanded ? "w-auto opacity-100" : "w-0 opacity-0",
          )}
        >
          Mi cuenta
        </span>
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900",
            expanded ? "h-9 w-9 shrink-0" : "h-10 w-10",
          )}
          aria-label={expanded ? "Contraer sidebar" : "Expandir sidebar"}
        >
          {expanded ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
      </div>

      <div className="mt-4 flex flex-1 flex-col overflow-y-auto px-2 pb-4">
        <div className="flex flex-col gap-1">
          <p className={cn("px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400", !expanded && "sr-only")}>
            Portal usuario
          </p>
          {USUARIO_NAV_ITEMS.map((item) => {
            const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href)
            return renderNavLink(item.href, item.label, item.icon, isActive, "bg-blue-600 text-white hover:bg-blue-700 hover:text-white")
          })}
        </div>

        <div className="my-4 h-px bg-gray-100" />

        <div className="flex flex-col gap-1">
          <p className={cn("px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400", !expanded && "sr-only")}>
            Navegación general
          </p>
          {SITE_NAV_ITEMS.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
            return renderNavLink(item.href, item.label, item.icon, isActive, "bg-blue-600 text-white hover:bg-blue-700 hover:text-white")
          })}
        </div>

        <div className="mt-auto pt-4">
          <div className="my-2 h-px bg-gray-100" />
          <button
            type="button"
            onClick={handleLogout}
            className={cn(
              "flex w-full items-center rounded-lg py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700",
              expanded ? "gap-3 px-3" : "justify-center px-0",
            )}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span
              className="overflow-hidden whitespace-nowrap transition-[opacity,width] duration-300 ease-in-out"
              style={{ opacity: expanded ? 1 : 0, width: expanded ? "auto" : 0 }}
            >
              Cerrar sesión
            </span>
          </button>
        </div>
      </div>
    </nav>
  )
}
