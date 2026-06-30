import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { apiError, apiSuccess } from "@/lib/utils"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return apiError("Não autorizado", 401)

  const { id } = await params
  const notificationId = parseInt(id)

  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, businessId: session.businessId },
  })
  if (!notification) return apiError("Notificação não encontrada", 404)

  try {
    await prisma.notification.delete({ where: { id: notificationId } })
    return apiSuccess({ message: "Notificação removida" })
  } catch (error) {
    console.error("Delete notification error:", error)
    return apiError("Erro interno do servidor", 500)
  }
}
