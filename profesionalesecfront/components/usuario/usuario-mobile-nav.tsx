"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { BookOpen, Contact, GraduationCap, Home, LogOut, Menu, Users } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { clearAuthSession } from "@/lib/auth-session"
import { USUARIO_NAV_ITEMS } from "@/lib/usuario-nav"
import { cn } from "@/lib/utils"

const SITE_NAV_ITEMS = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/profesionales", label: "Profesionales", icon: Users },
  { href: "/conversatorios", label: "Educación", icon: GraduationCap },
  { href: "/cursos", label: "Cursos", icon: BookOpen },
  { href: "/contacto", label: "Contacto", icon: Contact },
]

export default function UsuarioMobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    clearAuthSession()
    window.location.href = "/"
  }

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            className="fixed top-4 right-4 z-50 rounded-lg bg-slate-900 p-2 text-white shadow-lg transition-all duration-300 active:scale-95"
          >
            <Menu size={24} />
            <span className="sr-only">Menú de navegación del usuario</span>
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetHeader className="border-b border-gray-100 p-4">
            <SheetTitle className="text-lg font-bold text-gray-900">Portal usuario</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 p-3">
            <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Mi cuenta</p>
            {USUARIO_NAV_ITEMS.map((item) => {
              const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive ? "bg-slate-900 text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}

            <div className="my-2 h-px bg-gray-100" />

            <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Navegación general</p>
            {SITE_NAV_ITEMS.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
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
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
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
