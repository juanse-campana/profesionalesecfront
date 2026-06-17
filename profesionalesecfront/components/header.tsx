"use client"

import { useState, useEffect } from "react"
import { Menu, X, LogIn } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const pathname = usePathname()
  const hideMobileMenu =
    pathname.startsWith("/admin") || pathname.startsWith("/dashboard")

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    setIsLoggedIn(!!token)

    if (token) {
      try {
        const parts = token.split(".")
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]))
          setUserRole(payload.rol)
        }
      } catch (e) {
        console.error("Error decoding token in Header:", e)
      }
    } else {
      setUserRole(null)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
    setIsLoggedIn(false)
    setUserRole(null)
    window.location.href = "/"
  }

  const isActive = (href: string) => {
    if (href === "/" && pathname === "/") return true
    if (href !== "/" && pathname.startsWith(href)) return true
    return false
  }

  const navLinks = [
    { label: "Inicio", href: "/" },
    { label: "Profesionales", href: "/profesionales" },
    { label: "Educación", href: "/conversatorios" },
    { label: "Cursos", href: "/cursos" },
    { label: "Contacto", href: "/contacto" },
  ]

  const getRoleLink = () => {
    if (["superadmin", "moderador"].includes(userRole || "")) {
      return { label: "Panel Admin", href: "/admin" }
    } else if (userRole === "profesional") {
      return { label: "Mi Dashboard", href: "/dashboard/profesional" }
    } else if (userRole === "usuario") {
      return { label: "Mi Dashboard", href: "/dashboard" }
    }
    return null
  }

  const roleLink = getRoleLink()

  return (
    <header className="fixed top-0 w-full z-50">
      {/* Top Bar - Kept as is, maybe slightly thinner if requested, but user said "reduce size of THAT bar" pointing to the main one usually. Let's keep top bar same size for now or slightly tighter padding. */}


      <div className="bg-black border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Main Header Container - Height reduced to h-16 (was h-20) */}
          <div className="relative flex justify-between items-center h-16">

            {/* Logo - Z-index to stay above centered nav */}
            <Link href="/" className="flex items-center gap-2 group hover:opacity-80 transition-opacity duration-300 z-10 shrink-0">
              {/* Logo Blanco oficial para el header */}
              <img
                src="/logo-white.png"
                alt="Profesionales.ec"
                className="hidden md:block h-24 w-auto object-contain"
              />
              {/* Logo icono para mobile (este sigue necesitando invert porque es el icono negro) */}
              <img
                src="/logo-icono.png"
                alt="Profesionales.ec"
                className="md:hidden h-12 w-auto object-contain [filter:invert(1)]"
              />
            </Link>

            {/* Desktop Navigation - CENTERED ABSOLUTELY */}
            <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-2 py-1 text-sm font-medium transition-all duration-300 group ${isActive(link.href) ? "text-white" : "text-white/60 hover:text-white"
                    }`}
                >
                  {link.label}
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-300 ${isActive(link.href)
                      ? "scale-x-100 opacity-100"
                      : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-50"
                      }`}
                  />
                </Link>
              ))}

              {isLoggedIn && roleLink && (
                <Link
                  href={roleLink.href}
                  className={`relative px-2 py-1 text-sm font-medium transition-all duration-300 group ${isActive(roleLink.href) ? "text-emerald-400" : "text-emerald-400/70 hover:text-emerald-400"
                    }`}
                >
                  {roleLink.label}
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 transition-all duration-300 ${isActive(roleLink.href)
                      ? "scale-x-100 opacity-100"
                      : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-50"
                      }`}
                  />
                </Link>
              )}
            </nav>

            {/* Auth Buttons - Z-index to stay above centered nav */}
            <div className="flex items-center gap-3 z-10">
              {!isLoggedIn ? (
                <>
                  <div className="hidden md:flex items-center gap-3">
                    <Link
                      href="/login"
                      className="text-sm font-medium text-white/80 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/5 transition-all duration-300 flex items-center gap-2"
                    >
                      <LogIn className="h-4 w-4" />
                      Iniciar Sesión
                    </Link>
                    <Link
                      href="/preinscripcion"
                      className="text-sm font-medium bg-white text-black px-5 py-2 rounded-full hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-emerald-500/20 active:scale-95"
                    >
                      Crear cuenta
                    </Link>
                  </div>
                </>
              ) : (
                <div className="hidden md:flex items-center gap-3">
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-white/80 hover:text-white px-4 py-2 rounded-full hover:bg-white/5 transition-all duration-300 flex items-center gap-2"
                  >
                    <LogIn className="h-4 w-4 rotate-180" />
                    Cerrar Sesión
                  </button>
                </div>
              )}

              {/* Mobile Menu Button */}
              {!hideMobileMenu && (
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-all duration-300 text-white active:scale-95"
                >
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              )}
            </div>

          </div>

          {/* Mobile Navigation */}
          {!hideMobileMenu && isMenuOpen && (
            <nav
              className="md:hidden pb-4 border-t border-white/10 animate-in fade-in slide-in-from-top-2 duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex flex-col space-y-2 pt-4">
                {/* Persistent Links */}
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-medium px-4 py-3 rounded-lg transition-all duration-300 ${isActive(link.href)
                      ? "text-white bg-white/10"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Role Specific link for mobile */}
                {isLoggedIn && roleLink && (
                  <Link
                    href={roleLink.href}
                    className={`text-sm font-medium px-4 py-3 rounded-lg transition-all duration-300 ${isActive(roleLink.href)
                      ? "text-emerald-400 bg-emerald-400/10"
                      : "text-emerald-400/60 hover:text-emerald-400 hover:bg-emerald-400/5"
                      }`}
                  >
                    {roleLink.label}
                  </Link>
                )}

                {!isLoggedIn ? (
                  <>
                    <Link
                      href="/login"
                      className="text-sm font-medium px-4 py-3 rounded-lg transition-all duration-300 text-white/80 hover:text-white hover:bg-white/5 flex items-center gap-2"
                    >
                      <LogIn className="h-4 w-4" />
                      Iniciar Sesión
                    </Link>
                    <Link
                      href="/preinscripcion"
                      className="w-full px-6 py-3 bg-white text-black rounded-full font-medium text-sm mt-4 active:scale-95 transition-transform text-center"
                    >
                      Crear cuenta
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium px-4 py-3 rounded-lg transition-all duration-300 text-white/80 hover:text-white hover:bg-white/5 flex items-center gap-2 w-full text-left"
                  >
                    <LogIn className="h-4 w-4 rotate-180" />
                    Cerrar Sesión
                  </button>
                )}
              </div>
            </nav>
          )}
        </div>
      </div>
    </header>
  )
}
