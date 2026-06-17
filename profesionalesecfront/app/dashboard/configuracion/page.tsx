"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertCircle, Camera, Loader2, Save, Sparkles } from "lucide-react"
import { multimediaApi, usuarioPortalApi, type UsuarioPortalConfiguracion } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

const formatDate = (value?: string | null) => {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toLocaleDateString("es-EC", { dateStyle: "medium" })
}

export default function UsuarioConfiguracionPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingAcademicName, setSavingAcademicName] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [config, setConfig] = useState<UsuarioPortalConfiguracion | null>(null)
  const [profileForm, setProfileForm] = useState({ nombre: "", telefono: "", foto_url: "" })
  const [academicName, setAcademicName] = useState("")

  const loadConfiguracion = async () => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const data = await usuarioPortalApi.obtenerConfiguracion(token)
      setConfig(data)
      setProfileForm({
        nombre: data.usuario?.nombre || "",
        telefono: data.usuario?.telefono || "",
        foto_url: data.usuario?.foto_url || "",
      })
      setAcademicName(data.usuario?.academic_name || "")
    } catch (error: any) {
      toast({ title: "No se pudo cargar tu configuración", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConfiguracion()
  }, [])

  const lockMessage = useMemo(() => {
    if (!config?.academic_name_locked) return null
    if (config.academic_name_days_remaining > 0) {
      return `Podrás volver a actualizar tu nombre académico en ${config.academic_name_days_remaining} día(s).`
    }
    const nextDate = formatDate(config?.academic_name_next_available_at)
    return nextDate ? `Podrás volver a actualizarlo desde ${nextDate}.` : null
  }, [config])

  const handleProfileSave = async () => {
    const token = localStorage.getItem("auth_token")
    if (!token) return
    setSavingProfile(true)
    try {
      const data = await usuarioPortalApi.actualizarConfiguracion(profileForm, token)
      setConfig(data)
      setProfileForm({
        nombre: data.usuario?.nombre || "",
        telefono: data.usuario?.telefono || "",
        foto_url: data.usuario?.foto_url || "",
      })
      toast({ title: "Configuración actualizada", description: "Tus datos principales fueron guardados correctamente." })
    } catch (error: any) {
      toast({ title: "No se pudo guardar la configuración", description: error.message, variant: "destructive" })
    } finally {
      setSavingProfile(false)
    }
  }

  const handleAcademicNameSave = async () => {
    const token = localStorage.getItem("auth_token")
    if (!token) return
    setSavingAcademicName(true)
    try {
      const data = await usuarioPortalApi.actualizarAcademicName(academicName, token)
      setConfig(data)
      setAcademicName(data.usuario?.academic_name || "")
      toast({ title: "Nombre académico actualizado", description: "Tu nombre académico fue guardado correctamente." })
    } catch (error: any) {
      if (error?.message) {
        toast({ title: "No se pudo actualizar el nombre académico", description: error.message, variant: "destructive" })
      }
      await loadConfiguracion()
    } finally {
      setSavingAcademicName(false)
    }
  }

  const handlePhotoUpload = async (file?: File | null) => {
    const token = localStorage.getItem("auth_token")
    if (!token || !file) return
    setUploadingPhoto(true)
    try {
      const uploaded = await multimediaApi.subirFotoPerfil(file, token)
      setProfileForm((prev) => ({ ...prev, foto_url: uploaded.url }))
      toast({ title: "Foto subida", description: "La imagen fue cargada. Guarda los cambios para aplicarla a tu perfil." })
    } catch (error: any) {
      toast({ title: "No se pudo subir la foto", description: error.message, variant: "destructive" })
    } finally {
      setUploadingPhoto(false)
    }
  }

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Configuración</h1>
        <p className="text-slate-600">Administra tu información visible dentro del portal de usuario.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Datos principales</CardTitle>
            <CardDescription>Actualiza tu nombre, teléfono y foto de perfil.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <img
                src={profileForm.foto_url || "/logo-icono.png"}
                alt="Foto de perfil"
                className="h-24 w-24 rounded-full border border-slate-200 object-cover"
              />
              <div className="space-y-3">
                <input
                  id="user-profile-photo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => handlePhotoUpload(event.target.files?.[0] || null)}
                />
                <Button type="button" variant="outline" onClick={() => document.getElementById("user-profile-photo")?.click()} disabled={uploadingPhoto}>
                  {uploadingPhoto ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                  Subir foto
                </Button>
                <p className="text-xs text-slate-500">Puedes pegar también una URL manualmente si lo prefieres.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="usuario-nombre">Nombre completo</Label>
                <Input id="usuario-nombre" value={profileForm.nombre} onChange={(e) => setProfileForm((prev) => ({ ...prev, nombre: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="usuario-telefono">Teléfono</Label>
                <Input id="usuario-telefono" value={profileForm.telefono} onChange={(e) => setProfileForm((prev) => ({ ...prev, telefono: e.target.value }))} placeholder="0991234567" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="usuario-foto-url">URL de foto</Label>
              <Input id="usuario-foto-url" value={profileForm.foto_url} onChange={(e) => setProfileForm((prev) => ({ ...prev, foto_url: e.target.value }))} placeholder="https://..." />
            </div>

            <div className="flex justify-end">
              <Button type="button" onClick={handleProfileSave} disabled={savingProfile || uploadingPhoto} className="bg-blue-600 text-white hover:bg-blue-700">
                {savingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Guardar cambios
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-blue-600" /> Nombre académico</CardTitle>
              <CardDescription>Este es el nombre con el que se emitiran los certificados que apruebes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {config?.academic_name_locked ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <div className="space-y-1">
                      <p className="font-semibold">Cambio temporalmente bloqueado</p>
                      <p className="text-sm text-amber-800">{lockMessage || `Solo puedes cambiarlo una vez cada ${config?.academic_name_lock_days || 60} días.`}</p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="usuario-academic-name">Nombre académico</Label>
                <Input
                  id="usuario-academic-name"
                  value={academicName}
                  onChange={(e) => setAcademicName(e.target.value)}
                  placeholder="Ej: Dr. Juan Pérez"
                  disabled={Boolean(config?.academic_name_locked)}
                />
              </div>

              <div className="space-y-1 text-sm text-slate-500">
                <p><span className="font-medium text-slate-700">Correo:</span> {config?.usuario?.correo || "No disponible"}</p>
                <p><span className="font-medium text-slate-700">Última actualización:</span> {formatDate(config?.usuario?.academic_name_updated_at) || "Sin cambios previos"}</p>
              </div>

              <Button type="button" onClick={handleAcademicNameSave} disabled={savingAcademicName || Boolean(config?.academic_name_locked)} className="w-full bg-blue-600 text-white hover:bg-blue-700">
                {savingAcademicName ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Guardar nombre académico
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
