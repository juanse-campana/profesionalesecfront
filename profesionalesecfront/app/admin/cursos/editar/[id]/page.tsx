"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import ConversatorioForm from "@/components/conversatorio-form"
import { catalogosApi, ponenciasApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function EditarCursoPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [profesiones, setProfesiones] = useState<any[]>([])
  const [provincias, setProvincias] = useState<any[]>([])
  const [curso, setCurso] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem("auth_token")
      if (!token) return
      try {
        const [profs, provs, cursoRes] = await Promise.all([
          catalogosApi.obtenerProfesiones(),
          catalogosApi.obtenerProvincias(),
          ponenciasApi.obtenerPorId(Number(id), token, "/cursos")
        ])
        setProfesiones(Array.isArray(profs) ? profs : [])
        setProvincias(Array.isArray(provs) ? provs : [])
        const cursoData = cursoRes.ponencia || cursoRes
        setCurso({
          ...cursoData,
          fecha_inicio: cursoData.fecha_inicio ? new Date(cursoData.fecha_inicio) : new Date(),
          fecha_fin: cursoData.fecha_fin ? new Date(cursoData.fecha_fin) : new Date(),
          galeria_fotos: typeof cursoData.galeria_fotos === "string" ? JSON.parse(cursoData.galeria_fotos) : (Array.isArray(cursoData.galeria_fotos) ? cursoData.galeria_fotos : [])
        })
      } catch (error) {
        console.error("Load error:", error)
        toast({ title: "Error", description: "No se encontró el curso.", variant: "destructive" })
        router.push("/admin/cursos")
      } finally {
        setLoading(false)
      }
    }
    if (id) loadData()
  }, [id, router, toast])

  if (loading) {
    return <div className="min-h-[40vh] flex flex-col items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" /><p className="text-slate-500 font-medium animate-pulse">Cargando datos del curso...</p></div>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Editar Curso</h1>
          <p className="text-slate-500 font-medium italic">Actualiza la información y logística del curso.</p>
        </div>
      </div>
      <ConversatorioForm id={Number(id)} initialData={curso} profesiones={profesiones} provincias={provincias} routePrefix="/cursos" uploadFolder="cursos" redirectPath="/admin/cursos" resourceLabel="Curso" resourceLabelPlural="Cursos" />
    </div>
  )
}
