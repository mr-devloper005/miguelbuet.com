import type { Metadata } from 'next'
import { SchemaJsonLd } from '@/components/seo/schema-jsonld'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { buildPageMetadata } from '@/lib/seo'
import { fetchHomeTaskFeed, fetchHomeTimeSections, fetchPaginatedTaskPosts, type HomeTimeSection } from '@/lib/task-data'
import { pagesContent } from '@/editable/content/pages.content'
import type { SitePost } from '@/lib/site-connector'
import {
  EditableBenefits, EditableCategoryRail, EditableComparison, EditableFaq,
  EditableFeatureChecklist, EditableFeaturedRail, EditableHomeCta, EditableHomeHero,
  EditableLatestSubmissions, EditablePillars, EditableProcessSteps,
  EditableStatsBand, EditableTestimonials, ratingOf,
} from '@/editable/sections/HomeSections'
import { getEditableCategory } from '@/editable/cards/PostCards'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { Ads } from '@/lib/ads'
export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/',
    title: pagesContent.home.metadata.title,
    description: pagesContent.home.metadata.description,
    openGraphTitle: pagesContent.home.metadata.openGraphTitle,
    openGraphDescription: pagesContent.home.metadata.openGraphDescription,
    image: SITE_CONFIG.defaultOgImage,
    keywords: [...pagesContent.home.metadata.keywords],
  })
}

type TaskFeedItem = { task: (typeof SITE_CONFIG.tasks)[number]; posts: SitePost[] }

function uniquePosts(posts: SitePost[]) {
  return Array.from(new Map(posts.map((post) => [post.slug || post.id || post.title, post])).values())
}

export default async function HomePage() {
  const primaryTask = (SITE_CONFIG.tasks.find((task) => task.enabled)?.key || 'article') as TaskKey
  const primaryRoute = SITE_CONFIG.taskViews[primaryTask] || `/${primaryTask}`
  const listingRoute = SITE_CONFIG.taskViews.listing || '/listing'
  const bookmarkRoute = SITE_CONFIG.taskViews.sbm || '/sbm'

  const taskFeed: TaskFeedItem[] = await fetchHomeTaskFeed(12, { timeoutMs: 2500 })
  const primaryPosts = uniquePosts(taskFeed.find(({ task }) => task.key === primaryTask)?.posts || taskFeed.flatMap(({ posts }) => posts)).slice(0, 24)
  const timeSections: HomeTimeSection[] = await fetchHomeTimeSections(primaryTask, { limit: 8, timeoutMs: 2500 })

  const listingPosts = uniquePosts(taskFeed.find(({ task }) => task.key === 'listing')?.posts || [])
  const bookmarkPosts = uniquePosts(taskFeed.find(({ task }) => task.key === 'sbm')?.posts || [])

  const [listingCounted, bookmarkCounted] = await Promise.all([
    fetchPaginatedTaskPosts('listing', { limit: 1 }).catch(() => null),
    fetchPaginatedTaskPosts('sbm', { limit: 1 }).catch(() => null),
  ])
  const listingTotal = listingCounted?.pagination?.total || listingPosts.length
  const bookmarkTotal = bookmarkCounted?.pagination?.total || bookmarkPosts.length

  const categorySet = new Set([...listingPosts, ...bookmarkPosts].map((post) => getEditableCategory(post)).filter(Boolean))
  const categoryCount = categorySet.size || SITE_CONFIG.tasks.filter((task) => task.enabled).length
  const averageRating = listingPosts.length
    ? listingPosts.reduce((sum, post) => sum + ratingOf(post), 0) / listingPosts.length
    : 4.7

  const baseUrl = SITE_CONFIG.baseUrl.replace(/\/$/, '')

  return (
    <EditableSiteShell>
      <main>
        <SchemaJsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: SITE_CONFIG.name,
            url: baseUrl,
            potentialAction: {
              '@type': 'SearchAction',
              target: `${baseUrl}/search?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          }}
        />

        <EditableHomeHero primaryTask={primaryTask} primaryRoute={primaryRoute} posts={primaryPosts} timeSections={timeSections} />
        <EditableStatsBand listingCount={listingTotal} bookmarkCount={bookmarkTotal} categoryCount={categoryCount} rating={averageRating} />

        <div className={`mx-auto max-w-[var(--editable-container)] px-4 py-8 sm:px-6 lg:px-8`}>
          <Ads slot="header" size="banner" showLabel eager className="mx-auto w-full" />
        </div>

        <EditableFeatureChecklist />
        <EditablePillars />
        <EditableCategoryRail primaryRoute={primaryRoute} />

        <EditableFeaturedRail
          eyebrow={pagesContent.home.featuredListings.eyebrow}
          title={pagesContent.home.featuredListings.title}
          description={pagesContent.home.featuredListings.description}
          viewAllLabel={pagesContent.home.featuredListings.viewAllLabel}
          posts={listingPosts}
          task="listing"
          route={listingRoute}
          variant="listing"
        />

        <div className={`mx-auto max-w-[var(--editable-container)] px-4 py-8 sm:px-6 lg:px-8`}>
          <Ads slot="sidebar" size="mpu" showLabel eager className="mx-auto w-full" />
        </div>

        <EditableFeaturedRail
          eyebrow={pagesContent.home.featuredBookmarks.eyebrow}
          title={pagesContent.home.featuredBookmarks.title}
          description={pagesContent.home.featuredBookmarks.description}
          viewAllLabel={pagesContent.home.featuredBookmarks.viewAllLabel}
          posts={bookmarkPosts}
          task="sbm"
          route={bookmarkRoute}
          variant="sbm"
        />

        <EditableBenefits />
        <EditableProcessSteps />

        <EditableLatestSubmissions
          listingPosts={listingPosts}
          bookmarkPosts={bookmarkPosts}
          listingRoute={listingRoute}
          bookmarkRoute={bookmarkRoute}
        />

        <EditableTestimonials />
        <EditableComparison />
        <EditableFaq />
        <EditableHomeCta />
      </main>
    </EditableSiteShell>
  )
}
