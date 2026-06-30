import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { apiError, apiSuccess } from "@/lib/utils"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return apiError("Não autorizado", 401)
  if (session.role === "SUPER_ADMIN") return apiError("Acesso negado", 403)

  const { id } = await params
  const serviceId = parseInt(id)
  if (isNaN(serviceId)) return apiError("ID inválido", 400)

  const service = await prisma.service.findFirst({
    where: { id: serviceId, businessId: session.businessId },
  })
  if (!service) return apiError("Serviço não encontrado", 404)

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
    return apiError(message, 500)
  }
}
