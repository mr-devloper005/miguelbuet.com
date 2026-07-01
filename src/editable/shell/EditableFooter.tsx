'use client'

import Link from 'next/link'
import { ArrowUpRight, Building2, Bookmark } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

export function EditableFooter() {
  const taskLinks = SITE_CONFIG.tasks.filter((task) => task.enabled)
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()

  const resourceLinks = [
    ['About', '/about'],
    ['Contact', '/contact'],
    ['Search', '/search'],
  ] as const

  const accountLinks = session
    ? ([['Create a listing', '/create']] as const)
    : ([['Login', '/login'], ['Sign up', '/signup']] as const)

  return (
    <footer className="bg-[var(--editable-footer-bg)] text-[var(--editable-footer-text)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-4 pt-14 sm:px-6 lg:px-8">
        {/* Promo CTA cards */}
        <div className="grid gap-4 border-b border-[var(--slot4-dark-border)] pb-12 sm:grid-cols-2">
          <Link
            href="/create"
            className="group flex items-center justify-between gap-4 rounded-2xl border border-[var(--slot4-dark-border)] bg-[var(--slot4-dark-surface)] p-6 transition duration-300 hover:border-[var(--slot4-accent)]/50"
          >
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--slot4-accent)]"><Building2 className="h-3.5 w-3.5" /> For businesses</p>
              <p className="mt-2 text-lg font-bold">List your business, free to start</p>
            </div>
            <ArrowUpRight className="h-5 w-5 shrink-0 text-white/50 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />
          </Link>
          <Link
            href="/create"
            className="group flex items-center justify-between gap-4 rounded-2xl border border-[var(--slot4-dark-border)] bg-[var(--slot4-dark-surface)] p-6 transition duration-300 hover:border-[var(--slot4-accent)]/50"
          >
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--slot4-accent)]"><Bookmark className="h-3.5 w-3.5" /> For curators</p>
              <p className="mt-2 text-lg font-bold">Submit a bookmark to the board</p>
            </div>
            <ArrowUpRight className="h-5 w-5 shrink-0 text-white/50 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />
          </Link>
        </div>

        <div className="grid gap-10 py-12 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--slot4-accent)]/40 bg-[var(--slot4-dark-surface)]">
                <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-9 w-9 object-contain" />
              </span>
              <span className="editable-display text-xl font-semibold tracking-[-0.01em]">{SITE_CONFIG.name}</span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-7 text-[var(--slot4-dark-muted)]">{globalContent.footer?.description || SITE_CONFIG.description}</p>
          </div>

          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[var(--slot4-accent)]">Explore</h3>
           
          </div>

          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[var(--slot4-accent)]">Resources</h3>
            <div className="mt-4 grid gap-2.5">
              {resourceLinks.map(([label, href]) => (
                <Link key={href} href={href} className="text-sm font-medium text-[var(--slot4-dark-muted)] transition hover:text-white">{label}</Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[var(--slot4-accent)]">Account</h3>
            <div className="mt-4 grid gap-2.5">
              {accountLinks.map(([label, href]) => (
                <Link key={href} href={href} className="text-sm font-medium text-[var(--slot4-dark-muted)] transition hover:text-white">{label}</Link>
              ))}
              {session ? <button type="button" onClick={logout} className="text-left text-sm font-medium text-[var(--slot4-dark-muted)] transition hover:text-white">Logout</button> : null}
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--slot4-dark-border)] px-4 py-5 text-center text-xs font-medium tracking-[0.08em] text-[var(--slot4-dark-muted)]">
        © {year} {SITE_CONFIG.name}. All rights reserved.
      </div>
    </footer>
  )
}
