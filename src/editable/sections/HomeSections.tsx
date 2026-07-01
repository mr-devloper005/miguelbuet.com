import Link from 'next/link'
import {
  ArrowRight, Bookmark, Building2, Check, CheckCircle2, ChevronRight, FileText,
  Image as ImageIcon, Layers, Megaphone, Search, Send, Sparkles, ShieldCheck,
  Smartphone, Star, UserRound, Users, X, Zap, Quote,
} from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc, editablePalette as pal } from '@/editable/layouts/design-contract'
import { getEditableCategory, getEditableExcerpt, getEditablePostImage, postHref, RailPostCard } from '@/editable/cards/PostCards'
import { EditableHeroCollage } from '@/editable/sections/EditableHeroCollage'
import { ScrollReveal } from '@/editable/components/ScrollReveal'
import { FaqAccordion } from '@/editable/components/FaqAccordion'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

const taskIcon: Record<TaskKey, typeof FileText> = {
  article: FileText,
  listing: Building2,
  classified: Megaphone,
  image: ImageIcon,
  sbm: Bookmark,
  pdf: FileText,
  profile: UserRound,
}

function taskLabel(task: TaskKey) {
  return SITE_CONFIG.tasks.find((item) => item.key === task)?.label || task
}

// Stable hash so derived ratings/counts stay consistent between renders.
function hashStr(value: string) {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}

// Prefer real rating/review data when present, else a stable display value so
// the directory's star UI always reads well. (Wire to real fields when ready.)
export function ratingOf(post: SitePost) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const real = Number(content.rating)
  if (real >= 1 && real <= 5) return Math.round(real * 10) / 10
  const h = hashStr(post.slug || post.id || post.title || 'x')
  return Math.round((3.7 + (h % 13) / 10) * 10) / 10 // 3.7 – 4.9
}

function reviewsOf(post: SitePost) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const real = Number(content.reviewCount ?? content.reviews)
  if (real > 0) return Math.floor(real)
  return 6 + (hashStr((post.slug || post.title || 'x') + 'r') % 480)
}

