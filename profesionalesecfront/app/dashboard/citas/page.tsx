"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Calendar, Loader2, MessageCircle, UserRound } from "lucide-react"
import { usuarioPortalApi, type UsuarioPortalCitaRecord } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

const STATUS_META: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-700 border-amber-200",
  confirmada: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelada: "bg-rose-100 text-rose-700 border-rose-200",
  completada: "bg-blue-100 text-blue-700 border-blue-200",
}

const formatDateTime = (item: UsuarioPortalCitaRecord) => {
  const raw = item.cita_datetime || (item.fecha_cita && item.hora_cita ? `${item.fecha_cita}T${item.hora_cita}` : item.fecha_cita)
  if (!raw) return "Fecha no disponible"
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return raw
  return parsed.toLocaleString("es-EC", { dateStyle: "medium", timeStyle: "short" })
}

export default function UsuarioCitasPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<UsuarioPortalCitaRecord[]>([])

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      setLoading(false)
      return
    }

    usuarioPortalApi
      .listarCitas(token)
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((error: any) => {
        toast({ title: "No se pudieron cargar tus citas", description: error.message, variant: "destructive" })
      })
      .finally(() => setLoading(false))
  }, [toast])

  const stats = useMemo(() => ({
    proximas: items.filter((item) => item.es_proxima).length,
    completadas: items.filter((item) => item.estado === "completada").length,
    canceladas: items.filter((item) => item.estado === "cancelada").length,
  }), [items])

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Mis citas</h1>
        <p className="text-slate-600">Revisa tus citas con profesionales y su estado actual.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Próximas</p><p className="mt-2 text-3xl font-bold text-slate-900">{stats.proximas}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Completadas</p><p className="mt-2 text-3xl font-bold text-slate-900">{stats.completadas}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Canceladas</p><p className="mt-2 text-3xl font-bold text-slate-900">{stats.canceladas}</p></CardContent></Card>
      </div>

      {items.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg text-slate-900">{item.profesional?.display_name || item.profesional?.nombre || "Profesional"}</CardTitle>
                    <p className="mt-1 text-sm text-slate-600">{formatDateTime(item)}</p>
                  </div>
                  <Badge className={STATUS_META[item.estado || "pendiente"] || STATUS_META.pendiente}>{item.estado || "pendiente"}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <p className="inline-flex items-center gap-2"><MessageCircle className="h-4 w-4 text-blue-600" /> {item.comentario || "Sin comentario"}</p>
                {item.profesional?.perfil_slug ? (
                  <Link href={`/perfil/${item.profesional.perfil_slug}`} className="inline-flex items-center gap-2 text-blue-700 hover:underline">
                    <UserRound className="h-4 w-4" /> Ver perfil del profesional
                  </Link>
                ) : null}
                <div className="inline-flex items-center gap-2 text-slate-500"><Calendar className="h-4 w-4" /> Registrada {item.fecha_creacion ? new Date(item.fecha_creacion).toLocaleDateString("es-EC") : "sin fecha"}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex min-h-[220px] flex-col items-center justify-center gap-4 text-center text-slate-500">
            <p>Todavía no tienes citas registradas.</p>
            <Button asChild className="bg-blue-600 text-white hover:bg-blue-700">
              <Link href="/profesionales">Agenda tu primera cita</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
