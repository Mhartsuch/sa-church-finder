import { Router, Request, Response } from 'express'

import prisma from '../lib/prisma.js'
import { PUBLIC_CHURCH_WHERE } from '../services/church.service.js'

const router = Router()

const BASE_URL = 'https://sachurchfinder.com'

/** An area or tradition needs this many churches to get a landing page. */
const MIN_LANDING_CHURCHES = 5

const STATIC_PAGES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/privacy', changefreq: 'monthly', priority: '0.2' },
  { path: '/terms', changefreq: 'monthly', priority: '0.2' },
]

const escapeXml = (str: string): string =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

/**
 * GET /sitemap.xml
 * Dynamic sitemap generated from all church slugs in the database.
 */
router.get('/sitemap.xml', async (_req: Request, res: Response) => {
  try {
    const churches = await prisma.church.findMany({
      where: PUBLIC_CHURCH_WHERE,
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    })

    // Landing pages for each tradition and each area with enough churches to
    // be worth a visit — the same links the site footer offers.
    const [families, areas] = await Promise.all([
      prisma.church.groupBy({
        by: ['denominationFamily'],
        where: { ...PUBLIC_CHURCH_WHERE, denominationFamily: { not: null } },
        _count: { _all: true },
      }),
      prisma.church.groupBy({
        by: ['neighborhood'],
        where: { ...PUBLIC_CHURCH_WHERE, neighborhood: { not: null } },
        _count: { _all: true },
      }),
    ])
    const landingEntries = [
      ...families
        .filter(
          (row) => row._count._all >= MIN_LANDING_CHURCHES && row.denominationFamily !== 'Other',
        )
        .map((row) => `denomination=${encodeURIComponent(row.denominationFamily ?? '')}`),
      ...areas
        .filter((row) => row._count._all >= MIN_LANDING_CHURCHES)
        .map((row) => `neighborhood=${encodeURIComponent(row.neighborhood ?? '')}`),
    ]
      .sort()
      .map(
        (query) =>
          `  <url>
    <loc>${BASE_URL}/?${escapeXml(query)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`,
      )

    const staticEntries = STATIC_PAGES.map(
      (page) =>
        `  <url>
    <loc>${BASE_URL}${page.path}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
    )

    const churchEntries = churches.map(
      (church) =>
        `  <url>
    <loc>${BASE_URL}/churches/${escapeXml(church.slug)}</loc>
    <lastmod>${church.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`,
    )

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticEntries, ...landingEntries, ...churchEntries].join('\n')}
</urlset>`

    res.set('Content-Type', 'application/xml')
    res.set('Cache-Control', 'public, max-age=3600, s-maxage=3600')
    res.send(xml)
  } catch {
    res
      .status(500)
      .set('Content-Type', 'application/xml')
      .send(
        `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${BASE_URL}/</loc></url>
</urlset>`,
      )
  }
})

export default router
