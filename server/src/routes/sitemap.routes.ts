import { Router, Request, Response } from 'express'

import prisma from '../lib/prisma.js'

const router = Router()

const BASE_URL = 'https://sachurchfinder.com'

const STATIC_PAGES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/search', changefreq: 'daily', priority: '0.9' },
  { path: '/events', changefreq: 'daily', priority: '0.8' },
  { path: '/help-center', changefreq: 'monthly', priority: '0.3' },
  { path: '/safety-information', changefreq: 'monthly', priority: '0.3' },
  { path: '/accessibility', changefreq: 'monthly', priority: '0.3' },
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
      where: {
        businessStatus: { not: 'CLOSED_PERMANENTLY' },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    })

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
${[...staticEntries, ...churchEntries].join('\n')}
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
