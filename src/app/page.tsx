import { prisma } from "@/lib/prisma"
import { ScrollReveal } from "@/components/scroll-reveal"
import { LandingNav } from "@/components/landing-nav"
import Link from "next/link"

function StatItem({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="text-3xl font-bold text-white sm:text-4xl">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{label}</p>
    </div>
  )
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mx-auto mb-16 max-w-2xl text-center">
      <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-lg text-slate-400">{subtitle}</p>}
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="group rounded-2xl bg-slate-800/50 p-6 shadow-sm ring-1 ring-slate-700/50 transition-all hover:bg-slate-800 hover:ring-indigo-700/50">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/20 text-xl shadow-sm ring-1 ring-indigo-600/30">
        {icon}
      </div>
      <h3 className="mb-2 font-semibold text-slate-100">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-400">{description}</p>
    </div>
  )
}

export default async function Home() {
  const [businessCount, appointmentCount, serviceCount, businesses] = await Promise.all([
    prisma.business.count(),
    prisma.appointment.count(),
    prisma.service.count(),
    prisma.business.findMany({
      take: 6,
      where: { slug: { not: "agendame-admin" } },
      include: { _count: { select: { services: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ])

  return (
    <>
      <LandingNav />

      <main>
        {/* ──────────────── HERO ──────────────── */}
        <section className="relative flex min-h-screen items-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 pt-16">
          <div className="pointer-events-none absolute inset-0 bg-grid" />

          <div className="pointer-events-none absolute -left-32 top-1/4 h-72 w-72 animate-float rounded-full bg-indigo-600/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-32 top-1/3 h-96 w-96 animate-float-delayed rounded-full bg-violet-600/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/4 h-64 w-64 animate-float rounded-full bg-fuchsia-600/10 blur-3xl" />

          <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="animate-slide-up">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-800/50 bg-indigo-950/50 px-4 py-1.5 text-sm text-indigo-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" />
                  Plataforma completa de agendamentos
                </div>

                <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Agende.{' '}
                  <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                    Gerencie.{' '}
                  </span>
                  Cresça.
                </h1>

                <p className="mb-8 max-w-xl text-lg text-slate-400 sm:text-xl">
                  Sua empresa com agendamento online 24 horas por dia. Clientes marcam
                  horários com facilidade e você gerencia tudo em um dashboard completo.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/register"
                    className="rounded-xl bg-indigo-600 px-8 py-3.5 font-semibold text-white shadow-lg shadow-indigo-900/50 transition-all hover:bg-indigo-500 hover:shadow-xl active:scale-[0.98]"
                  >
                    Criar Conta Gratuita
                  </Link>
                  <a
                    href="#explorar"
                    className="rounded-xl border border-slate-600 bg-slate-800/50 px-8 py-3.5 font-semibold text-slate-200 shadow-sm transition-all hover:border-slate-500 hover:bg-slate-700/50 active:scale-[0.98]"
                  >
                    Explorar Serviços
                  </a>
                </div>
              </div>

              {/* Dashboard mockup */}
              <div className="hidden animate-slide-up animation-delay-200 lg:block">
                <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/80 shadow-2xl shadow-indigo-900/20">
                  <div className="flex items-center gap-2 border-b border-slate-700/50 px-4 py-3">
                    <div className="h-3 w-3 rounded-full bg-red-500/80" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                    <div className="h-3 w-3 rounded-full bg-green-500/80" />
                    <div className="ml-2 flex-1 rounded-md bg-slate-700/50 px-3 py-1.5 text-xs text-slate-500">
                      agendame.app/minha-empresa
                    </div>
                  </div>

                  <div className="flex h-80">
                    <div className="w-44 border-r border-slate-700/50 bg-slate-800/50 p-4">
                      <div className="mb-4 h-3 w-20 rounded bg-slate-700" />
                      <div className="space-y-1.5">
                        {[
                          ['📊', 'Visão Geral'],
                          ['⚡', 'Serviços'],
                          ['📅', 'Agendamentos'],
                          ['⚙️', 'Configurações'],
                        ].map(([icon, label]) => (
                          <div
                            key={label}
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-slate-400 transition hover:bg-slate-700/50"
                          >
                            <span>{icon}</span>
                            <span>{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex-1 p-4">
                      <div className="mb-4 grid grid-cols-3 gap-3">
                        {[
                          ['Agendamentos', '12'],
                          ['Serviços', '5'],
                          ['Clientes', '48'],
                        ].map(([label, value]) => (
                          <div key={label} className="rounded-xl bg-slate-700/30 p-3">
                            <div className="text-xs text-slate-500">{label}</div>
                            <div className="mt-1 text-lg font-bold text-indigo-400">{value}</div>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-xl bg-slate-700/30 p-4">
                        <div className="mb-3 text-xs font-medium text-slate-500">
                          Próximos Agendamentos
                        </div>
                        <div className="space-y-2">
                          {['09:00 - João', '10:30 - Maria', '14:00 - Pedro'].map((item) => (
                            <div key={item} className="flex items-center gap-3">
                              <div className="h-2 flex-1 rounded bg-slate-600/50" />
                              <div className="h-2 w-20 rounded bg-slate-600/50" />
                              <div className="rounded-md bg-indigo-600/50 px-3 py-1 text-xs text-indigo-200">
                                {item}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ──────────────── STATS ──────────────── */}
        <ScrollReveal>
          <section className="border-y border-slate-800/50 bg-slate-900/50">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <div className="grid grid-cols-3 gap-8 text-center">
                <StatItem value={businessCount} label="Empresas Cadastradas" />
                <StatItem value={appointmentCount} label="Agendamentos Realizados" />
                <StatItem value={serviceCount} label="Serviços Disponíveis" />
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ──────────────── HOW IT WORKS ──────────────── */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <SectionHeader
                title="Como Funciona"
                subtitle="Em três passos simples seus clientes agendam serviços"
              />
            </ScrollReveal>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  step: '01',
                  title: 'Encontre',
                  desc: 'Busque pela empresa ou serviço que precisa e veja a disponibilidade.',
                },
                {
                  step: '02',
                  title: 'Agende',
                  desc: 'Escolha o melhor horário e confirme o agendamento em segundos.',
                },
                {
                  step: '03',
                  title: 'Compareça',
                  desc: 'Receba a confirmação e lembretes. Pronto, é só comparecer!',
                },
              ].map((item, i) => (
                <ScrollReveal key={item.step} delay={i * 150}>
                  <div className="group relative rounded-2xl bg-slate-800/50 p-8 text-center shadow-sm ring-1 ring-slate-700/50 transition-all hover:bg-slate-800 hover:ring-indigo-700/50">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/20 text-sm font-bold text-indigo-400 ring-1 ring-indigo-600/30">
                      {item.step}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-slate-100">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-400">{item.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────────── FEATURES ──────────────── */}
        <section id="funcionalidades" className="border-t border-slate-800/50 bg-slate-900/50 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <SectionHeader
                title="Tudo que você precisa"
                subtitle="Ferramentas completas para gerenciar sua agenda e encantar seus clientes"
              />
            </ScrollReveal>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: '📅',
                  title: 'Agendamento Online',
                  description:
                    'Clientes marcam horários 24 horas por dia, direto do celular ou computador, sem precisar ligar.',
                },
                {
                  icon: '📊',
                  title: 'Dashboard Intuitivo',
                  description:
                    'Visão completa do seu negócio com gráficos, estatísticas e gestão de agendamentos em tempo real.',
                },
                {
                  icon: '⚡',
                  title: 'Múltiplos Serviços',
                  description:
                    'Cadastre quantos serviços quiser, cada um com duração e preço específicos.',
                },
                {
                  icon: '🔔',
                  title: 'Notificações',
                  description:
                    'Receba alertas de novos agendamentos e lembretes automáticos para seus clientes.',
                },
                {
                  icon: '🕐',
                  title: 'Horários Flexíveis',
                  description:
                    'Configure dias e horários de funcionamento. O sistema mostra apenas vagas disponíveis.',
                },
                {
                  icon: '👥',
                  title: 'Gestão de Equipe',
                  description:
                    'Adicione administradores para ajudar na gestão da sua empresa.',
                },
              ].map((feature, i) => (
                <ScrollReveal key={feature.title} delay={i * 100}>
                  <FeatureCard {...feature} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────────── FOR BUSINESSES ──────────────── */}
        <section id="para-empresas" className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <ScrollReveal>
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-800/50 bg-indigo-950/50 px-4 py-1.5 text-sm text-indigo-300">
                    Para Empresas
                  </div>
                  <h2 className="mb-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    Transforme a gestão da{' '}
                    <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                      sua empresa
                    </span>
                  </h2>
                  <p className="mb-8 text-lg text-slate-400">
                    Chega de planilhas, cadernos e clientes ligando para marcar horário.
                    Com o AgendaMe você centraliza tudo em um só lugar.
                  </p>

                  <div className="mb-8 space-y-4">
                    {[
                      'Página pública personalizada para sua empresa',
                      'Clientes agendam sem precisar de cadastro',
                      'Controle total de agenda e horários',
                      'Lembretes automáticos reduzem faltas',
                      'Relatórios e estatísticas do seu negócio',
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <svg
                          className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-slate-300">{item}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/register"
                    className="inline-block rounded-xl bg-indigo-600 px-8 py-3.5 font-semibold text-white shadow-lg shadow-indigo-900/50 transition-all hover:bg-indigo-500 hover:shadow-xl active:scale-[0.98]"
                  >
                    Quero ser Admin
                  </Link>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <div className="relative">
                  <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/50 shadow-2xl">
                    <div className="border-b border-slate-700/50 px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-lg font-bold text-white">
                          A
                        </div>
                        <div>
                          <p className="font-semibold text-slate-100">Minha Empresa</p>
                          <p className="text-xs text-slate-500">/meu-negocio</p>
                        </div>
                        <span className="ml-auto rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
                          Online
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 p-6">
                      {[
                        { name: 'Corte Masculino', duration: '40 min', price: 'R$ 45,00' },
                        { name: 'Barba', duration: '20 min', price: 'R$ 25,00' },
                        { name: 'Corte + Barba', duration: '60 min', price: 'R$ 60,00' },
                      ].map((service) => (
                        <div
                          key={service.name}
                          className="flex items-center justify-between rounded-xl bg-slate-700/30 p-4"
                        >
                          <div>
                            <p className="font-medium text-slate-100">{service.name}</p>
                            <p className="text-xs text-slate-500">{service.duration}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-indigo-400">{service.price}</p>
                            <span className="rounded-md bg-indigo-600/40 px-2 py-0.5 text-xs text-indigo-200">
                              Agendar
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ──────────────── EXPLORE ──────────────── */}
        <section id="explorar" className="border-t border-slate-800/50 bg-slate-900/50 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <SectionHeader
                title="Explorar Serviços"
                subtitle="Encontre empresas e serviços disponíveis na plataforma"
              />
            </ScrollReveal>

            {businesses.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {businesses.map((b, i) => (
                  <ScrollReveal key={b.id} delay={i * 100}>
                    <Link
                      href={`/${b.slug}`}
                      className="group block rounded-2xl bg-slate-800/50 p-6 shadow-sm ring-1 ring-slate-700/50 transition-all hover:bg-slate-800 hover:ring-indigo-700/50"
                    >
                      <div className="mb-4 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/20 text-lg font-bold text-indigo-400 ring-1 ring-indigo-600/30">
                          {b.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-100">{b.name}</h3>
                          <p className="text-xs text-slate-500">/{b.slug}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">
                          {b._count.services} servi{b._count.services === 1 ? 'ço' : 'ços'}
                        </span>
                        <span className="text-sm font-medium text-indigo-400 opacity-0 transition-opacity group-hover:opacity-100">
                          Ver serviços &rarr;
                        </span>
                      </div>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            ) : (
              <ScrollReveal>
                <div className="rounded-2xl bg-slate-800/50 p-12 text-center shadow-sm ring-1 ring-slate-700/50">
                  <div className="mb-4 text-4xl">🚀</div>
                  <p className="mb-2 text-lg font-medium text-slate-200">
                    Nenhuma empresa cadastrada ainda
                  </p>
                  <p className="mb-6 text-sm text-slate-400">
                    Seja o primeiro a cadastrar sua empresa e comece a receber agendamentos online.
                  </p>
                  <Link
                    href="/register"
                    className="inline-block rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-900/50 transition hover:bg-indigo-500"
                  >
                    Cadastrar Agora
                  </Link>
                </div>
              </ScrollReveal>
            )}
          </div>
        </section>

        {/* ──────────────── PRICING ──────────────── */}
        <section id="planos" className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <SectionHeader
                title="Planos"
                subtitle="Comece de graça e evolua conforme sua necessidade"
              />
            </ScrollReveal>

            <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
              <ScrollReveal>
                <div className="relative rounded-2xl bg-slate-800/50 p-8 shadow-sm ring-1 ring-slate-700/50 transition-all hover:ring-indigo-700/50">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white">Gratuito</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white">R$ 0</span>
                      <span className="text-slate-400">/mês</span>
                    </div>
                  </div>

                  <ul className="mb-8 space-y-3">
                    {[
                      'Agendamento online 24h',
                      'Página pública da empresa',
                      'Até 10 serviços',
                      'Dashboard completo',
                      'Notificações de novos agendamentos',
                      'Configuração de horários',
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm text-slate-300">
                        <svg className="h-4 w-4 flex-shrink-0 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/register"
                    className="block rounded-xl bg-indigo-600 py-3 text-center font-semibold text-white shadow-lg shadow-indigo-900/50 transition hover:bg-indigo-500 active:scale-[0.98]"
                  >
                    Começar Grátis
                  </Link>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <div className="relative rounded-2xl bg-gradient-to-b from-slate-800 to-slate-800/50 p-8 shadow-sm ring-1 ring-indigo-700/50">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-1 text-xs font-semibold text-white">
                    Em Breve
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white">Profissional</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white">R$ 29</span>
                      <span className="text-slate-400">/mês</span>
                    </div>
                  </div>

                  <ul className="mb-8 space-y-3">
                    {[
                      'Tudo do plano Gratuito',
                      'Serviços ilimitados',
                      'Múltiplos administradores',
                      'Lembretes via WhatsApp',
                      'Relatórios avançados',
                      'Suporte prioritário',
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm text-slate-300">
                        <svg className="h-4 w-4 flex-shrink-0 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <button
                    disabled
                    className="block w-full cursor-not-allowed rounded-xl bg-slate-700 py-3 text-center font-semibold text-slate-500"
                  >
                    Indisponível
                  </button>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ──────────────── FINAL CTA ──────────────── */}
        <section className="border-t border-slate-800/50 bg-gradient-to-b from-slate-900 to-slate-950 py-24">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <ScrollReveal>
              <h2 className="mb-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Pronto para transformar seus agendamentos?
              </h2>
              <p className="mb-10 text-lg text-slate-400">
                Cadastre sua empresa gratuitamente e comece a receber agendamentos online em minutos.
                Sem cartão de crédito, sem compromisso.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/register"
                  className="rounded-xl bg-indigo-600 px-10 py-4 font-semibold text-white shadow-lg shadow-indigo-900/50 transition-all hover:bg-indigo-500 hover:shadow-xl active:scale-[0.98]"
                >
                  Criar Conta Gratuita
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl border border-slate-600 bg-slate-800/50 px-10 py-4 font-semibold text-slate-200 shadow-sm transition-all hover:border-slate-500 hover:bg-slate-700/50 active:scale-[0.98]"
                >
                  Fazer Login
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      {/* ──────────────── FOOTER ──────────────── */}
      <footer className="border-t border-slate-800/50 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-900/50">
                  A
                </div>
                <span className="text-lg font-bold text-white">AgendaMe</span>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
                Plataforma completa de agendamentos para sua empresa. Simplifique a gestão
                de horários e ofereça uma experiência moderna para seus clientes.
              </p>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-semibold text-slate-200">Plataforma</h4>
              <ul className="space-y-3">
                {[
                  { href: '#funcionalidades', label: 'Funcionalidades' },
                  { href: '#para-empresas', label: 'Para Empresas' },
                  { href: '#planos', label: 'Planos' },
                ].map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-slate-400 transition hover:text-slate-200">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-semibold text-slate-200">Acesso</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/login" className="text-sm text-slate-400 transition hover:text-slate-200">
                    Entrar
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-sm text-slate-400 transition hover:text-slate-200">
                    Criar Conta
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-slate-800/50 pt-8 text-center text-sm text-slate-600">
            &copy; {new Date().getFullYear()} AgendaMe. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </>
  )
}
