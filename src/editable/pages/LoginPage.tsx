import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableLocalLoginForm } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ path: '/login', title: 'Login', description: pagesContent.auth.login.metadataDescription })
}

export default function LoginPage() {
  return (
    <EditableSiteShell>
      <main className="bg-[var(--slot4-panel-bg)] text-[var(--slot4-page-text)]">
        <section className="mx-auto grid min-h-[calc(100vh-12rem)] max-w-[var(--editable-container)] items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:px-8">
          <div className="hidden rounded-3xl border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] p-10 text-[var(--slot4-page-text)] lg:block lg:min-h-[520px] lg:p-14">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--slot4-muted-text)]">{pagesContent.auth.login.badge}</p>
            <h1 className="editable-display mt-5 max-w-md text-4xl font-semibold leading-[1.06] tracking-[-0.03em] sm:text-5xl">{pagesContent.auth.login.title}</h1>
            <p className="mt-5 max-w-sm text-base leading-7 text-[var(--slot4-muted-text)]">{pagesContent.auth.login.description}</p>
            <ul className="mt-10 space-y-4">
              {pagesContent.home.features.items.slice(0, 3).map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-6 text-[var(--slot4-page-text)]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--slot4-highlight)]" /> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-7 shadow-[0_4px_24px_rgba(0,0,0,0.08)] sm:p-9">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--slot4-accent)] lg:hidden">{pagesContent.auth.login.badge}</p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-0.01em] lg:mt-0">{pagesContent.auth.login.formTitle}</h2>
            <EditableLocalLoginForm />
            <p className="mt-6 text-sm text-[var(--slot4-muted-text)]">New here? <Link href="/signup" className="font-semibold text-[var(--slot4-accent)] underline-offset-4 hover:underline">{pagesContent.auth.login.createCta}</Link></p>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
