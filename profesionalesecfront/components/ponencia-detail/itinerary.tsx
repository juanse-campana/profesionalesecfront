"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Clock, Users } from "lucide-react"
import SpeakerCard from "@/components/speaker-card"

interface ItineraryProps {
    ponencia: any
    loading: boolean
    resourceLabel?: string
    speakerBasePath?: string
}

export default function EventItinerary({ ponencia, loading, resourceLabel = "CONVERSATORIO", speakerBasePath = "/conversatorios" }: ItineraryProps) {
    const [activeAccordion, setActiveAccordion] = useState<string | null>(null)

    if (loading || !ponencia || !ponencia.dias?.length) return null

    // Set first day as active by default if not set
    if (activeAccordion === null && ponencia.dias.length > 0) {
        setActiveAccordion(`day-${ponencia.dias[0].id}`)
    }

    return (
        <section className="bg-gray-50 py-20 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.4em] mb-3">
                        Cronograma Detallado
                    </h2>
                    <h3 className="text-4xl md:text-6xl font-black text-black uppercase italic tracking-tighter">
                        {`REVIVE EL ${resourceLabel}`}
                    </h3>
                </div>

                <div className="max-w-4xl mx-auto space-y-4">
                    {ponencia.dias.map((dia: any, index: number) => (
                        <div
                            key={dia.id}
                            className={`bg-white rounded-2xl overflow-hidden border transition-all duration-500 ${
                                activeAccordion === `day-${dia.id}` 
                                ? "border-emerald-500/20 shadow-xl" 
                                : "border-gray-100 shadow-sm hover:border-emerald-100"
                            }`}
                        >
                            <button
                                onClick={() => setActiveAccordion(activeAccordion === `day-${dia.id}` ? null : `day-${dia.id}`)}
                                className="w-full flex items-center justify-between p-6 text-left transition-colors"
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg transition-colors duration-500 ${
                                        activeAccordion === `day-${dia.id}` ? "bg-emerald-500 text-white" : "bg-gray-50 text-gray-400"
                                    }`}>
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">Día {index + 1}</p>
                                        <h4 className="text-lg md:text-xl font-black text-black uppercase">{dia.titulo_dia || `Sesión ${index + 1}`}</h4>
                                        <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            Horario: {dia.hora_inicio?.slice(0, 5)} - {dia.hora_fin?.slice(0, 5)}
                                        </p>
                                    </div>
                                </div>
                                <ChevronDown className={`w-5 h-5 text-gray-300 transition-transform duration-500 ${
                                    activeAccordion === `day-${dia.id}` ? "rotate-180 text-emerald-500" : ""
                                }`} />
                            </button>

                            <AnimatePresence>
                                {activeAccordion === `day-${dia.id}` && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                    >
                                        <div className="px-8 pb-12">
                                            <div className="h-px bg-gray-100 mb-12" />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {dia.ponentes?.map((pon: any) => (
                                                    <SpeakerCard 
                                                        key={pon.id} 
                                                        ponente={pon} 
                                                        ponenciaId={ponencia.id} 
                                                        basePath={speakerBasePath}
                                                    />
                                                ))}
                                                {(!dia.ponentes || dia.ponentes.length === 0) && (
                                                    <p className="col-span-full text-gray-400 italic text-center py-8">No hay ponentes registrados para este día.</p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
