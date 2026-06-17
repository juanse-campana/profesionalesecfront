"use client"

import { useEffect, useState } from "react"
import Footer from "@/components/footer"
import Header from "@/components/header"
import { AboutRenderer } from "@/components/legal/about-renderer"
import { cmsLegalApi, defaultAboutUsContent, type AboutUsContent } from "@/lib/cms-legal"

export default function SobreNosotrosPage() {
  const [content, setContent] = useState<AboutUsContent>(defaultAboutUsContent)

  useEffect(() => {
    let mounted = true

    cmsLegalApi
      .getAboutUs()
      .then((data) => {
        if (mounted && data) setContent(data)
      })
      .catch((error) => {
        console.error("No se pudo cargar Sobre Nosotros desde CMS Legal:", error)
      })

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />
      <main className="px-4 pb-16 pt-24">
        <AboutRenderer content={content} />
      </main>
      <Footer />
    </div>
  )
}
