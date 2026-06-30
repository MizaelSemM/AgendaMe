import { prisma } from "@/lib/prisma"
import { hashPassword, createSession } from "@/lib/auth"
import { slugify, apiError, apiSuccess } from "@/lib/utils"
import { z } from "zod"

const registerSchema = z.object({
  businessName: z.string().min(2),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return apiError("Dados inválidos", 400)
    }

    const { businessName, name, email, password } = parsed.data

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return apiError("Email já cadastrado", 409)
    }

    let slug = slugify(businessName)
    const existingSlug = await prisma.business.findUnique({ where: { slug } })
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`
    }

    const hashedPassword = await hashPassword(password)

    const business = await prisma.business.create({
      data: {
        name: businessName,
        slug,
        users: {
          create: {
            name,
            email,
            password: hashedPassword,
          },
        },
      },
      include: { users: true },
    })

    await createSession(business.users[0].id, business.id, "ADMIN")

    return apiSuccess({
      business: { id: business.id, name: business.name, slug: business.slug },
      user: { id: business.users[0].id, name: business.users[0].name, email: business.users[0].email },
    }, 201)
  } catch (error) {
    console.error("Register error:", error)
    return apiError("Erro interno do servidor", 500)
  }
}
