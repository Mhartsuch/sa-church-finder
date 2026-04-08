/**
 * Downloads Google Places photos and uploads them to Supabase Storage.
 * Creates ChurchPhoto records and sets coverImageUrl.
 */

import { PrismaClient } from '@prisma/client'

import { GooglePlacesClient } from './google-places-client.js'
import { SupabaseStorageClient } from './supabase-storage-client.js'
import type { GooglePlaceResult, ImportStats } from './types.js'

export async function processPhotosForChurch(
  prisma: PrismaClient,
  placesClient: GooglePlacesClient,
  storageClient: SupabaseStorageClient,
  churchId: string,
  place: GooglePlaceResult,
  maxPhotos: number,
  stats: ImportStats,
): Promise<void> {
  if (!place.photos || place.photos.length === 0) return

  const photosToProcess = place.photos.slice(0, maxPhotos)

  for (let i = 0; i < photosToProcess.length; i++) {
    const photo = photosToProcess[i]

    // Skip if already imported
    const existingPhoto = await prisma.churchPhoto.findFirst({
      where: {
        churchId,
        googlePhotoRef: photo.name,
      },
    })

    if (existingPhoto) {
      stats.photosSkipped++
      continue
    }

    try {
      // Download from Google
      const { buffer, contentType } = await placesClient.downloadPhoto(photo.name, 1200)

      // Determine file extension from content type
      const ext = contentType.includes('png') ? 'png' : 'jpg'
      const storagePath = `google-import/${place.id}/${i}.${ext}`

      // Upload to Supabase Storage
      const publicUrl = await storageClient.uploadPhoto(storagePath, buffer, contentType)

      // Create ChurchPhoto record
      await prisma.churchPhoto.create({
        data: {
          churchId,
          url: publicUrl,
          altText: `${place.displayName.text} photo ${i + 1}`,
          displayOrder: i,
          googlePhotoRef: photo.name,
        },
      })

      // Set first photo as cover image
      if (i === 0) {
        await prisma.church.update({
          where: { id: churchId },
          data: { coverImageUrl: publicUrl },
        })
      }

      stats.photosUploaded++
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`  Failed to process photo ${i} for ${place.displayName.text}: ${message}`)
      stats.errors++
    }
  }
}
