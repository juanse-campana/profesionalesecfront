"use client"

import { useProfesional } from "@/context/profesional-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  DollarSign,
  Loader2,
  Plus,
  TrendingUp,
  XCircle,
} from "lucide-react"
import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { citasApi } from "@/lib/api"

const STATUS_STYLES: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-700 border-amber-200",
  confirmada: "bg-emerald-100 text-emerald-700 border-emerald-200",
  completada: "bg-blue-100 text-blue-700 border-blue-200",
  cancelada: "bg-rose-100 text-rose-700 border-rose-200",
}

const STATUS_LABELS: Record<string, string> = {
  pendiente: "Reservada",
  confirmada: "Confirmada",
  completada: "Completada",
  cancelada: "Cancelada",
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value)

const formatPercentage = (value: number) => `${Math.round(value)}%`

const formatDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const parseCitaDateTime = (cita: any): Date | null => {
  if (cita?.fecha_hora) {
    const parsed = new Date(cita.fecha_hora)
    if (!Number.isNaN(parsed.getTime())) return parsed
  }

  if (cita?.fecha_cita && cita?.hora_cita) {
    const parsed = new Date(`${cita.fecha_cita}T${String(cita.hora_cita)}`)
    if (!Number.isNaN(parsed.getTime())) return parsed
  }

  if (cita?.fecha_cita) {
    const parsed = new Date(cita.fecha_cita)
    if (!Number.isNaN(parsed.getTime())) return parsed
  }

  return null
}

const getPacienteNombre = (cita: any) => {
  const fullName = [
    cita?.usuario?.nombre,
    cita?.usuario?.nombres,
    cita?.usuario?.name,
    cita?.paciente?.nombre,
    cita?.cliente?.nombre,
    cita?.solicitante?.nombre,
    cita?.alias,
    cita?.nombres_completos,
  ].find((value) => typeof value === "string" && value.trim() !== "")

  return fullName?.trim() || "Paciente sin nombre"
}

