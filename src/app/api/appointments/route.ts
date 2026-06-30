import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { apiError, apiSuccess, getDayName, migrateWorkHours, getExpandedSlots, isTimeInLunchBreak, type DayConfig } from "@/lib/utils"
import { sendMessage, formatPhone } from "@/lib/whatsapp"
import { z } from "zod"

const createAppointmentSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().min(1),
  customerEmail: z.string().email().optional().or(z.literal("")),
  serviceId: z.number().int().positive(),
  date: z.string().min(1),
})

export async function GET() {
  const session = await getSession()
  if (!session) return apiError("Não autorizado", 401)
  if (session.role === "SUPER_ADMIN") return apiError("Acesso negado", 403)

  const appointments = await prisma.appointment.findMany({
    where: { businessId: session.businessId },
    include: { service: true },
    orderBy: { date: "desc" },
  })

  return apiSuccess(appointments)
}

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = createAppointmentSchema.safeParse(body)

  if (!parsed.success) {
    return apiError("Dados inválidos", 400)
  }

  const { customerName, customerPhone, customerEmail, serviceId, date } = parsed.data
  const appointmentDate = new Date(date)

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: { business: { include: { settings: true } } },
  })

  if (!service) {
    return apiError("Serviço não encontrado", 404)
  }

  const settings = service.business.settings
  if (settings) {
    const workHours = migrateWorkHours(settings.workHours)
    const dayName = getDayName(appointmentDate)
    const dayConfig: DayConfig | undefined = workHours[dayName]

    if (!dayConfig || dayConfig.slots.length === 0) {
      return apiError("A empresa não funciona neste dia", 400)
    }

    const timeMinutes = appointmentDate.getHours() * 60 + appointmentDate.getMinutes()
    const endMinutes = timeMinutes + service.duration

    if (isTimeInLunchBreak(timeMinutes, dayConfig) || isTimeInLunchBreak(endMinutes - 1, dayConfig)) {
      return apiError("Horário coincide com o almoço", 400)
    }

    const expandedSlots = getExpandedSlots(dayConfig)

    const withinHours = expandedSlots.some((slot) => {
      const [sH, sM] = slot.start.split(":").map(Number)
      const [eH, eM] = slot.end.split(":").map(Number)
      const slotStart = sH * 60 + sM
      const slotEnd = eH * 60 + eM
      return timeMinutes >= slotStart && endMinutes <= slotEnd
    })

    if (!withinHours) {
      return apiError("Horário fora do funcionamento", 400)
    }
  }

  const existing = await prisma.appointment.findFirst({
    where: {
      businessId: service.businessId,
      serviceId,
      date: {
        gte: new Date(appointmentDate.getTime() - service.duration * 60 * 1000),
        lt: new Date(appointmentDate.getTime() + service.duration * 60 * 1000),
      },
      status: { not: "CANCELED" },
    },
  })

  if (existing) {
    return apiError("Este horário já está ocupado", 409)
  }

  const appointment = await prisma.appointment.create({
    data: {
      customerName,
      customerPhone,
      customerEmail: customerEmail || null,
      serviceId,
      date: appointmentDate,
      businessId: service.businessId,
    },
    include: { service: true, business: { select: { name: true, slug: true } } },
  })

  const reminderAt = new Date(appointmentDate.getTime() - 30 * 60 * 1000)

  await prisma.notification.create({
    data: {
      businessId: service.businessId,
      type: "reminder",
      title: "Lembrete de Agendamento",
      message: `${customerName} tem agendamento em 30 minutos: ${service.name} às ${appointmentDate.toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
      customerPhone,
      customerName,
      scheduledAt: reminderAt,
    },
  })

  const dateStr = appointmentDate.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  sendMessage(
    customerPhone,
    `✅ *Agendamento Confirmado!*\n\n` +
    `Olá *${customerName}*, seu horário foi reservado com sucesso!\n\n` +
    `📋 *Serviço:* ${service.name}\n` +
    `⏰ *Data:* ${dateStr}\n` +
    `💰 *Valor:* R$ ${Number(service.price).toFixed(2)}\n\n` +
    `📍 *${service.business.name}*\n` +
    `🔗 ${process.env.NEXT_PUBLIC_URL || "https://agendame.app"}/${service.business.slug}\n\n` +
    `Você receberá um lembrete 30 minutos antes.`
  )

  return apiSuccess(appointment, 201)
}
