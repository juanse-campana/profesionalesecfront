"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Award, BadgeDollarSign, Building2, CreditCard, Loader2, Upload, Wallet } from "lucide-react"
import { bankAccountsApi, certificadosApi, profesionalApi, type BankAccount, type CertificateRequestPayload } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface CertificateRequestDialogProps {
  scope?: "conversatorio"
  ponenciaId: number
  eventTitle: string
  eventDate?: string | null
  defaultCost?: number
  triggerLabel?: string
  triggerClassName?: string
  fullWidth?: boolean
  resourceLabel?: string
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0)

const formatBankLabel = (account: BankAccount) => `${account.bank_name} · ${account.account_type}`
const CHECKOUT_CONTEXT_STORAGE_KEY = "payphone_certificate_checkout_context"

export default function CertificateRequestDialog({
  scope = "conversatorio",
  ponenciaId,
  eventTitle,
  eventDate,
  defaultCost = 0,
  triggerLabel,
  triggerClassName,
  fullWidth = false,
  resourceLabel = "Conversatorio",
}: CertificateRequestDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [bankAccountsLoading, setBankAccountsLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"gratuito" | "payphone" | "transferencia">(
    defaultCost > 0 ? "transferencia" : "gratuito",
  )
  const [proofFile, setProofFile] = useState<File | null>(null)

  const cost = useMemo(() => {
    const normalized = Number(defaultCost)
    return Number.isFinite(normalized) && normalized > 0 ? normalized : 0
  }, [defaultCost])

  useEffect(() => {
    if (!open || cost <= 0 || paymentMethod !== "transferencia") return

    let active = true
    setBankAccountsLoading(true)

    bankAccountsApi
      .listPublic()
      .then((accounts) => {
        if (active) setBankAccounts(Array.isArray(accounts) ? accounts : [])
      })
      .catch((error) => {
        if (!active) return
        toast({
          title: "No se pudieron cargar las cuentas bancarias",
          description: error.message || "Intenta nuevamente en unos segundos.",
          variant: "destructive",
        })
      })
      .finally(() => {
        if (active) setBankAccountsLoading(false)
      })

    return () => {
      active = false
    }
  }, [open, cost, paymentMethod, toast])

  const ensureToken = () => {
    if (typeof window === "undefined") return null
    const token = localStorage.getItem("auth_token")
    if (!token) {
      toast({
        title: "Debes iniciar sesión",
        description: "Inicia sesión para solicitar y pagar tu certificado.",
        variant: "destructive",
      })
      setOpen(false)
      router.push("/login")
      return null
    }
    return token
  }

  const handleSubmit = async () => {
    const token = ensureToken()
    if (!token) return

    setSubmitting(true)

    try {
      let comprobantePagoUrl: string | null = null

      if (cost > 0 && paymentMethod === "transferencia") {
        if (!proofFile) {
          throw new Error("Debes subir el comprobante de pago para continuar.")
        }

        setUploading(true)
        const uploaded = await profesionalApi.subirComprobantePago(proofFile)
        comprobantePagoUrl = uploaded?.url || null
        setUploading(false)
      }

      if (cost > 0 && paymentMethod === "payphone") {
        const origin = typeof window !== "undefined" ? window.location.origin : ""
        const resultUrl = origin ? `${origin}/payphone/certificados/resultado` : undefined
        const cancellationUrl = typeof window !== "undefined" ? window.location.href : undefined

        const prepareResponse = await certificadosApi.preparePayPhoneCheckout(
          {
            scope,
            ponencia_id: ponenciaId,
            costo: cost,
            responseUrl: resultUrl,
            cancellationUrl,
            reference: `certificado-conversatorio-${ponenciaId}`,
          },
          token,
        )

        const checkoutUrl = prepareResponse.checkout.checkoutUrl || prepareResponse.checkout.payWithCard || prepareResponse.checkout.payWithPayPhone
        if (!checkoutUrl) {
          throw new Error("PayPhone no devolvió una URL de checkout para el certificado.")
        }

        window.localStorage.setItem(
          CHECKOUT_CONTEXT_STORAGE_KEY,
          JSON.stringify({
            clientTransactionId: prepareResponse.checkout.clientTransactionId,
          }),
        )

        toast({
          title: "Redirigiendo a PayPhone",
          description: "Te llevaremos al checkout seguro para completar el pago del certificado.",
        })

        window.location.href = checkoutUrl
        return
      }

      const payload: CertificateRequestPayload = {
        scope,
        ponencia_id: ponenciaId,
        payment_method: cost > 0 ? paymentMethod : "gratuito",
        costo: cost,
        comprobante_pago_url: comprobantePagoUrl,
        metadata: {
          requested_from: "conversatorio_public_page",
          event_title: eventTitle,
          event_date: eventDate || null,
        },
      }

      const created = await certificadosApi.solicitar(payload, token)

      toast({
        title: created.status === "emitido" ? "Certificado emitido" : "Solicitud registrada",
        description:
          created.status === "emitido"
            ? "Tu certificado ya está emitido y podrás verlo en tu dashboard profesional."
            : created.status === "en_revision"
              ? "Tu comprobante fue enviado y el certificado quedó en revisión administrativa."
              : "La solicitud del certificado fue registrada correctamente.",
      })

      setOpen(false)
      setProofFile(null)
      setPaymentMethod(cost > 0 ? "transferencia" : "gratuito")
      router.push("/dashboard/profesional/certificados")
    } catch (error: any) {
      toast({
        title: "No se pudo solicitar el certificado",
        description: error.message || "Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
      setUploading(false)
    }
  }

  const currentTriggerLabel = triggerLabel || "Obtener certificado"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={cn(fullWidth && "w-full", triggerClassName)}>
          <Award className="mr-2 h-4 w-4" />
          {currentTriggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-600" />
            Solicitar certificado
          </DialogTitle>
          <DialogDescription>
            Emite tu certificado del evento completo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="border-emerald-100 bg-emerald-50/60">
            <CardContent className="space-y-3 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{eventTitle}</p>
                  {eventDate ? <p className="text-xs text-slate-600">{eventDate}</p> : null}
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="mb-1">
                    {resourceLabel}
                  </Badge>
                  <p className="text-sm font-semibold text-emerald-700">{cost > 0 ? formatCurrency(cost) : "Gratuito"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {cost > 0 ? (
            <div className="space-y-4 rounded-xl border bg-white p-4">
              <div className="space-y-2">
                <Label>Método de pago</Label>
                <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transferencia">Transferencia bancaria</SelectItem>
                    <SelectItem value="payphone">PayPhone</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentMethod === "transferencia" ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Building2 className="h-4 w-4 text-emerald-600" />
                      Cuentas bancarias disponibles
                    </div>

                    {bankAccountsLoading ? (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Loader2 className="h-4 w-4 animate-spin" /> Cargando cuentas bancarias...
                      </div>
                    ) : bankAccounts.length > 0 ? (
                      <div className="space-y-3">
                        {bankAccounts.map((account) => (
                          <div key={account.id} className="rounded-lg border bg-white p-3 text-sm">
                            <div className="mb-1 flex items-center gap-2 font-semibold text-slate-900">
                              <Wallet className="h-4 w-4 text-emerald-600" />
                              {formatBankLabel(account)}
                            </div>
                            <p><span className="font-medium">Titular:</span> {account.holder_name}</p>
                            <p><span className="font-medium">Identificación:</span> {account.holder_identifier}</p>
                            <p><span className="font-medium">Cuenta:</span> {account.account_number}</p>
                            {account.email ? <p><span className="font-medium">Email:</span> {account.email}</p> : null}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-600">No hay cuentas bancarias activas disponibles.</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="certificate-proof">Comprobante de pago</Label>
                    <label
                      htmlFor="certificate-proof"
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-600 transition hover:border-emerald-400 hover:bg-emerald-50"
                    >
                      <Upload className="h-4 w-4" />
                      {proofFile ? proofFile.name : "Subir imagen o PDF del comprobante"}
                    </label>
                    <input
                      id="certificate-proof"
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={(event) => setProofFile(event.target.files?.[0] || null)}
                    />
                    <p className="text-xs text-slate-500">
                      Tu solicitud quedará en revisión hasta que un administrador apruebe la transferencia.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
              Este certificado no tiene costo. Al solicitarlo quedará registrado y podrá emitirse automáticamente cuando corresponda.
            </div>
          )}

          <div className="rounded-xl border bg-slate-50 p-4 text-sm text-slate-600">
            <div className="mb-2 flex items-center gap-2 font-medium text-slate-900">
              <CreditCard className="h-4 w-4 text-emerald-600" />
              Estado esperado
            </div>
            <p>
              {cost > 0
                ? paymentMethod === "payphone"
                  ? "Con PayPhone el certificado se emitirá automáticamente cuando el pago sea aprobado por el gateway."
                  : "Con transferencia el certificado pasa a revisión manual y recibirás una notificación por correo cuando sea aprobado o rechazado."
                : "Recibirás una notificación por correo cuando el certificado esté emitido."}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting || uploading}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={submitting || uploading || (cost > 0 && paymentMethod === "transferencia" && bankAccounts.length === 0)}>
            {submitting || uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BadgeDollarSign className="mr-2 h-4 w-4" />}
            {cost > 0 ? "Enviar solicitud" : "Solicitar certificado"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
