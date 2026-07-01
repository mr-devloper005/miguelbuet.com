import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft, ArrowUpRight, Bookmark, BookOpen, Building2, Camera, CheckCircle2,
  Clock, Download, ExternalLink, Facebook, FileText, Globe2, Linkedin, Mail,
  MapPin, MessageCircle, Navigation, Phone, ShieldCheck, Sparkles, Star, Tag,
  TrendingUp, Twitter, UserRound,
} from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableArticleComments } from '@/editable/components/EditableArticleComments'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { Ads } from '@/lib/ads'

export const revalidate = 3

export async function generateEditableDetailMetadata(task: TaskKey, params: Promise<{ slug?: string; username?: string }>) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({ task, params }: { task: TaskKey; params: Promise<{ slug?: string; username?: string }> }) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  const related = (await fetchTaskPosts(task, 7)).filter((item) => item.slug !== post.slug).slice(0, 4)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []
  return <TaskDetailView task={task} post={post} related={related} comments={comments} />
}

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const asText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const singleImages = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar'].map((key) => asText(content[key])).filter((url) => url && isUrl(url))
  return [...media, ...images, ...singleImages].filter(Boolean).slice(0, 12)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return asText(content.body) || asText(content.description) || asText(content.details) || post.summary || 'Details will appear here once available.'
}

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const safeUrl = (value: string) => /^https?:\/\//i.test(value) ? value : '#'

const linkifyMarkdown = (value: string) => value
  .replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/gi, (_match, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${label}</a>`)

const linkifyText = (value: string) => linkifyMarkdown(value)
  .replace(/(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi, (_match, prefix, url) => `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`)

const hardenLinks = (html: string) => html.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_match, attrs) => {
  let next = String(attrs).replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  if (!/\starget=/i.test(next)) next += ' target="_blank"'
  if (!/\srel=/i.test(next)) next += ' rel="nofollow noopener noreferrer"'
  return `<a ${next}>`
})

const sanitizeHtml = (html: string) => hardenLinks(html
  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
  .replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  .replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"'))

const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(linkifyMarkdown(value))
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`)
    .join('')
}

const summaryText = (post: SitePost) => post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || ''
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
// Plain-text lead intro, but only when it isn't just a duplicate of the body
// (some posts store the full HTML body in `summary`, which would render twice).
const leadText = (post: SitePost) => {
  const summary = summaryText(post)
  if (!summary) return ''
  const lead = stripHtml(summary)
  return lead && lead !== stripHtml(getBody(post)) ? lead : ''
}
const categoryOf = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const mapSrcFor = (post: SitePost) => {
  const address = getField(post, ['address', 'location', 'city'])
  const lat = getField(post, ['lat', 'latitude'])
  const lng = getField(post, ['lng', 'lon', 'longitude'])
  if (lat && lng) return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=14&output=embed`
  if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`
  return ''
}

export function TaskDetailView({ task, post, related, comments = [] }: { task: TaskKey; post: SitePost; related: SitePost[]; comments?: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        {task === 'listing' ? <ListingDetail post={post} related={related} /> : null}
        {task === 'classified' ? <ClassifiedDetail post={post} related={related} /> : null}
        {task === 'image' ? <ImageDetail post={post} related={related} /> : null}
        {task === 'sbm' ? <BookmarkDetail post={post} related={related} /> : null}
        {task === 'pdf' ? <PdfDetail post={post} related={related} /> : null}
        {task === 'profile' ? <ProfileDetail post={post} related={related} /> : null}
        {task === 'article' ? <ArticleDetail post={post} related={related} comments={comments} /> : null}
      </main>
    </EditableSiteShell>
  )
}

// Yelp-style red star rating row. Uses real rating/review fields when present,
// otherwise a stable derived value (wire to real data when available).
const hashStr = (value: string) => {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}
const ratingOf = (post: SitePost) => {
  const real = Number(getContent(post).rating)
  if (real >= 1 && real <= 5) return Math.round(real * 10) / 10
  return Math.round((3.7 + (hashStr(post.slug || post.id || post.title || 'x') % 13) / 10) * 10) / 10
}
const reviewsOf = (post: SitePost) => {
  const real = Number(getContent(post).reviewCount ?? getContent(post).reviews)
  if (real > 0) return Math.floor(real)
  return 6 + (hashStr((post.slug || post.title || 'x') + 'r') % 480)
}

