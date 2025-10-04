import { NextResponse } from 'next/server'
import { sameSiteLaxSecure } from '@/lib/security'

function clearCookieResponse() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set('auth_token', '', { ...sameSiteLaxSecure(), maxAge: 0 })
  res.cookies.set('refresh_token', '', { ...sameSiteLaxSecure(), path: '/api', maxAge: 0 })
  return res
}

export async function POST() {
  return clearCookieResponse()
}

export async function GET() {
  return clearCookieResponse()
}












