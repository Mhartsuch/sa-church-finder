import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  addHelpfulVote,
  fetchFlaggedReviews,
  flagReview,
  removeHelpfulVote,
  resolveFlaggedReview,
} from './reviews'

const fetchMock = vi.fn()

describe('reviews api', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    fetchMock.mockReset()
    vi.unstubAllGlobals()
  })

  it('posts a helpful vote for a review', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      statusText: 'Created',
      text: async () =>
        JSON.stringify({
          data: {
            reviewId: 'review-1',
            helpfulCount: 4,
            viewerHasVotedHelpful: true,
          },
        }),
    } as Response)

    const result = await addHelpfulVote('review-1')

    expect(result).toMatchObject({
      reviewId: 'review-1',
      helpfulCount: 4,
      viewerHasVotedHelpful: true,
    })

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/v1/reviews/review-1/helpful')
    expect(options.method).toBe('POST')
    expect(options.credentials).toBe('include')
  })

  it('deletes a helpful vote for a review', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () =>
        JSON.stringify({
          data: {
            reviewId: 'review-1',
            helpfulCount: 3,
            viewerHasVotedHelpful: false,
          },
        }),
    } as Response)

    const result = await removeHelpfulVote('review-1')

    expect(result).toMatchObject({
      reviewId: 'review-1',
      helpfulCount: 3,
      viewerHasVotedHelpful: false,
    })

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/v1/reviews/review-1/helpful')
    expect(options.method).toBe('DELETE')
    expect(options.credentials).toBe('include')
  })

  it('flags a review for moderation', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      statusText: 'Created',
      text: async () =>
        JSON.stringify({
          data: {
            reviewId: 'review-2',
            status: 'flagged',
          },
        }),
    } as Response)

    const result = await flagReview('review-2')

    expect(result).toMatchObject({
      reviewId: 'review-2',
      status: 'flagged',
    })

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/v1/reviews/review-2/flag')
    expect(options.method).toBe('POST')
    expect(options.credentials).toBe('include')
  })

  it('fetches the flagged review moderation queue', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () =>
        JSON.stringify({
          data: [
            {
              id: 'review-2',
              flaggedAt: '2026-03-29T12:00:00.000Z',
            },
          ],
          meta: {
            total: 1,
          },
        }),
    } as Response)

    const result = await fetchFlaggedReviews()

    expect(result.meta.total).toBe(1)
    expect(result.data[0]).toMatchObject({
      id: 'review-2',
    })

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/v1/admin/flagged-reviews')
    expect(options.credentials).toBe('include')
  })

  it('resolves a flagged review moderation decision', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () =>
        JSON.stringify({
          data: {
            reviewId: 'review-2',
            status: 'approved',
          },
        }),
    } as Response)

    const result = await resolveFlaggedReview({
      reviewId: 'review-2',
      status: 'approved',
    })

    expect(result).toMatchObject({
      reviewId: 'review-2',
      status: 'approved',
    })

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/v1/admin/flagged-reviews/review-2')
    expect(options.method).toBe('PATCH')
    expect(options.body).toBe(JSON.stringify({ status: 'approved' }))
    expect(options.credentials).toBe('include')
  })
})
