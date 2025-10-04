import crypto from 'crypto'
import { cookies, headers } from 'next/headers'

export function generateCsrfSecret() {
  return crypto.randomBytes(32).toString('hex')
}

export function signCsrfToken(secret: string) {
  const nonce = crypto.randomBytes(16).toString('hex')
  const h = crypto.createHmac('sha256', secret).update(nonce).digest('hex')
  return `${nonce}.${h}`
}

export function verifyCsrfToken(token: string, secret: string) {
  const [nonce, mac] = String(token || '').split('.')
  if (!nonce || !mac) return false
  const h = crypto.createHmac('sha256', secret).update(nonce).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(h))
}

export function sameSiteLaxSecure() {
  const host = headers().get('host') || ''
  const isLocal = host.startsWith('localhost') || host.startsWith('127.0.0.1')
  return { httpOnly: true, secure: !isLocal, sameSite: 'lax' as const, path: '/' }
}

const RATE_STORE: Record<string, { count: number; ts: number }> = {}

export function rateLimit(key: string, windowMs: number, max: number) {
  const now = Date.now()
  const rec = RATE_STORE[key]
  if (!rec || now - rec.ts > windowMs) {
    RATE_STORE[key] = { count: 1, ts: now }
    return { allowed: true, remaining: max - 1 }
  }
  if (rec.count >= max) {
    return { allowed: false, remaining: 0 }
  }
  rec.count += 1
  return { allowed: true, remaining: max - rec.count }
}

export function getClientIp(req: Request) {
  try {
    // Not perfect in serverless but fine as a basic limiter key
    // @ts-ignore
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || ''
    return String(ip).split(',')[0].trim() || 'unknown'
  } catch (_) { return 'unknown' }
}


