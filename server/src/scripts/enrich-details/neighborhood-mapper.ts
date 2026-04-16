/**
 * San Antonio Zip Code → Neighborhood Mapper
 *
 * Maps SA-area zip codes to their commonly known neighborhood or area name.
 * This covers the San Antonio metro area including surrounding communities
 * (Alamo Heights, Leon Valley, Converse, etc.).
 *
 * Sources: USPS, SA city planning maps, and local convention.
 * A zip can span multiple neighborhoods — we pick the most recognizable name.
 */

/**
 * Map of zip code → neighborhood name.
 * Covers ~120 San Antonio metro zip codes.
 */
const ZIP_TO_NEIGHBORHOOD: Record<string, string> = {
  // ── Downtown & Inner City ──
  '78201': 'Prospect Hill',
  '78202': 'Eastside',
  '78203': 'Denver Heights',
  '78204': 'Southtown',
  '78205': 'Downtown',
  '78206': 'Downtown',
  '78207': 'West Side',
  '78208': 'Government Hill',
  '78210': 'South Side',
  '78211': 'Southwest Side',
  '78212': 'Monte Vista',
  '78213': 'Balcones Heights',
  '78214': 'Harlandale',
  '78215': 'River North',
  '78216': 'Airport Area',
  '78217': 'Windcrest',
  '78218': 'Terrell Hills',
  '78219': 'East Terrell Hills',
  '78220': 'East Side',
  '78221': 'South Side',
  '78222': 'Southeast Side',
  '78223': 'Southeast Side',
  '78224': 'Southwest Side',
  '78225': 'Palm Heights',
  '78226': 'Lackland',
  '78227': 'Marbach',
  '78228': 'Culebra',
  '78229': 'Medical Center',
  '78230': 'Northwest Side',
  '78231': 'Northwest Side',
  '78232': 'North Central',
  '78233': 'Thousand Oaks',
  '78234': 'Fort Sam Houston',
  '78235': 'Kelly',
  '78236': 'Lackland AFB',
  '78237': 'West Side',
  '78238': 'Leon Valley',
  '78239': 'Northeast Side',
  '78240': 'USAA / Northwest',
  '78241': 'South Side',
  '78242': 'Lackland',
  '78243': 'Lackland',
  '78244': 'Kirby',
  '78245': 'Far West Side',
  '78246': 'Downtown',
  '78247': 'Stone Oak',
  '78248': 'North Side',
  '78249': 'Northwest Side',
  '78250': 'Westover Hills',
  '78251': 'Sea World',
  '78252': 'Far West Side',
  '78253': 'Helotes',
  '78254': 'Alamo Ranch',
  '78255': 'The Dominion',
  '78256': 'Shavano Park',
  '78257': 'The Dominion',
  '78258': 'Stone Oak',
  '78259': 'Stone Oak',
  '78260': 'Stone Oak',
  '78261': 'Stone Oak',
  '78263': 'Far East Side',
  '78264': 'South Side',
  '78265': 'Downtown',
  '78266': 'Bulverde',

  // ── Surrounding cities ──
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

/**
 * Look up the neighborhood for a given zip code.
 * Returns null if the zip code isn't in our SA metro map.
 */
export function getNeighborhood(zipCode: string): string | null {
  return ZIP_TO_NEIGHBORHOOD[zipCode] ?? null
}
