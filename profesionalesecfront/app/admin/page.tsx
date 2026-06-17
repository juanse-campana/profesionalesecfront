"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { adminApi } from "@/lib/api"
import {
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
} from "lucide-react"

type Ponencia = {
  id: number
  titulo: string
  estado: string
  precio: number
  cupo: number
}

type Plan = {
  id: number
  nombre: string
  activo: boolean
}

export default function AdminDashboard() {
  const { toast } = useToast()

  const [ponencias, setPonencias] = useState<Ponencia[]>([])
  const [pendingProfiles, setPendingProfiles] = useState(0)
  const [activePlans, setActivePlans] = useState(0)
  const [totalPlans, setTotalPlans] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const token = localStorage.getItem("auth_token")
    if (!token) return

    try {
      const stats = await adminApi.getStats(token)
      setPonencias(stats.ponencias || [])
      const profiles = adminApi.normalizeProfilesResponse(stats.profesionales)
      setPendingProfiles(profiles.filter((p: any) => p.estado === "pendiente" || p.perfil_estado?.estado === "pendiente").length)
      setPlansFromStats(stats.planes || [])
    } catch (error) {
      console.error("Error loading dashboard stats:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del panel.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const setPlansFromStats = (plans: Plan[]) => {
    setActivePlans(plans.filter((p) => p.activo).length)
    setTotalPlans(plans.length)
  }

  const statsCards = [
    {
      title: "Eventos Educativos Activos",
      value: ponencias.filter((p) => p.estado === "publicada").length,
      subtitle: `Total de ${ponencias.length} eventos educativos`,
      icon: Users,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      hoverBorder: "hover:border-blue-300",
      hoverShadow: "hover:shadow-blue-100",
    },
    {
      title: "Perfiles Pendientes",
      value: pendingProfiles,
      subtitle: "Esperando aprobación",
      icon: FileText,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      hoverBorder: "hover:border-emerald-300",
      hoverShadow: "hover:shadow-emerald-100",
    },
    {
      title: "Planes Activos",
      value: activePlans,
      subtitle: `De ${totalPlans} planes totales`,
      icon: DollarSign,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      hoverBorder: "hover:border-amber-300",
      hoverShadow: "hover:shadow-amber-100",
    },
  ]

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500">Cargando panel...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Panel de Administración
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsCards.map((card, index) => (
          <div key={card.title} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${(index + 1) * 100}ms` }}>
            <Card className={`bg-white border-gray-200 ${card.hoverBorder} transition-all duration-300 ${card.hoverShadow} hover:scale-105`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{card.title}</CardTitle>
                <div className={`p-2 ${card.iconBg} rounded-lg`}>
                  <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-1">{card.value}</div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  {card.title === "Perfiles Pendientes" ? <Clock className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                  {card.subtitle}
                </p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}