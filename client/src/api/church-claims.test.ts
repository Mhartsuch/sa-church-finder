import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  fetchAdminChurchClaims,
  fetchUserChurchClaims,
  resolveChurchClaim,
  submitChurchClaim,
} from './church-claims'

const fetchMock = vi.fn()

describe('church claims api', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    fetchMock.mockReset()
    vi.unstubAllGlobals()
  })

  it('submits a church claim request', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      statusText: 'Created',
      text: async () =>
        JSON.stringify({
          data: {
            id: 'claim-1',
            churchId: 'church-1',
            roleTitle: 'Executive Pastor',
            verificationEmail: 'staff@grace.org',
            status: 'pending',
            createdAt: '2026-03-31T00:00:00.000Z',
            reviewedAt: null,
          },
        }),
    } as Response)

    const result = await submitChurchClaim({
      churchId: 'church-1',
      roleTitle: 'Executive Pastor',
      verificationEmail: 'staff@grace.org',
    })

    expect(result).toMatchObject({
      id: 'claim-1',
      churchId: 'church-1',
      status: 'pending',
    })

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/v1/churches/church-1/claim')
    expect(options.method).toBe('POST')
    expect(options.body).toBe(
      JSON.stringify({
        roleTitle: 'Executive Pastor',
        verificationEmail: 'staff@grace.org',
      }),
    )
    expect(options.credentials).toBe('include')
  })

  it('fetches the current users church claims', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () =>
        JSON.stringify({
          data: [
            {
              id: 'claim-1',
              status: 'pending',
            },
          ],
          meta: {
            total: 1,
            pending: 1,
            approved: 0,
            rejected: 0,
          },
        }),
    } as Response)

    const result = await fetchUserChurchClaims('user-1')

    expect(result.meta.total).toBe(1)

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/v1/users/user-1/claims')
    expect(options.credentials).toBe('include')
  })

  it('fetches the admin church claim queue', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () =>
        JSON.stringify({
          data: [
            {
              id: 'claim-1',
              status: 'pending',
            },
          ],
          meta: {
            total: 1,
          },
        }),
    } as Response)

    const result = await fetchAdminChurchClaims()

    expect(result.meta.total).toBe(1)

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/v1/admin/claims')
    expect(options.credentials).toBe('include')
  })

  it('submits an admin claim resolution decision', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () =>
        JSON.stringify({
          data: {
            claimId: 'claim-1',
            churchId: 'church-1',
            userId: 'user-1',
            status: 'approved',
          },
        }),
    } as Response)

    const result = await resolveChurchClaim({
      claimId: 'claim-1',
      status: 'approved',
    })

    expect(result).toMatchObject({
      claimId: 'claim-1',
      status: 'approved',
    })

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/v1/admin/claims/claim-1')
    expect(options.method).toBe('PATCH')
    expect(options.body).toBe(JSON.stringify({ status: 'approved' }))
    expect(options.credentials).toBe('include')
  })
})
