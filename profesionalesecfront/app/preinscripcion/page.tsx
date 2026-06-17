"use client"

import { useState } from "react"
import { Check, CreditCard, ArrowRight, Clock, Zap, Users, Shield, UserRound, BookOpen } from "lucide-react"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function PreinscripcionPage() {
  const [selectedPlan, setSelectedPlan] = useState<"free" | "paid" | "usuario" | null>(null)

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />

      <main className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 bg-clip-text text-transparent font-display">
              Preinscripción Profesional
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Ahora millones de ecuatorianos podrán acceder a tus servicios profesionales. Elige la opción que mejor se
              ajuste a tus necesidades.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid gap-8 mb-16 lg:grid-cols-3">
            {/* Usuario Portal */}
            <div
              className={`relative group bg-white border-2 rounded-2xl p-8 transition-all duration-500 cursor-pointer hover:scale-105 shadow-lg ${
                selectedPlan === "usuario" ? "border-slate-900 shadow-slate-200" : "border-slate-300 hover:border-slate-400"
              }`}
              onClick={() => setSelectedPlan("usuario")}
            >
              {selectedPlan === "usuario" && (
                <div className="absolute top-4 right-4 bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-bold animate-in zoom-in duration-300">
                  Seleccionado
                </div>
              )}

              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-slate-100 rounded-xl">
                  <UserRound className="text-slate-900" size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 font-display">Usuario normal</h3>
                  <p className="text-slate-700 text-sm font-medium">Nuevo portal autenticado</p>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-bold text-gray-900">$0</span>
                  <span className="text-gray-600 text-lg">USD</span>
                </div>
                <p className="text-gray-600 text-sm">Registro gratuito para gestionar citas, cursos y certificados</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="text-slate-900 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-700">Acceso a tu dashboard personal</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-slate-900 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-700">Seguimiento de citas con profesionales</span>
                </li>
                <li className="flex items-start gap-3">
                  <BookOpen className="text-slate-900 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-700">Cursos, certificados y configuración desde el portal</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-slate-900 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-700">Entrada lista para el nuevo flujo de registro de usuario</span>
                </li>
              </ul>

              <Link
                href="/registro-usuario"
                className={`w-full py-4 px-6 rounded-xl font-semibold text-center transition-all duration-300 flex items-center justify-center gap-2 font-button ${
                  selectedPlan === "usuario"
                    ? "bg-slate-900 text-white hover:bg-slate-800 shadow-lg"
                    : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                }`}
              >
                Crear cuenta de usuario
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Free Plan */}
            <div
              className={`relative group bg-white border-2 rounded-2xl p-8 transition-all duration-500 cursor-pointer hover:scale-105 shadow-lg ${
                selectedPlan === "free" ? "border-blue-500 shadow-blue-200" : "border-gray-300 hover:border-gray-400"
              }`}
              onClick={() => setSelectedPlan("free")}
            >
              {selectedPlan === "free" && (
                <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-in zoom-in duration-300">
                  Seleccionado
                </div>
              )}

              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="text-blue-600" size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 font-display">Preinscripción GRATIS</h3>
                  <p className="text-blue-600 text-sm font-medium">Sin costo inicial</p>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-bold text-gray-900">$0</span>
                  <span className="text-gray-600 text-lg">USD</span>
                </div>
                <p className="text-gray-600 text-sm">Registro sin costo</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-700">Perfil profesional completo</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-700">Apareces en búsquedas</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-700">Subir fotos y documentos</span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="text-yellow-600 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-700">
                    Proceso de verificación estándar <span className="text-yellow-600 font-semibold">(3-5 días)</span>
                  </span>
                </li>
              </ul>

              <Link
                href="/crear-perfil"
                className={`w-full py-4 px-6 rounded-xl font-semibold text-center transition-all duration-300 flex items-center justify-center gap-2 font-button ${
                  selectedPlan === "free"
                    ? "bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-blue-500/50"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Inscribirme Gratis
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Paid Plan - Priority */}
            <div
              className={`relative group bg-gradient-to-br from-blue-50 via-white to-white border-2 rounded-2xl p-8 transition-all duration-500 cursor-pointer hover:scale-105 shadow-lg ${
                selectedPlan === "paid" ? "border-blue-500 shadow-blue-200" : "border-blue-300 hover:border-blue-400"
              }`}
              onClick={() => setSelectedPlan("paid")}
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                MÁS POPULAR
              </div>

              {selectedPlan === "paid" && (
                <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-in zoom-in duration-300">
                  Seleccionado
                </div>
              )}

              <div className="flex items-center gap-3 mb-6 mt-4">
                <div className="p-3 bg-blue-100 rounded-xl border border-blue-200">
                  <Zap className="text-blue-600" size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 font-display">Evita la Lista de Espera</h3>
                  <p className="text-blue-600 text-sm font-medium">Pago sujeto a validación y revisión manual</p>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                    $10
                  </span>
                  <span className="text-gray-600 text-lg">USD</span>
                </div>
                <p className="text-blue-600 text-sm font-medium">Pago único - Sin mensualidades</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-900 font-medium">Todo lo del plan gratuito</span>
                </li>
                <li className="flex items-start gap-3">
                  <Zap className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-900 font-medium">
                    Verificación prioritaria <span className="text-blue-600">(24-48 horas)</span>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Shield className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-900 font-medium">Insignia de verificado destacada</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-900 font-medium">Mejor posicionamiento en búsquedas</span>
                </li>
              </ul>

              <Link
                href="/crear-perfil?plan=priority"
                className={`w-full py-4 px-6 rounded-xl font-semibold text-center transition-all duration-300 flex items-center justify-center gap-2 font-button ${
                  selectedPlan === "paid"
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-xl hover:shadow-blue-500/50"
                    : "bg-blue-600 text-white hover:bg-blue-500 shadow-lg"
                }`}
              >
                Inscribirme Ahora - $10
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          {/* Payment Methods for Paid Plan */}
          {selectedPlan === "paid" && (
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold mb-2 text-center text-gray-900">Elige tu método de pago</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="bg-gray-50 border border-gray-300 rounded-xl p-6 hover:border-blue-500 transition-all duration-300 group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <CreditCard className="text-blue-600" size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Transferencia Bancaria</h4>
                        <p className="text-sm text-gray-600">Completa el formulario y realiza la transferencia</p>
                      </div>
                    </div>
                    <Link
                      href="/crear-perfil?plan=priority&payment=bank"
                      className="w-full block text-center py-3 px-4 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 transition-all"
                      >
                      Continuar con Transferencia
                    </Link>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 hover:border-blue-500 transition-all duration-300 group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <CreditCard className="text-blue-600" size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Tarjeta con PayPhone</h4>
                        <p className="text-sm text-gray-600">Completá el formulario y luego serás redirigido al checkout</p>
                      </div>
                    </div>
                    <Link
                      href="/crear-perfil?plan=priority&payment=payphone"
                      className="w-full block text-center py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
                    >
                      Continuar con PayPhone
                    </Link>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* Trust Badges */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">+100.000</div>
              <div className="text-sm text-gray-600">Visualizaciones mensuales</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">5000+</div>
              <div className="text-sm text-gray-600">Búsquedas Diarias</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-sm text-gray-600">Soporte Técnico</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-sm text-gray-600">Seguro</div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
