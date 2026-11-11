import { createHash } from 'node:crypto'

/**
 * Stable shard (0-based) for a church id. Hash-based, so shards stay evenly
 * sized and a church always lands in the same shard between runs.
 */
export function shardOf(id: string, count: number): number {
  return createHash('sha1').update(id).digest().readUInt32BE(0) % count
}
