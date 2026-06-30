import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { apiError, apiSuccess } from "@/lib/utils"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return apiError("Não autorizado", 401)
  if (session.role !== "SUPER_ADMIN") return apiError("Acesso negado", 403)

  const { id } = await params
  const userId = parseInt(id)

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return apiError("Usuário não encontrado", 404)
  if (user.role === "SUPER_ADMIN") return apiError("Não é possível remover o super admin", 403)

  try {
    await prisma.user.delete({ where: { id: userId } })
    return apiSuccess({ message: "Usuário removido" })
  } catch (error) {
    console.error("Delete user error:", error)
    return apiError("Erro interno do servidor", 500)
  }
}
