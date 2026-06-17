import Link from "next/link"
import { ArrowRight, Calendar, CreditCard, BookOpen, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const cards = [
  {
    href: "/dashboard/citas",
    title: "Gestiona tus citas",
    description: "Consulta tus próximas reservas y revisa el historial de atenciones desde un solo lugar.",
    icon: Calendar,
  },
  {
    href: "/dashboard/cursos",
    title: "Sigue tus cursos",
    description: "Accede a tus cursos activos, pendientes o con pago pendiente dentro de tu portal.",
    icon: BookOpen,
  },
  {
    href: "/dashboard/certificados",
    title: "Tus certificados",
    description: "Encuentra los certificados emitidos y prepara tus próximas descargas desde el portal.",
    icon: CreditCard,
  },
]

export default function UsuarioDashboardPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Portal usuario</p>
            <h1 className="mt-3 text-4xl font-bold text-slate-900">Tu dashboard ya está listo</h1>
            <p className="mt-3 max-w-2xl text-base text-slate-600">
              Este es el punto de entrada del nuevo portal autenticado para usuarios normales. En el siguiente batch se conectarán las vistas funcionales completas.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            <Sparkles className="h-4 w-4" />
            Navegación inicial habilitada
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.href} className="border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <CardHeader className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl text-slate-900">{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-slate-600">{card.description}</p>
                <Link href={card.href} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700">
                  Ir al módulo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </section>
    </div>
  )
}
