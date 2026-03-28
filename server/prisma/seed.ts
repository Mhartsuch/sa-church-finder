import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

interface ChurchData {
  name: string;
  denomination: string;
  denominationFamily: string;
  address: string;
  zipCode: string;
  neighborhood: string;
  latitude: string;
  longitude: string;
  phone?: string;
  email?: string;
  website?: string;
  pastorName?: string;
  yearEstablished?: number;
  description?: string;
  amenities?: string[];
  languages?: string[];
  services: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime?: string;
    serviceType: string;
    language?: string;
  }>;
}

const churches: ChurchData[] = [
  {
    name: "Cathedral of Saint Ferdinand",
    denomination: "Catholic",
    denominationFamily: "Catholic",
    address: "115 Main Plaza",
    zipCode: "78205",
    neighborhood: "Downtown",
    latitude: "29.4241",
    longitude: "-98.4936",
    phone: "(210) 227-1297",
    website: "www.cathedral-sf.org",
    pastorName: "Archbishop Gustavo García-Siller",
    yearEstablished: 1868,
    description: "Historic cathedral serving the San Antonio Catholic community with traditional Spanish architecture.",
    amenities: ["Parking", "Wheelchair Accessible", "Choir", "Gift Shop"],
    languages: ["English", "Spanish"],
    services: [
      { dayOfWeek: 0, startTime: "08:00", endTime: "09:00", serviceType: "Sunday Mass", language: "English" },
      { dayOfWeek: 0, startTime: "10:00", endTime: "11:30", serviceType: "Sunday Mass", language: "Spanish" },
      { dayOfWeek: 3, startTime: "12:10", endTime: "12:40", serviceType: "Weekday Mass" },
    ],
  },
  {
    name: "First Baptist Church of San Antonio",
    denomination: "Baptist",
    denominationFamily: "Baptist",
    address: "210 North St. Mary's Street",
    zipCode: "78205",
    neighborhood: "Downtown",
    latitude: "29.4312",
    longitude: "-98.4910",
    phone: "(210) 226-2171",
    website: "www.fbcsa.org",
    yearEstablished: 1861,
    description: "Historic Baptist church in downtown San Antonio with contemporary and traditional services.",
    amenities: ["Parking", "Wheelchair Accessible", "Nursery", "Sunday School"],
    services: [
      { dayOfWeek: 0, startTime: "08:45", endTime: "10:00", serviceType: "Worship Service", language: "English" },
      { dayOfWeek: 0, startTime: "11:00", endTime: "12:15", serviceType: "Worship Service" },
      { dayOfWeek: 3, startTime: "18:30", endTime: "19:30", serviceType: "Midweek Service" },
    ],
  },
  {
    name: "Covenant Church San Antonio",
    denomination: "Non-denominational",
    denominationFamily: "Non-denominational",
    address: "14423 Blanco Road",
    zipCode: "78216",
    neighborhood: "Stone Oak",
    latitude: "29.5742",
    longitude: "-98.4503",
    phone: "(210) 496-2500",
    website: "www.covenantsa.com",
    yearEstablished: 1985,
    description: "Contemporary non-denominational church with emphasis on community outreach and modern worship.",
    amenities: ["Large Parking", "Wheelchair Accessible", "Nursery", "Youth Programs", "Coffee Bar"],
    languages: ["English"],
    services: [
      { dayOfWeek: 0, startTime: "09:00", endTime: "10:15", serviceType: "Worship Service" },
      { dayOfWeek: 0, startTime: "11:00", endTime: "12:15", serviceType: "Worship Service" },
      { dayOfWeek: 6, startTime: "18:00", endTime: "19:30", serviceType: "Saturday Service" },
    ],
  },
  {
    name: "Cornerstone Church",
    denomination: "Pentecostal",
    denominationFamily: "Pentecostal",
    address: "4488 I-37 North",
    zipCode: "78219",
    neighborhood: "North San Antonio",
    latitude: "29.5321",
    longitude: "-98.4156",
    phone: "(210) 646-1688",
    website: "www.cornerstonesa.org",
    pastorName: "Curry Blake",
    yearEstablished: 1988,
    description: "Dynamic Pentecostal church known for contemporary worship and healing ministry.",
    amenities: ["Ample Parking", "Wheelchair Accessible", "Nursery", "Prayer Room"],
    languages: ["English"],
    services: [
      { dayOfWeek: 0, startTime: "10:00", endTime: "11:45", serviceType: "Sunday Service" },
      { dayOfWeek: 3, startTime: "19:30", endTime: "21:00", serviceType: "Midweek Service" },
    ],
  },
  {
    name: "Travis Park United Methodist Church",
    denomination: "Methodist",
    denominationFamily: "Methodist",
    address: "230 East Travis",
    zipCode: "78205",
    neighborhood: "Downtown",
    latitude: "29.4287",
    longitude: "-98.4833",
    phone: "(210) 226-6684",
    website: "www.travisparkunited.org",
    yearEstablished: 1876,
    description: "Historic Methodist church in downtown with commitment to social justice and community service.",
    amenities: ["Limited Parking", "Wheelchair Accessible", "Nursery"],
    languages: ["English"],
    services: [
      { dayOfWeek: 0, startTime: "08:30", endTime: "09:30", serviceType: "Traditional Service" },
      { dayOfWeek: 0, startTime: "10:45", endTime: "12:00", serviceType: "Contemporary Service" },
    ],
  },
  {
    name: "New Life Church",
    denomination: "Assembly of God",
    denominationFamily: "Pentecostal",
    address: "3303 Mission Road",
    zipCode: "78210",
    neighborhood: "Southtown",
    latitude: "29.3820",
    longitude: "-98.4893",
    phone: "(210) 922-4543",
    website: "www.newlifesa.com",
    yearEstablished: 1990,
    description: "Spanish-language Assembly of God church serving the South San Antonio community.",
    amenities: ["Parking", "Wheelchair Accessible", "Nursery", "Youth Center"],
    languages: ["Spanish", "English"],
    services: [
      { dayOfWeek: 0, startTime: "09:00", endTime: "10:30", serviceType: "Service", language: "Spanish" },
      { dayOfWeek: 0, startTime: "11:00", endTime: "12:30", serviceType: "Service", language: "Spanish" },
      { dayOfWeek: 5, startTime: "19:30", endTime: "21:00", serviceType: "Friday Service" },
    ],
  },
  {
    name: "Alamo Heights Baptist Church",
    denomination: "Baptist",
    denominationFamily: "Baptist",
    address: "700 East Sunset Drive",
    zipCode: "78209",
    neighborhood: "Alamo Heights",
    latitude: "29.5082",
    longitude: "-98.4562",
    phone: "(210) 822-6241",
    website: "www.ahbc.org",
    yearEstablished: 1954,
    description: "Family-oriented Baptist church in prestigious Alamo Heights neighborhood.",
    amenities: ["Parking", "Wheelchair Accessible", "Nursery", "Sunday School", "Library"],
    languages: ["English"],
    services: [
      { dayOfWeek: 0, startTime: "08:45", endTime: "10:00", serviceType: "Traditional Service" },
      { dayOfWeek: 0, startTime: "11:00", endTime: "12:15", serviceType: "Contemporary Service" },
    ],
  },
  {
    name: "Grace Church San Antonio",
    denomination: "Non-denominational",
    denominationFamily: "Non-denominational",
    address: "18747 Blanco Road",
    zipCode: "78259",
    neighborhood: "North San Antonio",
    latitude: "29.6142",
    longitude: "-98.4401",
    phone: "(210) 481-8724",
    website: "www.graceChurchSA.com",
    yearEstablished: 1999,
    description: "Bible-centered non-denominational church with focus on discipleship and community.",
    amenities: ["Parking", "Wheelchair Accessible", "Nursery", "Small Groups"],
    languages: ["English"],
    services: [
      { dayOfWeek: 0, startTime: "10:30", endTime: "11:45", serviceType: "Worship Service" },
      { dayOfWeek: 3, startTime: "19:00", endTime: "20:15", serviceType: "Midweek Study" },
    ],
  },
  {
    name: "Holy Spirit Episcopal Church",
    denomination: "Episcopal",
    denominationFamily: "Anglican",
    address: "6327 North New Braunfels",
    zipCode: "78209",
    neighborhood: "North Central",
    latitude: "29.4982",
    longitude: "-98.4124",
    phone: "(210) 822-3802",
    website: "www.hsepiscopal.org",
    pastorName: "Rev. Dr. Mark Pickering",
    yearEstablished: 1952,
    description: "Traditional Anglican worship with contemporary elements and active ministry programs.",
    amenities: ["Parking", "Wheelchair Accessible", "Choir"],
    languages: ["English"],
    services: [
      { dayOfWeek: 0, startTime: "08:00", endTime: "08:45", serviceType: "Holy Eucharist" },
      { dayOfWeek: 0, startTime: "10:15", endTime: "11:30", serviceType: "Holy Eucharist" },
    ],
  },
  {
    name: "Southside Baptist Church",
    denomination: "Baptist",
    denominationFamily: "Baptist",
    address: "2235 S. Presa",
    zipCode: "78210",
    neighborhood: "Southtown",
    latitude: "29.3856",
    longitude: "-98.4725",
    phone: "(210) 226-8400",
    website: "www.southsidebaptist.org",
    yearEstablished: 1947,
    description: "Community-focused Baptist church serving South San Antonio with bilingual services.",
    amenities: ["Parking", "Wheelchair Accessible", "Nursery", "Community Center"],
    languages: ["English", "Spanish"],
    services: [
      { dayOfWeek: 0, startTime: "09:00", endTime: "10:15", serviceType: "Service", language: "English" },
      { dayOfWeek: 0, startTime: "11:00", endTime: "12:30", serviceType: "Service", language: "Spanish" },
    ],
  },
  {
    name: "Mission Concepción",
    denomination: "Catholic",
    denominationFamily: "Catholic",
    address: "807 Mission Road",
    zipCode: "78210",
    neighborhood: "Southtown",
    latitude: "29.3778",
    longitude: "-98.4836",
    phone: "(210) 932-1052",
    website: "www.missionconcepcion.org",
    yearEstablished: 1755,
    description: "Historic mission church dating back to colonial era with ongoing active parish.",
    amenities: ["Parking", "Wheelchair Accessible", "Historic Site"],
    languages: ["English", "Spanish"],
    services: [
      { dayOfWeek: 0, startTime: "09:00", endTime: "10:00", serviceType: "Sunday Mass" },
      { dayOfWeek: 0, startTime: "11:00", endTime: "12:00", serviceType: "Sunday Mass" },
      { dayOfWeek: 3, startTime: "18:30", endTime: "19:15", serviceType: "Weekday Mass" },
    ],
  },
  {
    name: "Dominion Church",
    denomination: "Apostolic",
    denominationFamily: "Pentecostal",
    address: "8106 Datapoint Drive",
    zipCode: "78229",
    neighborhood: "Medical Center",
    latitude: "29.4267",
    longitude: "-98.5982",
    phone: "(210) 690-4111",
    website: "www.dominionchurch.com",
    pastorName: "Apostle Leroy Thompson Sr.",
    yearEstablished: 1994,
    description: "Apostolic church emphasizing prosperity gospel and healing ministry.",
    amenities: ["Parking", "Wheelchair Accessible", "Nursery"],
    languages: ["English"],
    services: [
      { dayOfWeek: 0, startTime: "10:00", endTime: "11:30", serviceType: "Service" },
      { dayOfWeek: 3, startTime: "19:00", endTime: "20:30", serviceType: "Service" },
    ],
  },
  {
    name: "Lakewood Church San Antonio",
    denomination: "Non-denominational",
    denominationFamily: "Non-denominational",
    address: "19446 Huebner Road",
    zipCode: "78258",
    neighborhood: "North San Antonio",
    latitude: "29.5897",
    longitude: "-98.5342",
    phone: "(210) 340-0200",
    website: "www.lakewoodchurchsa.com",
    yearEstablished: 2005,
    description: "Large contemporary non-denominational church with state-of-the-art facilities.",
    amenities: ["Large Parking", "Wheelchair Accessible", "Nursery", "Cafe", "Bookstore"],
    languages: ["English"],
    services: [
      { dayOfWeek: 0, startTime: "09:00", endTime: "10:30", serviceType: "Service" },
      { dayOfWeek: 0, startTime: "11:15", endTime: "12:45", serviceType: "Service" },
      { dayOfWeek: 6, startTime: "18:30", endTime: "20:00", serviceType: "Saturday Service" },
    ],
  },
  {
    name: "Broadway Baptist Church",
    denomination: "Baptist",
    denominationFamily: "Baptist",
    address: "511 West Ashby Place",
    zipCode: "78212",
    neighborhood: "Monticello Park",
    latitude: "29.4457",
    longitude: "-98.5283",
    phone: "(210) 226-1518",
    website: "www.broadwaybaptist.org",
    yearEstablished: 1891,
    description: "Historic Baptist church known for music ministry and community engagement.",
    amenities: ["Parking", "Wheelchair Accessible", "Choir", "Music School"],
    languages: ["English"],
    services: [
      { dayOfWeek: 0, startTime: "10:45", endTime: "12:00", serviceType: "Worship Service" },
      { dayOfWeek: 3, startTime: "19:00", endTime: "20:00", serviceType: "Prayer Meeting" },
    ],
  },
  {
    name: "San Antonio Korean Church",
    denomination: "Non-denominational",
    denominationFamily: "Non-denominational",
    address: "12602 Vance Jackson Road",
    zipCode: "78230",
    neighborhood: "West San Antonio",
    latitude: "29.4892",
    longitude: "-98.6045",
    phone: "(210) 696-9737",
    website: "www.sakc.org",
    yearEstablished: 2001,
    description: "Korean-speaking congregation with English youth ministry.",
    amenities: ["Parking", "Wheelchair Accessible", "Nursery"],
    languages: ["Korean", "English"],
    services: [
      { dayOfWeek: 0, startTime: "10:00", endTime: "11:30", serviceType: "Worship", language: "Korean" },
      { dayOfWeek: 0, startTime: "11:45", endTime: "12:45", serviceType: "Youth Service", language: "English" },
    ],
  },
  {
    name: "St. Mary's University Catholic Center",
    denomination: "Catholic",
    denominationFamily: "Catholic",
    address: "3900 Charles Avenue",
    zipCode: "78228",
    neighborhood: "St. Mary's",
    latitude: "29.4658",
    longitude: "-98.5527",
    phone: "(210) 436-3011",
    website: "www.stmarys.edu/campus-ministry",
    yearEstablished: 1955,
    description: "Catholic center serving St. Mary's University students and surrounding community.",
    amenities: ["Parking", "Wheelchair Accessible", "Student Center"],
    languages: ["English", "Spanish"],
    services: [
      { dayOfWeek: 0, startTime: "10:00", endTime: "11:00", serviceType: "Sunday Mass" },
      { dayOfWeek: 0, startTime: "19:00", endTime: "20:00", serviceType: "Evening Mass" },
      { dayOfWeek: 2, startTime: "12:00", endTime: "12:30", serviceType: "Weekday Mass" },
    ],
  },
  {
    name: "Friendship West Baptist Church",
    denomination: "Baptist",
    denominationFamily: "Baptist",
    address: "2000 East 11th Place",
    zipCode: "78702",
    neighborhood: "East Side",
    latitude: "29.4156",
    longitude: "-98.4234",
    phone: "(210) 223-2556",
    website: "www.friendshipwest.org",
    pastorName: "Pastor Fred Luter",
    yearEstablished: 1956,
    description: "Community-engaged Baptist church with active social justice ministry.",
    amenities: ["Parking", "Wheelchair Accessible", "Community Programs"],
    languages: ["English"],
    services: [
      { dayOfWeek: 0, startTime: "08:00", endTime: "09:15", serviceType: "Traditional Service" },
      { dayOfWeek: 0, startTime: "11:00", endTime: "12:30", serviceType: "Contemporary Service" },
    ],
  },
  {
    name: "Bethel Lutheran Church",
    denomination: "Lutheran",
    denominationFamily: "Lutheran",
    address: "139 East Grayson Street",
    zipCode: "78215",
    neighborhood: "Monte Vista",
    latitude: "29.4623",
    longitude: "-98.4956",
    phone: "(210) 227-1211",
    website: "www.bethelsalsa.org",
    yearEstablished: 1946,
    description: "Historic Lutheran church with traditional worship and community outreach.",
    amenities: ["Parking", "Wheelchair Accessible", "Choir"],
    languages: ["English"],
    services: [
      { dayOfWeek: 0, startTime: "09:00", endTime: "10:15", serviceType: "Divine Service" },
      { dayOfWeek: 3, startTime: "19:00", endTime: "20:00", serviceType: "Midweek Service" },
    ],
  },
  {
    name: "Victory Church",
    denomination: "Foursquare",
    denominationFamily: "Pentecostal",
    address: "4414 Blanco Road",
    zipCode: "78216",
    neighborhood: "North Central",
    latitude: "29.5612",
    longitude: "-98.4489",
    phone: "(210) 340-8500",
    website: "www.victorychurchsa.org",
    yearEstablished: 2007,
    description: "Modern Foursquare church with focus on contemporary worship and community outreach.",
    amenities: ["Parking", "Wheelchair Accessible", "Nursery", "Youth Programs"],
    languages: ["English"],
    services: [
      { dayOfWeek: 0, startTime: "10:00", endTime: "11:30", serviceType: "Celebration Service" },
      { dayOfWeek: 3, startTime: "19:00", endTime: "20:30", serviceType: "Midweek Encounter" },
    ],
  },
  {
    name: "San Antonio Chinese Baptist Church",
    denomination: "Baptist",
    denominationFamily: "Baptist",
    address: "3303 Thousand Oaks Drive",
    zipCode: "78232",
    neighborhood: "North San Antonio",
    latitude: "29.5234",
    longitude: "-98.4567",
    phone: "(210) 494-5825",
    website: "www.sacbc.org",
    yearEstablished: 1980,
    description: "Chinese-speaking Baptist congregation serving the Asian community.",
    amenities: ["Parking", "Wheelchair Accessible", "Community Events"],
    languages: ["Mandarin", "Cantonese", "English"],
    services: [
      { dayOfWeek: 0, startTime: "09:30", endTime: "10:45", serviceType: "Worship", language: "Mandarin" },
      { dayOfWeek: 0, startTime: "11:00", endTime: "12:15", serviceType: "Worship", language: "English" },
    ],
  },
  {
    name: "Pentecostal Church of God in Christ",
    denomination: "COGIC",
    denominationFamily: "Pentecostal",
    address: "1435 South Presa Street",
    zipCode: "78210",
    neighborhood: "Southtown",
    latitude: "29.3945",
    longitude: "-98.4712",
    phone: "(210) 532-8211",
    website: "www.pocgic-sa.org",
    yearEstablished: 1963,
    description: "Historic COGIC church serving the South San Antonio community with vibrant worship.",
    amenities: ["Parking", "Wheelchair Accessible", "Food Pantry"],
    languages: ["English", "Spanish"],
    services: [
      { dayOfWeek: 0, startTime: "10:00", endTime: "11:45", serviceType: "Service" },
      { dayOfWeek: 3, startTime: "19:00", endTime: "20:30", serviceType: "Bible Study" },
    ],
  },
  {
    name: "Christ's Church of the Valley",
    denomination: "Non-denominational",
    denominationFamily: "Non-denominational",
    address: "12615 I-35 North",
    zipCode: "78233",
    neighborhood: "North San Antonio",
    latitude: "29.5845",
    longitude: "-98.4012",
    phone: "(210) 490-8222",
    website: "www.cccv.org",
    yearEstablished: 2002,
    description: "Contemporary non-denominational church with strong youth and family ministry.",
    amenities: ["Large Parking", "Wheelchair Accessible", "Nursery", "Youth Center"],
    languages: ["English"],
    services: [
      { dayOfWeek: 0, startTime: "09:00", endTime: "10:30", serviceType: "Service" },
      { dayOfWeek: 0, startTime: "11:00", endTime: "12:30", serviceType: "Service" },
      { dayOfWeek: 6, startTime: "19:00", endTime: "20:30", serviceType: "Saturday Night Live" },
    ],
  },
];

