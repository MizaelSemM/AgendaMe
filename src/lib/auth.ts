import "server-only"
import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcrypt"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const secretKey = process.env.JWT_SECRET!
const encodedKey = new TextEncoder().encode(secretKey)

export type SessionPayload = {
  userId: number
  businessId: number
  role: string
  expiresAt: Date
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey)
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    })
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export async function createSession(
  userId: number,
  businessId: number,
  role: string
) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const session = await encrypt({ userId, businessId, role, expiresAt })
  const cookieStore = await cookies()

  cookieStore.set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  })
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}

export async function getSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")?.value
  if (!session) return null
  return decrypt(session)
}

export async function verifyAuth() {
  const session = await getSession()
  if (!session?.userId) {
    redirect("/login")
  }
  return session
}

export async function requireRole(...roles: string[]) {
  const session = await getSession()
  if (!session?.userId) {
    return null
  }
  if (!roles.includes(session.role)) {
    return null
  }
  return session
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}
