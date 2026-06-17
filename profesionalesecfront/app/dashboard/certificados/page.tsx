"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Download, Loader2, ShieldCheck } from "lucide-react"
import { certificadosApi, type CertificateRecord } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

const statusLabel: Record<string, string> = {
  pendiente_pago: "Pendiente de pago",
  en_revision: "En revisión",
  pagado: "Pagado",
  emitido: "Emitido",
  rechazado: "Rechazado",
  cancelado: "Cancelado",
}

export default function UsuarioCertificadosPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<CertificateRecord[]>([])
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      setLoading(false)
      return
    }

    certificadosApi
      .listarMios(token)
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((error: any) => {
        toast({ title: "No se pudieron cargar tus certificados", description: error.message, variant: "destructive" })
      })
      .finally(() => setLoading(false))
  }, [toast])

  const handleDownload = async (item: CertificateRecord) => {
    const token = localStorage.getItem("auth_token")
    if (!token) return
    setDownloadingId(item.id)
    try {
      const url = await certificadosApi.obtenerDescargaUrl(item.codigo_verificacion, token)
      window.open(url, "_blank", "noopener,noreferrer")
    } catch (error: any) {
      toast({ title: "No se pudo descargar el certificado", description: error.message, variant: "destructive" })
    } finally {
      setDownloadingId(null)
    }
  }

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Mis certificados</h1>
        <p className="text-slate-600">Consulta el estado de emisión y descarga tus certificados disponibles.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id} className="h-full">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg text-slate-900">{item.ponencia?.titulo || "Certificado"}</CardTitle>
                  <p className="mt-1 text-sm text-slate-600">Código: {item.codigo_verificacion}</p>
                </div>
                <Badge>{statusLabel[item.status] || item.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <p><span className="font-medium text-slate-900">Costo:</span> ${Number(item.costo || 0).toFixed(2)}</p>
              <p><span className="font-medium text-slate-900">Emitido:</span> {item.fecha_emision ? new Date(item.fecha_emision).toLocaleDateString("es-EC") : "Aún no emitido"}</p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link href={`/certificados/validar/${item.id}`} className="inline-flex items-center gap-1 text-emerald-700 hover:underline">
                  <ShieldCheck className="h-4 w-4" /> Validar
                </Link>
                {item.url_pdf ? (
                  <Button variant="outline" size="sm" onClick={() => handleDownload(item)} disabled={downloadingId === item.id}>
                    {downloadingId === item.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    Descargar PDF
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!items.length ? (
        <Card>
          <CardContent className="flex min-h-[220px] flex-col items-center justify-center gap-4 text-center text-slate-500">
            <p>Certificate aprendiendo con nuestro contenido</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button asChild className="bg-blue-600 text-white hover:bg-blue-700">
                <Link href="/conversatorios">Conversatorio</Link>
              </Button>
              <Button asChild className="bg-blue-600 text-white hover:bg-blue-700">
                <Link href="/cursos">Cursos</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
