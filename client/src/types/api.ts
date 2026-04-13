/** Canonical API response envelope — all endpoints return this shape. */
export interface ApiEnvelope<T> {
  data: T
  message?: string
}
