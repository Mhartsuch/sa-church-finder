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
  googleRating: Prisma.Decimal | null
  googleReviewCount: number | null
  businessStatus: string | null
  googleMapsUrl: string | null
  primaryType: string | null
  goodForChildren: boolean | null
  goodForGroups: boolean | null
  wheelchairAccessible: boolean | null
  amenities: string[]
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
  googleRating: Prisma.Decimal | null
  googleReviewCount: number | null
  businessStatus: string | null
  googleMapsUrl: string | null
  primaryType: string | null
  goodForChildren: boolean | null
  goodForGroups: boolean | null
  wheelchairAccessible: boolean | null
}

export interface DerivedServiceTime {
  dayOfWeek: number
  startTime: string
  endTime: string | null
  serviceType: string
  language: string
  isAutoImported: true
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

/**
 * Derive amenities from Google accessibility and feature fields.
 */
export function deriveAmenities(place: GooglePlaceResult): string[] {
  const amenities: string[] = []

  if (place.accessibilityOptions?.wheelchairAccessibleEntrance) {
    amenities.push('Wheelchair Accessible')
  }
  if (place.accessibilityOptions?.wheelchairAccessibleParking) {
    amenities.push('Accessible Parking')
  }
  if (place.accessibilityOptions?.wheelchairAccessibleRestroom) {
    amenities.push('Accessible Restroom')
  }
  if (place.accessibilityOptions?.wheelchairAccessibleSeating) {
    amenities.push('Accessible Seating')
  }
  if (place.goodForChildren) {
    amenities.push('Family Friendly')
  }
  if (place.goodForGroups) {
    amenities.push('Good for Groups')
  }

  return amenities
}

/**
 * Merge derived amenities with existing ones (union, no duplicates).
 */
export function mergeAmenities(existing: string[], derived: string[]): string[] {
  const set = new Set(existing)
  for (const a of derived) {
    set.add(a)
  }
  return [...set]
}

/**
 * Derive service times from Google opening hours.
 */
export function deriveServiceTimes(place: GooglePlaceResult): DerivedServiceTime[] {
  const periods = place.regularOpeningHours?.periods
  if (!periods || periods.length === 0) return []

  const services: DerivedServiceTime[] = []

  for (const period of periods) {
    const startHour = String(period.open.hour).padStart(2, '0')
    const startMin = String(period.open.minute).padStart(2, '0')
    const startTime = `${startHour}:${startMin}`

    let endTime: string | null = null
    if (period.close) {
      const endHour = String(period.close.hour).padStart(2, '0')
      const endMin = String(period.close.minute).padStart(2, '0')
      endTime = `${endHour}:${endMin}`
    }

    services.push({
      dayOfWeek: period.open.day,
      startTime,
      endTime,
      serviceType: 'Service',
      language: 'English',
      isAutoImported: true,
    })
  }

  return services
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
    googleRating: place.rating != null ? new Prisma.Decimal(place.rating.toFixed(2)) : null,
    googleReviewCount: place.userRatingCount ?? null,
    businessStatus: place.businessStatus ?? null,
    googleMapsUrl: place.googleMapsUri ?? null,
    primaryType: place.primaryType ?? null,
    goodForChildren: place.goodForChildren ?? null,
    goodForGroups: place.goodForGroups ?? null,
    wheelchairAccessible: place.accessibilityOptions?.wheelchairAccessibleEntrance ?? null,
    amenities: deriveAmenities(place),
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
    googleRating: place.rating != null ? new Prisma.Decimal(place.rating.toFixed(2)) : null,
    googleReviewCount: place.userRatingCount ?? null,
    businessStatus: place.businessStatus ?? null,
    googleMapsUrl: place.googleMapsUri ?? null,
    primaryType: place.primaryType ?? null,
    goodForChildren: place.goodForChildren ?? null,
    goodForGroups: place.goodForGroups ?? null,
    wheelchairAccessible: place.accessibilityOptions?.wheelchairAccessibleEntrance ?? null,
  }
}