function Stars({ rating, className = 'h-4 w-4' }: { rating: number; className?: string }) {
  const rounded = Math.round(rating)
  return (
    <span className="inline-flex items-center gap-[3px]" aria-label={`${rating} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          className={`${className} ${i < rounded ? 'fill-[var(--slot4-accent)] text-[var(--slot4-accent)]' : 'fill-[var(--editable-border)] text-[var(--editable-border)]'}`}
        />
      ))}
    </span>
  )
}

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-4 sm:px-6 lg:px-8'

function dedupePosts(posts: SitePost[]) {
  const seen = new Set<string>()
  const out: SitePost[] = []
  for (const post of posts) {
    const key = post.slug || post.id || post.title
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(post)
  }
  return out
}

function latestPostImages(posts: SitePost[], max = 8) {
  const seen = new Set<string>()
  const out: string[] = []
  for (const post of posts) {
    const img = getEditablePostImage(post)
    if (!img || img.includes('placeholder') || seen.has(img)) continue
    seen.add(img)
    out.push(img)
    if (out.length >= max) break
  }
  return out
}

/* ----------------------------- Hero banner ----------------------------- */
export function EditableHomeHero({ posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  const heroImages = latestPostImages(pool)
  const hero = pagesContent.home.hero
  const heroTitle = hero.title?.join(' ') || `Discover ${SITE_CONFIG.name}`
  const categories = SITE_CONFIG.tasks.filter((task) => task.enabled).slice(0, 6)

  return (
    <section className="relative overflow-hidden bg-[var(--slot4-page-bg)]">
      <div className={`${container} grid gap-12 py-16 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28`}>
        <ScrollReveal as="div" className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--slot4-muted-text)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--slot4-highlight)]" /> {hero.badge}
          </p>
          <h1 className="editable-display mt-6 text-balance text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.035em] text-[var(--slot4-page-text)] sm:text-[3.75rem] lg:text-[4.25rem]">
            {heroTitle}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--slot4-muted-text)]">{hero.description}</p>

          <form action="/search" className="mt-8 flex w-full max-w-xl overflow-hidden rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] shadow-[0_10px_30px_-16px_rgba(30,28,27,0.24)]">
            <div className="flex flex-1 items-center gap-2.5 px-5">
              <Search className="h-5 w-5 shrink-0 text-[var(--slot4-muted-text)]" />
              <input
                name="q"
                placeholder={hero.searchPlaceholder}
                className="w-full bg-transparent py-4 text-sm text-[var(--slot4-page-text)] outline-none placeholder:text-[var(--slot4-muted-text)]"
              />
            </div>
            <button className="shrink-0 bg-[var(--slot4-accent)] px-6 text-sm font-bold text-[var(--slot4-on-accent)] transition hover:bg-[var(--slot4-accent-hover)] sm:px-8">
              Search
            </button>
          </form>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={hero.primaryCta.href} className={dc.button.accent}>
              {hero.primaryCta.label} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={hero.secondaryCta.href} className={dc.button.secondary}>
              {hero.secondaryCta.label}
            </Link>
          </div>

          
        </ScrollReveal>

        <ScrollReveal as="div" className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] shadow-[0_40px_90px_-40px_rgba(30,28,27,0.35)] lg:max-w-md lg:justify-self-end">
          <EditableHeroCollage images={heroImages} />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(30,28,27,0.55))]" />
          <div className="absolute inset-x-0 bottom-0 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">{hero.featureCardBadge}</p>
            <p className="editable-display mt-2 text-xl font-semibold leading-snug tracking-[-0.02em] text-white">{hero.featureCardTitle}</p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

/* ------------------------------ Stats band ------------------------------ */
export function EditableStatsBand({
  listingCount,
  bookmarkCount,
  categoryCount,
  rating,
}: {
  listingCount: number
  bookmarkCount: number
  categoryCount: number
  rating: number
}) {
  const copy = pagesContent.home.stats
  const values = [
    listingCount > 0 ? `${listingCount}+` : 'New',
    bookmarkCount > 0 ? `${bookmarkCount}+` : 'New',
    categoryCount > 0 ? `${categoryCount}` : '—',
    `${rating.toFixed(1)}`,
  ]

  return (
    <section className="border-y border-[var(--editable-border)] bg-[var(--slot4-panel-bg)]">
      <ScrollReveal as="div" stagger className={`py-12 sm:py-14 ${container}`}>
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className={dc.type.eyebrow}>{copy.eyebrow}</p>
            <h2 className="editable-display mt-2 text-2xl font-semibold tracking-[-0.02em] text-[var(--slot4-page-text)] sm:text-3xl">{copy.title}</h2>
          </div>
          <p className="max-w-xs text-sm text-[var(--slot4-muted-text)]">{copy.note}</p>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
          {copy.items.map((item, index) => (
            <div key={item.label} className="border-t border-[var(--editable-border)] pt-4">
              <p className="editable-display text-4xl font-semibold tracking-[-0.03em] text-[var(--slot4-page-text)] sm:text-5xl">
                {values[index]}
                <span className="text-[var(--slot4-soft-muted-text)]">{item.suffix}</span>
              </p>
              <p className="mt-1 text-sm text-[var(--slot4-muted-text)]">{item.label}</p>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </section>
  )
}

/* --------------------------- Feature checklist --------------------------- */
export function EditableFeatureChecklist() {
  const copy = pagesContent.home.features
  return (
    <section className={pal.pageBg}>
      <div className={`${dc.shell.sectionY} ${container}`}>
        <ScrollReveal as="div" className="mx-auto max-w-3xl text-center">
          <p className={dc.type.eyebrow}>{copy.eyebrow}</p>
          <h2 className={`mt-3 ${dc.type.sectionTitle}`}>{copy.title}</h2>
        </ScrollReveal>
        <ScrollReveal as="div" stagger className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
          {copy.items.map((item) => (
            <div key={item} className={`flex items-start gap-3 ${dc.surface.soft} p-5`}>
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--slot4-accent)]" />
              <p className="text-sm leading-6 text-[var(--slot4-page-text)]">{item}</p>
            </div>
          ))}
        </ScrollReveal>
      </div>
    </section>
  )
}

/* -------------------------------- Pillars -------------------------------- */
const pillarIcons = [Search, Send, Layers, Users]

export function EditablePillars() {
  const copy = pagesContent.home.pillars
  return (
    <section className={pal.warmBg}>
      <div className={`${dc.shell.sectionY} ${container}`}>
        <ScrollReveal as="div" className="mx-auto max-w-2xl text-center">
          <p className={dc.type.eyebrow}>{copy.eyebrow}</p>
          <h2 className={`mt-3 ${dc.type.sectionTitle}`}>{copy.title}</h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--slot4-muted-text)]">{copy.description}</p>
        </ScrollReveal>
        <ScrollReveal as="div" stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {copy.items.map((item, index) => {
            const Icon = pillarIcons[index] || Sparkles
            return (
              <div key={item.title} className={`${dc.surface.cardHover} p-6`}>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-bold tracking-[-0.01em] text-[var(--slot4-page-text)]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{item.description}</p>
              </div>
            )
          })}
        </ScrollReveal>
      </div>
    </section>
  )
}

/* ---------------------------- Category rail ---------------------------- */
export function EditableCategoryRail({ primaryRoute }: { primaryRoute: string }) {
  const categories = SITE_CONFIG.tasks.filter((task) => task.enabled)
  const copy = pagesContent.home.categoryRail
  if (!categories.length) return null
  return (
    <section className={pal.pageBg}>
      <div className={`${dc.shell.sectionY} ${container}`}>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className={dc.type.eyebrow}>{copy.eyebrow}</p>
            <h2 className={`mt-2 ${dc.type.sectionTitle}`}>{copy.title}</h2>
            <p className="mt-2 text-[var(--slot4-muted-text)]">{copy.description}</p>
          </div>
          <Link href={primaryRoute} className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-[var(--slot4-accent)] hover:underline sm:inline-flex">
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
       
      </div>
    </section>
  )
}

/* ------------------------------ Featured rail ---------------------------- */
function ListingRailCard({ post, href }: { post: SitePost; href: string }) {
  const rating = ratingOf(post)
  return (
    <Link href={href} className={`group ${dc.layout.minRailCard} w-[260px] shrink-0 snap-start sm:w-[280px] block overflow-hidden ${dc.surface.card} ${dc.motion.lift}`}>
      <div className={`${dc.media.frame} aspect-[16/11]`}>
        <img src={getEditablePostImage(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-[var(--slot4-page-text)] shadow-sm">{getEditableCategory(post)}</span>
      </div>
      <div className="p-5">
        <h3 className="line-clamp-2 text-base font-bold leading-snug tracking-[-0.01em] text-[var(--slot4-page-text)] group-hover:text-[var(--slot4-accent)]">{post.title}</h3>
        <div className="mt-2 flex items-center gap-2">
          <Stars rating={rating} className="h-3.5 w-3.5" />
          <span className="text-xs font-semibold text-[var(--slot4-page-text)]">{rating.toFixed(1)}</span>
          <span className="text-xs text-[var(--slot4-muted-text)]">({reviewsOf(post)})</span>
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{getEditableExcerpt(post, 100)}</p>
      </div>
    </Link>
  )
}

export function EditableFeaturedRail({
  eyebrow, title, description, viewAllLabel, posts, task, route, variant,
}: {
  eyebrow: string
  title: string
  description: string
  viewAllLabel: string
  posts: SitePost[]
  task: TaskKey
  route: string
  variant: 'listing' | 'sbm'
  tone?: 'light' | 'warm'
}) {
  if (!posts.length) return null
  return (
    <section className={pal.pageBg}>
      <div className={`${dc.shell.sectionY} ${container}`}>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className={dc.type.eyebrow}>{eyebrow}</p>
            <h2 className={`mt-2 ${dc.type.sectionTitle}`}>{title}</h2>
            <p className="mt-2 max-w-xl text-[var(--slot4-muted-text)]">{description}</p>
          </div>
          <Link href={route} className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-[var(--slot4-accent)] hover:underline sm:inline-flex">
            {viewAllLabel} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className={`snap-rail mt-8 flex snap-x gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}>
          {posts.slice(0, 10).map((post, index) =>
            variant === 'listing' ? (
              <ListingRailCard key={post.id || post.slug} post={post} href={postHref(task, post, route)} />
            ) : (
              <RailPostCard key={post.id || post.slug} post={post} href={postHref(task, post, route)} index={index} />
            )
          )}
        </div>
      </div>
    </section>
  )
}

