"use client"

import React, { useState, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { MapPin, ArrowRight, MessageSquare, Users, Award } from "lucide-react"
import Link from "next/link"
import { usePonencias } from "@/hooks/use-ponencias"
import { SpeakerAvatars } from "@/components/shared/speaker-avatars"
import { EventCardSkeleton } from "@/components/shared/event-card-skeleton"
import CommunityCTA from "@/components/shared/community-cta"
import { motion, AnimatePresence } from "framer-motion"
import { formatUrl } from "@/lib/utils"

export default function EducacionPage() {
  const { ponencias, loading, error } = usePonencias({ routePrefix: "/conversatorios", errorLabel: "conversatorios" })

  const now = new Date()
  const proximos = ponencias.filter(p => new Date(p.fecha_inicio) >= now)
  const realizados = ponencias.filter(p => new Date(p.fecha_inicio) < now)

  return (
    <main className="min-h-screen bg-white font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.1),transparent_70%)]" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="text-5xl sm:text-7xl md:text-9xl font-black text-white mb-6 tracking-tighter leading-[0.8] uppercase">
              EDUCACIÓN
            </h1>
            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto font-light leading-relaxed">
              Impulsa tu <span className="text-white font-medium">prestigio profesional</span> con espacios de conocimiento de alto impacto.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-10 md:py-20 space-y-16 md:space-y-32">
        
        {/* 1. Próximos Conversatorios */}
        <section>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-2 uppercase">PRÓXIMOS CONVERSATORIOS</h2>
              <div className="h-1 w-12 bg-emerald-500 rounded-full" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => <EventCardSkeleton key={i} />)}
              </div>
            ) : error ? (
              <div className="p-12 bg-red-50 rounded-3xl border border-red-100 text-center text-red-500 font-bold">
                {error}
              </div>
            ) : proximos.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {proximos.map((evento) => (
                  <Link 
                    href={evento.slug ? `/conversatorios/${evento.slug}` : "#"}
                    key={evento.id}
                    className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:border-emerald-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/5 flex flex-col"
                  >
                    <div className="aspect-[16/10] relative overflow-hidden bg-gray-50">
                      <img 
                        src={formatUrl(evento.imagen_banner) || "/images/event-placeholder.jpg"} 
                        alt={evento.titulo}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                    
                    <div className="p-8 flex flex-col grow">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded">
                          {new Date(evento.fecha_inicio).toLocaleDateString('es-EC', { month: 'short', year: 'numeric' })}
                        </span>
                        <div className="flex items-center gap-1.5 text-gray-300 text-[10px] font-bold">
                          <MapPin className="w-3 h-3" />
                          <span>{evento.ciudad?.nombre || "NACIONAL"}</span>
                        </div>
                      </div>

                      <h3 className="text-2xl font-black text-gray-900 leading-[1.1] mb-2 group-hover:text-emerald-600 transition-colors tracking-tight">
                        {evento.titulo}
                      </h3>
                      <p className="text-xs text-gray-400 font-medium mb-6 line-clamp-2 leading-relaxed">
                        {evento.subtitulo || evento.descripcion}
                      </p>

                      <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                        <SpeakerAvatars speakers={(evento as any).PonenciaPonentes?.map((pp: any) => pp.Usuario) || []} />
                        <ArrowRight className="w-5 h-5 text-emerald-500" />
                      </div>
                    </div>
                  </Link>
                ))}
              </motion.div>
            ) : (
              <p className="text-center py-20 text-gray-400 font-light italic bg-gray-50 rounded-[2rem]">No hay próximos conversatorios programados.</p>
            )}
          </AnimatePresence>
        </section>

        {/* 2. Conversatorios Realizados */}
        <section>
          <div className="mb-12">
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-2 uppercase">CONVERSATORIOS REALIZADOS</h2>
            <div className="h-1 w-12 bg-gray-200 rounded-full" />
          </div>

          {!loading && realizados.length > 0 ? (
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
              {realizados.map((evento) => (
                <Link href={evento.slug ? `/conversatorios/${evento.slug}` : "#"} key={evento.id} className="group block">
                  <div className="aspect-video rounded-3xl overflow-hidden bg-gray-100 mb-4 border border-gray-100 grayscale hover:grayscale-0 transition-all duration-500">
                    <img src={formatUrl(evento.imagen_banner) || "/images/event-placeholder.jpg"} alt={evento.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <span className="text-gray-300 text-[10px] font-black tracking-widest mb-1 block uppercase">{new Date(evento.fecha_inicio).getFullYear()}</span>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight leading-tight group-hover:text-emerald-500 transition-colors uppercase">{evento.titulo}</h3>
                </Link>
              ))}
            </div>
          ) : !loading && (
            <p className="text-gray-300 font-medium italic">Aún no hay conversatorios realizados disponibles.</p>
          )}
        </section>

        {/* 3. Se parte de Profesionales.ec */}
        <CommunityCTA />

      </div>

      <Footer />
    </main>
  )
}
