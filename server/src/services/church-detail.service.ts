/**
 * Church detail service
 * Handles retrieval of full church details by slug or ID
 */

import { IChurch } from '../types/church.types.js'
import { getChurchBySlug, getChurchById } from './church.service.js'

/**
 * Get church by slug with full details
 */
export function getChurchDetailsBySlug(slug: string): IChurch | null {
  return getChurchBySlug(slug)
}

/**
 * Get church by ID with full details
 */
export function getChurchDetailsById(id: string): IChurch | null {
  return getChurchById(id)
}
