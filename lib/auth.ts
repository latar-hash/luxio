import prisma from "@/lib/prisma"
import { cookies } from "next/headers"

export const sessionCookieName = "luxio_session"

export async function getCurrentUser() {
  const token = cookies().get(sessionCookieName)?.value
  if (!token) return null
  return prisma.user.findUnique({ where: { sessionToken: token } })
}

export function createSessionToken() {
  return crypto.randomUUID()
}
