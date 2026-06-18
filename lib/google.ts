import { google } from "googleapis"
import type { OAuth2Client } from "google-auth-library"
import prisma from "@/lib/prisma"

const SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/calendar",
]

function getOAuthClient(): OAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID ?? ""
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET ?? ""
  const redirectUri = process.env.GOOGLE_REDIRECT_URI ?? ""

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri)
}

export function getGoogleAuthUrl() {
  return getOAuthClient().generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  })
}

export async function getGoogleProfileFromCode(code: string) {
  const oauth2Client = getOAuthClient()
  const { tokens } = await oauth2Client.getToken(code)

  if (!tokens.access_token || !tokens.refresh_token || !tokens.expiry_date) {
    throw new Error("Google OAuth failed to return valid tokens")
  }

  oauth2Client.setCredentials(tokens)

  const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" })
  const profileResponse = await oauth2.userinfo.get()
  const profile = profileResponse.data

  if (!profile.id || !profile.email) {
    throw new Error("Google profile data tidak lengkap")
  }

  return {
    tokens,
    profile,
  }
}

export async function exchangeCodeForTokens(code: string) {
  const oauth2Client = getOAuthClient()
  const { tokens } = await oauth2Client.getToken(code)

  if (!tokens.access_token || !tokens.refresh_token || !tokens.expiry_date) {
    throw new Error("Google OAuth failed to return valid tokens")
  }

  await prisma.googleAccount.upsert({
    where: { id: "default" },
    update: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenType: tokens.token_type ?? "Bearer",
      scope: tokens.scope ?? SCOPES.join(" "),
      expiresAt: new Date(tokens.expiry_date),
    },
    create: {
      id: "default",
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenType: tokens.token_type ?? "Bearer",
      scope: tokens.scope ?? SCOPES.join(" "),
      expiresAt: new Date(tokens.expiry_date),
    },
  })
}

async function getStoredCredentials() {
  const account = await prisma.googleAccount.findUnique({ where: { id: "default" } })
  if (!account) {
    throw new Error("Google Calendar is not authorized yet")
  }

  const oauth2Client = getOAuthClient()
  oauth2Client.setCredentials({
    access_token: account.accessToken,
    refresh_token: account.refreshToken,
    expiry_date: account.expiresAt.getTime(),
  })

  if (account.expiresAt.getTime() <= Date.now() + 60_000) {
    const refreshed = await oauth2Client.refreshAccessToken()
    if (!refreshed.credentials.access_token || !refreshed.credentials.expiry_date) {
      throw new Error("Failed to refresh Google access token")
    }

    await prisma.googleAccount.update({
      where: { id: "default" },
      data: {
        accessToken: refreshed.credentials.access_token,
        expiresAt: new Date(refreshed.credentials.expiry_date),
        tokenType: refreshed.credentials.token_type ?? account.tokenType,
      },
    })

    oauth2Client.setCredentials({
      access_token: refreshed.credentials.access_token,
      refresh_token: account.refreshToken,
      expiry_date: refreshed.credentials.expiry_date,
    })
  }

  return oauth2Client
}

export async function createCalendarEventForTask(payload: {
  title: string
  description?: string
  dueDate: string
  dueEnd?: string
}) {
  const oauth2Client = await getStoredCredentials()
  const calendar = google.calendar({ version: "v3", auth: oauth2Client })

  const start = new Date(payload.dueDate)
  const end = payload.dueEnd ? new Date(payload.dueEnd) : new Date(start.getTime() + 60 * 60 * 1000)

  const response = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: payload.title,
      description: payload.description,
      start: {
        dateTime: start.toISOString(),
      },
      end: {
        dateTime: end.toISOString(),
      },
    },
  })

  return response.data
}
