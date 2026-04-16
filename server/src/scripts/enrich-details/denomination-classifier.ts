/**
 * Denomination Classifier
 *
 * Classifies church denomination and denomination family from the church name.
 * Uses keyword pattern matching against a curated list of denomination markers
 * commonly found in San Antonio church names.
 *
 * Each rule maps a regex pattern to a { denomination, family } pair. Rules are
 * tried in order — the first match wins. More specific patterns (e.g.
 * "Southern Baptist") come before broader ones (e.g. "Baptist") so we get the
 * most precise classification possible.
 */

export interface DenominationResult {
  denomination: string
  denominationFamily: string
}

interface DenominationRule {
  pattern: RegExp
  denomination: string
  denominationFamily: string
}

/**
 * Ordered list of denomination classification rules.
 * More specific patterns MUST come before broader ones.
 */
const DENOMINATION_RULES: DenominationRule[] = [
  // ── Catholic ──
  { pattern: /\bcatholic\b/i, denomination: 'Catholic', denominationFamily: 'Catholic' },
  {
    pattern: /\b(san\s|santa\s|santo\s|nuestra\s|sagrado\s|inmaculad)/i,
    denomination: 'Catholic',
    denominationFamily: 'Catholic',
  },
  {
    pattern:
      /\b(our\slady|sacred\sheart|holy\sfamily|holy\scross|holy\sspirit|holy\strinity|st\.?\s\w+('s)?\s(catholic|parish|cathedral))/i,
    denomination: 'Catholic',
    denominationFamily: 'Catholic',
  },
  { pattern: /\bcathedral\b/i, denomination: 'Catholic', denominationFamily: 'Catholic' },
  { pattern: /\bparish\b/i, denomination: 'Catholic', denominationFamily: 'Catholic' },

  // ── Orthodox ──
  {
    pattern: /\b(orthodox|ortodox)\b/i,
    denomination: 'Orthodox',
    denominationFamily: 'Orthodox',
  },

  // ── Anglican / Episcopal ──
  {
    pattern: /\bepiscopal\b/i,
    denomination: 'Episcopal',
    denominationFamily: 'Anglican/Episcopal',
  },
  {
    pattern: /\banglican\b/i,
    denomination: 'Anglican',
    denominationFamily: 'Anglican/Episcopal',
  },

  // ── Lutheran ──
  {
    pattern: /\blutheran\b/i,
    denomination: 'Lutheran',
    denominationFamily: 'Lutheran',
  },

  // ── Presbyterian ──
  {
    pattern: /\bpresbyterian\b/i,
    denomination: 'Presbyterian',
    denominationFamily: 'Presbyterian/Reformed',
  },
  {
    pattern: /\breformed\b/i,
    denomination: 'Reformed',
    denominationFamily: 'Presbyterian/Reformed',
  },

  // ── Methodist ──
  {
    pattern: /\b(a\.?m\.?e\.?\s|african\smethodist)\b/i,
    denomination: 'African Methodist Episcopal',
    denominationFamily: 'Methodist',
  },
  {
    pattern: /\bmethodist\b/i,
    denomination: 'Methodist',
    denominationFamily: 'Methodist',
  },

  // ── Baptist (specific before general) ──
  {
    pattern: /\bsouthern\sbaptist\b/i,
    denomination: 'Southern Baptist',
    denominationFamily: 'Baptist',
  },
  {
    pattern: /\bmissionary\sbaptist\b/i,
    denomination: 'Missionary Baptist',
    denominationFamily: 'Baptist',
  },
  {
    pattern: /\bprimitive\sbaptist\b/i,
    denomination: 'Primitive Baptist',
    denominationFamily: 'Baptist',
  },
  {
    pattern: /\bfree\swill\sbaptist\b/i,
    denomination: 'Free Will Baptist',
    denominationFamily: 'Baptist',
  },
  {
    pattern: /\bbaptist\b/i,
    denomination: 'Baptist',
    denominationFamily: 'Baptist',
  },

  // ── Pentecostal / Charismatic ──
  {
    pattern: /\bassembl(y|ies)\sof\sgod\b/i,
    denomination: 'Assemblies of God',
    denominationFamily: 'Pentecostal',
  },
  {
    pattern: /\bchurch\sof\sgod\sin\schrist\b/i,
    denomination: 'Church of God in Christ',
    denominationFamily: 'Pentecostal',
  },
  {
    pattern: /\bchurch\sof\sgod\b/i,
    denomination: 'Church of God',
    denominationFamily: 'Pentecostal',
  },
  {
    pattern: /\bpentecostal\b/i,
    denomination: 'Pentecostal',
    denominationFamily: 'Pentecostal',
  },
  {
    pattern: /\bapostolic\b/i,
    denomination: 'Apostolic',
    denominationFamily: 'Pentecostal',
  },
  {
    pattern: /\bfull\sgospel\b/i,
    denomination: 'Full Gospel',
    denominationFamily: 'Pentecostal',
  },
  {
    pattern: /\bfoursquare\b/i,
    denomination: 'Foursquare',
    denominationFamily: 'Pentecostal',
  },

  // ── Church of Christ / Disciples ──
  {
    pattern: /\bchurch(es)?\sof\schrist\b/i,
    denomination: 'Church of Christ',
    denominationFamily: 'Restoration Movement',
  },
  {
    pattern: /\bdisciples\sof\schrist\b/i,
    denomination: 'Disciples of Christ',
    denominationFamily: 'Restoration Movement',
  },
  {
    pattern: /\bchristian\schurch\b/i,
    denomination: 'Christian Church',
    denominationFamily: 'Restoration Movement',
  },

  // ── Adventist ──
  {
    pattern: /\b(seventh[- ]day\s)?adventist\b/i,
    denomination: 'Seventh-day Adventist',
    denominationFamily: 'Adventist',
  },

  // ── Church of the Nazarene ──
  {
    pattern: /\bnazarene\b/i,
    denomination: 'Church of the Nazarene',
    denominationFamily: 'Holiness',
  },

  // ── Salvation Army ──
  {
    pattern: /\bsalvation\sarmy\b/i,
    denomination: 'Salvation Army',
    denominationFamily: 'Holiness',
  },

  // ── Latter-day Saints ──
  {
    pattern: /\b(latter[- ]day\ssaints?|l\.?d\.?s\.?|mormon)\b/i,
    denomination: 'Church of Jesus Christ of Latter-day Saints',
    denominationFamily: 'Latter-day Saints',
  },

  // ── Jehovah's Witnesses ──
  {
    pattern: /\b(jehovah|kingdom\shall)\b/i,
    denomination: "Jehovah's Witnesses",
    denominationFamily: "Jehovah's Witnesses",
  },

  // ── Unitarian ──
  {
    pattern: /\bunitarian\b/i,
    denomination: 'Unitarian Universalist',
    denominationFamily: 'Unitarian',
  },

  // ── Quaker ──
  {
    pattern: /\b(quaker|friends\smeeting)\b/i,
    denomination: 'Quaker',
    denominationFamily: 'Quaker',
  },

  // ── Covenant ──
  {
    pattern: /\bcovenant\b/i,
    denomination: 'Evangelical Covenant',
    denominationFamily: 'Evangelical',
  },

  // ── Non-denominational markers ──
  // These broad patterns are intentionally LAST so specific denominations match first.
  {
    pattern: /\b(non[- ]?denominational|interdenominational|community\schurch)\b/i,
    denomination: 'Non-denominational',
    denominationFamily: 'Non-denominational',
  },
  {
    pattern: /\b(bible\schurch|bible\sfellowship)\b/i,
    denomination: 'Non-denominational',
    denominationFamily: 'Non-denominational',
  },
  {
    pattern: /\b(vida|iglesia\sde\scristo|iglesia\sbautista)\b/i,
    denomination: 'Non-denominational',
    denominationFamily: 'Non-denominational',
  },
]

/**
 * Attempt to classify a church's denomination from its name.
 * Returns null if no pattern matches — the caller decides whether to skip or
 * assign a default.
 */
export function classifyDenomination(churchName: string): DenominationResult | null {
  for (const rule of DENOMINATION_RULES) {
    if (rule.pattern.test(churchName)) {
      return {
        denomination: rule.denomination,
        denominationFamily: rule.denominationFamily,
      }
    }
  }

  return null
}
