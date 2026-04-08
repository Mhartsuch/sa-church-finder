/**
 * Maps Google Places API results to Prisma Church create/update data.
 */

import { Prisma, PrismaClient } from '@prisma/client'

import type { GooglePlaceResult } from './types.js'

export interface ChurchCreateData {
  name: string
  slug: string
  address: string
  city: string
  state: string
  zipCode: string
  latitude: Prisma.Decimal
  longitude: Prisma.Decimal
  phone: string | null
  website: string | null
  description: string | null
  googlePlaceId: string
}

export interface ChurchUpdateData {
  address: string
  city: string
  state: string
  zipCode: string
  latitude: Prisma.Decimal
  longitude: Prisma.Decimal
  phone: string | null
  website: string | null
  description: string | null
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

interface ParsedAddress {
  city: string
  state: string
  zipCode: string
}

function parseAddressComponents(place: GooglePlaceResult): ParsedAddress {
  const result: ParsedAddress = {
    city: 'San Antonio',
    state: 'TX',
    zipCode: '',
  }

  if (!place.addressComponents) return result

  for (const component of place.addressComponents) {
    if (component.types.includes('locality')) {
      result.city = component.longText
    } else if (component.types.includes('administrative_area_level_1')) {
      result.state = component.shortText
    } else if (component.types.includes('postal_code')) {
      result.zipCode = component.longText
    }
  }

  return result
}

/**
 * Generate a unique slug, appending a numeric suffix if needed.
 */
async function generateUniqueSlug(
  prisma: PrismaClient,
  name: string,
  googlePlaceId: string,
): Promise<string> {
  const baseSlug = generateSlug(name)
  let slug = baseSlug
  let suffix = 2

  while (true) {
    const existing = await prisma.church.findFirst({
      where: { slug },
      select: { googlePlaceId: true },
    })

    if (!existing || existing.googlePlaceId === googlePlaceId) {
      return slug
    }

    slug = `${baseSlug}-${suffix}`
    suffix++
  }
}

export async function mapPlaceToCreateData(
  prisma: PrismaClient,
  place: GooglePlaceResult,
): Promise<ChurchCreateData> {
  const address = parseAddressComponents(place)
  const slug = await generateUniqueSlug(prisma, place.displayName.text, place.id)

  return {
    name: place.displayName.text,
    slug,
    address: place.formattedAddress,
    city: address.city,
    state: address.state,
    zipCode: address.zipCode,
    latitude: new Prisma.Decimal(place.location.latitude.toFixed(8)),
    longitude: new Prisma.Decimal(place.location.longitude.toFixed(8)),
    phone: place.nationalPhoneNumber ?? null,
    website: place.websiteUri ?? null,
    description: place.editorialSummary?.text ?? null,
    googlePlaceId: place.id,
  }
}

export function mapPlaceToUpdateData(place: GooglePlaceResult): ChurchUpdateData {
  const address = parseAddressComponents(place)

  return {
    address: place.formattedAddress,
    city: address.city,
    state: address.state,
    zipCode: address.zipCode,
    latitude: new Prisma.Decimal(place.location.latitude.toFixed(8)),
    longitude: new Prisma.Decimal(place.location.longitude.toFixed(8)),
    phone: place.nationalPhoneNumber ?? null,
    website: place.websiteUri ?? null,
    description: place.editorialSummary?.text ?? null,
  }
}
