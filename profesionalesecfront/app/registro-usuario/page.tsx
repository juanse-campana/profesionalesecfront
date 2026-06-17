"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { authApi, saveToken } from "@/lib/api"
import { getDashboardRouteForRole, parseRoleFromToken } from "@/lib/auth-session"

type FormState = {
  nombre: string
  correo: string
  telefono: string
  cedula: string
  contrasena: string
  confirmarContrasena: string
}

type FormErrors = Partial<Record<keyof FormState, string>>
type FormTouched = Partial<Record<keyof FormState, boolean>>

const initialState: FormState = {
  nombre: "",
  correo: "",
  telefono: "",
  cedula: "",
  contrasena: "",
  confirmarContrasena: "",
}

export default function RegistroUsuarioPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormState>(initialState)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<FormTouched>({})
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const validateField = (field: keyof FormState, value: string) => {
    let nextError = ""

    switch (field) {
      case "nombre":
        if (!value.trim()) nextError = "Nombre requerido"
        break
      case "correo":
        if (!value.trim()) nextError = "Correo electrónico requerido"
        else if (!value.includes("@")) nextError = "El correo debe contener un '@'"
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) nextError = "Formato inválido (ej: usuario@dominio.com)"
        break
      case "telefono":
        if (value.trim() && value.length !== 10) nextError = "Debe tener 10 dígitos"
        break
      case "cedula":
        if (value.trim() && value.length !== 10) nextError = "Debe tener 10 dígitos"
        break
      case "contrasena":
        if (!value) nextError = "Contraseña requerida"
        else if (value.length < 8) nextError = "Mínimo 8 caracteres"
        else if (!/[A-Z]/.test(value)) nextError = "Debe incluir una mayúscula"
        else if (!/[a-z]/.test(value)) nextError = "Debe incluir una minúscula"
        else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) nextError = "Debe incluir un carácter especial (ej: @, $, !)"
        break
      case "confirmarContrasena":
        if (!value) nextError = "Confirmar contraseña es requerido"
        else if (value !== formData.contrasena) nextError = "Las contraseñas no coinciden"
        break
    }

    setErrors((prev) => ({ ...prev, [field]: nextError }))
    return !nextError
  }

  const updateField = (field: keyof FormState, rawValue: string) => {
    let value = rawValue

    if (field === "nombre" && /\d/.test(value)) {
      return
    }

    if (field === "telefono" || field === "cedula") {
      if (!/^\d*$/.test(value)) return
      if (value.length > 10) return
    }

    setFormData((prev) => {
      const next = { ...prev, [field]: value }
      return next
    })

    if (touched[field]) {
      if (field === "contrasena") {
        setTimeout(() => {
          validateField("contrasena", value)
          if (touched.confirmarContrasena) {
            validateField("confirmarContrasena", formData.confirmarContrasena)
          }
        }, 0)
        return
      }

      validateField(field, value)
    }
  }

  const handleBlur = (field: keyof FormState) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    validateField(field, formData[field])
  }

  const getInputBorderColor = (field: keyof FormState) => {
    if (errors[field]) return "border-red-400"
    if (touched[field] && !errors[field] && formData[field].trim() !== "") return "border-green-500"
    return "border-slate-300"
  }

  const validateForm = () => {
    const fields: (keyof FormState)[] = ["nombre", "correo", "contrasena", "confirmarContrasena", "telefono", "cedula"]
    const nextTouched = fields.reduce<FormTouched>((acc, field) => {
      acc[field] = true
      return acc
    }, {})
    setTouched((prev) => ({ ...prev, ...nextTouched }))

    return fields.every((field) => validateField(field, formData[field]))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!validateForm()) {
      setError("Corrige los campos marcados antes de continuar.")
      return
    }

    setLoading(true)

    try {
      const response = await authApi.registerUsuario({
        nombre: formData.nombre.trim(),
        academic_name: formData.nombre.trim(),
        correo: formData.correo.trim(),
        telefono: formData.telefono.trim() || undefined,
        cedula: formData.cedula.trim() || undefined,
        contrasena: formData.contrasena,
      })

      if (response?.token) {
        saveToken(response.token)
        const { role } = parseRoleFromToken(response.token)
        router.push(getDashboardRouteForRole(role))
        return
      }

      router.push("/login")
    } catch (submitError: any) {
      setError(submitError?.message || "No se pudo completar el registro.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <main className="px-4 pb-8 pt-20 md:pt-24">
        <div className="mx-auto max-w-xl">
          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
            <h2 className="text-2xl font-bold text-slate-900">Bienvenido, porfavor completa tu registro</h2>
            <p className="mt-1 text-xs leading-5 text-slate-600 md:text-sm">
              Empieza hoy y accede a tu espacio personal para gestionar citas, cursos y certificados en un solo lugar.
            </p>

            {error && <div className="mt-4 rounded-2xl bg-red-50 px-3 py-2 text-xs text-red-700 md:text-sm">{error}</div>}

            <form className="mt-3 space-y-2.5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-medium text-slate-700 md:text-sm">
                  Nombre completo
                  <input
                    className={`mt-1 w-full rounded-2xl border bg-slate-50 px-3.5 py-2 text-sm outline-none transition focus:border-blue-500 focus:bg-white ${getInputBorderColor("nombre")}`}
                    value={formData.nombre}
                    onChange={(e) => updateField("nombre", e.target.value)}
                    onBlur={() => handleBlur("nombre")}
                    required
                  />
                  {errors.nombre && touched.nombre && <p className="mt-0.5 text-xs text-red-600">{errors.nombre}</p>}
                </label>
              </div>

              <div className="space-y-2.5">
                <label className="block text-sm font-medium text-slate-700">
                  Correo electrónico
                  <input
                    type="email"
                    className={`mt-1 w-full rounded-2xl border bg-slate-50 px-3.5 py-2 text-sm outline-none transition focus:border-blue-500 focus:bg-white ${getInputBorderColor("correo")}`}
                    value={formData.correo}
                    onChange={(e) => updateField("correo", e.target.value)}
                    onBlur={() => handleBlur("correo")}
                    required
                  />
                  {errors.correo && touched.correo && <p className="mt-1 text-sm text-red-600">{errors.correo}</p>}
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Teléfono (opcional)
                  <input
                    inputMode="numeric"
                    className={`mt-1 w-full rounded-2xl border bg-slate-50 px-3.5 py-2 text-sm outline-none transition focus:border-blue-500 focus:bg-white ${getInputBorderColor("telefono")}`}
                    value={formData.telefono}
                    onChange={(e) => updateField("telefono", e.target.value)}
                    onBlur={() => handleBlur("telefono")}
                  />
                  {errors.telefono && touched.telefono && <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>}
                </label>
              </div>

              <div className="space-y-5">
                <label className="block text-sm font-medium text-slate-700">
                  Cédula (opcional)
                  <input
                    inputMode="numeric"
                    className={`mt-1 w-full rounded-2xl border bg-slate-50 px-3.5 py-2 text-sm outline-none transition focus:border-blue-500 focus:bg-white ${getInputBorderColor("cedula")}`}
                    value={formData.cedula}
                    onChange={(e) => updateField("cedula", e.target.value)}
                    onBlur={() => handleBlur("cedula")}
                  />
                  {errors.cedula && touched.cedula && <p className="mt-1 text-sm text-red-600">{errors.cedula}</p>}
                </label>
              </div>

              <div className="space-y-5">
                <label className="block text-sm font-medium text-slate-700">
                  Contraseña
                  <input
                    type="password"
                    className={`mt-1 w-full rounded-2xl border bg-slate-50 px-3.5 py-2 text-sm outline-none transition focus:border-blue-500 focus:bg-white ${getInputBorderColor("contrasena")}`}
                    value={formData.contrasena}
                    onChange={(e) => updateField("contrasena", e.target.value)}
                    onBlur={() => handleBlur("contrasena")}
                    required
                  />
                  {errors.contrasena && touched.contrasena && <p className="mt-1 text-sm text-red-600">{errors.contrasena}</p>}
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Confirmar contraseña
                  <input
                    type="password"
                    className={`mt-1 w-full rounded-2xl border bg-slate-50 px-3.5 py-2 text-sm outline-none transition focus:border-blue-500 focus:bg-white ${getInputBorderColor("confirmarContrasena")}`}
                    value={formData.confirmarContrasena}
                    onChange={(e) => updateField("confirmarContrasena", e.target.value)}
                    onBlur={() => handleBlur("confirmarContrasena")}
                    required
                  />
                  {errors.confirmarContrasena && touched.confirmarContrasena && <p className="mt-1 text-sm text-red-600">{errors.confirmarContrasena}</p>}
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:from-blue-600 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Creando cuenta..." : "Crear cuenta y entrar al dashboard"}
              </button>
            </form>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
