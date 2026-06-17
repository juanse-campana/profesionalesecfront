"use client"

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import { MapPin, ArrowRight, ChevronLeft, ChevronRight, Star } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import PageLoader from "@/components/page-loader"
import {
  ProfessionalsFilters,
  EMPTY_FILTERS,
  SORT_OPTIONS,
  type FilterState,
  type SortOption,
} from "@/components/professionals-filters"
import { formatUrl } from "@/lib/utils"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api"
const PAGE_SIZE = 30

type PageMeta = { totalItems: number; totalPages: number; currentPage: number }

interface ProfessionalCard {
  id: number
  slug?: string
  name: string
  specialty: string
  location: string
  image: string
  price: string
  priceValue: number | null
  unit: string
  experience: string
  featured: boolean
  description?: string
}

interface ProvinceLike {
  id?: number | string
  nombre?: string
  name?: string
}

interface CityLike {
  nombre?: string
  provincia_id?: number | string
  province_id?: number | string
  provincia?: ProvinceLike
  province?: ProvinceLike
}

interface ProfessionalApiItem {
  id?: number
  slug?: string
  usuario?: {
    nombre?: string
    foto_url?: string
  }
  especialidad?: {
    nombre?: string
  }
  especialidades?: Array<{
    nombre?: string
  }>
  profesion?: {
    nombre?: string
  }
  tarifa?: number | string | null
  tarifa_hora?: number | string | null
  verificado?: boolean
  is_featured?: unknown
  destacado?: unknown
  featured?: unknown
  es_destacado?: unknown
  plan?: { slug?: unknown; nombre?: unknown } | string | null
  plan_slug?: unknown
  descripcion?: string
  provincia_id?: number | string
  province_id?: number | string
  provincia?: ProvinceLike | string
  province?: ProvinceLike | string
  ciudad?: CityLike
  city?: CityLike
}

const TRUE_LIKE_VALUES = new Set(["true", "1", "yes", "si", "sí", "priority", "destacado", "featured"])
const SORT_VALUES: readonly SortOption[] = Object.values(SORT_OPTIONS)

function normalizeSortBy(value: string | null): SortOption {
  if (value && (SORT_VALUES as readonly string[]).includes(value)) return value as SortOption
  return SORT_OPTIONS.FEATURED
}

function isTrueLike(value: unknown): boolean {
  if (typeof value === "boolean") return value
  if (typeof value === "number") return value > 0
  if (typeof value === "string") return TRUE_LIKE_VALUES.has(normalizeLocationValue(value))
  if (typeof value === "object" && value !== null) {
    const candidate = value as { slug?: unknown; nombre?: unknown; name?: unknown; tipo?: unknown }
    return [candidate.slug, candidate.nombre, candidate.name, candidate.tipo].some(isTrueLike)
  }
  return false
}

function parseOptionalNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null
  if (typeof value !== "string") return null

  const normalized = value.trim().replace(/[^\d.,-]/g, "")
  const lastDot = normalized.lastIndexOf(".")
  const lastComma = normalized.lastIndexOf(",")
  const onlyDotAsThousands = lastDot > -1 && lastComma === -1 && /^-?\d{1,3}(\.\d{3})+$/.test(normalized)
  const onlyCommaAsThousands = lastComma > -1 && lastDot === -1 && /^-?\d{1,3}(,\d{3})+$/.test(normalized)
  if (onlyDotAsThousands || onlyCommaAsThousands) {
    const parsed = parseFloat(normalized.replace(/[.,]/g, ""))
    return Number.isFinite(parsed) ? parsed : null
  }

  const decimalSeparator = lastComma > lastDot ? "," : "."
  const normalizedNumber = normalized
    .replace(decimalSeparator === "," ? /\./g : /,/g, "")
    .replace(decimalSeparator, ".")
  const parsed = parseFloat(normalizedNumber)
  return Number.isFinite(parsed) ? parsed : null
}

function normalizeLocationValue(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
}

function matchesKeywordFilter(professional: ProfessionalApiItem, keyword: string): boolean {
  const normalizedKeyword = normalizeLocationValue(keyword)
  if (!normalizedKeyword) return true

  const searchableValues = [
    professional.usuario?.nombre,
    professional.profesion?.nombre,
    professional.especialidad?.nombre,
    ...(professional.especialidades?.map((specialty) => specialty.nombre) ?? []),
  ]

  return searchableValues.some((value) => normalizeLocationValue(value).includes(normalizedKeyword))
}

