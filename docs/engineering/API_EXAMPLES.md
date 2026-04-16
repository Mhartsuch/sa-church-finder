# SA Church Finder API - Usage Examples

## Base URL

```
http://localhost:3001/api/v1/churches
```

## Endpoints

### 1. Search Churches

**GET** `/api/v1/churches`

#### Query Parameters

| Parameter              | Type         | Default   | Description                                        |
| ---------------------- | ------------ | --------- | -------------------------------------------------- |
| `lat`                  | number       | 29.4241   | Latitude of search center (San Antonio)            |
| `lng`                  | number       | -98.4936  | Longitude of search center                         |
| `radius`               | number       | 10        | Search radius in miles                             |
| `q`                    | string       | -         | Text search in church name/description             |
| `denomination`         | string       | -         | Filter by denomination family                      |
| `day`                  | number (0-6) | -         | Filter by service day (0=Sunday)                   |
| `time`                 | string       | -         | Filter by time: `morning`, `afternoon`, `evening`  |
| `language`             | string       | -         | Filter by service language                         |
| `amenities`            | string       | -         | Comma-separated amenities (all must match)         |
| `wheelchairAccessible` | boolean      | -         | Only confirmed wheelchair accessible churches      |
| `goodForChildren`      | boolean      | -         | Only confirmed family-friendly churches            |
| `goodForGroups`        | boolean      | -         | Only confirmed churches suitable for groups        |
| `sort`                 | string       | relevance | Sort by: `relevance`, `distance`, `rating`, `name` |
| `page`                 | number       | 1         | Page number for pagination                         |
| `pageSize`             | number       | 20        | Results per page (max 100)                         |
| `bounds`               | string       | -         | Bounding box: `sw_lat,sw_lng,ne_lat,ne_lng`        |

#### Example Requests

**Basic search (nearby churches):**

```bash
curl "http://localhost:3001/api/v1/churches"
```

**Search by name:**

```bash
curl "http://localhost:3001/api/v1/churches?q=baptist"
```

**Baptist churches on Sunday morning:**

```bash
curl "http://localhost:3001/api/v1/churches?denomination=Baptist&day=0&time=morning"
```

**Churches with Spanish services:**

```bash
curl "http://localhost:3001/api/v1/churches?language=Spanish"
```

**Churches with parking AND wheelchair access:**

```bash
curl "http://localhost:3001/api/v1/churches?amenities=Parking,Wheelchair+Accessible"
```

**Confirmed wheelchair-accessible, family-friendly churches:**

```bash
curl "http://localhost:3001/api/v1/churches?wheelchairAccessible=true&goodForChildren=true"
```

**Search within 5 miles, sort by rating:**

```bash
curl "http://localhost:3001/api/v1/churches?radius=5&sort=rating"
```

**Paginated results (page 2, 10 per page):**

```bash
curl "http://localhost:3001/api/v1/churches?page=2&pageSize=10"
```

**Bounding box search:**

```bash
curl "http://localhost:3001/api/v1/churches?bounds=29.35,-98.55,29.55,-98.40"
```

