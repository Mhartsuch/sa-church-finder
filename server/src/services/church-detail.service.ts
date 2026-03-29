/**
 * Church detail service
 * Handles retrieval of full church details by slug or ID
 */

import { IChurch } from '../types/church.types.js'
import { getChurchBySlug, getChurchById } from './church.service.js'

/**
 * Get church by slug with full details
 */
export async function getChurchDetailsBySlug(
  slug: string,
  userId?: string,
): Promise<IChurch | null> {
  return getChurchBySlug(slug, userId)
}

/**
 * Get church by ID with full details
 */
export async function getChurchDetailsById(
  id: string,
  userId?: string,
): Promise<IChurch | null> {
  return getChurchById(id, userId)
}
