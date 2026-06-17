"use client"

import React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { 
  CalendarIcon, 
  Users, 
  Clock, 
  DollarSign, 
  Globe, 
  MapPin, 
  Loader2, 
  Upload,
  CheckCircle2,
  FileText,
  Plus,
  Trash2,
  Image,
  BookOpen,
  Layout,
  Infinity
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import dynamic from "next/dynamic"
import { useConversatorioForm, PonenciaForm } from "@/hooks/use-conversatorio-form"

const LocationMap = dynamic(() => import("@/components/shared/location-map"), { ssr: false })

interface ConversatorioFormProps {
  initialData?: Partial<PonenciaForm>
  id?: number
  provincias: any[]
  profesiones: any[]
  routePrefix?: string
  uploadFolder?: string
  redirectPath?: string
  resourceLabel?: string
  resourceLabelPlural?: string
}

export default function ConversatorioForm({ initialData, id, provincias, profesiones, routePrefix = "/conversatorios", uploadFolder = "conversatorios", redirectPath = "/admin/conversatorios", resourceLabel = "Conversatorio", resourceLabelPlural = "Conversatorios" }: ConversatorioFormProps) {
  const requiresGeolocation = routePrefix !== "/cursos"

  const {
    formData,
    updateField,
    handleLocationChange,
    handleProvinciaChange,
    handleFileUpload,
    save,
    isSubmitting,
    isUploading,
    ciudades,
    addDay,
    removeDay,
    updateDay,
    addSpeaker,
    removeSpeaker,
    updateSpeaker,
    addSupportMaterial,
    updateSupportMaterial,
    removeSupportMaterial,
    supportFileAccept,
  } = useConversatorioForm(initialData, { routePrefix, uploadFolder, redirectPath, resourceLabel: resourceLabel.toLowerCase() })

  const certificateFontPreview = formData.certificate_font_family === "sans-serif" ? "ui-sans-serif, system-ui, sans-serif" : "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif"
  const certificateVariables = ["{userName}", "{eventTitle}", "{eventDate}", "{issueDate}", "{totalHours}", "{verificationCode}"]

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-0 overflow-hidden rounded-[3rem] bg-white border border-slate-100 shadow-2xl">
        {/* COLUMNA PRINCIPAL DE DATOS (7/12) */}
        <div className="xl:col-span-7 p-8 lg:p-12 space-y-12">
          {/* SECCIÓN 1: IDENTIDAD DEL EVENTO */}
          <section className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-900/20">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Identidad del Evento</h3>
                  <p className="text-slate-500 text-sm">Información fundamental y narrativa</p>
                </div>
              </div>

              <div className="space-y-2 min-w-[200px]">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Estado del {resourceLabel}</Label>
                <Select 
                  value={formData.estado} 
                  onValueChange={(val: any) => updateField("estado", val)}
                >
                  <SelectTrigger className={`h-11 border-none font-bold rounded-xl shadow-sm ${
                    formData.estado === "publicada" ? "bg-emerald-50 text-emerald-600" : 
                    formData.estado === "borrador" ? "bg-amber-50 text-amber-600" : 
                    "bg-slate-50 text-slate-600"
                  }`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-100 rounded-xl shadow-2xl">
                    <SelectItem value="borrador">Borrador</SelectItem>
                    <SelectItem value="publicada">Publicada</SelectItem>
                    <SelectItem value="finalizada">Finalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="subtitulo" className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Slogan o Profesión Destacada</Label>
                <Input 
                  id="subtitulo" 
                  placeholder="Ej: Odontología Moderna y Estética" 
                  value={formData.subtitulo || ""} 
                  onChange={(e) => updateField("subtitulo", e.target.value)}
                  className="h-14 bg-slate-50 border-none text-lg font-bold text-slate-900 rounded-2xl focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-300"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="titulo" className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Título del {resourceLabel}</Label>
                  <Input 
                    id="titulo" 
                    placeholder="Ej: Innovación en Inteligencia Artificial" 
                    value={formData.titulo || ""} 
                    onChange={(e) => updateField("titulo", e.target.value)}
                    className="h-14 bg-slate-50 border-none text-lg font-bold text-slate-900 rounded-2xl focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profesion" className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Área Profesional</Label>
                  <Select 
                    value={formData.profesion_id ? formData.profesion_id.toString() : ""} 
                    onValueChange={(val) => updateField("profesion_id", Number(val))}
                  >
                    <SelectTrigger className="h-14 bg-slate-50 border-none text-lg font-bold text-slate-900 rounded-2xl focus:ring-2 focus:ring-blue-600">
                      <SelectValue placeholder="Seleccionar área..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-100 rounded-2xl shadow-2xl">
                      {profesiones.map((prof: any) => (
                        <SelectItem key={prof.id} value={prof.id.toString()}>{prof.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion" className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Descripción y Objetivos</Label>
                <Textarea 
                  id="descripcion" 
                  placeholder="Describe de qué trata el evento, qué aprenderán los asistentes..." 
                  value={formData.descripcion || ""} 
                  onChange={(e) => updateField("descripcion", e.target.value)}
                  className="min-h-[180px] bg-slate-50 border-none text-lg rounded-3xl p-6 focus:ring-2 focus:ring-blue-600 transition-all leading-relaxed placeholder:text-slate-300"
                />
              </div>
            </div>
          </section>
        </div>

        {/* COLUMNA LATERAL DE LOGÍSTICA (5/12) */}
        <div className="xl:col-span-5 bg-slate-50/30 p-8 lg:p-10 space-y-8">
          {/* SECCIÓN 2: LOGÍSTICA Y COSTOS */}
          <section className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700 delay-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-600/10 rounded-2xl">
                <Clock className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Logística</h3>
                <p className="text-slate-500 text-sm">Cronograma y disponibilidad</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white p-2 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                <div className="flex-1 p-6 space-y-4">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-blue-500" /> Fecha Inicio
                  </Label>
                  <div className="space-y-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" className="h-auto p-0 text-xl font-black text-slate-800 hover:bg-transparent justify-start w-full text-left">
                          {formData.fecha_inicio ? format(new Date(formData.fecha_inicio), "EEE, dd MMM", { locale: es }) : "Elegir fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white border-slate-100 rounded-3xl shadow-2xl">
                        <Calendar mode="single" selected={new Date(formData.fecha_inicio)} onSelect={(date) => date && updateField("fecha_inicio", date)} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="flex-1 p-6 space-y-4">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-orange-500" /> Fecha Fin
                  </Label>
                  <div className="space-y-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" className="h-auto p-0 text-xl font-black text-slate-800 hover:bg-transparent justify-start w-full text-left">
                          {formData.fecha_fin ? format(new Date(formData.fecha_fin), "EEE, dd MMM", { locale: es }) : "Elegir fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white border-slate-100 rounded-3xl shadow-2xl">
                        <Calendar mode="single" selected={new Date(formData.fecha_fin)} onSelect={(date) => date && updateField("fecha_fin", date)} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* NUEVO: Horario General */}
              <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-around gap-4">
                <div className="space-y-2 flex-1">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 pl-1">
                    <Clock className="h-3 w-3 text-blue-500" /> Hora Inicio Gral.
                  </Label>
                  <Input 
                    type="time" 
                    value={formData.hora_inicio || "09:00"} 
                    onChange={(e) => updateField("hora_inicio", e.target.value)}
                    className="h-11 bg-slate-50 border-none font-bold text-center rounded-xl focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div className="w-px h-12 bg-slate-100" />
                <div className="space-y-2 flex-1">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 pl-1">
                    <Clock className="h-3 w-3 text-orange-500" /> Hora Fin Gral.
                  </Label>
                  <Input 
                    type="time" 
                    value={formData.hora_fin || "18:00"} 
                    onChange={(e) => updateField("hora_fin", e.target.value)}
                    className="h-11 bg-slate-50 border-none font-bold text-center rounded-xl focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 w-full">
                <div className="space-y-4 bg-white p-8 rounded-[2rem] shadow-lg shadow-emerald-900/5 border border-slate-100 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-12 -mt-12 transition-all group-hover:bg-emerald-500/10"></div>
                  <Label htmlFor="precio" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-500" /> Inversión
                  </Label>
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-bold text-slate-300">$</span>
                    <Input
                      id="precio"
                      type="number"
                      step="0.01"
                      value={formData.es_gratuita ? 0 : (formData.precio === 0 ? "" : formData.precio)}
                      onChange={(e) => updateField("precio", e.target.value === "" ? 0 : Number(e.target.value))}
                      disabled={formData.es_gratuita}
                      className="h-auto p-0 border-none text-5xl font-black text-slate-900 focus-visible:ring-0 bg-transparent w-full disabled:opacity-100 disabled:text-slate-900"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
                    <Label htmlFor="es_gratuita" className="text-[10px] font-bold text-slate-500 cursor-pointer">¿Es gratuita?</Label>
                    <Switch
                      id="es_gratuita"
                      checked={formData.es_gratuita}
                      onCheckedChange={(checked) => {
                        updateField("es_gratuita", checked)
                        if (checked) {
                          // Guardar precio anterior antes de ponerlo en 0
                          if (formData.precio > 0) {
                            updateField("precio_anterior", formData.precio)
                          }
                          updateField("precio", 0)
                        } else {
                          // Restaurar precio anterior si existe
                          const precioAnterior = formData.precio_anterior || 50
                          updateField("precio", precioAnterior)
                        }
                      }}
                    />
                  </div>
                </div>


                <div className="space-y-4 bg-white p-8 rounded-[2rem] shadow-lg shadow-blue-900/5 border border-slate-100 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 transition-all group-hover:bg-blue-500/10"></div>
                  <Label htmlFor="cupo" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" /> Capacidad
                  </Label>
                  <div className="flex items-center gap-2">
                    {formData.es_ilimitado ? (
                      <div className="flex items-center gap-1">
                        <Infinity className="h-10 w-10 text-blue-500" />
                        <span className="text-lg font-bold text-blue-500 uppercase ml-2">Ilimitado</span>
                      </div>
                    ) : (
                      <>
                        <Input
                          id="cupo"
                          type="number"
                          value={formData.cupo === 0 ? "" : formData.cupo}
                          onChange={(e) => updateField("cupo", e.target.value === "" ? 0 : Number(e.target.value))}
                          className="h-auto p-0 border-none text-5xl font-black text-slate-900 focus-visible:ring-0 bg-transparent w-full"
                        />
                        <span className="text-2xl font-bold text-slate-300 uppercase">Pax</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
                    <Label htmlFor="es_ilimitado" className="text-[10px] font-bold text-slate-500 cursor-pointer">¿Es ilimitado?</Label>
                    <Switch
                      id="es_ilimitado"
                      checked={formData.es_ilimitado}
                      onCheckedChange={(checked) => {
                        updateField("es_ilimitado", checked)
                        if (checked) {
                          updateField("cupo", 0)
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="xl:col-span-12 border-t border-slate-100 bg-gradient-to-br from-violet-50/70 via-white to-slate-50/50 p-8 lg:p-12">
          <section className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-violet-600 p-3 shadow-xl shadow-violet-900/10">
                  <Layout className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight text-slate-900">Diseño del Certificado</h3>
                  <p className="text-sm text-slate-500">Esta sección ocupa todo el ancho para que puedas definir fondo, firma electrónica, QR y posiciones exactas del certificado.</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 rounded-[1.75rem] border border-violet-100 bg-white/90 p-4 shadow-sm sm:flex-row sm:items-center">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-700">Certificado del conversatorio</p>
                  <p className="text-xs text-slate-500">Activa el diseño avanzado, su costo y la firma electrónica del documento.</p>
                </div>
                <Switch
                  id="certificate_enabled"
                  checked={!!formData.certificate_enabled}
                  onCheckedChange={(checked) => updateField("certificate_enabled", checked)}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-6 rounded-[2rem] border border-violet-100 bg-white p-8 lg:p-10 shadow-lg shadow-violet-900/5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Vista previa del certificado</Label>
                    <p className="mt-1 text-sm text-slate-500">La preview incluye QR de validación, QR del bloque de firma electrónica, fecha de emisión y horas académicas con posiciones configurables.</p>
                  </div>
                  <Badge className="rounded-full bg-violet-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-violet-700 hover:bg-violet-100">Preview</Badge>
                </div>

                <div
                  className="relative w-full aspect-[1.414/1] overflow-hidden rounded-[2rem] border border-violet-100 bg-slate-100 shadow-inner"
                  style={{
                    backgroundImage: formData.certificate_background_url ? `url(${formData.certificate_background_url})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    fontFamily: certificateFontPreview,
                  }}
                >
                  {!formData.certificate_background_url && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/85 text-center text-slate-400">
                      <Image className="mb-3 h-10 w-10 text-violet-300" />
                      <p className="text-sm font-semibold">Sube un fondo para ver una preview más realista</p>
                    </div>
                  )}

                  <div className="absolute inset-x-[12%] top-[11%] text-center">
                    <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-500">{formData.certificate_title || 'CERTIFICADO'}</p>
                  </div>

                  <div
                    className="absolute -translate-x-1/2 text-center text-slate-900"
                    style={{
                      left: `${formData.certificate_recipient_name_x}%`,
                      top: `${formData.certificate_recipient_name_y}%`,
                      width: `${formData.certificate_recipient_name_width}%`,
                      fontSize: `${formData.certificate_recipient_name_font_size}px`,
                      lineHeight: 1.05,
                    }}
                  >
                    <p className="font-black">Juan Pérez Ejemplo</p>
                    <p className="mt-3 text-sm font-medium text-slate-600">{formData.certificate_body || 'Se certifica que {userName} participó en el siguiente conversatorio:'}</p>
                  </div>

                  <div
                    className="absolute -translate-x-1/2 rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-2 text-center shadow-sm backdrop-blur-sm"
                    style={{
                      left: `${formData.certificate_signer_x}%`,
                      top: `${formData.certificate_signer_y}%`,
                      width: `${formData.certificate_signer_width}%`,
                    }}
                  >
                    {formData.certificate_signature_image_url ? (
                      <img src={formData.certificate_signature_image_url} alt="Firma electrónica visible" className="mx-auto mb-2 h-10 object-contain" />
                    ) : (
                      <div className="mx-auto mb-2 flex h-10 w-28 items-center justify-center rounded-full border border-dashed border-slate-300 text-[10px] uppercase tracking-widest text-slate-400">
                        Firma electrónica
                      </div>
                    )}
                    <p style={{ fontSize: `${formData.certificate_signer_font_size}px` }} className="font-bold text-slate-900">{formData.certificate_signer_name || 'Nombre del firmante electrónico'}</p>
                    <p className="mt-1 text-xs text-slate-500">{formData.certificate_signer_role || 'Cargo del firmante electrónico'}</p>
                    {formData.certificate_signature_enabled && formData.certificate_signature_qr_enabled && (
                      <div className="mx-auto mt-2 flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">
                        QR
                      </div>
                    )}
                    {formData.certificate_signature_enabled && (
                      <p className="mt-2 inline-flex rounded-full bg-blue-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-blue-700">Firmado electrónicamente</p>
                    )}
                  </div>

                  {formData.certificate_qr_enabled && (
                    <div
                      className="absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-300 bg-white/95 p-2 shadow-sm"
                      style={{
                        left: `${formData.certificate_qr_x}%`,
                        top: `${formData.certificate_qr_y}%`,
                        width: `${formData.certificate_qr_size}%`,
                        aspectRatio: '1 / 1',
                      }}
                    >
                      <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-slate-300 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                        QR
                      </div>
                    </div>
                  )}

                  <div
                    className="absolute rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-left shadow-sm backdrop-blur-sm"
                    style={{
                      left: `${formData.certificate_hours_x}%`,
                      top: `${formData.certificate_hours_y}%`,
                      width: `${formData.certificate_hours_width}%`,
                    }}
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Horas académicas</p>
                    <p style={{ fontSize: `${formData.certificate_hours_font_size}px` }} className="mt-1 font-bold text-slate-900">8 horas</p>
                  </div>

                  <div
                    className="absolute rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-left shadow-sm backdrop-blur-sm"
                    style={{
                      left: `${formData.certificate_issue_date_x}%`,
                      top: `${formData.certificate_issue_date_y}%`,
                      width: `${formData.certificate_issue_date_width}%`,
                    }}
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Fecha de emisión</p>
                    <p style={{ fontSize: `${formData.certificate_issue_date_font_size}px` }} className="mt-1 font-bold text-slate-900">{new Date().toLocaleDateString("es-EC")}</p>
                  </div>

                  <div className="absolute inset-x-[8%] bottom-[8%] rounded-xl bg-white/70 px-4 py-2 text-center text-xs text-slate-600 backdrop-blur-sm">
                    {formData.certificate_footer || 'Código: {verificationCode}'}
                  </div>
                </div>
              </div>

              <div className="space-y-8 rounded-[2rem] border border-slate-100 bg-white p-8 lg:p-10 shadow-lg shadow-slate-900/5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
                  <div className="space-y-2 rounded-2xl bg-slate-50 p-5">
                    <Label htmlFor="certificate_font_family" className="text-xs font-bold uppercase tracking-widest text-slate-500">Tipografía base</Label>
                    <Select value={formData.certificate_font_family || "serif"} onValueChange={(value) => updateField("certificate_font_family", value as "serif" | "sans-serif")}>
                      <SelectTrigger id="certificate_font_family" className="h-12 bg-white border-slate-200 font-bold text-slate-900">
                        <SelectValue placeholder="Selecciona una tipografía" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-100 rounded-2xl shadow-2xl">
                        <SelectItem value="serif">Serif</SelectItem>
                        <SelectItem value="sans-serif">Sans Serif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4 rounded-[1.75rem] border border-dashed border-violet-200 bg-violet-50/50 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Fondo del certificado</Label>
                      <p className="mt-1 text-sm text-slate-500">Sube el background a Cloudinary y usa su URL como base del diseño.</p>
                    </div>
                    <input type="file" accept="image/*" id="form-upload-certificate-background" className="hidden" onChange={(e) => handleFileUpload(e, "certificate_background_url")} />
                    <Button type="button" variant="outline" onClick={() => document.getElementById("form-upload-certificate-background")?.click()} disabled={isUploading} className="rounded-2xl border-violet-200 text-violet-700 hover:bg-violet-100">
                      {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                      Subir fondo
                    </Button>
                  </div>
                  <Input value={formData.certificate_background_url} onChange={(e) => updateField("certificate_background_url", e.target.value)} placeholder="https://res.cloudinary.com/.../fondo-certificado.png" className="h-11 bg-white border-slate-200 text-sm text-slate-700" />
                  {formData.certificate_background_url && (
                    <div className="flex flex-wrap gap-3 text-xs">
                      <a href={formData.certificate_background_url} target="_blank" rel="noreferrer" className="font-semibold text-violet-700 hover:underline">Ver fondo</a>
                      <button type="button" onClick={() => updateField("certificate_background_url", "")} className="font-semibold text-rose-600 hover:underline">Quitar fondo</button>
                    </div>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="certificate_title" className="text-xs font-bold uppercase tracking-widest text-slate-500">Título del certificado</Label>
                    <Input id="certificate_title" value={formData.certificate_title || ""} onChange={(e) => updateField("certificate_title", e.target.value)} placeholder="CERTIFICADO" className="mt-2 h-12 bg-white border-slate-200 font-bold text-slate-900" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="certificate_body" className="text-xs font-bold uppercase tracking-widest text-slate-500">Texto principal</Label>
                  <Textarea id="certificate_body" value={formData.certificate_body || ""} onChange={(e) => updateField("certificate_body", e.target.value)} placeholder="Se certifica que {userName} participó en el siguiente conversatorio:" className="mt-2 min-h-[120px] bg-white border-slate-200 text-sm leading-relaxed text-slate-700" />
                </div>
                <div>
                  <Label htmlFor="certificate_footer" className="text-xs font-bold uppercase tracking-widest text-slate-500">Pie del certificado</Label>
                  <Textarea id="certificate_footer" value={formData.certificate_footer || ""} onChange={(e) => updateField("certificate_footer", e.target.value)} placeholder="Código: {verificationCode}" className="mt-2 min-h-[90px] bg-white border-slate-200 text-sm leading-relaxed text-slate-700" />
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                  <div className="space-y-4 rounded-[1.75rem] border border-slate-100 bg-slate-50 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Bloque de firma electrónica</Label>
                        <p className="mt-1 text-sm text-slate-500">Configura el bloque visible asociado al firmante electrónico: nombre, cargo y representación del firmante que acompaña la firma electrónica.</p>
                      </div>
                      <input type="file" accept="image/*" id="form-upload-certificate-signature-image" className="hidden" onChange={(e) => handleFileUpload(e, "certificate_signature_image_url")} />
                      <Button type="button" variant="outline" onClick={() => document.getElementById("form-upload-certificate-signature-image")?.click()} disabled={isUploading} className="rounded-2xl border-slate-200 text-slate-700 hover:bg-slate-100">
                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        Subir representación del firmante
                      </Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="certificate_signer_name" className="text-xs font-bold uppercase tracking-widest text-slate-500">Nombre del firmante electrónico</Label>
                        <Input id="certificate_signer_name" value={formData.certificate_signer_name || ""} onChange={(e) => updateField("certificate_signer_name", e.target.value)} placeholder="Dra. Ana Pérez" className="mt-2 h-12 bg-white border-slate-200 text-slate-900" />
                      </div>
                      <div>
                        <Label htmlFor="certificate_signer_role" className="text-xs font-bold uppercase tracking-widest text-slate-500">Cargo</Label>
                        <Input id="certificate_signer_role" value={formData.certificate_signer_role || ""} onChange={(e) => updateField("certificate_signer_role", e.target.value)} placeholder="Directora Académica" className="mt-2 h-12 bg-white border-slate-200 text-slate-900" />
                      </div>
                    </div>
                    <Input value={formData.certificate_signature_image_url || ""} onChange={(e) => updateField("certificate_signature_image_url", e.target.value)} placeholder="https://res.cloudinary.com/.../representacion-firmante-electronico.png" className="h-11 bg-white border-slate-200 text-sm text-slate-700" />
                    {formData.certificate_signature_image_url && <img src={formData.certificate_signature_image_url} alt="Representación del firmante electrónico cargada" className="h-16 max-w-full rounded-xl border border-slate-200 bg-white object-contain p-2" />}
                  </div>

                  <div className="space-y-4 rounded-[1.75rem] border border-slate-100 bg-slate-50 p-5">
                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-emerald-700">Firma electrónica</p>
                        <p className="text-xs text-emerald-700/80">Prepara el archivo .p12 y la clave para que el backend pueda firmar el PDF.</p>
                      </div>
                      <Switch id="certificate_signature_enabled" checked={!!formData.certificate_signature_enabled} onCheckedChange={(checked) => updateField("certificate_signature_enabled", checked)} />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <input type="file" accept=".p12,application/x-pkcs12" id="form-upload-certificate-p12" className="hidden" onChange={(e) => handleFileUpload(e, "certificate_signature_p12_url")} />
                      <Button type="button" variant="outline" onClick={() => document.getElementById("form-upload-certificate-p12")?.click()} disabled={isUploading} className="rounded-2xl border-emerald-200 text-emerald-700 hover:bg-emerald-100">
                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        Subir .p12
                      </Button>
                      <span className="text-xs text-slate-500">Aquí configuras el archivo real de la firma electrónica que respalda el bloque de firma mostrado en el certificado.</span>
                    </div>
                    <Input value={formData.certificate_signature_p12_url || ""} onChange={(e) => updateField("certificate_signature_p12_url", e.target.value)} placeholder="https://.../certificado.p12" className="h-11 bg-white border-slate-200 text-sm text-slate-700" />
                    <div>
                      <Label htmlFor="certificate_signature_p12_password" className="text-xs font-bold uppercase tracking-widest text-slate-500">Clave del .p12</Label>
                      <Input id="certificate_signature_p12_password" type="password" value={formData.certificate_signature_p12_password || ""} onChange={(e) => updateField("certificate_signature_p12_password", e.target.value)} placeholder="••••••••" className="mt-2 h-12 bg-white border-slate-200 text-slate-900" />
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                  <div className="space-y-4 rounded-[1.75rem] border border-slate-100 bg-slate-50 p-5">
                    <div>
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Posición del nombre del beneficiario</Label>
                      <p className="mt-1 text-sm text-slate-500">Usa porcentajes para mover el nombre en la preview y ajustar su ancho/tamaño.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label htmlFor="certificate_recipient_name_x" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">X (%)</Label><Input id="certificate_recipient_name_x" type="number" value={formData.certificate_recipient_name_x ?? 50} onChange={(e) => updateField("certificate_recipient_name_x", Number(e.target.value || 0))} className="mt-2 h-11 bg-white border-slate-200" /></div>
                      <div><Label htmlFor="certificate_recipient_name_y" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Y (%)</Label><Input id="certificate_recipient_name_y" type="number" value={formData.certificate_recipient_name_y ?? 46} onChange={(e) => updateField("certificate_recipient_name_y", Number(e.target.value || 0))} className="mt-2 h-11 bg-white border-slate-200" /></div>
                      <div><Label htmlFor="certificate_recipient_name_font_size" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Tamaño (px)</Label><Input id="certificate_recipient_name_font_size" type="number" value={formData.certificate_recipient_name_font_size ?? 30} onChange={(e) => updateField("certificate_recipient_name_font_size", Number(e.target.value || 0))} className="mt-2 h-11 bg-white border-slate-200" /></div>
                      <div><Label htmlFor="certificate_recipient_name_width" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Ancho (%)</Label><Input id="certificate_recipient_name_width" type="number" value={formData.certificate_recipient_name_width ?? 70} onChange={(e) => updateField("certificate_recipient_name_width", Number(e.target.value || 0))} className="mt-2 h-11 bg-white border-slate-200" /></div>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-[1.75rem] border border-slate-100 bg-slate-50 p-5">
                    <div>
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Posición de la firma electrónica</Label>
                      <p className="mt-1 text-sm text-slate-500">Controla la ubicación y el tamaño del bloque de firma electrónica mostrado en el certificado.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label htmlFor="certificate_signer_x" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">X (%)</Label><Input id="certificate_signer_x" type="number" value={formData.certificate_signer_x ?? 76} onChange={(e) => updateField("certificate_signer_x", Number(e.target.value || 0))} className="mt-2 h-11 bg-white border-slate-200" /></div>
                      <div><Label htmlFor="certificate_signer_y" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Y (%)</Label><Input id="certificate_signer_y" type="number" value={formData.certificate_signer_y ?? 80} onChange={(e) => updateField("certificate_signer_y", Number(e.target.value || 0))} className="mt-2 h-11 bg-white border-slate-200" /></div>
                      <div><Label htmlFor="certificate_signer_font_size" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Tamaño nombre (px)</Label><Input id="certificate_signer_font_size" type="number" value={formData.certificate_signer_font_size ?? 16} onChange={(e) => updateField("certificate_signer_font_size", Number(e.target.value || 0))} className="mt-2 h-11 bg-white border-slate-200" /></div>
                      <div><Label htmlFor="certificate_signer_width" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Ancho (%)</Label><Input id="certificate_signer_width" type="number" value={formData.certificate_signer_width ?? 24} onChange={(e) => updateField("certificate_signer_width", Number(e.target.value || 0))} className="mt-2 h-11 bg-white border-slate-200" /></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 rounded-[1.75rem] border border-slate-100 bg-slate-50 p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">QR de validación</Label>
                      <p className="mt-1 text-sm text-slate-500">Apunta a https://profesionales.ec/certificados/validar/id-del-certificado y puedes moverlo en la preview.</p>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      <p className="text-xs font-semibold text-slate-600">Mostrar QR</p>
                      <Switch id="certificate_qr_enabled" checked={!!formData.certificate_qr_enabled} onCheckedChange={(checked) => updateField("certificate_qr_enabled", checked)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div><Label htmlFor="certificate_qr_x" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">X (%)</Label><Input id="certificate_qr_x" type="number" value={formData.certificate_qr_x ?? 92} onChange={(e) => updateField("certificate_qr_x", Number(e.target.value || 0))} className="mt-2 h-11 bg-white border-slate-200" /></div>
                    <div><Label htmlFor="certificate_qr_y" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Y (%)</Label><Input id="certificate_qr_y" type="number" value={formData.certificate_qr_y ?? 10} onChange={(e) => updateField("certificate_qr_y", Number(e.target.value || 0))} className="mt-2 h-11 bg-white border-slate-200" /></div>
                    <div><Label htmlFor="certificate_qr_size" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Tamaño (%)</Label><Input id="certificate_qr_size" type="number" value={formData.certificate_qr_size ?? 10} onChange={(e) => updateField("certificate_qr_size", Number(e.target.value || 0))} className="mt-2 h-11 bg-white border-slate-200" /></div>
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">Pequeño y discreto, ideal para la esquina superior derecha.</div>
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                  <div className="space-y-4 rounded-[1.75rem] border border-slate-100 bg-slate-50 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">QR del bloque de firma electrónica</Label>
                        <p className="mt-1 text-sm text-slate-500">Se mostrará dentro del bloque de firma para reforzar la validación visual del certificado firmado.</p>
                      </div>
                      <Switch id="certificate_signature_qr_enabled" checked={!!formData.certificate_signature_qr_enabled} onCheckedChange={(checked) => updateField("certificate_signature_qr_enabled", checked)} />
                    </div>
                    <div>
                      <Label htmlFor="certificate_signature_qr_size" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Tamaño (px)</Label>
                      <Input id="certificate_signature_qr_size" type="number" value={formData.certificate_signature_qr_size ?? 38} onChange={(e) => updateField("certificate_signature_qr_size", Number(e.target.value || 0))} className="mt-2 h-11 bg-white border-slate-200" />
                    </div>
                  </div>

                  <div className="space-y-4 rounded-[1.75rem] border border-slate-100 bg-slate-50 p-5">
                    <div>
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Posición de horas académicas</Label>
                      <p className="mt-1 text-sm text-slate-500">Controla dónde aparece el número de horas del curso o conversatorio.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label htmlFor="certificate_hours_x" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">X (%)</Label><Input id="certificate_hours_x" type="number" value={formData.certificate_hours_x ?? 22} onChange={(e) => updateField("certificate_hours_x", Number(e.target.value || 0))} className="mt-2 h-11 bg-white border-slate-200" /></div>
                      <div><Label htmlFor="certificate_hours_y" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Y (%)</Label><Input id="certificate_hours_y" type="number" value={formData.certificate_hours_y ?? 72} onChange={(e) => updateField("certificate_hours_y", Number(e.target.value || 0))} className="mt-2 h-11 bg-white border-slate-200" /></div>
                      <div><Label htmlFor="certificate_hours_font_size" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Tamaño (px)</Label><Input id="certificate_hours_font_size" type="number" value={formData.certificate_hours_font_size ?? 14} onChange={(e) => updateField("certificate_hours_font_size", Number(e.target.value || 0))} className="mt-2 h-11 bg-white border-slate-200" /></div>
                      <div><Label htmlFor="certificate_hours_width" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Ancho (%)</Label><Input id="certificate_hours_width" type="number" value={formData.certificate_hours_width ?? 20} onChange={(e) => updateField("certificate_hours_width", Number(e.target.value || 0))} className="mt-2 h-11 bg-white border-slate-200" /></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 rounded-[1.75rem] border border-slate-100 bg-slate-50 p-5">
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Posición de fecha de emisión</Label>
                    <p className="mt-1 text-sm text-slate-500">Mueve el timestamp de emisión del certificado dentro del diseño final.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div><Label htmlFor="certificate_issue_date_x" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">X (%)</Label><Input id="certificate_issue_date_x" type="number" value={formData.certificate_issue_date_x ?? 22} onChange={(e) => updateField("certificate_issue_date_x", Number(e.target.value || 0))} className="mt-2 h-11 bg-white border-slate-200" /></div>
                    <div><Label htmlFor="certificate_issue_date_y" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Y (%)</Label><Input id="certificate_issue_date_y" type="number" value={formData.certificate_issue_date_y ?? 78} onChange={(e) => updateField("certificate_issue_date_y", Number(e.target.value || 0))} className="mt-2 h-11 bg-white border-slate-200" /></div>
                    <div><Label htmlFor="certificate_issue_date_font_size" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Tamaño (px)</Label><Input id="certificate_issue_date_font_size" type="number" value={formData.certificate_issue_date_font_size ?? 14} onChange={(e) => updateField("certificate_issue_date_font_size", Number(e.target.value || 0))} className="mt-2 h-11 bg-white border-slate-200" /></div>
                    <div><Label htmlFor="certificate_issue_date_width" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Ancho (%)</Label><Input id="certificate_issue_date_width" type="number" value={formData.certificate_issue_date_width ?? 20} onChange={(e) => updateField("certificate_issue_date_width", Number(e.target.value || 0))} className="mt-2 h-11 bg-white border-slate-200" /></div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
                  <p className="font-semibold text-slate-700">Variables disponibles</p>
                  <p className="mt-2 leading-relaxed">{certificateVariables.join(", ")}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* SECCIÓN 3: MULTIMEDIA PREMIUM */}
        <div className="xl:col-span-12 p-8 lg:p-12 border-t border-slate-100 bg-slate-50/20">
          <section className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-900/10">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Multimedia Premium</h3>
                  <p className="text-slate-500 text-sm">Contenido enriquecido y destacados</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm self-start md:self-center">
                <Checkbox 
                  id="es_destacado" 
                  checked={formData.es_destacado} 
                  onCheckedChange={(checked) => updateField("es_destacado", !!checked)} 
                />
                <Label htmlFor="es_destacado" className="font-bold text-slate-700 cursor-pointer">Marcar como Destacado</Label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="imagen_banner" className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">URL Imagen Banner</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="imagen_banner" 
                        placeholder="https://ejemplo.com/banner.jpg" 
                        value={formData.imagen_banner || ""} 
                        onChange={(e) => updateField("imagen_banner", e.target.value)}
                        className="h-12 bg-white border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-600 flex-1"
                      />
                      <div className="relative">
                        <Input
                          type="file"
                          className="hidden"
                          id="form-upload-banner"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, "imagen_banner")}
                          disabled={isUploading}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="h-12 w-12 p-0 rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                          onClick={() => document.getElementById("form-upload-banner")?.click()}
                          disabled={isUploading}
                        >
                          {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Vista previa del Banner */}
                  <div className="relative h-48 w-full bg-slate-100 rounded-[2.5rem] border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center group">
                    {formData.imagen_banner ? (
                      <>
                        <img 
                          src={formData.imagen_banner} 
                          alt="Banner Preview" 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-bold text-slate-900 border border-white">Vista Previa del Banner</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Image className="h-10 w-10 opacity-20" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Sin imagen de banner</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="video_url" className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">URL Video (YouTube)</Label>
                  <Input 
                    id="video_url" 
                    placeholder="https://youtube.com/watch?v=..." 
                    value={formData.video_url || ""} 
                    onChange={(e) => updateField("video_url", e.target.value)}
                    className="h-12 bg-white border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="galeria_fotos" className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Galería de Fotos (URLs)</Label>
                  <div className="relative">
                    <Input
                      type="file"
                      className="hidden"
                      id="form-upload-gallery"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "galeria_fotos")}
                      disabled={isUploading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                      onClick={() => document.getElementById("form-upload-gallery")?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Upload className="h-3 w-3 mr-2" />}
                      Subir a Galería
                    </Button>
                  </div>
                </div>
                <Textarea 
                  id="galeria_fotos" 
                  placeholder="https://img1.jpg, https://img2.jpg..." 
                  value={Array.isArray(formData.galeria_fotos) ? formData.galeria_fotos.join(", ") : ""} 
                  onChange={(e) => updateField("galeria_fotos", e.target.value.split(",").map(url => url.trim()).filter(url => url !== ""))}
                  className="bg-white border-slate-100 rounded-2xl min-h-[105px] focus:ring-2 focus:ring-indigo-600 p-4"
                />
                <p className="text-[10px] text-slate-400 italic font-medium pl-1">
                  💡 La galería permite mostrar múltiples perspectivas del evento.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* SECCIÓN 4: REVISTA DEL CONVERSATORIO (NUEVA) */}
        <div className="xl:col-span-12 p-8 lg:p-12 border-t border-slate-100 bg-white">
          <section className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-600 rounded-2xl shadow-xl shadow-rose-900/10">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Revista del {resourceLabel}</h3>
                <p className="text-slate-500 text-sm">Vínculo principal a la revista digital</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-rose-50/30 p-8 rounded-[3rem] border border-rose-100">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="url_revista_general" className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">URL de la Revista (Flipbook/PDF)</Label>
                    <div className="flex gap-4">
                      <Input 
                        id="url_revista_general" 
                        placeholder="https://ejemplo.com/revista-xyz" 
                        value={formData.url_revista_general || ""} 
                        onChange={(e) => updateField("url_revista_general", e.target.value)}
                        className="h-12 bg-white border-slate-100 rounded-xl focus:ring-2 focus:ring-rose-600 flex-1"
                      />
                      <div className="relative">
                        <Input
                          type="file"
                          className="hidden"
                          id="form-upload-magazine-file"
                          accept=".pdf,image/*"
                          onChange={(e) => handleFileUpload(e, "url_revista_general")}
                          disabled={isUploading}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="h-12 w-12 p-0 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"
                          onClick={() => document.getElementById("form-upload-magazine-file")?.click()}
                          disabled={isUploading}
                        >
                          {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Portada de la Revista</Label>
                    <div className="flex gap-4">
                      <Input 
                        placeholder="URL de la imagen de portada" 
                        value={formData.foto_revista_general || ""} 
                        onChange={(e) => updateField("foto_revista_general", e.target.value)}
                        className="h-12 bg-white border-slate-100 rounded-xl focus:ring-2 focus:ring-rose-600 flex-1"
                      />
                      <div className="relative">
                        <Input
                          type="file"
                          className="hidden"
                          id="form-upload-magazine-main"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, "foto_revista_general")}
                          disabled={isUploading}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="h-12 w-12 p-0 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"
                          onClick={() => document.getElementById("form-upload-magazine-main")?.click()}
                          disabled={isUploading}
                        >
                          {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              <div className="flex justify-center">
                {formData.foto_revista_general ? (
                  <div className="relative group">
                    <img 
                      src={formData.foto_revista_general} 
                      alt="Portada Revista" 
                      className="h-64 object-cover rounded-2xl shadow-2xl transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white font-bold">Vista previa</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 w-48 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-2">
                    <Image className="h-8 w-8" />
                    <span className="text-[10px] font-black uppercase">Sin portada</span>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* SECCIÓN 5: ITINERARIO DINÁMICO (DÍAS Y PONENTES) */}
        <div className="xl:col-span-12 p-8 lg:p-12 border-t border-slate-100 bg-slate-50/30">
          <section className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-violet-600 rounded-2xl shadow-xl shadow-violet-900/10">
                  <Layout className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Itinerario y Ponentes</h3>
                  <p className="text-slate-500 text-sm italic">Los días se generan automáticamente según las fechas del evento</p>
                </div>
              </div>

            <div className="space-y-12">
              {formData.dias.map((dia, diaIndex) => (
                <div key={diaIndex} className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                  <div className="bg-violet-50/50 p-6 md:p-8 flex items-center justify-between border-b border-violet-100">
                    <div className="flex flex-wrap items-center gap-6">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Título del Día</Label>
                        <Input 
                          value={dia.titulo_dia || ""} 
                          onChange={(e) => updateDay(diaIndex, "titulo_dia", e.target.value)}
                          className="h-10 bg-white border-violet-100 rounded-xl font-bold text-violet-900 w-64"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Fecha (Auto)</Label>
                        <div className="h-10 px-4 bg-white/50 border border-violet-100/50 rounded-xl font-bold text-violet-900/50 flex items-center min-w-[150px] cursor-not-allowed">
                          {format(new Date(dia.fecha), "dd MMM, yyyy", { locale: es })}
                        </div>
                      </div>

                      <div className="bg-white p-2 px-4 rounded-xl border border-violet-100 shadow-sm flex items-center gap-4">
                        <div className="space-y-1">
                          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <Clock className="h-3 w-3 text-blue-500" /> Comienzo
                          </Label>
                          <Input 
                            type="time" 
                            value={dia.hora_inicio || ""} 
                            onChange={(e) => updateDay(diaIndex, "hora_inicio", e.target.value)}
                            className="h-8 border-none bg-slate-50 rounded-lg font-bold text-center w-24 text-sm" 
                          />
                        </div>
                        <div className="w-px h-8 bg-slate-100" />
                        <div className="space-y-1">
                          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <Clock className="h-3 w-3 text-orange-500" /> Fin
                          </Label>
                          <Input 
                            type="time" 
                            value={dia.hora_fin || ""} 
                            onChange={(e) => updateDay(diaIndex, "hora_fin", e.target.value)}
                            className="h-8 border-none bg-slate-50 rounded-lg font-bold text-center w-24 text-sm" 
                          />
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      onClick={() => removeDay(diaIndex)}
                      type="button"
                      className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-10 w-10 p-0 rounded-xl"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="p-8 space-y-8">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-400 flex items-center gap-2 text-sm uppercase tracking-widest">
                        <Users className="h-4 w-4" /> Ponentes de este día
                      </h4>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => addSpeaker(diaIndex)}
                        type="button"
                        className="text-violet-600 hover:bg-violet-50 font-bold"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Añadir Ponente
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {dia.ponentes.map((ponente, pIndex) => (
                        <div key={pIndex} className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 space-y-4 relative group">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            type="button"
                            onClick={() => removeSpeaker(diaIndex, pIndex)}
                            className="absolute top-2 right-2 h-8 w-8 p-0 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>

                          <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                              <div className="h-24 w-24 rounded-full overflow-hidden bg-white border-4 border-white shadow-lg">
                                {ponente.foto_revista_url ? (
                                  <img src={ponente.foto_revista_url} alt={ponente.nombre_ponente} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-300">
                                    <Users className="h-10 w-10" />
                                  </div>
                                )}
                              </div>
                              <div className="absolute -bottom-1 -right-1">
                                <Input
                                  type="file"
                                  className="hidden"
                                  id={`upload-ponente-${diaIndex}-${pIndex}`}
                                  accept="image/*"
                                  onChange={(e) => handleFileUpload(e, { type: "ponente_foto", diaIndex, ponenteIndex: pIndex })}
                                  disabled={isUploading}
                                />
                                <Button 
                                  size="icon" 
                                  type="button"
                                  className="h-8 w-8 rounded-full bg-violet-600 hover:bg-violet-700 text-white shadow-lg"
                                  onClick={() => document.getElementById(`upload-ponente-${diaIndex}-${pIndex}`)?.click()}
                                  disabled={isUploading}
                                >
                                  {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                                </Button>
                              </div>
                            </div>
                            <div className="w-full space-y-3">
                              <Input 
                                placeholder="Nombre del Ponente" 
                                value={ponente.nombre_ponente || ""} 
                                onChange={(e) => updateSpeaker(diaIndex, pIndex, "nombre_ponente", e.target.value)}
                                className="h-9 text-xs font-bold text-center border-none bg-white rounded-lg shadow-sm"
                              />
                              <Input 
                                placeholder="Profesión (Ej: Cirujano)" 
                                value={ponente.profesion || ""} 
                                onChange={(e) => updateSpeaker(diaIndex, pIndex, "profesion", e.target.value)}
                                className="h-9 text-[10px] text-center border-none bg-white/50 rounded-lg"
                              />
                              
                              {/* NUEVO: Horario del Ponente */}
                              <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
                                <div className="flex-1 space-y-1">
                                  <Label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-1 leading-none">
                                    <Clock className="h-2 w-2 text-blue-500" /> Inicio
                                  </Label>
                                  <Input 
                                    type="time" 
                                    value={ponente.hora_inicio || "09:00"} 
                                    onChange={(e) => updateSpeaker(diaIndex, pIndex, "hora_inicio", e.target.value)}
                                    className="h-7 px-1 text-[10px] font-bold text-center border-none bg-transparent shadow-none focus-visible:ring-0"
                                  />
                                </div>
                                <div className="w-px h-6 bg-slate-100" />
                                <div className="flex-1 space-y-1">
                                  <Label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-1 leading-none">
                                    <Clock className="h-2 w-2 text-orange-500" /> Fin
                                  </Label>
                                  <Input 
                                    type="time" 
                                    value={ponente.hora_fin || "10:00"} 
                                    onChange={(e) => updateSpeaker(diaIndex, pIndex, "hora_fin", e.target.value)}
                                    className="h-7 px-1 text-[10px] font-bold text-center border-none bg-transparent shadow-none focus-visible:ring-0"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div className="grid grid-cols-1 gap-4">
                              <div className="space-y-2">
                                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Slogan / Frase de Impacto</Label>
                                <Input 
                                  placeholder="Ej: Transformando la visión del futuro" 
                                  value={ponente.slogan || ""} 
                                  onChange={(e) => updateSpeaker(diaIndex, pIndex, "slogan", e.target.value)}
                                  className="h-8 text-[11px] border-none bg-white rounded-lg"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Tema de la Charla</Label>
                                <Input 
                                  placeholder="Ej: Nuevas tendencias en..." 
                                  value={ponente.tema_charla || ""} 
                                  onChange={(e) => updateSpeaker(diaIndex, pIndex, "tema_charla", e.target.value)}
                                  className="h-8 text-[11px] border-none bg-white rounded-lg"
                                />
                              </div>
                            </div>

                            <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 p-4 space-y-3">
                              <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                  <Label className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Clase de muestra gratis</Label>
                                  <p className="text-[11px] text-emerald-800/80 leading-relaxed">
                                    Si el {resourceLabel.toLowerCase()} es de pago, esta lección o ponencia podrá abrirse sin pagar.
                                  </p>
                                </div>
                                <Switch
                                  checked={!!ponente.es_muestra_gratis}
                                  disabled={formData.es_gratuita}
                                  onCheckedChange={(checked) => updateSpeaker(diaIndex, pIndex, "es_muestra_gratis", checked)}
                                />
                              </div>
                              {formData.es_gratuita ? (
                                <Badge variant="secondary" className="bg-white text-emerald-700 border border-emerald-200">
                                  Todo el {resourceLabel.toLowerCase()} es gratuito; no hace falta marcar muestra.
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className={ponente.es_muestra_gratis ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}>
                                  {ponente.es_muestra_gratis ? "Acceso libre a esta unidad" : "Unidad protegida por pago"}
                                </Badge>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Biografía del Ponente</Label>
                              <Textarea 
                                placeholder="Breve reseña profesional..." 
                                value={ponente.biografia || ""} 
                                onChange={(e) => updateSpeaker(diaIndex, pIndex, "biografia", e.target.value)}
                                className="min-h-[80px] text-[11px] border-none bg-white rounded-xl p-3 resize-none"
                              />
                            </div>

                            <div className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-white/80 p-4 shadow-sm">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <Label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Material de apoyo</Label>
                                  <p className="mt-1 text-[11px] text-slate-500">
                                    Agrega PDFs, enlaces, Word, Excel u otros documentos por cada lección o ponencia.
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="rounded-xl border-slate-200 text-slate-700"
                                    onClick={() => addSupportMaterial(diaIndex, pIndex, "link")}
                                  >
                                    <Plus className="mr-1 h-3.5 w-3.5" />
                                    Link
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="rounded-xl border-slate-200 text-slate-700"
                                    onClick={() => addSupportMaterial(diaIndex, pIndex, "file")}
                                  >
                                    <Upload className="mr-1 h-3.5 w-3.5" />
                                    Archivo
                                  </Button>
                                </div>
                              </div>

                              {Array.isArray(ponente.materiales_apoyo) && ponente.materiales_apoyo.length > 0 ? (
                                <div className="space-y-3">
                                  {ponente.materiales_apoyo.map((material, materialIndex) => (
                                    <div key={`${diaIndex}-${pIndex}-${materialIndex}`} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                                      <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                          <Badge variant="secondary" className="bg-white text-slate-700 border border-slate-200">
                                            #{materialIndex + 1}
                                          </Badge>
                                          <Select
                                            value={material.tipo}
                                            onValueChange={(value: "link" | "file") => updateSupportMaterial(diaIndex, pIndex, materialIndex, "tipo", value)}
                                          >
                                            <SelectTrigger className="h-8 w-[120px] border-slate-200 bg-white text-[11px] font-bold">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white">
                                              <SelectItem value="link">Link</SelectItem>
                                              <SelectItem value="file">Archivo</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <Button
                                          type="button"
                                          size="icon"
                                          variant="ghost"
                                          className="h-8 w-8 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                                          onClick={() => removeSupportMaterial(diaIndex, pIndex, materialIndex)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>

                                      <div className="space-y-2">
                                        <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Descripción</Label>
                                        <Textarea
                                          placeholder="Describe para qué sirve este material de apoyo..."
                                          value={material.descripcion || ""}
                                          onChange={(e) => updateSupportMaterial(diaIndex, pIndex, materialIndex, "descripcion", e.target.value)}
                                          className="min-h-[72px] text-[11px] border-none bg-white rounded-xl p-3 resize-none"
                                        />
                                      </div>

                                      <div className="space-y-2">
                                        <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">
                                          {material.tipo === "file" ? "Archivo o URL del archivo" : "Link externo"}
                                        </Label>
                                        <div className="flex items-center gap-2">
                                          <Input
                                            placeholder={material.tipo === "file" ? "https://.../material.pdf" : "https://..."}
                                            value={material.url || ""}
                                            onChange={(e) => updateSupportMaterial(diaIndex, pIndex, materialIndex, "url", e.target.value)}
                                            className="h-9 text-[11px] border-none bg-white rounded-lg font-mono flex-1"
                                          />
                                          {material.tipo === "file" && (
                                            <>
                                              <Button
                                                size="icon"
                                                type="button"
                                                className="h-9 w-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60"
                                                onClick={() => document.getElementById(`upload-material-${diaIndex}-${pIndex}-${materialIndex}`)?.click()}
                                                disabled={isUploading}
                                                title="Subir archivo de apoyo"
                                              >
                                                {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                                              </Button>
                                              <Input
                                                type="file"
                                                className="hidden"
                                                id={`upload-material-${diaIndex}-${pIndex}-${materialIndex}`}
                                                accept={supportFileAccept}
                                                onChange={(e) => handleFileUpload(e, { type: "ponente_material", diaIndex, ponenteIndex: pIndex, materialIndex })}
                                              />
                                            </>
                                          )}
                                        </div>
                                        {material.tipo === "file" ? (
                                          <p className="text-[10px] text-slate-500">
                                            Formatos permitidos: PDF, Word, Excel, PowerPoint, CSV, TXT y OpenDocument.
                                          </p>
                                        ) : (
                                          <p className="text-[10px] text-slate-500">
                                            Usa URLs completas con http:// o https://.
                                          </p>
                                        )}
                                      </div>

                                      {material.tipo === "file" && (material.nombre_archivo || material.extension || material.mime_type) && (
                                        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] text-slate-500">
                                          <span className="font-semibold text-slate-700">Archivo detectado:</span>{" "}
                                          {material.nombre_archivo || material.url.split("/").pop()?.split("?")[0] || "Archivo subido"}
                                          {material.extension ? ` · .${material.extension}` : ""}
                                          {material.mime_type ? ` · ${material.mime_type}` : ""}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-5 text-center text-[11px] text-slate-500">
                                  Todavía no agregas materiales de apoyo para esta unidad.
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">URL Video (YouTube)</Label>
                                <Input 
                                  placeholder="https://..." 
                                  value={ponente.video_url || ""} 
                                  onChange={(e) => updateSpeaker(diaIndex, pIndex, "video_url", e.target.value)}
                                  className="h-8 text-[11px] border-none bg-white rounded-lg font-mono"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Link Revista/Perfil</Label>
                                <div className="flex items-center gap-2">
                                  <Input 
                                    placeholder="https://..." 
                                    value={ponente.url_revista_personal || ""} 
                                    onChange={(e) => updateSpeaker(diaIndex, pIndex, "url_revista_personal", e.target.value)}
                                    className="h-8 text-[11px] border-none bg-white rounded-lg font-mono flex-1"
                                  />
                                  <div className="relative">
                                    <Button 
                                      size="icon" 
                                      type="button"
                                      className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all border border-slate-200/50"
                                      onClick={() => document.getElementById(`upload-revista-${diaIndex}-${pIndex}`)?.click()}
                                      title="Subir PDF/Archivo"
                                      disabled={isUploading}
                                    >
                                      {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                                    </Button>
                                    <Input
                                      type="file"
                                      className="hidden"
                                      id={`upload-revista-${diaIndex}-${pIndex}`}
                                      accept=".pdf,image/*"
                                      onChange={(e) => handleFileUpload(e, { type: "ponente_revista", diaIndex, ponenteIndex: pIndex })}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Multimedia Premium</Label>
                              <div className="flex items-center gap-3">
                                <div className="flex-1 relative">
                                  <Input 
                                    placeholder="URL Fondo Banner" 
                                    value={ponente.fondo_banner || ""} 
                                    onChange={(e) => updateSpeaker(diaIndex, pIndex, "fondo_banner", e.target.value)}
                                    className="h-8 text-[10px] border-none bg-white rounded-lg pr-8"
                                  />
                                  <Button 
                                    size="icon" 
                                    type="button"
                                    className="absolute right-1 top-1 h-6 w-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600"
                                    onClick={() => document.getElementById(`upload-fondo-${diaIndex}-${pIndex}`)?.click()}
                                  >
                                    <Upload className="h-3 w-3" />
                                  </Button>
                                  <Input
                                    type="file"
                                    className="hidden"
                                    id={`upload-fondo-${diaIndex}-${pIndex}`}
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, { type: "ponente_fondo", diaIndex, ponenteIndex: pIndex })}
                                  />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Galería del Ponente (URLs separadas por coma)</Label>
                                <div className="flex items-center gap-2">
                                  <Input 
                                    placeholder="url1, url2, url3..." 
                                    value={Array.isArray(ponente.galeria_fotos) ? ponente.galeria_fotos.join(", ") : ""} 
                                    onChange={(e) => updateSpeaker(diaIndex, pIndex, "galeria_fotos", e.target.value.split(",").map(u => u.trim()).filter(u => u !== ""))}
                                    className="h-8 text-[10px] border-none bg-white rounded-lg flex-1"
                                  />
                                  <div className="relative">
                                    <Button 
                                      size="icon" 
                                      type="button"
                                      className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all border border-slate-200/50"
                                      onClick={() => document.getElementById(`upload-galeria-${diaIndex}-${pIndex}`)?.click()}
                                      title="Añadir a Galería"
                                      disabled={isUploading}
                                    >
                                      {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                                    </Button>
                                    <Input
                                      type="file"
                                      className="hidden"
                                      id={`upload-galeria-${diaIndex}-${pIndex}`}
                                      accept="image/*"
                                      onChange={(e) => handleFileUpload(e, { type: "ponente_galeria", diaIndex, ponenteIndex: pIndex })}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {dia.ponentes.length === 0 && (
                        <div className="md:col-span-2 lg:col-span-3 h-32 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-3xl">
                          <p className="text-xs uppercase font-black tracking-widest">Sin ponentes asignados</p>
                          <Button 
                            variant="link" 
                            type="button"
                            className="text-violet-500 text-xs font-bold"
                            onClick={() => addSpeaker(diaIndex)}
                          >
                            Click para añadir el primero
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {formData.dias.length === 0 && (
                <div className="h-64 flex flex-col items-center justify-center bg-violet-50/20 border-4 border-dashed border-violet-100 rounded-[4rem] text-violet-300 gap-4">
                  <Layout className="h-16 w-16 opacity-20" />
                  <div className="text-center">
                    <p className="font-black uppercase tracking-widest">Tu itinerario está vacío</p>
                    <p className="text-sm">Comienza añadiendo un día para los ponentes</p>
                  </div>
                  <Button 
                    onClick={addDay}
                    type="button"
                    className="bg-violet-600 hover:bg-violet-700 text-white rounded-2xl px-8"
                  >
                    Añadir Primer Día
                  </Button>
                </div>
              )}
            </div>
          </section>
        </div>


        {requiresGeolocation && (
          <div className="xl:col-span-12 p-8 lg:p-12 border-t border-slate-100 bg-white">
            <section className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-900 rounded-2xl shadow-xl shadow-slate-900/20">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Geolocalización</h3>
                    <p className="text-slate-500 text-sm">Precisión física para tus asistentes</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Provincia</Label>
                    <Select
                      value={formData.provincia_id ? formData.provincia_id.toString() : ""}
                      onValueChange={(val) => handleProvinciaChange(val)}
                    >
                      <SelectTrigger className="h-12 bg-slate-50 border-none text-slate-900 font-bold focus:ring-2 focus:ring-blue-600 rounded-xl w-48 transition-all">
                        <SelectValue placeholder="Elegir..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-100 rounded-xl shadow-2xl">
                        {provincias.map((prov: any) => (
                          <SelectItem key={prov.id} value={prov.id.toString()}>{prov.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Ciudad</Label>
                    <Select
                      value={formData.ciudad_id ? formData.ciudad_id.toString() : ""}
                      onValueChange={(val) => updateField("ciudad_id", Number(val))}
                      disabled={!formData.provincia_id}
                    >
                      <SelectTrigger className="h-12 bg-slate-50 border-none text-slate-900 font-bold focus:ring-2 focus:ring-blue-600 rounded-xl w-48 transition-all disabled:opacity-30">
                        <SelectValue placeholder="Elegir..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-100 rounded-xl shadow-2xl">
                        {ciudades.map((ciudad: any) => (
                          <SelectItem key={ciudad.id} value={ciudad.id.toString()}>{ciudad.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 relative group/map rounded-[3rem] overflow-hidden border-8 border-slate-50 shadow-xl bg-white h-[550px]">
                  <LocationMap
                    lat={formData.latitud}
                    lng={formData.longitud}
                    onChange={handleLocationChange}
                  />
                </div>

                <div className="space-y-6 flex flex-col justify-center">
                  <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
                    <Label htmlFor="direccion" className="text-xl font-black text-slate-800 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-600" /> Dirección Exacta
                    </Label>
                    <Textarea
                      id="direccion"
                      placeholder="Ej: Frente al centro comercial, junto a la torre bancaria..."
                      value={formData.direccion || ""}
                      onChange={(e) => updateField("direccion", e.target.value)}
                      className="bg-white border-slate-100 focus:ring-0 focus:border-blue-600 rounded-3xl min-h-[140px] text-lg p-6 shadow-inner leading-relaxed placeholder:text-slate-300"
                      rows={3}
                    />
                  </div>
                  
                  <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white space-y-4 shadow-xl shadow-blue-900/20">
                    <div className="flex items-center gap-3">
                      <Info className="h-5 w-5" />
                      <span className="font-bold uppercase tracking-wider text-xs">Nota de precisión</span>
                    </div>
                    <p className="text-blue-50 text-sm leading-relaxed">
                      La ubicación marcada en el mapa será la que vean los asistentes para calcular su ruta. Asegúrate de que el pin sea exacto.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-4 p-4">
        <Button 
          variant="outline" 
          onClick={() => window.history.back()}
          className="h-14 px-8 rounded-2xl font-bold text-slate-600 border-slate-200 hover:bg-slate-50"
        >
          Cancelar
        </Button>
        <Button 
          onClick={() => save(id)} 
          disabled={isSubmitting}
          className="h-14 px-12 rounded-2xl font-black text-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-900/20 group"
        >
          {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />}
          {id ? `Actualizar ${resourceLabel}` : `Publicar ${resourceLabel}`}
        </Button>
      </div>
    </div>
  )
}

function Info({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
    </svg>
  )
}
