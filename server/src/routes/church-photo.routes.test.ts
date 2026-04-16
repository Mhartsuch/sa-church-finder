import bcrypt from 'bcryptjs'
import request from 'supertest'

import { createApp } from '../app.js'
import prisma from '../lib/prisma.js'
import {
  deleteChurchPhoto,
  getChurchPhotos,
  reorderChurchPhotos,
  updateChurchPhoto,
  uploadChurchPhoto,
} from '../services/church-photo.service.js'

jest.mock('../lib/prisma.js', () => ({
  __esModule: true,
  default: {
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([]),
    user: {
      findUnique: jest.fn(),
    },
  },
}))

jest.mock('../services/church-photo.service.js', () => ({
  getChurchPhotos: jest.fn(),
  uploadChurchPhoto: jest.fn(),
  updateChurchPhoto: jest.fn(),
  reorderChurchPhotos: jest.fn(),
  deleteChurchPhoto: jest.fn(),
}))

type MockedPrisma = {
  user: {
    findUnique: jest.Mock
  }
}

const mockedPrisma = prisma as unknown as MockedPrisma
const mockedGetChurchPhotos = getChurchPhotos as jest.Mock
const mockedUploadChurchPhoto = uploadChurchPhoto as jest.Mock
const mockedUpdateChurchPhoto = updateChurchPhoto as jest.Mock
const mockedReorderChurchPhotos = reorderChurchPhotos as jest.Mock
const mockedDeleteChurchPhoto = deleteChurchPhoto as jest.Mock

const churchAdminLoginUser = {
  id: 'user-admin-1',
  email: 'admin@grace.org',
  name: 'Grace Admin',
  avatarUrl: null,
  role: 'CHURCH_ADMIN',
  emailVerified: true,
  createdAt: new Date('2026-03-28T00:00:00.000Z'),
}

const basePhotoResult = {
  id: 'photo-1',
  churchId: 'church-1',
  url: '/uploads/church-photos/test-photo.jpg',
  altText: 'Church exterior',
  displayOrder: 0,
  createdAt: new Date('2026-04-10T00:00:00.000Z'),
}

const buildLoginAgent = async (
  userOverrides: Partial<typeof churchAdminLoginUser> = {},
): Promise<ReturnType<typeof request.agent>> => {
  const passwordHash = await bcrypt.hash('password123', 12)

  mockedPrisma.user.findUnique.mockResolvedValueOnce({
    ...churchAdminLoginUser,
    ...userOverrides,
    passwordHash,
  })

  const agent = request.agent(createApp())

  const loginResponse = await agent.post('/api/v1/auth/login').send({
    email: userOverrides.email ?? churchAdminLoginUser.email,
    password: 'password123',
  })

  expect(loginResponse.status).toBe(200)

  return agent
}

