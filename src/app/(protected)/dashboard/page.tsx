import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"
import { CopyLink } from "@/components/copy-link"
import { NotificationList } from "@/components/notification-list"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await verifyAuth()
  const isSuperAdmin = session.role === "SUPER_ADMIN"

  const business = await prisma.business.findUnique({
    where: { id: session.businessId },
    include: {
      _count: { select: { services: true, appointments: true } },
    },
  })

  let totalAdmins = 0
  let totalBusinesses = 0

  if (isSuperAdmin) {
    const [adminCount, businessCount] = await Promise.all([
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.business.count(),
    ])
    totalAdmins = adminCount
    totalBusinesses = businessCount
  }

  const notifications = await prisma.notification.findMany({
    where: { businessId: session.businessId },
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Visão Geral</h1>
        <p className="mt-1 text-sm text-slate-400">
          {isSuperAdmin
            ? "Painel de administração da plataforma"
            : "Bem-vindo ao painel da sua empresa"}
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isSuperAdmin ? (
          <>
            <Link href="/dashboard/users">
              <div className="animate-slide-up group rounded-2xl bg-slate-800 p-6 shadow-sm ring-1 ring-slate-700/50 transition-all hover:ring-slate-600">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-900/30">
                    <span className="text-xl font-bold text-indigo-400">{totalAdmins}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-400">Administradores</p>
                    <p className="text-2xl font-bold text-slate-100">{totalAdmins}</p>
                  </div>
                </div>
              </div>
            </Link>
            <div className="animate-slide-up animation-delay-100 rounded-2xl bg-slate-800 p-6 shadow-sm ring-1 ring-slate-700/50">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-900/30">
                  <span className="text-xl font-bold text-emerald-400">{totalBusinesses}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">Empresas</p>
                  <p className="text-2xl font-bold text-slate-100">{totalBusinesses}</p>
                </div>
              </div>
            </div>
            <div className="animate-slide-up animation-delay-200 rounded-2xl bg-slate-800 p-6 shadow-sm ring-1 ring-slate-700/50">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-900/30">
                  <span className="text-xl text-amber-400">👥</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">Função</p>
                  <p className="text-2xl font-bold text-slate-100">Super Admin</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <Link href="/dashboard/services">
              <div className="animate-slide-up group rounded-2xl bg-slate-800 p-6 shadow-sm ring-1 ring-slate-700/50 transition-all hover:ring-slate-600">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-900/30">
                    <span className="text-xl font-bold text-indigo-400">
                      {business?._count.services ?? 0}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-400">Serviços</p>
                    <p className="text-2xl font-bold text-slate-100">{business?._count.services ?? 0}</p>
                  </div>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/appointments">
              <div className="animate-slide-up animation-delay-100 group rounded-2xl bg-slate-800 p-6 shadow-sm ring-1 ring-slate-700/50 transition-all hover:ring-slate-600">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-900/30">
                    <span className="text-xl font-bold text-emerald-400">
                      {business?._count.appointments ?? 0}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-400">Agendamentos</p>
                    <p className="text-2xl font-bold text-slate-100">{business?._count.appointments ?? 0}</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href={`/${business?.slug}`} target="_blank">
              <div className="animate-slide-up animation-delay-200 group flex h-full items-center gap-4 rounded-2xl bg-slate-800 p-6 shadow-sm ring-1 ring-slate-700/50 transition-all hover:ring-slate-600">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-900/30">
                  <span className="text-xl text-amber-400">🔗</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">Link Público</p>
                  <p className="text-sm font-semibold text-slate-200 group-hover:text-indigo-400">
                    /{business?.slug}
                  </p>
                </div>
              </div>
            </Link>
          </>
        )}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-slate-800 p-6 shadow-sm ring-1 ring-slate-700/50">
          <h2 className="mb-1 text-lg font-semibold text-slate-100">
            Seu link de agendamento
          </h2>
          <p className="mb-4 text-sm text-slate-400">
            Compartilhe com seus clientes para eles agendarem online
          </p>
          <CopyLink slug={business?.slug ?? ""} />
        </div>

        <NotificationList
          notifications={notifications.map((n) => ({
            id: n.id,
            type: n.type,
            title: n.title,
            message: n.message,
            read: n.read,
            sentAt: n.sentAt?.toISOString() ?? null,
            createdAt: n.createdAt.toISOString(),
          }))}
          unreadCount={unreadCount}
        />
      </div>
    </div>
  )
}
