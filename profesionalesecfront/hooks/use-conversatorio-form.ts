import { useState, useCallback, useEffect } from "react"
import { ponenciasApi, catalogosApi, multimediaApi, PonenciaMaterialApoyo } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export type MaterialApoyoForm = {
  id?: number
  ponencia_ponente_id?: number
  tipo: "link" | "file"
  categoria?: string
  titulo?: string
  descripcion: string
  url: string
  mime_type?: string
  nombre_archivo?: string
  extension?: string
  tamano_bytes?: number | null
  orden: number
}

export type PonenteForm = {
  id?: number
  usuario_id?: number
  nombre_ponente: string
  profesion: string
  tema_charla: string
  foto_revista_url: string
  url_revista_personal: string
  biografia?: string
  slogan?: string
  video_url?: string
  fondo_banner?: string
  galeria_fotos?: string[]
  hora_inicio?: string
  hora_fin?: string
  es_muestra_gratis?: boolean
  materiales_apoyo: MaterialApoyoForm[]
  orden: number
}

export type PonenciaForm = {
  titulo: string
  descripcion: string
  fecha_inicio: Date
  hora_inicio: string
  fecha_fin: Date
  hora_fin: string
  precio: number
  es_gratuita: boolean
  cupo: number
  es_ilimitado: boolean
  profesion_id: number
  estado: "borrador" | "publicada" | "finalizada"
  provincia_id: number
  ciudad_id: number
  direccion: string
  latitud?: number
  longitud?: number
  imagen_banner: string
  video_url: string
  galeria_fotos: string[]
  es_destacado: boolean
  url_revista_general: string
  foto_revista_general: string
  subtitulo: string
  precio_anterior?: number
  config_visual?: Record<string, any>
  certificate_conversatorio_cost: number
  certificate_enabled: boolean
  certificate_background_url: string
  certificate_font_family: "serif" | "sans-serif"
  certificate_title: string
  certificate_body: string
  certificate_footer: string
  certificate_signer_name: string
  certificate_signer_role: string
  certificate_signature_image_url: string
  certificate_signature_p12_url: string
  certificate_signature_p12_password: string
  certificate_signature_enabled: boolean
  certificate_signature_qr_enabled: boolean
  certificate_signature_qr_size: number
  certificate_recipient_name_x: number
  certificate_recipient_name_y: number
  certificate_recipient_name_font_size: number
  certificate_recipient_name_width: number
  certificate_signer_x: number
  certificate_signer_y: number
  certificate_signer_font_size: number
  certificate_signer_width: number
  certificate_qr_enabled: boolean
  certificate_qr_size: number
  certificate_qr_x: number
  certificate_qr_y: number
  certificate_issue_date_x: number
  certificate_issue_date_y: number
  certificate_issue_date_font_size: number
  certificate_issue_date_width: number
  certificate_hours_x: number
  certificate_hours_y: number
  certificate_hours_font_size: number
  certificate_hours_width: number
  certificate_validation_base_url: string
  dias: Array<{
    id?: number
    fecha: Date
    orden: number
    titulo_dia: string
    hora_inicio: string
    hora_fin: string
    ponentes: PonenteForm[]
  }>
}

const ALLOWED_SUPPORT_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/csv",
  "text/plain",
  "application/vnd.oasis.opendocument.text",
  "application/vnd.oasis.opendocument.spreadsheet",
]

const SUPPORT_FILE_ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt,.odt,.ods"

