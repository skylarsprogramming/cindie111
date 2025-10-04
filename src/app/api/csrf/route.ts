import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { generateCsrfSecret, signCsrfToken, sameSiteLaxSecure } from '@/lib/security'

export async function GET() {
  const secret = generateCsrfSecret()
  const token = signCsrfToken(secret)
  const res = NextResponse.json({ csrfToken: token })
  // Store secret in a cookie so the server can verify; rotate per request
  res.cookies.set('csrf_secret', secret, { ...sameSiteLaxSecure(), maxAge: 60 * 10 })
  return res
}


