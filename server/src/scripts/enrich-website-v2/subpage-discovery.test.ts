import { discoverSubpages } from './subpage-discovery.js'

const HOMEPAGE = 'https://example.church/'

function html(links: Array<{ href: string; text?: string }>): string {
  return links.map(({ href, text }) => `<a href="${href}">${text ?? href}</a>`).join('\n')
}

describe('discoverSubpages', () => {
  it('picks whitelisted pages and orders by priority', () => {
    const page = html([
      { href: '/ministries', text: 'Ministries' },
      { href: '/about', text: 'About Us' },
      { href: '/staff', text: 'Our Staff' },
    ])
    const result = discoverSubpages(page, HOMEPAGE, 5)
    const paths = result.map((r) => new URL(r.url).pathname)
    expect(paths[0]).toBe('/about')
    expect(paths).toContain('/staff')
    expect(paths).toContain('/ministries')
  })

  it('rejects off-origin links', () => {
    const page = html([{ href: '/about' }, { href: 'https://other-church.org/about' }])
    const result = discoverSubpages(page, HOMEPAGE, 5)
    expect(result).toHaveLength(1)
    expect(new URL(result[0].url).pathname).toBe('/about')
  })

  it('rejects deny-listed paths (blog, shop, etc.)', () => {
    const page = html([
      { href: '/blog' },
      { href: '/donate' },
      { href: '/login' },
      { href: '/bulletin.pdf' },
      { href: '/about' },
    ])
    const result = discoverSubpages(page, HOMEPAGE, 5)
    const paths = result.map((r) => new URL(r.url).pathname)
    expect(paths).toEqual(['/about'])
  })

  it('caps the number of returned subpages', () => {
    const page = html([
      { href: '/about' },
      { href: '/staff' },
      { href: '/ministries' },
      { href: '/contact' },
      { href: '/services' },
      { href: '/visit' },
    ])
    const result = discoverSubpages(page, HOMEPAGE, 3)
    expect(result.length).toBeLessThanOrEqual(3)
  })

  it('deduplicates identical URLs', () => {
    const page = html([{ href: '/about' }, { href: '/about/' }, { href: '/about#section' }])
    const result = discoverSubpages(page, HOMEPAGE, 5)
    // hash-only differences collapse; trailing slash is preserved by URL so
    // we should still get at most 2 unique paths.
    expect(result.length).toBeLessThanOrEqual(2)
  })

  it('handles relative and absolute URLs', () => {
    const page = html([{ href: '/about' }, { href: 'https://example.church/staff' }])
    const result = discoverSubpages(page, HOMEPAGE, 5)
    const paths = result.map((r) => new URL(r.url).pathname)
    expect(paths).toContain('/about')
    expect(paths).toContain('/staff')
  })

  it('returns empty array for invalid homepage URL', () => {
    const result = discoverSubpages(html([{ href: '/about' }]), 'not-a-url', 5)
    expect(result).toEqual([])
  })
})
