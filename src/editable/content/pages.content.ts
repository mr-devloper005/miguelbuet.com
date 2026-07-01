import { slot4BrandConfig } from '@/editable/theme/brand.config'

const BRAND = slot4BrandConfig.siteName

export const pagesContent = {
  home: {
    metadata: {
      title: `${BRAND} — Business Directory & Social Bookmarking`,
      description: `Discover verified local businesses and community-curated bookmarks on ${BRAND}. Browse listings by category, save and share links worth keeping, and get found by the people searching for what you offer.`,
      openGraphTitle: `${BRAND} — Find Businesses & Curated Bookmarks`,
      openGraphDescription: `A directory of local businesses and a community bookmarking board, in one place. Search, save, and get discovered on ${BRAND}.`,
      keywords: ['business directory', 'local listings', 'social bookmarking', 'submit a listing', 'curated links', 'business discovery'],
    },
    hero: {
      badge: 'Directory + community bookmarks',
      title: ['Find the business.', 'Save the link. Get discovered.'],
      description: `${BRAND} pairs a verified local business directory with a community bookmarking board — so you can search listings, save resources worth keeping, and list your own business in front of people actively looking.`,
      primaryCta: { label: 'Browse listings', href: '/listing' },
      secondaryCta: { label: 'Submit a bookmark', href: '/sbm' },
      searchPlaceholder: 'Search businesses, categories, or bookmarks…',
      focusLabel: 'Popular right now',
      featureCardBadge: 'Fresh on the directory',
      featureCardTitle: 'Newest listings and bookmarks shape what shows up first.',
      featureCardDescription: 'The homepage always reflects real, current activity from the directory and the bookmarking board — never placeholder content.',
    },
    stats: {
      eyebrow: 'Trusted by a growing community',
      title: 'The numbers behind the directory',
      note: 'Live counts pulled from active listings and bookmark submissions.',
      items: [
        { label: 'Business listings', suffix: '+' },
        { label: 'Saved bookmarks', suffix: '+' },
        { label: 'Categories covered', suffix: '' },
        { label: 'Average rating', suffix: '/5' },
      ],
    },
    features: {
      eyebrow: 'Why list here',
      title: `Why businesses and curators choose ${BRAND}`,
      items: [
        'Every listing is reviewed before it goes live — no spam directories.',
        'Bookmarks are organized by category, not buried in a chat thread.',
        'Built-in search surfaces your listing to people actively looking.',
        'One free submission to start — no credit card, no gatekeeping.',
        'Your profile updates instantly the moment you publish a change.',
      ],
    },
    pillars: {
      eyebrow: 'How it works',
      title: 'Built for discovery, not noise',
      description: `${BRAND} keeps business listings and community bookmarks in one connected system, so finding — and being found — takes minutes, not days.`,
      items: [
        { title: 'Discover', description: 'Browse verified listings and curated bookmarks by category, location, or keyword search.' },
        { title: 'Submit', description: 'List your business or share a bookmark in a few guided steps — free to start.' },
        { title: 'Curate', description: 'Tag, categorize, and organize submissions so the directory stays useful, not cluttered.' },
        { title: 'Connect', description: 'Reach people through contact details, reviews, and related listings on every profile.' },
      ],
    },
    categoryRail: {
      eyebrow: 'Explore by category',
      title: 'Jump straight to what you need',
      description: 'From local services to community resources — browse the sections people use most.',
    },
    featuredListings: {
      eyebrow: 'Featured businesses',
      title: 'Featured listings',
      description: 'Verified businesses worth a closer look, updated as new submissions come in.',
      viewAllLabel: 'View all listings',
    },
    featuredBookmarks: {
      eyebrow: 'Community picks',
      title: 'Featured bookmarks',
      description: 'Resources, tools, and links the community has saved and shared recently.',
      viewAllLabel: 'View all bookmarks',
    },
    latestSubmissions: {
      eyebrow: 'Just published',
      title: 'Latest submissions',
      description: 'The newest listings and bookmarks added to the directory, in order.',
      viewAllLabel: 'See everything',
    },
    benefits: {
      eyebrow: 'Built for growth',
      title: 'Everything a listing needs to get found',
      items: [
        { title: 'Free to list', description: 'Publish your first business listing or bookmark at no cost — no trial, no expiry.' },
        { title: 'Search-friendly profile', description: 'Every listing page is structured to be found by both site search and search engines.' },
        { title: 'Real community reviews', description: 'Ratings and feedback come from people who actually browsed and visited your listing.' },
        { title: 'Indexed instantly', description: 'New submissions appear across categories, search, and the homepage right away.' },
        { title: 'Mobile-first by default', description: 'Every listing, bookmark, and search result is built to read well on any screen.' },
      ],
    },
    process: {
      eyebrow: 'Get started in minutes',
      title: 'From sign-up to discovered in three steps',
      steps: [
        { step: '01', title: 'Create your account', description: 'Sign up free — no credit card required to get started.' },
        { step: '02', title: 'Submit your listing or bookmark', description: 'Add your business details or share a resource with the right category and tags.' },
        { step: '03', title: 'Get discovered', description: 'Your submission appears in search, category pages, and the homepage feed.' },
      ],
    },
    testimonials: {
      eyebrow: 'What people are saying',
      title: 'Businesses and curators on the directory',
      items: [
        { quote: `Listing our shop on ${BRAND} took ten minutes and we started getting calls from the directory the same week.`, name: 'Amara T.', role: 'Local business owner' },
        { quote: 'I use the bookmarking side constantly — it is where I keep every tool and resource I actually use, organized by category.', name: 'Devon R.', role: 'Community curator' },
        { quote: 'The review and rating system feels genuine. Customers found us through a category search, not an ad.', name: 'Priya K.', role: 'Service provider' },
      ],
    },
    comparison: {
      eyebrow: 'Why it matters',
      title: `Without ${BRAND} vs. with ${BRAND}`,
      items: [
        { before: 'Business details scattered across social bios and outdated web pages', after: 'One up-to-date profile with hours, contact info, and location' },
        { before: 'Bookmarks buried in browser folders no one else can see', after: 'Shared, categorized bookmarks anyone can search and reuse' },
        { before: 'No way to know if people are actually finding your business', after: 'Real search traffic, ratings, and reviews on your listing' },
        { before: 'Manually re-sharing the same links across group chats', after: 'One saved bookmark, discoverable by the whole community' },
        { before: 'Directory submissions that vanish into a review queue', after: 'Listings go live fast, with instant homepage and search visibility' },
      ],
    },

    faq: {
      eyebrow: 'Questions, answered',
      title: 'Everything else you might want to know',
      categories: [
        {
          name: 'General',
          items: [
            { question: `What is ${BRAND}?`, answer: `${BRAND} is a business directory and social bookmarking platform — a place to find local businesses and save or share links worth keeping, all searchable in one system.` },
            { question: 'Is it free to use?', answer: 'Browsing, searching, and your first listing or bookmark are always free. Featured placement is optional.' },
          ],
        },
        {
          name: 'Listings & submissions',
          items: [
            { question: 'How do I list my business?', answer: 'Create an account, then use the Create page to submit your business details, category, and contact information.' },
            { question: 'How long until my listing appears?', answer: 'Most listings and bookmarks appear immediately after submission across category pages and search.' },
          ],
        },
        {
          name: 'Search & discovery',
          items: [
            { question: 'Can I search both listings and bookmarks at once?', answer: 'Yes — the search page covers every content type on the site, with filters to narrow by category or type.' },
            { question: 'How are featured listings chosen?', answer: 'Featured placement is available on paid plans; free listings still appear in full category and search results.' },
          ],
        },
      ],
    },
    intro: {
      badge: 'About the directory',
      title: 'Built for finding businesses and saving what matters.',
      paragraphs: [
        `${BRAND} brings business listings and community bookmarks together so visitors can search, compare, and save in one place instead of juggling separate tools.`,
        'Instead of treating directory listings and shared links as separate products, the platform keeps them connected — with shared search, shared categories, and one clean navigation.',
        'Whether someone is looking for a local business or saving a resource for later, they can keep exploring related content without starting over.',
      ],
      sideBadge: 'At a glance',
      sidePoints: [
        'A searchable directory of verified business listings.',
        'A community bookmarking board organized by category.',
        'One search experience across listings and bookmarks.',
        'Free to submit, fast to appear in search and category pages.',
      ],
      primaryLink: { label: 'Browse listings', href: '/listing' },
      secondaryLink: { label: 'Browse bookmarks', href: '/sbm' },
    },
    cta: {
      badge: 'Ready when you are',
      title: 'List your business or save your first bookmark today.',
      description: `Join the ${BRAND} community — submit a business listing or a bookmark and get discovered by people searching for exactly that.`,
      primaryCta: { label: 'List your business', href: '/create' },
      secondaryCta: { label: 'Submit a bookmark', href: '/create' },
    },
    taskSection: {
      heading: 'Latest {label}',
      descriptionSuffix: 'Browse the newest submissions in this section.',
    },
  },
  about: {
    badge: 'Our story',
    title: `${BRAND} started as a simple idea: make it easy to find businesses and save what is worth keeping.`,
    description: `${BRAND} pairs a verified local business directory with a community bookmarking board — built so both are easy to search, browse, and trust.`,
    paragraphs: [
      'Business directories are often outdated, and bookmarks usually live in a browser folder no one else can see. We built one connected platform to fix both.',
      'Every listing goes through a lightweight review step before it appears, and every bookmark is organized by category so the board stays genuinely useful instead of a dumping ground.',
    ],
    values: [
      {
        title: 'Verified, not just listed',
        description: 'We prioritize accurate, current business details over sheer volume — a smaller directory people can trust beats a bloated one they can\'t.',
      },
      {
        title: 'Community-curated bookmarks',
        description: 'Bookmarks are tagged and categorized by the people who save them, so the board reflects what the community actually finds useful.',
      },
      {
        title: 'Fast to submit, fast to find',
        description: 'From submission to search-visible takes minutes — for both business owners and anyone sharing a resource worth saving.',
      },
    ],
  },
  contact: {
    eyebrow: `Contact ${BRAND}`,
    title: 'Questions about a listing, a bookmark, or your account? Start here.',
    description: 'Tell us whether you need help with a business listing, a bookmark submission, or something else — we will route it to the right place instead of a generic queue.',
    formTitle: 'Send a message',
  },
  search: {
    metadata: {
      title: 'Search listings and bookmarks',
      description: 'Search business listings and community bookmarks by keyword, category, or type.',
    },
    hero: {
      badge: 'Search the directory',
      title: 'Find businesses and bookmarks faster.',
      description: 'Search across every business listing and community bookmark by keyword, category, or content type.',
      placeholder: 'Search businesses, categories, or bookmarks…',
    },
    resultsTitle: 'Latest listings and bookmarks',
    emptyTitle: 'No matches yet',
    emptyDescription: 'Try a different keyword or browse listings and bookmarks by category instead.',
  },
  create: {
    metadata: {
      title: 'List your business or submit a bookmark',
      description: 'Submit a new business listing or share a bookmark with the community.',
    },
    locked: {
      badge: 'Account required',
      title: 'Login to list your business or submit a bookmark.',
      description: 'Create a free account to publish a business listing or share a bookmark with the community.',
    },
    hero: {
      badge: 'Publishing workspace',
      title: 'List your business or submit a bookmark.',
      description: 'Choose a listing or a bookmark, add the details, and publish — most submissions go live immediately.',
    },
    formTitle: 'Submission details',
    submitLabel: 'Publish submission',
    successTitle: 'Submitted. Your listing is now live.',
  },
  auth: {
    login: {
      metadataDescription: `Login to your ${BRAND} account to manage listings and bookmarks.`,
      badge: 'Member access',
      title: 'Welcome back.',
      description: 'Login to manage your business listings, saved bookmarks, and submissions.',
      formTitle: 'Login',
      submitLabel: 'Continue',
      noAccount: 'No account matched these details. Create an account first, then login.',
      success: 'Login successful. Redirecting...',
      createCta: 'Create an account',
    },
    signup: {
      metadataDescription: `Create a free ${BRAND} account to list your business or submit a bookmark.`,
      badge: 'Free to join',
      title: 'Create your account and get listed.',
      description: 'Sign up free to submit a business listing or bookmark and start getting discovered.',
      formTitle: 'Create account',
      submitLabel: 'Create account',
      passwordShort: 'Use at least 4 characters for the password.',
      success: 'Account created successfully. Redirecting...',
      loginCta: 'Login',
    },
  },
  detailPages: {
    article: {
      relatedTitle: 'Related articles',
      fallbackTitle: 'Article details',
    },
    listing: {
      relatedTitle: 'Similar listings',
      fallbackTitle: 'Listing details',
    },
    image: {
      relatedTitle: 'Related visuals',
      fallbackTitle: 'Image details',
    },
    sbm: {
      relatedTitle: 'Related bookmarks',
      fallbackTitle: 'Bookmark details',
    },
    profile: {
      relatedTitle: 'Suggested articles',
      fallbackDescription: 'Profile details will appear here once available.',
      visitButton: 'Visit Official Site',
    },
  },
} as const
