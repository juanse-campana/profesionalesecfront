"use client"

import { useEffect, useState } from "react"
import { ChevronDown, Facebook, Instagram } from "lucide-react"
import Link from "next/link"
import { cmsLegalApi, defaultFooterFaqs, type FooterFaqsContent } from "@/lib/cms-legal"

export default function Footer() {
  const [openProfessional, setOpenProfessional] = useState<number | null>(null)
  const [openConversatorio, setOpenConversatorio] = useState<number | null>(null)
  const [faqs, setFaqs] = useState<FooterFaqsContent>(defaultFooterFaqs)

  useEffect(() => {
    let mounted = true

    cmsLegalApi
      .getFooterFaqs()
      .then((data) => {
        if (mounted && data) setFaqs(data)
      })
      .catch((error) => {
        console.error("No se pudieron cargar las FAQs del footer desde CMS Legal:", error)
      })

    return () => {
      mounted = false
    }
  }, [])

  return (
    <footer className="bg-black px-4 py-4 text-xs text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col items-center justify-between gap-4 border-b border-gray-900 pb-4 md:flex-row">
          <div className="flex flex-col items-center gap-2 md:pl-20">
            <img src="/logo-white.png" alt="P.ec" className="h-16 w-auto object-contain" />
            <span className="text-[10px] font-light tracking-[0.2em] text-gray-400">DIRECTORIO DIGITAL</span>
          </div>
          <div className="flex gap-8 md:pr-20">
            <Link href="https://www.facebook.com/profile.php?id=61556825827660" target="_blank" className="transition-opacity hover:opacity-80">
              <Facebook size={32} />
            </Link>
            <Link href="https://www.instagram.com/profesionalesec/" target="_blank" className="transition-opacity hover:opacity-80">
              <Instagram size={32} />
            </Link>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-6 md:grid-cols-4">
          <div>
            <h3 className="mb-2 font-bold uppercase tracking-wider text-gray-300">Enlaces</h3>
            <ul className="space-y-1 text-gray-500">
              <li><Link href="/profesionales" className="transition hover:text-white">Directorio</Link></li>
              <li><Link href="/conversatorios" className="transition hover:text-white">Educación</Link></li>
              <li><Link href="/cursos" className="transition hover:text-white">Cursos</Link></li>
              <li><Link href="/sobre-nosotros" className="transition hover:text-white">Nosotros</Link></li>
              <li><Link href="/contacto" className="transition hover:text-white">Contacto</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 font-bold uppercase tracking-wider text-gray-300">Únete</h3>
            <div className="space-y-2 text-gray-500">
              <div>
                <p className="font-semibold text-gray-400">Ponente</p>
                <Link href="https://wa.link/i65ui8" target="_blank" className="text-[10px] text-blue-500 hover:text-blue-400">Más info →</Link>
              </div>
              <div>
                <p className="font-semibold text-gray-400">Asistente</p>
                <Link href="https://wa.link/soekak" target="_blank" className="text-[10px] text-blue-500 hover:text-blue-400">Más info →</Link>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-bold uppercase tracking-wider text-gray-300">FAQs Prof.</h3>
            <div className="space-y-1">
              {faqs.professionalFaqs.map((faq, index) => (
                <div key={`professional-${index}`}>
                  <button
                    onClick={() => setOpenProfessional(openProfessional === index ? null : index)}
                    aria-expanded={openProfessional === index}
                    className="flex w-full items-center justify-between gap-1 text-left text-[11px] text-gray-500 hover:text-white md:text-xs"
                  >
                    <span className="truncate">{faq.question}</span>
                    <ChevronDown size={12} className={`transform transition ${openProfessional === index ? "rotate-180" : ""}`} />
                  </button>
                  <div
                    className={`grid overflow-hidden transition-[grid-template-rows,opacity,transform] duration-300 ease-out ${openProfessional === index ? "mt-1 grid-rows-[1fr] translate-y-0 opacity-100" : "grid-rows-[0fr] -translate-y-1 opacity-0"}`}
                    aria-hidden={openProfessional !== index}
                  >
                    <p className="min-h-0 overflow-hidden rounded bg-gray-900/50 p-2 pl-1 text-[11px] font-normal leading-relaxed text-gray-400 md:text-xs">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-bold uppercase tracking-wider text-gray-300">FAQs Eventos</h3>
            <div className="space-y-1">
              {faqs.conversatorioFaqs.map((faq, index) => (
                <div key={`conversatorio-${index}`}>
                  <button
                    onClick={() => setOpenConversatorio(openConversatorio === index ? null : index)}
                    aria-expanded={openConversatorio === index}
                    className="flex w-full items-center justify-between gap-1 text-left text-[11px] text-gray-500 hover:text-white md:text-xs"
                  >
                    <span className="truncate">{faq.question}</span>
                    <ChevronDown size={12} className={`transform transition ${openConversatorio === index ? "rotate-180" : ""}`} />
                  </button>
                  <div
                    className={`grid overflow-hidden transition-[grid-template-rows,opacity,transform] duration-300 ease-out ${openConversatorio === index ? "mt-1 grid-rows-[1fr] translate-y-0 opacity-100" : "grid-rows-[0fr] -translate-y-1 opacity-0"}`}
                    aria-hidden={openConversatorio !== index}
                  >
                    <p className="min-h-0 overflow-hidden rounded bg-gray-900/50 p-2 pl-1 text-[11px] font-normal leading-relaxed text-gray-400 md:text-xs">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 border-t border-gray-900 pt-4 text-[10px] text-gray-600">
          <a href="https://mil998.com/" target="_blank" rel="noopener noreferrer" className="order-1 transition-colors hover:text-white">
            Developed by 1998 - Desarrollo Digital y Marketing
          </a>
          <div className="order-2 flex gap-4 md:order-2">
            <Link href="/terminos-y-condiciones" className="hover:text-gray-400">Términos</Link>
            <span>|</span>
            <a href="mailto:info@profesionales.ec" className="hover:text-gray-400">info@profesionales.ec</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
