import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Filter, Search, SearchX } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { fetchSiteFeed } from '@/lib/site-connector'
import { getPostTaskKey } from '@/lib/task-data'
import { getMockPostsForTask } from '@/lib/mock-posts'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc, editablePalette as pal } from '@/editable/layouts/design-contract'
import { Ads } from '@/lib/ads'
import { formatRichHtml } from '@/components/shared/rich-content'

export const revalidate = 3

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/search',
    title: pagesContent.search.metadata.title,
    description: pagesContent.search.metadata.description,
  })
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ')
const compactText = (value: unknown) => typeof value === 'string' ? stripHtml(value).replace(/\s+/g, ' ').trim().toLowerCase() : ''
const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const compactRaw = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const getImage = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.find((item) => typeof item?.url === 'string')?.url : ''
  const images = Array.isArray(content.images) ? content.images.find((item) => typeof item === 'string') as string | undefined : ''
  return media || compactRaw(content.featuredImage) || compactRaw(content.image) || compactRaw(content.thumbnail) || images || ''
}
const summaryOf = (post: SitePost) => post.summary || compactRaw(getContent(post).description) || compactRaw(getContent(post).excerpt) || ''

const matches = (post: SitePost, query: string, category: string, task: string) => {
  const content = getContent(post)
  const typeText = compactText(content.type)
  if (typeText === 'comment') return false
  const derivedTask = getPostTaskKey(post) || typeText
  if (task && derivedTask !== task) return false
  const categoryText = compactText(content.category)
  const tagsText = compactText(Array.isArray(post.tags) ? post.tags.join(' ') : '')
  if (category && !(categoryText || tagsText).includes(category)) return false
  if (!query) return true
  return [post.title, post.summary, content.description, content.body, content.excerpt, content.category, Array.isArray(post.tags) ? post.tags.join(' ') : '']
    .some((value) => compactText(value).includes(query))
}

function SearchResultCard({ post }: { post: SitePost }) {
  const task = getPostTaskKey(post) as TaskKey | null
  // Route from the task config (e.g. /listing/<slug>); buildPostUrl can fall
  // back to /posts for tasks missing from the enabled taskViews map, which 404s.
  const taskRoute = SITE_CONFIG.tasks.find((item) => item.key === task)?.route
  const href = `${taskRoute || `/${task || 'article'}`}/${post.slug}`
  const image = getImage(post)
  const summary = summaryOf(post)
  const taskLabel = SITE_CONFIG.tasks.find((item) => item.key === task)?.label || 'Post'

  return (
    <Link href={href} className={`group flex flex-col overflow-hidden ${dc.surface.cardHover}`}>
      <div className={`${dc.media.frame} aspect-[16/10]`}>
        {image ? (
          <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center"><Search className="h-8 w-8 text-[var(--slot4-soft-muted-text)]" /></div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-[var(--slot4-page-text)] shadow-sm">{taskLabel}</span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h2 className="line-clamp-2 text-lg font-bold leading-snug tracking-[-0.01em] text-[var(--slot4-page-text)] group-hover:text-[var(--slot4-accent)]">{post.title}</h2>
        {summary ? <div className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-[var(--slot4-muted-text)]" dangerouslySetInnerHTML={{ __html: formatRichHtml(summary) }} /> : null}
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--slot4-accent)]">Open result <ArrowRight className="h-4 w-4" /></span>
      </div>
    </Link>
  )
}

export default async function SearchPage({ searchParams }: { searchParams?: Promise<{ q?: string; category?: string; task?: string; master?: string }> }) {
  const resolved = (await searchParams) || {}
  const query = (resolved.q || '').trim()
  const normalized = query.toLowerCase()
  const category = (resolved.category || '').trim().toLowerCase()
  const task = (resolved.task || '').trim().toLowerCase()
  const useMaster = resolved.master !== '0'
  const feed = await fetchSiteFeed(useMaster ? 1000 : 300, useMaster ? { fresh: true, category: category || undefined, task: task || undefined } : undefined)
  const posts = feed?.posts?.length ? feed.posts : useMaster ? [] : SITE_CONFIG.tasks.filter((item) => item.enabled).flatMap((item) => getMockPostsForTask(item.key))
  const results = posts.filter((post) => matches(post, normalized, category, task)).slice(0, normalized ? 80 : 36)
  const enabledTasks = SITE_CONFIG.tasks.filter((item) => item.enabled)

  return (
    <EditableSiteShell>
      <main className={`min-h-screen ${pal.pageBg} ${pal.pageText}`}>
        <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <div className={`grid gap-8 ${dc.surface.card} p-6 md:grid-cols-[0.8fr_1.2fr] lg:p-10`}>
            <div>
              <p className={dc.type.eyebrow}>{pagesContent.search.hero.badge}</p>
              <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-5xl">{pagesContent.search.hero.title}</h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-[var(--slot4-muted-text)]">{pagesContent.search.hero.description}</p>
            </div>
            <form action="/search" className={`self-end rounded-2xl border ${pal.border} ${pal.panelBg} p-4 sm:p-5`}>
              <input type="hidden" name="master" value="1" />
              <label className={`flex items-center gap-3 rounded-xl border ${pal.border} ${pal.surfaceBg} px-4 py-3`}>
                <Search className="h-5 w-5 text-[var(--slot4-muted-text)]" />
                <input name="q" defaultValue={query} placeholder={pagesContent.search.hero.placeholder} className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-[var(--slot4-muted-text)]" />
              </label>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className={`flex items-center gap-2 rounded-xl border ${pal.border} ${pal.surfaceBg} px-4 py-3`}>
                  <Filter className="h-4 w-4 text-[var(--slot4-muted-text)]" />
                  <input name="category" defaultValue={category} placeholder="Category" className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-[var(--slot4-muted-text)]" />
                </label>
                <select name="task" defaultValue={task} className={`rounded-xl border ${pal.border} ${pal.surfaceBg} px-4 py-3 text-sm font-medium outline-none`}>
                  <option value="">All content types</option>
                  {enabledTasks.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
                </select>
              </div>
              <button className={`${dc.button.primary} mt-3 w-full`} type="submit">Search</button>
            </form>
          </div>

          <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--slot4-soft-muted-text)]">{results.length} results</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.02em]">{query ? `Results for "${query}"` : pagesContent.search.resultsTitle}</h2>
            </div>
            <Link href="/listing" className={dc.button.secondary}>Browse listings <ArrowRight className="h-4 w-4" /></Link>
          </div>

          <div className="my-8">
            <Ads slot="header" size="banner" showLabel className="mx-auto w-full" />
          </div>

          {results.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {results.map((post) => <SearchResultCard key={post.id || post.slug} post={post} />)}
            </div>
          ) : (
            <div className={`rounded-2xl border border-dashed ${pal.border} ${pal.panelBg} p-10 text-center`}>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
                <SearchX className="h-6 w-6" />
              </div>
              <p className="mt-5 text-xl font-bold tracking-[-0.02em]">{pagesContent.search.emptyTitle}</p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--slot4-muted-text)]">{pagesContent.search.emptyDescription}</p>
            </div>
          )}
        </section>
      </main>
    </EditableSiteShell>
  )
}
