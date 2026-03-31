export interface HomeSpotlight {
  slug: string;
  name: string;
  denomination: string;
  neighborhood: string;
  address: string;
  website: string;
  serviceSummary: string;
  badge: string;
  blurb: string;
  highlights: string[];
}

export const HOME_SPOTLIGHTS: HomeSpotlight[] = [
  {
    slug: 'san-fernando-cathedral',
    name: 'San Fernando Cathedral',
    denomination: 'Catholic',
    neighborhood: 'Downtown',
    address: '231 W Commerce St',
    website: 'https://sfcathedral.org/',
    serviceSummary: 'English, Spanish, and bilingual Mass in the heart of downtown',
    badge: 'Historic anchor',
    blurb:
      "Built around the heart of downtown, San Fernando Cathedral is one of San Antonio's defining church landmarks and one of the oldest continuously active congregations in Texas.",
    highlights: ['Canary Islands roots', 'Spanish & English ministry', 'Main Plaza'],
  },
  {
    slug: 'first-baptist-church-of-san-antonio',
    name: 'First Baptist Church of San Antonio',
    denomination: 'Baptist',
    neighborhood: 'Downtown',
    address: '515 McCullough Ave',
    website: 'https://fbcsa.org/',
    serviceSummary: 'Traditional, contemporary, Spanish, and Karenni Sunday worship',
    badge: 'Heart of the city',
    blurb:
      'FBCSA describes itself as a community in the heart of the city, pairing a long downtown history with a broad mix of worship, study, and family ministries.',
    highlights: ['Downtown campus', 'Re:Verse Bible study', 'English and Spanish ministry'],
  },
  {
    slug: 'travis-park-united-methodist-church',
    name: 'Travis Park Church',
    denomination: 'Methodist',
    neighborhood: 'Downtown',
    address: '230 E Travis St',
    website: 'https://travispark.org/',
    serviceSummary: 'Inclusive Sunday worship at 9:45 a.m.',
    badge: 'Inclusive downtown community',
    blurb:
      'Travis Park Church is a historic Reconciling United Methodist congregation known for public-facing justice work, open hospitality, and a visibly downtown presence.',
    highlights: ['Affirming community', 'Historic sanctuary', 'Justice-minded outreach'],
  },
  {
    slug: 'mission-concepcion',
    name: 'Mission Concepcion',
    denomination: 'Catholic',
    neighborhood: 'Mission Reach',
    address: '807 Mission Rd',
    website: 'https://www.missionconcepcion.org/',
    serviceSummary: 'Sunday Mass at 10 a.m. and noon inside the mission',
    badge: 'World Heritage parish',
    blurb:
      'Mission Concepcion remains an active Catholic worship space while also standing as one of the oldest unrestored stone churches in the United States.',
    highlights: ['Founded in 1731', 'UNESCO World Heritage site', 'Mission corridor'],
  },
  {
    slug: 'episcopal-church-of-the-holy-spirit',
    name: 'Episcopal Church of the Holy Spirit',
    denomination: 'Episcopal',
    neighborhood: 'Northwest',
    address: '11093 Bandera Rd',
    website: 'https://www.sentbythespirit.org/',
    serviceSummary: 'Sunday Eucharist at 10 a.m. and 5:30 p.m. plus Wednesday healing prayers',
    badge: 'Northwest parish',
    blurb:
      'Holy Spirit centers its ministry on unity, prayer, and welcome, with traditional and reflective worship options and a steady neighborhood rhythm on Bandera Road.',
    highlights: [
      'Morning and evening worship',
      'Healing prayers midweek',
      'Children and youth formation',
    ],
  },
];
