/* eslint-disable no-console */
/**
 * Grant SITE_ADMIN role to an existing user by email.
 *
 * Usage:
 *   npx tsx src/scripts/grant-admin.ts <email> [role]
 *   npm run db:grant-admin -- <email> [role]
 *
 * Role defaults to SITE_ADMIN. Valid values: USER, CHURCH_ADMIN, SITE_ADMIN.
 * The target user must already exist (register via the app first).
 *
 * Examples:
 *   npm run db:grant-admin -- mhartsuch@gmail.com
 *   npm run db:grant-admin -- someone@example.com CHURCH_ADMIN
 */

import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

const VALID_ROLES: Role[] = ['USER', 'CHURCH_ADMIN', 'SITE_ADMIN']

function isRole(value: string): value is Role {
  return (VALID_ROLES as string[]).includes(value)
}

async function main(): Promise<void> {
  const [emailArg, roleArg = 'SITE_ADMIN'] = process.argv.slice(2)

  if (!emailArg) {
    console.error('Error: email is required.')
    console.error('Usage: npm run db:grant-admin -- <email> [role]')
    process.exit(1)
  }

  const email = emailArg.trim().toLowerCase()
  const role = roleArg.trim().toUpperCase()

  if (!isRole(role)) {
    console.error(`Error: invalid role "${roleArg}". Must be one of: ${VALID_ROLES.join(', ')}`)
    process.exit(1)
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, role: true },
  })

  if (!user) {
    console.error(`No user found with email "${email}".`)
    console.error('Register the account in the app first, then rerun this script.')
    process.exit(1)
  }

  if (user.role === role) {
    console.log(`User ${user.email} already has role ${role} — no change.`)
    return
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { role },
    select: { email: true, name: true, role: true },
  })

  console.log(`Updated ${updated.email} (${updated.name}): ${user.role} → ${updated.role}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Grant-admin failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
