/** Google Places API (New) response types */

export interface GooglePlaceDisplayName {
  text: string
  languageCode: string
}

export interface GooglePlaceLocation {
  latitude: number
  longitude: number
}

export interface GooglePlaceAddressComponent {
  longText: string
  shortText: string
  types: string[]
}

export interface GooglePlaceEditorialSummary {
  text: string
  languageCode: string
}

export interface GooglePlacePhoto {
  /** Resource name, e.g. "places/PLACE_ID/photos/PHOTO_REF" */
  name: string
  widthPx: number
  heightPx: number
  authorAttributions: Array<{
    displayName: string
    uri: string
    photoUri: string
  }>
}

export interface GooglePlaceResult {
  id: string
  displayName: GooglePlaceDisplayName
  formattedAddress: string
  location: GooglePlaceLocation
  addressComponents?: GooglePlaceAddressComponent[]
  nationalPhoneNumber?: string
  websiteUri?: string
  googleMapsUri?: string
  types?: string[]
  editorialSummary?: GooglePlaceEditorialSummary
  photos?: GooglePlacePhoto[]
}

export interface GoogleNearbySearchResponse {
  places?: GooglePlaceResult[]
  nextPageToken?: string
}

export interface GoogleTextSearchResponse {
  places?: GooglePlaceResult[]
  nextPageToken?: string
}

export interface ImportStats {
  gridCellsSearched: number
  totalPlacesFound: number
  uniquePlaces: number
  churchesCreated: number
  churchesUpdated: number
  churchesSkipped: number
  photosUploaded: number
  photosSkipped: number
  errors: number
}

export interface ImportOptions {
  dryRun: boolean
  skipPhotos: boolean
  limit: number | null
  maxPhotosPerChurch: number
}

export function createEmptyStats(): ImportStats {
  return {
    gridCellsSearched: 0,
    totalPlacesFound: 0,
    uniquePlaces: 0,
    churchesCreated: 0,
    churchesUpdated: 0,
    churchesSkipped: 0,
    photosUploaded: 0,
    photosSkipped: 0,
    errors: 0,
  }
}