#### Response

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "San Fernando Cathedral",
      "slug": "san-fernando-cathedral",
      "denomination": "Catholic",
      "denominationFamily": "Catholic",
      "address": "231 West Commerce Street",
      "city": "San Antonio",
      "state": "TX",
      "zipCode": "78205",
      "latitude": 29.4252292,
      "longitude": -98.4959976,
      "phone": "(210) 227-1297",
      "website": "sfcathedral.org",
      "avgRating": 0,
      "reviewCount": 0,
      "languages": ["English", "Spanish"],
      "amenities": [
        "Parking",
        "Wheelchair Accessible",
        "Livestream",
        "Gift Shop"
      ],
      "distance": 0.0,
      "services": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440101",
          "churchId": "550e8400-e29b-41d4-a716-446655440001",
          "dayOfWeek": 0,
          "startTime": "08:00",
          "endTime": "09:00",
          "serviceType": "Sunday Mass",
          "language": "English"
        }
      ]
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 12,
    "totalPages": 1,
    "center": {
      "lat": 29.4241,
      "lng": -98.4936
    }
  }
}
```

---

### 2. Get Church Details

**GET** `/api/v1/churches/:slug`

Returns the full church profile including all services, amenities, and metadata.

#### Example Requests

```bash
curl "http://localhost:3001/api/v1/churches/san-fernando-cathedral"
```

#### Response

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "San Fernando Cathedral",
    "slug": "san-fernando-cathedral",
    "denomination": "Catholic",
    "denominationFamily": "Catholic",
    "description": "Historic downtown cathedral parish serving San Antonio with daily Mass, bilingual ministry, and one of the city's defining sacred spaces.",
    "address": "231 West Commerce Street",
    "city": "San Antonio",
    "state": "TX",
    "zipCode": "78205",
    "neighborhood": "Downtown",
    "latitude": 29.4252292,
    "longitude": -98.4959976,
    "phone": "(210) 227-1297",
    "email": "info@sfcathedral.org",
    "website": "sfcathedral.org",
    "yearEstablished": 1731,
    "avgRating": 0,
    "reviewCount": 0,
    "isClaimed": false,
    "languages": ["English", "Spanish"],
    "amenities": [
      "Parking",
      "Wheelchair Accessible",
      "Livestream",
      "Gift Shop"
    ],
    "coverImageUrl": "https://files.ecatholic.com/14746/slideshows/homeFullXL/92374647_3324271397586488_3078929138149490688_n.jpg?t=1737473297000",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "services": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440101",
        "churchId": "550e8400-e29b-41d4-a716-446655440001",
        "dayOfWeek": 0,
        "startTime": "08:00",
        "endTime": "09:00",
        "serviceType": "Sunday Mass",
        "language": "English",
        "description": null,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440102",
        "churchId": "550e8400-e29b-41d4-a716-446655440001",
        "dayOfWeek": 0,
        "startTime": "10:00",
        "endTime": "11:30",
        "serviceType": "Sunday Mass",
        "language": "Spanish",
        "description": null,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### Error Response (404)

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Church with slug \"invalid-slug\" not found"
  }
}
```

---

## Filter Parameters Details

### Days of Week

- `0` = Sunday
- `1` = Monday
- `2` = Tuesday
- `3` = Wednesday
- `4` = Thursday
- `5` = Friday
- `6` = Saturday

### Time Categories

- `morning` - Services before 12:00 PM
- `afternoon` - Services 12:00 PM - 5:00 PM
- `evening` - Services after 5:00 PM

### Available Denomination Families

- Baptist
- Catholic
- Anglican
- Lutheran
- Methodist
- Pentecostal
- Non-denominational

### Available Languages

- English
- Spanish
- Korean
- Mandarin
- Cantonese

### Available Amenities

- Parking
- Large Parking
- Ample Parking
- Limited Parking
- Wheelchair Accessible
- Nursery
- Sunday School
- Choir
- Music School
- Prayer Room
- Youth Programs
- Coffee Bar
- Cafe
- Bookstore
- Gift Shop
- Student Center
- Community Center
- Community Programs
- Youth Center
- Food Pantry
- Historic Site
- Small Groups
- Library

---

## Complex Query Examples

### Find Spanish-language Baptist churches with parking near downtown:

```bash
curl "http://localhost:3001/api/v1/churches?denomination=Baptist&language=Spanish&amenities=Parking&lat=29.42&lng=-98.49&radius=5"
```

### Get evening services in North San Antonio, sorted by rating:

```bash
curl "http://localhost:3001/api/v1/churches?lat=29.55&lng=-98.45&radius=8&time=evening&sort=rating"
```

### Find all churches offering both Nursery and Sunday School:

```bash
curl "http://localhost:3001/api/v1/churches?amenities=Nursery,Sunday+School"
```

### Search for Methodist churches on Sundays:

```bash
curl "http://localhost:3001/api/v1/churches?denomination=Methodist&day=0"
```

---

## Notes

- All distances are calculated using the Haversine formula and are accurate to the Earth's radius (3959 miles)
- Distance is rounded to 0.1 miles
- The default search center is San Antonio downtown (29.4241, -98.4936)
- Default radius is 10 miles
- Results are paginated with a default page size of 20
- Amenities filter uses AND logic (all specified amenities must be present)
- When using bounding box, the radius parameter is ignored
