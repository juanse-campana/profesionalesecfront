"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { adminApi, catalogosApi, profesionalApi } from "@/lib/api"
import { formatUrl, cn } from "@/lib/utils"
import { useAdminCatalogs } from "@/hooks/use-admin-catalogs"
import ProfessionManagementDialog from "@/components/admin/profession-management-dialog"
import {
  Check,
  X,
  AlertCircle,
  Loader2,
  Star,
  FileText,
  Clock,
  DollarSign,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Music,
  Youtube,
  UserCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

type PerfilPendiente = {
  id: number
  verificado: boolean
  estado: "pendiente" | "aprobado" | "rechazado"
  nombre: string
  correo: string
  telefono: string
  profesion: string
  fecha_registro: string
  perfil_estado: { estado: "pendiente" | "aprobado" | "rechazado" }
  cedula?: string
  especialidad?: string
  ciudad?: string
  provincia?: string
  tarifa?: string
  descripcion?: string
  documentos?: any[]
  comprobante_pago_url?: string | null
  foto_url?: string | null
  is_featured?: boolean
  facebook_url?: string
  instagram_url?: string
  tiktok_url?: string
  linkedin_url?: string
  x_url?: string
  yt_url?: string
  direccion_texto?: string
  link_maps?: string | null
  usuario_id?: number
}

export default function AdminProfesionalesPage() {
  const { toast } = useToast()
  const { profesiones, provincias, refresh: refreshProfesionesCatalogo } = useAdminCatalogs()

  const [perfilesPendientes, setPerfilesPendientes] = useState<PerfilPendiente[]>([])
  const [profilesMeta, setProfilesMeta] = useState({ totalItems: 0, totalPages: 1, currentPage: 1, itemsPerPage: 12, statusCounts: { todos: 0, pendiente: 0, aprobado: 0, rechazado: 0 } })
  const [profilesLoading, setProfilesLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const profilesPerPage = 12
  const [processingProfiles, setProcessingProfiles] = useState<Record<number, "approving" | "rejecting" | null>>({})
  const [lastProfilesRefreshAt, setLastProfilesRefreshAt] = useState<Date | null>(null)
  const [profilesAnimationKey, setProfilesAnimationKey] = useState(0)
  const profilesRefreshInFlightRef = useRef(false)
  const profilesSignatureRef = useRef<string>("")
  const mountedRef = useRef(true)

  const [isProfileDetailsOpen, setIsProfileDetailsOpen] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<any>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [savingProfileChanges, setSavingProfileChanges] = useState(false)
  const [especialidadesOptions, setEspecialidadesOptions] = useState<any[]>([])
  const [ciudadesOptions, setCiudadesOptions] = useState<any[]>([])
  const [editProfileForm, setEditProfileForm] = useState({
    telefono: "",
    cedula: "",
    profesion_id: "",
    especialidad_id: "",
    provincia_id: "",
    ciudad_id: "",
    descripcion: "",
    tarifa: "",
    calle_principal: "",
    referencia: "",
    permitir_reagendar: true,
    facebook_url: "",
    instagram_url: "",
    tiktok_url: "",
    linkedin_url: "",
    x_url: "",
    yt_url: "",
  })

  const [filterStatus, setFilterStatus] = useState<"todos" | "pendiente" | "aprobado" | "rechazado">("todos")

  useEffect(() => {
    setCurrentPage(1)
  }, [filterStatus])

  const mapProfilesFromApi = useCallback((profiles: any[] = []) => {
    return profiles.map((p: any) => {
      const estado = adminApi.normalizeProfileStatus(p)
      return {
        id: p.id,
        usuario_id: p.usuario_id,
        verificado: p.verificado,
        estado,
        nombre: p.usuario?.nombre || "Sin nombre",
        correo: p.usuario?.correo || "",
        telefono: p.telefono || p.usuario?.telefono || "No disponible (API)",
        cedula: p.cedula || p.usuario?.cedula || p.usuario?.identificacion || p.usuario?.dni || p.usuario?.nro_identificacion || p.usuario?.cedula_identidad || "No disponible (API)",
        profesion: p.profesion ? p.profesion.nombre : "Sin profesión",
        especialidad: p.especialidad ? p.especialidad.nombre : "Sin especialidad",
        ciudad: p.ciudad ? p.ciudad.nombre : "",
        provincia: p.ciudad?.provincia ? p.ciudad.provincia.nombre : "",
        tarifa: p.tarifa ? `$${p.tarifa}` : (p.tarifa_hora ? `$${p.tarifa_hora}` : "No definida"),
        fecha_registro: p.usuario?.creado_en || p.creado_en || p.created_at || p.fecha_registro || "",
        descripcion: p.descripcion || "Sin descripción",
        documentos: p.documentos || [],
        comprobante_pago_url: p.comprobante_pago_url || null,
        foto_url: formatUrl(p.foto_url || p.usuario?.foto_url || p.usuario?.foto || p.usuario?.avatar || p.usuario?.imagen_url),
        is_featured: p.is_featured ?? p.destacado ?? false,
        facebook_url: p.facebook_url || "",
        instagram_url: p.instagram_url || "",
        tiktok_url: p.tiktok_url || "",
        linkedin_url: p.linkedin_url || "",
        x_url: p.x_url || "",
        yt_url: p.yt_url || "",
        direccion_texto: (p.calle_principal || p.direccion?.calle_principal)
          ? `${p.calle_principal || p.direccion?.calle_principal} ${(p.referencia || p.direccion?.referencia) ? `(${p.referencia || p.direccion?.referencia})` : ""}`
          : "No registrada",
        link_maps: (p.lat && p.lng) || (p.latitud && p.longitud)
          ? `https://www.google.com/maps?q=${p.lat || p.latitud},${p.lng || p.longitud}`
          : p.direccion?.link_maps || null,
        perfil_estado: { estado },
      }
    })
  }, [])

  const getProfilesSignature = useCallback((profiles: PerfilPendiente[]) => {
    return JSON.stringify(
      [...profiles]
        .sort((a, b) => a.id - b.id)
        .map((profile: any) => ({
          id: profile.id,
          usuario_id: profile.usuario_id ?? null,
          verificado: profile.verificado,
          estado: profile.estado,
          nombre: profile.nombre,
          correo: profile.correo,
          telefono: profile.telefono,
          cedula: profile.cedula,
          profesion: profile.profesion,
          especialidad: profile.especialidad,
          ciudad: profile.ciudad,
          provincia: profile.provincia,
          tarifa: profile.tarifa,
          fecha_registro: profile.fecha_registro,
          descripcion: profile.descripcion,
          comprobante_pago_url: profile.comprobante_pago_url,
          foto_url: profile.foto_url,
          direccion_texto: profile.direccion_texto,
          link_maps: profile.link_maps,
          is_featured: profile.is_featured ?? false,
          facebook_url: profile.facebook_url,
          instagram_url: profile.instagram_url,
          tiktok_url: profile.tiktok_url,
          linkedin_url: profile.linkedin_url,
          x_url: profile.x_url,
          yt_url: profile.yt_url,
          documentos: Array.isArray(profile.documentos)
            ? profile.documentos
              .map((documento: any) => ({
                id: documento?.id ?? null,
                tipo: documento?.tipo ?? documento?.tipo_documento ?? "",
                url: documento?.url ?? documento?.archivo_url ?? documento?.documento_url ?? "",
                estado: documento?.estado ?? "",
              }))
              .sort((a: any, b: any) => `${a.id}-${a.tipo}-${a.url}`.localeCompare(`${b.id}-${a.tipo}-${a.url}`))
            : [],
        })),
    )
  }, [])

  const formatProfileDate = (date: string, outputFormat: string) => {
    if (!date) return "No disponible"
    const parsedDate = new Date(date)
    if (Number.isNaN(parsedDate.getTime())) return "No disponible"
    return format(parsedDate, outputFormat, { locale: es })
  }

  const getNumericId = (value: any) => {
    if (value === null || value === undefined || value === "") return ""
    const parsed = Number(value)
    return Number.isFinite(parsed) && parsed > 0 ? String(parsed) : ""
  }

  const parseDireccion = (direccion?: string) => {
    if (!direccion || direccion === "No registrada") {
      return { calle_principal: "", referencia: "" }
    }

    const match = direccion.match(/^(.*?)(?:\s*\((.*)\))?$/)
    return {
      calle_principal: match?.[1]?.trim() || "",
      referencia: match?.[2]?.trim() || "",
    }
  }

  const applyProfilesSnapshot = useCallback((rawProfiles: any[], animateOnChange = false) => {
    const normalizedProfiles = mapProfilesFromApi(rawProfiles)
    const nextSignature = getProfilesSignature(normalizedProfiles)
    const hasPreviousSnapshot = profilesSignatureRef.current !== ""

    if (nextSignature !== profilesSignatureRef.current) {
      profilesSignatureRef.current = nextSignature
      setPerfilesPendientes(normalizedProfiles)
      setLastProfilesRefreshAt(new Date())
      if (animateOnChange && hasPreviousSnapshot) {
        setProfilesAnimationKey((key) => key + 1)
      }
    }
  }, [getProfilesSignature, mapProfilesFromApi])

  const refreshProfiles = useCallback(async (options?: { silent?: boolean }) => {
    const token = localStorage.getItem("auth_token")
    if (!token || profilesRefreshInFlightRef.current || document.visibilityState !== "visible") return

    profilesRefreshInFlightRef.current = true
    if (!options?.silent) {
      setProfilesLoading(true)
    }

    try {
      const response = await adminApi.getProfilesPage(token, {
        page: currentPage,
        limit: profilesPerPage,
        status: filterStatus,
      })
      if (!mountedRef.current) return
      applyProfilesSnapshot(response.items, true)
      setProfilesMeta(response.meta)
    } catch {
      // Polling silencioso
    } finally {
      profilesRefreshInFlightRef.current = false
      if (!options?.silent && mountedRef.current) {
        setProfilesLoading(false)
      }
    }
  }, [applyProfilesSnapshot, currentPage, filterStatus])

  const loadEspecialidades = useCallback(async (profesionId: string) => {
    if (!profesionId) {
      setEspecialidadesOptions([])
      return
    }

    try {
      const response = await catalogosApi.obtenerEspecialidades(Number(profesionId))
      const normalized = Array.isArray(response)
        ? response.filter((item: any) => Number(item.profesion_id) === Number(profesionId))
        : []
      setEspecialidadesOptions(normalized)
    } catch {
      setEspecialidadesOptions([])
    }
  }, [])

  const loadCiudades = useCallback(async (provinciaId: string) => {
    if (!provinciaId) {
      setCiudadesOptions([])
      return
    }

    try {
      const response = await catalogosApi.obtenerCiudades(Number(provinciaId))
      setCiudadesOptions(Array.isArray(response) ? response : [])
    } catch {
      setCiudadesOptions([])
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    refreshProfiles()

    const intervalId = window.setInterval(() => {
      refreshProfiles({ silent: true })
    }, 7000)

    const refetchOnFocus = () => {
      if (document.visibilityState === "visible") {
        refreshProfiles()
      }
    }

    window.addEventListener("focus", refetchOnFocus)
    document.addEventListener("visibilitychange", refetchOnFocus)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener("focus", refetchOnFocus)
      document.removeEventListener("visibilitychange", refetchOnFocus)
      mountedRef.current = false
    }
  }, [refreshProfiles])

  const filteredProfiles = useMemo(() => perfilesPendientes, [perfilesPendientes])

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

  const aprobarPerfil = async (id: number) => {
    setProcessingProfiles((prev) => ({ ...prev, [id]: "approving" }))
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) return

      await adminApi.approveProfile(id, token)
      setPerfilesPendientes((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, estado: "aprobado", perfil_estado: { estado: "aprobado" }, verificado: true } : p,
        ),
      )

      toast({
        title: "Perfil Aprobado",
        description: "El perfil ha sido aprobado exitosamente.",
      })
    } catch {
      toast({ title: "Error", description: "No se pudo aprobar el perfil", variant: "destructive" })
    } finally {
      setProcessingProfiles((prev) => ({ ...prev, [id]: null }))
    }
  }

  const rechazarPerfil = async (id: number) => {
    setProcessingProfiles((prev) => ({ ...prev, [id]: "rejecting" }))
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) return

      await adminApi.rejectProfile(id, token)
      setPerfilesPendientes((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, estado: "rechazado", perfil_estado: { estado: "rechazado" }, verificado: false } : p,
        ),
      )

      toast({
        title: "Perfil Rechazado",
        description: "El perfil ha sido rechazado.",
        variant: "destructive",
      })
    } catch {
      toast({ title: "Error", description: "No se pudo rechazar el perfil", variant: "destructive" })
    } finally {
      setProcessingProfiles((prev) => ({ ...prev, [id]: null }))
    }
  }

  const toggleDestacadoPerfil = async (id: number) => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) return

      const result = await adminApi.toggleDestacado(id, token)
      setSelectedProfile((prev: any) => prev ? { ...prev, is_featured: result.is_featured } : prev)
      setPerfilesPendientes((prev: any[]) =>
        prev.map((p) => p.id === id ? { ...p, is_featured: result.is_featured } : p)
      )
      toast({
        title: result.is_featured ? "Perfil destacado" : "Perfil removido de destacados",
        description: result.is_featured
          ? "El perfil aparecerá en la sección de Profesionales Destacados del home."
          : "El perfil ya no aparecerá en la sección de destacados.",
      })
    } catch {
      toast({ title: "Error", description: "No se pudo actualizar el estado de destacado", variant: "destructive" })
    }
  }

  const hydrateProfileDetails = useCallback(async (profile: any) => {
    const token = localStorage.getItem("auth_token")
    if (!token) return

    try {
      const fullData = await profesionalApi.obtenerMiPerfil(token, profile.id)
      const detailedProfile = Array.isArray(fullData) ? fullData[0] : (fullData.perfil || fullData)

      if (detailedProfile) {
        setSelectedProfile((prev: any) => ({
          ...prev,
          ...detailedProfile,
          profesion: detailedProfile.profesion?.nombre || detailedProfile.profesion || prev?.profesion,
          especialidad: detailedProfile.especialidad?.nombre || detailedProfile.especialidad || prev?.especialidad,
          ciudad: detailedProfile.ciudad?.nombre || detailedProfile.ciudad || prev?.ciudad,
          provincia: detailedProfile.ciudad?.provincia?.nombre || detailedProfile.provincia || prev?.provincia,
          documentos: detailedProfile.documentos || detailedProfile.PerfilDocumentos || detailedProfile.perfil_documentos || prev?.documentos || [],
          comprobante_pago_url: detailedProfile.comprobante_pago_url || prev?.comprobante_pago_url || null,
        }))
      }
    } catch (error) {
      console.error("Error fetching full profile details:", error)
    }
  }, [])

  const openProfileDetails = async (profile: any) => {
    setSelectedProfile(profile)
    setIsProfileDetailsOpen(true)
    setIsEditingProfile(false)
    await hydrateProfileDetails(profile)
  }

  useEffect(() => {
    if (!selectedProfile) return

    const { calle_principal, referencia } = parseDireccion(selectedProfile.direccion_texto)
    const profesionId = getNumericId(selectedProfile.profesion_id ?? selectedProfile.profesion?.id)
    const especialidadId = getNumericId(selectedProfile.especialidad_id ?? selectedProfile.especialidad?.id)
    const ciudadId = getNumericId(selectedProfile.ciudad_id ?? selectedProfile.ciudad?.id)
    const provinciaId = getNumericId(
      selectedProfile.provincia_id ?? selectedProfile.ciudad?.provincia_id ?? selectedProfile.ciudad?.provincia?.id,
    )

    setEditProfileForm({
      telefono: selectedProfile.telefono && selectedProfile.telefono !== "No disponible (API)" ? selectedProfile.telefono : "",
      cedula: selectedProfile.cedula && selectedProfile.cedula !== "No disponible (API)" ? selectedProfile.cedula : "",
      profesion_id: profesionId,
      especialidad_id: especialidadId,
      provincia_id: provinciaId,
      ciudad_id: ciudadId,
      descripcion: selectedProfile.descripcion || "",
      tarifa: selectedProfile.tarifa ? String(selectedProfile.tarifa).replace(/^\$/, "") : "",
      calle_principal,
      referencia,
      permitir_reagendar: selectedProfile.permitir_reagendar ?? true,
      facebook_url: selectedProfile.facebook_url || "",
      instagram_url: selectedProfile.instagram_url || "",
      tiktok_url: selectedProfile.tiktok_url || "",
      linkedin_url: selectedProfile.linkedin_url || "",
      x_url: selectedProfile.x_url || "",
      yt_url: selectedProfile.yt_url || "",
    })
  }, [selectedProfile])

  useEffect(() => {
    if (isEditingProfile) {
      loadEspecialidades(editProfileForm.profesion_id)
    }
  }, [editProfileForm.profesion_id, isEditingProfile, loadEspecialidades])

  useEffect(() => {
    if (isEditingProfile) {
      loadCiudades(editProfileForm.provincia_id)
    }
  }, [editProfileForm.provincia_id, isEditingProfile, loadCiudades])

  const handleEditProfileField = (field: keyof typeof editProfileForm, value: string | boolean) => {
    setEditProfileForm((prev) => {
      const next = { ...prev, [field]: value }

      if (field === "profesion_id") {
        next.especialidad_id = ""
      }

      if (field === "provincia_id") {
        next.ciudad_id = ""
      }

      return next
    })
  }

  const handleSaveProfileChanges = async () => {
    if (!selectedProfile?.id) return

    const token = localStorage.getItem("auth_token")
    if (!token) return

    const tarifaNormalizada = editProfileForm.tarifa.trim()
    const tarifaNumero = tarifaNormalizada === "" ? undefined : Number(tarifaNormalizada)

    if (editProfileForm.descripcion.length > 80) {
      toast({
        title: "Error",
        description: "La descripción profesional no puede exceder 80 caracteres.",
        variant: "destructive",
      })
      return
    }

    if (tarifaNormalizada !== "" && !Number.isFinite(tarifaNumero)) {
      toast({
        title: "Error",
        description: "La tarifa debe ser un número válido.",
        variant: "destructive",
      })
      return
    }

    try {
      setSavingProfileChanges(true)

      const payload: any = {
        id: selectedProfile.id,
        telefono: editProfileForm.telefono.trim(),
        cedula: editProfileForm.cedula.trim(),
        descripcion: editProfileForm.descripcion.trim(),
        permitir_reagendar: editProfileForm.permitir_reagendar,
        calle_principal: editProfileForm.calle_principal.trim(),
        referencia: editProfileForm.referencia.trim(),
        facebook_url: editProfileForm.facebook_url.trim(),
        instagram_url: editProfileForm.instagram_url.trim(),
        tiktok_url: editProfileForm.tiktok_url.trim(),
        linkedin_url: editProfileForm.linkedin_url.trim(),
        x_url: editProfileForm.x_url.trim(),
        yt_url: editProfileForm.yt_url.trim(),
      }

      if (Number.isFinite(tarifaNumero)) {
        payload.tarifa = tarifaNumero
      }
      if (editProfileForm.profesion_id) {
        payload.profesion_id = Number(editProfileForm.profesion_id)
      }
      if (editProfileForm.especialidad_id) {
        payload.especialidad_id = Number(editProfileForm.especialidad_id)
      }
      if (editProfileForm.ciudad_id) {
        payload.ciudad_id = Number(editProfileForm.ciudad_id)
      }

      await profesionalApi.actualizarPerfil(payload, token)
      const profesionSeleccionada = profesiones.find(
        (profesion: any) => String(profesion.id) === editProfileForm.profesion_id,
      )
      const especialidadSeleccionada = especialidadesOptions.find(
        (especialidad: any) => String(especialidad.id) === editProfileForm.especialidad_id,
      )
      const ciudadSeleccionada = ciudadesOptions.find(
        (ciudad: any) => String(ciudad.id) === editProfileForm.ciudad_id,
      )
      const provinciaSeleccionada = provincias.find(
        (provincia: any) => String(provincia.id) === editProfileForm.provincia_id,
      )
      const direccionTextoActualizada = editProfileForm.calle_principal.trim()
        ? `${editProfileForm.calle_principal.trim()}${editProfileForm.referencia.trim() ? ` (${editProfileForm.referencia.trim()})` : ""}`
        : "No registrada"

      const updatedProfile = {
        ...selectedProfile,
        telefono: editProfileForm.telefono.trim(),
        cedula: editProfileForm.cedula.trim(),
        descripcion: editProfileForm.descripcion.trim(),
        permitir_reagendar: editProfileForm.permitir_reagendar,
        profesion_id: editProfileForm.profesion_id ? Number(editProfileForm.profesion_id) : selectedProfile.profesion_id,
        especialidad_id: editProfileForm.especialidad_id ? Number(editProfileForm.especialidad_id) : null,
        provincia_id: editProfileForm.provincia_id ? Number(editProfileForm.provincia_id) : null,
        ciudad_id: editProfileForm.ciudad_id ? Number(editProfileForm.ciudad_id) : null,
        profesion: profesionSeleccionada?.nombre || selectedProfile.profesion,
        especialidad: especialidadSeleccionada?.nombre || "Sin especialidad",
        ciudad: ciudadSeleccionada?.nombre || "",
        provincia: provinciaSeleccionada?.nombre || "",
        tarifa: tarifaNormalizada === "" ? "No definida" : `$${tarifaNormalizada}`,
        calle_principal: editProfileForm.calle_principal.trim(),
        referencia: editProfileForm.referencia.trim(),
        direccion_texto: direccionTextoActualizada,
        facebook_url: editProfileForm.facebook_url.trim(),
        instagram_url: editProfileForm.instagram_url.trim(),
        tiktok_url: editProfileForm.tiktok_url.trim(),
        linkedin_url: editProfileForm.linkedin_url.trim(),
        x_url: editProfileForm.x_url.trim(),
        yt_url: editProfileForm.yt_url.trim(),
      }

      setSelectedProfile(updatedProfile)
      setPerfilesPendientes((prev) =>
        prev.map((profile) =>
          profile.id === selectedProfile.id
            ? {
                ...profile,
                telefono: updatedProfile.telefono,
                cedula: updatedProfile.cedula,
                profesion: updatedProfile.profesion,
                especialidad: updatedProfile.especialidad,
                ciudad: updatedProfile.ciudad,
                provincia: updatedProfile.provincia,
                tarifa: updatedProfile.tarifa,
                descripcion: updatedProfile.descripcion,
                direccion_texto: updatedProfile.direccion_texto,
                facebook_url: updatedProfile.facebook_url,
                instagram_url: updatedProfile.instagram_url,
                tiktok_url: updatedProfile.tiktok_url,
                linkedin_url: updatedProfile.linkedin_url,
                x_url: updatedProfile.x_url,
                yt_url: updatedProfile.yt_url,
              }
            : profile,
        ),
      )
      await refreshProfiles()
      await hydrateProfileDetails(updatedProfile)
      setIsEditingProfile(false)

      toast({
        title: "Perfil actualizado",
        description: "Los cambios del profesional se guardaron correctamente.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "No se pudo actualizar la información del profesional.",
        variant: "destructive",
      })
    } finally {
      setSavingProfileChanges(false)
    }
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Gestión de Profesionales</h2>
          <p className="text-sm text-gray-500">
            Administra todos los perfiles profesionales registrados
          </p>
          {lastProfilesRefreshAt && (
            <p className="text-xs text-gray-400 mt-1">
              Actualizado: {format(lastProfilesRefreshAt, "HH:mm:ss", { locale: es })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ProfessionManagementDialog
            profesiones={profesiones}
            onRefreshProfesiones={refreshProfesionesCatalogo}
          />
        </div>
      </div>

      <div className="flex space-x-2 p-1 bg-muted/50 rounded-lg w-fit mb-4">
        {(["todos", "pendiente", "aprobado", "rechazado"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filterStatus === status
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="ml-2 text-xs opacity-70">
              ({profilesMeta.statusCounts[status]})
            </span>
          </button>
        ))}
      </div>

      <div
        key={profilesAnimationKey}
        className="grid gap-4 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-700"
      >
        {profilesLoading ? (
          <Card className="bg-white border-gray-200">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mb-4" />
              <p className="text-sm text-gray-500">Cargando profesionales...</p>
            </CardContent>
          </Card>
        ) : filteredProfiles.length === 0 ? (
          <Card className="bg-white border-gray-200">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-500 mb-4" />
              <h3 className="text-lg font-semibold mb-1">No se encontraron profesionales</h3>
              <p className="text-sm text-gray-500">No hay perfiles con el estado "{filterStatus}"</p>
            </CardContent>
          </Card>
        ) : (
          filteredProfiles.map((perfil, index) => (
            <Card
              key={perfil.id}
              className="bg-white border-gray-200 hover:border-emerald-300 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl mb-2">{perfil.nombre}</CardTitle>
                    <CardDescription className="text-base">{perfil.profesion}</CardDescription>
                  </div>
                  {getEstadoBadge(perfil.estado)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-500">Correo:</span>
                    <span>{perfil.correo}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-500">Teléfono:</span>
                    <span>{perfil.telefono || "No registrado"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-500">Registro:</span>
                    <span>{formatProfileDate(perfil.fecha_registro, "dd/MM/yyyy")}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => openProfileDetails(perfil)}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 transition-all"
                  >
                    Ver Detalles
                  </Button>
                  {perfil.estado !== "aprobado" && (
                    <Button
                      onClick={() => aprobarPerfil(perfil.id)}
                      disabled={!!processingProfiles[perfil.id]}
                      className={cn(
                        "flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 hover:scale-105",
                        processingProfiles[perfil.id] && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {processingProfiles[perfil.id] === "approving" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="mr-2 h-4 w-4" />
                      )}
                      Aprobar
                    </Button>
                  )}
                  {perfil.estado !== "rechazado" && (
                    <Button
                      onClick={() => rechazarPerfil(perfil.id)}
                      variant="destructive"
                      disabled={!!processingProfiles[perfil.id]}
                      className={cn(
                        "flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-300 hover:scale-105",
                        processingProfiles[perfil.id] && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {processingProfiles[perfil.id] === "rejecting" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <X className="mr-2 h-4 w-4" />
                      )}
                      Rechazar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {profilesMeta.totalPages > 1 ? (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            Página {profilesMeta.currentPage} de {profilesMeta.totalPages} · {profilesMeta.totalItems} profesionales
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={profilesLoading || currentPage <= 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              disabled={profilesLoading || currentPage >= profilesMeta.totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, profilesMeta.totalPages))}
            >
              Siguiente
            </Button>
          </div>
        </div>
      ) : null}

      <Dialog open={isProfileDetailsOpen} onOpenChange={setIsProfileDetailsOpen}>
        <DialogContent className="bg-white border-gray-200 w-[95vw] sm:w-[92vw] md:w-[88vw] lg:w-[80vw] lg:max-w-5xl max-h-[90vh] overflow-x-hidden overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="min-w-0">
            <DialogTitle className="text-2xl font-bold flex flex-wrap items-center gap-2 min-w-0">
              <span className="min-w-0 break-words [overflow-wrap:anywhere]">{selectedProfile?.nombre}</span>
              {selectedProfile && getEstadoBadge(selectedProfile.estado)}
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-lg">
              {selectedProfile?.profesion}
            </DialogDescription>
          </DialogHeader>

          {selectedProfile && (
            <div className="grid gap-6 py-4 min-w-0 overflow-x-hidden">
              <Card className="bg-gray-50 border-none shadow-none">
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold text-gray-700">Cédula:</span>
                    <span className="min-w-0 break-words [overflow-wrap:anywhere]">{selectedProfile.cedula}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold text-gray-700">Correo:</span>
                    <span className="min-w-0 break-words [overflow-wrap:anywhere]">{selectedProfile.correo}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold text-gray-700">Teléfono:</span>
                    <span className="min-w-0 break-words [overflow-wrap:anywhere]">{selectedProfile.telefono || "No registrado"}</span>
                  </div>
                  <div className="flex items-start gap-2 col-span-1 md:col-span-2 min-w-0">
                    <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-gray-700">Ubicación:</span>
                      <span className="break-words [overflow-wrap:anywhere]">
                        {selectedProfile.ciudad}
                        {selectedProfile.provincia ? `, ${selectedProfile.provincia}` : ""}
                      </span>
                      <span className="text-sm text-gray-500 break-words [overflow-wrap:anywhere]">{selectedProfile.direccion_texto}</span>
                      {selectedProfile.link_maps && (
                        <a href={selectedProfile.link_maps} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm break-words [overflow-wrap:anywhere]">
                          Ver en Google Maps
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold text-gray-700">Tarifa:</span>
                    <span className="min-w-0 break-words [overflow-wrap:anywhere]">{selectedProfile.tarifa}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold text-gray-700">Fecha Registro:</span>
                    <span className="min-w-0 break-words [overflow-wrap:anywhere]">{formatProfileDate(selectedProfile.fecha_registro, "dd/MM/yyyy HH:mm")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">Verificado:</span>
                    <span className={selectedProfile.verificado ? "text-emerald-600 font-bold" : "text-gray-500"}>
                      {selectedProfile.verificado ? "SÍ" : "NO"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {isEditingProfile && (
                <Card className="border-blue-200 bg-blue-50/40">
                  <CardHeader>
                    <CardTitle className="text-lg">Editar información del profesional</CardTitle>
                    <CardDescription>
                      Modifica los datos del perfil y guarda los cambios desde este modal.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-telefono">Teléfono</Label>
                      <Input
                        id="edit-telefono"
                        value={editProfileForm.telefono}
                        onChange={(e) => handleEditProfileField("telefono", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-cedula">Cédula</Label>
                      <Input
                        id="edit-cedula"
                        value={editProfileForm.cedula}
                        onChange={(e) => handleEditProfileField("cedula", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-profesion">Profesión</Label>
                      <select
                        id="edit-profesion"
                        value={editProfileForm.profesion_id}
                        onChange={(e) => handleEditProfileField("profesion_id", e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Selecciona una profesión</option>
                        {profesiones.map((profesion: any) => (
                          <option key={profesion.id} value={profesion.id}>
                            {profesion.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="edit-especialidad">Especialidad</Label>
                      <select
                        id="edit-especialidad"
                        value={editProfileForm.especialidad_id}
                        onChange={(e) => handleEditProfileField("especialidad_id", e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Selecciona una especialidad</option>
                        {especialidadesOptions.map((especialidad: any) => (
                          <option key={especialidad.id} value={especialidad.id}>
                            {especialidad.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="edit-provincia">Provincia</Label>
                      <select
                        id="edit-provincia"
                        value={editProfileForm.provincia_id}
                        onChange={(e) => handleEditProfileField("provincia_id", e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Selecciona una provincia</option>
                        {provincias.map((provincia: any) => (
                          <option key={provincia.id} value={provincia.id}>
                            {provincia.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="edit-ciudad">Ciudad</Label>
                      <select
                        id="edit-ciudad"
                        value={editProfileForm.ciudad_id}
                        onChange={(e) => handleEditProfileField("ciudad_id", e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Selecciona una ciudad</option>
                        {ciudadesOptions.map((ciudad: any) => (
                          <option key={ciudad.id} value={ciudad.id}>
                            {ciudad.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="edit-tarifa">Tarifa</Label>
                      <Input
                        id="edit-tarifa"
                        value={editProfileForm.tarifa}
                        onChange={(e) => handleEditProfileField("tarifa", e.target.value)}
                        placeholder="Ej: 25"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="edit-direccion">Calle principal</Label>
                      <Input
                        id="edit-direccion"
                        value={editProfileForm.calle_principal}
                        onChange={(e) => handleEditProfileField("calle_principal", e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="edit-referencia">Referencia</Label>
                      <Input
                        id="edit-referencia"
                        value={editProfileForm.referencia}
                        onChange={(e) => handleEditProfileField("referencia", e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="edit-descripcion">Descripción profesional</Label>
                      <textarea
                        id="edit-descripcion"
                        value={editProfileForm.descripcion}
                        onChange={(e) => handleEditProfileField("descripcion", e.target.value)}
                        maxLength={80}
                        className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                      <p className="mt-1 text-xs text-gray-500">{editProfileForm.descripcion.length}/80</p>
                    </div>
                    <div>
                      <Label htmlFor="edit-facebook">Facebook</Label>
                      <Input
                        id="edit-facebook"
                        value={editProfileForm.facebook_url}
                        onChange={(e) => handleEditProfileField("facebook_url", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-instagram">Instagram</Label>
                      <Input
                        id="edit-instagram"
                        value={editProfileForm.instagram_url}
                        onChange={(e) => handleEditProfileField("instagram_url", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-linkedin">LinkedIn</Label>
                      <Input
                        id="edit-linkedin"
                        value={editProfileForm.linkedin_url}
                        onChange={(e) => handleEditProfileField("linkedin_url", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-x">X / Twitter</Label>
                      <Input
                        id="edit-x"
                        value={editProfileForm.x_url}
                        onChange={(e) => handleEditProfileField("x_url", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-tiktok">TikTok</Label>
                      <Input
                        id="edit-tiktok"
                        value={editProfileForm.tiktok_url}
                        onChange={(e) => handleEditProfileField("tiktok_url", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-youtube">YouTube</Label>
                      <Input
                        id="edit-youtube"
                        value={editProfileForm.yt_url}
                        onChange={(e) => handleEditProfileField("yt_url", e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center gap-2">
                      <input
                        id="edit-reagendar"
                        type="checkbox"
                        checked={editProfileForm.permitir_reagendar}
                        onChange={(e) => handleEditProfileField("permitir_reagendar", e.target.checked)}
                      />
                      <Label htmlFor="edit-reagendar">Permitir reagendamiento</Label>
                    </div>
                  </CardContent>
                </Card>
              )}

              {(selectedProfile.facebook_url || selectedProfile.instagram_url || selectedProfile.tiktok_url || selectedProfile.linkedin_url || selectedProfile.x_url || selectedProfile.yt_url) && (
                <div>
                  <h3 className="font-semibold mb-3 text-lg">Redes Sociales</h3>
                  <div className="flex flex-wrap gap-3 min-w-0">
                    {selectedProfile.facebook_url && (
                      <a href={selectedProfile.facebook_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors min-w-0 max-w-full">
                        <Facebook className="h-4 w-4" />
                        <span className="text-sm font-medium">Facebook</span>
                      </a>
                    )}
                    {selectedProfile.instagram_url && (
                      <a href={selectedProfile.instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-pink-50 text-pink-700 rounded-lg border border-pink-100 hover:bg-pink-100 transition-colors min-w-0 max-w-full">
                        <Instagram className="h-4 w-4" />
                        <span className="text-sm font-medium">Instagram</span>
                      </a>
                    )}
                    {selectedProfile.x_url && (
                      <a href={selectedProfile.x_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors min-w-0 max-w-full">
                        <div className="h-4 w-4 flex items-center justify-center font-bold text-[10px] border border-gray-700 rounded-sm leading-none">X</div>
                        <span className="text-sm font-medium">Twitter / X</span>
                      </a>
                    )}
                    {selectedProfile.linkedin_url && (
                      <a href={selectedProfile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-800 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors min-w-0 max-w-full">
                        <Linkedin className="h-4 w-4" />
                        <span className="text-sm font-medium">LinkedIn</span>
                      </a>
                    )}
                    {selectedProfile.tiktok_url && (
                      <a href={selectedProfile.tiktok_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors min-w-0 max-w-full">
                        <Music className="h-4 w-4" />
                        <span className="text-sm font-medium">TikTok</span>
                      </a>
                    )}
                    {selectedProfile.yt_url && (
                      <a href={selectedProfile.yt_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg border border-red-100 hover:bg-red-100 transition-colors min-w-0 max-w-full">
                        <Youtube className="h-4 w-4" />
                        <span className="text-sm font-medium">YouTube</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2 text-lg">Descripción Profesional</h3>
                <div className="p-4 bg-white border rounded-lg text-gray-700 whitespace-pre-wrap shadow-sm min-h-[100px]">
                  {selectedProfile.descripcion}
                </div>
              </div>

              {selectedProfile.comprobante_pago_url && (
                <div>
                  <h3 className="font-semibold mb-2 text-lg">Comprobante de Pago</h3>
                  <a
                    href={formatUrl(selectedProfile.comprobante_pago_url) || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  >
                    <FileText className="h-4 w-4" />
                    Ver comprobante de pago
                  </a>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2 text-lg">Documentos de Verificación ({selectedProfile.documentos?.length || 0})</h3>
                {selectedProfile.documentos && selectedProfile.documentos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[...selectedProfile.documentos]
                      .sort((a: any, b: any) => (a?.tipo === "comprobante_pago" ? -1 : 0) - (b?.tipo === "comprobante_pago" ? -1 : 0))
                      .map((doc: any, index: number) => (
                        <a
                          key={index}
                          href={formatUrl(doc.url) || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 border rounded-lg hover:bg-blue-50 transition-colors group bg-white"
                        >
                          <div className="p-2 bg-blue-100 rounded-full group-hover:bg-blue-200 text-blue-600">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="font-medium text-gray-900 truncate">{doc.tipo === "comprobante_pago" ? "Comprobante de pago" : (doc.tipo || "Documento")}</span>
                            <span className="text-xs text-gray-500">Clic para ver</span>
                          </div>
                        </a>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic p-4 border border-dashed rounded-lg bg-gray-50">
                    No hay documentos adjuntos a este perfil.
                  </p>
                )}
              </div>

              {selectedProfile.foto_url && (
                <div className="mt-2">
                  <h3 className="font-semibold mb-2 text-lg">Foto de Perfil</h3>
                  <img src={selectedProfile.foto_url} alt="Foto Perfil" className="w-32 h-32 rounded-full object-cover border-2 border-gray-200" />
                </div>
              )}

              <div className="flex flex-wrap gap-3 justify-start sm:justify-end mt-6 pt-6 border-t">
                <Button variant="outline" onClick={() => setIsProfileDetailsOpen(false)}>
                  Cerrar
                </Button>
                {isEditingProfile ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditingProfile(false)}
                      disabled={savingProfileChanges}
                    >
                      Cancelar edición
                    </Button>
                    <Button
                      onClick={handleSaveProfileChanges}
                      disabled={savingProfileChanges}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {savingProfileChanges ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                      Guardar cambios
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingProfile(true)}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                  >
                    Editar información
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => toggleDestacadoPerfil(selectedProfile.id)}
                  className={selectedProfile.is_featured
                    ? "group border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-700"
                    : "group border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-600"
                  }
                >
                  <Star
                    className={`mr-2 h-4 w-4 ${selectedProfile.is_featured ? "fill-amber-400 text-amber-400" : "fill-transparent text-gray-500 group-hover:fill-amber-400 group-hover:text-amber-400"}`}
                  />
                  {selectedProfile.is_featured ? "Quitar Destacado" : "Marcar Destacado"}
                </Button>
                {selectedProfile.estado !== "aprobado" && (
                  <Button
                    onClick={() => {
                      aprobarPerfil(selectedProfile.id)
                      setIsProfileDetailsOpen(false)
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Aprobar Perfil
                  </Button>
                )}
                {selectedProfile.estado !== "rechazado" && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      rechazarPerfil(selectedProfile.id)
                      setIsProfileDetailsOpen(false)
                    }}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Rechazar Perfil
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
