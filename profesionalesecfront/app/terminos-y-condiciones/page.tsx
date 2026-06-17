"use client"

import { useEffect, useState } from "react"
import Footer from "@/components/footer"
import Header from "@/components/header"
import { TermsRenderer } from "@/components/legal/terms-renderer"
import { cmsLegalApi, defaultTermsAndConditionsContent, type TermsAndConditionsContent } from "@/lib/cms-legal"

export default function TerminosYCondicionesPage() {
  const [content, setContent] = useState<TermsAndConditionsContent>(defaultTermsAndConditionsContent)

  useEffect(() => {
    let mounted = true

    cmsLegalApi
      .getTermsAndConditions()
      .then((data) => {
        if (mounted && data) setContent(data)
      })
      .catch((error) => {
        console.error("No se pudieron cargar los términos desde CMS Legal:", error)
      })

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />
      <main className="px-4 pb-16 pt-24">
        <TermsRenderer content={content} />
      </main>
      <Footer />
    </div>
  )
}
