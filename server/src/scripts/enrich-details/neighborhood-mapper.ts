/**
 * San Antonio Zip Code → Neighborhood Mapper
 *
 * Maps SA-area zip codes to their commonly known neighborhood or area name.
 * This covers the San Antonio metro area including surrounding communities
 * (Alamo Heights, Leon Valley, Converse, etc.).
 *
 * Sources: USPS, SA city planning maps, and local convention.
 * A zip can span multiple neighborhoods — we pick the most recognizable name.
 *
 * Incorporated suburbs inside the metro (Windcrest, Castle Hills, Live Oak…)
 * share zip codes with San Antonio proper, so when the postal city is one of
 * them it wins over the zip lookup.
 */

/**
 * Map of zip code → neighborhood name.
 * Covers ~120 San Antonio metro zip codes.
 */
const ZIP_TO_NEIGHBORHOOD: Record<string, string> = {
  // ── Downtown & Inner City ──
  '78201': 'Jefferson',
  '78202': 'East Side',
  '78203': 'Denver Heights',
  '78204': 'Southtown',
  '78205': 'Downtown',
  '78206': 'Downtown',
  '78207': 'West Side',
  '78208': 'Government Hill',
  '78209': 'Alamo Heights',
  '78210': 'Highland Park',
  '78211': 'Southwest Side',
  '78212': 'Monte Vista',
  '78213': 'Castle Hills',
  '78214': 'Harlandale',
  '78215': 'River North',
  '78216': 'Airport Area',
  '78217': 'Northeast Side',
  '78218': 'Northeast Side',
  '78219': 'East Side',
  '78220': 'East Side',
  '78221': 'South Side',
  '78222': 'Southeast Side',
  '78223': 'Southeast Side',
  '78224': 'Southwest Side',
  '78225': 'Palm Heights',
  '78226': 'Port San Antonio',
  '78227': 'Southwest Side',
  '78228': 'West Side',
  '78229': 'Medical Center',
  '78230': 'Northwest Side',
  '78231': 'Shavano Park',
  '78232': 'North Central',
  '78233': 'Northeast Side',
  '78234': 'Fort Sam Houston',
  '78235': 'Brooks',
  '78236': 'Lackland AFB',
  '78237': 'West Side',
  '78238': 'Leon Valley',
  '78239': 'Windcrest',
  '78240': 'Northwest Side',
  '78241': 'South Side',
  '78242': 'Southwest Side',
  '78243': 'Lackland AFB',
  '78244': 'Kirby',
  '78245': 'Far West Side',
  '78246': 'Downtown',
  '78247': 'Thousand Oaks',
  '78248': 'North Central',
  '78249': 'Northwest Side',
  '78250': 'Northwest Side',
  '78251': 'Westover Hills',
  '78252': 'Far West Side',
  '78253': 'Alamo Ranch',
  '78254': 'Northwest Side',
  '78255': 'Leon Springs',
  '78256': 'La Cantera',
  '78257': 'The Dominion',
  '78258': 'Stone Oak',
  '78259': 'Stone Oak',
  '78260': 'Timberwood Park',
  '78261': 'Far North Side',
  '78263': 'Far East Side',
  '78264': 'South Side',
  '78265': 'Downtown',
  '78266': 'Garden Ridge',

  // ── Surrounding cities ──
  '78002': 'Atascosa',
  '78006': 'Boerne',
  '78015': 'Boerne',
  '78023': 'Helotes',
  '78039': 'LaCoste',
  '78052': 'Lytle',
  '78056': 'Mico',
  '78059': 'Natalia',
  '78063': 'Pipe Creek',
  '78064': 'Pleasanton',
  '78065': 'Poteet',
  '78066': 'Riomedina',
  '78069': 'Somerset',
  '78073': 'Von Ormy',
  '78101': 'Adkins',
  '78108': 'Cibolo',
  '78109': 'Converse',
  '78112': 'Elmendorf',
  '78114': 'Floresville',
  '78121': 'La Vernia',
  '78124': 'Marion',
  '78148': 'Universal City',
  '78150': 'Randolph AFB',
  '78152': 'Saint Hedwig',
  '78154': 'Schertz',
  '78155': 'Seguin',
  '78163': 'Bulverde',

  // ── New Braunfels corridor ──
  '78130': 'New Braunfels',
  '78131': 'New Braunfels',
  '78132': 'New Braunfels',
  '78133': 'Canyon Lake',
  '78135': 'New Braunfels',
}

/** Postal city names that should be shown under a different label. */
const CITY_ALIASES: Record<string, string> = {
  'lackland air force base': 'Lackland AFB',
  'jbsa lackland': 'Lackland AFB',
  'jbsa fort sam houston': 'Fort Sam Houston',
  'randolph air force base': 'Randolph AFB',
  'jbsa randolph': 'Randolph AFB',
  'saint hedwig': 'St. Hedwig',
}

/** Municipalities in the metro that are their own place, not a part of San Antonio. */
const METRO_CITIES = new Set(
  [
    'Adkins',
    'Alamo Heights',
    'Atascosa',
    'Balcones Heights',
    'Boerne',
    'Bulverde',
    'Castle Hills',
    'China Grove',
    'Cibolo',
    'Converse',
    'Elmendorf',
    'Fair Oaks Ranch',
    'Floresville',
    'Garden Ridge',
    'Helotes',
    'Hill Country Village',
    'Hollywood Park',
    'Kirby',
    'La Vernia',
    'Leon Valley',
    'Live Oak',
    'Lytle',
    'New Braunfels',
    'Olmos Park',
    'Schertz',
    'Selma',
    'Shavano Park',
    'Somerset',
    'St. Hedwig',
    'Terrell Hills',
    'Universal City',
    'Von Ormy',
    'Windcrest',
  ].map((city) => city.toLowerCase()),
)

/**
 * Look up the neighborhood for a church.
 *
 * A postal city that is its own municipality wins; otherwise the zip code
 * decides. Returns null if neither is in our SA metro map.
 */
export function getNeighborhood(zipCode: string, city?: string | null): string | null {
  const trimmedCity = city?.trim()
  if (trimmedCity) {
    const alias = CITY_ALIASES[trimmedCity.toLowerCase()]
    if (alias) return alias
    if (METRO_CITIES.has(trimmedCity.toLowerCase())) return trimmedCity
  }
  return ZIP_TO_NEIGHBORHOOD[zipCode] ?? null
}
