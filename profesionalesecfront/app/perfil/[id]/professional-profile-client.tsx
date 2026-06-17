"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { articulosApi, horariosApi, profesionalApi, type Articulo } from "@/lib/api"
import { ArrowRight, BadgeCheck, BookOpen, BriefcaseBusiness, Facebook, Instagram, Linkedin, Mail, MapPin, Music, Wallet, Youtube } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
import Header from "@/components/header"
import Footer from "@/components/footer"
import BookingForm from "@/components/booking-form"
import LocationMap from "@/components/shared/location-map"
import ArticleReaderDialog from "@/components/articles/article-reader-dialog"
import { formatUrl } from "@/lib/utils"

const ArticlePdfPreview = dynamic(() => import("@/components/articles/article-pdf-preview"), { ssr: false })

interface ProfessionalProfileClientProps {
  profileId: string
}

function formatArticleDate(dateStr: string) {
  try {
    return format(new Date(dateStr), "d 'de' MMMM 'de' yyyy", { locale: es })
  } catch {
    return dateStr
  }
}

export default function ProfessionalProfileClient({ profileId }: ProfessionalProfileClientProps) {
  const profileArticleLog = (...args: unknown[]) => {
    console.log("[ProfileArticleModal]", ...args)
  }

  const [professional, setProfessional] = useState<any>(null)
  const [schedule, setSchedule] = useState<boolean[] | null>(null)
  const [articles, setArticles] = useState<Articulo[]>([])
  const [articlesLoading, setArticlesLoading] = useState(true)
  const [loading, setLoading] = useState(true)
  const [selectedArticle, setSelectedArticle] = useState<Articulo | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileId) return
      try {
        setLoading(true)
        setArticlesLoading(true)

        const [found, articlesResult] = await Promise.all([
          profesionalApi.obtenerPublico(profileId),
          articulosApi
            .listarPublicados({
              profileSlug: profileId,
              limit: 6,
            })
            .catch(() => ({ data: [], meta: { totalItems: 0, totalPages: 1, currentPage: 1, itemsPerPage: 0 } })),
        ])

        setProfessional(found || null)
        setArticles(articlesResult.data)

        if (found) {
          try {
            const schedData = await horariosApi.obtenerPublico(profileId)
            if (schedData && schedData.matriz) {
              setSchedule(schedData.matriz)
            }
          } catch (err) {
            console.warn("No availability data found or error fetching it:", err)
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
        setArticles([])
      } finally {
        setArticlesLoading(false)
        setLoading(false)
      }
    }
    fetchProfile()
  }, [profileId])

  useEffect(() => {
    if (selectedArticle) {
      profileArticleLog("modal opened", {
        articleId: selectedArticle.id,
        title: selectedArticle.titulo,
        pdfUrl: selectedArticle.pdf_url,
        normalizedPdfUrl: selectedArticle.pdf_url ? formatUrl(selectedArticle.pdf_url) || selectedArticle.pdf_url : "",
      })

      return
    }

    profileArticleLog("modal closed")
  }, [selectedArticle])

  useEffect(() => {
    const selectedArticlePdfUrl = selectedArticle?.pdf_url ? formatUrl(selectedArticle.pdf_url) || selectedArticle.pdf_url : ""

    if (!selectedArticle || selectedArticlePdfUrl) {
      return
    }

    profileArticleLog("fallback without pdf shown", {
      articleId: selectedArticle.id,
      title: selectedArticle.titulo,
      pdfUrl: selectedArticle.pdf_url,
    })
  }, [selectedArticle])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-white font-sans flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Profesional no encontrado</h2>
          <Link href="/profesionales" className="text-black underline">Volver al directorio</Link>
        </div>
        <Footer />
      </div>
    )
  }

  const { usuario, profesion, especialidad, descripcion, tarifa, ciudad, direccion, lat, lng, calle_principal, referencia, facebook_url, instagram_url, x_url, linkedin_url, tiktok_url, yt_url, show_phone, show_email } = professional
  const name = usuario?.nombre || "Profesional"
  const title = profesion?.nombre || "Profesional"
  const subTitle = especialidad?.nombre ? `${title} Especializada en ${especialidad.nombre}` : title
  const specialty = especialidad?.nombre || ""
  const bio = descripcion || "Profesional verificado con amplia experiencia en su campo."
  const image = formatUrl(usuario?.foto_url) || "/logo-black.png"
  const bannerImage = formatUrl(professional?.banner_url) || ""
  const hasBanner = Boolean(bannerImage)
  const services = professional?.servicios || []
  const locationName = ciudad?.nombre || "Ecuador"
  const workMode = professional?.modalidad || ""
  const verificationLabel = professional?.verificado ? "Verificado" : "Pendiente de verificación"
  const rateLabel = tarifa != null && tarifa !== "" ? `Tarifa: $${Number(tarifa).toFixed(2)}` : "Tarifa no especificada"
  const workModeLabel = workMode === "Ambas modalidades" ? "Híbrido" : workMode || "Modalidad no especificada"
  const phone = show_phone !== false ? (usuario?.telefono || "") : ""
  const email = show_email !== false ? (usuario?.correo || "") : ""
  const whatsappLink = `https://wa.me/593${phone.replace(/^0/, "")}?text=Hola, deseo agendar una cita.`

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <Header />
      <section className="relative mb-8 w-full">
        {hasBanner ? (
          <div className="relative h-[50vh] min-h-[300px] w-full overflow-hidden bg-gray-950 md:h-[55vh] md:min-h-[360px]">
            <img src={bannerImage} alt={`Banner de ${name}`} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/72 via-black/38 to-black/18" />
          </div>
        ) : null}

        <div className={`relative z-10 mx-auto w-[calc(100%-1.5rem)] max-w-6xl px-2 md:px-6 ${hasBanner ? "-mt-40 md:-mt-52" : "mt-28 md:mt-32"}`}>
          <div className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-2xl md:p-10">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
                <div className="mx-auto lg:mx-0 shrink-0">
                  <div className="h-44 w-44 overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-xl md:h-56 md:w-56">
                    <img src={image} alt={name} className="h-full w-full object-cover" />
                  </div>
                </div>

                <div className="min-w-0 flex-1 text-center lg:text-left">
                  <h1 className="text-4xl font-bold tracking-tight text-black md:text-6xl">{name}</h1>
                  <p className="mt-3 text-lg font-semibold text-black md:text-2xl">{subTitle}</p>
                  <p className="mt-4 whitespace-pre-wrap text-base italic leading-relaxed text-black/70 md:text-lg">{bio}</p>

                  <div className="mt-6 flex flex-wrap justify-center gap-4 lg:justify-start">
                    {facebook_url && (
                      <a href={facebook_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center size-12 bg-white border border-gray-100 rounded-2xl text-gray-500 hover:text-blue-600 hover:border-blue-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group shadow-sm" title="Facebook">
                        <Facebook size={20} className="group-hover:scale-110 transition-transform" />
                      </a>
                    )}
                    {instagram_url && (
                      <a href={instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center size-12 bg-white border border-gray-100 rounded-2xl text-gray-500 hover:text-pink-600 hover:border-pink-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group shadow-sm" title="Instagram">
                        <Instagram size={20} className="group-hover:scale-110 transition-transform" />
                      </a>
                    )}
                    {x_url && (
                      <a href={x_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center size-12 bg-white border border-gray-100 rounded-2xl text-gray-500 hover:text-black hover:border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group shadow-sm" title="Twitter / X">
                        <div className="size-5 flex items-center justify-center font-bold text-[10px] border border-gray-400 group-hover:border-black rounded-sm leading-none transition-colors">X</div>
                      </a>
                    )}
                    {linkedin_url && (
                      <a href={linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center size-12 bg-white border border-gray-100 rounded-2xl text-gray-500 hover:text-blue-800 hover:border-blue-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group shadow-sm" title="LinkedIn">
                        <Linkedin size={20} className="group-hover:scale-110 transition-transform" />
                      </a>
                    )}
                    {tiktok_url && (
                      <a href={tiktok_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center size-12 bg-white border border-gray-100 rounded-2xl text-gray-500 hover:text-black hover:border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group shadow-sm" title="TikTok">
                        <Music size={20} className="group-hover:scale-110 transition-transform" />
                      </a>
                    )}
                    {yt_url && (
                      <a href={yt_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center size-12 bg-white border border-gray-100 rounded-2xl text-gray-500 hover:text-red-600 hover:border-red-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group shadow-sm" title="YouTube">
                        <Youtube size={20} className="group-hover:scale-110 transition-transform" />
                      </a>
                    )}
                    {phone && (
                      <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center size-12 bg-white border border-gray-100 rounded-2xl text-gray-500 hover:text-green-600 hover:border-green-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group shadow-sm" title="WhatsApp">
                        <svg viewBox="0 0 24 24" className="size-5 fill-current group-hover:scale-110 transition-transform" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                      </a>
                    )}
                    {email && (
                      <a href={`mailto:${email}`} className="flex items-center justify-center size-12 bg-white border border-gray-100 rounded-2xl text-gray-500 hover:text-gray-900 hover:border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group shadow-sm" title="Email">
                        <Mail size={20} className="group-hover:scale-110 transition-transform" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-gray-100 pt-8">
                <div className="mb-6 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-black">
                    <MapPin className="h-4 w-4" /> {locationName}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-black">
                    <Wallet className="h-4 w-4" /> {rateLabel}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-black">
                    <BadgeCheck className="h-4 w-4" /> {verificationLabel}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-black">
                    <BriefcaseBusiness className="h-4 w-4" /> {workModeLabel}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-black">Servicios</h3>
                  {services.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {services.map((servicio: any) => (
                        <span
                          key={servicio.servicio_id}
                          className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-black"
                        >
                          {servicio.descripcion}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-black/70">Este profesional todavía no ha agregado servicios públicos.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
      </section>

      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-16 mb-20 border-t border-gray-100 pt-16">
          <div className="w-full md:w-1/2">
            <h3 className="text-xl font-bold uppercase text-gray-800 mb-8 border-b pb-4">AGENDA UNA CITA</h3>
            <BookingForm
              professional={{
                id: professional?.usuario?.id || professional.id,
                slug: profileId,
                name,
                specialty,
              }}
              schedule={schedule}
            />
          </div>

          <div className="w-full md:w-1/2 flex flex-col gap-12">
            <div className="bg-gray-50 p-8 md:p-12 rounded-3xl border border-gray-100">
              <h3 className="text-xl font-bold uppercase text-gray-800 mb-8 border-b border-gray-200 pb-4 text-center">CONÓCEME</h3>
              <p className="text-gray-600 leading-relaxed text-base md:text-lg text-center max-w-2xl mx-auto whitespace-pre-wrap">{bio}</p>
            </div>

            <div>
              <h3 className="text-xl font-bold uppercase text-gray-800 mb-6 border-b pb-4">UBICACIÓN & CONTACTO</h3>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-gray-100 p-3 rounded-full">
                    <MapPin className="text-black" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{locationName}</h4>
                    {(calle_principal || direccion?.calle_principal) && (
                      <p className="text-gray-600 mt-1">{calle_principal || direccion.calle_principal}</p>
                    )}
                    {(referencia || direccion?.referencia) && (
                      <p className="text-gray-500 text-sm mt-1 italic">Ref: {referencia || direccion.referencia}</p>
                    )}
                  </div>
                </div>

                {(lat || direccion?.latitud) && (lng || direccion?.longitud) && (
                  <div className="w-full h-64 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                    <LocationMap
                      lat={Number(lat || direccion.latitud)}
                      lng={Number(lng || direccion.longitud)}
                      readonly={true}
                      address={calle_principal || direccion?.calle_principal}
                    />
                  </div>
                )}

                <div className="flex flex-wrap gap-4 pt-6 mt-6 border-t border-gray-100">
                  {phone && (
                    <a href={whatsappLink} target="_blank" className="flex-1 bg-green-500 text-white px-6 py-4 rounded-lg font-bold hover:bg-green-600 transition flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                      <svg viewBox="0 0 24 24" className="size-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      Contactar por WhatsApp
                    </a>
                  )}
                  {email && (
                    <a href={`mailto:${email}`} className="flex-1 bg-gray-900 text-white px-6 py-4 rounded-lg font-bold hover:bg-black transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                      <Mail size={20} /> Enviar Email
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {(articlesLoading || articles.length > 0) && (
          <section className="border-t border-gray-100 pt-16">
            <div className="mb-10 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
                <BookOpen className="text-primary" size={18} />
                <span className="text-sm font-semibold text-primary">Publicaciones</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Artículos publicados</h3>
              <p className="text-gray-500 max-w-2xl">
                Leé los artículos aprobados y publicados por {name} dentro de Profesionales.EC.
              </p>
            </div>

            {articlesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {articles.map((article, index) => {
                  const excerpt = article.resumen || `${article.contenido?.slice(0, 150) || ""}...`
                  const articlePdfUrl = formatUrl(article.pdf_url) || article.pdf_url

                  return (
                    <button
                      type="button"
                      key={article.id}
                      onClick={() => {
                        profileArticleLog("article card clicked", {
                          articleId: article.id,
                          title: article.titulo,
                          pdfUrl: article.pdf_url,
                          normalizedPdfUrl: articlePdfUrl,
                        })
                        setSelectedArticle(article)
                      }}
                      className="group block w-full bg-white rounded-2xl overflow-hidden border border-gray-200 text-left hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5">
                        {articlePdfUrl ? (
                          <ArticlePdfPreview
                            pdfUrl={articlePdfUrl}
                            title={article.titulo}
                            compact={true}
                            variant="thumbnail"
                            className="transition-transform duration-700 group-hover:scale-[1.03]"
                            fallbackMessage="Vista previa no disponible para este artículo."
                          />
                        ) : article.imagen_url ? (
                          <img
                            src={formatUrl(article.imagen_url) || ""}
                            alt={article.titulo}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-gray-500">
                            <BookOpen className="text-primary/30" size={56} />
                            <p className="text-sm font-medium">Sin PDF disponible</p>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent opacity-70" />
                      </div>

                      <div className="p-6">
                        <div className="mb-3 text-xs text-gray-500">
                          <span>{formatArticleDate(article.fecha_publicacion)}</span>
                        </div>

                        <h4 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                          {article.titulo}
                        </h4>

                        <p className="text-sm text-gray-600 leading-relaxed mb-5 line-clamp-3">{excerpt}</p>
                      </div>

                      <div className="px-6 pb-6">
                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{name}</p>
                            <p className="text-xs text-gray-500">{subTitle}</p>
                          </div>

                          <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                            Leer artículo
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </section>
        )}

        <ArticleReaderDialog
          article={selectedArticle}
          onClose={() => {
            if (selectedArticle) {
              profileArticleLog("reader close clicked", {
                articleId: selectedArticle.id,
                title: selectedArticle.titulo,
              })
            }

            setSelectedArticle(null)
          }}
        />
      </div>

      <div className="fixed bottom-6 left-6 z-50">
        <a href={whatsappLink} target="_blank" className="bg-[#25D366] p-4 rounded-full shadow-lg text-white block hover:scale-110 transition">
          <svg viewBox="0 0 24 24" className="size-7 fill-current" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </a>
      </div>

      <Footer />
    </div>
  )
}