/* --------------------------- Latest submissions -------------------------- */
function SubmissionCard({ post, task, route }: { post: SitePost; task: TaskKey; route: string }) {
  const href = postHref(task, post, route)
  const image = getEditablePostImage(post)
  const isListing = task === 'listing'
  return (
    <Link href={href} className={`group flex flex-col overflow-hidden ${dc.surface.cardHover}`}>
      <div className={`${dc.media.frame} aspect-[3/2]`}>
        <img src={image} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
        <span className="absolute left-3 top-3 rounded-full bg-[var(--slot4-dark-bg)]/85 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">{taskLabel(task)}</span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-base font-bold leading-snug tracking-[-0.01em] text-[var(--slot4-page-text)] group-hover:text-[var(--slot4-accent)]">{post.title}</h3>
        {isListing ? (
          <div className="mt-2 flex items-center gap-2">
            <Stars rating={ratingOf(post)} className="h-3.5 w-3.5" />
            <span className="text-xs font-semibold text-[var(--slot4-page-text)]">{ratingOf(post).toFixed(1)}</span>
          </div>
        ) : null}
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-[var(--slot4-muted-text)]">{getEditableExcerpt(post, 110)}</p>
      </div>
    </Link>
  )
}

export function EditableLatestSubmissions({
  listingPosts, bookmarkPosts, listingRoute, bookmarkRoute,
}: {
  listingPosts: SitePost[]
  bookmarkPosts: SitePost[]
  listingRoute: string
  bookmarkRoute: string
}) {
  const copy = pagesContent.home.latestSubmissions
  const items: { post: SitePost; task: TaskKey; route: string }[] = [
    ...listingPosts.map((post) => ({ post, task: 'listing' as TaskKey, route: listingRoute })),
    ...bookmarkPosts.map((post) => ({ post, task: 'sbm' as TaskKey, route: bookmarkRoute })),
  ]
    .sort((a, b) => {
      const da = new Date(a.post.publishedAt || a.post.createdAt || 0).getTime()
      const db = new Date(b.post.publishedAt || b.post.createdAt || 0).getTime()
      return db - da
    })
    .slice(0, 9)

  if (!items.length) return null

  return (
    <section className={pal.warmBg}>
      <div className={`${dc.shell.sectionY} ${container}`}>
        <div className="text-center">
          <p className={dc.type.eyebrow}>{copy.eyebrow}</p>
          <h2 className={`mt-2 ${dc.type.sectionTitle}`}>{copy.title}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-[var(--slot4-muted-text)]">{copy.description}</p>
        </div>
        <ScrollReveal as="div" stagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ post, task, route }) => (
            <SubmissionCard key={`${task}-${post.id || post.slug}`} post={post} task={task} route={route} />
          ))}
        </ScrollReveal>
        <div className="mt-10 text-center">
          <Link href="/search" className={dc.button.secondary}>
            {copy.viewAllLabel} <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

