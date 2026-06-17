"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ConversatorioForm from "@/components/conversatorio-form"
import { catalogosApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NuevoConversatorioPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [profesiones, setProfesiones] = useState<any[]>([])
  const [provincias, setProvincias] = useState<any[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profs, provs] = await Promise.all([
          catalogosApi.obtenerProfesiones(),
          catalogosApi.obtenerProvincias()
        ])
        setProfesiones(Array.isArray(profs) ? profs : [])
        setProvincias(Array.isArray(provs) ? provs : [])
      } catch (error) {
        console.error("Load error:", error)
        toast({ title: "Error", description: "No se pudieron cargar los datos.", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  if (loading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Cargando configuraciones...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Nuevo Conversatorio</h1>
          <p className="text-slate-500 font-medium italic">Configura una nueva experiencia de aprendizaje para la comunidad.</p>
        </div>
      </div>

      <ConversatorioForm
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