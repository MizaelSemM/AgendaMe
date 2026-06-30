import { prisma } from "@/lib/prisma"
import { apiError, apiSuccess } from "@/lib/utils"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return apiError("id é obrigatório", 400)
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: parseInt(id) },
    include: {
      service: { select: { id: true, name: true, duration: true, price: true } },
      business: { select: { id: true, name: true, slug: true } },
    },
  })

  if (!appointment) {
    return apiError("Agendamento não encontrado", 404)
  }

  return apiSuccess(appointment)
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return apiError("id é obrigatório", 400)
  }

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) },
    })

    if (!appointment) {
      return apiError("Agendamento não encontrado", 404)
    }

    if (appointment.status !== "CONFIRMED") {
      return apiError("Este agendamento já foi cancelado ou concluído", 400)
    }

    await prisma.appointment.delete({ where: { id: parseInt(id) } })

    return apiSuccess({ message: "Agendamento cancelado com sucesso" })
  } catch (error) {
    console.error("Public cancel error:", error)
    return apiError("Erro ao cancelar agendamento", 500)
  }
}
