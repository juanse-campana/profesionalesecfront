"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { BookOpen, CalendarDays, CheckCircle2, CreditCard, Loader2, ShieldCheck } from "lucide-react"
import { certificadosApi, usuarioPortalApi, type UsuarioPortalCursoRecord } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

const STATUS_META: Record<string, { label: string; className: string }> = {
  ACTIVO: { label: "Activo", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  PENDIENTE: { label: "Pendiente", className: "bg-amber-100 text-amber-700 border-amber-200" },
  FALTA_PAGO: { label: "Falta pago", className: "bg-rose-100 text-rose-700 border-rose-200" },
}

const formatDate = (value?: string | null) => {
  if (!value) return "Por definir"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString("es-EC", { dateStyle: "medium" })
}

export default function UsuarioCursosPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<UsuarioPortalCursoRecord[]>([])
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      setLoading(false)
      return
    }

    usuarioPortalApi
      .listarCursos(token)
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((error: any) => {
        toast({ title: "No se pudieron cargar tus cursos", description: error.message, variant: "destructive" })
      })
      .finally(() => setLoading(false))
  }, [toast])

  const stats = useMemo(() => ({
    activos: items.filter((item) => item.estado_canonico === "ACTIVO").length,
    pendientes: items.filter((item) => item.estado_canonico === "PENDIENTE").length,
    faltaPago: items.filter((item) => item.estado_canonico === "FALTA_PAGO").length,
  }), [items])

  const handleDownload = async (item: UsuarioPortalCursoRecord) => {
    const token = localStorage.getItem("auth_token")
    if (!token || !item.certificado?.codigo_verificacion) return
    setDownloadingId(item.id)
    try {
      const url = await certificadosApi.obtenerDescargaUrl(item.certificado.codigo_verificacion, token)
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
        <h1 className="text-3xl font-bold text-slate-900">Mis cursos</h1>
        <p className="text-slate-600">Consulta tus inscripciones, estado y acceso a certificados.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Activos</p><p className="mt-2 text-3xl font-bold text-slate-900">{stats.activos}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Pendientes</p><p className="mt-2 text-3xl font-bold text-slate-900">{stats.pendientes}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Falta pago</p><p className="mt-2 text-3xl font-bold text-slate-900">{stats.faltaPago}</p></CardContent></Card>
      </div>

      {items.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {items.map((item) => {
            const curso = item.curso
            const status = STATUS_META[item.estado_canonico || "PENDIENTE"] || STATUS_META.PENDIENTE
            return (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg text-slate-900">{curso?.titulo || "Curso"}</CardTitle>
                      <p className="mt-1 text-sm text-slate-600">Inscripción: {formatDate(item.fecha_inscripcion)}</p>
                    </div>
                    <Badge className={status.className}>{status.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600">
                  <div className="flex flex-wrap gap-4">
                    <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-blue-600" /> {formatDate(curso?.fecha_inicio)}</span>
                    <span className="inline-flex items-center gap-2"><BookOpen className="h-4 w-4 text-blue-600" /> ${Number(curso?.precio || 0).toFixed(2)}</span>
                    {item.asistencia ? <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Asistencia registrada</span> : null}
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    {curso?.slug ? (
                      <Link href={`/cursos/${curso.slug}`} className="inline-flex items-center gap-1 text-blue-700 hover:underline">
                        <BookOpen className="h-4 w-4" /> Ver curso
                      </Link>
                    ) : null}
                    {item.certificado?.codigo_verificacion ? (
                      <Link href={`/certificados/validar/${item.certificado.id}`} className="inline-flex items-center gap-1 text-emerald-700 hover:underline">
                        <ShieldCheck className="h-4 w-4" /> Validar certificado
                      </Link>
                    ) : null}
                    {item.certificado?.url_pdf ? (
                      <Button variant="outline" size="sm" onClick={() => handleDownload(item)} disabled={downloadingId === item.id}>
                        {downloadingId === item.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                        Descargar certificado
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex min-h-[220px] flex-col items-center justify-center gap-4 text-center text-slate-500">
            <p>Aún no tienes cursos inscritos.</p>
            <Button asChild className="bg-blue-600 text-white hover:bg-blue-700">
              <Link href="/cursos">Obtén tu primer certificado</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
