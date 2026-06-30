import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcrypt"

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
})

async function main() {
  const email = "admin@agendame.com"
  const existing = await prisma.user.findUnique({ where: { email } })

  if (existing) {
    console.log("Super admin já existe:", email)
    return
  }

  const business = await prisma.business.upsert({
    where: { slug: "agendame-admin" },
    update: {},
    create: {
      name: "AgendaMe Admin",
      slug: "agendame-admin",
      plan: "PRO",
    },
  })

  const hashedPassword = await bcrypt.hash("admin123", 10)

  const user = await prisma.user.create({
    data: {
      name: "Super Admin",
      email,
      password: hashedPassword,
      role: "SUPER_ADMIN",
      businessId: business.id,
    },
  })

  console.log(`Super admin criado: ${user.email} / senha: admin123`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
