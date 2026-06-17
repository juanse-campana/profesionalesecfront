import { Award, CheckCircle2, Eye, Heart, Lightbulb, Shield, Target, Users } from "lucide-react"
import type { AboutUsContent } from "@/lib/cms-legal"

const valueIcons = [Award, Lightbulb, Shield, Heart]

export function AboutRenderer({ content }: { content: AboutUsContent }) {
  return (
    <div className="max-w-6xl mx-auto divide-y divide-black/10">
      <section className="pb-14">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary">{content.hero.eyebrow}</p>
        <h1 className="mb-6 text-4xl font-bold text-slate-950 md:text-5xl">{content.hero.title}</h1>
        <p className="max-w-3xl text-base leading-relaxed text-slate-700 md:text-lg">{content.hero.description}</p>
      </section>

      <section className="grid gap-10 py-14 md:grid-cols-2">
        <article>
          <div className="mb-4 flex items-center gap-3">
            <Target className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-slate-950">{content.mission.title}</h2>
          </div>
          <p className="leading-relaxed text-slate-700">{content.mission.body}</p>
        </article>

        <article>
          <div className="mb-4 flex items-center gap-3">
            <Eye className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-slate-950">{content.vision.title}</h2>
          </div>
          <p className="leading-relaxed text-slate-700">{content.vision.body}</p>
        </article>
      </section>

      <section className="grid gap-10 py-14 lg:grid-cols-12">
        <article className="lg:col-span-7">
          <div className="mb-5 flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-slate-950">{content.whoWeAre.title}</h2>
          </div>
          <div className="space-y-4 leading-relaxed text-slate-700">
            {content.whoWeAre.paragraphs.map((paragraph, index) => (
              <p key={`${content.whoWeAre.title}-${index}`} className={index === content.whoWeAre.highlightedParagraphIndex ? "text-slate-600 italic" : undefined}>
                {paragraph}
              </p>
            ))}
          </div>
        </article>

        <article className="lg:col-span-5 lg:border-l lg:border-black/10 lg:pl-8">
          <h2 className="mb-5 text-2xl font-bold text-slate-950">{content.history.title}</h2>
          <div className="space-y-4 leading-relaxed text-slate-700">
            {content.history.paragraphs.map((paragraph, index) => (
              <p key={`${content.history.title}-${index}`} className={index === content.history.highlightedParagraphIndex ? "font-medium text-primary" : undefined}>
                {paragraph}
              </p>
            ))}
          </div>
        </article>
      </section>

      <section className="py-14">
        <h2 className="mb-8 text-3xl font-bold text-slate-950">{content.founders.title}</h2>
        <div className="grid gap-8 md:grid-cols-2">
          {content.founders.items.map((founder) => (
            <div key={founder.name} className="border-b border-black/10 pb-6">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary text-lg font-bold text-primary">
                {founder.initials}
              </div>
              <h3 className="text-xl font-bold text-slate-950">{founder.name}</h3>
              <p className="text-sm font-medium text-primary">{founder.role}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-14">
        <h2 className="mb-8 text-3xl font-bold text-slate-950">{content.values.title}</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {content.values.items.map((value, index) => {
            const Icon = valueIcons[index % valueIcons.length]
            return (
              <article key={`${value.title}-${index}`} className="border-b border-black/10 pb-6">
                <div className="flex items-start gap-4">
                  <Icon className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <h3 className="mb-2 text-lg font-bold text-slate-950">{value.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-700">{value.description}</p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="grid gap-10 py-14 lg:grid-cols-2">
        <article>
          <h2 className="mb-6 text-3xl font-bold text-slate-950">{content.trustReasons.title}</h2>
          <ul className="space-y-4">
            {content.trustReasons.items.map((item, index) => (
              <li key={`${item}-${index}`} className="flex items-start gap-3 leading-relaxed text-slate-700">
                <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article>
          <h2 className="mb-6 text-3xl font-bold text-slate-950">{content.commitments.title}</h2>
          <ul className="space-y-4">
            {content.commitments.items.map((item, index) => (
              <li key={`${item}-${index}`} className="flex items-start gap-3 leading-relaxed text-slate-700">
                <span className="mt-2.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="pt-14">
        <h2 className="mb-5 text-2xl font-bold text-slate-950 md:text-3xl">{content.eventsAndConversations.title}</h2>
        <div className="space-y-4 border-l-2 border-primary pl-5 leading-relaxed text-slate-700">
          {content.eventsAndConversations.paragraphs.map((paragraph, index) => (
            <p key={`${content.eventsAndConversations.title}-${index}`} className={index === content.eventsAndConversations.highlightedParagraphIndex ? "font-semibold text-slate-950" : undefined}>
              {paragraph}
            </p>
          ))}
        </div>
      </section>
    </div>
  )
}
