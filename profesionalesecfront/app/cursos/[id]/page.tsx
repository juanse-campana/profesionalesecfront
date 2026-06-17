"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { ponenciasApi } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import EventHero from "@/components/ponencia-detail/hero"
import EventStats from "@/components/ponencia-detail/stats"
import EventJustification from "@/components/ponencia-detail/justification"
import MagazineBanner from "@/components/ponencia-detail/magazine-banner"
import EventItinerary from "@/components/ponencia-detail/itinerary"
import EventPedagogy from "@/components/ponencia-detail/pedagogy"
import EventMultimedia from "@/components/ponencia-detail/multimedia"
import EventRegistration from "@/components/ponencia-detail/registration"

export default function CursoDetallePage() {
  const params = useParams()
  const slug = params.id as string
  const [ponencia, setPonencia] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const found = await ponenciasApi.obtener(slug, "/cursos")
        if (found) setPonencia(found)
        else setError("No se encontró el curso.")
      } catch {
        setError("No se pudo cargar el curso.")
      } finally {
        setLoading(false)
      }
    }
    if (slug) load()
  }, [slug])

  const renderSection = (sectionName: string) => {
    switch (sectionName) {
      case "hero": return <EventHero key="hero" ponencia={ponencia} loading={loading} error={error} backHref="/cursos" resourceLabel="Curso" />
      case "stats": return <EventStats key="stats" ponencia={ponencia} loading={loading} />
      case "justification": return <EventJustification key="justification" ponencia={ponencia} loading={loading} />
      case "magazine": return <MagazineBanner key="magazine" ponencia={ponencia} loading={loading} />
      case "itinerary": return <EventItinerary key="itinerary" ponencia={ponencia} loading={loading} resourceLabel="CURSO" speakerBasePath="/cursos" />
      case "pedagogy": return <EventPedagogy key="pedagogy" ponencia={ponencia} loading={loading} />
      case "multimedia": return <EventMultimedia key="multimedia" ponencia={ponencia} loading={loading} />
      case "registration": return <EventRegistration key="registration" ponencia={ponencia} loading={loading} />
      default: return null
    }
  }

  const layoutOrder = ponencia?.config_visual?.order || ["hero", "stats", "justification", "magazine", "itinerary", "pedagogy", "multimedia", "registration"]

  return (
    <main className="min-h-screen bg-white font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <Header />
      <AnimatePresence mode="wait">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
          {layoutOrder.map((section: string) => renderSection(section))}
        </motion.div>
      </AnimatePresence>
      <Footer />
    </main>
  )
}
