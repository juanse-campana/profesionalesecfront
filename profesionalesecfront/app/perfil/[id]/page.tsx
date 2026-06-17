import type { Metadata } from "next"
import { profesionalApi } from "@/lib/api"
import { formatUrl } from "@/lib/utils"
import ProfessionalProfileClient from "./professional-profile-client"

interface PageProps {
  params: Promise<{ id: string }>
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://profesionales.ec"

function toAbsoluteUrl(url: string): string {
  if (url.startsWith("http")) return url
  return new URL(url, SITE_URL).toString()
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params

  try {
    const professional = await profesionalApi.obtenerPublico(id)

    if (!professional) {
      return {}
    }

    const name = professional?.usuario?.nombre || "Profesional"
    const profession = professional?.profesion?.nombre || "Profesional"
    const specialty = professional?.especialidad?.nombre
    const imageUrl = formatUrl(professional?.banner_url) || formatUrl(professional?.usuario?.foto_url) || "/logo-black.png"
    const ogImage = toAbsoluteUrl(imageUrl)
    const profileUrl = `${SITE_URL}/perfil/${id}`

    const description = specialty
      ? `${name} es ${profession} especializado/a en ${specialty}. Conoce su perfil en Profesionales.EC.`
      : `${name} es ${profession}. Conoce su perfil en Profesionales.EC.`

    const title = `${name} | ${profession} | Profesionales.EC`

    return {
      title,
      description,
      alternates: {
        canonical: profileUrl,
      },
      openGraph: {
        title,
        description,
        url: profileUrl,
        type: "profile",
        siteName: "Profesionales.EC",
        images: [
          {
            url: ogImage,
            alt: name,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImage],
      },
    }
  } catch {
    return {}
  }
}

export default async function ProfessionalProfilePage({ params }: PageProps) {
  const { id } = await params
  return <ProfessionalProfileClient profileId={id} />
}
