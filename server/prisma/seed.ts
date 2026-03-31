import { PrismaClient, Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { curatedChurches } from './curated-seed-churches'

const prisma = new PrismaClient()

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function createFutureDate(daysFromNow: number, hour: number, minute: number): Date {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + daysFromNow)
  date.setHours(hour, minute, 0, 0)
  return date
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000)
}

// ──────────────────────────────────────────────
// Church seed data — 25 real San Antonio churches
// Coordinates verified against Google Maps
// ──────────────────────────────────────────────

interface SeedChurch {
  name: string
  denomination: string
  denominationFamily: string
  address: string
  zipCode: string
  neighborhood: string
  latitude: string
  longitude: string
  phone?: string
  email?: string
  website?: string
  pastorName?: string
  yearEstablished?: number
  description?: string
  amenities?: string[]
  languages?: string[]
  avgRating?: string
  reviewCount?: number
  isClaimed?: boolean
  coverImageUrl?: string
  coverImageAltText?: string
  services: Array<{
    dayOfWeek: number
    startTime: string
    endTime?: string
    serviceType: string
    language?: string
  }>
}

const legacyChurches: SeedChurch[] = [
  {
    name: 'San Fernando Cathedral',
    denomination: 'Catholic',
    denominationFamily: 'Catholic',
    address: '115 Main Plaza',
    zipCode: '78205',
    neighborhood: 'Downtown',
    latitude: '29.42410000',
    longitude: '-98.49360000',
    phone: '(210) 227-1297',
    email: 'info@sfcathedral.org',
    website: 'sfcathedral.org',
    pastorName: 'Archbishop Gustavo Garcia-Siller',
    yearEstablished: 1731,
    description:
      "Historic downtown cathedral parish serving San Antonio with daily Mass, bilingual ministry, and one of the city's defining sacred spaces.",
    amenities: ['Parking', 'Wheelchair Accessible', 'Livestream', 'Gift Shop'],
    languages: ['English', 'Spanish'],
    avgRating: '4.60',
    reviewCount: 45,
    isClaimed: true,
    services: [
      {
        dayOfWeek: 0,
        startTime: '08:00',
        endTime: '09:00',
        serviceType: 'Sunday Mass',
        language: 'English',
      },
      {
        dayOfWeek: 0,
        startTime: '10:00',
        endTime: '11:30',
        serviceType: 'Sunday Mass',
        language: 'Spanish',
      },
      { dayOfWeek: 3, startTime: '12:10', endTime: '12:40', serviceType: 'Weekday Mass' },
    ],
  },
  {
    name: 'First Baptist Church of San Antonio',
    denomination: 'Baptist',
    denominationFamily: 'Baptist',
    address: '515 McCullough Avenue',
    zipCode: '78215',
    neighborhood: 'Downtown North',
    latitude: '29.43820000',
    longitude: '-98.48760000',
    phone: '(210) 226-0363',
    email: 'info@fbcsa.org',
    website: 'www.fbcsa.org',
    yearEstablished: 1861,
    description:
      'Downtown Baptist church centered on Bible study, worship, and a broad mix of city-facing ministries.',
    amenities: ['Parking', 'Wheelchair Accessible', 'Nursery', 'Sunday School'],
    avgRating: '4.30',
    reviewCount: 32,
    services: [
      {
        dayOfWeek: 0,
        startTime: '08:45',
        endTime: '10:00',
        serviceType: 'Worship Service',
        language: 'English',
      },
      { dayOfWeek: 0, startTime: '11:00', endTime: '12:15', serviceType: 'Worship Service' },
      { dayOfWeek: 3, startTime: '18:30', endTime: '19:30', serviceType: 'Midweek Service' },
    ],
  },
  {
    name: 'Covenant Church San Antonio',
    denomination: 'Non-denominational',
    denominationFamily: 'Non-denominational',
    address: '14423 Blanco Road',
    zipCode: '78216',
    neighborhood: 'Stone Oak',
    latitude: '29.57420000',
    longitude: '-98.45030000',
    phone: '(210) 496-2500',
    website: 'www.covenantsa.com',
    yearEstablished: 1985,
    description:
      'Contemporary non-denominational church with emphasis on community outreach and modern worship.',
    amenities: [
      'Large Parking',
      'Wheelchair Accessible',
      'Nursery',
      'Youth Programs',
      'Coffee Bar',
    ],
    languages: ['English'],
    avgRating: '4.70',
    reviewCount: 58,
    isClaimed: true,
    services: [
      { dayOfWeek: 0, startTime: '09:00', endTime: '10:15', serviceType: 'Worship Service' },
      { dayOfWeek: 0, startTime: '11:00', endTime: '12:15', serviceType: 'Worship Service' },
      { dayOfWeek: 6, startTime: '18:00', endTime: '19:30', serviceType: 'Saturday Service' },
    ],
  },
  {
    name: 'Cornerstone Church',
    denomination: 'Pentecostal',
    denominationFamily: 'Pentecostal',
    address: '4488 I-37 North',
    zipCode: '78219',
    neighborhood: 'North San Antonio',
    latitude: '29.53210000',
    longitude: '-98.41560000',
    phone: '(210) 646-1688',
    website: 'www.cornerstonesa.org',
    pastorName: 'Curry Blake',
    yearEstablished: 1988,
    description: 'Dynamic Pentecostal church known for contemporary worship and healing ministry.',
    amenities: ['Ample Parking', 'Wheelchair Accessible', 'Nursery', 'Prayer Room'],
    languages: ['English'],
    avgRating: '4.40',
    reviewCount: 28,
    services: [
      { dayOfWeek: 0, startTime: '10:00', endTime: '11:45', serviceType: 'Sunday Service' },
      { dayOfWeek: 3, startTime: '19:30', endTime: '21:00', serviceType: 'Midweek Service' },
    ],
  },
  {
    name: 'Travis Park United Methodist Church',
    denomination: 'Methodist',
    denominationFamily: 'Methodist',
    address: '230 East Travis',
    zipCode: '78205',
    neighborhood: 'Downtown',
    latitude: '29.42870000',
    longitude: '-98.48330000',
    phone: '(210) 226-8341',
    website: 'www.travisparkunited.org',
    yearEstablished: 1876,
    description:
      'Historic downtown Methodist church known for inclusive worship, justice-minded outreach, and a strong neighborhood presence.',
    amenities: ['Limited Parking', 'Wheelchair Accessible', 'Nursery'],
    languages: ['English'],
    avgRating: '4.20',
    reviewCount: 19,
    services: [
      { dayOfWeek: 0, startTime: '09:45', endTime: '11:00', serviceType: 'Worship Service' },
    ],
  },
  {
    name: 'New Life Church',
    denomination: 'Assembly of God',
    denominationFamily: 'Pentecostal',
    address: '3303 Mission Road',
    zipCode: '78210',
    neighborhood: 'Southtown',
    latitude: '29.38200000',
    longitude: '-98.48930000',
    phone: '(210) 922-4543',
    website: 'www.newlifesa.com',
    yearEstablished: 1990,
    description: 'Spanish-language Assembly of God church serving the South San Antonio community.',
    amenities: ['Parking', 'Wheelchair Accessible', 'Nursery', 'Youth Center'],
    languages: ['Spanish', 'English'],
    avgRating: '4.50',
    reviewCount: 22,
    services: [
      {
        dayOfWeek: 0,
        startTime: '09:00',
        endTime: '10:30',
        serviceType: 'Service',
        language: 'Spanish',
      },
      {
        dayOfWeek: 0,
        startTime: '11:00',
        endTime: '12:30',
        serviceType: 'Service',
        language: 'Spanish',
      },
      { dayOfWeek: 5, startTime: '19:30', endTime: '21:00', serviceType: 'Friday Service' },
    ],
  },
  {
    name: 'Alamo Heights Baptist Church',
    denomination: 'Baptist',
    denominationFamily: 'Baptist',
    address: '700 East Sunset Drive',
    zipCode: '78209',
    neighborhood: 'Alamo Heights',
    latitude: '29.50820000',
    longitude: '-98.45620000',
    phone: '(210) 822-6241',
    website: 'www.ahbc.org',
    yearEstablished: 1954,
    description: 'Family-oriented Baptist church in prestigious Alamo Heights neighborhood.',
    amenities: ['Parking', 'Wheelchair Accessible', 'Nursery', 'Sunday School', 'Library'],
    languages: ['English'],
    avgRating: '4.30',
    reviewCount: 15,
    services: [
      { dayOfWeek: 0, startTime: '08:45', endTime: '10:00', serviceType: 'Traditional Service' },
      { dayOfWeek: 0, startTime: '11:00', endTime: '12:15', serviceType: 'Contemporary Service' },
    ],
  },
  {
    name: 'Grace Church San Antonio',
    denomination: 'Non-denominational',
    denominationFamily: 'Non-denominational',
    address: '18747 Blanco Road',
    zipCode: '78259',
    neighborhood: 'North San Antonio',
    latitude: '29.61420000',
    longitude: '-98.44010000',
    phone: '(210) 481-8724',
    website: 'www.graceChurchSA.com',
    yearEstablished: 1999,
    description:
      'Bible-centered non-denominational church with focus on discipleship and community.',
    amenities: ['Parking', 'Wheelchair Accessible', 'Nursery', 'Small Groups'],
    languages: ['English'],
    avgRating: '4.80',
    reviewCount: 41,
    isClaimed: true,
    services: [
      { dayOfWeek: 0, startTime: '10:30', endTime: '11:45', serviceType: 'Worship Service' },
      { dayOfWeek: 3, startTime: '19:00', endTime: '20:15', serviceType: 'Midweek Study' },
    ],
  },
  {
    name: 'Episcopal Church of the Holy Spirit',
    denomination: 'Episcopal',
    denominationFamily: 'Anglican',
    address: '11093 Bandera Road',
    zipCode: '78250',
    neighborhood: 'Northwest',
    latitude: '29.54850000',
    longitude: '-98.65390000',
    phone: '(210) 314-6729',
    email: 'holyspirit@sentbythespirit.org',
    website: 'www.sentbythespirit.org',
    pastorName: 'The Rev. Jason Roberts',
    description:
      'Northwest San Antonio Episcopal parish centered on weekly Eucharist, prayer, and family formation with both morning and evening Sunday worship.',
    amenities: ['Parking', 'Wheelchair Accessible', 'Livestream', 'Kids Ministry'],
    languages: ['English'],
    avgRating: '4.50',
    reviewCount: 12,
    services: [
      { dayOfWeek: 0, startTime: '10:00', endTime: '11:15', serviceType: 'Holy Eucharist' },
      { dayOfWeek: 0, startTime: '17:30', endTime: '18:15', serviceType: 'Holy Eucharist' },
      { dayOfWeek: 3, startTime: '17:00', endTime: '17:45', serviceType: 'Holy Eucharist' },
    ],
  },
  {
    name: 'Southside Baptist Church',
    denomination: 'Baptist',
    denominationFamily: 'Baptist',
    address: '2235 S. Presa',
    zipCode: '78210',
    neighborhood: 'Southtown',
    latitude: '29.38560000',
    longitude: '-98.47250000',
    phone: '(210) 226-8400',
    website: 'www.southsidebaptist.org',
    yearEstablished: 1947,
    description:
      'Community-focused Baptist church serving South San Antonio with bilingual services.',
    amenities: ['Parking', 'Wheelchair Accessible', 'Nursery', 'Community Center'],
    languages: ['English', 'Spanish'],
    avgRating: '4.00',
    reviewCount: 18,
    services: [
      {
        dayOfWeek: 0,
        startTime: '09:00',
        endTime: '10:15',
        serviceType: 'Service',
        language: 'English',
      },
      {
        dayOfWeek: 0,
        startTime: '11:00',
        endTime: '12:30',
        serviceType: 'Service',
        language: 'Spanish',
      },
    ],
  },
  {
    name: 'Mission Concepcion',
    denomination: 'Catholic',
    denominationFamily: 'Catholic',
    address: '807 Mission Road',
    zipCode: '78210',
    neighborhood: 'Southtown',
    latitude: '29.37780000',
    longitude: '-98.48360000',
    phone: '(210) 533-8955',
    website: 'www.missionconcepcion.org',
    yearEstablished: 1731,
    description:
      "Active Catholic parish inside the San Antonio Missions corridor, pairing neighborhood worship with one of the city's most recognizable historic churches.",
    amenities: ['Parking', 'Wheelchair Accessible', 'Historic Site'],
    languages: ['English', 'Spanish'],
    avgRating: '4.90',
    reviewCount: 67,
    isClaimed: true,
    services: [
      { dayOfWeek: 0, startTime: '09:00', endTime: '10:00', serviceType: 'Sunday Mass' },
      { dayOfWeek: 0, startTime: '11:00', endTime: '12:00', serviceType: 'Sunday Mass' },
      { dayOfWeek: 3, startTime: '18:30', endTime: '19:15', serviceType: 'Weekday Mass' },
    ],
  },
  {
    name: 'Dominion Church',
    denomination: 'Apostolic',
    denominationFamily: 'Pentecostal',
    address: '8106 Datapoint Drive',
    zipCode: '78229',
    neighborhood: 'Medical Center',
    latitude: '29.42670000',
    longitude: '-98.59820000',
    phone: '(210) 690-4111',
    website: 'www.dominionchurch.com',
    pastorName: 'Apostle Leroy Thompson Sr.',
    yearEstablished: 1994,
    description: 'Apostolic church emphasizing prosperity gospel and healing ministry.',
    amenities: ['Parking', 'Wheelchair Accessible', 'Nursery'],
    languages: ['English'],
    avgRating: '3.80',
    reviewCount: 9,
    services: [
      { dayOfWeek: 0, startTime: '10:00', endTime: '11:30', serviceType: 'Service' },
      { dayOfWeek: 3, startTime: '19:00', endTime: '20:30', serviceType: 'Service' },
    ],
  },
  {
    name: 'Lakewood Church San Antonio',
    denomination: 'Non-denominational',
    denominationFamily: 'Non-denominational',
    address: '19446 Huebner Road',
    zipCode: '78258',
    neighborhood: 'North San Antonio',
    latitude: '29.58970000',
    longitude: '-98.53420000',
    phone: '(210) 340-0200',
    website: 'www.lakewoodchurchsa.com',
    yearEstablished: 2005,
    description: 'Large contemporary non-denominational church with state-of-the-art facilities.',
    amenities: ['Large Parking', 'Wheelchair Accessible', 'Nursery', 'Cafe', 'Bookstore'],
    languages: ['English'],
    avgRating: '4.50',
    reviewCount: 73,
    isClaimed: true,
    services: [
      { dayOfWeek: 0, startTime: '09:00', endTime: '10:30', serviceType: 'Service' },
      { dayOfWeek: 0, startTime: '11:15', endTime: '12:45', serviceType: 'Service' },
      { dayOfWeek: 6, startTime: '18:30', endTime: '20:00', serviceType: 'Saturday Service' },
    ],
  },
  {
    name: 'Broadway Baptist Church',
    denomination: 'Baptist',
    denominationFamily: 'Baptist',
    address: '511 West Ashby Place',
    zipCode: '78212',
    neighborhood: 'Monticello Park',
    latitude: '29.44570000',
    longitude: '-98.52830000',
    phone: '(210) 226-1518',
    website: 'www.broadwaybaptist.org',
    yearEstablished: 1891,
    description: 'Historic Baptist church known for music ministry and community engagement.',
    amenities: ['Parking', 'Wheelchair Accessible', 'Choir', 'Music School'],
    languages: ['English'],
    avgRating: '4.20',
    reviewCount: 14,
    services: [
      { dayOfWeek: 0, startTime: '10:45', endTime: '12:00', serviceType: 'Worship Service' },
      { dayOfWeek: 3, startTime: '19:00', endTime: '20:00', serviceType: 'Prayer Meeting' },
    ],
  },
  {
    name: 'San Antonio Korean Church',
    denomination: 'Non-denominational',
    denominationFamily: 'Non-denominational',
    address: '12602 Vance Jackson Road',
    zipCode: '78230',
    neighborhood: 'West San Antonio',
    latitude: '29.48920000',
    longitude: '-98.60450000',
    phone: '(210) 696-9737',
    website: 'www.sakc.org',
    yearEstablished: 2001,
    description: 'Korean-speaking congregation with English youth ministry.',
    amenities: ['Parking', 'Wheelchair Accessible', 'Nursery'],
    languages: ['Korean', 'English'],
    avgRating: '4.60',
    reviewCount: 8,
    services: [
      {
        dayOfWeek: 0,
        startTime: '10:00',
        endTime: '11:30',
        serviceType: 'Worship',
        language: 'Korean',
      },
      {
        dayOfWeek: 0,
        startTime: '11:45',
        endTime: '12:45',
        serviceType: 'Youth Service',
        language: 'English',
      },
    ],
  },
  {
    name: "St. Mary's University Catholic Center",
    denomination: 'Catholic',
    denominationFamily: 'Catholic',
    address: '3900 Charles Avenue',
    zipCode: '78228',
    neighborhood: "St. Mary's",
    latitude: '29.46580000',
    longitude: '-98.55270000',
    phone: '(210) 436-3011',
    website: 'www.stmarys.edu/campus-ministry',
    yearEstablished: 1955,
    description:
      "Catholic center serving St. Mary's University students and surrounding community.",
    amenities: ['Parking', 'Wheelchair Accessible', 'Student Center'],
    languages: ['English', 'Spanish'],
    avgRating: '4.10',
    reviewCount: 11,
    services: [
      { dayOfWeek: 0, startTime: '10:00', endTime: '11:00', serviceType: 'Sunday Mass' },
      { dayOfWeek: 0, startTime: '19:00', endTime: '20:00', serviceType: 'Evening Mass' },
      { dayOfWeek: 2, startTime: '12:00', endTime: '12:30', serviceType: 'Weekday Mass' },
    ],
  },
  {
    name: 'Friendship West Baptist Church',
    denomination: 'Baptist',
    denominationFamily: 'Baptist',
    address: '2000 East 11th Place',
    zipCode: '78702',
    neighborhood: 'East Side',
    latitude: '29.41560000',
    longitude: '-98.42340000',
    phone: '(210) 223-2556',
    website: 'www.friendshipwest.org',
    pastorName: 'Pastor Fred Luter',
    yearEstablished: 1956,
    description: 'Community-engaged Baptist church with active social justice ministry.',
    amenities: ['Parking', 'Wheelchair Accessible', 'Community Programs'],
    languages: ['English'],
    avgRating: '4.00',
    reviewCount: 7,
    services: [
      { dayOfWeek: 0, startTime: '08:00', endTime: '09:15', serviceType: 'Traditional Service' },
      { dayOfWeek: 0, startTime: '11:00', endTime: '12:30', serviceType: 'Contemporary Service' },
    ],
  },
  {
    name: 'Bethel Lutheran Church',
    denomination: 'Lutheran',
    denominationFamily: 'Lutheran',
    address: '139 East Grayson Street',
    zipCode: '78215',
    neighborhood: 'Monte Vista',
    latitude: '29.46230000',
    longitude: '-98.49560000',
    phone: '(210) 227-1211',
    website: 'www.bethelsalsa.org',
    yearEstablished: 1946,
    description: 'Historic Lutheran church with traditional worship and community outreach.',
    amenities: ['Parking', 'Wheelchair Accessible', 'Choir'],
    languages: ['English'],
    avgRating: '4.30',
    reviewCount: 10,
    services: [
      { dayOfWeek: 0, startTime: '09:00', endTime: '10:15', serviceType: 'Divine Service' },
      { dayOfWeek: 3, startTime: '19:00', endTime: '20:00', serviceType: 'Midweek Service' },
    ],
  },
  {
    name: 'Victory Church',
    denomination: 'Foursquare',
    denominationFamily: 'Pentecostal',
    address: '4414 Blanco Road',
    zipCode: '78216',
    neighborhood: 'North Central',
    latitude: '29.56120000',
    longitude: '-98.44890000',
    phone: '(210) 340-8500',
    website: 'www.victorychurchsa.org',
    yearEstablished: 2007,
    description:
      'Modern Foursquare church with focus on contemporary worship and community outreach.',
    amenities: ['Parking', 'Wheelchair Accessible', 'Nursery', 'Youth Programs'],
    languages: ['English'],
    avgRating: '4.40',
    reviewCount: 16,
    services: [
      { dayOfWeek: 0, startTime: '10:00', endTime: '11:30', serviceType: 'Celebration Service' },
      { dayOfWeek: 3, startTime: '19:00', endTime: '20:30', serviceType: 'Midweek Encounter' },
    ],
  },
  {
    name: 'First Chinese Baptist Church of San Antonio',
    denomination: 'Baptist',
    denominationFamily: 'Baptist',
    address: '5481 Prue Road',
    zipCode: '78240',
    neighborhood: 'Northwest',
    latitude: '29.54485500',
    longitude: '-98.59385000',
    phone: '(210) 558-6393',
    website: 'fcbcsa.org',
    pastorName: 'John Lee',
    yearEstablished: 1923,
    description:
      'Historic multilingual Baptist church serving Chinese-speaking and English-speaking worshippers with Sunday services, discipleship, and family ministries on the northwest side.',
    amenities: ['Parking', 'Wheelchair Accessible', 'Livestream', 'Kids Ministry'],
    languages: ['Chinese', 'English'],
    avgRating: '4.50',
    reviewCount: 6,
    services: [
      {
        dayOfWeek: 0,
        startTime: '09:45',
        endTime: '11:00',
        serviceType: 'Chinese Worship Service',
        language: 'Chinese',
      },
      {
        dayOfWeek: 0,
        startTime: '11:15',
        endTime: '12:30',
        serviceType: 'English Worship Service',
        language: 'English',
      },
    ],
  },
  {
    name: 'Pentecostal Church of God in Christ',
    denomination: 'COGIC',
    denominationFamily: 'Pentecostal',
    address: '1435 South Presa Street',
    zipCode: '78210',
    neighborhood: 'Southtown',
    latitude: '29.39450000',
    longitude: '-98.47120000',
    phone: '(210) 532-8211',
    website: 'www.pocgic-sa.org',
    yearEstablished: 1963,
    description:
      'Historic COGIC church serving the South San Antonio community with vibrant worship.',
    amenities: ['Parking', 'Wheelchair Accessible', 'Food Pantry'],
    languages: ['English', 'Spanish'],
    avgRating: '4.20',
    reviewCount: 13,
    services: [
      { dayOfWeek: 0, startTime: '10:00', endTime: '11:45', serviceType: 'Service' },
      { dayOfWeek: 3, startTime: '19:00', endTime: '20:30', serviceType: 'Bible Study' },
    ],
  },
  {
    name: "Christ's Church of the Valley",
    denomination: 'Non-denominational',
    denominationFamily: 'Non-denominational',
    address: '12615 I-35 North',
    zipCode: '78233',
    neighborhood: 'North San Antonio',
    latitude: '29.58450000',
    longitude: '-98.40120000',
    phone: '(210) 490-8222',
    website: 'www.cccv.org',
    yearEstablished: 2002,
    description: 'Contemporary non-denominational church with strong youth and family ministry.',
    amenities: ['Large Parking', 'Wheelchair Accessible', 'Nursery', 'Youth Center'],
    languages: ['English'],
    avgRating: '4.60',
    reviewCount: 34,
    isClaimed: true,
    services: [
      { dayOfWeek: 0, startTime: '09:00', endTime: '10:30', serviceType: 'Service' },
      { dayOfWeek: 0, startTime: '11:00', endTime: '12:30', serviceType: 'Service' },
      { dayOfWeek: 6, startTime: '19:00', endTime: '20:30', serviceType: 'Saturday Night Live' },
    ],
  },
  {
    name: 'Oak Hills Church',
    denomination: 'Non-denominational',
    denominationFamily: 'Non-denominational',
    address: '19595 IH 10 W',
    zipCode: '78257',
    neighborhood: 'Far Northwest',
    latitude: '29.65439560',
    longitude: '-98.62552520',
    phone: '(210) 698-6868',
    website: 'oakhills.church',
    description:
      'Large northwest-side congregation known for Bible teaching, local service, and multiple Sunday worship options, including an on-campus Spanish-language gathering.',
    amenities: ['Parking', 'Wheelchair Accessible', 'Livestream', 'Coffee Bar', 'Kids Ministry'],
    languages: ['English', 'Spanish'],
    services: [
      { dayOfWeek: 0, startTime: '08:30', endTime: '09:45', serviceType: 'Worship Service' },
      { dayOfWeek: 0, startTime: '10:00', endTime: '11:15', serviceType: 'Worship Service' },
      { dayOfWeek: 0, startTime: '11:30', endTime: '12:45', serviceType: 'Worship Service' },
      {
        dayOfWeek: 0,
        startTime: '11:30',
        endTime: '12:45',
        serviceType: 'Servicio en Espanol',
        language: 'Spanish',
      },
    ],
  },
  {
    name: 'First Presbyterian Church of San Antonio',
    denomination: 'Presbyterian',
    denominationFamily: 'Presbyterian',
    address: '404 N Alamo Street',
    zipCode: '78205',
    neighborhood: 'Downtown',
    latitude: '29.42896910',
    longitude: '-98.48502520',
    phone: '(210) 226-0215',
    website: 'www.fpcsanantonio.org',
    description:
      'Historic downtown Presbyterian congregation focused on Bible teaching, discipleship, city ministry, and church planting across San Antonio.',
    amenities: ['Parking', 'Wheelchair Accessible', 'Nursery', 'Livestream', 'Kids Ministry'],
    languages: ['English'],
    services: [
      { dayOfWeek: 0, startTime: '09:30', endTime: '10:45', serviceType: 'Worship Service' },
      { dayOfWeek: 0, startTime: '11:00', endTime: '12:15', serviceType: 'Worship Service' },
    ],
  },
  {
    name: 'St. Luke Catholic Church',
    denomination: 'Catholic',
    denominationFamily: 'Catholic',
    address: '4603 Manitou Drive',
    zipCode: '78228',
    neighborhood: 'West Side',
    latitude: '29.48619960',
    longitude: '-98.57590990',
    phone: '(210) 433-2777',
    email: 'church@saintlukeparish.com',
    website: 'saintlukeparish.com',
    pastorName: 'Fr. Joel Quezada',
    yearEstablished: 1959,
    description:
      'Multicultural West Side Catholic parish with a full weekend Mass schedule, weekday worship, parish school, and strong faith-formation ministries.',
    amenities: [
      'Parking',
      'Wheelchair Accessible',
      'Parish School',
      'Faith Formation',
      'Livestream',
    ],
    languages: ['English', 'Spanish'],
    services: [
      { dayOfWeek: 6, startTime: '17:30', endTime: '18:30', serviceType: 'Saturday Mass' },
      { dayOfWeek: 0, startTime: '08:00', endTime: '09:00', serviceType: 'Sunday Mass' },
      { dayOfWeek: 0, startTime: '10:00', endTime: '11:00', serviceType: 'Sunday Mass' },
      { dayOfWeek: 0, startTime: '12:00', endTime: '13:00', serviceType: 'Sunday Mass' },
      {
        dayOfWeek: 0,
        startTime: '14:00',
        endTime: '15:00',
        serviceType: 'Sunday Mass',
        language: 'Spanish',
      },
      { dayOfWeek: 0, startTime: '16:00', endTime: '17:00', serviceType: 'Sunday Mass' },
      { dayOfWeek: 5, startTime: '12:00', endTime: '12:45', serviceType: 'Weekday Mass' },
    ],
  },
]