function matchesProvinceFilter(professional: ProfessionalApiItem, provinceFilter: string): boolean {
  if (!provinceFilter) return true

  const normalizedFilter = normalizeLocationValue(provinceFilter)
  const candidateIds = [
    professional.provincia_id,
    professional.province_id,
    professional.ciudad?.provincia_id,
    professional.ciudad?.province_id,
    professional.city?.provincia_id,
    professional.city?.province_id,
    typeof professional.provincia === "object" ? professional.provincia.id : undefined,
    typeof professional.province === "object" ? professional.province.id : undefined,
    professional.ciudad?.provincia?.id,
    professional.ciudad?.province?.id,
    professional.city?.provincia?.id,
    professional.city?.province?.id,
  ]

  if (candidateIds.some((id) => String(id ?? "") === provinceFilter)) return true

  const candidateNames = [
    typeof professional.provincia === "string" ? professional.provincia : professional.provincia?.nombre,
    typeof professional.province === "string" ? professional.province : professional.province?.name ?? professional.province?.nombre,
    professional.ciudad?.provincia?.nombre,
    professional.ciudad?.province?.name ?? professional.ciudad?.province?.nombre,
    professional.city?.provincia?.nombre,
    professional.city?.province?.name ?? professional.city?.province?.nombre,
  ]

  return candidateNames.some((name) => normalizeLocationValue(name) === normalizedFilter)
}

function urlToFilters(sp: URLSearchParams): FilterState {
  return {
    keyword: sp.get("keyword") ?? "",
    profession: sp.get("profesion_id") ?? "",
    specialty: sp.get("especialidad_id") ?? "",
    province: sp.get("provincia_id") ?? "",
    city: sp.get("ciudad_id") ?? "",
    verifiedOnly: sp.get("verificados") === "true",
    sortBy: normalizeSortBy(sp.get("orden")),
  }
}

function filtersToParams(filters: FilterState, options: { includeClientSort?: boolean } = {}): URLSearchParams {
  const includeClientSort = options.includeClientSort ?? true
  const sp = new URLSearchParams()
  if (filters.keyword) sp.set("keyword", filters.keyword)
  if (filters.profession) sp.set("profesion_id", filters.profession)
  if (filters.specialty) sp.set("especialidad_id", filters.specialty)
  if (filters.province) sp.set("provincia_id", filters.province)
  if (filters.city) sp.set("ciudad_id", filters.city)
  if (filters.verifiedOnly) sp.set("verificados", "true")
  // El orden por precio vive en la URL para controlar el Select, pero no se manda al API.
  if (filters.sortBy && filters.sortBy !== SORT_OPTIONS.FEATURED && includeClientSort) {
    sp.set("orden", filters.sortBy)
  }
  return sp
}

function mapProfessional(p: ProfessionalApiItem): ProfessionalCard {
  const visibleTarifa = p.tarifa_hora ?? p.tarifa
  const price = visibleTarifa != null ? `$${visibleTarifa}` : "A convenir"
  const priceValue = parseOptionalNumber(price)
  return {
    id: Number(p.id),
    slug: p.slug,
    name: p.usuario?.nombre || "Usuario",
    specialty: p.especialidad?.nombre || p.profesion?.nombre || "Profesional",
    location: p.ciudad
      ? `${p.ciudad.nombre}${p.ciudad.provincia?.nombre ? `, ${p.ciudad.provincia.nombre}` : ""}`
      : "Ecuador",
    image: formatUrl(p.usuario?.foto_url) || "/logo-black.png",
    price: priceValue !== null ? price : "A convenir",
    priceValue,
    unit: "hora",
    experience: "Experiencia verificada",
    featured: [
      p.is_featured,
      p.destacado,
      p.featured,
      p.es_destacado,
      p.plan,
      p.plan_slug,
      typeof p.plan === "object" ? p.plan?.slug : undefined,
      typeof p.plan === "object" ? p.plan?.nombre : undefined,
    ].some(isTrueLike),
    description: p.descripcion,
  }
}

function isPriceSort(sortBy: string): boolean {
  return sortBy === SORT_OPTIONS.PRICE_LOW || sortBy === SORT_OPTIONS.PRICE_HIGH
}

function sortClientSide(list: ProfessionalCard[], sortBy: string): ProfessionalCard[] {
  if (sortBy === SORT_OPTIONS.FEATURED) {
    return [...list].sort((a, b) => Number(b.featured) - Number(a.featured))
  }
  if (sortBy !== SORT_OPTIONS.PRICE_LOW && sortBy !== SORT_OPTIONS.PRICE_HIGH) return list

  return [...list].sort((a, b) => {
    if (a.priceValue === null && b.priceValue === null) return 0
    if (a.priceValue === null) return 1
    if (b.priceValue === null) return -1

    const diff = a.priceValue - b.priceValue
    return sortBy === SORT_OPTIONS.PRICE_LOW ? diff : -diff
  })
}

