"use client"

import { useActionState, useState, useEffect, useCallback } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"

export default function BookPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const serviceId = searchParams.get("serviceId")
  const slug = params.slug as string

  const [selectedDate, setSelectedDate] = useState("")
  const [slots, setSlots] = useState<string[]>([])
  const [selectedTime, setSelectedTime] = useState("")
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  const minDate = new Date().toISOString().slice(0, 10)

  const loadSlots = useCallback(async (date: string) => {
    if (!date) return
    setLoadingSlots(true)
    setSelectedTime("")
    try {
      const res = await fetch(
        `/api/appointments/slots?slug=${slug}&date=${date}&serviceId=${serviceId}`
      )
      if (res.ok) {
        const data = await res.json()
        setSlots(data.slots)
      }
    } finally {
      setLoadingSlots(false)
    }
  }, [slug, serviceId])

  useEffect(() => {
    loadSlots(selectedDate)
  }, [selectedDate, loadSlots])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setPending(true)

    const form = e.currentTarget
    const formData = new FormData(form)
    const dateStr = formData.get("date") as string
    const timeStr = formData.get("time") as string
    const combinedDate = `${dateStr}T${timeStr}:00`

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.get("customerName"),
          customerPhone: formData.get("customerPhone"),
          customerEmail: formData.get("customerEmail"),
          serviceId: Number(formData.get("serviceId")),
          date: combinedDate,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Erro ao agendar")
        return
      }

      router.push(`/${slug}/book/success?id=${data.id}`)
    } catch {
      setError("Erro ao conectar com o servidor")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 px-4 py-8">
      <div className="animate-slide-up w-full max-w-md">
        <div className="rounded-2xl bg-slate-800 p-8 shadow-xl ring-1 ring-slate-700/50">
          <button
            type="button"
            onClick={() => router.push(`/${slug}`)}
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-slate-200"
          >
            <span className="text-lg">&larr;</span>
            Voltar
          </button>

          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-900/50">
              <span className="text-xl font-bold text-white">A</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100">
              Agendar Horário
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <input type="hidden" name="serviceId" value={serviceId || ""} />
            <input type="hidden" name="time" value={selectedTime} />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="customerName" className="text-sm font-medium text-slate-300">
                Nome
              </label>
              <input
                id="customerName"
                name="customerName"
                required
                className="rounded-xl border border-slate-600 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-200 transition-colors placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-900/50"
                placeholder="Seu nome"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="customerPhone" className="text-sm font-medium text-slate-300">
                Telefone
              </label>
              <input
                id="customerPhone"
                name="customerPhone"
                required
                className="rounded-xl border border-slate-600 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-200 transition-colors placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-900/50"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="customerEmail" className="text-sm font-medium text-slate-300">
                Email <span className="text-slate-500">(opcional)</span>
              </label>
              <input
                id="customerEmail"
                name="customerEmail"
                type="email"
                className="rounded-xl border border-slate-600 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-200 transition-colors placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-900/50"
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="date" className="text-sm font-medium text-slate-300">
                Data
              </label>
              <input
                id="date"
                name="date"
                type="date"
                required
                min={minDate}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-xl border border-slate-600 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-200 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-900/50"
              />
            </div>

            {selectedDate && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">Horário</label>
                {loadingSlots ? (
                  <div className="flex items-center justify-center rounded-xl bg-slate-800/50 py-6">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <span className="inline-block h-4 w-4 animate-pulse rounded-full bg-indigo-500" />
                      Carregando horários...
                    </div>
                  </div>
                ) : slots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-all active:scale-[0.97] ${
                          selectedTime === time
                            ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                            : "border-slate-600 bg-slate-900/50 text-slate-300 hover:border-indigo-700 hover:bg-slate-700/50"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl bg-amber-900/30 px-4 py-3 text-sm text-amber-400 ring-1 ring-amber-800/50">
                    Nenhum horário disponível nesta data.
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="animate-scale-in rounded-xl bg-red-900/50 px-4 py-3 text-sm text-red-400 ring-1 ring-red-800/50">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending || !selectedTime}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white shadow-lg shadow-indigo-900/50 transition-all hover:bg-indigo-500 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? "Agendando..." : "Confirmar Agendamento"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
