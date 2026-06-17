"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertCircle, Award, CalendarDays, Loader2, Search, ShieldCheck } from "lucide-react"
import { certificadosApi, type CertificateValidationResult } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const statusLabel: Record<string, string> = {
  pendiente_pago: "Pendiente de pago",
  en_revision: "En revisión",
  pagado: "Pagado",
  emitido: "Emitido",
  rechazado: "Rechazado",
  cancelado: "Cancelado",
}

const paymentLabel: Record<string, string> = {
  gratuito: "Gratuito",
  transferencia: "Transferencia",
  payphone: "PayPhone",
}

const formatDate = (value?: string | null) => {
  if (!value) return "No disponible"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("es-EC", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/Guayaquil",
  })
}

export default function CertificateValidationPanel({ initialId = "" }: { initialId?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [certificateId, setCertificateId] = useState(initialId || searchParams.get("id") || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<CertificateValidationResult | null>(null)

  const executeSearch = async (id: string) => {
    if (!id) return
    setLoading(true)
    setError("")

    try {
      const data = await certificadosApi.validar(id)
      setResult(data)
      router.replace(`/certificados/validar/${encodeURIComponent(String(id))}`)
    } catch (err: any) {
      setResult(null)
      setError(err.message || "No se pudo validar el certificado.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const id = initialId || searchParams.get("id") || ""
    if (id) {
      setCertificateId(id)
      executeSearch(String(id))
    }
  }, [initialId])

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card className="border-emerald-100 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl text-slate-900">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
            Validar certificado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={certificateId}
              onChange={(event) => setCertificateId(event.target.value)}
              placeholder="Ingresa el ID del certificado"
            />
            <Button onClick={() => executeSearch(certificateId)} disabled={!certificateId || loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Validar
            </Button>
          </div>
          <p className="text-sm text-slate-500">
            Ingresa el ID numérico del certificado para verificar su autenticidad y estado de emisión.
          </p>
        </CardContent>
      </Card>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-3 p-4 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </CardContent>
        </Card>
      ) : null}

      {result ? (
        <Card className="overflow-hidden border-slate-200">
          <CardHeader className="bg-slate-50">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl text-slate-900">{result.ponencia?.tema_charla || result.conversatorio?.titulo || "Certificado"}</CardTitle>
                <p className="mt-1 text-sm text-slate-600">Código de verificación: {result.codigo_verificacion}</p>
              </div>
              <Badge className="w-fit">{statusLabel[result.status] || result.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 p-6 md:grid-cols-2">
            <div className="space-y-3 rounded-xl border p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Award className="h-4 w-4 text-emerald-600" /> Información general
              </div>
              <p><span className="font-medium">Alcance:</span> {result.scope === "conversatorio" ? "Conversatorio" : "Ponencia"}</p>
              <p><span className="font-medium">Método de pago:</span> {paymentLabel[result.payment_method] || result.payment_method}</p>
              <p><span className="font-medium">Costo:</span> ${Number(result.costo || 0).toFixed(2)}</p>
              <p><span className="font-medium">Titular:</span> {result.usuario?.nombre || "No disponible"}</p>
            </div>

            <div className="space-y-3 rounded-xl border p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <CalendarDays className="h-4 w-4 text-emerald-600" /> Fechas
              </div>
              <p><span className="font-medium">Solicitud:</span> {formatDate(result.fecha_solicitud)}</p>
              <p><span className="font-medium">Emisión:</span> {formatDate(result.fecha_emision)}</p>
              <p><span className="font-medium">Conversatorio:</span> {result.conversatorio?.titulo || "No disponible"}</p>
              {result.ponencia?.nombre_ponente ? <p><span className="font-medium">Ponente:</span> {result.ponencia.nombre_ponente}</p> : null}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
