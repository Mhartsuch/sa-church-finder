import bcrypt from 'bcryptjs'
import request from 'supertest'

import { createApp } from '../app.js'
import prisma from '../lib/prisma.js'
import {
  createChurchService,
  updateChurchService,
  deleteChurchService,
} from '../services/church-service.service.js'

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

jest.mock('../services/church-service.service.js', () => ({
  createChurchService: jest.fn(),
  updateChurchService: jest.fn(),
  deleteChurchService: jest.fn(),
}))

type MockedPrisma = {
  user: {
    findUnique: jest.Mock
  }
}

const mockedPrisma = prisma as unknown as MockedPrisma
const mockedCreateChurchService = createChurchService as jest.Mock
const mockedUpdateChurchService = updateChurchService as jest.Mock
const mockedDeleteChurchService = deleteChurchService as jest.Mock

const churchAdminLoginUser = {
  id: 'user-admin-1',
  email: 'admin@grace.org',
  name: 'Grace Admin',
  avatarUrl: null,
  role: 'CHURCH_ADMIN',
  emailVerified: true,
  createdAt: new Date('2026-03-28T00:00:00.000Z'),
}

const baseServiceResult = {
  id: 'service-1',
  churchId: 'church-1',
  dayOfWeek: 0,
  startTime: '10:00',
  endTime: '11:30',
  serviceType: 'Sunday Worship',
  language: 'English',
  description: 'Main Sunday service',
  isAutoImported: false,
  createdAt: new Date('2026-04-01T00:00:00.000Z'),
  updatedAt: new Date('2026-04-01T00:00:00.000Z'),
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

describe('church service routes', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  // --- Auth required ---

  it('requires authentication to create a church service', async () => {
    const response = await request(createApp())
      .post('/api/v1/churches/church-1/services')
      .send({
        dayOfWeek: 0,
        startTime: '10:00',
        serviceType: 'Sunday Worship',
      })

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('AUTH_ERROR')
  })

  it('requires authentication to update a church service', async () => {
    const response = await request(createApp())
      .patch('/api/v1/services/service-1')
      .send({
        startTime: '11:00',
      })

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('AUTH_ERROR')
  })

  it('requires authentication to delete a church service', async () => {
    const response = await request(createApp()).delete('/api/v1/services/service-1')

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('AUTH_ERROR')
  })

  // --- Successful CRUD ---

  it('creates a church service successfully', async () => {
    const agent = await buildLoginAgent()

    mockedCreateChurchService.mockResolvedValueOnce(baseServiceResult)

    const response = await agent.post('/api/v1/churches/church-1/services').send({
      dayOfWeek: 0,
      startTime: '10:00',
      endTime: '11:30',
      serviceType: 'Sunday Worship',
      language: 'English',
      description: 'Main Sunday service',
    })

    expect(response.status).toBe(201)
    expect(response.body.data).toMatchObject({
      id: 'service-1',
      churchId: 'church-1',
      dayOfWeek: 0,
      startTime: '10:00',
      serviceType: 'Sunday Worship',
    })
    expect(response.body.message).toBe('Service time created successfully')
    expect(mockedCreateChurchService).toHaveBeenCalledWith('user-admin-1', 'church-1', {
      dayOfWeek: 0,
      startTime: '10:00',
      endTime: '11:30',
      serviceType: 'Sunday Worship',
      language: 'English',
      description: 'Main Sunday service',
    })
  })

  it('creates a church service with minimal fields (no optional fields)', async () => {
    const agent = await buildLoginAgent()

    const minimalResult = {
      ...baseServiceResult,
      endTime: null,
      language: 'English',
      description: null,
    }
    mockedCreateChurchService.mockResolvedValueOnce(minimalResult)

    const response = await agent.post('/api/v1/churches/church-1/services').send({
      dayOfWeek: 3,
      startTime: '19:00',
      serviceType: 'Wednesday Bible Study',
    })

    expect(response.status).toBe(201)
    expect(mockedCreateChurchService).toHaveBeenCalledWith('user-admin-1', 'church-1', {
      dayOfWeek: 3,
      startTime: '19:00',
      endTime: null,
      serviceType: 'Wednesday Bible Study',
      language: undefined,
      description: null,
    })
  })

  it('updates a church service successfully', async () => {
    const agent = await buildLoginAgent()

    const updatedResult = { ...baseServiceResult, startTime: '09:30' }
    mockedUpdateChurchService.mockResolvedValueOnce(updatedResult)

    const response = await agent.patch('/api/v1/services/service-1').send({
      startTime: '09:30',
    })

    expect(response.status).toBe(200)
    expect(response.body.data).toMatchObject({
      id: 'service-1',
      startTime: '09:30',
    })
    expect(response.body.message).toBe('Service time updated successfully')
    expect(mockedUpdateChurchService).toHaveBeenCalledWith('user-admin-1', 'service-1', {
      startTime: '09:30',
    })
  })

  it('deletes a church service successfully', async () => {
    const agent = await buildLoginAgent()

    mockedDeleteChurchService.mockResolvedValueOnce({
      id: 'service-1',
      churchId: 'church-1',
    })

    const response = await agent.delete('/api/v1/services/service-1')

    expect(response.status).toBe(200)
    expect(response.body.data).toMatchObject({
      id: 'service-1',
      churchId: 'church-1',
    })
    expect(response.body.message).toBe('Service time deleted successfully')
    expect(mockedDeleteChurchService).toHaveBeenCalledWith('user-admin-1', 'service-1')
  })

  // --- Validation errors ---

  it('rejects create with missing required fields', async () => {
    const agent = await buildLoginAgent()

    const response = await agent.post('/api/v1/churches/church-1/services').send({
      dayOfWeek: 0,
      // missing startTime and serviceType
    })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(mockedCreateChurchService).not.toHaveBeenCalled()
  })

  it('rejects create with invalid dayOfWeek (out of range)', async () => {
    const agent = await buildLoginAgent()

    const response = await agent.post('/api/v1/churches/church-1/services').send({
      dayOfWeek: 7,
      startTime: '10:00',
      serviceType: 'Sunday Worship',
    })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(mockedCreateChurchService).not.toHaveBeenCalled()
  })

  it('rejects create with invalid time format', async () => {
    const agent = await buildLoginAgent()

    const response = await agent.post('/api/v1/churches/church-1/services').send({
      dayOfWeek: 0,
      startTime: '10am',
      serviceType: 'Sunday Worship',
    })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(mockedCreateChurchService).not.toHaveBeenCalled()
  })

  it('rejects update with empty body (no fields provided)', async () => {
    const agent = await buildLoginAgent()

    const response = await agent.patch('/api/v1/services/service-1').send({})

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(mockedUpdateChurchService).not.toHaveBeenCalled()
  })

  it('rejects update with invalid startTime format', async () => {
    const agent = await buildLoginAgent()

    const response = await agent.patch('/api/v1/services/service-1').send({
      startTime: 'not-a-time',
    })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(mockedUpdateChurchService).not.toHaveBeenCalled()
  })

  // --- Service-level auth errors ---

  it('returns 403 when service layer throws FORBIDDEN for create', async () => {
    const agent = await buildLoginAgent()

    const { AppError } = await import('../middleware/error-handler.js')
    mockedCreateChurchService.mockRejectedValueOnce(
      new AppError(403, 'FORBIDDEN', 'You do not have permission to manage services for this church'),
    )

    const response = await agent.post('/api/v1/churches/church-1/services').send({
      dayOfWeek: 0,
      startTime: '10:00',
      serviceType: 'Sunday Worship',
    })

    expect(response.status).toBe(403)
    expect(response.body.error.code).toBe('FORBIDDEN')
  })

  it('returns 404 when service layer throws NOT_FOUND for update', async () => {
    const agent = await buildLoginAgent()

    const { NotFoundError } = await import('../middleware/error-handler.js')
    mockedUpdateChurchService.mockRejectedValueOnce(
      new NotFoundError('Church service not found'),
    )

    const response = await agent.patch('/api/v1/services/service-missing').send({
      startTime: '09:00',
    })

    expect(response.status).toBe(404)
    expect(response.body.error.code).toBe('NOT_FOUND')
  })

  it('returns 403 when service layer throws FORBIDDEN for delete', async () => {
    const agent = await buildLoginAgent()

    const { AppError } = await import('../middleware/error-handler.js')
    mockedDeleteChurchService.mockRejectedValueOnce(
      new AppError(403, 'FORBIDDEN', 'You do not have permission to manage services for this church'),
    )

    const response = await agent.delete('/api/v1/services/service-1')

    expect(response.status).toBe(403)
    expect(response.body.error.code).toBe('FORBIDDEN')
  })

  it('returns 404 when service layer throws NOT_FOUND for delete', async () => {
    const agent = await buildLoginAgent()

    const { NotFoundError } = await import('../middleware/error-handler.js')
    mockedDeleteChurchService.mockRejectedValueOnce(
      new NotFoundError('Church service not found'),
    )

    const response = await agent.delete('/api/v1/services/service-1')

    expect(response.status).toBe(404)
    expect(response.body.error.code).toBe('NOT_FOUND')
  })
})
