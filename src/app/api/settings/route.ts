import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { apiError, apiSuccess, migrateWorkHours } from "@/lib/utils"
import { z } from "zod"

const timeSlotSchema = z.object({
  start: z.string(),
  end: z.string(),
})

const dayConfigSchema = z.object({
  slots: z.array(timeSlotSchema),
  lunchBreak: timeSlotSchema.optional(),
})

const settingsSchema = z.object({
  workHours: z.record(z.string(), dayConfigSchema),
})

export async function GET() {
  const session = await getSession()
  if (!session) return apiError("Não autorizado", 401)
  if (session.role === "SUPER_ADMIN") return apiError("Acesso negado", 403)

  const settings = await prisma.businessSettings.findUnique({
    where: { businessId: session.businessId },
  })

  const workHours = settings?.workHours ? migrateWorkHours(settings.workHours) : {}

  return apiSuccess({ workHours })
}

export async function PUT(request: Request) {
  const session = await getSession()
  if (!session) return apiError("Não autorizado", 401)
  if (session.role === "SUPER_ADMIN") return apiError("Acesso negado", 403)

  try {
    const body = await request.json()
    const parsed = settingsSchema.safeParse(body)
    if (!parsed.success) return apiError("Dados inválidos", 400)

    const settings = await prisma.businessSettings.upsert({
      where: { businessId: session.businessId },
      update: { workHours: parsed.data.workHours },
      create: {
        businessId: session.businessId,
        workHours: parsed.data.workHours,
      },
    })

    return apiSuccess(settings)
  } catch (error) {
    console.error("Update settings error:", error)
    return apiError("Erro interno do servidor", 500)
  }
}
