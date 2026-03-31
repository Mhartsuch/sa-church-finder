export interface CuratedSeedChurch {
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

export const curatedChurches: CuratedSeedChurch[] = [
  {
    name: 'San Fernando Cathedral',
    denomination: 'Catholic',
    denominationFamily: 'Catholic',
    address: '231 West Commerce Street',
    zipCode: '78205',
    neighborhood: 'Downtown',
    latitude: '29.42522920',
    longitude: '-98.49599760',
    phone: '(210) 227-1297',
    email: 'info@sfcathedral.org',
    website: 'sfcathedral.org',
    yearEstablished: 1731,
    description:
      "San Antonio's cathedral parish anchors Main Plaza with bilingual worship, deep civic history, and one of the city's most recognizable sacred spaces.",
    amenities: ['Parking', 'Wheelchair Accessible', 'Livestream', 'Gift Shop'],
    languages: ['English', 'Spanish'],
    coverImageUrl:
      'https://files.ecatholic.com/14746/slideshows/homeFullXL/92374647_3324271397586488_3078929138149490688_n.jpg?t=1737473297000',
    coverImageAltText: 'San Fernando Cathedral exterior on Main Plaza',
    services: [
      { dayOfWeek: 6, startTime: '17:00', endTime: '18:00', serviceType: 'Vigil Mass' },
      {
        dayOfWeek: 0,
        startTime: '08:00',
        endTime: '09:00',
        serviceType: 'Sunday Mass',
        language: 'Spanish',
      },
      {
        dayOfWeek: 0,
        startTime: '10:00',
        endTime: '11:00',
        serviceType: 'Sunday Mass',
        language: 'English',
      },
      {
        dayOfWeek: 0,
        startTime: '12:00',
        endTime: '13:00',
        serviceType: 'Sunday Mass',
        language: 'Spanish',
      },
      {
        dayOfWeek: 0,
        startTime: '14:00',
        endTime: '15:00',
        serviceType: 'Sunday Mass',
        language: 'English',
      },
      {
        dayOfWeek: 0,
        startTime: '17:00',
        endTime: '18:00',
        serviceType: 'Sunday Mass',
        language: 'Bilingual',
      },
    ],
  },
  {
    name: 'First Baptist Church of San Antonio',
    denomination: 'Baptist',
    denominationFamily: 'Baptist',
    address: '515 McCullough Avenue',
    zipCode: '78215',
    neighborhood: 'Tobin Hill',
    latitude: '29.43820000',
    longitude: '-98.48760000',
    phone: '(210) 226-0363',
    email: 'info@fbcsa.org',
    website: 'fbcsa.org',
    yearEstablished: 1861,
    description:
      'Historic downtown Baptist church centered on Bible teaching, city ministry, and a broad Sunday rhythm that includes traditional, contemporary, Spanish, and international worship.',
    amenities: ['Parking', 'Wheelchair Accessible', 'Nursery', 'Sunday School'],
    languages: ['English', 'Spanish', 'Karenni'],
    coverImageUrl:
      'https://nucleus-production.s3.amazonaws.com/uploads/VpmEzLpf3yzgPqGuXw7KLK6QjIEmL3xQUDGDIN22.jpeg',
    coverImageAltText: 'First Baptist Church of San Antonio exterior',
    services: [
      {
        dayOfWeek: 0,
        startTime: '08:30',
        endTime: '09:45',
        serviceType: 'Traditional Worship',
        language: 'English',
      },
      {
        dayOfWeek: 0,
        startTime: '11:00',
        endTime: '12:15',
        serviceType: 'Traditional Worship',
        language: 'English',
      },
      {
        dayOfWeek: 0,
        startTime: '11:00',
        endTime: '12:15',
        serviceType: 'Contemporary Worship',
        language: 'English',
      },
      {
        dayOfWeek: 0,
        startTime: '11:00',
        endTime: '12:15',
        serviceType: 'Servicio de Adoracion',
        language: 'Spanish',
      },
      {
        dayOfWeek: 0,
        startTime: '11:00',
        endTime: '12:15',
        serviceType: 'Karenni Worship',
        language: 'Karenni',
      },
    ],
  },
  {
    name: 'Travis Park United Methodist Church',
    denomination: 'United Methodist',
    denominationFamily: 'Methodist',
    address: '230 E Travis Street',
    zipCode: '78205',
    neighborhood: 'Downtown',
    latitude: '29.42870000',
    longitude: '-98.48330000',
    phone: '(210) 226-8341',
    website: 'travispark.org',
    yearEstablished: 1846,
    description:
      'Historic downtown Methodist congregation known for inclusive worship, justice-minded outreach, and a strong public presence in the center of the city.',
    amenities: ['Parking', 'Wheelchair Accessible', 'Livestream'],
    languages: ['English'],
    coverImageUrl: 'https://travispark.org/wp-content/uploads/2024/08/DSC_5112.jpg',
    coverImageAltText: 'Travis Park United Methodist Church sanctuary exterior',
    services: [
      {
        dayOfWeek: 0,
        startTime: '09:45',
        endTime: '11:00',
        serviceType: 'Worship Service',
        language: 'English',
      },
    ],
  },
  {
    name: 'Mission Concepcion',
    denomination: 'Catholic',
    denominationFamily: 'Catholic',
    address: '807 Mission Road',
    zipCode: '78210',
    neighborhood: 'Mission Reach',
    latitude: '29.37780000',
    longitude: '-98.48360000',
    phone: '(210) 533-8955',
    website: 'missionconcepcion.org',
    yearEstablished: 1731,
    description:
      'Active Catholic parish in the San Antonio Missions corridor, pairing neighborhood worship with one of the oldest unrestored stone churches in the United States.',
    amenities: ['Parking', 'Wheelchair Accessible', 'Historic Site', 'Livestream'],
    languages: ['English', 'Spanish'],
    coverImageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Late_Evening_Mission_Concepcion_San_Antonio.jpg/1920px-Late_Evening_Mission_Concepcion_San_Antonio.jpg',
    coverImageAltText: 'Mission Concepcion exterior at dusk',
    services: [
      {
        dayOfWeek: 0,
        startTime: '10:00',
        endTime: '11:00',
        serviceType: 'Sunday Mass',
        language: 'English',
      },
      {
        dayOfWeek: 0,
        startTime: '12:00',
        endTime: '13:00',
        serviceType: 'Sunday Mass',
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
    website: 'fpcsanantonio.org',
    description:
      'Downtown Presbyterian congregation offering both traditional and modern worship, rooted in discipleship, church planting, and service across San Antonio.',
    amenities: ['Parking', 'Wheelchair Accessible', 'Nursery', 'Livestream'],
    languages: ['English'],
    coverImageUrl:
      'https://cdn.monkplatform.com/image/czoxNDU6Imh0dHBzJTNBJTJGJTJGczMuYW1hem9uYXdzLmNvbSUyRmFjY291bnQtbWVkaWElMkYzMDk4NiUyRnVwbG9hZGVkJTJGayUyRjBlMTgyNDYzNzJfMTcyMDczNTg5M19reWxlMTU1MS5qcGclM0ZzJTNEZmY2NzAxOWNjM2EwMDVjN2MyZjJjY2M1MmNmM2E3M2EiOw%3D%3D/kyle1551.jpg?fm=webp',
    coverImageAltText: 'First Presbyterian Church of San Antonio exterior',
    services: [
      {
        dayOfWeek: 0,
        startTime: '09:30',
        endTime: '10:45',
        serviceType: 'Traditional Worship',
        language: 'English',
      },
      {
        dayOfWeek: 0,
        startTime: '09:30',
        endTime: '10:45',
        serviceType: 'Modern Worship',
        language: 'English',
      },
      {
        dayOfWeek: 0,
        startTime: '11:00',
        endTime: '12:15',
        serviceType: 'Traditional Worship',
        language: 'English',
      },
      {
        dayOfWeek: 0,
        startTime: '11:00',
        endTime: '12:15',
        serviceType: 'Modern Worship',
        language: 'English',
      },
    ],
  },
  {
    name: 'Episcopal Church of the Holy Spirit',
    denomination: 'Episcopal',
    denominationFamily: 'Anglican',
    address: '11093 Bandera Road',
    zipCode: '78250',
    neighborhood: 'Northwest Side',
    latitude: '29.54850000',
    longitude: '-98.65390000',
    phone: '(210) 314-6729',
    email: 'holyspirit@sentbythespirit.org',
    website: 'sentbythespirit.org',
    description:
      'Northwest San Antonio Episcopal parish centered on weekly Eucharist, prayer, and family formation with both morning and evening Sunday worship.',
    amenities: ['Parking', 'Wheelchair Accessible', 'Livestream', 'Kids Ministry'],
    languages: ['English'],
    coverImageUrl:
      'https://static.wixstatic.com/media/b231fe_3753026828b94a3293085effb3db188a~mv2.jpeg/v1/fill/w_1029,h_686,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/b231fe_3753026828b94a3293085effb3db188a~mv2.jpeg',
    coverImageAltText: 'Episcopal Church of the Holy Spirit sanctuary exterior',
    services: [
      {
        dayOfWeek: 0,
        startTime: '10:00',
        endTime: '11:15',
        serviceType: 'Holy Eucharist',
        language: 'English',
      },
      {
        dayOfWeek: 0,
        startTime: '17:30',
        endTime: '18:30',
        serviceType: 'Holy Eucharist',
        language: 'English',
      },
      {
        dayOfWeek: 3,
        startTime: '17:00',
        endTime: '17:45',
        serviceType: 'Healing Eucharist',
        language: 'English',
      },
    ],
  },
  {
    name: 'Mission San Jose Catholic Church',
    denomination: 'Catholic',
    denominationFamily: 'Catholic',
    address: '701 East Pyron Avenue',
    zipCode: '78214',
    neighborhood: 'Mission Reach',
    latitude: '29.36187700',
    longitude: '-98.47905200',
    website: 'missionsanjosechurch.org',
    yearEstablished: 1720,
    description:
      'Living Catholic parish within the Mission San Jose grounds, known for historic beauty, bilingual liturgy, and one of the most iconic sanctuaries in South San Antonio.',
    amenities: ['Parking', 'Wheelchair Accessible', 'Historic Site', 'Gift Shop'],
    languages: ['English', 'Spanish'],
    coverImageUrl:
      'https://files.ecatholic.com/5662/slideshows/homeCustom1169x404/SIDE%20PIC%20OF%20CHURCH.jpg?t=1518812035000',
    coverImageAltText: 'Mission San Jose Catholic Church exterior',
    services: [
      {
        dayOfWeek: 6,
        startTime: '17:00',
        endTime: '18:00',
        serviceType: 'Vigil Mass',
        language: 'English',
      },
      {
        dayOfWeek: 0,
        startTime: '09:00',
        endTime: '10:00',
        serviceType: 'Sunday Mass',
        language: 'English',
      },
      {
        dayOfWeek: 0,
        startTime: '12:00',
        endTime: '13:00',
        serviceType: 'Sunday Mass',
        language: 'Spanish',
      },
    ],
  },
  {
    name: 'Basilica of the National Shrine of the Little Flower',
    denomination: 'Catholic',
    denominationFamily: 'Catholic',
    address: '1715 N Zarzamora Street',
    zipCode: '78201',
    neighborhood: 'Woodlawn Lake',
    latitude: '29.44542710',
    longitude: '-98.52499360',
    phone: '(210) 735-9126',
    email: 'admin@littleflowerbasilica.org',
    website: 'littleflowerbasilica.org',
    description:
      'West Side Carmelite basilica and pilgrimage site known for daily Mass, strong bilingual worship, and devotion to St. Therese in an architecturally distinctive shrine campus.',
    amenities: ['Parking', 'Wheelchair Accessible', 'Gift Shop', 'Livestream'],
    languages: ['English', 'Spanish'],
    coverImageUrl:
      'https://images.squarespace-cdn.com/content/v1/5ff22dd60400f408900a21c2/35b821d0-ebc8-48d6-819a-d745375842b9/LFB_Exterior_WoodlawnArea.JPG',
    coverImageAltText: 'Basilica of the National Shrine of the Little Flower exterior',
    services: [
      {
        dayOfWeek: 6,
        startTime: '17:30',
        endTime: '18:30',
        serviceType: 'Vigil Mass',
        language: 'English',
      },
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
        endTime: '11:00',
        serviceType: 'Sunday Mass',
        language: 'Spanish',
      },
      {
        dayOfWeek: 0,
        startTime: '12:00',
        endTime: '13:00',
        serviceType: 'Sunday Mass',
        language: 'English',
      },
      {
        dayOfWeek: 0,
        startTime: '17:30',
        endTime: '18:30',
        serviceType: 'Sunday Mass',
        language: 'Spanish',
      },
    ],
  },
  {
    name: "St. Mark's Episcopal Church",
    denomination: 'Episcopal',
    denominationFamily: 'Anglican',
    address: '315 E Pecan Street',
    zipCode: '78205',
    neighborhood: 'Downtown',
    latitude: '29.42893130',
    longitude: '-98.48887970',
    phone: '(210) 226-2426',
    email: 'stmarks@stmarks-sa.org',
    website: 'stmarks-sa.org',
    description:
      'Downtown Episcopal parish known for beautiful liturgy, music, and a creative, service-minded congregation in the center of San Antonio.',
    amenities: ['Parking', 'Wheelchair Accessible', 'Livestream', 'Bookstore'],
    languages: ['English'],
    coverImageUrl:
      'https://static.wixstatic.com/media/d716fe_bcf2849ea0ab48daa9ca4bc08a4ec265~mv2.jpg/v1/fill/w_1500,h_1000,al_c/d716fe_bcf2849ea0ab48daa9ca4bc08a4ec265~mv2.jpg',
    coverImageAltText: "St. Mark's Episcopal Church exterior",
    services: [
      { dayOfWeek: 0, startTime: '06:00', endTime: '06:45', serviceType: 'Holy Eucharist' },
      { dayOfWeek: 0, startTime: '09:00', endTime: '10:00', serviceType: 'Holy Eucharist' },
      { dayOfWeek: 0, startTime: '11:15', endTime: '12:15', serviceType: 'Holy Eucharist' },
    ],
  },
  {
    name: 'Our Lady of the Atonement Catholic Church',
    denomination: 'Catholic',
    denominationFamily: 'Catholic',
    address: '15415 Red Robin Road',
    zipCode: '78255',
    neighborhood: 'Far Northwest',
    latitude: '29.58817970',
    longitude: '-98.64353510',
    phone: '(210) 695-2944',
    email: '[email protected]',
    website: 'ourladyoftheatonement.org',
    description:
      'Northwest Catholic parish of the Ordinariate known for reverent liturgy, Anglican patrimony, and a full daily prayer and Mass rhythm.',
    amenities: ['Parking', 'Wheelchair Accessible', 'Adoration', 'Faith Formation'],
    languages: ['English'],
    coverImageUrl:
      'https://ourladyoftheatonement.org/sites/atonement/files/styles/hosted_core_wide_16x9_1400_1x/public/nave.jpg?itok=ZizNTsD8',
    coverImageAltText: 'Our Lady of the Atonement Catholic Church nave exterior',
    services: [
      { dayOfWeek: 6, startTime: '17:00', endTime: '18:00', serviceType: 'Said Mass' },
      { dayOfWeek: 0, startTime: '07:00', endTime: '08:00', serviceType: 'Said Mass' },
      { dayOfWeek: 0, startTime: '09:00', endTime: '10:00', serviceType: 'Sung Mass' },
      { dayOfWeek: 0, startTime: '11:00', endTime: '12:00', serviceType: 'Sung Mass' },
      { dayOfWeek: 0, startTime: '17:00', endTime: '18:00', serviceType: 'Said Mass' },
    ],
  },
  {
    name: 'St. Joseph Catholic Church',
    denomination: 'Catholic',
    denominationFamily: 'Catholic',
    address: '623 E Commerce Street',
    zipCode: '78205',
    neighborhood: 'Downtown',
    latitude: '29.42363220',
    longitude: '-98.48697340',
    phone: '(210) 227-0126',
    website: 'stjsa.org',
    description:
      'Downtown Catholic landmark beside Rivercenter, often called the jewel in the heart of San Antonio, with a compact weekly Mass rhythm and deep parish identity.',
    amenities: ['Wheelchair Accessible', 'Historic Site', 'Adoration'],
    languages: ['English'],
    coverImageUrl:
      'https://files.ecatholic.com/2287/slideshows/homeFullXL/Front%20of%20church%20from%20the%20top.jpg?t=1617483138000',
    coverImageAltText: 'St. Joseph Catholic Church exterior in downtown San Antonio',
    services: [
      { dayOfWeek: 6, startTime: '17:00', endTime: '18:00', serviceType: 'Vigil Mass' },
      { dayOfWeek: 0, startTime: '08:00', endTime: '09:00', serviceType: 'Sunday Mass' },
      { dayOfWeek: 0, startTime: '11:00', endTime: '12:00', serviceType: 'Sunday Mass' },
    ],
  },
  {
    name: 'St. Anthony Mary Claret Catholic Church',
    denomination: 'Catholic',
    denominationFamily: 'Catholic',
    address: '6150 Roft Road',
    zipCode: '78253',
    neighborhood: 'Far West Side',
    latitude: '29.50452430',
    longitude: '-98.73597890',
    phone: '(210) 688-9033',
    email: 'saclaret@saclaret.com',
    website: 'samcsa.com',
    description:
      'Large West Side Catholic parish serving Alamo Ranch and surrounding neighborhoods with a full Sunday schedule, livestreamed Masses, and active family ministries.',
    amenities: ['Parking', 'Wheelchair Accessible', 'Livestream', 'Food Pantry'],
    languages: ['English', 'Spanish'],
    coverImageUrl:
      'https://samcsa.com/wp-content/uploads/2018/10/church-outside-e1538612808664.jpg',
    coverImageAltText: 'St. Anthony Mary Claret Catholic Church exterior',
    services: [
      { dayOfWeek: 6, startTime: '17:00', endTime: '18:00', serviceType: 'Vigil Mass' },
      { dayOfWeek: 0, startTime: '08:00', endTime: '09:00', serviceType: 'Sunday Mass' },
      { dayOfWeek: 0, startTime: '10:00', endTime: '11:00', serviceType: 'Sunday Mass' },
      { dayOfWeek: 0, startTime: '12:00', endTime: '13:00', serviceType: 'Sunday Mass' },
      {
        dayOfWeek: 0,
        startTime: '15:00',
        endTime: '16:00',
        serviceType: 'Sunday Mass',
        language: 'Spanish',
      },
      { dayOfWeek: 0, startTime: '18:00', endTime: '19:00', serviceType: 'Sunday Mass' },
    ],
  },
]
