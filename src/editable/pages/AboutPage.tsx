import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { editableDesignContract as dc, editablePalette as pal } from '@/editable/layouts/design-contract'
import { ScrollReveal } from '@/editable/components/ScrollReveal'

export default function AboutPage() {
  return (
    <EditableSiteShell>
      <main className={pal.pageBg}>
        <section className="border-b border-[var(--editable-border)] bg-[var(--slot4-panel-bg)]">
          <ScrollReveal as="div" className={`mx-auto max-w-[var(--editable-container)] px-4 py-16 sm:px-6 lg:px-8 lg:py-24`}>
            <p className={dc.type.eyebrow}>{pagesContent.about.badge}</p>
            <h1 className="editable-display mt-5 max-w-3xl text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.035em] text-[var(--slot4-page-text)] sm:text-6xl lg:text-7xl">{pagesContent.about.title}</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--slot4-muted-text)]">{pagesContent.about.description}</p>
          </ScrollReveal>
        </section>

        <section className={`${dc.shell.sectionY} mx-auto grid max-w-[var(--editable-container)] gap-8 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8`}>
          <ScrollReveal as="article" className={`${dc.surface.card} p-8 lg:p-12`}>
            <h2 className="text-2xl font-bold tracking-[-0.01em] text-[var(--slot4-page-text)]">About {SITE_CONFIG.name}</h2>
            <div className="mt-6 space-y-4 text-base leading-8 text-[var(--slot4-muted-text)]">
              {pagesContent.about.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </ScrollReveal>
          <ScrollReveal as="aside" stagger className="space-y-4">
            {pagesContent.about.values.map((value) => (
              <div key={value.title} className={`${dc.surface.soft} p-6`}>
                <h3 className="text-lg font-bold tracking-[-0.01em] text-[var(--slot4-page-text)]">{value.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--slot4-muted-text)]">{value.description}</p>
              </div>
            ))}
          </ScrollReveal>
        </section>
      </main>
    </EditableSiteShell>
  )
}