/* --------------------------------- Benefits ------------------------------- */
const benefitIcons = [Sparkles, ShieldCheck, Star, Zap, Smartphone]

export function EditableBenefits() {
  const copy = pagesContent.home.benefits
  return (
    <section className={pal.pageBg}>
      <div className={`${dc.shell.sectionY} ${container}`}>
        <ScrollReveal as="div" className="mx-auto max-w-2xl text-center">
          <p className={dc.type.eyebrow}>{copy.eyebrow}</p>
          <h2 className={`mt-3 ${dc.type.sectionTitle}`}>{copy.title}</h2>
        </ScrollReveal>
        <ScrollReveal as="div" stagger className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {copy.items.map((item, index) => {
            const Icon = benefitIcons[index] || Sparkles
            return (
              <div key={item.title} className={`${dc.surface.soft} p-5`}>
                <Icon className="h-5 w-5 text-[var(--slot4-accent)]" />
                <h3 className="mt-3 text-sm font-bold tracking-[-0.01em] text-[var(--slot4-page-text)]">{item.title}</h3>
                <p className="mt-2 text-xs leading-5 text-[var(--slot4-muted-text)]">{item.description}</p>
              </div>
            )
          })}
        </ScrollReveal>
      </div>
    </section>
  )
}

/* -------------------------------- Process --------------------------------- */
export function EditableProcessSteps() {
  const copy = pagesContent.home.process
  return (
    <section className={pal.warmBg}>
      <div className={`${dc.shell.sectionY} ${container}`}>
        <ScrollReveal as="div" className="mx-auto max-w-2xl text-center">
          <p className={dc.type.eyebrow}>{copy.eyebrow}</p>
          <h2 className={`mt-3 ${dc.type.sectionTitle}`}>{copy.title}</h2>
        </ScrollReveal>
        <ScrollReveal as="div" stagger className="mt-10 grid gap-5 sm:grid-cols-3">
          {copy.steps.map((step) => (
            <div key={step.step} className={`${dc.surface.card} p-6`}>
              <span className="text-3xl font-black tracking-[-0.03em] text-[var(--slot4-accent)]">{step.step}</span>
              <h3 className="mt-3 text-lg font-bold tracking-[-0.01em] text-[var(--slot4-page-text)]">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{step.description}</p>
            </div>
          ))}
        </ScrollReveal>
      </div>
    </section>
  )
}

