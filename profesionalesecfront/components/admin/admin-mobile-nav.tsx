"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { BookOpen, Contact, GraduationCap, Home, LogOut, Menu, Users } from "lucide-react"
import { ADMIN_NAV_ITEMS } from "@/lib/admin-nav"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const SITE_NAV_ITEMS = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/profesionales", label: "Profesionales", icon: Users },
  { href: "/conversatorios", label: "Educación", icon: GraduationCap },
  { href: "/cursos", label: "Cursos", icon: BookOpen },
  { href: "/contacto", label: "Contacto", icon: Contact },
]

export default function AdminMobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
    window.location.href = "/"
  }

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            className="fixed top-4 right-4 z-50 p-2 hover:bg-white/10 rounded-lg transition-all duration-300 text-white active:scale-95"
          >
            <Menu size={24} />
            <span className="sr-only">Menú de navegación</span>
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetHeader className="p-4 border-b border-gray-100">
            <SheetTitle className="text-lg font-bold text-gray-900">
              Panel de Administración
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 p-3">
            <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Panel
            </p>
            {ADMIN_NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}

            <div className="my-2 h-px bg-gray-100" />

            <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Navegación general
            </p>
            {SITE_NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href)
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}

            <div className="my-2 h-px bg-gray-100" />

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar sesión</span>
            </button>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}
