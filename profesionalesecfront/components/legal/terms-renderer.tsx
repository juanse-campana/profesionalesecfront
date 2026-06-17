import { Mail, Phone, Scale } from "lucide-react"
import type { TermsAndConditionsContent } from "@/lib/cms-legal"

export function TermsRenderer({ content }: { content: TermsAndConditionsContent }) {
  const safeSections = Array.isArray(content?.sections) ? content.sections : []
  const safeContact = content?.contact ?? { title: "", intro: "", phone: "", email: "" }

  return (
    <div className="max-w-6xl mx-auto divide-y divide-black/10">
      <section className="pb-14 text-center md:text-left">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
          <Scale className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">{content.hero.badge}</span>
        </div>
        <h1 className="mb-4 text-4xl font-bold text-slate-950 md:text-5xl">{content.hero.title}</h1>
        <p className="text-base leading-relaxed text-slate-700 md:text-lg">{content.hero.lastUpdatedLabel}</p>
      </section>

      {safeSections.map((section) => {
        const paragraphs = Array.isArray(section?.paragraphs) ? section.paragraphs : []
        const bulletItems = Array.isArray(section?.bulletItems) ? section.bulletItems : []
        const closingParagraph = section?.closingParagraph ?? ""

        return (
          <section key={section.id} className="py-14">
            <h2 className="mb-6 text-2xl font-bold text-slate-950 md:text-3xl">{section.title}</h2>
            <div className="space-y-4 leading-relaxed text-slate-700">
              {paragraphs.map((paragraph, index) => (
                <p key={`${section.id}-paragraph-${index}`}>{paragraph}</p>
              ))}

              {bulletItems.length > 0 && (
                <ul className="space-y-3 pl-1">
                  {bulletItems.map((item, index) => (
                    <li key={`${section.id}-bullet-${index}`} className="flex items-start gap-3">
                      <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {closingParagraph ? <p className="font-medium text-slate-950">{closingParagraph}</p> : null}
            </div>
          </section>
        )
      })}

      <section className="pt-14">
        <div className="rounded-3xl border border-primary/15 bg-primary/[0.03] p-8">
          <h2 className="mb-4 text-2xl font-bold text-slate-950">{safeContact.title}</h2>
          <p className="mb-6 text-slate-700">{safeContact.intro}</p>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-700">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Phone className="h-4 w-4" />
              </div>
              <span>{safeContact.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Mail className="h-4 w-4" />
              </div>
              <a href={`mailto:${safeContact.email}`} className="text-primary hover:underline">
                {safeContact.email}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
