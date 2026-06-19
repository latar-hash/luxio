import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createSessionToken, sessionCookieName } from "@/lib/auth"

export async function POST(request: Request) {
  const body = await request.json()
  const { email, name } = body

  if (!email || !name) {
    return NextResponse.json({ error: "Email dan nama diperlukan." }, { status: 400 })
  }

  const sessionToken = createSessionToken()
  const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const googleId = `mock-${email}-${Date.now()}`

  await prisma.user.upsert({
    where: { email },
    update: {
      name,
      sessionToken,
      sessionExpiresAt: sessionExpiry,
    },
    create: {
      googleId,
      email,
      name,
      sessionToken,
      sessionExpiresAt: sessionExpiry,
    },
  })

  const response = NextResponse.json({ success: true })
  response.cookies.set({
    name: sessionCookieName,
    value: sessionToken,
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })

  return response
}
