---
description: Rules for server/ backend code
globs: server/src/**
---

- All database access through Prisma — no raw SQL
- Route handlers in `routes/`, business logic in `services/`
- Use Zod for request validation in middleware
- Wrap async route handlers in try/catch; use centralized error middleware
- Custom error classes: AppError, NotFoundError, ValidationError, AuthError
- Structured logging via Pino — never log passwords, tokens, or sensitive bodies
- Test with Jest + supertest for route integration tests
- Session-based auth via Passport — no JWT
- API responses use `{ data, meta, error }` envelope
