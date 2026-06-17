"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Play, Quote, User, Info, Video, CheckCircle2, FileText, Clock } from "lucide-react"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { ponentesApi } from "@/lib/api"
import { formatUrl } from "@/lib/utils"
import CommunityCTA from "@/components/shared/community-cta"

export default function SpeakerProfilePage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    const slug = params.slug as string

    const [ponente, setPonente] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const load = async () => {
            try {
                const data = await ponentesApi.obtenerPerfilPublico(id, slug)
                setPonente(data)
            } catch (e: any) {
                setError(e.message || "No se pudo cargar el perfil del ponente.")
            } finally {
                setLoading(false)
            }
        }
        if (id && slug) load()
    }, [id, slug])

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (error || !ponente) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                    <Info size={40} />
                </div>
                <h1 className="text-2xl font-black text-black uppercase mb-2">Ups! Algo salió mal</h1>
                <p className="text-gray-500 mb-8 max-w-sm">{error || "El ponente no fue encontrado."}</p>
                <button onClick={() => router.back()} className="px-8 py-3 bg-black text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-colors">
                    Volver atrás
                </button>
            </div>
        )
    }

    const userObj = ponente.usuario || ponente.Usuario
    const nombre = userObj?.nombre || ponente.nombre_ponente
    const fotoUrl = formatUrl(userObj?.foto_url || ponente.foto_revista_url)
    const profesion = ponente.profesion || (userObj ? 'Profesional Verificado' : 'Experto Invitado')
    const fondoBanner = formatUrl(ponente.fondo_banner)
    const galeria = Array.isArray(ponente.galeria_fotos) ? ponente.galeria_fotos : []

    return (
        <main className="min-h-screen bg-white font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
            <Header />

            <Header />
            
            {/* Premium Back Button overlaying the banner */}
            <div className="absolute top-28 left-0 right-0 z-40 px-6 pointer-events-none">
                <div className="max-w-7xl mx-auto flex justify-start">
                    <motion.button 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => router.back()}
                        className="pointer-events-auto group flex items-center gap-3 px-6 py-3 bg-black/20 backdrop-blur-md border border-white/10 rounded-full text-white/90 hover:bg-white hover:text-black hover:border-white transition-all shadow-2xl"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Regresar al evento</span>
                    </motion.button>
                </div>
            </div>

            {/* Banner Section */}
            <div className="relative w-full h-[50vh] min-h-[400px] overflow-hidden bg-[#0a0a0a]">
                {fondoBanner ? (
                    <motion.img 
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.4 }}
                        transition={{ duration: 1.5 }}
                        src={fondoBanner} 
                        className="absolute inset-0 w-full h-full object-cover"
                        alt="Background"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-slate-900 to-black opacity-80" />
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                
                <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-12">
                </div>
            </div>

            {/* Profile Content */}
            <section className="relative -mt-32 pb-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-12 gap-12 items-start">
                        
                        {/* Avatar Column */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="lg:col-span-4 sticky top-32"
                        >
                            <div className="aspect-[4/5] rounded-[3.5rem] bg-white overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-8 border-white group relative">
                                {fotoUrl ? (
                                    <img 
                                        src={fotoUrl} 
                                        alt={nombre}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-200">
                                        <User size={120} strokeWidth={1} />
                                    </div>
                                )}
                                
                                {ponente.slogan && (
                                    <div className="absolute bottom-0 inset-x-0 p-8 pt-20 bg-gradient-to-t from-black/80 to-transparent">
                                        <Quote className="text-emerald-400 w-8 h-8 mb-4 opacity-50" />
                                        <p className="text-white font-black text-xl leading-tight uppercase tracking-tighter italic">
                                            "{ponente.slogan}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Info Column */}
                        <div className="lg:col-span-8 pt-12 lg:pt-32 space-y-16">
                            <motion.div 
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="space-y-6"
                            >
                                <div>
                                    <h1 className="text-6xl md:text-8xl font-black text-slate-900 uppercase leading-[0.85] tracking-tighter mb-4">
                                        {nombre}
                                    </h1>
                                    <div className="inline-flex items-center gap-4 bg-emerald-50 px-6 py-2 rounded-full border border-emerald-100">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <p className="text-sm font-black text-emerald-800 uppercase tracking-widest">
                                            {profesion}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex items-center gap-8 group">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-white flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-900/10 transition-transform group-hover:rotate-12">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Ponencia Magistral</p>
                                            {ponente.hora_inicio && (
                                                <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-lg">
                                                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{ponente.hora_inicio.slice(0, 5)} - {ponente.hora_fin?.slice(0, 5)}</span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-2xl font-black text-slate-900 uppercase leading-tight tracking-tight">
                                            {ponente.tema_charla || "Tema destacado"}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="grid md:grid-cols-2 gap-12"
                            >
                                <div className="space-y-6">
                                    <h2 className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <div className="h-px w-8 bg-slate-200" /> Biografía
                                    </h2>
                                    <p className="text-slate-600 leading-relaxed text-lg font-medium">
                                        {ponente.biografia || "Información profesional próximamente."}
                                    </p>
                                </div>
                                <div className="space-y-6">
                                    <h2 className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <div className="h-px w-8 bg-slate-200" /> Especialidad
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {profesion.split(',').map((p: string, idx: number) => (
                                            <span key={idx} className="bg-white border border-slate-100 shadow-sm px-4 py-2 rounded-xl text-xs font-bold text-slate-700">
                                                {p.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Gallery Section */}
                            {galeria.length > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="space-y-8"
                                >
                                    <h2 className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <div className="h-px w-8 bg-slate-200" /> Galería de Momentos
                                    </h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {galeria.map((img: string, idx: number) => (
                                            <div key={idx} className="aspect-square rounded-3xl overflow-hidden bg-slate-50 group border border-slate-100">
                                                <img 
                                                    src={formatUrl(img) || undefined} 
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                                    alt={`Galleria ${idx}`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Magazine/Profile Section - Nielsen Heuristics: Consistency & Standards, Aesthetic Design */}
            {ponente.url_revista_personal && (
                <section className="bg-white py-16 px-6">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative bg-black rounded-[2.5rem] p-10 md:p-14 overflow-hidden group border border-emerald-500/20 shadow-2xl shadow-emerald-900/10"
                        >
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(16,185,129,0.1),transparent_50%)]" />
                            <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                                <div className="flex-1 text-center md:text-left">
                                    <div className="inline-flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-full mb-6 border border-emerald-500/20">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                                            Recurso Académico
                                        </p>
                                    </div>
                                    <h3 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase italic tracking-tighter leading-none">
                                        REVISTA & PERFIL <br /> <span className="text-emerald-500">PROFESIONAL</span>
                                    </h3>
                                    <p className="text-base text-gray-400 font-light mb-8 max-w-lg">
                                        Descarga la contribución detallada de {nombre} en nuestra revista exclusiva. Artículos, trayectoria y conocimiento experto a un clic de distancia.
                                    </p>
                                    <a
                                        href={formatUrl(ponente.url_revista_personal) || undefined}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all duration-500 group-hover:px-12 shadow-xl shadow-emerald-500/5"
                                    >
                                        <FileText className="w-4 h-4" />
                                        LEER PUBLICACIÓN COMPLETA
                                    </a>
                                </div>
                                <div className="hidden md:block w-48 relative group">
                                    <div className="absolute -inset-4 bg-emerald-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative rounded-[2rem] overflow-hidden border-4 border-white/5 shadow-2xl transform group-hover:-rotate-2 group-hover:scale-105 transition-all duration-700">
                                        {fotoUrl ? (
                                            <img
                                                src={fotoUrl || undefined}
                                                alt={nombre}
                                                className="w-full aspect-[3/4] object-cover"
                                            />
                                        ) : (
                                            <div className="w-full aspect-[3/4] bg-slate-900 flex items-center justify-center text-slate-700">
                                                <User size={64} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* Video Section */}
            {ponente.video_url && (
                <section className="bg-slate-900 py-32 px-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] -mr-48 -mt-48" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -ml-48 -mb-48" />
                    
                    <div className="max-w-5xl mx-auto relative z-10">
                        <div className="text-center mb-16">
                            <motion.span 
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                className="inline-block bg-white/5 border border-white/10 px-6 py-2 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4"
                            >
                                Multimedia
                            </motion.span>
                            <h3 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter">
                                REVIVE LA <span className="text-emerald-500">EXPERIENCIA</span>
                            </h3>
                        </div>
                        
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="aspect-video rounded-[3rem] overflow-hidden bg-white/5 border border-white/10 shadow-3xl relative group"
                        >
                            <iframe 
                                src={ponente.video_url.includes("watch?v=") ? ponente.video_url.replace("watch?v=", "embed/") : ponente.video_url} 
                                className="w-full h-full"
                                allowFullScreen
                                title="Video Ponente"
                            />
                        </motion.div>
                    </div>
                </section>
            )}


            {/* CTA Section */}
            <div className="bg-white">
                <CommunityCTA />
            </div>

            <Footer />
        </main>
    )
}
