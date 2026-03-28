/**
 * Church detail service
 * Handles retrieval of full church details by slug or ID
 */

import { getChurchBySlug, getChurchById } from './church.service.js'

/**
 * Get church by slug with full details
 */
export async function getChurchDetailsBySlug(slug: string) {
  return getChurchBySlug(slug)
}

/**
 * Get church by ID with full details
 */
export async function getChurchDetailsById(id: string) {
  return getChurchById(id)
}
