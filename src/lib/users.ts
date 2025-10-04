import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'

export type UserRecord = {
  id: string
  username: string
  email: string
  phone: string
  age: number
  passwordHash: string
  passwordSalt?: string
  roles?: string[]
  emailVerified?: boolean
  twofaEnabled?: boolean
  twofaSecret?: string
  createdAt: string
}

type Db = { users: UserRecord[] }

const DB_PATH = path.join(process.cwd(), 'users.db.json')
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-insecure-secret-change-me')

export async function readUsers(): Promise<Db> {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8')
    return JSON.parse(raw)
  } catch (_) {
    return { users: [] }
  }
}

export async function writeUsers(db: Db): Promise<void> {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8')
}

export function safeUser(u: UserRecord) {
  const { passwordHash, passwordSalt, twofaSecret, ...rest } = u
  return rest
}

export function hashPassword(password: string, providedSalt?: string) {
  // Use bcrypt for hashing; if providedSalt is present, hash with it for legacy compatibility
  const salt = providedSalt || bcrypt.genSaltSync(12)
  const hash = bcrypt.hashSync(password, salt)
  return { hash, salt }
}

export function verifyPassword(password: string, hash: string) {
  try { return bcrypt.compareSync(password, hash) } catch { return false }
}

export async function signToken(payload: Record<string, any>, expiresInSeconds = 60 * 15) {
  const now = Math.floor(Date.now() / 1000)
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt(now)
    .setExpirationTime(now + expiresInSeconds)
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, JWT_SECRET)
  return payload
}

export function randomToken(len = 32) {
  return crypto.randomBytes(len).toString('hex')
}


