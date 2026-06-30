import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { apiError, apiSuccess } from "@/lib/utils"
import { z } from "zod"

const serviceSchema = z.object({
  name: z.string().min(1),
  duration: z.number().int().positive(),
  price: z.number().positive(),
})

export async function GET() {
  const session = await getSession()
  if (!session) return apiError("Não autorizado", 401)
  if (session.role === "SUPER_ADMIN") return apiError("Acesso negado", 403)

  const services = await prisma.service.findMany({
    where: { businessId: session.businessId },
    orderBy: { createdAt: "desc" },
  })

  return apiSuccess(services)
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return apiError("Não autorizado", 401)
  if (session.role === "SUPER_ADMIN") return apiError("Acesso negado", 403)

  try {
    const body = await request.json()
    const parsed = serviceSchema.safeParse(body)

    if (!parsed.success) {
      return apiError("Dados inválidos", 400)
    }

    const { name, duration, price } = parsed.data

    const service = await prisma.service.create({
      data: {
        name,
        duration,
        price,
        businessId: session.businessId,
      },
    })

    return apiSuccess(service, 201)
  } catch (error) {
    console.error("Create service error:", error)
    return apiError("Erro interno do servidor", 500)
  }
}
