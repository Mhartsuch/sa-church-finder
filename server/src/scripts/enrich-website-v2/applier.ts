import type { PrismaClient } from '@prisma/client'

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
  trySetScalar('denomination', extracted.denomination)
  if (extracted.denomination && (options.overwrite || !church.denomination)) {
    if (extracted.denominationFamily) {
      updates.denominationFamily = extracted.denominationFamily
    }
  }
  trySetScalar('yearEstablished', extracted.yearEstablished)
  trySetScalar('description', extracted.description)
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

  // Services: replace auto-imported, preserve hand-curated
  if (extracted.services.length > 0) {
    if (!options.dryRun) {
      await prisma.churchService.deleteMany({
        where: { churchId: church.id, isAutoImported: true },
      })
      await prisma.churchService.createMany({
        data: extracted.services.map((s) => ({
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
    stats.servicesCreated += extracted.services.length
    changes.push(`${extracted.services.length} service(s)`)
  }

  // Events: replace auto-imported, preserve hand-curated. Filter out any
  // events in the past (defense in depth — the parser already skips these).
  const now = Date.now()
  const upcomingEvents = extracted.events.filter((e) => {
    const t = new Date(e.startTime).getTime()
    return !isNaN(t) && t >= now - 24 * 60 * 60 * 1000
  })

  if (upcomingEvents.length > 0) {
    if (!options.dryRun) {
      await prisma.event.deleteMany({
        where: { churchId: church.id, isAutoImported: true },
      })
      await prisma.event.createMany({
        data: upcomingEvents.map((e) => ({
          churchId: church.id,
          title: e.title,
          description: e.description,
          eventType: e.eventType,
          startTime: new Date(e.startTime),
          endTime: e.endTime ? new Date(e.endTime) : null,
          locationOverride: e.locationOverride,
          isAutoImported: true,
          sourceUrl: e.sourceUrl,
        })),
      })
    }
    stats.eventsCreated += upcomingEvents.length
    changes.push(`${upcomingEvents.length} event(s)`)
  }

  return changes
}
