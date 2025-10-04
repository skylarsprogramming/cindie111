import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken, signToken, readUsers } from '@/lib/users'
import { sameSiteLaxSecure } from '@/lib/security'

export async function POST() {
  try {
    const rt = cookies().get('refresh_token')?.value
    if (!rt) return NextResponse.json({ error: 'Missing refresh token' }, { status: 401 })
    const payload = await verifyToken(rt)
    if (payload.type !== 'refresh') return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    const db = await readUsers()
    const user = db.users.find(u => u.id === payload.sub)
    if (!user) return NextResponse.json({ error: 'Invalid user' }, { status: 401 })

    const accessToken = await signToken({ sub: user.id, u: user.username, roles: user.roles || ['user'] }, 60 * 15)
    const newRefresh = await signToken({ sub: user.id, type: 'refresh' }, 60 * 60 * 24 * 7)
    const res = NextResponse.json({ ok: true })
    res.cookies.set('auth_token', accessToken, sameSiteLaxSecure())
    res.cookies.set('refresh_token', newRefresh, { ...sameSiteLaxSecure(), path: '/api' })
    return res
  } catch (e: any) {
    return NextResponse.json({ error: 'Refresh failed' }, { status: 401 })
  }
}


