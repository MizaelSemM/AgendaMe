import { verifyAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

type NavItem = { href: string; label: string; icon: string }

const adminNavItems: NavItem[] = [
  { href: "/dashboard", label: "Visão Geral", icon: "📊" },
  { href: "/dashboard/services", label: "Serviços", icon: "⚡" },
  { href: "/dashboard/appointments", label: "Agendamentos", icon: "📅" },
  { href: "/dashboard/settings", label: "Configurações", icon: "⚙️" },
]

const superAdminNavItems: NavItem[] = [
  { href: "/dashboard", label: "Visão Geral", icon: "📊" },
  { href: "/dashboard/users", label: "Usuários", icon: "👥" },
]

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await verifyAuth()

  const business = await prisma.business.findUnique({
    where: { id: session.businessId },
    select: { name: true, slug: true },
  })

  const isSuperAdmin = session.role === "SUPER_ADMIN"
  const navItems = isSuperAdmin ? superAdminNavItems : adminNavItems

  return (
    <div className="flex min-h-screen bg-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-700/50 bg-slate-800">
        <div className="flex h-16 items-center gap-3 border-b border-slate-700/50 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-900/50">
            A
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-slate-200">{business?.name}</p>
            <p className="text-xs text-slate-500">/{business?.slug}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-slate-700/50 hover:text-slate-200"
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-slate-700/50 p-4">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-sm font-medium text-slate-300">
              A
            </div>
            <div className="flex-1 leading-tight">
              <p className="text-sm font-medium text-slate-200">
                {isSuperAdmin ? "Super Admin" : "Admin"}
              </p>
            </div>
            <form action="/api/logout" method="POST">
              <button className="text-xs text-slate-500 underline transition hover:text-red-400">
                Sair
              </button>
            </form>
          </div>
        </div>
      </aside>

      <main className="ml-64 flex-1">
        <div className="animate-fade-in">{children}</div>
      </main>
    </div>
  )
}