const isValidHttpUrl = (value?: string | null) => {
  if (!value) return false
  try {
    const parsed = new URL(value)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

const isValidSupportMaterialUrl = (value?: string | null, tipo: "link" | "file" = "link") => {
  if (!value) return false
  if (tipo === "file" && value.startsWith("/")) return true
  return isValidHttpUrl(value)
}

const inferMimeTypeFromUrl = (value?: string | null) => {
  const normalized = value?.split("?")[0]?.toLowerCase() || ""
  if (normalized.endsWith(".pdf")) return "application/pdf"
  if (normalized.endsWith(".doc")) return "application/msword"
  if (normalized.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  if (normalized.endsWith(".xls")) return "application/vnd.ms-excel"
  if (normalized.endsWith(".xlsx")) return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  if (normalized.endsWith(".ppt")) return "application/vnd.ms-powerpoint"
  if (normalized.endsWith(".pptx")) return "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  if (normalized.endsWith(".csv")) return "text/csv"
  if (normalized.endsWith(".txt")) return "text/plain"
  if (normalized.endsWith(".odt")) return "application/vnd.oasis.opendocument.text"
  if (normalized.endsWith(".ods")) return "application/vnd.oasis.opendocument.spreadsheet"
  return ""
}

const inferExtensionFromUrl = (value?: string | null) => {
  const normalized = value?.split("?")[0] || ""
  const lastSegment = normalized.split(".").pop()
  return lastSegment ? lastSegment.toLowerCase() : ""
}

const buildEmptyMaterial = (index: number, tipo: "link" | "file" = "link"): MaterialApoyoForm => ({
  tipo,
  categoria: "",
  titulo: "",
  descripcion: "",
  url: "",
  mime_type: "",
  nombre_archivo: "",
  extension: "",
  tamano_bytes: null,
  orden: index,
})

const sanitizeMaterial = (material: Partial<PonenciaMaterialApoyo> | undefined, index: number): MaterialApoyoForm => {
  const tipo = material?.tipo === "file" ? "file" : "link"
  const normalizedUrl = material?.url || ""
  return {
    id: material?.id,
    ponencia_ponente_id: material?.ponencia_ponente_id,
    tipo,
    categoria: material?.categoria || "",
    titulo: material?.titulo || "",
    descripcion: material?.descripcion || "",
    url: normalizedUrl,
    mime_type: material?.mime_type || (tipo === "file" ? inferMimeTypeFromUrl(normalizedUrl) : ""),
    nombre_archivo: material?.nombre_archivo || "",
    extension: material?.extension || (tipo === "file" ? inferExtensionFromUrl(normalizedUrl) : ""),
    tamano_bytes: typeof material?.tamano_bytes === "number" ? material.tamano_bytes : null,
    orden: Number.isFinite(Number(material?.orden)) ? Number(material?.orden) : index,
  }
}

const initialForm: PonenciaForm = {
  titulo: "",
  descripcion: "",
  fecha_inicio: new Date(),
  hora_inicio: "09:00",
  fecha_fin: new Date(),
  hora_fin: "11:00",
  precio: 0,
  es_gratuita: false,
  cupo: 0,
  es_ilimitado: false,
  profesion_id: 0,
  estado: "borrador",
  provincia_id: 0,
  ciudad_id: 0,
  direccion: "",
  latitud: undefined,
  longitud: undefined,
  imagen_banner: "",
  video_url: "",
  galeria_fotos: [],
  es_destacado: false,
  url_revista_general: "",
  foto_revista_general: "",
  subtitulo: "",
  config_visual: {},
  certificate_conversatorio_cost: 0,
  certificate_enabled: true,
  certificate_background_url: "",
  certificate_font_family: "serif",
  certificate_title: "CERTIFICADO",
  certificate_body: "Se certifica que {userName} participó en el siguiente conversatorio:",
  certificate_footer: "Código: {verificationCode}",
  certificate_signer_name: "",
  certificate_signer_role: "",
  certificate_signature_image_url: "",
  certificate_signature_p12_url: "",
  certificate_signature_p12_password: "",
  certificate_signature_enabled: false,
  certificate_signature_qr_enabled: true,
  certificate_signature_qr_size: 38,
  certificate_recipient_name_x: 50,
  certificate_recipient_name_y: 46,
  certificate_recipient_name_font_size: 30,
  certificate_recipient_name_width: 70,
  certificate_signer_x: 76,
  certificate_signer_y: 80,
  certificate_signer_font_size: 16,
  certificate_signer_width: 24,
  certificate_qr_enabled: true,
  certificate_qr_size: 10,
  certificate_qr_x: 92,
  certificate_qr_y: 10,
  certificate_issue_date_x: 22,
  certificate_issue_date_y: 78,
  certificate_issue_date_font_size: 14,
  certificate_issue_date_width: 20,
  certificate_hours_x: 22,
  certificate_hours_y: 72,
  certificate_hours_font_size: 14,
  certificate_hours_width: 20,
  certificate_validation_base_url: "/certificados/validar",
  dias: [],
}

const sanitizeData = (data: Partial<PonenciaForm>): PonenciaForm => {
  const sanitized = { ...initialForm } as any
  const certificateConfig = (data as any)?.config_visual?.certificados || {}
  const certificateVisualConfig = (data as any)?.config_visual?.certificado || {}
  const recipientLayout = certificateVisualConfig?.beneficiaryName || certificateVisualConfig?.layout?.recipientName || {}
  const signerLayout = certificateVisualConfig?.signer || certificateVisualConfig?.layout?.signer || {}
  const qrConfig = certificateVisualConfig?.qr || {}
  const signerConfig = certificateVisualConfig?.signer || {}
  const issueDateConfig = certificateVisualConfig?.issueDate || {}
  const hoursConfig = certificateVisualConfig?.hours || {}
  const electronicSignatureConfig = certificateVisualConfig?.electronicSignature || {}
  const signatureQrConfig = electronicSignatureConfig?.qr || {}

  const numericOrDefault = (value: unknown, fallback: number) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }
  
  Object.keys(initialForm).forEach((key) => {
    const k = key as keyof PonenciaForm
    const val = data[k]
    
    if (k === "certificate_conversatorio_cost") {
      sanitized[k] = Number(certificateConfig?.conversatorio?.costo || 0)
    } else if (k === "certificate_enabled") {
      sanitized[k] = typeof certificateVisualConfig?.enabled === "boolean" ? certificateVisualConfig.enabled : initialForm.certificate_enabled
    } else if (k === "certificate_background_url") {
      sanitized[k] = typeof certificateVisualConfig?.backgroundUrl === "string" ? certificateVisualConfig.backgroundUrl : initialForm.certificate_background_url
    } else if (k === "certificate_font_family") {
      sanitized[k] = certificateVisualConfig?.fontFamily === "sans-serif" ? "sans-serif" : "serif"
    } else if (k === "certificate_title") {
      sanitized[k] = typeof certificateVisualConfig?.title === "string" && certificateVisualConfig.title.trim() ? certificateVisualConfig.title : initialForm.certificate_title
    } else if (k === "certificate_body") {
      sanitized[k] = typeof certificateVisualConfig?.body === "string" && certificateVisualConfig.body.trim() ? certificateVisualConfig.body : initialForm.certificate_body
    } else if (k === "certificate_footer") {
      const footerValue = typeof certificateVisualConfig?.footer === "string" && certificateVisualConfig.footer.trim() ? certificateVisualConfig.footer : initialForm.certificate_footer
      sanitized[k] = footerValue.replace(/\s*[•·\-]?\s*\{issueDate\}/gi, "").replace(/Emitido el\s*/gi, "").trim() || initialForm.certificate_footer
    } else if (k === "certificate_signer_name") {
      sanitized[k] = typeof signerConfig?.name === "string" ? signerConfig.name : initialForm.certificate_signer_name
    } else if (k === "certificate_signer_role") {
      sanitized[k] = typeof signerConfig?.title === "string" ? signerConfig.title : (typeof signerConfig?.role === "string" ? signerConfig.role : initialForm.certificate_signer_role)
    } else if (k === "certificate_signature_image_url") {
      sanitized[k] = typeof signerConfig?.signatureImageUrl === "string" ? signerConfig.signatureImageUrl : initialForm.certificate_signature_image_url
    } else if (k === "certificate_signature_p12_url") {
      sanitized[k] = typeof electronicSignatureConfig?.p12FileUrl === "string" ? electronicSignatureConfig.p12FileUrl : (typeof electronicSignatureConfig?.p12Url === "string" ? electronicSignatureConfig.p12Url : initialForm.certificate_signature_p12_url)
    } else if (k === "certificate_signature_p12_password") {
      sanitized[k] = typeof electronicSignatureConfig?.p12Password === "string" ? electronicSignatureConfig.p12Password : initialForm.certificate_signature_p12_password
    } else if (k === "certificate_signature_enabled") {
      sanitized[k] = typeof electronicSignatureConfig?.enabled === "boolean" ? electronicSignatureConfig.enabled : initialForm.certificate_signature_enabled
    } else if (k === "certificate_signature_qr_enabled") {
      sanitized[k] = typeof signatureQrConfig?.enabled === "boolean" ? signatureQrConfig.enabled : initialForm.certificate_signature_qr_enabled
    } else if (k === "certificate_signature_qr_size") {
      sanitized[k] = numericOrDefault(signatureQrConfig?.size, initialForm.certificate_signature_qr_size)
    } else if (k === "certificate_recipient_name_x") {
      sanitized[k] = numericOrDefault(recipientLayout?.x, initialForm.certificate_recipient_name_x)
    } else if (k === "certificate_recipient_name_y") {
      sanitized[k] = numericOrDefault(recipientLayout?.y, initialForm.certificate_recipient_name_y)
    } else if (k === "certificate_recipient_name_font_size") {
      sanitized[k] = numericOrDefault(recipientLayout?.fontSize, initialForm.certificate_recipient_name_font_size)
    } else if (k === "certificate_recipient_name_width") {
      sanitized[k] = numericOrDefault(recipientLayout?.width, initialForm.certificate_recipient_name_width)
    } else if (k === "certificate_signer_x") {
      sanitized[k] = numericOrDefault(signerLayout?.x, initialForm.certificate_signer_x)
    } else if (k === "certificate_signer_y") {
      sanitized[k] = numericOrDefault(signerLayout?.y, initialForm.certificate_signer_y)
    } else if (k === "certificate_signer_font_size") {
      sanitized[k] = numericOrDefault(signerLayout?.fontSize, initialForm.certificate_signer_font_size)
    } else if (k === "certificate_signer_width") {
      sanitized[k] = numericOrDefault(signerLayout?.width, initialForm.certificate_signer_width)
    } else if (k === "certificate_qr_enabled") {
      sanitized[k] = typeof qrConfig?.enabled === "boolean" ? qrConfig.enabled : initialForm.certificate_qr_enabled
    } else if (k === "certificate_qr_size") {
      sanitized[k] = numericOrDefault(qrConfig?.size, initialForm.certificate_qr_size)
    } else if (k === "certificate_qr_x") {
      sanitized[k] = numericOrDefault(qrConfig?.x, initialForm.certificate_qr_x)
    } else if (k === "certificate_qr_y") {
      sanitized[k] = numericOrDefault(qrConfig?.y, initialForm.certificate_qr_y)
    } else if (k === "certificate_issue_date_x") {
      sanitized[k] = numericOrDefault(issueDateConfig?.x, initialForm.certificate_issue_date_x)
    } else if (k === "certificate_issue_date_y") {
      sanitized[k] = numericOrDefault(issueDateConfig?.y, initialForm.certificate_issue_date_y)
    } else if (k === "certificate_issue_date_font_size") {
      sanitized[k] = numericOrDefault(issueDateConfig?.fontSize, initialForm.certificate_issue_date_font_size)
    } else if (k === "certificate_issue_date_width") {
      sanitized[k] = numericOrDefault(issueDateConfig?.width, initialForm.certificate_issue_date_width)
    } else if (k === "certificate_hours_x") {
      sanitized[k] = numericOrDefault(hoursConfig?.x, initialForm.certificate_hours_x)
    } else if (k === "certificate_hours_y") {
      sanitized[k] = numericOrDefault(hoursConfig?.y, initialForm.certificate_hours_y)
    } else if (k === "certificate_hours_font_size") {
      sanitized[k] = numericOrDefault(hoursConfig?.fontSize, initialForm.certificate_hours_font_size)
    } else if (k === "certificate_hours_width") {
      sanitized[k] = numericOrDefault(hoursConfig?.width, initialForm.certificate_hours_width)
    } else if (k === "certificate_validation_base_url") {
      sanitized[k] = initialForm.certificate_validation_base_url
    } else if (k === "dias" && Array.isArray(val)) {
      sanitized[k] = val.map((dia: any) => ({
        ...dia,
        fecha: dia.fecha ? new Date(dia.fecha) : new Date(),
        titulo_dia: dia.titulo_dia || "",
        hora_inicio: dia.hora_inicio || "09:00",
        hora_fin: dia.hora_fin || "18:00",
        ponentes: Array.isArray(dia.ponentes) ? dia.ponentes.map((p: any) => ({
          ...p,
          nombre_ponente: p.nombre_ponente || "",
          profesion: p.profesion || "",
          tema_charla: p.tema_charla || "",
          foto_revista_url: p.foto_revista_url || "",
          url_revista_personal: p.url_revista_personal || "",
          biografia: p.biografia || "",
          slogan: p.slogan || "",
          video_url: p.video_url || "",
          fondo_banner: p.fondo_banner || "",
          galeria_fotos: Array.isArray(p.galeria_fotos) ? p.galeria_fotos : [],
          hora_inicio: p.hora_inicio || "09:00",
          hora_fin: p.hora_fin || "10:00",
          es_muestra_gratis: !!p.es_muestra_gratis,
          materiales_apoyo: Array.isArray(p.materiales_apoyo)
            ? p.materiales_apoyo.map((material: Partial<PonenciaMaterialApoyo>, index: number) => sanitizeMaterial(material, index))
            : [],
        })) : []
      }))
    } else if (k === "fecha_inicio" || k === "fecha_fin") {
      sanitized[k] = (val && (typeof val === "string" || typeof val === "number" || val instanceof Date)) ? new Date(val as any) : new Date()
    } else if (Array.isArray(initialForm[k])) {
      sanitized[k] = Array.isArray(val) ? val : []
    } else if (typeof initialForm[k] === "number") {
      sanitized[k] = Number(val || 0)
    } else if (typeof initialForm[k] === "string") {
      sanitized[k] = val || ""
    } else if (typeof initialForm[k] === "boolean") {
      sanitized[k] = !!val
    } else {
      sanitized[k] = val !== null ? val : initialForm[k]
    }
  })
  
  return sanitized
}

type UseConversatorioFormOptions = {
  routePrefix?: string
  uploadFolder?: string
  redirectPath?: string
  resourceLabel?: string
}

export function useConversatorioForm(initialData?: Partial<PonenciaForm>, options: UseConversatorioFormOptions = {}) {
  const { toast } = useToast()
  const router = useRouter()
  const { routePrefix = "/conversatorios", uploadFolder = "conversatorios", redirectPath = "/admin/conversatorios", resourceLabel = "conversatorio" } = options
  const requiresGeolocation = routePrefix !== "/cursos"

  const precioNum = Number(initialData?.precio ?? -1)
  const cupoNum = Number(initialData?.cupo ?? -1)
  const dataWithSwitches = {
    ...initialData,
    es_gratuita: precioNum === 0 ? true : (initialData?.es_gratuita ?? false),
    es_ilimitado: cupoNum === 0 ? true : (initialData?.es_ilimitado ?? false),
  }

  const [formData, setFormData] = useState<PonenciaForm>(sanitizeData(dataWithSwitches || {}))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [ciudades, setCiudades] = useState<any[]>([])

  useEffect(() => {
    setFormData(sanitizeData(dataWithSwitches || {}))
  }, [initialData])

  // Cargar ciudades automáticamente cuando hay una provincia seleccionada (para modo edición)
  useEffect(() => {
    const loadCiudades = async () => {
      if (formData.provincia_id && formData.provincia_id > 0) {
        try {
          const res = await catalogosApi.obtenerCiudades(formData.provincia_id)
          const filtered = Array.isArray(res) ? res.filter((c: any) => c.provincia_id === formData.provincia_id || (c.provincia && c.provincia.id === formData.provincia_id)) : []
          setCiudades(filtered)
        } catch (error) {
          console.error("Error loading cities:", error)
        }
      }
    }
    loadCiudades()
  }, [formData.provincia_id])

  const syncItineraryWithDates = useCallback((inicio: Date, fin: Date) => {
    setFormData(prev => {
      const dates: Date[] = []
      let current = new Date(inicio)
      const end = new Date(fin)
      
      // Safety cap (max 30 days) to prevent infinite loops or memory issues
      let count = 0
      while (current <= end && count < 30) {
        dates.push(new Date(current))
        current.setDate(current.getDate() + 1)
        count++
      }

      const newDias = dates.map((date, index) => {
        const dateStr = date.toISOString().split('T')[0]
        // Buscar si ya existe este día en el itinerario actual
        const existingDay = prev.dias.find(d => {
          const dDate = d.fecha instanceof Date ? d.fecha.toISOString().split('T')[0] : d.fecha
          return dDate === dateStr
        })

        if (existingDay) {
          return { ...existingDay, orden: index }
        }

        // Si no existe, crear día nuevo con valores por defecto
        return {
          fecha: date,
          orden: index,
          titulo_dia: `Día ${index + 1}`,
          hora_inicio: "09:00",
          hora_fin: "18:00",
          ponentes: []
        }
      })

      return { ...prev, dias: newDias }
    })
  }, [])

  const updateField = useCallback((field: keyof PonenciaForm, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      
      // Si cambia la fecha de inicio o fin, sincronizamos el itinerario automáticamente
      if (field === "fecha_inicio" || field === "fecha_fin") {
        setTimeout(() => {
          syncItineraryWithDates(updated.fecha_inicio, updated.fecha_fin)
        }, 0)
      }
      
      return updated
    })
  }, [syncItineraryWithDates])

  const handleLocationChange = useCallback((lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, latitud: lat, longitud: lng }))
  }, [])

  const handleProvinciaChange = async (provinciaId: string) => {
    const id = Number(provinciaId)
    updateField("provincia_id", id)
    updateField("ciudad_id", 0)
    setCiudades([])
    if (id) {
      try {
        const res = await catalogosApi.obtenerCiudades(id)
        const filtered = Array.isArray(res) ? res.filter((c: any) => c.provincia_id === id || (c.provincia && c.provincia.id === id)) : []
        setCiudades(filtered)
      } catch (error) {
        console.error("Error loading cities:", error)
      }
    }
  }

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field:
      | "imagen_banner"
      | "galeria_fotos"
      | "foto_revista_general"
      | "url_revista_general"
      | "certificate_background_url"
      | "certificate_signature_image_url"
      | "certificate_signature_p12_url"
      | {
          type: "ponente_foto" | "ponente_fondo" | "ponente_revista" | "ponente_galeria" | "ponente_material"
          diaIndex: number
          ponenteIndex: number
          materialIndex?: number
        }
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const token = localStorage.getItem("auth_token") || ""
      const targetFolder = field === "certificate_background_url"
        ? "profesionales/certificados/backgrounds"
        : field === "certificate_signature_image_url"
          ? "profesionales/certificados/firmas-visuales"
          : field === "certificate_signature_p12_url"
            ? "profesionales/certificados/firmas-electronicas"
            : uploadFolder
      const res = await multimediaApi.subir(file, targetFolder, token)
      
      if (typeof field === "string") {
        if (field === "imagen_banner") {
          updateField("imagen_banner", res.url)
          toast({ title: "Éxito", description: "Imagen de banner subida correctamente." })
        } else if (field === "foto_revista_general") {
          updateField("foto_revista_general", res.url)
          toast({ title: "Éxito", description: "Portada de revista subida." })
        } else if (field === "url_revista_general") {
          updateField("url_revista_general", res.url)
          toast({ title: "Éxito", description: "Archivo de revista subido correctamente." })
        } else if (field === "certificate_background_url") {
          updateField("certificate_background_url", res.url)
          toast({ title: "Éxito", description: "Fondo del certificado subido correctamente." })
        } else if (field === "certificate_signature_image_url") {
          updateField("certificate_signature_image_url", res.url)
          toast({ title: "Éxito", description: "Firma visual del certificado subida correctamente." })
        } else if (field === "certificate_signature_p12_url") {
          updateField("certificate_signature_p12_url", res.url)
          toast({ title: "Éxito", description: "Archivo .p12 subido correctamente." })
        } else {
          const currentGaleria = Array.isArray(formData.galeria_fotos) ? formData.galeria_fotos : []
          updateField("galeria_fotos", [...currentGaleria, res.url])
          toast({ title: "Éxito", description: "Imagen añadida a la galería." })
        }
      } else if (field.type === "ponente_foto" || field.type === "ponente_fondo" || field.type === "ponente_revista" || field.type === "ponente_galeria" || field.type === "ponente_material") {
        const newDias = [...formData.dias]
        if (field.type === "ponente_foto") {
          newDias[field.diaIndex].ponentes[field.ponenteIndex].foto_revista_url = res.url
          toast({ title: "Éxito", description: "Foto del ponente subida." })
        } else if (field.type === "ponente_fondo") {
          newDias[field.diaIndex].ponentes[field.ponenteIndex].fondo_banner = res.url
          toast({ title: "Éxito", description: "Fondo del banner del ponente subido." })
        } else if (field.type === "ponente_revista") {
          newDias[field.diaIndex].ponentes[field.ponenteIndex].url_revista_personal = res.url
          toast({ title: "Éxito", description: "Archivo de revista/perfil subido." })
        } else if (field.type === "ponente_galeria") {
          const currentGaleria = Array.isArray(newDias[field.diaIndex].ponentes[field.ponenteIndex].galeria_fotos) 
            ? (newDias[field.diaIndex].ponentes[field.ponenteIndex].galeria_fotos as string[]) 
            : []
          newDias[field.diaIndex].ponentes[field.ponenteIndex].galeria_fotos = [...currentGaleria, res.url]
          toast({ title: "Éxito", description: "Imagen añadida a la galería del ponente." })
        } else if (typeof field.materialIndex === "number") {
          const materiales = Array.isArray(newDias[field.diaIndex].ponentes[field.ponenteIndex].materiales_apoyo)
            ? [...newDias[field.diaIndex].ponentes[field.ponenteIndex].materiales_apoyo]
            : []
          const existingMaterial = materiales[field.materialIndex] || buildEmptyMaterial(field.materialIndex, "file")
          materiales[field.materialIndex] = {
            ...existingMaterial,
            tipo: "file",
            url: res.url,
            mime_type: file.type || existingMaterial.mime_type || inferMimeTypeFromUrl(res.url) || "",
            nombre_archivo: file.name || existingMaterial.nombre_archivo || "",
            extension: file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() || "" : inferExtensionFromUrl(res.url),
            tamano_bytes: file.size,
          }
          newDias[field.diaIndex].ponentes[field.ponenteIndex].materiales_apoyo = materiales
          toast({ title: "Éxito", description: "Material de apoyo subido correctamente." })
        }
        updateField("dias", newDias)
      }
    } catch (error: any) {
      toast({ title: "Error", description: "Error al subir archivo: " + error.message, variant: "destructive" })
    } finally {
      setIsUploading(false)
      e.target.value = ""
    }
  }

  // --- Helper methods for nested data ---
  const addDay = () => {
    const newDay = {
      fecha: new Date(),
      orden: formData.dias.length,
      titulo_dia: `Día ${formData.dias.length + 1}`,
      hora_inicio: "09:00",
      hora_fin: "18:00",
      ponentes: []
    }
    updateField("dias", [...formData.dias, newDay])
  }

  const removeDay = (index: number) => {
    const newDias = formData.dias.filter((_, i: number) => i !== index)
    updateField("dias", newDias)
  }

  const updateDay = (index: number, field: string, value: any) => {
    const newDias = [...formData.dias]
    newDias[index] = { ...newDias[index], [field]: value }
    updateField("dias", newDias)
  }

  const addSpeaker = (diaIndex: number) => {
    const newSpeaker = {
      nombre_ponente: "",
      profesion: "",
      tema_charla: "",
      foto_revista_url: "",
      url_revista_personal: "",
      biografia: "",
      slogan: "",
      video_url: "",
      fondo_banner: "",
      galeria_fotos: [],
      hora_inicio: "09:00",
      hora_fin: "10:00",
      es_muestra_gratis: false,
      materiales_apoyo: [],
      orden: formData.dias[diaIndex].ponentes.length
    }
    const newDias = [...formData.dias]
    newDias[diaIndex].ponentes.push(newSpeaker)
    updateField("dias", newDias)
  }

  const removeSpeaker = (diaIndex: number, ponenteIndex: number) => {
    const newDias = [...formData.dias]
    newDias[diaIndex].ponentes = newDias[diaIndex].ponentes.filter((_, i: number) => i !== ponenteIndex)
    updateField("dias", newDias)
  }

  const updateSpeaker = (diaIndex: number, ponenteIndex: number, field: string, value: any) => {
    const newDias = [...formData.dias]
    newDias[diaIndex].ponentes[ponenteIndex] = { ...newDias[diaIndex].ponentes[ponenteIndex], [field]: value }
    updateField("dias", newDias)
  }

  const addSupportMaterial = (diaIndex: number, ponenteIndex: number, tipo: "link" | "file" = "link") => {
    const newDias = [...formData.dias]
    const ponente = newDias[diaIndex].ponentes[ponenteIndex]
    const materiales = Array.isArray(ponente.materiales_apoyo) ? [...ponente.materiales_apoyo] : []
    materiales.push(buildEmptyMaterial(materiales.length, tipo))
    ponente.materiales_apoyo = materiales
    updateField("dias", newDias)
  }

  const updateSupportMaterial = (
    diaIndex: number,
    ponenteIndex: number,
    materialIndex: number,
    field: keyof MaterialApoyoForm,
    value: any,
  ) => {
    const newDias = [...formData.dias]
    const ponente = newDias[diaIndex].ponentes[ponenteIndex]
    const materiales = Array.isArray(ponente.materiales_apoyo) ? [...ponente.materiales_apoyo] : []
    const currentMaterial = materiales[materialIndex] || buildEmptyMaterial(materialIndex)
    const nextMaterial: MaterialApoyoForm = { ...currentMaterial, [field]: value }

    if (field === "tipo") {
      nextMaterial.tipo = value === "file" ? "file" : "link"
      if (nextMaterial.tipo === "link") {
        nextMaterial.mime_type = ""
        nextMaterial.nombre_archivo = ""
        nextMaterial.extension = ""
        nextMaterial.tamano_bytes = null
      } else {
      }
    }

    if (field === "url" && nextMaterial.tipo === "file") {
      nextMaterial.mime_type = inferMimeTypeFromUrl(value) || nextMaterial.mime_type || ""
      nextMaterial.extension = inferExtensionFromUrl(value) || nextMaterial.extension || ""
    }

    materiales[materialIndex] = { ...nextMaterial, orden: materialIndex }
    ponente.materiales_apoyo = materiales
    updateField("dias", newDias)
  }

  const removeSupportMaterial = (diaIndex: number, ponenteIndex: number, materialIndex: number) => {
    const newDias = [...formData.dias]
    const ponente = newDias[diaIndex].ponentes[ponenteIndex]
    const materiales = Array.isArray(ponente.materiales_apoyo) ? ponente.materiales_apoyo.filter((_, index) => index !== materialIndex) : []
    ponente.materiales_apoyo = materiales.map((material, index) => ({ ...material, orden: index }))
    updateField("dias", newDias)
  }

  const save = async (id?: number) => {
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) throw new Error("No hay token de autenticación")

      // Validaciones básicas
      if (!formData.titulo.trim()) throw new Error(`El título del ${resourceLabel} es obligatorio`)
      if (!formData.descripcion.trim()) throw new Error(`La descripción del ${resourceLabel} es obligatoria`)

      // Validar que cada ponente tenga nombre o usuario vinculado
      formData.dias.forEach((dia, dIdx) => {
        dia.ponentes.forEach((ponente, pIdx) => {
          if (!ponente.nombre_ponente?.trim() && !ponente.usuario_id) {
            throw new Error(`El ponente ${pIdx + 1} del Día ${dIdx + 1} debe tener un nombre o un usuario vinculado.`)
          }

          if (!formData.es_gratuita && ponente.es_muestra_gratis && (!ponente.tema_charla?.trim() && !ponente.nombre_ponente?.trim())) {
            throw new Error(`La muestra gratis del ponente ${pIdx + 1} del Día ${dIdx + 1} debe identificar al menos el tema o nombre de la lección.`)
          }

          const materiales = Array.isArray(ponente.materiales_apoyo) ? ponente.materiales_apoyo : []
          materiales.forEach((material, mIdx) => {
            if (material.tipo !== "link" && material.tipo !== "file") {
              throw new Error(`El material ${mIdx + 1} del ponente ${pIdx + 1} del Día ${dIdx + 1} tiene un tipo inválido.`)
            }

            if (!isValidSupportMaterialUrl(material.url, material.tipo)) {
              throw new Error(`El material ${mIdx + 1} del ponente ${pIdx + 1} del Día ${dIdx + 1} debe tener una URL válida.`)
            }

            if (material.tipo === "file") {
              const mimeType = material.mime_type || inferMimeTypeFromUrl(material.url)
              if (mimeType && !ALLOWED_SUPPORT_FILE_TYPES.includes(mimeType)) {
                throw new Error(`El archivo del material ${mIdx + 1} del ponente ${pIdx + 1} del Día ${dIdx + 1} no tiene un formato soportado.`)
              }
            }
          })
        })
      })

      // Validaciones de negocio
      if (!formData.es_gratuita && formData.precio <= 0) throw new Error("La inversión debe ser mayor a cero")
      if (!formData.es_ilimitado && formData.cupo <= 0) throw new Error("El cupo debe ser mayor a cero")
      if (requiresGeolocation && (!formData.latitud || !formData.longitud)) throw new Error("Debes ubicar el evento en el mapa")

      const mergedConfigVisual = {
        ...(formData.config_visual || {}),
        certificados: {
          ...((formData.config_visual || {})?.certificados || {}),
          conversatorio: { costo: Number(formData.precio || 0) },
        },
        certificado: {
          enabled: !!formData.certificate_enabled,
          backgroundUrl: formData.certificate_background_url?.trim() || "",
          fontFamily: formData.certificate_font_family === "sans-serif" ? "sans-serif" : "serif",
          title: formData.certificate_title?.trim() || initialForm.certificate_title,
          body: formData.certificate_body?.trim() || initialForm.certificate_body,
          footer: formData.certificate_footer?.trim() || initialForm.certificate_footer,
          validationBaseUrl: "/certificados/validar",
          layout: {
            recipientName: {
              x: Number(formData.certificate_recipient_name_x || initialForm.certificate_recipient_name_x),
              y: Number(formData.certificate_recipient_name_y || initialForm.certificate_recipient_name_y),
              fontSize: Number(formData.certificate_recipient_name_font_size || initialForm.certificate_recipient_name_font_size),
              width: Number(formData.certificate_recipient_name_width || initialForm.certificate_recipient_name_width),
            },
            signer: {
              x: Number(formData.certificate_signer_x || initialForm.certificate_signer_x),
              y: Number(formData.certificate_signer_y || initialForm.certificate_signer_y),
              fontSize: Number(formData.certificate_signer_font_size || initialForm.certificate_signer_font_size),
              width: Number(formData.certificate_signer_width || initialForm.certificate_signer_width),
            },
          },
          signer: {
            name: formData.certificate_signer_name?.trim() || "",
            role: formData.certificate_signer_role?.trim() || "",
            signatureImageUrl: formData.certificate_signature_image_url?.trim() || "",
          },
          electronicSignature: {
            enabled: !!formData.certificate_signature_enabled,
            p12Url: formData.certificate_signature_p12_url?.trim() || "",
            p12Password: formData.certificate_signature_p12_password || "",
            qr: {
              enabled: !!formData.certificate_signature_qr_enabled,
              size: Number(formData.certificate_signature_qr_size || initialForm.certificate_signature_qr_size),
            },
          },
          qr: {
            enabled: !!formData.certificate_qr_enabled,
            x: Number(formData.certificate_qr_x || initialForm.certificate_qr_x),
            y: Number(formData.certificate_qr_y || initialForm.certificate_qr_y),
            size: Number(formData.certificate_qr_size || initialForm.certificate_qr_size),
          },
          issueDate: {
            enabled: true,
            x: Number(formData.certificate_issue_date_x || initialForm.certificate_issue_date_x),
            y: Number(formData.certificate_issue_date_y || initialForm.certificate_issue_date_y),
            fontSize: Number(formData.certificate_issue_date_font_size || initialForm.certificate_issue_date_font_size),
            width: Number(formData.certificate_issue_date_width || initialForm.certificate_issue_date_width),
          },
          hours: {
            enabled: true,
            x: Number(formData.certificate_hours_x || initialForm.certificate_hours_x),
            y: Number(formData.certificate_hours_y || initialForm.certificate_hours_y),
            fontSize: Number(formData.certificate_hours_font_size || initialForm.certificate_hours_font_size),
            width: Number(formData.certificate_hours_width || initialForm.certificate_hours_width),
          },
        },
      }

      const dataToSave = {
        ...formData,
        config_visual: mergedConfigVisual,
        fecha_inicio: formData.fecha_inicio.toISOString().split('T')[0],
        fecha_fin: formData.fecha_fin.toISOString().split('T')[0],
        galeria_fotos: formData.galeria_fotos,
        dias: formData.dias.map((d: any) => ({
          ...d,
          fecha: d.fecha instanceof Date ? d.fecha.toISOString().split('T')[0] : d.fecha,
          ponentes: Array.isArray(d.ponentes)
            ? d.ponentes.map((ponente: PonenteForm, ponenteIndex: number) => ({
                ...ponente,
                es_muestra_gratis: !formData.es_gratuita && !!ponente.es_muestra_gratis,
                materiales_apoyo: Array.isArray(ponente.materiales_apoyo)
                  ? ponente.materiales_apoyo.map((material: MaterialApoyoForm, materialIndex: number) => ({
                      id: material.id,
                      ponencia_ponente_id: material.ponencia_ponente_id,
                      tipo: material.tipo,
                      categoria: material.categoria?.trim() || undefined,
                      titulo: material.titulo?.trim() || undefined,
                      descripcion: material.descripcion?.trim() || "",
                      url: material.url.trim(),
                      mime_type: material.tipo === "file"
                        ? (material.mime_type || inferMimeTypeFromUrl(material.url) || undefined)
                        : undefined,
                      nombre_archivo: material.tipo === "file"
                        ? (material.nombre_archivo?.trim() || material.url.split("/").pop()?.split("?")[0] || "")
                        : "",
                      extension: material.tipo === "file"
                        ? (material.extension?.trim() || inferExtensionFromUrl(material.url) || undefined)
                        : undefined,
                      tamano_bytes: material.tipo === "file" && typeof material.tamano_bytes === "number"
                        ? material.tamano_bytes
                        : null,
                      orden: Number.isFinite(Number(material.orden)) ? Number(material.orden) : materialIndex,
                    }))
                  : [],
                orden: Number.isFinite(Number(ponente.orden)) ? Number(ponente.orden) : ponenteIndex,
              }))
            : [],
        }))
      } as any

      if (requiresGeolocation) {
        dataToSave.provincia_id = formData.provincia_id > 0 ? formData.provincia_id : null
        dataToSave.ciudad_id = formData.ciudad_id > 0 ? formData.ciudad_id : null
      } else {
        dataToSave.provincia_id = null
        dataToSave.ciudad_id = null
        dataToSave.direccion = null
        dataToSave.latitud = null
        dataToSave.longitud = null
      }

      delete dataToSave.certificate_conversatorio_cost
      delete dataToSave.certificate_ponencia_cost
      delete dataToSave.certificate_enabled
      delete dataToSave.certificate_background_url
      delete dataToSave.certificate_font_family
      delete dataToSave.certificate_title
      delete dataToSave.certificate_body
      delete dataToSave.certificate_footer
      delete dataToSave.certificate_signer_name
      delete dataToSave.certificate_signer_role
      delete dataToSave.certificate_signature_image_url
      delete dataToSave.certificate_signature_p12_url
      delete dataToSave.certificate_signature_p12_password
      delete dataToSave.certificate_signature_enabled
      delete dataToSave.certificate_recipient_name_x
      delete dataToSave.certificate_recipient_name_y
      delete dataToSave.certificate_recipient_name_font_size
      delete dataToSave.certificate_recipient_name_width
      delete dataToSave.certificate_signer_x
      delete dataToSave.certificate_signer_y
      delete dataToSave.certificate_signer_font_size
      delete dataToSave.certificate_signer_width
      delete dataToSave.certificate_qr_enabled
      delete dataToSave.certificate_qr_size
      delete dataToSave.certificate_qr_x
      delete dataToSave.certificate_qr_y
      delete dataToSave.certificate_signature_qr_enabled
      delete dataToSave.certificate_signature_qr_size
      delete dataToSave.certificate_issue_date_x
      delete dataToSave.certificate_issue_date_y
      delete dataToSave.certificate_issue_date_font_size
      delete dataToSave.certificate_issue_date_width
      delete dataToSave.certificate_hours_x
      delete dataToSave.certificate_hours_y
      delete dataToSave.certificate_hours_font_size
      delete dataToSave.certificate_hours_width
      delete dataToSave.certificate_validation_base_url

      if (id) {
        await ponenciasApi.actualizar(id, dataToSave, token, routePrefix)
        toast({ title: "Actualizado", description: `El ${resourceLabel} se ha actualizado con éxito.` })
      } else {
        await ponenciasApi.crear(dataToSave, token, routePrefix)
        toast({ title: "Creado", description: `El ${resourceLabel} se ha creado con éxito.` })
      }
      router.push(redirectPath)
      router.refresh()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || `Error al guardar el ${resourceLabel}`, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    formData,
    setFormData,
    updateField,
    handleLocationChange,
    handleProvinciaChange,
    handleFileUpload,
    save,
    isSubmitting,
    isUploading,
    ciudades,
    setCiudades,
    addDay,
    removeDay,
    updateDay,
    addSpeaker,
    removeSpeaker,
    updateSpeaker,
    addSupportMaterial,
    updateSupportMaterial,
    removeSupportMaterial,
    supportFileAccept: SUPPORT_FILE_ACCEPT,
  }
}
