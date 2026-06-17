"use client"

import { useEffect, useMemo, useState } from "react"
import type { ButtonHTMLAttributes, ReactNode } from "react"
import { Plus, Save, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { AboutRenderer } from "@/components/legal/about-renderer"
import { TermsRenderer } from "@/components/legal/terms-renderer"
import {
  cmsLegalApi,
  defaultAboutUsContent,
  defaultFooterFaqs,
  defaultTermsAndConditionsContent,
  type AboutUsContent,
  type CmsFaqItem,
  type FooterFaqsContent,
  type TermsAndConditionsContent,
  type TermsSection,
} from "@/lib/cms-legal"

type ContentKey = "footerFaqs" | "aboutUs" | "termsAndConditions"

type StringListEditorProps = {
  label: string
  items?: string[]
  onChange: (items: string[]) => void
  addLabel?: string
}

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

function ensureStringArray(items?: string[]) {
  return Array.isArray(items) ? items : []
}

function ensureTermsSection(section: TermsSection, index: number): TermsSection {
  return {
    id: section.id ?? `seccion-${index + 1}`,
    title: section.title ?? "",
    paragraphs: ensureStringArray(section.paragraphs),
    bulletItems: ensureStringArray(section.bulletItems),
    closingParagraph: section.closingParagraph ?? "",
  }
}

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  )
}

function PrimaryButton({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 ${props.className ?? ""}`}
    >
      {children}
    </button>
  )
}

function SecondaryButton({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 ${props.className ?? ""}`}
    >
      {children}
    </button>
  )
}

