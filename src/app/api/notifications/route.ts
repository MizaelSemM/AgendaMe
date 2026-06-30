import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { apiError, apiSuccess } from "@/lib/utils"

export async function GET() {
  const session = await getSession()
  if (!session) return apiError("Não autorizado", 401)

  const notifications = await prisma.notification.findMany({
    where: { businessId: session.businessId },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  return apiSuccess(notifications)
}

export async function PATCH() {
  const session = await getSession()
  if (!session) return apiError("Não autorizado", 401)

  await prisma.notification.updateMany({
    where: { businessId: session.businessId, read: false },
    data: { read: true },
  })

  return apiSuccess({ message: "Notificações marcadas como lidas" })
}