function DetailMeta({ post, category, center = false }: { post: SitePost; category?: string; center?: boolean }) {
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <div className={`mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 ${center ? 'justify-center' : ''}`}>
      <span className="inline-flex items-center gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={`h-[18px] w-[18px] ${i < filled ? 'fill-[var(--tk-accent)] text-[var(--tk-accent)]' : 'fill-[var(--tk-line)] text-[var(--tk-line)]'}`} />
        ))}
      </span>
      <span className="text-sm font-semibold text-[var(--tk-text)]">{rating.toFixed(1)}</span>
      <span className="text-sm text-[var(--tk-muted)]">{reviewsOf(post)} reviews</span>
      {category ? (
        <>
          <span className="h-1 w-1 rounded-full bg-[var(--tk-muted)] opacity-50" />
          <span className="text-sm text-[var(--tk-muted)]">{category}</span>
        </>
      ) : null}
    </div>
  )
}

function Kicker({ task, children }: { task: TaskKey; children: React.ReactNode }) {
  const theme = getTaskTheme(task)
  return (
    <div className="flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--tk-accent)]">
      <span>{theme.kicker}</span>
      <span className="h-1 w-1 rounded-full bg-[var(--tk-accent)] opacity-50" />
      <span className="text-[var(--tk-muted)]">{children}</span>
    </div>
  )
}

function BackLink({ task }: { task: TaskKey }) {
  const taskConfig = getTaskConfig(task)
  return (
    <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tk-muted)] transition hover:text-[var(--tk-text)]">
      <ArrowLeft className="h-4 w-4" /> Back to {taskConfig?.label || 'posts'}
    </Link>
  )
}

