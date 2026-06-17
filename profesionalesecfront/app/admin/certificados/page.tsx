"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { CheckCircle2, ExternalLink, FileText, Loader2, RefreshCw, Search, ShieldCheck, Trash2, XCircle } from "lucide-react"
import { certificadosApi, type CertificateRecord } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

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

export default function AdminCertificadosPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [items, setItems] = useState<CertificateRecord[]>([])
  const [query, setQuery] = useState("")

  const load = async () => {
    const token = localStorage.getItem("auth_token")
    if (!token) return
    setLoading(true)
    try {
      const data = await certificadosApi.listar(token)
      setItems(Array.isArray(data) ? data : [])
    } catch (error: any) {
      toast({ title: "No se pudieron cargar los certificados", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return items
    return items.filter((item) => {
      const haystack = [
        item.codigo_verificacion,
        item.status,
        item.payment_method,
        item.usuario?.nombre,
        item.usuario?.correo,
        item.ponencia?.titulo,
        item.ponencia_ponente?.tema_charla,
        item.ponencia_ponente?.nombre_ponente,
      ]
      return haystack.some((value) => String(value || "").toLowerCase().includes(term))
    })
  }, [items, query])

  const updateStatus = async (id: number, status: string) => {
    const token = localStorage.getItem("auth_token")
    if (!token) return
    setUpdatingId(id)
    try {
      const updated = await certificadosApi.actualizarEstado(id, { status, ...(status === "emitido" ? { force_regenerate: true } : {}) }, token)
      setItems((current) => current.map((item) => (item.id === id ? updated : item)))
      toast({ title: "Certificado actualizado", description: `El certificado quedó en estado ${statusLabel[status] || status}.` })
    } catch (error: any) {
      toast({ title: "No se pudo actualizar", description: error.message, variant: "destructive" })
    } finally {
      setUpdatingId(null)
    }
  }

  const deleteCertificate = async (id: number) => {
    const token = localStorage.getItem("auth_token")
    if (!token) return

    const confirmed = window.confirm("¿Eliminar este certificado? Esta acción no se puede deshacer.")
    if (!confirmed) return

    setUpdatingId(id)
    try {
      await certificadosApi.eliminar(id, token)
      setItems((current) => current.filter((item) => item.id !== id))
      toast({ title: "Certificado eliminado", description: "El certificado fue eliminado correctamente." })
    } catch (error: any) {
      toast({ title: "No se pudo eliminar", description: error.message, variant: "destructive" })
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Certificados</h1>
          <p className="text-slate-600">Revisa solicitudes, aprueba transferencias y emite certificados.</p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Actualizar
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por usuario, código, evento o estado" className="pl-9" />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex min-h-[240px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((item) => (
            <Card key={item.id}>
              <CardHeader className="gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle className="text-lg text-slate-900">
                    {item.scope === "conversatorio" ? item.ponencia?.titulo || "Conversatorio" : item.ponencia_ponente?.tema_charla || item.ponencia?.titulo || "Ponencia"}
                  </CardTitle>
                  <p className="mt-1 text-sm text-slate-600">
                    {item.usuario?.nombre || "Usuario desconocido"} · {item.usuario?.correo || "Sin correo"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge>{statusLabel[item.status] || item.status}</Badge>
                  <Badge variant="secondary">{paymentLabel[item.payment_method] || item.payment_method}</Badge>
                  <Badge variant="outline">{item.scope === "conversatorio" ? "Conversatorio" : "Ponencia"}</Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-[1.4fr,0.8fr]">
                <div className="space-y-2 text-sm text-slate-600">
                  <p><span className="font-medium text-slate-900">Código:</span> {item.codigo_verificacion}</p>
                  <p><span className="font-medium text-slate-900">Costo:</span> ${Number(item.costo || 0).toFixed(2)}</p>
                  <p><span className="font-medium text-slate-900">Solicitud:</span> {item.fecha_solicitud ? new Date(item.fecha_solicitud).toLocaleString("es-EC") : "No disponible"}</p>
                  {item.ponencia_ponente?.nombre_ponente ? <p><span className="font-medium text-slate-900">Ponente:</span> {item.ponencia_ponente.nombre_ponente}</p> : null}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Link href={`/certificados/validar/${item.id}`} className="inline-flex items-center gap-1 text-emerald-700 hover:underline">
                      <ShieldCheck className="h-4 w-4" /> Validar
                    </Link>
                    {item.comprobante_pago_url ? (
                      <a href={item.comprobante_pago_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-slate-700 hover:underline">
                        <FileText className="h-4 w-4" /> Ver comprobante
                      </a>
                    ) : null}
                    {item.url_pdf ? (
                      <a href={item.url_pdf} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-slate-700 hover:underline">
                        <ExternalLink className="h-4 w-4" /> Ver PDF
                      </a>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col gap-2 rounded-xl border bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">Acciones administrativas</p>
                  <Button onClick={() => updateStatus(item.id, "emitido")} disabled={updatingId === item.id}>
                    {updatingId === item.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                    Emitir certificado
                  </Button>
                  <Button variant="outline" onClick={() => updateStatus(item.id, "pagado")} disabled={updatingId === item.id || item.status === "emitido"}>
                    Marcar pagado
                  </Button>
                  <Button variant="destructive" onClick={() => updateStatus(item.id, "rechazado")} disabled={updatingId === item.id || item.status === "emitido"}>
                    <XCircle className="mr-2 h-4 w-4" /> Rechazar
                  </Button>
                  <Button variant="outline" onClick={() => deleteCertificate(item.id)} disabled={updatingId === item.id} className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800">
                    {updatingId === item.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                    Eliminar certificado
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {!filtered.length ? (
            <Card>
              <CardContent className="flex min-h-[180px] items-center justify-center text-slate-500">
                No hay certificados para los filtros aplicados.
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  )
}
