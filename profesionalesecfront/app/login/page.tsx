"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ShieldCheck, Eye, EyeOff } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"
import { authApi, saveToken } from "@/lib/api"
import { getDashboardRouteForRole, parseRoleFromToken } from "@/lib/auth-session"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const data = await authApi.login({
        correo: formData.email,
        contrasena: formData.password
      })

      console.log("Login successful, received data:", data)

      if (data && data.token) {
        saveToken(data.token)

        try {
          const { role } = parseRoleFromToken(data.token)
          router.push(getDashboardRouteForRole(role))
        } catch (e) {
          console.error("Error decoding token:", e)
          router.push("/dashboard")
        }
      } else if (data && data.requiereCambio) {
        setError("Tu contraseña requiere actualización. Usa \"¿Olvidaste tu contraseña?\" para restablecerla.")
      } else {
        // Login successful but no token? rare but handleable
        setError("Error: No se recibió token de sesión.")
      }
    } catch (err: any) {
      console.error("Login error:", err)

      // Handle specifically unapproved accounts
      if (err.message?.includes("revision") || err.code === "ACCOUNT_NOT_APPROVED") {
        setError("Tu perfil está en proceso de revisión. Te notificaremos cuando haya sido aprobado.")
      } else {
        setError(err.message || "Error al iniciar sesión")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-md">
          {/* Hero Section */}
          <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Bienvenido de nuevo</h1>
            <p className="text-gray-600 text-lg">Inicia sesión para continuar</p>
          </div>

          {/* Login Form */}
          <div className="animate-in fade-in slide-in-from-bottom duration-700 delay-100">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Iniciar Sesión</h2>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="tu@email.com"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 pr-12"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 bg-gray-50 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors duration-200">
                      Recordarme
                    </span>
                  </label>
                  <Link
                    href="/recuperar-contrasena"
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 font-semibold rounded-xl transition-all duration-300 shadow-lg active:scale-[0.98] ${loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/50"
                    }`}
                >
                  {loading ? "Iniciando..." : "Iniciar Sesión"}
                </button>
              </form>

              {/* Register Link */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-center text-gray-600">
                  ¿No tienes una cuenta?{" "}
                  <Link
                    href="/preinscripcion"
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                  >
                    Regístrate aquí
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Security Badge */}
          <div className="mt-8 text-center animate-in fade-in duration-700 delay-200">
            <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Conexión segura y encriptada
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
