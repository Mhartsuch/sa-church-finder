import { shardOf } from './shard'

describe('shardOf', () => {
  const ids = Array.from({ length: 600 }, (_, i) => `church-${i}`)

  it('is stable and within range', () => {
    for (const id of ids) {
      const shard = shardOf(id, 6)
      expect(shard).toBe(shardOf(id, 6))
      expect(shard).toBeGreaterThanOrEqual(0)
      expect(shard).toBeLessThan(6)
    }
  })

  it('spreads ids roughly evenly', () => {
    const sizes = new Array<number>(6).fill(0)
    for (const id of ids) sizes[shardOf(id, 6)]++
    expect(Math.min(...sizes)).toBeGreaterThan(60)
    expect(Math.max(...sizes)).toBeLessThan(140)
  })
})
