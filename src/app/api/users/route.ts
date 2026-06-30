import { prisma } from "@/lib/prisma"
import { getSession, hashPassword } from "@/lib/auth"
import { apiError, apiSuccess } from "@/lib/utils"
import { z } from "zod"

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  businessId: z.number().int().positive(),
})

export async function GET() {
  const session = await getSession()
  if (!session) return apiError("Não autorizado", 401)
  if (session.role !== "SUPER_ADMIN") return apiError("Acesso negado", 403)

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      businessId: true,
      createdAt: true,
      business: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return apiSuccess(users)
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return apiError("Não autorizado", 401)
  if (session.role !== "SUPER_ADMIN") return apiError("Acesso negado", 403)

  try {
    const body = await request.json()
    const parsed = createUserSchema.safeParse(body)

    if (!parsed.success) {
      return apiError("Dados inválidos", 400)
    }

    const { name, email, password, businessId } = parsed.data

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return apiError("Email já cadastrado", 409)
    }

    const business = await prisma.business.findUnique({ where: { id: businessId } })
    if (!business) {
      return apiError("Empresa não encontrada", 404)
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
        businessId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        businessId: true,
        createdAt: true,
        business: { select: { name: true, slug: true } },
      },
    })

    return apiSuccess(user, 201)
  } catch (error) {
    console.error("Create user error:", error)
    return apiError("Erro interno do servidor", 500)
  }
}
