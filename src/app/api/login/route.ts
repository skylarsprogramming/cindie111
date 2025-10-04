import { NextResponse } from 'next/server'
import { readUsers, verifyPassword, signToken, safeUser } from '@/lib/users'
import { z } from 'zod'
import { getClientIp, rateLimit, sameSiteLaxSecure, verifyCsrfToken } from '@/lib/security'

export async function POST(request: Request) {
  try {
    const schema = z.object({ usernameOrEmail: z.string().min(3), password: z.string().min(8), csrfToken: z.string().optional() })
    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
    const { usernameOrEmail, password, csrfToken } = parsed.data

    // Basic rate limit per IP
    const ip = getClientIp(request)
    const rl = rateLimit(`login:${ip}`, 10 * 60 * 1000, 5)
    if (!rl.allowed) return NextResponse.json({ error: 'Too many attempts. Try later.' }, { status: 429 })

    const db = await readUsers()
    const user = db.users.find(u => u.username === usernameOrEmail || u.email.toLowerCase() === String(usernameOrEmail).toLowerCase())
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    if (!verifyPassword(password, user.passwordHash)) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    // Optional: enforce email verification
    if (user.emailVerified === false) {
      return NextResponse.json({ error: 'Email not verified' }, { status: 403 })
    }

    const accessToken = await signToken({ sub: user.id, u: user.username, roles: user.roles || ['user'] }, 60 * 15)
    const refreshToken = await signToken({ sub: user.id, type: 'refresh' }, 60 * 60 * 24 * 7)

    const res = NextResponse.json({ user: safeUser(user) })
    res.cookies.set('auth_token', accessToken, sameSiteLaxSecure())
    res.cookies.set('refresh_token', refreshToken, { ...sameSiteLaxSecure(), path: '/api' })
    return res
  } catch (e: any) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}












