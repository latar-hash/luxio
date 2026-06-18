import { NextResponse } from "next/server"
import { getGoogleProfileFromCode } from "@/lib/google"
import prisma from "@/lib/prisma"
import { createSessionToken, sessionCookieName } from "@/lib/auth"

export async function GET(request: Request) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
    return NextResponse.json(
      { error: "Google OAuth environment variables belum diatur. Periksa .env." },
      { status: 500 },
    )
  }

  const url = new URL(request.url)
  const code = url.searchParams.get("code")

  if (!code) {
    return NextResponse.json({ error: "Google callback tidak menerima kode authorization." }, { status: 400 })
  }

  const { tokens, profile } = await getGoogleProfileFromCode(code)
  const sessionToken = createSessionToken()
  const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const accessToken = tokens.access_token ?? ""
  const refreshToken = tokens.refresh_token ?? ""
  const expiryDate = tokens.expiry_date
  if (!accessToken || !refreshToken || !expiryDate) {
    return NextResponse.json({ error: "Google OAuth response tidak lengkap." }, { status: 500 })
  }

  await prisma.user.upsert({
    where: { googleId: profile.id as string },
    update: {
      email: profile.email as string,
      name: profile.name as string,
      picture: profile.picture,
      sessionToken,
      sessionExpiresAt: sessionExpiry,
    },
    create: {
      googleId: profile.id as string,
      email: profile.email as string,
      name: profile.name as string,
      picture: profile.picture,
      sessionToken,
      sessionExpiresAt: sessionExpiry,
    },
  })

  await prisma.googleAccount.upsert({
    where: { id: "default" },
    update: {
      accessToken,
      refreshToken,
      tokenType: tokens.token_type ?? "Bearer",
      scope: tokens.scope ?? "openid email profile https://www.googleapis.com/auth/calendar",
      expiresAt: new Date(expiryDate),
    },
    create: {
      id: "default",
      accessToken,
      refreshToken,
      tokenType: tokens.token_type ?? "Bearer",
      scope: tokens.scope ?? "openid email profile https://www.googleapis.com/auth/calendar",
      expiresAt: new Date(expiryDate),
    },
  })

  const response = NextResponse.redirect(new URL("/", request.url))
  response.cookies.set({
    name: sessionCookieName,
    value: sessionToken,
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })

  return response
}
