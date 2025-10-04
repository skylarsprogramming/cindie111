import { NextResponse } from 'next/server'
import { readUsers, writeUsers } from '@/lib/users'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const token = String(body?.token || '')
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })
    // In a real system, you would look up the token in DB. Here we just simulate success.
    const db = await readUsers()
    // Demo: verify the first unverified user
    const user = db.users.find(u => !u.emailVerified)
    if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    user.emailVerified = true
    await writeUsers(db)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}


