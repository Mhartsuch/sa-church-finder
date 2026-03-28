import { getChurchBySlug, getChurchById } from './church.service.js'

describe('church service', () => {
  it('getChurchBySlug returns a church for a valid slug', () => {
    const church = getChurchBySlug('cathedral-of-saint-ferdinand')
    expect(church).toBeDefined()
    expect(church?.name).toBe('Cathedral of Saint Ferdinand')
  })

  it('getChurchBySlug returns null for an invalid slug', () => {
    const church = getChurchBySlug('nonexistent-church')
    expect(church).toBeNull()
  })

  it('getChurchById returns a church for a valid id', () => {
    const church = getChurchById('550e8400-e29b-41d4-a716-446655440001')
    expect(church).toBeDefined()
    expect(church?.slug).toBe('cathedral-of-saint-ferdinand')
  })

  it('getChurchById returns null for an invalid id', () => {
    const church = getChurchById('nonexistent-id')
    expect(church).toBeNull()
  })
})
