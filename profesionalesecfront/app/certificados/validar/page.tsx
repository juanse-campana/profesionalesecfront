import Header from "@/components/header"
import Footer from "@/components/footer"
import { Suspense } from "react"
import CertificateValidationPanel from "@/components/certificates/certificate-validation-panel"

export default function CertificateValidationPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="px-6 py-16 pt-28">
        <div className="mx-auto mb-10 max-w-4xl text-center">
        <h1 className="text-4xl font-black tracking-tight text-slate-900">Validación de certificados</h1>
        <p className="mt-3 text-slate-600">
          Consulta el estado y la autenticidad de cualquier certificado emitido por Profesionales.ec.
        </p>
      </div>
        <Suspense fallback={<div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500 shadow-sm">Cargando validador...</div>}><CertificateValidationPanel /></Suspense>
      </main>
      <Footer />
    </div>
  )
}