function DangerButton({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 ${props.className ?? ""}`}
    >
      {children}
    </button>
  )
}

function StringListEditor({ label, items, onChange, addLabel = "Agregar item" }: StringListEditorProps) {
  const safeItems = ensureStringArray(items)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-gray-800">{label}</h4>
        <SecondaryButton type="button" onClick={() => onChange([...safeItems, ""])}>
          <Plus className="h-4 w-4" />
          {addLabel}
        </SecondaryButton>
      </div>
      <div className="space-y-3">
        {safeItems.map((item, index) => (
          <div key={`${label}-${index}`} className="flex gap-2">
            <Textarea
              value={item}
              onChange={(event) => onChange(safeItems.map((current, currentIndex) => (currentIndex === index ? event.target.value : current)))}
              rows={2}
              className="bg-white"
            />
            <DangerButton type="button" onClick={() => onChange(safeItems.filter((_, currentIndex) => currentIndex !== index))}>
              <Trash2 className="h-4 w-4" />
            </DangerButton>
          </div>
        ))}
      </div>
    </div>
  )
}

function ParagraphSectionEditor({
  label,
  value,
  onChange,
}: {
  label: string
  value: AboutUsContent["whoWeAre"]
  onChange: (value: AboutUsContent["whoWeAre"]) => void
}) {
  return (
    <SectionCard title={label}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-gray-700">Título</label>
          <Input value={value.title} onChange={(event) => onChange({ ...value, title: event.target.value })} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-gray-700">Párrafo destacado</label>
          <Input
            type="number"
            min={0}
            max={Math.max(value.paragraphs.length - 1, 0)}
            value={value.highlightedParagraphIndex}
            onChange={(event) =>
              onChange({
                ...value,
                highlightedParagraphIndex: Number(event.target.value || 0),
              })
            }
          />
        </div>
      </div>
      <StringListEditor label="Párrafos" items={value.paragraphs} onChange={(paragraphs) => onChange({ ...value, paragraphs })} addLabel="Agregar párrafo" />
    </SectionCard>
  )
}

function FaqGroupEditor({
  title,
  items,
  onChange,
}: {
  title: string
  items: CmsFaqItem[]
  onChange: (items: CmsFaqItem[]) => void
}) {
  return (
    <SectionCard title={title}>
      <div className="flex justify-end">
        <SecondaryButton type="button" onClick={() => onChange([...items, { question: "", answer: "" }])}>
          <Plus className="h-4 w-4" />
          Agregar FAQ
        </SecondaryButton>
      </div>
      <div className="space-y-4">
        {items.map((faq, index) => (
          <div key={`${title}-${index}`} className="rounded-xl border border-gray-200 p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <span className="text-sm font-semibold text-gray-800">FAQ #{index + 1}</span>
              <DangerButton type="button" onClick={() => onChange(items.filter((_, currentIndex) => currentIndex !== index))}>
                <Trash2 className="h-4 w-4" />
                Eliminar
              </DangerButton>
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Pregunta</label>
                <Input
                  value={faq.question}
                  onChange={(event) =>
                    onChange(items.map((current, currentIndex) => (currentIndex === index ? { ...current, question: event.target.value } : current)))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Respuesta</label>
                <Textarea
                  rows={3}
                  value={faq.answer}
                  onChange={(event) =>
                    onChange(items.map((current, currentIndex) => (currentIndex === index ? { ...current, answer: event.target.value } : current)))
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

function AboutEditor({ value, onChange }: { value: AboutUsContent; onChange: (value: AboutUsContent) => void }) {
  return (
    <div className="space-y-6">
      <SectionCard title="Hero">
        <div className="grid gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Eyebrow</label>
            <Input value={value.hero.eyebrow} onChange={(event) => onChange({ ...value, hero: { ...value.hero, eyebrow: event.target.value } })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Título</label>
            <Input value={value.hero.title} onChange={(event) => onChange({ ...value, hero: { ...value.hero, title: event.target.value } })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Descripción</label>
            <Textarea rows={4} value={value.hero.description} onChange={(event) => onChange({ ...value, hero: { ...value.hero, description: event.target.value } })} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Misión y Visión">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Título Misión</label>
            <Input value={value.mission.title} onChange={(event) => onChange({ ...value, mission: { ...value.mission, title: event.target.value } })} />
            <label className="text-sm font-medium text-gray-700">Contenido Misión</label>
            <Textarea rows={5} value={value.mission.body} onChange={(event) => onChange({ ...value, mission: { ...value.mission, body: event.target.value } })} />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Título Visión</label>
            <Input value={value.vision.title} onChange={(event) => onChange({ ...value, vision: { ...value.vision, title: event.target.value } })} />
            <label className="text-sm font-medium text-gray-700">Contenido Visión</label>
            <Textarea rows={5} value={value.vision.body} onChange={(event) => onChange({ ...value, vision: { ...value.vision, body: event.target.value } })} />
          </div>
        </div>
      </SectionCard>

      <ParagraphSectionEditor label="Quiénes Somos" value={value.whoWeAre} onChange={(whoWeAre) => onChange({ ...value, whoWeAre })} />
      <ParagraphSectionEditor label="Nuestra Historia" value={value.history} onChange={(history) => onChange({ ...value, history })} />

      <SectionCard title="Fundadores">
        <div className="mb-4 flex justify-end">
          <SecondaryButton type="button" onClick={() => onChange({ ...value, founders: { ...value.founders, items: [...value.founders.items, { initials: "", name: "", role: "" }] } })}>
            <Plus className="h-4 w-4" />
            Agregar fundador
          </SecondaryButton>
        </div>
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Título de la sección</label>
            <Input value={value.founders.title} onChange={(event) => onChange({ ...value, founders: { ...value.founders, title: event.target.value } })} />
          </div>
          {value.founders.items.map((item, index) => (
            <div key={`${item.name}-${index}`} className="grid gap-3 rounded-xl border border-gray-200 p-4 md:grid-cols-[120px_1fr_1fr_auto]">
              <Input placeholder="Iniciales" value={item.initials} onChange={(event) => onChange({ ...value, founders: { ...value.founders, items: value.founders.items.map((current, currentIndex) => currentIndex === index ? { ...current, initials: event.target.value } : current) } })} />
              <Input placeholder="Nombre" value={item.name} onChange={(event) => onChange({ ...value, founders: { ...value.founders, items: value.founders.items.map((current, currentIndex) => currentIndex === index ? { ...current, name: event.target.value } : current) } })} />
              <Input placeholder="Rol" value={item.role} onChange={(event) => onChange({ ...value, founders: { ...value.founders, items: value.founders.items.map((current, currentIndex) => currentIndex === index ? { ...current, role: event.target.value } : current) } })} />
              <DangerButton type="button" onClick={() => onChange({ ...value, founders: { ...value.founders, items: value.founders.items.filter((_, currentIndex) => currentIndex !== index) } })}>
                <Trash2 className="h-4 w-4" />
              </DangerButton>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Valores">
        <div className="mb-4 flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <label className="text-sm font-medium text-gray-700">Título de la sección</label>
            <Input value={value.values.title} onChange={(event) => onChange({ ...value, values: { ...value.values, title: event.target.value } })} />
          </div>
          <div className="ml-4 pt-6">
            <SecondaryButton type="button" onClick={() => onChange({ ...value, values: { ...value.values, items: [...value.values.items, { title: "", description: "" }] } })}>
              <Plus className="h-4 w-4" />
              Agregar valor
            </SecondaryButton>
          </div>
        </div>
        <div className="space-y-3">
          {value.values.items.map((item, index) => (
            <div key={`${item.title}-${index}`} className="rounded-xl border border-gray-200 p-4">
              <div className="mb-3 flex justify-end">
                <DangerButton type="button" onClick={() => onChange({ ...value, values: { ...value.values, items: value.values.items.filter((_, currentIndex) => currentIndex !== index) } })}>
                  <Trash2 className="h-4 w-4" />
                </DangerButton>
              </div>
              <div className="space-y-3">
                <Input placeholder="Título" value={item.title} onChange={(event) => onChange({ ...value, values: { ...value.values, items: value.values.items.map((current, currentIndex) => currentIndex === index ? { ...current, title: event.target.value } : current) } })} />
                <Textarea placeholder="Descripción" rows={3} value={item.description} onChange={(event) => onChange({ ...value, values: { ...value.values, items: value.values.items.map((current, currentIndex) => currentIndex === index ? { ...current, description: event.target.value } : current) } })} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Confianza y Compromiso">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700">Título de razones de confianza</label>
            <Input value={value.trustReasons.title} onChange={(event) => onChange({ ...value, trustReasons: { ...value.trustReasons, title: event.target.value } })} />
            <StringListEditor label="Razones" items={value.trustReasons.items} onChange={(items) => onChange({ ...value, trustReasons: { ...value.trustReasons, items } })} addLabel="Agregar razón" />
          </div>
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700">Título de compromisos</label>
            <Input value={value.commitments.title} onChange={(event) => onChange({ ...value, commitments: { ...value.commitments, title: event.target.value } })} />
            <StringListEditor label="Compromisos" items={value.commitments.items} onChange={(items) => onChange({ ...value, commitments: { ...value.commitments, items } })} addLabel="Agregar compromiso" />
          </div>
        </div>
      </SectionCard>

      <ParagraphSectionEditor label="Conversatorios y Eventos" value={value.eventsAndConversations} onChange={(eventsAndConversations) => onChange({ ...value, eventsAndConversations })} />
    </div>
  )
}

function TermsSectionsEditor({ value, onChange }: { value: TermsAndConditionsContent; onChange: (value: TermsAndConditionsContent) => void }) {
  const safeSections = Array.isArray(value.sections) ? value.sections.map(ensureTermsSection) : []

  const updateSection = (index: number, next: TermsSection) => {
    onChange({
      ...value,
      sections: safeSections.map((section, currentIndex) => (currentIndex === index ? ensureTermsSection(next, index) : section)),
    })
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Hero">
        <div className="grid gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Badge</label>
            <Input value={value.hero.badge} onChange={(event) => onChange({ ...value, hero: { ...value.hero, badge: event.target.value } })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Título</label>
            <Input value={value.hero.title} onChange={(event) => onChange({ ...value, hero: { ...value.hero, title: event.target.value } })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Texto de última actualización</label>
            <Input value={value.hero.lastUpdatedLabel} onChange={(event) => onChange({ ...value, hero: { ...value.hero, lastUpdatedLabel: event.target.value } })} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Secciones de Términos">
        <div className="mb-4 flex justify-end">
          <SecondaryButton type="button" onClick={() => onChange({ ...value, sections: [...safeSections, { id: `seccion-${safeSections.length + 1}`, title: "", paragraphs: [""], bulletItems: [], closingParagraph: "" }] })}>
            <Plus className="h-4 w-4" />
            Agregar sección
          </SecondaryButton>
        </div>

        <div className="space-y-4">
          {safeSections.map((section, index) => (
            <div key={`${section.id}-${index}`} className="rounded-xl border border-gray-200 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-gray-800">Sección #{index + 1}</span>
                <DangerButton type="button" onClick={() => onChange({ ...value, sections: safeSections.filter((_, currentIndex) => currentIndex !== index) })}>
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </DangerButton>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">ID</label>
                  <Input value={section.id} onChange={(event) => updateSection(index, { ...section, id: event.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Título</label>
                  <Input value={section.title} onChange={(event) => updateSection(index, { ...section, title: event.target.value })} />
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <StringListEditor label="Párrafos" items={section.paragraphs} onChange={(paragraphs) => updateSection(index, { ...section, paragraphs })} addLabel="Agregar párrafo" />
                <StringListEditor label="Bullet points" items={section.bulletItems} onChange={(bulletItems) => updateSection(index, { ...section, bulletItems })} addLabel="Agregar bullet" />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Párrafo de cierre</label>
                  <Textarea rows={3} value={section.closingParagraph} onChange={(event) => updateSection(index, { ...section, closingParagraph: event.target.value })} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Contacto">
        <div className="grid gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Título</label>
            <Input value={value.contact.title} onChange={(event) => onChange({ ...value, contact: { ...value.contact, title: event.target.value } })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Introducción</label>
            <Textarea rows={4} value={value.contact.intro} onChange={(event) => onChange({ ...value, contact: { ...value.contact, intro: event.target.value } })} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Teléfono</label>
              <Input value={value.contact.phone} onChange={(event) => onChange({ ...value, contact: { ...value.contact, phone: event.target.value } })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input value={value.contact.email} onChange={(event) => onChange({ ...value, contact: { ...value.contact, email: event.target.value } })} />
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}

export default function CmsLegalAdminPage() {
  const { toast } = useToast()
  const [selectedContentKey, setSelectedContentKey] = useState<ContentKey>("footerFaqs")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [footerFaqs, setFooterFaqs] = useState<FooterFaqsContent>(cloneValue(defaultFooterFaqs))
  const [aboutUs, setAboutUs] = useState<AboutUsContent>(cloneValue(defaultAboutUsContent))
  const [termsAndConditions, setTermsAndConditions] = useState<TermsAndConditionsContent>(cloneValue(defaultTermsAndConditionsContent))
  const [savedSnapshot, setSavedSnapshot] = useState<string>("")

  useEffect(() => {
    loadSelectedContent(selectedContentKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedContentKey])

  const activeValue = useMemo(() => {
    if (selectedContentKey === "footerFaqs") return footerFaqs
    if (selectedContentKey === "aboutUs") return aboutUs
    return termsAndConditions
  }, [selectedContentKey, footerFaqs, aboutUs, termsAndConditions])

  const hasUnsavedChanges = savedSnapshot !== JSON.stringify(activeValue)

  const loadSelectedContent = async (key: ContentKey) => {
    const token = localStorage.getItem("auth_token")
    if (!token) return

    setLoading(true)
    try {
      if (key === "footerFaqs") {
        const data = await cmsLegalApi.getAdminFooterFaqs(token)
        setFooterFaqs(data)
        setSavedSnapshot(JSON.stringify(data))
      } else if (key === "aboutUs") {
        const data = await cmsLegalApi.getAdminAboutUs(token)
        setAboutUs(data)
        setSavedSnapshot(JSON.stringify(data))
      } else {
        const data = await cmsLegalApi.getAdminTermsAndConditions(token)
        setTermsAndConditions(data)
        setSavedSnapshot(JSON.stringify(data))
      }
    } catch (error) {
      const description = error instanceof Error ? error.message : "No se pudo cargar el contenido."
      toast({ title: "Error", description, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    const token = localStorage.getItem("auth_token")
    if (!token) return

    setSaving(true)
    try {
      if (selectedContentKey === "footerFaqs") {
        const data = await cmsLegalApi.updateAdminFooterFaqs(footerFaqs, token)
        setFooterFaqs(data)
        setSavedSnapshot(JSON.stringify(data))
      } else if (selectedContentKey === "aboutUs") {
        const data = await cmsLegalApi.updateAdminAboutUs(aboutUs, token)
        setAboutUs(data)
        setSavedSnapshot(JSON.stringify(data))
      } else {
        const data = await cmsLegalApi.updateAdminTermsAndConditions(termsAndConditions, token)
        setTermsAndConditions(data)
        setSavedSnapshot(JSON.stringify(data))
      }

      toast({ title: "Cambios guardados", description: "El contenido del CMS Legal se actualizó correctamente." })
    } catch (error) {
      const description = error instanceof Error ? error.message : "No se pudo guardar el contenido."
      toast({ title: "Error", description, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CMS Legal</h1>
          <p className="text-sm text-gray-500">Administra FAQs del footer, Sobre Nosotros y Términos y Condiciones.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="min-w-[240px]">
            <Select value={selectedContentKey} onValueChange={(value) => setSelectedContentKey(value as ContentKey)}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Seleccionar sección" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="footerFaqs">FAQs del footer</SelectItem>
                <SelectItem value="aboutUs">Sobre Nosotros</SelectItem>
                <SelectItem value="termsAndConditions">Términos y Condiciones</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <PrimaryButton type="button" onClick={handleSave} disabled={loading || saving || !hasUnsavedChanges}>
            <Save className="h-4 w-4" />
            {saving ? "Guardando..." : "Guardar cambios"}
          </PrimaryButton>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : selectedContentKey === "footerFaqs" ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <FaqGroupEditor title="FAQs Profesionales" items={footerFaqs.professionalFaqs} onChange={(professionalFaqs) => setFooterFaqs({ ...footerFaqs, professionalFaqs })} />
          <FaqGroupEditor title="FAQs Conversatorios" items={footerFaqs.conversatorioFaqs} onChange={(conversatorioFaqs) => setFooterFaqs({ ...footerFaqs, conversatorioFaqs })} />
        </div>
      ) : selectedContentKey === "aboutUs" ? (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <AboutEditor value={aboutUs} onChange={setAboutUs} />
          <Card className="border-gray-200 shadow-sm xl:sticky xl:top-6 xl:self-start">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Preview: /sobre-nosotros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[75vh] overflow-auto rounded-2xl border border-gray-200 bg-white p-6">
                <AboutRenderer content={aboutUs} />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <TermsSectionsEditor value={termsAndConditions} onChange={setTermsAndConditions} />
          <Card className="border-gray-200 shadow-sm xl:sticky xl:top-6 xl:self-start">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Preview: /terminos-y-condiciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[75vh] overflow-auto rounded-2xl border border-gray-200 bg-white p-6">
                <TermsRenderer content={termsAndConditions} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
