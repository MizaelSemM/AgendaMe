import { prisma } from "@/lib/prisma"
import { apiError, apiSuccess, getDayName, generateTimeSlots, migrateWorkHours, getExpandedSlots, type DayConfig } from "@/lib/utils"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get("slug")
  const dateStr = searchParams.get("date")
  const serviceIdParam = searchParams.get("serviceId")

  if (!slug || !dateStr) {
    return apiError("slug e date são obrigatórios", 400)
  }

  const business = await prisma.business.findUnique({
    where: { slug },
    include: {
      settings: true,
      services: { select: { id: true, duration: true } },
    },
  })

  if (!business) {
    return apiError("Empresa não encontrada", 404)
  }

  const date = new Date(dateStr + "T00:00:00")
  const dayName = getDayName(date)

  const workHours = migrateWorkHours(business.settings?.workHours)
  const dayConfig: DayConfig | undefined = workHours[dayName]

  if (!dayConfig || dayConfig.slots.length === 0) {
    return apiSuccess({ slots: [], date: dateStr, day: dayName })
  }

  const serviceId = serviceIdParam ? parseInt(serviceIdParam) : null
  const service = serviceId
    ? business.services.find((s) => s.id === serviceId)
    : null
  const duration = service?.duration ?? Math.min(...business.services.map((s) => s.duration))

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      businessId: business.id,
      date: {
        gte: date,
        lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
      },
      status: { not: "CANCELED" },
    },
    select: { date: true },
  })

  const expandedSlots = getExpandedSlots(dayConfig)

  const allSlots = expandedSlots.flatMap((slot) =>
    generateTimeSlots(slot.start, slot.end, duration, existingAppointments)
  )

  return apiSuccess({ slots: [...new Set(allSlots)], date: dateStr, day: dayName })
}
