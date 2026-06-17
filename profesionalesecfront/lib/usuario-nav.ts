import {
  BookOpen,
  Calendar,
  CreditCard,
  Home,
  Settings,
  type LucideIcon,
} from "lucide-react"

export type UsuarioNavItem = {
  href: string
  label: string
  icon: LucideIcon
  description?: string
}

export const USUARIO_NAV_ITEMS: UsuarioNavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: Home,
    description: "Resumen general de tu actividad",
  },
  {
    href: "/dashboard/citas",
    label: "Citas",
    icon: Calendar,
    description: "Historial y próximas citas",
  },
  {
    href: "/dashboard/cursos",
    label: "Cursos",
    icon: BookOpen,
    description: "Cursos activos y pendientes",
  },
  {
    href: "/dashboard/certificados",
    label: "Certificados",
    icon: CreditCard,
    description: "Documentos y descargas",
  },
  {
    href: "/dashboard/configuracion",
    label: "Configuración",
    icon: Settings,
    description: "Datos de tu cuenta",
  },
]
