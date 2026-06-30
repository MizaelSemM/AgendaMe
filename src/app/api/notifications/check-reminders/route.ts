import { prisma } from "@/lib/prisma"
import { sendMessage, formatPhone } from "@/lib/whatsapp"
import { apiSuccess } from "@/lib/utils"

export async function GET() {
  const now = new Date()
  const startOfMinute = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0)
  const endOfMinute = new Date(startOfMinute.getTime() + 60 * 1000)

  const pending = await prisma.notification.findMany({
    where: {
      type: "reminder",
      sentAt: null,
      scheduledAt: {
        gte: startOfMinute,
        lt: endOfMinute,
      },
    },
  })

  let sent = 0

  for (const notification of pending) {
    if (notification.customerPhone) {
      const sent_ok = await sendMessage(
        notification.customerPhone,
        `⏰ *Lembrete de Agendamento!*\n\n` +
        `Olá *${notification.customerName || "cliente"}*!\n\n` +
        `Seu horário é em *30 minutos*!\n\n` +
        `${notification.message}\n\n` +
        `Não se atrase! 😊`
      )

      if (sent_ok) sent++
    }

    await prisma.notification.update({
      where: { id: notification.id },
      data: { sentAt: now },
    })
  }

  return apiSuccess({
    checked: now.toISOString(),
    sent,
    total: pending.length,
  })
}
