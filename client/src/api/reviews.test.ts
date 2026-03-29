import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { addHelpfulVote, removeHelpfulVote } from './reviews'

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
})
