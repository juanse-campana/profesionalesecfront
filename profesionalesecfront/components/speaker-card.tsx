"use client"

import { User, Clock } from "lucide-react"
import Link from "next/link"
import { formatUrl } from "@/lib/utils"

interface SpeakerCardProps {
  ponente: any
  ponenciaId?: number | string
  basePath?: string
}

export default function SpeakerCard({ ponente, ponenciaId, basePath = "/conversatorios" }: SpeakerCardProps) {
  // Extract data based on registered user (usuario/Usuario) or guest speaker fields
  const userObj = ponente.usuario || ponente.Usuario
  const nombre = userObj?.nombre || ponente.nombre_ponente || "Ponente Invitado"
  const fotoUrl = formatUrl(userObj?.foto_url || ponente.foto_revista_url)
  const profesion = ponente.profesion || (userObj ? 'Profesional Verificado' : 'Experto Invitado')

  // Navigation target - Prefer explicit prop over nested data
  const finalPonenciaId = ponenciaId || ponente.ponencia_id
  const profileUrl = ponente.slug && finalPonenciaId ? `${basePath}/${finalPonenciaId}/ponente/${ponente.slug}` : "#"

  return (
    <Link 
      href={profileUrl} 
      className="block group"
    >
      <div className={`flex items-start gap-4 p-5 rounded-3xl border border-gray-100 bg-white shadow-sm group-hover:shadow-xl group-hover:border-emerald-100 transition-all duration-300`}>
        <div className="w-16 h-16 shrink-0 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-2xl border border-emerald-100 overflow-hidden shadow-inner group-hover:scale-110 transition-transform">
          {fotoUrl ? (
            <img 
              src={formatUrl(fotoUrl) || ""} 
              alt={nombre} 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            nombre.charAt(0).toUpperCase()
          )}
        </div>
        <div className="space-y-1 text-left">
          <p className="font-black text-black uppercase tracking-tight">{nombre}</p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
              {profesion}
            </p>
            {ponente.hora_inicio ? (
              <p className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {ponente.hora_inicio.slice(0, 5)} - {ponente.hora_fin?.slice(0, 5)}
              </p>
            ) : (
              <span className="text-[7px] text-slate-200">v1.2.3 • No schedule</span>
            )}
          </div>
          {ponente.tema_charla && (
            <div className="text-sm text-gray-500 line-clamp-2 leading-relaxed pt-2">
              <span className="font-bold text-gray-400 text-[10px] uppercase block mb-0.5">Tema a exponer:</span>
              {ponente.tema_charla}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
