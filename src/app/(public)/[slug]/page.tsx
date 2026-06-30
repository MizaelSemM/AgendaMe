import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"

export default async function BusinessPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const business = await prisma.business.findUnique({
    where: { slug },
    include: { services: true },
  })

  if (!business) notFound()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-slate-200"
        >
          <span className="text-lg">&larr;</span>
          Voltar
        </Link>

        <div className="animate-slide-up text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-900/50">
            <span className="text-2xl font-bold text-white">
              {business.name.charAt(0)}
            </span>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-slate-100">
            {business.name}
          </h1>
          <p className="mb-10 text-slate-400">Agende seu horário conosco</p>
        </div>

        <div className="space-y-3">
          {business.services.map((service, i) => (
            <div
              key={service.id}
              className="animate-slide-up group rounded-2xl bg-slate-800 p-5 shadow-sm ring-1 ring-slate-700/50 transition-all hover:ring-indigo-700/50"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-100">{service.name}</p>
                  <p className="mt-0.5 text-sm text-slate-400">
                    {service.duration} min
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-indigo-400">
                    R$ {Number(service.price).toFixed(2)}
                  </p>
                  <Link
                    href={`/${slug}/book?serviceId=${service.id}`}
                    className="mt-1 inline-block rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-500"
                  >
                    Agendar
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {business.services.length === 0 && (
          <div className="animate-fade-in rounded-2xl bg-slate-800 p-8 text-center shadow-sm ring-1 ring-slate-700/50">
            <p className="text-slate-400">
              Nenhum serviço disponível no momento.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