describe('church photo routes', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  // --- GET /churches/:churchId/photos ---

  it('lists photos for a church (no auth required)', async () => {
    mockedGetChurchPhotos.mockResolvedValueOnce([basePhotoResult])

    const response = await request(createApp()).get('/api/v1/churches/church-1/photos')

    expect(response.status).toBe(200)
    expect(response.body.data).toHaveLength(1)
    expect(response.body.data[0]).toMatchObject({
      id: 'photo-1',
      churchId: 'church-1',
    })
    expect(response.body.meta.total).toBe(1)
    expect(mockedGetChurchPhotos).toHaveBeenCalledWith('church-1')
  })

  it('returns empty array when church has no photos', async () => {
    mockedGetChurchPhotos.mockResolvedValueOnce([])

    const response = await request(createApp()).get('/api/v1/churches/church-1/photos')

    expect(response.status).toBe(200)
    expect(response.body.data).toHaveLength(0)
    expect(response.body.meta.total).toBe(0)
  })

  // --- POST /churches/:churchId/photos (upload) ---

  it('requires authentication to upload a photo', async () => {
    const response = await request(createApp())
      .post('/api/v1/churches/church-1/photos')
      .attach('photo', Buffer.from('fake-image'), 'test.jpg')

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('AUTH_ERROR')
  })

  it('uploads a photo successfully', async () => {
    const agent = await buildLoginAgent()

    mockedUploadChurchPhoto.mockResolvedValueOnce(basePhotoResult)

    const response = await agent
      .post('/api/v1/churches/church-1/photos')
      .attach('photo', Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00]), {
        filename: 'church.jpg',
        contentType: 'image/jpeg',
      })

    expect(response.status).toBe(201)
    expect(response.body.data).toMatchObject({
      id: 'photo-1',
      churchId: 'church-1',
    })
    expect(response.body.message).toBe('Photo uploaded successfully')
    expect(mockedUploadChurchPhoto).toHaveBeenCalledWith(
      'user-admin-1',
      'church-1',
      expect.any(String),
      null,
    )
  })

  it('returns 403 when upload service throws FORBIDDEN', async () => {
    const agent = await buildLoginAgent()

    const { AppError } = await import('../middleware/error-handler.js')
    mockedUploadChurchPhoto.mockRejectedValueOnce(
      new AppError(403, 'FORBIDDEN', 'You do not have permission to manage photos for this church'),
    )

    const response = await agent
      .post('/api/v1/churches/church-1/photos')
      .attach('photo', Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00]), {
        filename: 'church.jpg',
        contentType: 'image/jpeg',
      })

    expect(response.status).toBe(403)
    expect(response.body.error.code).toBe('FORBIDDEN')
  })

  // --- PATCH /churches/photos/:photoId ---

  it('requires authentication to update a photo', async () => {
    const response = await request(createApp())
      .patch('/api/v1/churches/photos/photo-1')
      .send({ altText: 'Updated text' })

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('AUTH_ERROR')
  })

  it('updates photo alt text successfully', async () => {
    const agent = await buildLoginAgent()

    const updatedResult = { ...basePhotoResult, altText: 'Beautiful sanctuary' }
    mockedUpdateChurchPhoto.mockResolvedValueOnce(updatedResult)

    const response = await agent
      .patch('/api/v1/churches/photos/photo-1')
      .send({ altText: 'Beautiful sanctuary' })

    expect(response.status).toBe(200)
    expect(response.body.data.altText).toBe('Beautiful sanctuary')
    expect(response.body.message).toBe('Photo updated successfully')
    expect(mockedUpdateChurchPhoto).toHaveBeenCalledWith(
      'user-admin-1',
      'photo-1',
      'Beautiful sanctuary',
    )
  })

  it('allows setting alt text to null', async () => {
    const agent = await buildLoginAgent()

    const updatedResult = { ...basePhotoResult, altText: null }
    mockedUpdateChurchPhoto.mockResolvedValueOnce(updatedResult)

    const response = await agent.patch('/api/v1/churches/photos/photo-1').send({ altText: null })

    expect(response.status).toBe(200)
    expect(response.body.data.altText).toBeNull()
    expect(mockedUpdateChurchPhoto).toHaveBeenCalledWith('user-admin-1', 'photo-1', null)
  })

  it('rejects update with missing altText field', async () => {
    const agent = await buildLoginAgent()

    const response = await agent.patch('/api/v1/churches/photos/photo-1').send({})

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(mockedUpdateChurchPhoto).not.toHaveBeenCalled()
  })

  it('returns 404 when update service throws NOT_FOUND', async () => {
    const agent = await buildLoginAgent()

    const { NotFoundError } = await import('../middleware/error-handler.js')
    mockedUpdateChurchPhoto.mockRejectedValueOnce(new NotFoundError('Photo not found'))

    const response = await agent
      .patch('/api/v1/churches/photos/photo-missing')
      .send({ altText: 'test' })

    expect(response.status).toBe(404)
    expect(response.body.error.code).toBe('NOT_FOUND')
  })

  // --- PUT /churches/:churchId/photos/reorder ---

  it('requires authentication to reorder photos', async () => {
    const response = await request(createApp())
      .put('/api/v1/churches/church-1/photos/reorder')
      .send({
        ordering: [{ photoId: 'photo-1', displayOrder: 0 }],
      })

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('AUTH_ERROR')
  })

  it('reorders photos successfully', async () => {
    const agent = await buildLoginAgent()

    const reorderedPhotos = [
      { ...basePhotoResult, id: 'photo-2', displayOrder: 0 },
      { ...basePhotoResult, id: 'photo-1', displayOrder: 1 },
    ]
    mockedReorderChurchPhotos.mockResolvedValueOnce(reorderedPhotos)

    const response = await agent.put('/api/v1/churches/church-1/photos/reorder').send({
      ordering: [
        { photoId: 'photo-2', displayOrder: 0 },
        { photoId: 'photo-1', displayOrder: 1 },
      ],
    })

    expect(response.status).toBe(200)
    expect(response.body.data).toHaveLength(2)
    expect(response.body.message).toBe('Photos reordered successfully')
    expect(mockedReorderChurchPhotos).toHaveBeenCalledWith('user-admin-1', 'church-1', [
      { photoId: 'photo-2', displayOrder: 0 },
      { photoId: 'photo-1', displayOrder: 1 },
    ])
  })

  it('rejects reorder with empty ordering array', async () => {
    const agent = await buildLoginAgent()

    const response = await agent.put('/api/v1/churches/church-1/photos/reorder').send({
      ordering: [],
    })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(mockedReorderChurchPhotos).not.toHaveBeenCalled()
  })

  it('rejects reorder with invalid displayOrder (negative)', async () => {
    const agent = await buildLoginAgent()

    const response = await agent.put('/api/v1/churches/church-1/photos/reorder').send({
      ordering: [{ photoId: 'photo-1', displayOrder: -1 }],
    })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(mockedReorderChurchPhotos).not.toHaveBeenCalled()
  })

  // --- DELETE /churches/photos/:photoId ---

  it('requires authentication to delete a photo', async () => {
    const response = await request(createApp()).delete('/api/v1/churches/photos/photo-1')

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('AUTH_ERROR')
  })

  it('deletes a photo successfully', async () => {
    const agent = await buildLoginAgent()

    mockedDeleteChurchPhoto.mockResolvedValueOnce({
      id: 'photo-1',
      churchId: 'church-1',
    })

    const response = await agent.delete('/api/v1/churches/photos/photo-1')

    expect(response.status).toBe(200)
    expect(response.body.data).toMatchObject({
      id: 'photo-1',
      churchId: 'church-1',
    })
    expect(response.body.message).toBe('Photo deleted successfully')
    expect(mockedDeleteChurchPhoto).toHaveBeenCalledWith('user-admin-1', 'photo-1')
  })

  it('returns 404 when delete service throws NOT_FOUND', async () => {
    const agent = await buildLoginAgent()

    const { NotFoundError } = await import('../middleware/error-handler.js')
    mockedDeleteChurchPhoto.mockRejectedValueOnce(new NotFoundError('Photo not found'))

    const response = await agent.delete('/api/v1/churches/photos/photo-missing')

    expect(response.status).toBe(404)
    expect(response.body.error.code).toBe('NOT_FOUND')
  })

  it('returns 403 when delete service throws FORBIDDEN', async () => {
    const agent = await buildLoginAgent()

    const { AppError } = await import('../middleware/error-handler.js')
    mockedDeleteChurchPhoto.mockRejectedValueOnce(
      new AppError(403, 'FORBIDDEN', 'You do not have permission to manage photos for this church'),
    )

    const response = await agent.delete('/api/v1/churches/photos/photo-1')

    expect(response.status).toBe(403)
    expect(response.body.error.code).toBe('FORBIDDEN')
  })
})
