import { isRateLimitMessage } from './claude-extractor.js'

describe('isRateLimitMessage', () => {
  it.each([
    'Claude usage limit reached. Please try again at 3pm',
    'You have hit a rate limit on this endpoint',
    'Error: quota exceeded for your plan',
    'too many requests — back off',
    'Your credit balance is too low to run this request',
    'rate_limit_error from upstream',
  ])('detects: %s', (text) => {
    expect(isRateLimitMessage(text)).toBe(true)
  })

  it.each([
    'Extraction failed: invalid JSON',
    'Timed out after 30 seconds',
    'Church website returned 404',
    'Connection refused',
  ])('ignores: %s', (text) => {
    expect(isRateLimitMessage(text)).toBe(false)
  })
})