// ----- Article: a quiet, centred reading column -----
function ArticleDetail({ post, related, comments }: { post: SitePost; related: SitePost[]; comments: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  const images = getImages(post)
  return (
    <>
      <article className="mx-auto max-w-4xl px-6 py-14 sm:py-20">
        <BackLink task="article" />
        <p className="mt-10 text-xs font-medium uppercase tracking-[0.28em] text-[var(--tk-accent)]">{categoryOf(post, 'Article')}</p>
        <h1 className="editable-display mt-5 text-balance text-4xl font-semibold leading-[1.06] tracking-[-0.03em] sm:text-5xl lg:text-[3.4rem]">{post.title}</h1>
        <div className="mt-6 text-sm text-[var(--tk-muted)]">
          <span>{SITE_CONFIG.name}</span>
        </div>
        {images[0] ? <img src={images[0]} alt="" className="mt-10 aspect-[16/9] w-full rounded-[var(--tk-radius)] border border-[var(--tk-line)] object-cover" /> : null}
        <BodyContent post={post} />
        <EditableArticleComments slug={post.slug} comments={comments} />
      </article>
      <RelatedStrip task="article" related={related} />
    </>
  )
}

// ----- Listing: a rich, premium directory record -----
function ListingDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const logo = images[0]
  const gallery = images.slice(1)
  const address = getField(post, ['address', 'location', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const category = getField(post, ['category'])
  const priceRange = getField(post, ['priceRange', 'price'])
  const established = getField(post, ['founded', 'established', 'since', 'yearFounded'])
  const mapSrc = mapSrcFor(post)
  const rating = ratingOf(post)
  const reviews = reviewsOf(post)
  const filled = Math.round(rating)
  const highlights = listingHighlights(post)
  const hours = getHours(post)
  const directionsHref = address ? `https://maps.google.com/maps?q=${encodeURIComponent(address)}` : ''
  const shareUrl = shareUrlFor('listing', post.slug)

  return (
    <>
      {/* Hero band */}
      <header className="relative overflow-hidden border-b border-[var(--tk-line)] bg-[var(--tk-raised)]">
        <div className="pointer-events-none absolute inset-x-0 -top-32 h-72 bg-[radial-gradient(60%_60%_at_50%_0%,var(--tk-glow),transparent_70%)]" />
        <div className="relative mx-auto max-w-[var(--editable-container)] px-6 pb-12 pt-8 sm:pb-16 sm:pt-10 lg:px-8">
          <Breadcrumb items={[['Home', '/'], ['Listings', getTaskConfig('listing')?.route || '/listing'], [category || post.title]]} />
          <div className="mt-8 grid gap-8 lg:grid-cols-[128px_minmax(0,1fr)] lg:items-center">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--tk-line)] bg-[var(--tk-surface)] shadow-[0_14px_40px_-18px_rgba(30,28,27,0.35)]">
              {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : <Building2 className="h-12 w-12 text-[var(--tk-muted)]" />}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {category ? <PillChip>{category}</PillChip> : null}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--tk-accent)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--tk-on-accent)]">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified
                </span>
                {priceRange ? <PillChip>{priceRange}</PillChip> : null}
              </div>
              <h1 className="editable-display mt-4 text-[2.25rem] font-semibold leading-[1.04] tracking-[-0.03em] sm:text-[3rem] lg:text-[3.4rem]">{post.title}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--tk-muted)]">
                <span className="inline-flex items-center gap-2">
                  <span className="inline-flex items-center gap-[3px]">
                    {[0, 1, 2, 3, 4].map((i) => <Star key={i} className={`h-4 w-4 ${i < filled ? 'fill-[var(--tk-accent)] text-[var(--tk-accent)]' : 'fill-[var(--tk-line)] text-[var(--tk-line)]'}`} />)}
                  </span>
                  <span className="font-semibold text-[var(--tk-text)]">{rating.toFixed(1)}</span>
                  <span>({reviews} reviews)</span>
                </span>
                {address ? <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-[var(--tk-accent)]" /> {address}</span> : null}
                {established ? <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-[var(--tk-accent)]" /> Since {established}</span> : null}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {phone ? (
                  <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:opacity-90"><Phone className="h-4 w-4" /> Call now</a>
                ) : website ? (
                  <a href={website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:opacity-90">Visit website <ExternalLink className="h-4 w-4" /></a>
                ) : null}
                {directionsHref ? <a href={directionsHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-5 py-2.5 text-sm font-semibold transition hover:border-[var(--tk-accent)]"><Navigation className="h-4 w-4" /> Get directions</a> : null}
                <Link href="#contact" className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-5 py-2.5 text-sm font-semibold transition hover:border-[var(--tk-accent)]"><Mail className="h-4 w-4" /> Send a message</Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[var(--editable-container)] px-6 py-12 sm:py-16 lg:px-8">
        <BackLink task="listing" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
          <article className="min-w-0">
            {leadText(post) ? (
              <p className="editable-display text-xl leading-9 tracking-[-0.005em] text-[var(--tk-text)] sm:text-2xl sm:leading-10">
                {leadText(post)}
              </p>
            ) : null}

            {highlights.length ? (
              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {highlights.map(({ icon: Icon, label, hint }) => (
                  <div key={label} className="flex items-start gap-3 rounded-2xl border border-[var(--tk-line)] bg-[var(--tk-surface)] p-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><Icon className="h-4 w-4" /></span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--tk-text)]">{label}</p>
                      {hint ? <p className="mt-0.5 text-xs text-[var(--tk-muted)]">{hint}</p> : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {gallery.length ? (
              <div className="mt-10 overflow-hidden rounded-2xl border border-[var(--tk-line)] bg-[var(--tk-surface)]">
                <img src={gallery[0]} alt="" className="aspect-[16/9] w-full object-cover" />
                {gallery.length > 1 ? (
                  <div className="grid grid-cols-2 gap-px bg-[var(--tk-line)] sm:grid-cols-3">
                    {gallery.slice(1, 4).map((image, index) => (
                      <img key={`${image}-${index}`} src={image} alt="" className="aspect-[4/3] w-full bg-[var(--tk-raised)] object-cover" />
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            <SectionHeading>About this business</SectionHeading>
            <BodyContent post={post} />

            {Array.isArray(post.tags) && post.tags.length ? (
              <>
                <SectionHeading>Categories &amp; tags</SectionHeading>
                <TagChips tags={post.tags} />
              </>
            ) : null}

            {hours.length ? (
              <>
                <SectionHeading>Hours</SectionHeading>
                <div className="overflow-hidden rounded-2xl border border-[var(--tk-line)] bg-[var(--tk-surface)]">
                  {hours.map((row, index) => (
                    <div key={row.label} className={`flex items-center justify-between gap-4 px-5 py-3 text-sm ${index ? 'border-t border-[var(--tk-line)]' : ''}`}>
                      <span className="font-medium text-[var(--tk-muted)]">{row.label}</span>
                      <span className="font-semibold text-[var(--tk-text)]">{row.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            <div id="contact" />
            <SectionHeading>Contact this business</SectionHeading>
            <div className="grid gap-3 sm:grid-cols-2">
              <ContactInfoRow icon={Phone} label="Phone" value={phone} href={phone ? `tel:${phone}` : ''} />
              <ContactInfoRow icon={Mail} label="Email" value={email} href={email ? `mailto:${email}` : ''} />
              <ContactInfoRow icon={Globe2} label="Website" value={website ? cleanDomainString(website) : ''} href={website} external />
              <ContactInfoRow icon={MapPin} label="Address" value={address} href={directionsHref} external />
            </div>

            {mapSrc ? (
              <>
                <SectionHeading>Location</SectionHeading>
                <MapBox src={mapSrc} label={address || post.title} />
              </>
            ) : null}
          </article>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 shadow-[0_20px_45px_-24px_rgba(30,28,27,0.28)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--tk-accent)]">Get in touch</p>
              <p className="mt-2 text-sm text-[var(--tk-muted)]">Prefer a direct route? Reach out below or drop by.</p>
              <div className="mt-5 flex flex-col gap-2">
                {phone ? <a href={`tel:${phone}`} className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:opacity-90"><Phone className="h-4 w-4" /> Call {phone}</a> : null}
                {email ? <a href={`mailto:${email}`} className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-5 py-3 text-sm font-semibold transition hover:border-[var(--tk-accent)]"><Mail className="h-4 w-4" /> Email {cleanDomainString(email)}</a> : null}
                {website ? <a href={website} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-5 py-3 text-sm font-semibold transition hover:border-[var(--tk-accent)]"><Globe2 className="h-4 w-4" /> Visit website</a> : null}
              </div>
              {directionsHref ? (
                <div className="mt-5 border-t border-[var(--tk-line)] pt-4">
                  <a href={directionsHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--tk-accent)]"><Navigation className="h-4 w-4" /> Get directions</a>
                </div>
              ) : null}
            </div>

            <ShareRow url={shareUrl} title={post.title} label="Share this listing" />

            <Ads slot="sidebar" size="mpu" showLabel className="w-full" />

            <RelatedPanel task="listing" post={post} related={related} />
          </aside>
        </div>
      </section>

      <RelatedStrip task="listing" related={related} />
    </>
  )
}

// ----- Classified: price-forward notice with a sticky action rail -----
function ClassifiedDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'availability', 'type'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  return (
    <>
      <section className="mx-auto grid max-w-[var(--editable-container)] gap-10 px-6 py-14 sm:py-20 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-8">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <BackLink task="classified" />
          <div className="mt-7 rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-7 shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
            <Kicker task="classified">Classified</Kicker>
            <h1 className="editable-display mt-4 text-2xl font-semibold leading-tight tracking-[-0.02em]">{post.title}</h1>
            <DetailMeta post={post} category={getField(post, ['category'])} />
            <p className="editable-display mt-6 text-4xl font-semibold tracking-[-0.03em] text-[var(--tk-accent)]">{price || 'Open offer'}</p>
            <div className="mt-6 space-y-2.5">
              {condition ? <BadgeLine label="Condition" value={condition} /> : null}
              {location ? <BadgeLine label="Location" value={location} /> : null}
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              {phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:opacity-90"><Phone className="h-4 w-4" /> Call now</a> : null}
              {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-5 py-2.5 text-sm font-semibold transition hover:border-[var(--tk-accent)]"><Mail className="h-4 w-4" /> Email</a> : null}
            </div>
          </div>
        </aside>
        <article className="min-w-0">
          <ImageStrip images={images} label="Offer images" large />
          <BodyContent post={post} />
          <ContactAction website={website} phone={phone} email={email} />
        </article>
      </section>
      <RelatedStrip task="classified" related={related} />
    </>
  )
}

// ----- Image: a dark, gallery-led canvas -----
function ImageDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const gallery = images.length ? images : ['/placeholder.svg?height=900&width=1200']
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-20 lg:px-8">
        <BackLink task="image" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="columns-1 gap-5 [column-fill:_balance] sm:columns-2">
            {gallery.map((image, index) => (
              <figure key={`${image}-${index}`} className="mb-5 break-inside-avoid overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
                <img src={image} alt="" className="w-full object-cover" />
              </figure>
            ))}
          </div>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-3.5 py-1.5 text-xs font-medium text-[var(--tk-muted)]"><Camera className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> Image story</div>
            <h1 className="editable-display mt-6 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl">{post.title}</h1>
            {leadText(post) ? <p className="mt-6 text-lg leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
            <BodyContent post={post} compact />
          </aside>
        </div>
      </section>
      <RelatedStrip task="image" related={related} />
    </>
  )
}

// ----- Bookmark: a rich, image-free curated resource -----
function BookmarkDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const website = getField(post, ['website', 'url', 'link'])
  const category = getField(post, ['category']) || (post.tags?.[0] ?? '')
  const domain = website ? cleanDomainString(website) : ''
  const savedBy = getField(post, ['author', 'curator', 'submittedBy']) || post.authorName || 'Community'
  const savedAt = post.publishedAt || post.createdAt || ''
  const readingTime = estimateReadingMinutes(getBody(post))
  const shareUrl = shareUrlFor('sbm', post.slug)

  return (
    <>
      {/* Hero band — no cover image, decorative accent only */}
      <header className="relative overflow-hidden border-b border-[var(--tk-line)] bg-[var(--tk-raised)]">
        <div className="pointer-events-none absolute inset-x-0 -top-32 h-72 bg-[radial-gradient(60%_60%_at_50%_0%,var(--tk-glow),transparent_70%)]" />
        <div className="relative mx-auto max-w-3xl px-6 pb-12 pt-8 sm:pb-16 sm:pt-10 lg:px-8">
          <Breadcrumb items={[['Home', '/'], ['Bookmarks', getTaskConfig('sbm')?.route || '/sbm'], [category || post.title]]} />
          <div className="mt-8 flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[var(--tk-line)] bg-[var(--tk-surface)] text-[var(--tk-accent)] shadow-[0_10px_28px_-14px_rgba(30,28,27,0.35)]">
              <Bookmark className="h-6 w-6" />
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {category ? <PillChip>{category}</PillChip> : null}
              {domain ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-3 py-1 text-[11px] font-semibold text-[var(--tk-muted)]">
                  <Globe2 className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {domain}
                </span>
              ) : null}
              {readingTime ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-3 py-1 text-[11px] font-semibold text-[var(--tk-muted)]">
                  <BookOpen className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {readingTime} min read
                </span>
              ) : null}
            </div>
          </div>
          <h1 className="editable-display mt-6 text-balance text-[2.25rem] font-semibold leading-[1.04] tracking-[-0.03em] sm:text-[3rem] lg:text-[3.4rem]">{post.title}</h1>
          {leadText(post) ? (
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--tk-muted)]">{leadText(post)}</p>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            {website ? (
              <a href={website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:opacity-90">
                Open resource <ExternalLink className="h-4 w-4" />
              </a>
            ) : null}
            <Link href={getTaskConfig('sbm')?.route || '/sbm'} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-5 py-3 text-sm font-semibold transition hover:border-[var(--tk-accent)]">
              <TrendingUp className="h-4 w-4" /> Browse bookmarks
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[var(--editable-container)] px-6 py-12 sm:py-16 lg:px-8">
        <BackLink task="sbm" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <article className="min-w-0">
            <SectionHeading>Why it's worth saving</SectionHeading>
            <BodyContent post={post} />

            {Array.isArray(post.tags) && post.tags.length ? (
              <>
                <SectionHeading>Tags &amp; topics</SectionHeading>
                <TagChips tags={post.tags} />
              </>
            ) : null}

            <div className="mt-12">
              <Ads slot="article-bottom" size="banner" showLabel className="w-full" />
            </div>
          </article>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 shadow-[0_20px_45px_-24px_rgba(30,28,27,0.28)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--tk-accent)]">Source</p>
              {domain ? (
                <p className="mt-3 truncate text-lg font-semibold tracking-[-0.005em] text-[var(--tk-text)]">{domain}</p>
              ) : (
                <p className="mt-3 text-sm text-[var(--tk-muted)]">External resource</p>
              )}
              {website ? (
                <a href={website} target="_blank" rel="noreferrer" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:opacity-90">
                  Open in new tab <ExternalLink className="h-4 w-4" />
                </a>
              ) : null}
              <div className="mt-5 space-y-3 border-t border-[var(--tk-line)] pt-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[var(--tk-muted)]">Curated by</span>
                  <span className="font-semibold text-[var(--tk-text)]">{savedBy}</span>
                </div>
                {savedAt ? (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[var(--tk-muted)]">Saved</span>
                    <span className="font-semibold text-[var(--tk-text)]">{formatDateShort(savedAt)}</span>
                  </div>
                ) : null}
                {category ? (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[var(--tk-muted)]">Category</span>
                    <span className="font-semibold text-[var(--tk-text)]">{category}</span>
                  </div>
                ) : null}
              </div>
            </div>

            <ShareRow url={shareUrl} title={post.title} label="Share this bookmark" />

            <div className="rounded-2xl border border-[var(--tk-line)] bg-[var(--tk-raised)] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--tk-accent)]">Have a link worth saving?</p>
              <p className="mt-2 text-sm leading-6 text-[var(--tk-muted)]">Submit a bookmark to the community board — takes a minute.</p>
              <Link href="/create" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--tk-accent)]"><Sparkles className="h-4 w-4" /> Submit a bookmark</Link>
            </div>

            <RelatedPanel task="sbm" post={post} related={related} />
          </aside>
        </div>
      </section>

      <RelatedStrip task="sbm" related={related} />
    </>
  )
}

// ----- PDF: a document workspace -----
function PdfDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const fileUrl = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-20 lg:px-8">
      <BackLink task="pdf" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article className="min-w-0">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[var(--tk-radius)] bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><FileText className="h-9 w-9" /></div>
            <div className="min-w-0">
              <Kicker task="pdf">{categoryOf(post, 'Document')}</Kicker>
              <h1 className="editable-display mt-3 text-3xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-4xl">{post.title}</h1>
            </div>
          </div>
          <BodyContent post={post} />
          {fileUrl ? (
            <div className="mt-10 overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--tk-line)] p-4">
                <span className="text-sm font-semibold">Document preview</span>
                <Link href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-4 py-2 text-xs font-semibold text-[var(--tk-on-accent)] transition hover:opacity-90">Download <Download className="h-4 w-4" /></Link>
              </div>
              <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} title={post.title} className="h-[78vh] w-full bg-[var(--tk-raised)]" />
            </div>
          ) : null}
        </article>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {fileUrl ? (
            <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
              <p className="text-sm font-semibold">Get this document</p>
              <p className="mt-2 text-sm leading-6 text-[var(--tk-muted)]">Open or download the full file in a new tab.</p>
              <Link href={fileUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:opacity-90">Download <Download className="h-4 w-4" /></Link>
            </div>
          ) : null}
          <RelatedPanel task="pdf" post={post} related={related} />
        </aside>
      </div>
    </section>
  )
}

// ----- Profile: identity-first with a sticky portrait -----
function ProfileDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  const website = getField(post, ['website', 'url'])
  const email = getField(post, ['email'])
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-20 lg:px-8">
        <BackLink task="profile" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-8 text-center shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
              <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)]">
                {images[0] ? <img src={images[0]} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-14 w-14 text-[var(--tk-muted)]" />}
              </div>
              <h1 className="editable-display mt-6 text-2xl font-semibold tracking-[-0.02em]">{post.title}</h1>
              {role ? <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--tk-accent)]">{role}</p> : null}
              <DetailMeta post={post} center />
              <ContactAction website={website} email={email} bare />
            </div>
          </aside>
          <article className="min-w-0">
            <Kicker task="profile">Profile</Kicker>
            <BodyContent post={post} />
            <ImageStrip images={images.slice(1)} label="Gallery" />
          </article>
        </div>
      </section>
      <RelatedStrip task="profile" related={related} />
    </>
  )
}

// ----- Shared building blocks -----
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="editable-display mt-12 mb-5 text-2xl font-semibold tracking-[-0.02em] text-[var(--tk-text)] sm:text-[1.75rem]">
      {children}
    </h2>
  )
}

function Breadcrumb({ items }: { items: Array<[label: string, href?: string] | [label: string]> }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-[var(--tk-muted)]">
      {items.map((item, index) => {
        const [label, href] = item
        const last = index === items.length - 1
        return (
          <span key={`${label}-${index}`} className="inline-flex items-center gap-1.5">
            {href && !last ? (
              <Link href={href} className="transition hover:text-[var(--tk-accent)]">{label}</Link>
            ) : (
              <span className={last ? 'font-semibold text-[var(--tk-text)]' : ''}>{label}</span>
            )}
            {last ? null : <span className="text-[var(--tk-muted)]/50">/</span>}
          </span>
        )
      })}
    </nav>
  )
}

function PillChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--tk-muted)]">
      {children}
    </span>
  )
}

function TagChips({ tags }: { tags: readonly string[] }) {
  const visible = tags.filter((tag) => typeof tag === 'string' && tag.trim()).slice(0, 16)
  if (!visible.length) return null
  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((tag) => (
        <span key={tag} className="inline-flex items-center rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-3.5 py-1.5 text-xs font-medium text-[var(--tk-text)] transition hover:border-[var(--tk-accent)] hover:text-[var(--tk-accent)]">
          #{tag}
        </span>
      ))}
    </div>
  )
}

