import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { config } from "./config"
import { prisma } from "./prisma"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"

const SALT_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function signToken(payload: { userId: string; role: string }): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: `${config.sessionExpiryHours}h` })
}

export function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    return jwt.verify(token, config.jwtSecret) as { userId: string; role: string }
  } catch {
    return null
  }
}

export async function createSession(userId: string, ipAddress?: string, userAgent?: string): Promise<string> {
  const token = uuidv4()
  const expiresAt = new Date(Date.now() + config.sessionExpiryHours * 60 * 60 * 1000)
  await prisma.session.create({
    data: { userId, token, ipAddress, userAgent, expiresAt },
  })
  return token
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value
  if (!token) return null
  
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })
  
  if (!session || session.expiresAt < new Date()) return null
  return session.user
}

import { UnauthorizedError, ForbiddenError } from "./errors"

export async function requireAuth(roles?: string[]) {
  const user = await getCurrentUser()
  if (!user) throw new UnauthorizedError()
  if (roles && !roles.includes(user.role)) throw new ForbiddenError()
  return user
}
