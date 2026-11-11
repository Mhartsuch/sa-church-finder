import type { PrismaClient } from '@prisma/client'

import { resolveDenomination } from '../enrich-details/denomination-classifier.js'
import { isJunkDescription } from '../enrich-details/listing-quality.js'
import { findServiceArtifacts } from '../enrich-details/service-cleaner.js'
import type { EnrichV2Stats, EnrichWebsiteV2Options, ExtractedChurchData } from './types.js'

export interface ChurchRow {
  id: string
  name: string
  website: string | null
  pastorName: string | null
  denomination: string | null
  denominationFamily: string | null
  yearEstablished: number | null
  description: string | null
  email: string | null
  phone: string | null
  languages: string[]
  goodForChildren: boolean | null
  goodForGroups: boolean | null
  wheelchairAccessible: boolean | null
  services: { id: string; isAutoImported: boolean }[]
}

export async function applyExtraction(
  prisma: PrismaClient,
  church: ChurchRow,
  extracted: ExtractedChurchData,
  options: EnrichWebsiteV2Options,
  stats: EnrichV2Stats,
): Promise<string[]> {
  const changes: string[] = []
  const updates: Record<string, unknown> = {}

  // Scalar fields — only overwrite when null unless --overwrite
  const trySetScalar = <K extends keyof ChurchRow>(
    key: K,
    value: ChurchRow[K] | null,
    label?: string,
  ): void => {
    if (value === null || value === undefined) return
    const existing = church[key]
    if (existing && !options.overwrite) return
    if (existing === value) return
    updates[key as string] = value
    changes.push(`${label ?? String(key)}=${JSON.stringify(value).slice(0, 40)}`)
  }

  trySetScalar('pastorName', extracted.pastorName)
  // Denomination: the extracted label is one signal among several. The
  // classifier weighs it against the church's name and website and returns a
  // canonical label + family, so a page that says "Roman Catholic" is stored
  // as Catholic and a label that contradicts the name does not win.
  if (extracted.denomination && (options.overwrite || !church.denomination)) {
    const resolved = resolveDenomination({
      name: church.name,
      website: church.website,
      denomination: extracted.denomination,
      denominationFamily: extracted.denominationFamily,
    })
    if (resolved) {
      if (resolved.denomination !== church.denomination) {
        updates.denomination = resolved.denomination
        changes.push(`denomination=${JSON.stringify(resolved.denomination).slice(0, 40)}`)
      }
      if (resolved.denominationFamily !== church.denominationFamily) {
        updates.denominationFamily = resolved.denominationFamily
      }
    }
  }
  trySetScalar('yearEstablished', extracted.yearEstablished)
  if (!extracted.description || !isJunkDescription(extracted.description, church.name)) {
    trySetScalar('description', extracted.description)
  }
  trySetScalar('email', extracted.email)
  trySetScalar('phone', extracted.phone)
  trySetScalar('goodForChildren', extracted.amenities.goodForChildren)
  trySetScalar('goodForGroups', extracted.amenities.goodForGroups)
  trySetScalar('wheelchairAccessible', extracted.amenities.wheelchairAccessible)

  // Languages: union with existing
  if (extracted.languages.length > 0) {
    const existing = new Set(church.languages)
    const before = existing.size
    for (const lang of extracted.languages) existing.add(lang)
    if (existing.size > before) {
      updates.languages = Array.from(existing)
      changes.push(`languages(+${existing.size - before})`)
    }
  }

  if (Object.keys(updates).length > 0) {
    if (!options.dryRun) {
      await prisma.church.update({
        where: { id: church.id },
        data: updates,
      })
    }
    stats.fieldsUpdated += Object.keys(updates).length
  }

  // Services: replace auto-imported, preserve hand-curated. Office hours and
  // other artifacts are dropped first — a wrong time is worse than none.
  const artifacts = findServiceArtifacts(
    extracted.services.map((s, index) => ({ ...s, id: String(index), description: null })),
  )
  const services = extracted.services.filter((_, index) => !artifacts.has(String(index)))
  if (artifacts.size > 0) changes.push(`dropped ${artifacts.size} service artifact(s)`)
  if (services.length > 0) {
    if (!options.dryRun) {
      await prisma.churchService.deleteMany({
        where: { churchId: church.id, isAutoImported: true },
      })
      await prisma.churchService.createMany({
        data: services.map((s) => ({
          churchId: church.id,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          serviceType: s.serviceType,
          language: s.language,
          isAutoImported: true,
        })),
      })
    }
    stats.servicesCreated += services.length
    changes.push(`${services.length} service(s)`)
  }

  return changes
}
