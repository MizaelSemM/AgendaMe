import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { apiError, apiSuccess } from "@/lib/utils"

export async function GET() {
  const session = await getSession()
  if (!session) return apiError("Não autorizado", 401)
  if (session.role !== "SUPER_ADMIN") return apiError("Acesso negado", 403)

  const businesses = await prisma.business.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  })

  return apiSuccess(businesses)
}