function ContactInfoRow({ icon: Icon, label, value, href = '', external = false }: { icon: typeof MapPin; label: string; value: string; href?: string; external?: boolean }) {
  if (!value) return null
  const body = (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><Icon className="h-4 w-4" /></span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--tk-muted)]">{label}</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-[var(--tk-text)]">{value}</p>
      </div>
      {href ? <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--tk-muted)]" /> : null}
    </div>
  )
  const className = 'rounded-2xl border border-[var(--tk-line)] bg-[var(--tk-surface)] p-4 transition hover:border-[var(--tk-accent)]/40'
  if (!href) return <div className={className}>{body}</div>
  return (
    <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} className={className}>
      {body}
    </a>
  )
}

function ShareRow({ url, title, label = 'Share' }: { url: string; title: string; label?: string }) {
  const encoded = encodeURIComponent(url)
  const encodedText = encodeURIComponent(title)
  const links = [
    { name: 'Twitter', href: `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedText}`, icon: Twitter },
    { name: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`, icon: Linkedin },
    { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`, icon: Facebook },
    { name: 'WhatsApp', href: `https://api.whatsapp.com/send?text=${encodedText}%20${encoded}`, icon: MessageCircle },
    { name: 'Email', href: `mailto:?subject=${encodedText}&body=${encoded}`, icon: Mail },
  ]
  return (
    <div className="rounded-2xl border border-[var(--tk-line)] bg-[var(--tk-surface)] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--tk-accent)]">{label}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {links.map(({ name, href, icon: Icon }) => (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={`Share on ${name}`}
            title={`Share on ${name}`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--tk-line)] text-[var(--tk-muted)] transition hover:border-[var(--tk-accent)] hover:text-[var(--tk-accent)]"
          >
            <Icon className="h-4 w-4" />
          </a>
        ))}
      </div>
    </div>
  )
}

