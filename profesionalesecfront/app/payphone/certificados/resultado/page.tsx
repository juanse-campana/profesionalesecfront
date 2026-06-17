"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { AlertCircle, ArrowLeft, CheckCircle2, Home, Loader2 } from "lucide-react"
import { certificadosApi, type PayPhoneCertificateConfirmData } from "@/lib/api"

interface StoredCheckoutContext {
  clientTransactionId: string
}

const CHECKOUT_CONTEXT_STORAGE_KEY = "payphone_certificate_checkout_context"

function readStoredCheckoutContext(): StoredCheckoutContext | null {
  if (typeof window === "undefined") return null
  const rawValue = window.localStorage.getItem(CHECKOUT_CONTEXT_STORAGE_KEY)
  if (!rawValue) return null

  try {
    const parsedValue = JSON.parse(rawValue) as Partial<StoredCheckoutContext>
    if (typeof parsedValue.clientTransactionId === "string") {
      return { clientTransactionId: parsedValue.clientTransactionId }
    }
  } catch {
    return null
  }

  return null
}

export default function PayPhoneCertificateResultPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [confirmationResult, setConfirmationResult] = useState<PayPhoneCertificateConfirmData | null>(null)

  useEffect(() => {
    const confirmCheckout = async () => {
      const token = window.localStorage.getItem("auth_token")
      if (!token) {
        setErrorMessage("Debes iniciar sesión nuevamente para confirmar el pago del certificado.")
        setIsLoading(false)
        return
      }

      const searchParams = new URLSearchParams(window.location.search)
      const storedContext = readStoredCheckoutContext()
      const payphonePaymentId = searchParams.get("paymentId") || searchParams.get("id")
      const clientTransactionId = searchParams.get("clientTransactionId") || storedContext?.clientTransactionId

      if (!clientTransactionId) {
        setErrorMessage("No pudimos identificar tu transacción PayPhone para confirmar el certificado.")
        setIsLoading(false)
        return
      }

      if (!payphonePaymentId) {
        setErrorMessage("PayPhone no devolvió el identificador del pago del certificado.")
        setIsLoading(false)
        return
      }

      try {
        const result = await certificadosApi.confirmPayPhoneCheckout(
          { id: payphonePaymentId, clientTransactionId },
          token,
        )
        setConfirmationResult(result)
        window.localStorage.removeItem(CHECKOUT_CONTEXT_STORAGE_KEY)
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "No pudimos confirmar tu pago PayPhone.")
      } finally {
        setIsLoading(false)
      }
    }

    void confirmCheckout()
  }, [])

  const normalizedStatus = confirmationResult?.confirmation.normalizedStatus
  const isApproved = confirmationResult?.approved === true

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
      <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
            {isLoading ? <Loader2 className="size-7 animate-spin" /> : isApproved ? <CheckCircle2 className="size-7" /> : <AlertCircle className="size-7" />}
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">PayPhone certificados</p>
            <h1 className="text-2xl font-bold">Resultado del pago</h1>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700">
            Estamos confirmando tu pago de certificado con PayPhone. Esto puede tardar unos segundos.
          </div>
        ) : errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
            <p className="font-semibold">No pudimos confirmar el pago del certificado</p>
            <p className="mt-2 text-sm">{errorMessage}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`rounded-2xl p-5 ${isApproved ? "border border-green-200 bg-green-50 text-green-900" : "border border-amber-200 bg-amber-50 text-amber-900"}`}>
              <p className="font-semibold">{isApproved ? "Pago confirmado" : "La confirmación fue procesada"}</p>
              <p className="mt-2 text-sm">
                {isApproved
                  ? "Tu pago fue aprobado y el certificado quedó emitido automáticamente."
                  : "PayPhone devolvió un estado distinto de aprobado. Puedes revisar nuevamente el estado desde tu dashboard."}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
              <p><span className="font-semibold text-slate-900">Estado PayPhone:</span> {normalizedStatus || "sin estado informado"}</p>
              <p className="mt-2"><span className="font-semibold text-slate-900">Código del certificado:</span> {confirmationResult?.certificado.codigo_verificacion}</p>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/dashboard/profesional/certificados" className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700">
            <Home className="size-4" />
            Ir a mis certificados
          </Link>
          <Link href="/conversatorios" className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 px-5 py-3 font-semibold text-slate-800 transition hover:bg-slate-100">
            <ArrowLeft className="size-4" />
            Volver a educación
          </Link>
        </div>
      </div>
    </main>
  )
}
