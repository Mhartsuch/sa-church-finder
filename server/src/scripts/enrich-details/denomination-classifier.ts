/**
 * Denomination Classifier
 *
 * Derives a church's denomination and denomination family from the signals we
 * hold about it, in order of reliability:
 *
 *  1. Curated overrides for well-known congregations whose names say nothing.
 *  2. Explicit denominational words in the name ("Baptist", "Luterana", "UMC").
 *  3. The website host (jw.org, churchofjesuschrist.org).
 *  4. A denomination label already stored on the record (website extraction),
 *     normalized to a canonical label and family.
 *  5. The church's own description, but only when it states what the church
 *     is ("a non-denominational church", "is a Korean Baptist congregation").
 *
 * Name rules are tried in order and the first match wins. Explicit
 * denominational words come BEFORE the Catholic naming heuristics, so
 * "Holy Trinity Presbyterian Church" is Presbyterian and "St Paul Baptist
 * Church" is Baptist. When nothing matches the result is null: an unknown
 * denomination is shown as unknown rather than guessed.
 */

export interface DenominationResult {
  denomination: string
  denominationFamily: string
}

export interface DenominationInput {
  name: string
  denomination?: string | null
  denominationFamily?: string | null
  website?: string | null
  description?: string | null
}

/** Every family the app can show. `Other` holds traditions too small to list. */
export const DENOMINATION_FAMILIES = [
  'Catholic',
  'Baptist',
  'Non-denominational',
  'Pentecostal',
  'Methodist',
  'Lutheran',
  'Restoration Movement',
  'Anglican/Episcopal',
  'Presbyterian/Reformed',
  'Orthodox',
  'Adventist',
  'Evangelical',
  'Holiness',
  'Latter-day Saints',
  "Jehovah's Witnesses",
  'Other',
] as const

interface DenominationRule {
  pattern: RegExp
  /** When set, a name matching this is skipped by the rule. */
  unless?: RegExp
  denomination: string
  denominationFamily: string
}

const rule = (
  pattern: RegExp,
  denomination: string,
  denominationFamily: string,
  unless?: RegExp,
): DenominationRule => ({ pattern, denomination, denominationFamily, unless })

