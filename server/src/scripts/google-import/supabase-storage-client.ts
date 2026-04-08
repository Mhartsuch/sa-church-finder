/**
 * Supabase Storage REST API client.
 * Uses native fetch — no @supabase/supabase-js dependency needed.
 */

const BUCKET_NAME = 'church-photos'

export class SupabaseStorageClient {
  private readonly baseUrl: string
  private readonly serviceRoleKey: string

  constructor(supabaseUrl: string, serviceRoleKey: string) {
    this.baseUrl = `${supabaseUrl}/storage/v1`
    this.serviceRoleKey = serviceRoleKey
  }

  /**
   * Upload a file to the church-photos bucket.
   * Uses upsert to overwrite if the path already exists.
   */
  async uploadPhoto(path: string, buffer: Buffer, contentType: string): Promise<string> {
    const url = `${this.baseUrl}/object/${BUCKET_NAME}/${path}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.serviceRoleKey}`,
        'Content-Type': contentType,
        'x-upsert': 'true',
      },
      body: buffer,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Supabase Storage upload failed (${response.status}): ${errorText}`)
    }

    return this.getPublicUrl(path)
  }

  /**
   * Construct the public URL for a file in the church-photos bucket.
   */
  getPublicUrl(path: string): string {
    return `${this.baseUrl}/object/public/${BUCKET_NAME}/${path}`
  }
}
