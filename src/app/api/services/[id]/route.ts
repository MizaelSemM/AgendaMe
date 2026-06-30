import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { apiError, apiSuccess } from "@/lib/utils"
import { z } from "zod"

const updateServiceSchema = z.object({
  name: z.string().min(1).optional(),
  duration: z.number().int().positive().optional(),
  price: z.number().positive().optional(),
})

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return apiError("Não autorizado", 401)
  if (session.role === "SUPER_ADMIN") return apiError("Acesso negado", 403)

  const { id } = await params
  const serviceId = parseInt(id)

  const service = await prisma.service.findFirst({
    where: { id: serviceId, businessId: session.businessId },
  })
  if (!service) return apiError("Serviço não encontrado", 404)

  try {
    const body = await request.json()
    const parsed = updateServiceSchema.safeParse(body)
    if (!parsed.success) return apiError("Dados inválidos", 400)

    const updated = await prisma.service.update({
      where: { id: serviceId },
      data: parsed.data,
    })

    return apiSuccess(updated)
  } catch (error) {
    console.error("Update service error:", error)
    return apiError("Erro interno do servidor", 500)
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    console.error("Delete service: no session")
    return apiError("Não autorizado — sessão não encontrada", 401)
  }
  if (session.role === "SUPER_ADMIN") return apiError("Acesso negado", 403)

  const { id } = await params
  const serviceId = parseInt(id)
  if (isNaN(serviceId)) {
    return apiError("ID inválido", 400)
  }

  const service = await prisma.service.findFirst({
    where: { id: serviceId, businessId: session.businessId },
  })
  if (!service) {
    return apiError("Serviço não encontrado", 404)
  }

  try {
    await prisma.$transaction([
      prisma.appointment.deleteMany({
        where: { serviceId, businessId: session.businessId },
      }),
      prisma.service.delete({ where: { id: serviceId } }),
    ])

    return apiSuccess({ message: "Serviço removido" })
  } catch (error) {
    console.error("Delete service error:", error)
    const message = error instanceof Error ? error.message : "Erro desconhecido"
    return apiError(`Erro ao remover serviço: ${message}`, 500)
  }
}
