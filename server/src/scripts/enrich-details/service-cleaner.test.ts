import { findServiceArtifacts, ServiceRow } from './service-cleaner'

let nextId = 0
const row = (
  dayOfWeek: number,
  startTime: string,
  serviceType = 'Service',
  extra: Partial<ServiceRow> = {},
): ServiceRow => ({
  id: `s${nextId++}`,
  dayOfWeek,
  startTime,
  endTime: null,
  serviceType,
  language: 'English',
  description: null,
  ...extra,
})

const kept = (rows: ServiceRow[]): string[] => {
  const artifacts = findServiceArtifacts(rows)
  return rows.filter((r) => !artifacts.has(r.id)).map((r) => `${r.dayOfWeek}@${r.startTime}`)
}

describe('findServiceArtifacts', () => {
  it('leaves an ordinary schedule untouched', () => {
    const rows = [row(0, '09:30'), row(0, '11:00'), row(3, '19:00'), row(3, '12:00')]
    expect(findServiceArtifacts(rows).size).toBe(0)
  })

  it('removes office hours stored as weekday services but keeps Sunday and evening rows', () => {
    const rows = [
      row(0, '11:00'),
      ...[1, 2, 3, 4].flatMap((day) => [row(day, '09:00'), row(day, '16:00')]),
      row(5, '09:00'),
      row(5, '14:00'), // early Friday close
      row(3, '19:30'), // real midweek service
      row(6, '10:00'), // Saturday office hours
      row(6, '18:00'), // Saturday evening service
    ]
    expect(kept(rows)).toEqual(['0@11:00', '3@19:30', '6@18:00'])
  })

  it('does not treat a twice-weekly daytime service as office hours', () => {
    const rows = [row(0, '10:00'), row(2, '09:30'), row(4, '09:30')]
    expect(findServiceArtifacts(rows).size).toBe(0)
  })

  it('removes a generic row that starts when another service ends', () => {
    const rows = [
      row(0, '09:15', 'Service', { endTime: '10:30', language: 'Spanish' }),
      row(0, '10:30'),
      row(0, '11:00', 'Service', { endTime: '12:30' }),
      row(0, '12:30'),
    ]
    const artifacts = findServiceArtifacts(rows)
    expect([...artifacts.values()]).toEqual([
      'end_time_of_another_service',
      'end_time_of_another_service',
    ])
    expect(kept(rows)).toEqual(['0@09:15', '0@11:00'])
  })

  it('removes generic rows at hours no congregation meets', () => {
    const rows = [row(0, '10:00'), row(0, '22:30'), row(2, '03:30')]
    expect(kept(rows)).toEqual(['0@10:00'])
  })

  it('removes generic rows beside a typed Mass schedule', () => {
    const rows = [
      row(0, '08:30', 'Mass'),
      row(0, '09:30'),
      row(6, '17:00', 'Vigil Mass'),
      row(6, '16:00'),
      row(6, '15:00', 'Confession'),
    ]
    expect(kept(rows)).toEqual(['0@08:30', '6@17:00', '6@15:00'])
  })

  it('never removes typed or described rows', () => {
    const rows = [
      ...[1, 2, 3, 4, 5].map((day) => row(day, '08:00', 'Morning Prayer')),
      ...[1, 2, 3].map((day) => row(day, '12:00', 'Service', { description: 'Noon Eucharist' })),
      row(2, '04:00', 'Prayer'),
    ]
    expect(findServiceArtifacts(rows).size).toBe(0)
  })

  it('removes exact duplicates, keeping the first', () => {
    const rows = [
      row(0, '11:00'),
      row(0, '11:00'),
      row(0, '11:00', 'Service', { language: 'Spanish' }),
    ]
    const artifacts = findServiceArtifacts(rows)
    expect(artifacts.get(rows[1].id)).toBe('duplicate')
    expect(artifacts.size).toBe(1)
  })
})
