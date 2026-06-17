"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Settings, Loader2, Trash2, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { usuarioApi, profesionalApi, authApi, multimediaApi, removeToken } from "@/lib/api"
import { useProfesional } from "@/context/profesional-context"
import { PROFILE_IMAGE_ACCEPTED_TYPES, PROFILE_IMAGE_MAX_SIZE_BYTES, PROFILE_IMAGE_MAX_SIZE_MB } from "@/constants/profile-upload"

export default function ConfiguracionPage() {
  const { user, perfil, token, loadData, loading } = useProfesional()
  const { toast } = useToast()

  const [perfilForm, setPerfilForm] = useState({
    nombre: "",
    telefono: "",
    foto_url: "",
  })
  const [perfilProfesionalForm, setPerfilProfesionalForm] = useState({
    descripcion: "",
    tarifa: "",
    permitir_reagendar: true,
    banner_url: "",
    modalidad: "",
  })
  const [passwordForm, setPasswordForm] = useState({
    contrasena_actual: "",
    nueva_contrasena: "",
    confirmar_nueva: "",
  })
  const [savingPersonal, setSavingPersonal] = useState(false)
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false)
  const [savingPerfilProfesional, setSavingPerfilProfesional] = useState(false)
  const [uploadingBannerImage, setUploadingBannerImage] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string>("")
  const [profileImageError, setProfileImageError] = useState<string>("")
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null)
  const [bannerImagePreview, setBannerImagePreview] = useState<string>("")
  const [bannerImageError, setBannerImageError] = useState<string>("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setPerfilForm({
      nombre: user?.nombre || "",
      telefono: user?.telefono || "",
      foto_url: user?.foto_url || "",
    })
  }, [user])

  useEffect(() => {
    if (!profileImageFile) return
    const objectUrl = URL.createObjectURL(profileImageFile)
    setProfileImagePreview(objectUrl)
    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [profileImageFile])

  useEffect(() => {
    if (!bannerImageFile) return
    const objectUrl = URL.createObjectURL(bannerImageFile)
    setBannerImagePreview(objectUrl)
    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [bannerImageFile])

  useEffect(() => {
    setPerfilProfesionalForm({
      descripcion: perfil?.descripcion || "",
      tarifa: perfil?.tarifa != null ? String(perfil.tarifa) : "",
      permitir_reagendar: perfil?.permitir_reagendar ?? true,
      banner_url: perfil?.banner_url || "",
      modalidad: perfil?.modalidad || "",
    })
  }, [perfil])

  const handleGuardarDatosPersonales = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    try {
      setSavingPersonal(true)
      setProfileImageError("")

      let fotoUrl = perfilForm.foto_url.trim()

      if (profileImageFile) {
        setUploadingProfileImage(true)
        const uploaded = await multimediaApi.subirFotoPerfil(profileImageFile, token)
        const uploadedUrl = uploaded?.url

        if (!uploadedUrl) {
          throw new Error("No se pudo obtener la URL de la imagen subida")
        }

        fotoUrl = uploadedUrl
      }

      await usuarioApi.actualizarPerfil(
        {
          nombre: perfilForm.nombre.trim(),
          telefono: perfilForm.telefono.trim(),
          foto_url: fotoUrl,
        },
        token,
      )

      setProfileImageFile(null)
      setProfileImagePreview("")

      toast({ title: "Datos personales actualizados" })
      await loadData()
    } catch (error: any) {
      const message = error.message || "No se pudo actualizar"
      setProfileImageError(message)
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setUploadingProfileImage(false)
      setSavingPersonal(false)
    }
  }

  const handleBannerImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setBannerImageError("")

    if (!file) {
      setBannerImageFile(null)
      setBannerImagePreview("")
      return
    }

    if (!PROFILE_IMAGE_ACCEPTED_TYPES.includes(file.type)) {
      setBannerImageFile(null)
      setBannerImagePreview("")
      setBannerImageError("Formato inválido. Usa JPG, PNG o WEBP.")
      return
    }

    if (file.size > PROFILE_IMAGE_MAX_SIZE_BYTES) {
      setBannerImageFile(null)
      setBannerImagePreview("")
      setBannerImageError(`La imagen supera el límite de ${PROFILE_IMAGE_MAX_SIZE_MB}MB.`)
      return
    }

    setBannerImageFile(file)
  }

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setProfileImageError("")

    if (!file) {
      setProfileImageFile(null)
      setProfileImagePreview("")
      return
    }

    if (!PROFILE_IMAGE_ACCEPTED_TYPES.includes(file.type)) {
      setProfileImageFile(null)
      setProfileImagePreview("")
      setProfileImageError("Formato inválido. Usa JPG, PNG o WEBP.")
      return
    }

    if (file.size > PROFILE_IMAGE_MAX_SIZE_BYTES) {
      setProfileImageFile(null)
      setProfileImagePreview("")
      setProfileImageError(`La imagen supera el límite de ${PROFILE_IMAGE_MAX_SIZE_MB}MB.`)
      return
    }

    setProfileImageFile(file)
  }

  const handleGuardarPerfilProfesional = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !perfil?.id) return

    setBannerImageError("")

    const tarifaNormalizada = perfilProfesionalForm.tarifa.trim()
    const tarifaNumero = tarifaNormalizada === "" ? undefined : Number(tarifaNormalizada)
    const tarifa = Number.isFinite(tarifaNumero) ? tarifaNumero : undefined

    if (perfilProfesionalForm.descripcion.length > 80) {
      toast({ title: "Error", description: "Descripción no puede exceder 80 caracteres", variant: "destructive" })
      return
    }

    try {
      setSavingPerfilProfesional(true)

      let bannerUrl = perfilProfesionalForm.banner_url.trim()
      if (bannerImageFile) {
        setUploadingBannerImage(true)
        const uploaded = await multimediaApi.subir(bannerImageFile, "profile-banners", token)
        const uploadedUrl = uploaded?.url

        if (!uploadedUrl) {
          throw new Error("No se pudo obtener la URL del banner subido")
        }

        bannerUrl = uploadedUrl
      }

      await profesionalApi.actualizarPerfil(
        {
          id: perfil.id,
          descripcion: perfilProfesionalForm.descripcion,
          tarifa,
          permitir_reagendar: perfilProfesionalForm.permitir_reagendar,
          banner_url: bannerUrl,
          modalidad: perfilProfesionalForm.modalidad || undefined,
        },
        token,
      )
      setBannerImageFile(null)
      setBannerImagePreview("")
      toast({ title: "Perfil profesional actualizado" })
      await loadData()
    } catch (error: any) {
      const message = error.message || "No se pudo actualizar"
      setBannerImageError(message)
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setUploadingBannerImage(false)
      setSavingPerfilProfesional(false)
    }
  }

  const handleCambiarContrasena = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    if (passwordForm.nueva_contrasena !== passwordForm.confirmar_nueva) {
      toast({ title: "Error", description: "Las contraseñas no coinciden", variant: "destructive" })
      return
    }

    try {
      setSavingPassword(true)
      await authApi.cambiarContrasena(token, {
        contrasena_actual: passwordForm.contrasena_actual,
        nueva_contrasena: passwordForm.nueva_contrasena,
      })
      setPasswordForm({ contrasena_actual: "", nueva_contrasena: "", confirmar_nueva: "" })
      toast({ title: "Contraseña actualizada correctamente" })
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "No se pudo cambiar la contraseña", variant: "destructive" })
    } finally {
      setSavingPassword(false)
    }
  }

  const handleEliminarCuenta = async () => {
    if (!token || deleteConfirmText !== "ELIMINAR") return

    try {
      setDeleting(true)
      await usuarioApi.eliminarCuenta(token)
      removeToken()
      window.location.href = "/"
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "No se pudo eliminar la cuenta", variant: "destructive" })
      setDeleteDialogOpen(false)
      setDeleteConfirmText("")
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5 text-blue-500" /> Datos personales</CardTitle>
          <CardDescription>Edita solo tu información básica de cuenta.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGuardarDatosPersonales} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" value={perfilForm.nombre} onChange={(e) => setPerfilForm((prev) => ({ ...prev, nombre: e.target.value }))} required />
            </div>
            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" value={perfilForm.telefono} onChange={(e) => setPerfilForm((prev) => ({ ...prev, telefono: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="foto">Foto de perfil</Label>
              <div className="mt-2 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={profileImagePreview || perfilForm.foto_url || "/logo-icono.png"}
                    alt="Vista previa foto de perfil"
                    className="h-16 w-16 rounded-full object-cover border"
                  />
                  <div className="text-sm text-muted-foreground">
                    <p>Sube una nueva imagen (JPG, PNG o WEBP).</p>
                    <p>Tamaño máximo: {PROFILE_IMAGE_MAX_SIZE_MB}MB.</p>
                  </div>
                </div>
                <Input id="foto" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleProfileImageChange} />
                {profileImageError ? <p className="text-sm text-red-600">{profileImageError}</p> : null}
              </div>
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={savingPersonal || uploadingProfileImage}>
                {uploadingProfileImage ? "Subiendo imagen..." : savingPersonal ? "Guardando..." : "Guardar datos personales"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle>Perfil profesional activo</CardTitle>
          <CardDescription>Edita descripción, tarifa y reagendamiento del perfil seleccionado.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGuardarPerfilProfesional} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="descripcion">Descripción (máximo 80 caracteres)</Label>
              <textarea id="descripcion" maxLength={80} className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm" value={perfilProfesionalForm.descripcion} onChange={(e) => setPerfilProfesionalForm((prev) => ({ ...prev, descripcion: e.target.value }))} />
              <p className="text-xs text-muted-foreground mt-1">{perfilProfesionalForm.descripcion.length}/80 caracteres</p>
            </div>
            <div>
              <Label htmlFor="tarifa">Tarifa</Label>
              <Input id="tarifa" type="number" min="0" step="0.01" value={perfilProfesionalForm.tarifa} onChange={(e) => setPerfilProfesionalForm((prev) => ({ ...prev, tarifa: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="modalidad">Modalidad de trabajo</Label>
              <select id="modalidad" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={perfilProfesionalForm.modalidad} onChange={(e) => setPerfilProfesionalForm((prev) => ({ ...prev, modalidad: e.target.value }))}>
                <option value="">Selecciona una modalidad</option>
                <option value="Presencial">Presencial</option>
                <option value="Virtual">Virtual</option>
                <option value="Ambas modalidades">Híbrido</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <input id="permitir_reagendar" type="checkbox" checked={perfilProfesionalForm.permitir_reagendar} onChange={(e) => setPerfilProfesionalForm((prev) => ({ ...prev, permitir_reagendar: e.target.checked }))} />
              <Label htmlFor="permitir_reagendar">Permitir reagendamiento</Label>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="banner">Banner del perfil</Label>
              <div className="mt-2 flex flex-col gap-3">
                <div className="overflow-hidden rounded-2xl border bg-muted/20">
                  <img
                    src={bannerImagePreview || perfilProfesionalForm.banner_url || "/placeholder.svg?height=240&width=1200"}
                    alt="Vista previa banner del perfil"
                    className="h-40 w-full object-cover"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Sube una imagen horizontal para destacar tu perfil público.</p>
                  <p>Tamaño máximo: {PROFILE_IMAGE_MAX_SIZE_MB}MB.</p>
                </div>
                <Input id="banner" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleBannerImageChange} />
                {bannerImageError ? <p className="text-sm text-red-600">{bannerImageError}</p> : null}
              </div>
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={savingPerfilProfesional || uploadingBannerImage || !perfil?.id}>{uploadingBannerImage ? "Subiendo banner..." : savingPerfilProfesional ? "Guardando..." : "Guardar perfil profesional"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle>Cambiar contraseña</CardTitle>
          <CardDescription>Debes ingresar tu contraseña actual.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCambiarContrasena} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="actual">Contraseña actual</Label>
              <Input id="actual" type="password" value={passwordForm.contrasena_actual} onChange={(e) => setPasswordForm((prev) => ({ ...prev, contrasena_actual: e.target.value }))} required />
            </div>
            <div>
              <Label htmlFor="nueva">Nueva contraseña</Label>
              <Input id="nueva" type="password" value={passwordForm.nueva_contrasena} onChange={(e) => setPasswordForm((prev) => ({ ...prev, nueva_contrasena: e.target.value }))} required />
            </div>
            <div>
              <Label htmlFor="confirmar">Confirmar nueva contraseña</Label>
              <Input id="confirmar" type="password" value={passwordForm.confirmar_nueva} onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmar_nueva: e.target.value }))} required />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={savingPassword}>{savingPassword ? "Actualizando..." : "Actualizar contraseña"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Zona de peligro
          </CardTitle>
          <CardDescription>
            Una vez eliminada tu cuenta, no hay vuelta atrás. Todos tus datos serán borrados permanentemente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={deleteDialogOpen} onOpenChange={(open) => { setDeleteDialogOpen(open); if (!open) setDeleteConfirmText("") }}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Eliminar mi cuenta
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-red-600 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Eliminar cuenta permanentemente
                </DialogTitle>
                <DialogDescription className="text-left pt-2">
                  Esta acción es <strong>irreversible</strong>. Se eliminará tu perfil profesional, todos tus datos
                  (citas, servicios, artículos, pagos, etc.) y tu cuenta de usuario.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <p className="text-sm font-medium">
                  Escribe <span className="font-mono bg-red-50 text-red-700 px-1.5 py-0.5 rounded border border-red-200">ELIMINAR</span> para confirmar:
                </p>
                <Input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="ELIMINAR"
                  className="font-mono"
                />
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => { setDeleteDialogOpen(false); setDeleteConfirmText("") }} disabled={deleting}>
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  disabled={deleteConfirmText !== "ELIMINAR" || deleting}
                  onClick={handleEliminarCuenta}
                >
                  {deleting ? "Eliminando..." : "Sí, eliminar mi cuenta"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}