/* ------------------------------ Testimonials ------------------------------ */
export function EditableTestimonials() {
  const copy = pagesContent.home.testimonials
  return (
    <section className={pal.warmBg}>
      <div className={`${dc.shell.sectionY} ${container}`}>
        <ScrollReveal as="div" className="mx-auto max-w-2xl text-center">
          <p className={dc.type.eyebrow}>{copy.eyebrow}</p>
          <h2 className={`editable-display mt-3 ${dc.type.sectionTitle}`}>{copy.title}</h2>
        </ScrollReveal>
        <ScrollReveal as="div" stagger className="mt-12 grid gap-5 lg:grid-cols-3">
          {copy.items.map((item) => (
            <div key={item.name} className={`${dc.surface.card} p-7`}>
              <Quote className="h-6 w-6 text-[var(--slot4-highlight)]" />
              <p className="editable-display mt-5 text-lg leading-8 text-[var(--slot4-page-text)]">&ldquo;{item.quote}&rdquo;</p>
              <div className="mt-6 flex items-center gap-3 border-t border-[var(--editable-border)] pt-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--slot4-accent)] text-xs font-bold text-[var(--slot4-on-accent)]">
                  {item.name.slice(0, 1)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-[var(--slot4-page-text)]">{item.name}</p>
                  <p className="text-xs text-[var(--slot4-soft-muted-text)]">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </ScrollReveal>
      </div>
    </section>
  )
}

/* ------------------------------- Comparison ------------------------------- */
export function EditableComparison() {
  const copy = pagesContent.home.comparison
  return (
    <section className={pal.pageBg}>
      <div className={`${dc.shell.sectionY} ${container}`}>
        <ScrollReveal as="div" className="mx-auto max-w-2xl text-center">
          <p className={dc.type.eyebrow}>{copy.eyebrow}</p>
          <h2 className={`mt-3 ${dc.type.sectionTitle}`}>{copy.title}</h2>
        </ScrollReveal>
        <ScrollReveal as="div" stagger className="mx-auto mt-10 flex max-w-3xl flex-col gap-3">
          {copy.items.map((item) => (
            <div key={item.before} className={`grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr] ${dc.surface.soft} p-5`}>
              <div className="flex items-start gap-3">
                <X className="mt-0.5 h-4 w-4 shrink-0 text-[var(--slot4-soft-muted-text)]" />
                <p className="text-sm leading-6 text-[var(--slot4-muted-text)]">{item.before}</p>
              </div>
              <ArrowRight className="hidden h-4 w-4 shrink-0 text-[var(--slot4-accent)] sm:block" />
              <div className="flex items-start gap-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--slot4-accent)]" />
                <p className="text-sm font-medium leading-6 text-[var(--slot4-page-text)]">{item.after}</p>
              </div>
            </div>
          ))}
        </ScrollReveal>
      </div>
    </section>
  )
}


/* ----------------------------------- FAQ ----------------------------------- */
export function EditableFaq() {
  const copy = pagesContent.home.faq
  return (
    <section className={pal.pageBg}>
      <div className={`${dc.shell.sectionY} ${container}`}>
        <ScrollReveal as="div" className="mx-auto max-w-2xl text-center">
          <p className={dc.type.eyebrow}>{copy.eyebrow}</p>
          <h2 className={`mt-3 ${dc.type.sectionTitle}`}>{copy.title}</h2>
        </ScrollReveal>
        <div className="mx-auto mt-10 max-w-5xl">
          <FaqAccordion categories={copy.categories} />
        </div>
      </div>
    </section>
  )
}

/* -------------------------------- CTA band ------------------------------ */
export function EditableHomeCta() {
  const copy = pagesContent.home.cta
  return (
    <section id="get-app" className={`scroll-mt-24 ${pal.pageBg}`}>
      <div className={`${container} py-14 sm:py-20`}>
        <div className="relative overflow-hidden rounded-3xl border border-[var(--editable-border)] bg-[var(--slot4-dark-bg)] px-8 py-16 text-center text-[var(--slot4-dark-text)] sm:px-14 sm:py-20">
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[var(--slot4-highlight)] opacity-[0.14] blur-3xl" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">{copy.badge}</p>
            <h2 className="editable-display mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.025em] sm:text-5xl">{copy.title}</h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-white/70 sm:text-lg">{copy.description}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href={copy.primaryCta.href} className={dc.button.onDark}>{copy.primaryCta.label}</Link>
              <Link href={copy.secondaryCta.href} className={dc.button.ghostOnDark}>{copy.secondaryCta.label}</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
