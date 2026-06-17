"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import ConversatorioForm from "@/components/conversatorio-form"
import { catalogosApi, ponenciasApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function EditarConversatorioPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [profesiones, setProfesiones] = useState<any[]>([])
  const [provincias, setProvincias] = useState<any[]>([])
  const [conversatorio, setConversatorio] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem("auth_token")
      if (!token) return

      try {
        const [profs, provs, convRes] = await Promise.all([
          catalogosApi.obtenerProfesiones(),
          catalogosApi.obtenerProvincias(),
          ponenciasApi.obtenerPorId(Number(id), token, "/conversatorios")
        ])

        setProfesiones(Array.isArray(profs) ? profs : [])
        setProvincias(Array.isArray(provs) ? provs : [])

        const conv = convRes.ponencia || convRes
        setConversatorio({
          ...conv,
          fecha_inicio: conv.fecha_inicio ? new Date(conv.fecha_inicio) : new Date(),
          fecha_fin: conv.fecha_fin ? new Date(conv.fecha_fin) : new Date(),
          galeria_fotos: typeof conv.galeria_fotos === 'string'
            ? JSON.parse(conv.galeria_fotos)
            : (Array.isArray(conv.galeria_fotos) ? conv.galeria_fotos : [])
        })
      } catch (error) {
        console.error("Load error:", error)
        toast({ title: "Error", description: "No se encontró el conversatorio.", variant: "destructive" })
        router.push("/admin/conversatorios")
      } finally {
        setLoading(false)
      }
    }

    if (id) loadData()
  }, [id, router, toast])

  if (loading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Cargando datos del conversatorio...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Editar Conversatorio</h1>
          <p className="text-slate-500 font-medium italic">Actualiza la información y logística del evento.</p>
        </div>
      </div>

      <ConversatorioForm
        id={Number(id)}
        initialData={conversatorio}
        profesiones={profesiones}
        provincias={provincias}
        routePrefix="/conversatorios"
        uploadFolder="conversatorios"
        redirectPath="/admin/conversatorios"
        resourceLabel="Conversatorio"
        resourceLabelPlural="Conversatorios"
      />
    </div>
  )
}