/** Saints venerated across traditions: a bare "St. Paul's Church" proves nothing. */
const CROSS_TRADITION_SAINTS =
  /^(st\.?|saint)\s+(paul|john|mark|luke|matthew|andrew|stephen|james|thomas|peter|george|mary|philip|timothy|michael|david)('?s)?\b(?!\s+(the\s+evangelist|berchmans|neumann|bosco|vianney|of\s+the\s+cross|magdalen|more|aquinas))/i

/**
 * Ordered list of name rules. More specific patterns MUST come before broader
 * ones, and explicit denominational words before naming heuristics.
 */
const NAME_RULES: DenominationRule[] = [
  // ── Latter-day Saints ──
  // "<City> <State> Temple" is the LDS temple naming pattern.
  rule(
    /\b(latter[- ]day\ssaints?|l\.?d\.?s\.?|mormon|texas\stemple|santos\sde\slos\s[uú]ltimos\sd[ií]as)\b/i,
    'Church of Jesus Christ of Latter-day Saints',
    'Latter-day Saints',
  ),

  // ── Jehovah's Witnesses ──
  rule(
    /\b(jehovah['’]?s?\switness|testigos\sde\sjehov[aá]|kingdom\shall|sal[oó]n\sdel\sreino)/i,
    "Jehovah's Witnesses",
    "Jehovah's Witnesses",
  ),

  // ── Small traditions with unmistakable names ──
  rule(/\bunitarian\b/i, 'Unitarian Universalist', 'Other'),
  rule(/\b(quaker|friends\smeeting)\b/i, 'Quaker', 'Other'),
  rule(/\b(messianic|mesi[aá]nica)\b/i, 'Messianic', 'Other'),
  rule(/\bchristian\sscien(ce|tist)\b/i, 'Christian Science', 'Other'),
  rule(/\bcommunity\sof\schrist\b/i, 'Community of Christ', 'Other'),
  rule(/\b(la\sluz\sdel\smundo|light\sof\sthe\sworld\schurch)\b/i, 'La Luz del Mundo', 'Other'),
  rule(/\bcelestial\schurch\sof\schrist\b/i, 'Celestial Church of Christ', 'Other'),
  rule(/\bnative\samerican\schurch\b/i, 'Native American Church', 'Other'),
  rule(/^unity\s(of|church)\b/i, 'Unity', 'Other'),
  rule(/\bunited\schurch\sof\schrist\b|\bUCC\b/, 'United Church of Christ', 'Other'),

  // ── Eastern Catholic (before Orthodox: "Byzantine", "Maronite") ──
  rule(
    /\b(maronite|melkite|syro[- ]malabar|knanaya\scatholic|byzantine\scatholic)\b/i,
    'Eastern Catholic',
    'Catholic',
  ),

  // ── Presbyterian / Reformed (before Orthodox: "Orthodox Presbyterian") ──
  rule(/\b(presbyterian|presbiteriana|PCA\b)/i, 'Presbyterian', 'Presbyterian/Reformed'),

  // ── Orthodox ──
  rule(/\b(orthodox|ortodox[ao]?|tewahedo|tewahido|tewahdo)\b/i, 'Orthodox', 'Orthodox'),
  rule(/\bmar\sthoma\b/i, 'Mar Thoma', 'Orthodox'),

  // ── Methodist (before Episcopal: "African Methodist Episcopal") ──
  rule(
    /\b(a\.?m\.?e\.?(\szion)?\b|african\smethodist|christian\smethodist\sepiscopal|c\.?m\.?e\.?\b)/i,
    'African Methodist Episcopal',
    'Methodist',
  ),
  rule(/\bfree\smethodist|metodista\slibre\b/i, 'Free Methodist', 'Methodist'),
  rule(/\bglobal\smethodist\b/i, 'Global Methodist', 'Methodist'),
  rule(/\bunited\smethodist\b|\bUMC\b/i, 'United Methodist', 'Methodist'),
  rule(/\b(methodist|metodista)\b/i, 'Methodist', 'Methodist'),

  // ── Anglican / Episcopal ──
  rule(/\b(episcopal|episcopaliana)\b/i, 'Episcopal', 'Anglican/Episcopal'),
  rule(/\banglican[ao]?\b/i, 'Anglican', 'Anglican/Episcopal'),

  // ── Lutheran ──
  rule(/\b(lutheran|luteran[ao]|LCMS|ELCA)\b/i, 'Lutheran', 'Lutheran'),

  // ── Adventist ──
  rule(/\b(adventist|adventista|SDA)\b/i, 'Seventh-day Adventist', 'Adventist'),
  rule(/\bchurch\sof\sgod\s\(?seventh[- ]day\)?/i, 'Church of God (Seventh Day)', 'Adventist'),

  // ── Baptist (specific before general) ──
  rule(/\bsouthern\sbaptist\b/i, 'Southern Baptist', 'Baptist'),
  rule(/\bmissionary\sbaptist\b/i, 'Missionary Baptist', 'Baptist'),
  rule(/\bprimitive\sbaptist\b/i, 'Primitive Baptist', 'Baptist'),
  rule(/\bfree\swill\sbaptist\b/i, 'Free Will Baptist', 'Baptist'),
  rule(/\b(independent|fundamental)\sbaptist\b/i, 'Independent Baptist', 'Baptist'),
  rule(/\b(baptist|bautista|batista)\b/i, 'Baptist', 'Baptist'),

  // ── Pentecostal / Charismatic ──
  rule(
    /\b(assembl(y|ies)\sof\sgod|asambleas?\sde\sdios)\b|\bA\/?G\b/i,
    'Assemblies of God',
    'Pentecostal',
  ),
  rule(
    /\b(church\sof\sgod\sin\schrist|god\sin\schrist|c\.?o\.?g\.?i\.?c\.?)\b/i,
    'Church of God in Christ',
    'Pentecostal',
  ),
  rule(
    /\b(united\spentecostal|pentecostal\sunida|IPUL|IPUH|UPCI)\b/i,
    'United Pentecostal',
    'Pentecostal',
  ),
  rule(
    /\b(IAFCJ|apost[oó]lica\sde\sla\sfe\sen\scristo\sjes[uú]s)\b/i,
    'Apostolic Assembly',
    'Pentecostal',
  ),
  rule(
    /\b(redeemed\schristian\schurch\sof\sgod|RCCG)\b/i,
    'Redeemed Christian Church of God',
    'Pentecostal',
  ),
  rule(/\bchurch\sof\spentecost\b/i, 'Church of Pentecost', 'Pentecostal'),
  rule(/\bvictory\soutreach\b/i, 'Victory Outreach', 'Pentecostal'),
  rule(
    /\b(the\sdoor\schristian\sfellowship|potter['’]?s\shouse\schristian)\b/i,
    'Christian Fellowship Ministries',
    'Pentecostal',
  ),
  rule(/\biglesia\suniversal\b/i, 'Universal Church of the Kingdom of God', 'Pentecostal'),
  rule(/\bnew\stestament\schristian\schurch\b/i, 'New Testament Christian Churches', 'Pentecostal'),
  rule(/\bfoursquare|cuadrangular\b/i, 'Foursquare', 'Pentecostal'),
  rule(/\bfull\sgospel\b/i, 'Full Gospel', 'Pentecostal'),
  rule(/\b(pentecostal(es)?|pentecost[eé]s)\b/i, 'Pentecostal', 'Pentecostal'),
  rule(/\b(apostolic|apost[oó]lica)\b/i, 'Apostolic', 'Pentecostal'),
  rule(/\b(church\sof\sgod|iglesia\sde\sdios)\b/i, 'Church of God', 'Pentecostal'),

  // ── Holiness ──
  rule(/\b(nazarene|nazareno)\b/i, 'Church of the Nazarene', 'Holiness'),
  rule(/\bsalvation\sarmy\b/i, 'Salvation Army', 'Holiness'),
  rule(/\bwesleyan\b/i, 'Wesleyan', 'Holiness'),

  // ── Restoration Movement ──
  rule(
    /\b(church(es)?\sof\schrist|iglesia\sde\scristo)\b/i,
    'Church of Christ',
    'Restoration Movement',
  ),
  rule(/\bdisciples\sof\schrist\b/i, 'Disciples of Christ', 'Restoration Movement'),

  // ── Catholic ──
  rule(/\b(catholic|cat[oó]lica)\b/i, 'Catholic', 'Catholic'),
  rule(
    /\b(our\slady|nuestra\sse[nñ]ora|sacred\sheart|sagrado\scoraz[oó]n|immaculate|inmaculad[ao]|blessed\ssacrament|holy\srosary|basilica|oblate|carmelite|capuchin|friary|schoenstatt|incarnate\sword|little\sflower|divine\s(mercy|providence)|holy\sfamily\sparish)\b/i,
    'Catholic',
    'Catholic',
  ),
  // The five Spanish colonial missions are active Catholic parishes.
  rule(
    /\bmission\s(concepci[oó]n|san\s(jos[eé]|juan|francisco)|espada)\b/i,
    'Catholic',
    'Catholic',
  ),
  // "San/Santa/Santo <saint>" — but never the city: "San Antonio" only counts
  // when it is the saint himself ("San Antonio de Padua").
  rule(/\b(san\s(?!antonio\b(?!\sde\s))|santa\s(?!fe\b)|santo\s)/i, 'Catholic', 'Catholic'),
  // A saint's name on its own is Catholic unless the saint is shared by
  // Anglican, Lutheran, Orthodox and Baptist congregations alike.
  rule(/^(st\.?|saint|sts\.?)\s+\w+/i, 'Catholic', 'Catholic', CROSS_TRADITION_SAINTS),

  // ── Evangelical bodies ──
  rule(/\bevangelical\sfree\b/i, 'Evangelical Free Church', 'Evangelical'),
  rule(/\bvineyard\b/i, 'Vineyard', 'Evangelical'),
  rule(/\bcovenant\b/i, 'Evangelical Covenant', 'Evangelical', /\b(new|grace)\scovenant\b/i),
  rule(/\balliance\b/i, 'Christian and Missionary Alliance', 'Evangelical'),

  // ── Restoration Movement, name-pattern only ──
  // "<Place> Christian Church" is the Disciples / independent Christian
  // Church pattern. Names built on an adjective or ethnicity are too
  // ambiguous to label.
  rule(
    /\bchristian\schurch\b/i,
    'Christian Church',
    'Restoration Movement',
    /\b(agape|first\slove|hispanic|vietnamese|korean|chinese|livingway|whole\slife|redeeming\sgrace|iglesia|international|family)\b|^san\santonio\schristian\schurch$/i,
  ),

  // ── Non-denominational markers ──
  // Intentionally LAST so specific denominations match first.
  rule(/\bcalvary\schapel\b/i, 'Calvary Chapel', 'Non-denominational'),
  rule(
    /\b(non[- ]?denominational|interdenomina[ct]ional|community\schurch|bible\schurch|bible\sfellowship|cowboy\schurch|iglesia\sb[ií]blica)\b/i,
    'Non-denominational',
    'Non-denominational',
  ),
]

/**
 * Congregations whose names carry no denominational word but whose identity
 * is well established. Keys are lowercased names.
 */
const NAME_OVERRIDES: Record<string, DenominationResult> = {
  'cornerstone church': {
    denomination: 'Non-denominational',
    denominationFamily: 'Non-denominational',
  },
  'san fernando cathedral': { denomination: 'Catholic', denominationFamily: 'Catholic' },
  'el carmen church': { denomination: 'Catholic', denominationFamily: 'Catholic' },
  'annunciation of mary': { denomination: 'Catholic', denominationFamily: 'Catholic' },
  'mary mother of the church': { denomination: 'Catholic', denominationFamily: 'Catholic' },
  'resurrection of the lord': { denomination: 'Catholic', denominationFamily: 'Catholic' },
  'assumption chapel': { denomination: 'Catholic', denominationFamily: 'Catholic' },
  'st edward the confessor holy catholic church western rite': {
    denomination: 'Anglican Catholic',
    denominationFamily: 'Anglican/Episcopal',
  },
  'grace orthodox presbyterian church': {
    denomination: 'Orthodox Presbyterian',
    denominationFamily: 'Presbyterian/Reformed',
  },
}

const WEBSITE_RULES: { host: RegExp; result: DenominationResult }[] = [
  {
    host: /(^|\.)(lds\.org|churchofjesuschrist\.org)$/i,
    result: {
      denomination: 'Church of Jesus Christ of Latter-day Saints',
      denominationFamily: 'Latter-day Saints',
    },
  },
  {
    host: /(^|\.)jw\.org$/i,
    result: { denomination: "Jehovah's Witnesses", denominationFamily: "Jehovah's Witnesses" },
  },
]

/**
 * Stored denomination labels that contain no classifiable keyword, mapped to
 * their family. Keys are lowercased.
 */
const LABEL_FAMILIES: Record<string, string> = {
  'roman catholic': 'Catholic',
  'send network': 'Baptist',
  'cooperative baptist fellowship': 'Baptist',
  'calvary chapel': 'Non-denominational',
  'christian fellowship ministries': 'Pentecostal',
  'the door christian fellowship ministries': 'Pentecostal',
  "the potter's house christian fellowship": 'Pentecostal',
  'universal church of the kingdom of god': 'Pentecostal',
  'el rey jesús texas': 'Pentecostal',
  'church of god, anderson, indiana': 'Holiness',
  interdenominacional: 'Non-denominational',
}

const CANONICAL_LABELS: Record<string, string> = {
  'roman catholic': 'Catholic',
  'non-denominational': 'Non-denominational',
  interdenominacional: 'Non-denominational',
  'send network': 'Southern Baptist',
}

const KNOWN_FAMILIES = new Set<string>(DENOMINATION_FAMILIES)

/** Name fragments the retired rules mistook for Catholic markers. */
const LEGACY_CATHOLIC_TRIGGER = /\bsan\s+antonio\b|\bcathedral\b|\bparish\b/i

/**
 * "…is a Korean Baptist congregation" — the tradition must sit directly before
 * the noun, inside an is-a statement. A passing mention ("we partner with
 * Baptist missions") is not a self-description.
 */
const SELF_DESCRIPTION =
  /\b(?:is|are|we\s+are|we['’]re)\s+an?\s+(?:[\w'’-]+,?\s+){0,4}?(baptist|lutheran|methodist|presbyterian|pentecostal|episcopal|anglican|catholic|nazarene|adventist|non[- ]?denominational)(?:\s+christian)?\s+(?:church|congregation|parish|community|fellowship)\b/i

/** Classify from a description, only when it says outright what the church is. */
export function classifyFromDescription(description: string): DenominationResult | null {
  const match = SELF_DESCRIPTION.exec(description)
  if (!match) return null
  return /^non/i.test(match[1])
    ? { denomination: 'Non-denominational', denominationFamily: 'Non-denominational' }
    : classifyDenomination(match[1])
}

/**
 * Classify a church's denomination from its name alone.
 * Returns null when the name carries no denominational signal.
 */
export function classifyDenomination(churchName: string): DenominationResult | null {
  const name = churchName.trim().replace(/\s+/g, ' ')
  const override = NAME_OVERRIDES[name.toLowerCase()]
  if (override) return override

  for (const { pattern, unless, denomination, denominationFamily } of NAME_RULES) {
    if (pattern.test(name) && !(unless && unless.test(name))) {
      return { denomination, denominationFamily }
    }
  }
  return null
}

function hostOf(website: string | null | undefined): string | null {
  if (!website) return null
  try {
    return new URL(website).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

/** Normalize a stored denomination label to a canonical label + family. */
export function normalizeDenominationLabel(label: string): DenominationResult | null {
  const trimmed = label.trim()
  if (!trimmed) return null
  const key = trimmed.toLowerCase()

  const family = LABEL_FAMILIES[key]
  if (family) return { denomination: CANONICAL_LABELS[key] ?? trimmed, denominationFamily: family }

  if (/^non[- ]?denominational\b/i.test(trimmed)) {
    return { denomination: 'Non-denominational', denominationFamily: 'Non-denominational' }
  }

  const classified = classifyDenomination(trimmed)
  if (!classified) return null
  // Keep the more specific stored label ("Presbyterian Church (USA)") unless
  // it is just a spelling variant of the canonical one.
  const keepLabel = !CANONICAL_LABELS[key] && key !== classified.denomination.toLowerCase()
  return {
    denomination: keepLabel ? trimmed : classified.denomination,
    denominationFamily: classified.denominationFamily,
  }
}

/**
 * Resolve the best denomination for a church from every signal we hold.
 * Returns null when the denomination is genuinely unknown.
 */
export function resolveDenomination(input: DenominationInput): DenominationResult | null {
  const fromName = classifyDenomination(input.name)
  const stored = input.denomination ? normalizeDenominationLabel(input.denomination) : null

  if (fromName) {
    // A stored label in the same family is usually the more specific one
    // ("Southern Baptist" for "Trinity Baptist Church").
    if (
      stored &&
      stored.denominationFamily === fromName.denominationFamily &&
      stored.denomination.length > fromName.denomination.length
    ) {
      return stored
    }
    return fromName
  }

  const host = hostOf(input.website)
  if (host) {
    const match = WEBSITE_RULES.find((r) => r.host.test(host))
    if (match) return match.result
  }

  // Earlier classifier versions labelled every "... San Antonio" church (and
  // every "Cathedral" or "Parish") as Catholic. A bare stored "Catholic" on
  // such a name, with no Catholic signal of its own, is that bug rather than
  // evidence. Any other stored "Catholic" came from the church's website and
  // is trusted — which also keeps this function stable when re-run on its
  // own output.
  const storedBareCatholic =
    input.denomination?.trim() === 'Catholic' ||
    (!input.denomination && input.denominationFamily === 'Catholic')
  const isLegacyCatholicGuess = storedBareCatholic && LEGACY_CATHOLIC_TRIGGER.test(input.name)

  if (stored && !isLegacyCatholicGuess) return stored

  const fromDescription = input.description ? classifyFromDescription(input.description) : null
  if (fromDescription) return fromDescription
  if (isLegacyCatholicGuess) return null

  // An unrecognized label (often the church's own network name) with a known
  // family: keep the family, keep the label.
  const family = input.denominationFamily?.trim()
  if (family && KNOWN_FAMILIES.has(family)) {
    return { denomination: input.denomination?.trim() || family, denominationFamily: family }
  }
  return null
}
