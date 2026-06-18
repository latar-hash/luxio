import { NextResponse } from "next/server"
import { getGoogleAuthUrl } from "@/lib/google"

export async function GET() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
    return NextResponse.json(
      { error: "Google OAuth environment variables belum diatur. Periksa .env." },
      { status: 500 },
    )
  }

  return NextResponse.redirect(getGoogleAuthUrl())
}
