import { NextResponse } from 'next/server'
import { readUsers, writeUsers, hashPassword, safeUser, UserRecord, randomToken } from '@/lib/users'
import { z } from 'zod'

export async function POST(request: Request) {
  try {
    const schema = z.object({
      username: z.string().min(3).max(20).regex(/^[\w.-]+$/),
      email: z.string().email(),
      phone: z.string().min(7).max(20),
      age: z.number().int().min(5).max(120),
      password: z.string().min(8),
    })
    const body = await request.json()
    const parsed = schema.safeParse({
      username: body?.username,
      email: body?.email,
      phone: body?.phone,
      age: Number(body?.age),
      password: body?.password,
    })
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    const { username, email, phone, age, password } = parsed.data

    const db = await readUsers()
    const exists = db.users.find(u => u.username === username || u.email.toLowerCase() === String(email).toLowerCase())
    if (exists) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    const { hash, salt } = hashPassword(password)
    const record: UserRecord = {
      id: crypto.randomUUID(),
      username,
      email: String(email).toLowerCase(),
      phone: String(phone),
      age: Number(age),
      passwordHash: hash,
      passwordSalt: salt,
      roles: ['user'],
      emailVerified: false,
      createdAt: new Date().toISOString()
    }
    db.users.push(record)
    await writeUsers(db)

    const verificationToken = randomToken(24)
    return NextResponse.json({ user: safeUser(record), verify: { token: verificationToken } }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 })
  }
}












