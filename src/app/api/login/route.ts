import { prisma } from "@/lib/prisma"
import { comparePassword, createSession } from "@/lib/auth"
import { apiError, apiSuccess } from "@/lib/utils"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return apiError("Dados inválidos", 400)
    }

    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({
      where: { email },
      include: { business: true },
    })

    if (!user) {
      return apiError("Email ou senha inválidos", 401)
    }

    const valid = await comparePassword(password, user.password)
    if (!valid) {
      return apiError("Email ou senha inválidos", 401)
    }

    await createSession(user.id, user.businessId, user.role)

    return apiSuccess({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      business: { id: user.business.id, name: user.business.name, slug: user.business.slug },
    })
  } catch (error) {
    console.error("Login error:", error)
    return apiError("Erro interno do servidor", 500)
  }
}
