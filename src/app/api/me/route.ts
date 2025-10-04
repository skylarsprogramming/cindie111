import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken, readUsers, safeUser } from '@/lib/users'

export async function GET() {
  try {
    const token = cookies().get('auth_token')?.value
    if (!token) return NextResponse.json({ user: null }, { status: 401 })
    const payload = await verifyToken(token)
    const db = await readUsers()
    const user = db.users.find(u => u.id === payload.sub)
    if (!user) return NextResponse.json({ user: null }, { status: 401 })
    return NextResponse.json({ user: safeUser(user) })
  } catch (e: any) {
    return NextResponse.json({ user: null }, { status: 401 })
  }
}