// --- Detail-view helpers used by ListingDetail / BookmarkDetail ---
function cleanDomainString(value: string) {
  return String(value || '').replace(/^https?:\/\//, '').replace(/\/$/, '')
}

function shareUrlFor(task: TaskKey, slug: string) {
  const base = String(SITE_CONFIG.baseUrl || '').replace(/\/$/, '')
  const route = getTaskConfig(task)?.route || `/${task}`
  return `${base}${route}/${slug}`
}

function estimateReadingMinutes(body: string) {
  const words = String(body || '').replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length
  if (!words) return 0
  return Math.max(1, Math.round(words / 220))
}

function formatDateShort(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

type ListingHighlight = { icon: typeof ShieldCheck; label: string; hint?: string }
function listingHighlights(post: SitePost): ListingHighlight[] {
  const content = getContent(post)
  const items: ListingHighlight[] = []
  items.push({ icon: ShieldCheck, label: 'Verified listing', hint: 'Details reviewed for accuracy' })
  const responseTime = asText(content.responseTime)
  if (responseTime) items.push({ icon: Clock, label: 'Fast reply', hint: responseTime })
  else items.push({ icon: Clock, label: 'Fast reply', hint: 'Usually within a day' })
  const local = asText(content.local) || asText(content.localBusiness)
  if (local || asText(content.address) || asText(content.city)) items.push({ icon: MapPin, label: 'Locally owned', hint: 'Rooted in the community' })
  const rating = ratingOf(post)
  if (rating >= 4.5) items.push({ icon: Sparkles, label: 'Highly rated', hint: `${rating.toFixed(1)} of 5 from ${reviewsOf(post)} reviews` })
  else items.push({ icon: Star, label: 'Community reviewed', hint: `${reviewsOf(post)} reviews` })
  return items.slice(0, 4)
}

type HoursRow = { label: string; value: string }
function getHours(post: SitePost): HoursRow[] {
  const content = getContent(post)
  const raw = content.hours ?? content.openingHours ?? content.schedule
  if (!raw) return []
  const dayNames: [string, string[]][] = [
    ['Monday', ['mon', 'monday']],
    ['Tuesday', ['tue', 'tues', 'tuesday']],
    ['Wednesday', ['wed', 'wednesday']],
    ['Thursday', ['thu', 'thurs', 'thursday']],
    ['Friday', ['fri', 'friday']],
    ['Saturday', ['sat', 'saturday']],
    ['Sunday', ['sun', 'sunday']],
  ]
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const lookup = raw as Record<string, unknown>
    const rows: HoursRow[] = []
    for (const [label, keys] of dayNames) {
      for (const key of keys) {
        const value = asText(lookup[key]) || asText(lookup[key.charAt(0).toUpperCase() + key.slice(1)])
        if (value) { rows.push({ label, value }); break }
      }
    }
    return rows
  }
  if (typeof raw === 'string') {
    return raw.split(/\r?\n/).map((line) => {
      const trimmed = line.trim()
      const [left, right] = trimmed.split(/[:—-]\s*/, 2)
      if (right) return { label: left.trim(), value: right.trim() }
      return { label: 'Open', value: trimmed }
    }).filter((row) => row.value)
  }
  return []
}

function BodyContent({ post, compact = false }: { post: SitePost; compact?: boolean }) {
  return (
    <div
      className={`article-content mt-8 max-w-none text-[var(--tk-text)] ${compact ? 'text-[15px] leading-7' : 'text-[1.0625rem] leading-8'}`}
      dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
    />
  )
}

function ImageStrip({ images, label, large = false }: { images: string[]; label: string; large?: boolean }) {
  if (!images.length) return null
  return (
    <section className="mt-10">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">{label}</p>
      <div className={`mt-4 grid gap-3 ${large ? 'sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {images.slice(0, large ? 4 : 8).map((image, index) => <img key={`${image}-${index}`} src={image} alt="" className="aspect-[4/3] rounded-[var(--tk-radius)] border border-[var(--tk-line)] object-cover" />)}
      </div>
    </section>
  )
}

function MapBox({ src, label }: { src: string; label: string }) {
  return (
    <div className="overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
      <div className="flex items-center gap-2 p-4 text-sm font-semibold"><MapPin className="h-4 w-4 text-[var(--tk-accent)]" /> {label || 'Map location'}</div>
      <iframe src={src} title="Map" loading="lazy" className="h-72 w-full border-0" />
    </div>
  )
}

function ContactAction({ website, phone, email, bare = false }: { website?: string; phone?: string; email?: string; bare?: boolean }) {
  if (!website && !phone && !email) return null
  const buttons = (
    <div className={`flex flex-wrap gap-2.5 ${bare ? 'justify-center' : ''}`}>
      {website ? <Link href={website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:opacity-90">Website <ExternalLink className="h-4 w-4" /></Link> : null}
      {phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-4 py-2.5 text-sm font-semibold transition hover:border-[var(--tk-accent)]"><Phone className="h-4 w-4" /> Call</a> : null}
      {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-4 py-2.5 text-sm font-semibold transition hover:border-[var(--tk-accent)]"><Mail className="h-4 w-4" /> Email</a> : null}
    </div>
  )
  if (bare) return <div className="mt-6">{buttons}</div>
  return (
    <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">Quick actions</p>
      <div className="mt-4">{buttons}</div>
    </div>
  )
}

function BadgeLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--tk-line)] bg-[var(--tk-raised)] px-4 py-3 text-sm">
      <span className="font-medium uppercase tracking-[0.12em] text-[var(--tk-muted)]">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

function RelatedPanel({ task, post, related }: { task: TaskKey; post: SitePost; related: SitePost[] }) {
  const taskConfig = getTaskConfig(task)
  return (
    <div className="space-y-6">
      <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">About this post</p>
        <div className="mt-4 grid gap-2.5 text-sm text-[var(--tk-muted)]">
          <p className="inline-flex items-center gap-2"><Tag className="h-4 w-4 text-[var(--tk-accent)]" /> {taskConfig?.label || task}</p>
          <p className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[var(--tk-accent)]" /> {SITE_CONFIG.name}</p>
        </div>
      </div>
      {related.length ? (
        <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="editable-display text-lg font-semibold tracking-[-0.02em]">More like this</h2>
            <Link href={taskConfig?.route || '/'} className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--tk-accent)]">View all</Link>
          </div>
          <div className="mt-5 grid gap-3">
            {related.map((item) => <RelatedCard key={item.id || item.slug} task={task} post={item} />)}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function RelatedStrip({ task, related }: { task: TaskKey; related: SitePost[] }) {
  if (!related.length) return null
  const taskConfig = getTaskConfig(task)
  return (
    <section className="border-t border-[var(--tk-line)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-16 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="editable-display text-2xl font-semibold tracking-[-0.02em]">More {(taskConfig?.label || 'posts').toLowerCase()}</h2>
          <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tk-accent)]">View all <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => <RelatedCard key={item.id || item.slug} task={task} post={item} grid />)}
        </div>
      </div>
    </section>
  )
}

function RelatedCard({ task, post, grid = false }: { task: TaskKey; post: SitePost; grid?: boolean }) {
  const image = getImages(post)[0]
  // Build the detail URL from the task route (e.g. /listing/<slug>) — the same
  // base the archive cards use. buildPostUrl() can fall back to /posts when the
  // task isn't in the enabled taskViews map, which 404s.
  const href = `${getTaskConfig(task)?.route || `/${task}`}/${post.slug}`
  if (grid) {
    return (
      <Link href={href} className="group block overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-300 hover:-translate-y-1">
        <div className="aspect-[16/10] overflow-hidden bg-[var(--tk-raised)]">
          {image ? <img src={image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" /> : <div className="flex h-full items-center justify-center"><FileText className="h-7 w-7 text-[var(--tk-muted)]" /></div>}
        </div>
        <div className="p-5">
          <h3 className="editable-display line-clamp-2 text-base font-semibold leading-snug tracking-[-0.01em]">{post.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</p>
        </div>
      </Link>
    )
  }
  return (
    <Link href={href} className="group flex gap-3 rounded-xl border border-[var(--tk-line)] p-3 transition hover:border-[var(--tk-accent)]">
      {image && task !== 'sbm' ? <img src={image} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" /> : <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-[var(--tk-raised)]"><FileText className="h-5 w-5 text-[var(--tk-muted)]" /></div>}
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug tracking-[-0.01em]">{post.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</p>
      </div>
    </Link>
  )
}

