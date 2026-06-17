import Header from "@/components/header"
import Footer from "@/components/footer"
import CertificateValidationPanel from "@/components/certificates/certificate-validation-panel"

export default async function CertificateValidationByIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="px-6 py-16 pt-28">
        <div className="mx-auto mb-10 max-w-4xl text-center">
        <h1 className="text-4xl font-black tracking-tight text-slate-900">Validación de certificados</h1>
        <p className="mt-3 text-slate-600">Consulta el estado y la autenticidad del certificado solicitado.</p>
      </div>
        <CertificateValidationPanel initialId={id} />
      </main>
      <Footer />
    </div>
  )
}
