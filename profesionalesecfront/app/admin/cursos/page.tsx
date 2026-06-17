"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAnimatedConfirm, AnimatedConfirm } from "@/components/shared/animated-confirm"
import { useAdminCatalogs } from "@/hooks/use-admin-catalogs"
import { adminApi, ponenciasApi, ponentesApi } from "@/lib/api"
import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Globe,
  Eye,
  Loader2,
  UserPlus,
  FileText,
  CheckCircle2,
  Clock,
  MapPin,
  Info,
  DollarSign,
  BookOpen,
  Check,
  X,
  XCircle,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const LocationMap = dynamic(() => import("@/components/shared/location-map"), { ssr: false })

type Ponencia = {
  id: number
  titulo: string
  descripcion: string
  fecha_inicio: Date
  hora_inicio?: string
  fecha_fin: Date
  hora_fin?: string
  precio: number
  cupo: number
  profesion_id?: number
  estado: "borrador" | "publicada" | "finalizada"
  imagen_banner?: string
  video_url?: string
  galeria_fotos?: string[] | string
  es_destacado?: boolean
  direccion?: string
  latitud?: number
  longitud?: number
  provincia_id?: number
  ciudad_id?: number
  resumen?: string
  direccion_texto?: string
}

export default function AdminCursosPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { profesiones, provincias } = useAdminCatalogs()
  const { confirm: animatedConfirm, isOpen: isConfirmOpen, options: confirmOptions, handleConfirm: onConfirm, handleCancel: onCancel } = useAnimatedConfirm()

  const [ponencias, setPonencias] = useState<Ponencia[]>([])
  const [selectedPonenciaId, setSelectedPonenciaId] = useState<number | null>(null)
  const [ponentesList, setPonentesList] = useState<any[]>([])
  const [loadingPonentes, setLoadingPonentes] = useState(false)
  const [isExternalSpeaker, setIsExternalSpeaker] = useState(false)
  const [externalSpeakerName, setExternalSpeakerName] = useState("")
  const [isInscritosDialogOpen, setIsInscritosDialogOpen] = useState(false)
  const [selectedInscritosPonencia, setSelectedInscritosPonencia] = useState<any>(null)
  const [inscritosList, setInscritosList] = useState<any[]>([])
  const [loadingInscritos, setLoadingInscritos] = useState(false)
  const [generatingCertificates, setGeneratingCertificates] = useState(false)
  const [selectedCurso, setSelectedCurso] = useState<any>(null)
  const [isCursoDetailsOpen, setIsCursoDetailsOpen] = useState(false)
  const [lastProfilesRefreshAt] = useState<Date | null>(null)

  // We need perfilesPendientes for ponente assignment
  const [perfilesPendientes, setPerfilesPendientes] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const token = localStorage.getItem("auth_token")
    if (!token) return
    try {
      const [ponenciasRes, profilesRes] = await Promise.all([
        ponenciasApi.listarTodas(token, "/cursos"),
        adminApi.getAllProfiles(token),
      ])
      setPonencias(Array.isArray(ponenciasRes) ? ponenciasRes : (ponenciasRes.ponencias || []))
      const profiles = adminApi.normalizeProfilesResponse(profilesRes)
      setPerfilesPendientes(profiles || [])
    } catch (error) {
      console.error("Error loading admin data:", error)
      toast({ title: "Error", description: "No se pudieron cargar los datos.", variant: "destructive" })
    }
  }

  const loadPonentes = async (ponenciaId: number) => {
    setLoadingPonentes(true)
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) return
      const data = await ponentesApi.listar(token)
      const allPonentes = Array.isArray(data) ? data : []
      setPonentesList(allPonentes.filter((p: any) => p.ponencia_id === ponenciaId))
    } catch {
      setPonentesList([])
    } finally {
      setLoadingPonentes(false)
    }
  }

  const handleAsignarPonente = async (ponenciaId: number, usuarioId?: number | null, nombrePonente?: string) => {
    const token = localStorage.getItem("auth_token")
    if (!token) return
    try {
      const payload: any = { ponencia_id: ponenciaId }
      if (usuarioId) payload.usuario_id = usuarioId
      if (nombrePonente) payload.nombre_ponente = nombrePonente

      await ponentesApi.asignar(payload, token)
      toast({ title: "Ponente Asignado", description: "El ponente fue asignado correctamente." })
      setExternalSpeakerName("")
      loadPonentes(ponenciaId)
    } catch (e: any) {
      toast({ title: "Error", description: "No se pudo asignar el ponente: " + (e.message || "Error desconocido"), variant: "destructive" })
    }
  }

  const handleEliminarPonente = async (ponenteId: number) => {
    const token = localStorage.getItem("auth_token")
    if (!token) return
    try {
      await ponentesApi.eliminar(ponenteId, token)
      toast({ title: "Ponente Removido", description: "El ponente fue removido del curso." })
      if (selectedPonenciaId) loadPonentes(selectedPonenciaId)
    } catch {
      toast({ title: "Error", description: "No se pudo remover el ponente.", variant: "destructive" })
    }
  }

  const loadInscritos = async (ponenciaId: number) => {
    setLoadingInscritos(true)
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) return
      const res = await ponenciasApi.listarInscritos(ponenciaId, token, "/cursos")
      setInscritosList(res.inscripciones || [])
    } catch {
      toast({ title: "Error", description: "No se pudieron cargar los inscritos.", variant: "destructive" })
    } finally {
      setLoadingInscritos(false)
    }
  }

  const handleGenerarCertificados = async (ponenciaId: number) => {
    const ok = await animatedConfirm({
      title: "Generar Certificados",
      message: "¿Generar certificados masivos? Se enviará un correo a todos los asistentes.",
      confirmText: "Generar",
      variant: "info"
    })
    if (!ok) return

    setGeneratingCertificates(true)
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) return
      await ponenciasApi.generarCertificadosMasivo(ponenciaId, token, "/cursos")
      toast({
        title: "Proceso Iniciado",
        description: "La generación de certificados ha comenzado. Los usuarios los recibirán por correo."
      })
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "No se pudo iniciar el proceso.", variant: "destructive" })
    } finally {
      setGeneratingCertificates(false)
    }
  }

  const handlePublicarPonencia = async (id: number) => {
    try {
      const token = localStorage.getItem("auth_token") || ""
      await ponenciasApi.publicar(id, token, "/cursos")
      toast({ title: "Publicado", description: "El curso ahora es visible para el público." })
      loadData()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const handleDeleteCurso = async (id: number) => {
    const ok = await animatedConfirm({
      title: "Eliminar Curso",
      message: "¿Estás seguro de eliminar este evento? Esta acción es permanente.",
      confirmText: "Eliminar",
      variant: "danger"
    })
    if (!ok) return
    const token = localStorage.getItem("auth_token")
    if (!token) return
    try {
      await adminApi.deletePonencia(id, token, "/cursos")
      setPonencias(ponencias.filter((p) => p.id !== id))
      toast({ title: "Eliminado", description: "Curso eliminado" })
    } catch {
      toast({ title: "Error", variant: "destructive" })
    }
  }

  const openCursoDetails = (ponencia: Ponencia) => {
    setSelectedCurso(ponencia)
    setIsCursoDetailsOpen(true)
    loadPonentes(ponencia.id)
  }

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, { color: string; text: string }> = {
      borrador: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", text: "Borrador" },
      publicada: { color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", text: "Publicada" },
      finalizada: { color: "bg-gray-500/20 text-gray-400 border-gray-500/30", text: "Finalizada" },
      pendiente: { color: "bg-amber-500/20 text-amber-400 border-amber-500/30", text: "Pendiente" },
      aprobado: { color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", text: "Aprobado" },
      rechazado: { color: "bg-red-500/20 text-red-400 border-red-500/30", text: "Rechazado" },
    }
    const variant = variants[estado] || variants.borrador
    return <Badge className={cn("border", variant.color)}>{variant.text}</Badge>
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Gestión de Cursos</h2>
          <p className="text-sm text-gray-500">Crea, edita y administra tus eventos educativos</p>
        </div>
        <Button
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200 transition-all duration-300 hover:scale-105"
          onClick={() => router.push("/admin/cursos/nuevo")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Curso
        </Button>
      </div>

      <Card className="bg-white border-gray-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 hover:bg-gray-50">
                  <TableHead className="text-gray-600">Título</TableHead>
                  <TableHead className="text-gray-600">Fecha</TableHead>
                  <TableHead className="text-gray-600">Precio</TableHead>
                  <TableHead className="text-gray-600">Cupo</TableHead>
                  <TableHead className="text-gray-600">Asistentes</TableHead>
                  <TableHead className="text-gray-600">Estado</TableHead>
                  <TableHead className="text-gray-600 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ponencias.map((ponencia) => (
                  <TableRow key={ponencia.id} className="border-gray-200 hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium">{ponencia.titulo}</TableCell>
                    <TableCell>{format(ponencia.fecha_inicio, "dd/MM/yyyy")}</TableCell>
                    <TableCell>${Number(ponencia.precio || 0).toFixed(2)}</TableCell>
                    <TableCell>{ponencia.cupo}</TableCell>
                    <TableCell>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto font-bold text-blue-600"
                        onClick={() => {
                          setSelectedInscritosPonencia(ponencia)
                          loadInscritos(ponencia.id)
                          setIsInscritosDialogOpen(true)
                        }}
                      >
                        Ver Inscritos
                      </Button>
                    </TableCell>
                    <TableCell>{getEstadoBadge(ponencia.estado)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openCursoDetails(ponencia)}
                          className="hover:bg-amber-500/20 hover:text-amber-600 transition-colors"
                          title="Ver Detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {ponencia.estado === "borrador" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePublicarPonencia(ponencia.id)}
                            className="hover:bg-blue-500/20 hover:text-blue-600 transition-colors"
                            title="Publicar Ahora"
                          >
                            <Globe className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPonenciaId(ponencia.id)
                            loadPonentes(ponencia.id)
                          }}
                          className="hover:bg-emerald-500/20 hover:text-emerald-600 transition-colors"
                          title="Gestionar Ponentes"
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admin/cursos/editar/${ponencia.id}`)}
                          className="hover:bg-blue-500/20 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCurso(ponencia.id)}
                          className="hover:bg-red-500/20 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Ponentes Management Dialog */}
      <Dialog open={!!selectedPonenciaId} onOpenChange={(open) => { if (!open) { setSelectedPonenciaId(null); setPonentesList([]); } }}>
        <DialogContent className="bg-white border-gray-200 max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-emerald-600" />
              Ponentes — {ponencias.find(p => p.id === selectedPonenciaId)?.titulo || ""}
            </DialogTitle>
            <DialogDescription>Asigna o remueve ponentes de este curso</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex flex-col gap-3 w-full bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="external-speaker"
                  checked={isExternalSpeaker}
                  onCheckedChange={(checked) => setIsExternalSpeaker(checked as boolean)}
                />
                <Label htmlFor="external-speaker" className="cursor-pointer text-sm font-medium text-gray-700">
                  ¿Es un ponente externo (no registrado)?
                </Label>
              </div>

              {isExternalSpeaker ? (
                <div className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                  <Input
                    placeholder="Nombre del ponente externo (ej. Dr. Invitado Especial)"
                    value={externalSpeakerName}
                    onChange={(e) => setExternalSpeakerName(e.target.value)}
                    className="bg-white"
                  />
                  <Button
                    onClick={() => handleAsignarPonente(selectedPonenciaId!, null, externalSpeakerName)}
                    disabled={!externalSpeakerName.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                  >
                    <UserPlus className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Asignar Externo</span>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                  <Select
                    onValueChange={(value: string) => {
                      handleAsignarPonente(selectedPonenciaId!, Number(value))
                    }}
                  >
                    <SelectTrigger className="flex-1 bg-white">
                      <SelectValue placeholder="Seleccionar profesional registrado..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 h-64">
                      {perfilesPendientes
                        .filter((p) => p.estado === "aprobado")
                        .map((prof) => (
                          <SelectItem key={prof.id} value={prof.id.toString()}>
                            {prof.nombre} — {prof.profesion}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {loadingPonentes ? (
              <p className="text-sm text-gray-500 py-4 text-center">Cargando ponentes...</p>
            ) : ponentesList.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No hay ponentes asignados a este curso.</p>
            ) : (
              <div className="space-y-2">
                {ponentesList.map((ponente: any) => (
                  <div
                    key={ponente.id}
                    className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-100"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {ponente.nombre_ponente || ponente.usuario?.nombre || `Usuario #${ponente.usuario_id}`}
                      </p>
                      <p className="text-xs text-gray-500">{ponente.usuario?.correo || ""}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEliminarPonente(ponente.id)}
                      className="hover:bg-red-500/20 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Inscritos Management Dialog */}
      <Dialog open={isInscritosDialogOpen} onOpenChange={setIsInscritosDialogOpen}>
        <DialogContent className="bg-white border-gray-200 max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-3xl">
          <DialogHeader className="px-8 py-6 border-b bg-gray-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight">
                    Participantes Inscritos
                  </DialogTitle>
                  <DialogDescription className="text-gray-500">
                    Gestiona la asistencia y certificados para: <span className="font-bold text-gray-700">{selectedInscritosPonencia?.titulo}</span>
                  </DialogDescription>
                </div>
              </div>
              <Button
                disabled={generatingCertificates || inscritosList.length === 0}
                onClick={() => handleGenerarCertificados(selectedInscritosPonencia.id)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200"
              >
                <FileText className="mr-2 h-4 w-4" />
                {generatingCertificates ? "Generando..." : "Generar Certificados Masivo"}
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-8">
            {loadingInscritos ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium">Cargando lista de participantes...</p>
              </div>
            ) : inscritosList.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-700">Sin inscritos aún</h3>
                <p className="text-gray-500 text-sm">Nadie se ha registrado para este evento todavía.</p>
              </div>
            ) : (
              <div className="border rounded-2xl overflow-x-auto border-gray-100 shadow-sm">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-bold">Nombre</TableHead>
                      <TableHead className="font-bold">Cédula</TableHead>
                      <TableHead className="font-bold">Contacto</TableHead>
                      <TableHead className="font-bold text-center">Asistencia</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inscritosList.map((insc) => (
                      <TableRow key={insc.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="font-medium text-gray-900">
                          {insc.usuario?.nombre || "Usuario no registrado"}
                        </TableCell>
                        <TableCell className="text-gray-600 font-mono text-xs">
                          {insc.cedula || insc.usuario?.cedula || "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <p className="text-gray-900">{insc.correo || insc.usuario?.correo}</p>
                            <p className="text-gray-400">{insc.celular || insc.usuario?.telefono || "-"}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {insc.asistencia ? (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Presente
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-400 border-gray-200">
                              Falta
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Curso Details Dialog */}
      <Dialog open={isCursoDetailsOpen} onOpenChange={setIsCursoDetailsOpen}>
        <DialogContent className="bg-white border-gray-200 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              {selectedCurso?.titulo}
              {selectedCurso && getEstadoBadge(selectedCurso.estado)}
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-lg">
              Detalles completos del evento seleccionado
            </DialogDescription>
          </DialogHeader>

          {selectedCurso && (
            <div className="grid gap-6 py-4">
              {selectedCurso.resumen && (
                <Card className="bg-amber-50 border-amber-100 shadow-none">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-amber-900 mb-1 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" /> Resumen Informativo
                    </h3>
                    <p className="text-amber-800 text-sm italic">
                      {selectedCurso.resumen}
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="p-5 bg-white border border-gray-100 rounded-xl shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3 text-lg border-b pb-2 flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-500" /> Descripción del Curso
                </h3>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedCurso.descripcion}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-gray-100 shadow-sm bg-gray-50/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="h-4 w-4 text-emerald-600" /> Horarios y Logística
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 flex items-center gap-2"><CalendarIcon className="h-4 w-4" /> Fecha:</span>
                      <span className="font-semibold">{format(new Date(selectedCurso.fecha_inicio), "PPP", { locale: es })}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500"><Clock className="h-4 w-4 mr-2" /> Inicio:</span>
                      <span className="font-semibold text-emerald-700">
                        {format(new Date(selectedCurso.fecha_inicio), "p")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500"><Clock className="h-4 w-4 mr-2" /> Fin:</span>
                      <span className="font-semibold text-red-700">
                        {format(new Date(selectedCurso.fecha_fin), "p")}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-100 shadow-sm bg-gray-50/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-amber-600" /> Inversión y Disponibilidad
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500"><DollarSign className="h-4 w-4 mr-2" /> Precio:</span>
                      <span className="text-lg font-bold text-gray-900">${Number(selectedCurso.precio).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500"><Users className="h-4 w-4 mr-2" /> Cupos Totales:</span>
                      <span className="font-semibold">{selectedCurso.cupo} personas</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500"><CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> Estado:</span>
                      <Badge variant="outline" className="capitalize">{selectedCurso.estado}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {(selectedCurso.latitud || selectedCurso.direccion_texto) && (
                <Card className="border-gray-100 shadow-sm overflow-hidden">
                  <CardHeader className="bg-gray-50 pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-500" /> Localización del Evento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="p-4 space-y-2 border-b">
                      <p className="text-sm font-medium text-gray-800">{selectedCurso.direccion_texto || "Dirección no especificada"}</p>
                      {selectedCurso.latitud && selectedCurso.longitud && (
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded">Lat: {Number(selectedCurso.latitud).toFixed(6)}</span>
                          <span className="bg-gray-100 px-2 py-1 rounded">Long: {Number(selectedCurso.longitud).toFixed(6)}</span>
                          <a
                            href={`https://www.google.com/maps?q=${selectedCurso.latitud},${selectedCurso.longitud}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline font-medium flex items-center gap-1"
                          >
                            <Globe className="h-3 w-3" /> Ver en Google Maps
                          </a>
                        </div>
                      )}
                    </div>
                    {selectedCurso.latitud && selectedCurso.longitud && (
                      <div className="h-64 relative bg-gray-100 flex items-center justify-center">
                        <LocationMap
                          lat={selectedCurso.latitud}
                          lng={selectedCurso.longitud}
                          readonly
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card className="border-gray-100 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-emerald-600" /> Ponentes Asignados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingPonentes ? (
                    <p className="text-sm text-gray-500 text-center py-4">Cargando ponentes...</p>
                  ) : ponentesList.length === 0 ? (
                    <p className="text-sm text-gray-400 italic text-center py-4">No hay ponentes asignados a este curso.</p>
                  ) : (
                    <div className="space-y-2">
                      {ponentesList.map((ponente: any) => (
                        <div key={ponente.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                            {(ponente.nombre || ponente.nombre_ponente || "P").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{ponente.nombre || ponente.nombre_ponente}</p>
                            <p className="text-xs text-gray-500">{ponente.tipo === 'registrado' ? 'Profesional EC' : 'Experto Invitado'}{ponente.correo ? ` · ${ponente.correo}` : ''}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setIsCursoDetailsOpen(false)} className="px-8 hover:bg-gray-100">
                  Cerrar Detalles
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AnimatedConfirm
        isOpen={isConfirmOpen}
        options={confirmOptions}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </div>
  )
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  )
}