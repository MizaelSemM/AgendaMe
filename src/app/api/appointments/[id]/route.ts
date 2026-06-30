import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { apiError, apiSuccess } from "@/lib/utils"
import { z } from "zod"

const statusSchema = z.object({
  status: z.enum(["CONFIRMED", "CANCELED", "DONE"]),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return apiError("Não autorizado", 401)
  if (session.role === "SUPER_ADMIN") return apiError("Acesso negado", 403)

  const { id } = await params
  const appointmentId = parseInt(id)

  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, businessId: session.businessId },
  })
  if (!appointment) return apiError("Agendamento não encontrado", 404)

  try {
    const body = await request.json()
    const parsed = statusSchema.safeParse(body)
    if (!parsed.success) return apiError("Status inválido", 400)

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: parsed.data.status },
      include: { service: true },
    })

    return apiSuccess(updated)
  } catch (error) {
    console.error("Update appointment error:", error)
    return apiError("Erro interno do servidor", 500)
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return apiError("Não autorizado", 401)
  if (session.role === "SUPER_ADMIN") return apiError("Acesso negado", 403)

  const { id } = await params
  const appointmentId = parseInt(id)

  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, businessId: session.businessId },
  })
  if (!appointment) return apiError("Agendamento não encontrado", 404)

  try {
    await prisma.appointment.delete({ where: { id: appointmentId } })
    return apiSuccess({ message: "Agendamento removido" })
  } catch (error) {
    console.error("Delete appointment error:", error)
    return apiError("Erro interno do servidor", 500)
  }
}
