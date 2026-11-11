import request from 'supertest'

import { createApp } from '../app.js'
import prisma from '../lib/prisma.js'

jest.mock('../lib/prisma.js', () => ({
  __esModule: true,
  default: {
    $disconnect: jest.fn(),
    $queryRaw: jest.fn(),
    church: { findMany: jest.fn(), groupBy: jest.fn() },
  },
}))

const mockedPrisma = prisma as unknown as {
  church: { findMany: jest.Mock; groupBy: jest.Mock }
}

describe('GET /sitemap.xml', () => {
  beforeEach(() => {
    mockedPrisma.church.findMany.mockReset().mockResolvedValue([
      { slug: 'grace-church', updatedAt: new Date('2026-11-01T00:00:00Z') },
      { slug: 'st-mary-s & friends', updatedAt: new Date('2026-10-01T00:00:00Z') },
    ])
    mockedPrisma.church.groupBy.mockReset().mockImplementation(({ by }: { by: string[] }) =>
      Promise.resolve(
        by[0] === 'denominationFamily'
          ? [
              { denominationFamily: 'Anglican/Episcopal', _count: { _all: 22 } },
              { denominationFamily: 'Holiness', _count: { _all: 4 } },
              { denominationFamily: 'Other', _count: { _all: 13 } },
            ]
          : [
              { neighborhood: 'Stone Oak', _count: { _all: 21 } },
              { neighborhood: 'Brooks', _count: { _all: 1 } },
            ],
      ),
    )
  })

  it('lists static pages, landing pages and every visible church', async () => {
    const response = await request(createApp()).get('/sitemap.xml')

    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toContain('application/xml')
    const xml = response.text
    expect(xml).toContain('<loc>https://sachurchfinder.com/</loc>')
    expect(xml).toContain('<loc>https://sachurchfinder.com/churches/grace-church</loc>')
    expect(xml).toContain('<lastmod>2026-11-01</lastmod>')
    expect(xml).toContain('https://sachurchfinder.com/?denomination=Anglican%2FEpiscopal')
    expect(xml).toContain('https://sachurchfinder.com/?neighborhood=Stone%20Oak')
  })

  it('leaves out thin landing pages and the catch-all "Other" tradition', async () => {
    const xml = (await request(createApp()).get('/sitemap.xml')).text

    expect(xml).not.toContain('denomination=Holiness')
    expect(xml).not.toContain('denomination=Other')
    expect(xml).not.toContain('neighborhood=Brooks')
  })

  it('escapes XML and only asks for visible churches', async () => {
    const xml = (await request(createApp()).get('/sitemap.xml')).text

    expect(xml).toContain('st-mary-s &amp; friends')
    expect(mockedPrisma.church.findMany.mock.calls[0][0].where).toMatchObject({ isHidden: false })
  })

  it('falls back to a minimal sitemap when the database is unavailable', async () => {
    mockedPrisma.church.findMany.mockRejectedValueOnce(new Error('db down'))

    const response = await request(createApp()).get('/sitemap.xml')

    expect(response.status).toBe(500)
    expect(response.text).toContain('<loc>https://sachurchfinder.com/</loc>')
  })
})
