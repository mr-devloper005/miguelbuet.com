'use client'

import { FormEvent, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Bookmark, Building2, CheckCircle2, FileText, ImageIcon, Lock, PlusCircle, Send, Sparkles } from 'lucide-react'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc, editablePalette as pal } from '@/editable/layouts/design-contract'

type DraftPost = {
  id: string
  task: TaskKey
  title: string
  category: string
  summary: string
  url: string
  image: string
  body: string
  createdAt: string
}

const STORE_KEY = 'slot4:created-posts'

const taskIcon: Record<string, typeof FileText> = {
  article: FileText,
  listing: Building2,
  classified: PlusCircle,
  image: ImageIcon,
  profile: Sparkles,
  pdf: FileText,
  sbm: Bookmark,
}

const fieldClass = 'w-full rounded-xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-4 py-3 text-sm font-medium text-[var(--slot4-page-text)] outline-none transition placeholder:text-[var(--slot4-muted-text)] focus:border-[var(--slot4-accent)]'

const saveDraft = (draft: DraftPost) => {
  try {
    const existing = JSON.parse(window.localStorage.getItem(STORE_KEY) || '[]')
    const list = Array.isArray(existing) ? existing : []
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft, ...list].slice(0, 50)))
  } catch {
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft]))
  }
}

export default function CreatePage() {
  const { session } = useEditableLocalAuthSession()
  const enabledTasks = useMemo(() => SITE_CONFIG.tasks.filter((task) => task.enabled), [])
  const [task, setTask] = useState<TaskKey>((enabledTasks[0]?.key || 'article') as TaskKey)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [summary, setSummary] = useState('')
  const [url, setUrl] = useState('')
  const [image, setImage] = useState('')
  const [body, setBody] = useState('')
  const [created, setCreated] = useState<DraftPost | null>(null)

  const activeTask = enabledTasks.find((item) => item.key === task) || enabledTasks[0]
  const stepTwoComplete = Boolean(title.trim() && summary.trim() && body.trim())

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const draft: DraftPost = {
      id: `draft-${Date.now()}`,
      task,
      title: title.trim(),
      category: category.trim() || 'uncategorized',
      summary: summary.trim(),
      url: url.trim(),
      image: image.trim(),
      body: body.trim(),
      createdAt: new Date().toISOString(),
    }
    saveDraft(draft)
    setCreated(draft)
    setTitle('')
    setCategory('')
    setSummary('')
    setUrl('')
    setImage('')
    setBody('')
  }

  if (!session) {
    return (
      <EditableSiteShell>
        <main className={`min-h-screen px-4 py-16 sm:px-6 lg:px-8 ${pal.pageBg} ${pal.pageText}`}>
          <section className={`mx-auto grid max-w-5xl gap-8 p-7 md:grid-cols-[0.9fr_1.1fr] md:p-10 ${dc.surface.card}`}>
            <div className="flex h-full min-h-72 items-center justify-center rounded-2xl bg-[var(--slot4-dark-bg)] text-white">
              <Lock className="h-16 w-16 text-white/70" />
            </div>
            <div className="self-center">
              <p className={dc.type.eyebrow}>{pagesContent.create.locked.badge}</p>
              <h1 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-[-0.02em] sm:text-5xl">{pagesContent.create.locked.title}</h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-[var(--slot4-muted-text)]">{pagesContent.create.locked.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/login" className={dc.button.primary}>Login <ArrowRight className="h-4 w-4" /></Link>
                <Link href="/signup" className={dc.button.secondary}>Sign up</Link>
              </div>
            </div>
          </section>
        </main>
      </EditableSiteShell>
    )
  }

  return (
    <EditableSiteShell>
      <main className={`min-h-screen ${pal.pageBg} ${pal.pageText}`}>
        <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          {/* Step indicator */}
          <div className="mb-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm font-semibold">
            <span className="inline-flex items-center gap-2 text-[var(--slot4-accent)]">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--slot4-accent)] text-xs text-white">1</span> Choose type
            </span>
            <span className={`inline-flex items-center gap-2 ${stepTwoComplete ? 'text-[var(--slot4-accent)]' : 'text-[var(--slot4-muted-text)]'}`}>
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${stepTwoComplete ? 'bg-[var(--slot4-accent)] text-white' : 'border border-[var(--editable-border)] text-[var(--slot4-muted-text)]'}`}>2</span> Add details
            </span>
            <span className={`inline-flex items-center gap-2 ${created ? 'text-[var(--slot4-accent)]' : 'text-[var(--slot4-muted-text)]'}`}>
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${created ? 'bg-[var(--slot4-accent)] text-white' : 'border border-[var(--editable-border)] text-[var(--slot4-muted-text)]'}`}>3</span> Publish
            </span>
          </div>

          <div className={`grid gap-8 p-6 lg:grid-cols-[0.85fr_1.15fr] lg:p-10 ${dc.surface.card}`}>
            <aside>
              <p className={dc.type.eyebrow}>{pagesContent.create.hero.badge}</p>
              <h1 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-[-0.02em] sm:text-5xl">{pagesContent.create.hero.title}</h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-[var(--slot4-muted-text)]">{pagesContent.create.hero.description}</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {enabledTasks.map((item) => {
                  const Icon = taskIcon[item.key] || FileText
                  const active = item.key === task
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setTask(item.key)}
                      className={`rounded-2xl border p-4 text-left transition duration-300 ${
                        active
                          ? 'border-[var(--slot4-accent)] bg-[var(--slot4-dark-bg)] text-white'
                          : `${pal.border} ${pal.surfaceBg} hover:-translate-y-0.5 hover:border-[var(--slot4-accent)]/40`
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${active ? 'text-[var(--slot4-accent)]' : 'text-[var(--slot4-accent)]'}`} />
                      <span className="mt-3 block text-sm font-bold">{item.label}</span>
                      <span className={`mt-1 block text-xs ${active ? 'text-white/60' : 'text-[var(--slot4-muted-text)]'}`}>{item.description}</span>
                    </button>
                  )
                })}
              </div>
            </aside>

            <form onSubmit={submit} className={`rounded-2xl border ${pal.border} ${pal.panelBg} p-5 sm:p-7`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--slot4-soft-muted-text)]">Create {activeTask?.label || 'post'}</p>
                  <h2 className="mt-1 text-2xl font-bold tracking-[-0.02em]">{pagesContent.create.formTitle}</h2>
                </div>
                <span className={`rounded-full ${pal.surfaceBg} px-4 py-2 text-xs font-bold uppercase tracking-[0.12em]`}>{session.name}</span>
              </div>

              <div className="mt-6 grid gap-4">
                <input className={fieldClass} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" required />
                <div className="grid gap-4 sm:grid-cols-2">
                  <input className={fieldClass} value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Category" />
                  <input className={fieldClass} value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Website or source URL" />
                </div>
                <input className={fieldClass} value={image} onChange={(event) => setImage(event.target.value)} placeholder="Featured image URL" />
                <textarea className={`${fieldClass} min-h-24`} value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="Short summary" required />
                <textarea className={`${fieldClass} min-h-48`} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Main content, details, notes, or description" required />
              </div>

              {created ? (
                <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                  <p className="flex items-center gap-2 text-sm font-bold"><CheckCircle2 className="h-5 w-5" /> {pagesContent.create.successTitle}</p>
                  <p className="mt-1 text-sm font-medium opacity-80">{created.title}</p>
                </div>
              ) : null}

              <button type="submit" className={`${dc.button.primary} mt-5 w-full`}>
                <Send className="h-4 w-4" /> {pagesContent.create.submitLabel}
              </button>
            </form>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