export default function ProfesionalDashboardPage() {
  const { user, perfil, perfiles, token, loading } = useProfesional()
  const [citas, setCitas] = useState<any[]>([])
  const [citasLoading, setCitasLoading] = useState(true)
  const citasRefreshInFlightRef = useRef(false)

  const getClienteTelefono = (cita: any): string | null => {
    const candidates = [
      cita?.paciente_telefono,
      cita?.cliente?.telefono,
      cita?.paciente?.telefono,
      cita?.solicitante?.telefono,
      cita?.contacto_telefono,
      cita?.telefono,
      cita?.usuario?.telefono,
    ]
    const telefono = candidates.find(
      (value) =>
        value !== null &&
        value !== undefined &&
        String(value).trim() !== "" &&
        String(value).trim().toLowerCase() !== "no disp.",
    )
    return telefono ? String(telefono).trim() : null
  }

  const loadCitas = useCallback(async (showLoader = false) => {
    if (!token || citasRefreshInFlightRef.current || document.visibilityState !== "visible") return
    try {
      citasRefreshInFlightRef.current = true
      if (showLoader) setCitasLoading(true)
      const citasData = await citasApi.listar(token)
      const mappedCitas = (Array.isArray(citasData) ? citasData : []).map((c: any) => ({
        ...c,
        fecha_hora: (() => {
          if (!c.fecha_cita || !c.hora_cita) return null
          const fechaStr = typeof c.fecha_cita === "string" ? c.fecha_cita : new Date(c.fecha_cita).toISOString().split("T")[0]
          const horaStr = c.hora_cita.toString()
          return `${fechaStr}T${horaStr}`
        })(),
        estado: c.estado_id === 1 ? "pendiente" : c.estado_id === 2 ? "confirmada" : c.estado_id === 3 ? "completada" : "cancelada",
        usuario: c.usuario || { nombre: c.alias || c.nombres_completos || "Cliente sin nombre" },
        descripcion: c.comentario || c.descripcion || "Sin motivo especificado",
        telefono: getClienteTelefono(c) || "No disp.",
        correo: c.correo || c.usuario?.correo || "No disp.",
      }))
      setCitas(mappedCitas)
    } catch (error) {
      console.error("Error loading citas:", error)
    } finally {
      citasRefreshInFlightRef.current = false
      setCitasLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (!token) return

    loadCitas(true)

    const intervalId = window.setInterval(() => {
      loadCitas()
    }, 7000)

    const refetchOnFocus = () => {
      if (document.visibilityState === "visible") {
        loadCitas()
      }
    }

    window.addEventListener("focus", refetchOnFocus)
    document.addEventListener("visibilitychange", refetchOnFocus)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener("focus", refetchOnFocus)
      document.removeEventListener("visibilitychange", refetchOnFocus)
    }
  }, [token, loadCitas])

  const estadisticas = useMemo(() => ({
    citasPendientes: citas.filter((c) => c.estado === "pendiente" || c.estado_id === 1).length,
    citasConfirmadas: citas.filter((c) => c.estado === "confirmada" || c.estado_id === 2).length,
    citasCompletadas: citas.filter((c) => c.estado === "completada" || c.estado_id === 3).length,
    citasCanceladas: citas.filter((c) => c.estado === "cancelada").length,
  }), [citas])

  const citasUltimoMes = useMemo(() => {
    const today = new Date()
    const start = new Date(today)
    start.setDate(start.getDate() - 29)
    start.setHours(0, 0, 0, 0)

    const labels = Array.from({ length: 30 }, (_, index) => {
      const date = new Date(start)
      date.setDate(start.getDate() + index)
      return {
        key: date.toISOString().split("T")[0],
        label: date.toLocaleDateString("es-EC", { day: "2-digit", month: "2-digit", timeZone: "America/Guayaquil" }),
      }
    })

    const counts = new Map(labels.map((item) => [item.key, 0]))

    citas.forEach((cita) => {
      const rawDate = cita?.fecha_cita || cita?.fecha_hora
      if (!rawDate) return
      const parsed = new Date(rawDate)
      if (Number.isNaN(parsed.getTime())) return
      parsed.setHours(0, 0, 0, 0)
      if (parsed < start) return
      const key = parsed.toISOString().split("T")[0]
      if (counts.has(key)) {
        counts.set(key, (counts.get(key) || 0) + 1)
      }
    })

    const points = labels.map((item) => ({
      ...item,
      value: counts.get(item.key) || 0,
    }))

    const maxValue = Math.max(1, ...points.map((point) => point.value))
    const total = points.reduce((sum, point) => sum + point.value, 0)

    return { points, maxValue, total }
  }, [citas])

  const upcomingAppointments = useMemo(() => {
    const now = new Date()
    const todayKey = formatDateKey(now)
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowKey = formatDateKey(tomorrow)

    return citas
      .map((cita) => {
        const date = parseCitaDateTime(cita)
        if (!date) return null
        const dateKey = formatDateKey(date)
        if (dateKey !== todayKey && dateKey !== tomorrowKey) return null
        return {
          id: cita.id,
          date,
          dateKey,
          paciente: getPacienteNombre(cita),
          estado: cita.estado,
        }
      })
      .filter(Boolean)
      .sort((a: any, b: any) => a.date.getTime() - b.date.getTime()) as Array<{
        id: string | number
        date: Date
        dateKey: string
        paciente: string
        estado: string
      }>
  }, [citas])

  const conversionMetrics = useMemo(() => {
    const total = citas.length || 1
    return [
      {
        key: "pendiente",
        label: "Reservadas",
        count: estadisticas.citasPendientes,
        rate: (estadisticas.citasPendientes / total) * 100,
        color: "bg-amber-500",
      },
      {
        key: "confirmada",
        label: "Confirmadas",
        count: estadisticas.citasConfirmadas,
        rate: (estadisticas.citasConfirmadas / total) * 100,
        color: "bg-emerald-500",
      },
      {
        key: "completada",
        label: "Completadas",
        count: estadisticas.citasCompletadas,
        rate: (estadisticas.citasCompletadas / total) * 100,
        color: "bg-blue-500",
      },
      {
        key: "cancelada",
        label: "Canceladas",
        count: estadisticas.citasCanceladas,
        rate: (estadisticas.citasCanceladas / total) * 100,
        color: "bg-rose-500",
      },
    ]
  }, [citas.length, estadisticas])

  const tarifaBase = useMemo(() => {
    const candidateProfiles = [perfil, ...perfiles].filter(Boolean)
    for (const candidate of candidateProfiles) {
      const raw = candidate?.tarifa ?? candidate?.tarifa_hora ?? candidate?.rate
      const parsed = Number(raw)
      if (Number.isFinite(parsed) && parsed > 0) return parsed
    }
    return null
  }, [perfil, perfiles])

  const monthlyRevenue = useMemo(() => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const elegibleStatuses = new Set(["confirmada", "completada"])

    const citasMes = citas.filter((cita) => {
      const date = parseCitaDateTime(cita)
      if (!date) return false
      return date >= firstDay && elegibleStatuses.has(cita.estado)
    })

    const count = citasMes.length
    const estimatedRevenue = tarifaBase ? count * tarifaBase : null

    return {
      count,
      tarifaBase,
      estimatedRevenue,
    }
  }, [citas, tarifaBase])

  if (loading || citasLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-blue-600">
              Dashboard Profesional
            </h1>
            <p className="text-gray-600 text-lg">
              Hola, <span className="font-semibold text-gray-800">{user?.nombre || "Profesional"}</span>
            </p>
          </div>

          <Button
            className="bg-blue-600 hover:bg-blue-700 gap-2 w-fit"
            onClick={() => window.location.href = "/dashboard/profesional/crear-perfil"}
          >
            <Plus className="h-4 w-4" />
            Crear Nuevo Perfil
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white border-gray-200 hover:border-yellow-300 transition-all duration-300 hover:scale-105 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Citas Pendientes</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{estadisticas.citasPendientes}</div>
            <p className="text-xs text-gray-500 mt-1">Requieren confirmación</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 hover:border-green-300 transition-all duration-300 hover:scale-105 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Citas Confirmadas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{estadisticas.citasConfirmadas}</div>
            <p className="text-xs text-gray-500 mt-1">Próximas citas agendadas</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 hover:border-blue-300 transition-all duration-300 hover:scale-105 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Citas Completadas</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{estadisticas.citasCompletadas}</div>
            <p className="text-xs text-gray-500 mt-1">Histórico total</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <CalendarDays className="h-5 w-5 text-blue-600" />
              Próximas citas: hoy y mañana
            </CardTitle>
            <p className="text-sm text-slate-500">Visualiza rápidamente tus próximas reservas con hora, paciente y estado.</p>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => {
                  const statusClass = STATUS_STYLES[appointment.estado] || "bg-slate-100 text-slate-700 border-slate-200"
                  const statusLabel = STATUS_LABELS[appointment.estado] || appointment.estado
                  return (
                    <div key={appointment.id} className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{appointment.paciente}</p>
                        <p className="mt-1 text-xs text-slate-500 capitalize">
                          {appointment.date.toLocaleDateString("es-EC", { weekday: "long", day: "2-digit", month: "long", timeZone: "America/Guayaquil" })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
                          <Clock3 className="h-3.5 w-3.5" />
                          {appointment.date.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Guayaquil" })}
                        </span>
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClass}`}>
                          {statusLabel}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                No tienes citas agendadas para hoy ni mañana.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              Ingresos estimados del mes
            </CardTitle>
            <p className="text-sm text-slate-500">Estimación basada en tu tarifa actual y citas confirmadas/completadas del mes.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-emerald-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Estimado actual</p>
              <p className="mt-3 text-3xl font-bold text-emerald-700">
                {monthlyRevenue.estimatedRevenue !== null ? formatCurrency(monthlyRevenue.estimatedRevenue) : "No disponible"}
              </p>
              <p className="mt-2 text-sm text-emerald-800/80">
                {monthlyRevenue.count} cita{monthlyRevenue.count === 1 ? "" : "s"} consideradas este mes
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-100 p-4">
                <p className="text-xs uppercase tracking-widest text-slate-400">Tarifa base</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {monthlyRevenue.tarifaBase !== null ? formatCurrency(monthlyRevenue.tarifaBase) : "Sin tarifa"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 p-4">
                <p className="text-xs uppercase tracking-widest text-slate-400">Citas del mes</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{monthlyRevenue.count}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8 border-gray-200 bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-slate-900">Citas reservadas en el último mes</CardTitle>
          <p className="text-sm text-slate-500">Visualiza el comportamiento diario de tus reservas en los últimos 30 días.</p>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">Total de reservas en los últimos 30 días: <span className="font-semibold text-slate-900">{citasUltimoMes.total}</span></p>
            <p className="text-xs text-slate-400">Periodo: últimos 30 días</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex h-64 items-end gap-2 overflow-x-auto pb-2">
              {citasUltimoMes.points.map((point) => {
                const height = Math.max(point.value > 0 ? 14 : 4, Math.round((point.value / citasUltimoMes.maxValue) * 100))
                return (
                  <div key={point.key} className="flex min-w-[20px] flex-1 flex-col items-center justify-end gap-2">
                    <span className="text-[10px] font-semibold text-slate-500">{point.value}</span>
                    <div
                      className="w-full rounded-t-md bg-blue-600 transition-all hover:bg-blue-500"
                      style={{ height: `${height}%` }}
                      title={`${point.label}: ${point.value} cita${point.value === 1 ? "" : "s"}`}
                    />
                    <span className="text-[10px] text-slate-400">{point.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8 border-gray-200 bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <TrendingUp className="h-5 w-5 text-violet-600" />
            Conversión de citas
          </CardTitle>
          <p className="text-sm text-slate-500">Resumen del estado de todas tus citas registradas.</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {conversionMetrics.map((metric) => {
              const Icon = metric.key === "cancelada" ? XCircle : metric.key === "completada" ? CheckCircle2 : metric.key === "confirmada" ? TrendingUp : AlertCircle
              return (
                <div key={metric.key} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-700">{metric.label}</p>
                    <Icon className="h-4 w-4 text-slate-400" />
                  </div>
                  <p className="mt-3 text-3xl font-bold text-slate-900">{metric.count}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">{formatPercentage(metric.rate)} del total</p>
                  <div className="mt-4 h-2 rounded-full bg-slate-200">
                    <div className={`${metric.color} h-2 rounded-full`} style={{ width: `${Math.min(metric.rate, 100)}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
