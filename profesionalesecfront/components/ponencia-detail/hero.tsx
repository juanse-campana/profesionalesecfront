"use client"

import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import CertificateRequestDialog from "@/components/certificates/certificate-request-dialog"
import Link from "next/link"
import { UI_MESSAGES } from "@/constants/ponencias"

interface HeroProps {
    ponencia: any
    loading: boolean
    error: string
    backHref?: string
    backLabel?: string
    resourceLabel?: string
}

export default function EventHero({ ponencia, loading, error, backHref = "/conversatorios", backLabel = UI_MESSAGES.backToEducation, resourceLabel = "Conversatorio" }: HeroProps) {
    if (loading) {
        return (
            <section className="relative pt-24 pb-12 px-6 overflow-hidden bg-black">
                <div className="max-w-7xl mx-auto py-20 text-center">
                    <motion.div 
                        animate={{ opacity: [0.4, 1, 0.4] }} 
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-emerald-500 text-sm font-black tracking-widest uppercase"
                    >
                        {UI_MESSAGES.loading}
                    </motion.div>
                </div>
            </section>
        )
    }

    if (error) {
        return (
            <section className="relative pt-24 pb-12 px-6 overflow-hidden bg-black">
                <div className="max-w-7xl mx-auto py-20 text-center">
                    <p className="text-red-400 text-sm font-medium bg-red-500/10 inline-block px-6 py-2 rounded-full border border-red-500/20">{error}</p>
                </div>
            </section>
        )
    }

    if (!ponencia) return null

    const isFuturo = new Date(ponencia.fecha_inicio) >= new Date()

    return (
        <section className="relative pt-32 pb-8 px-6 overflow-hidden bg-white border-b border-gray-100">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.05),transparent_70%)] opacity-100" />
            <div className="max-w-7xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-10"
                >
                    <Link
                        href={backHref}
                        className="group inline-flex items-center gap-3 px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-full text-slate-500 hover:bg-black hover:text-white hover:border-black transition-all shadow-sm hover:shadow-lg"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{backLabel}</span>
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl"
                >
                    <span className="inline-block px-2.5 py-1 bg-emerald-500/10 text-emerald-600 text-[8px] font-black rounded-lg mb-4 border border-emerald-500/10 uppercase tracking-[0.2em] leading-none">
                        {isFuturo ? "Próximo Evento" : "Evento Realizado"}
                    </span>
                    <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <h1 className="text-4xl md:text-6xl font-black text-black tracking-tighter leading-[0.95] uppercase italic">
                            {ponencia.titulo}
                        </h1>
                        <CertificateRequestDialog
                            scope="conversatorio"
                            ponenciaId={Number(ponencia.id)}
                            eventTitle={ponencia.titulo}
                            eventDate={ponencia.fecha_inicio || null}
                            defaultCost={Number(ponencia?.precio ?? 0)}
                            triggerLabel="Obtener certificado"
                            triggerClassName="bg-black text-white hover:bg-emerald-600"
                            resourceLabel={resourceLabel}
                        />
                    </div>
                    <p className="text-base text-gray-500 leading-relaxed font-light max-w-2xl">
                        {ponencia.subtitulo || ponencia.descripcion}
                    </p>
                </motion.div>
            </div>
        </section>
    )
}