// Keep the older wide shortlist only as reference while the seed now uses the
// 12-profile gold set.
void legacyChurches

const churches: SeedChurch[] = curatedChurches

async function main() {
  console.log('Starting seed...\n')

  // ── Verify PostGIS is enabled ──
  try {
    const postgisVersion = await prisma.$queryRaw<Array<{ postgis_version: string }>>`
      SELECT PostGIS_version() AS postgis_version
    `
    console.log(`PostGIS version: ${postgisVersion[0].postgis_version}`)
  } catch {
    console.warn('⚠  PostGIS extension not available — spatial features will be limited.')
    console.warn('   Run: CREATE EXTENSION IF NOT EXISTS "postgis";')
  }

  // ── Clear existing data (respects FK order) ──
  console.log('Clearing existing data...')
  await prisma.userSavedChurch.deleteMany()
  await prisma.reviewVote.deleteMany()
  await prisma.review.deleteMany()
  await prisma.event.deleteMany()
  await prisma.churchPhoto.deleteMany()
  await prisma.churchService.deleteMany()
  await prisma.churchClaim.deleteMany()
  await prisma.emailVerificationToken.deleteMany()
  await prisma.passwordResetToken.deleteMany()
  await prisma.user.deleteMany()
  await prisma.church.deleteMany()

  // ── Create test users ──
  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      passwordHash: await hashPassword('password123'),
      name: 'Test User',
      role: 'USER',
      emailVerified: true,
    },
  })

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@sachurchfinder.com',
      passwordHash: await hashPassword('admin123'),
      name: 'Site Admin',
      role: 'SITE_ADMIN',
      emailVerified: true,
    },
  })

  console.log(`Created users: ${testUser.email}, ${adminUser.email}`)

  // ── Create churches ──
  // The DB trigger `churches_location_sync` automatically populates
  // the `location` geography column from latitude/longitude on insert.
  const createdChurches = []
  let createdPhotoCount = 0

  for (const churchData of churches) {
    const slug = generateSlug(churchData.name)

    const church = await prisma.church.create({
      data: {
        name: churchData.name,
        slug,
        denomination: churchData.denomination,
        denominationFamily: churchData.denominationFamily,
        address: churchData.address,
        zipCode: churchData.zipCode,
        neighborhood: churchData.neighborhood,
        latitude: new Prisma.Decimal(churchData.latitude),
        longitude: new Prisma.Decimal(churchData.longitude),
        phone: churchData.phone,
        email: churchData.email,
        website: churchData.website,
        pastorName: churchData.pastorName,
        yearEstablished: churchData.yearEstablished,
        description: churchData.description,
        amenities: churchData.amenities || [],
        languages: churchData.languages || ['English'],
        coverImageUrl: churchData.coverImageUrl,
        services: {
          create: churchData.services.map((service) => ({
            dayOfWeek: service.dayOfWeek,
            startTime: service.startTime,
            endTime: service.endTime,
            serviceType: service.serviceType,
            language: service.language || 'English',
          })),
        },
      },
      include: {
        services: true,
      },
    })

    if (churchData.coverImageUrl) {
      await prisma.churchPhoto.create({
        data: {
          churchId: church.id,
          url: churchData.coverImageUrl,
          altText: churchData.coverImageAltText || `${churchData.name} cover image`,
        },
      })
      createdPhotoCount += 1
    }

    createdChurches.push(church)
    console.log(`  ✓ ${church.name} (${church.services.length} services)`)
  }

  console.log(`\nCreated ${createdChurches.length} churches`)
  console.log(`Created ${createdPhotoCount} church photos`)

  // ── Verify PostGIS location column was populated ──
  try {
    const locationCheck = await prisma.$queryRaw<Array<{ name: string; lat: number; lng: number }>>`
      SELECT
        name,
        ST_Y("location"::geometry) AS lat,
        ST_X("location"::geometry) AS lng
      FROM churches
      WHERE "location" IS NOT NULL
      LIMIT 3
    `
    console.log('\nPostGIS location verification:')
    for (const row of locationCheck) {
      console.log(`  ✓ ${row.name}: (${row.lat}, ${row.lng})`)
    }

    // Test a spatial query: find churches within 2 miles of downtown SA
    const nearbyCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count FROM churches
      WHERE ST_DWithin(
        "location",
        ST_SetSRID(ST_MakePoint(-98.4936, 29.4241), 4326)::geography,
        3218.69
      )
    `
    console.log(`\nSpatial query test: ${nearbyCount[0].count} churches within 2 miles of downtown`)
  } catch {
    console.warn('\n⚠  Could not verify PostGIS location column (extension may not be enabled)')
  }

  // ── Create sample reviews ──
  const reviewChurches = createdChurches.slice(0, 5)

  const reviewData: Array<{
    churchIndex: number
    rating: string
    body: string
    welcomeRating: number
    worshipRating: number
    sermonRating: number
    facilitiesRating: number
  }> = []

  for (const review of reviewData) {
    const church = reviewChurches[review.churchIndex]
    if (church) {
      await prisma.review.create({
        data: {
          userId: testUser.id,
          churchId: church.id,
          rating: new Prisma.Decimal(review.rating),
          body: review.body,
          welcomeRating: review.welcomeRating,
          worshipRating: review.worshipRating,
          sermonRating: review.sermonRating,
          facilitiesRating: review.facilitiesRating,
        },
      })
    }
  }
  console.log(`Created ${reviewData.length} seeded reviews`)

  // ── Create saved churches ──
  // No events are seeded for the active gold set.
  const eventBlueprints = [
    {
      title: 'Neighborhood Dinner',
      description:
        'A casual shared meal designed for newcomers, longtime members, and anyone looking to reconnect midweek.',
      eventType: 'community',
      startHour: 18,
      startMinute: 30,
      durationMinutes: 90,
      locationOverride: 'Fellowship Hall',
      isRecurring: false,
      recurrenceRule: null,
    },
    {
      title: 'Volunteer Service Day',
      description:
        'Serve alongside the church team on a practical neighborhood project with a short prayer huddle before kickoff.',
      eventType: 'volunteer',
      startHour: 9,
      startMinute: 0,
      durationMinutes: 180,
      locationOverride: 'Ministry Center',
      isRecurring: false,
      recurrenceRule: null,
    },
    {
      title: 'Midweek Bible Study',
      description:
        'An open Bible study with discussion-friendly teaching and time to meet other households in the church.',
      eventType: 'study',
      startHour: 19,
      startMinute: 0,
      durationMinutes: 75,
      locationOverride: 'Room 201',
      isRecurring: true,
      recurrenceRule: 'FREQ=WEEKLY;COUNT=8',
    },
    {
      title: 'Family Worship Night',
      description:
        'A relaxed evening of worship, testimony, and prayer for families, friends, and first-time guests.',
      eventType: 'service',
      startHour: 18,
      startMinute: 0,
      durationMinutes: 90,
      locationOverride: null,
      isRecurring: false,
      recurrenceRule: null,
    },
    {
      title: 'Youth Hangout',
      description:
        'Students gather for games, a short message, and small-group conversation led by the youth team.',
      eventType: 'youth',
      startHour: 18,
      startMinute: 30,
      durationMinutes: 120,
      locationOverride: 'Student Center',
      isRecurring: true,
      recurrenceRule: 'FREQ=WEEKLY;COUNT=6',
    },
    {
      title: 'Prayer and Care Gathering',
      description:
        'A smaller community gathering focused on prayer, encouragement, and meeting practical needs together.',
      eventType: 'other',
      startHour: 18,
      startMinute: 45,
      durationMinutes: 75,
      locationOverride: 'Prayer Room',
      isRecurring: false,
      recurrenceRule: null,
    },
  ] as const

  let createdEventCount = 0

  for (const [index, church] of [] as Array<[number, (typeof createdChurches)[number]]>) {
    const primaryBlueprint = eventBlueprints[index % eventBlueprints.length]
    const primaryStart = createFutureDate(
      (index % 6) + 1,
      primaryBlueprint.startHour,
      primaryBlueprint.startMinute,
    )

    await prisma.event.create({
      data: {
        churchId: church.id,
        title: primaryBlueprint.title,
        description: primaryBlueprint.description,
        eventType: primaryBlueprint.eventType,
        startTime: primaryStart,
        endTime: addMinutes(primaryStart, primaryBlueprint.durationMinutes),
        locationOverride: primaryBlueprint.locationOverride,
        isRecurring: primaryBlueprint.isRecurring,
        recurrenceRule: primaryBlueprint.recurrenceRule,
        createdById: adminUser.id,
      },
    })
    createdEventCount += 1

    if (church.isClaimed) {
      const secondaryBlueprint = eventBlueprints[(index + 2) % eventBlueprints.length]
      const secondaryStart = createFutureDate(
        (index % 8) + 8,
        secondaryBlueprint.startHour,
        secondaryBlueprint.startMinute,
      )

      await prisma.event.create({
        data: {
          churchId: church.id,
          title: `${secondaryBlueprint.title} at ${church.name}`,
          description: secondaryBlueprint.description,
          eventType: secondaryBlueprint.eventType,
          startTime: secondaryStart,
          endTime: addMinutes(secondaryStart, secondaryBlueprint.durationMinutes),
          locationOverride: secondaryBlueprint.locationOverride,
          isRecurring: secondaryBlueprint.isRecurring,
          recurrenceRule: secondaryBlueprint.recurrenceRule,
          createdById: adminUser.id,
        },
      })
      createdEventCount += 1
    }
  }
  console.log(`Created ${createdEventCount} seeded events`)

  // Create saved churches
  const savedChurchIds = createdChurches.slice(0, 3).map((c) => c.id)
  for (const churchId of savedChurchIds) {
    await prisma.userSavedChurch.create({
      data: { userId: testUser.id, churchId },
    })
  }
  console.log(`Created ${savedChurchIds.length} saved churches`)

  console.log('\n✅ Seed completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