function ProfessionalsPageInner() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filters = useMemo<FilterState>(() => urlToFilters(searchParams), [searchParams])
  const page = useMemo(() => {
    const raw = searchParams.get("page")
    const parsed = raw ? parseInt(raw, 10) : 1
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
  }, [searchParams])

  const [professionals, setProfessionals] = useState<ProfessionalCard[]>([])
  const [meta, setMeta] = useState<PageMeta>({ totalItems: 0, totalPages: 1, currentPage: 1 })
  const [loading, setLoading] = useState(true)
  const [requestError, setRequestError] = useState<string | null>(null)

  const writeUrl = useCallback(
    (next: { filters?: FilterState; page?: number }) => {
      const targetFilters = next.filters ?? filters
      const targetPage = next.page ?? page
      const sp = filtersToParams(targetFilters)
      if (targetPage > 1) sp.set("page", String(targetPage))
      const qs = sp.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [filters, page, pathname, router],
  )

  const handleFiltersChange = useCallback(
    (newFilters: FilterState) => {
      // Cualquier cambio de filtros vuelve a página 1.
      writeUrl({ filters: newFilters, page: 1 })
    },
    [writeUrl],
  )

  const handlePageChange = useCallback(
    (newPage: number) => {
      writeUrl({ page: newPage })
      window.scrollTo({ top: 0, behavior: "smooth" })
    },
    [writeUrl],
  )

  // Fetch con debounce y cancelación. La URL es la única fuente de verdad.
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    let cancelled = false

    const run = async () => {
      setLoading(true)
      setRequestError(null)
      try {
        const params = filtersToParams(filters, { includeClientSort: false })
        const priceSort = isPriceSort(filters.sortBy)
        const hasKeywordSearch = Boolean(filters.keyword.trim())

        if (hasKeywordSearch) {
          params.delete("keyword")
        }

        params.set("limit", String(priceSort || hasKeywordSearch ? 1 : PAGE_SIZE))
        params.set("page", String(priceSort || hasKeywordSearch ? 1 : page))

        const res = await fetch(`${API_BASE}/profesionales/verificados?${params.toString()}`, {
          signal: controller.signal,
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        let data = await res.json()
        if (cancelled) return

        if (priceSort || hasKeywordSearch) {
          const totalItems = Number(data?.meta?.totalItems ?? 0)
          if (totalItems > 1) {
            const allParams = filtersToParams(filters, { includeClientSort: false })
            if (hasKeywordSearch) {
              allParams.delete("keyword")
            }
            allParams.set("limit", String(totalItems))
            allParams.set("page", "1")
            const allRes = await fetch(`${API_BASE}/profesionales/verificados?${allParams.toString()}`, {
              signal: controller.signal,
            })
            if (!allRes.ok) throw new Error(`HTTP ${allRes.status}`)
            data = await allRes.json()
            if (cancelled) return
          }
        }

        const raw = Array.isArray(data) ? data : data?.data ?? []
        const filteredRaw = raw
          .filter((item: ProfessionalApiItem) => matchesProvinceFilter(item, filters.province))
          .filter((item: ProfessionalApiItem) => matchesKeywordFilter(item, filters.keyword))
        const mapped = sortClientSide(filteredRaw.map(mapProfessional), filters.sortBy)
        const visibleProfessionals =
          priceSort || hasKeywordSearch ? mapped.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : mapped

        setProfessionals(visibleProfessionals)
        setMeta(
          data?.meta && filteredRaw.length === raw.length && !priceSort && !hasKeywordSearch
            ? data.meta
            : {
                totalItems: mapped.length,
                totalPages: Math.max(1, Math.ceil(mapped.length / PAGE_SIZE)),
                currentPage: page,
              },
        )
      } catch (error: any) {
        if (error?.name !== "AbortError" && !cancelled) {
          console.error("Error fetching professionals:", error)
          setProfessionals([])
          setMeta({ totalItems: 0, totalPages: 1, currentPage: 1 })
          setRequestError("No se pudieron cargar los profesionales en este momento. Intenta nuevamente en unos minutos.")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    // Debounce sólo para el typing del keyword; el resto podría ser inmediato,
    // pero un mismo timeout es suficiente y mantiene la UX consistente.
    debounceTimer.current = setTimeout(run, 350)

    return () => {
      cancelled = true
      controller.abort()
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [filters, page])

  const hasActiveFilters =
    filters.keyword ||
    filters.profession ||
    filters.specialty ||
    filters.province ||
    filters.city ||
    filters.verifiedOnly

  return (
    <div className="w-full bg-background">
      <Header />

      <section className="relative pt-28 pb-6 px-4 md:px-6 bg-white">
        <div className="absolute inset-0 bg-gray-50 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-4xl md:text-7xl font-bold text-foreground mb-4 tracking-tight">
              Todos los
              <br />
              <span className="text-primary">Profesionales</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Explora nuestra red completa de profesionales verificados. Filtra y encuentra el experto que necesitas.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        <ProfessionalsFilters filters={filters} onFiltersChange={handleFiltersChange} />
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-4">
        <p className="text-sm text-muted-foreground">
          {meta.totalItems} profesional{meta.totalItems !== 1 ? "es" : ""} encontrado
          {meta.totalItems !== 1 ? "s" : ""}
          {loading && <span className="ml-2 animate-pulse text-blue-500">Cargando...</span>}
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-16">
        {requestError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {requestError}
          </div>
        )}

        {professionals.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {professionals.map((professional, index) => (
                <div
                  key={professional.id}
                  className="group relative bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative h-80 overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5">
                    <img
                      src={professional.image}
                      alt={professional.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-40" />
                    {professional.featured && (
                      <div className="absolute top-4 right-4 bg-white text-black backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg z-20">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" aria-hidden="true" />
                        <span className="text-xs font-bold">Destacado</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-foreground mb-1">{professional.name}</h3>
                    <p className="text-sm text-primary font-semibold mb-4">{professional.specialty}</p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Experiencia</span>
                        <span className="font-semibold text-foreground">{professional.experience}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin size={14} />
                        {professional.location}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold text-blue-900">{professional.price}</span>
                        {professional.price !== "A convenir" && (
                          <span className="text-xs text-gray-500 font-medium">/ {professional.unit}</span>
                        )}
                      </div>
                      <Link
                        href={professional.slug ? `/perfil/${professional.slug}` : "/profesionales"}
                        className="bg-blue-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-800 transition-colors shadow-lg shadow-blue-900/20 flex items-center gap-2 group"
                      >
                        Ver Perfil <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 flex flex-col items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="p-3 rounded-full border border-gray-200 hover:bg-primary hover:text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-black transition"
                    title="Página anterior"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <div className="flex items-center gap-1">
                    {(() => {
                      const totalPages = meta.totalPages
                      const items: Array<number | "..."> = []
                      if (totalPages <= 7) {
                        for (let i = 1; i <= totalPages; i++) items.push(i)
                      } else {
                        items.push(1)
                        if (page > 3) items.push("...")
                        const start = Math.max(2, page - 1)
                        const end = Math.min(totalPages - 1, page + 1)
                        for (let i = start; i <= end; i++) items.push(i)
                        if (page < totalPages - 2) items.push("...")
                        items.push(totalPages)
                      }
                      return items.map((p, idx) =>
                        p === "..." ? (
                          <span key={`dots-${idx}`} className="px-2 text-gray-400">
                            ...
                          </span>
                        ) : (
                          <button
                            key={`page-${p}`}
                            onClick={() => handlePageChange(p)}
                            className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-semibold transition ${
                              page === p
                                ? "bg-primary text-primary-foreground shadow-md"
                                : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                            title={`Ir a página ${p}`}
                          >
                            {p}
                          </button>
                        ),
                      )
                    })()}
                  </div>

                  <button
                    onClick={() => handlePageChange(Math.min(meta.totalPages, page + 1))}
                    disabled={page === meta.totalPages}
                    className="p-3 rounded-full border border-gray-200 hover:bg-primary hover:text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-black transition"
                    title="Página siguiente"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
                <span className="text-xs text-gray-400 mt-2">
                  Página {page} de {meta.totalPages}
                </span>
              </div>
          </div>
        ) : (
          !loading && (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                {hasActiveFilters
                  ? "Aún no hay profesionales registrados con estos filtros."
                  : "Aún no hay profesionales verificados disponibles."}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={() => handleFiltersChange(EMPTY_FILTERS)}
                  className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )
        )}
      </section>

      <section className="max-w-4xl mx-auto px-4 md:px-6 pb-16">
        <div className="bg-background rounded-3xl p-8 md:p-12 border border-primary/20 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">¿Eres un profesional destacado?</h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Únete a nuestra red de expertos verificados y conecta con clientes que buscan excelencia
          </p>
          <Link
            href="/preinscripcion"
            className="group px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-all hover:shadow-xl hover:shadow-primary/20 inline-flex items-center gap-3"
          >
            Crear perfil profesional
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default function ProfessionalsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ProfessionalsPageInner />
    </Suspense>
  )
}