async function main() {
  console.log("Starting seed...");

  // Clear existing data
  await prisma.userSavedChurch.deleteMany();
  await prisma.reviewVote.deleteMany();
  await prisma.review.deleteMany();
  await prisma.event.deleteMany();
  await prisma.churchPhoto.deleteMany();
  await prisma.churchService.deleteMany();
  await prisma.churchClaim.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.church.deleteMany();

  // Create test user
  const testUser = await prisma.user.create({
    data: {
      email: "test@example.com",
      passwordHash: await hashPassword('password123'),
      name: "Test User",
      role: "USER",
      emailVerified: true,
    },
  });

  console.log("Created test user:", testUser.email);

  // Create churches
  for (const churchData of churches) {
    const slug = generateSlug(churchData.name);

    const church = await prisma.church.create({
      data: {
        name: churchData.name,
        slug,
        denomination: churchData.denomination,
        denominationFamily: churchData.denominationFamily,
        address: churchData.address,
        zipCode: churchData.zipCode,
        neighborhood: churchData.neighborhood,
        latitude: churchData.latitude,
        longitude: churchData.longitude,
        phone: churchData.phone,
        email: churchData.email,
        website: churchData.website,
        pastorName: churchData.pastorName,
        yearEstablished: churchData.yearEstablished,
        description: churchData.description,
        amenities: churchData.amenities || [],
        languages: churchData.languages || ["English"],
        services: {
          create: churchData.services.map((service) => ({
            dayOfWeek: service.dayOfWeek,
            startTime: service.startTime,
            endTime: service.endTime,
            serviceType: service.serviceType,
            language: service.language || "English",
          })),
        },
      },
      include: {
        services: true,
      },
    });

    console.log(`Created church: ${church.name} with ${church.services.length} service times`);
  }

  // Create some sample reviews
  const allChurches = await prisma.church.findMany();
  const firstChurch = allChurches[0];
  const secondChurch = allChurches[1];

  if (firstChurch && secondChurch && testUser) {
    await prisma.review.create({
      data: {
        userId: testUser.id,
        churchId: firstChurch.id,
        rating: "4.5",
        body: "Wonderful service and welcoming community! The music was beautiful and the sermon was very inspiring.",
        welcomeRating: 5,
        worshipRating: 5,
        sermonRating: 4,
        facilitiesRating: 4,
      },
    });

    await prisma.review.create({
      data: {
        userId: testUser.id,
        churchId: secondChurch.id,
        rating: "4",
        body: "Great experience overall. Very family-friendly with excellent programs for children.",
        welcomeRating: 4,
        worshipRating: 4,
        sermonRating: 4,
        facilitiesRating: 4,
      },
    });

    console.log("Created sample reviews");
  }

  // Create saved churches
  if (allChurches.length >= 3) {
    await prisma.userSavedChurch.create({
      data: {
        userId: testUser.id,
        churchId: allChurches[0].id,
      },
    });

    await prisma.userSavedChurch.create({
      data: {
        userId: testUser.id,
        churchId: allChurches[1].id,
      },
    });

    console.log("Created saved churches");
  }

  console.log("Seed completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
