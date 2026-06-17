"use client"

import { ReactNode, useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import UsuarioSidebar from "@/components/usuario/usuario-sidebar"
import UsuarioMobileNav from "@/components/usuario/usuario-mobile-nav"
import { clearAuthSession, getDashboardRouteForRole, isTokenExpired, parseRoleFromToken, USER_ROLE } from "@/lib/auth-session"

type GuardState = "checking" | "allowed" | "blocked"

function logout() {
  clearAuthSession()
  window.location.href = "/"
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [guardState, setGuardState] = useState<GuardState>("checking")
  const [sidebarExpanded, setSidebarExpanded] = useState(true)

  const isProfessionalSection = pathname.startsWith("/dashboard/profesional")

  useEffect(() => {
    const token = localStorage.getItem("auth_token")

    if (!token) {
      setGuardState("blocked")
      router.replace("/")
      return
    }

    const { role, exp } = parseRoleFromToken(token)

    if (isTokenExpired(exp)) {
      logout()
      return
    }

    if (isProfessionalSection) {
      setGuardState("allowed")
      return
    }

    if (!role) {
      setGuardState("blocked")
      router.replace("/")
      return
    }

    if (role !== USER_ROLE) {
      setGuardState("blocked")
      router.replace(getDashboardRouteForRole(role))
      return
    }

    setGuardState("allowed")
  }, [isProfessionalSection, router])

  useEffect(() => {
    if (guardState !== "allowed") return

    const interval = setInterval(() => {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        logout()
        return
      }
      const { exp } = parseRoleFromToken(token)
      if (isTokenExpired(exp)) logout()
    }, 5000)

    return () => clearInterval(interval)
  }, [guardState])

  useEffect(() => {
    if (guardState !== "allowed") return

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "auth_token" && !event.newValue) logout()
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [guardState])

  if (guardState !== "allowed") return null
  if (isProfessionalSection) return <>{children}</>

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-gray-900">
      <UsuarioSidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded((prev) => !prev)} />
      <UsuarioMobileNav />
      <div className="lg:ml-[var(--usuario-sidebar-width)] lg:transition-all lg:duration-300" style={{ ["--usuario-sidebar-width" as string]: `${sidebarExpanded ? 312 : 70}px` }}>
        <main className="px-4 pb-12 pt-20 lg:px-8 lg:pt-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
