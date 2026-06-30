"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"

type Appointment = {
  id: number
  customerName: string
  customerPhone: string
  customerEmail: string | null
  date: string
  status: string
  service: { id: number; name: string; duration: number; price: number }
  business: { id: number; name: string; slug: string }
}

export default function SuccessPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const id = searchParams.get("id")

  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [cancelMessage, setCancelMessage] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/appointments/public?id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        setAppointment(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  async function handleCancel() {
    if (!id) return
    setCancelling(true)
    try {
      const res = await fetch(`/api/appointments/public?id=${id}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (res.ok) {
        setCancelMessage("Agendamento cancelado com sucesso")
        setAppointment((prev) => prev ? { ...prev, status: "CANCELED" } : null)
        setShowConfirm(false)
      } else {
        setCancelMessage(data.error || "Erro ao cancelar")
      }
    } catch {
      setCancelMessage("Erro ao cancelar agendamento")
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="inline-block h-4 w-4 animate-pulse rounded-full bg-indigo-500" />
          Carregando...
        </div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 px-4">
        <div className="animate-scale-in w-full max-w-md rounded-2xl bg-slate-800 p-8 text-center shadow-xl ring-1 ring-slate-700/50">
          <h1 className="mb-2 text-2xl font-bold text-slate-100">
            Agendamento não encontrado
          </h1>
          <Link
            href="/"
            className="mt-4 inline-block rounded-xl bg-indigo-600 px-6 py-2.5 font-medium text-white transition hover:bg-indigo-500"
          >
            Voltar
          </Link>
        </div>
      </div>
    )
  }

  const appointmentDate = new Date(appointment.date)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 px-4 py-8">
      <div className="animate-scale-in w-full max-w-lg">
        <div className="rounded-2xl bg-slate-800 p-8 shadow-xl ring-1 ring-slate-700/50">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-slate-200"
          >
            <span className="text-lg">&larr;</span>
            Voltar
          </Link>

          <div className="mb-6 text-center">
            <div
              className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                appointment.status === "CANCELED"
                  ? "bg-red-900/50"
                  : "bg-emerald-900/50"
              }`}
            >
              <span
                className={`text-3xl ${
                  appointment.status === "CANCELED"
                    ? "text-red-400"
                    : "text-emerald-400"
                }`}
              >
                {appointment.status === "CANCELED" ? "✕" : "✓"}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100">
              {appointment.status === "CANCELED"
                ? "Agendamento Cancelado"
                : "Agendamento Confirmado!"}
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              {appointment.business.name}
            </p>
          </div>

          <div className="mb-6 space-y-4 rounded-xl bg-slate-900/50 p-5 ring-1 ring-slate-700/50">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-900/30 text-lg">
                📋
              </div>
              <div>
                <p className="text-xs text-slate-500">Serviço</p>
                <p className="font-semibold text-slate-100">
                  {appointment.service.name}
                </p>
                <p className="text-xs text-slate-400">
                  {appointment.service.duration} min • R${" "}
                  {Number(appointment.service.price).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-900/30 text-lg">
                📅
              </div>
              <div>
                <p className="text-xs text-slate-500">Data e Horário</p>
                <p className="font-semibold text-slate-100">
                  {appointmentDate.toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="text-sm text-indigo-400">
                  às{" "}
                  {appointmentDate.toLocaleString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-700/50 text-lg">
                👤
              </div>
              <div>
                <p className="text-xs text-slate-500">Cliente</p>
                <p className="font-semibold text-slate-100">
                  {appointment.customerName}
                </p>
                <p className="text-xs text-slate-400">
                  {appointment.customerPhone}
                </p>
                {appointment.customerEmail && (
                  <p className="text-xs text-slate-400">
                    {appointment.customerEmail}
                  </p>
                )}
              </div>
            </div>
          </div>

          {appointment.status === "CONFIRMED" && !showConfirm && (
            <div className="rounded-xl bg-amber-900/20 px-4 py-3 text-center text-sm text-amber-400 ring-1 ring-amber-800/30">
              Você receberá um lembrete 30 minutos antes do horário marcado.
            </div>
          )}

          {cancelMessage && (
            <div
              className={`mb-4 rounded-xl px-4 py-3 text-center text-sm ring-1 ${
                appointment.status === "CANCELED"
                  ? "bg-emerald-900/30 text-emerald-400 ring-emerald-800/30"
                  : "bg-red-900/30 text-red-400 ring-red-800/30"
              }`}
            >
              {cancelMessage}
            </div>
          )}

          {appointment.status === "CONFIRMED" && !showConfirm && (
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/"
                className="block rounded-xl bg-indigo-600 px-8 py-2.5 text-center font-medium text-white transition hover:bg-indigo-500"
              >
                Voltar
              </Link>
              <button
                onClick={() => setShowConfirm(true)}
                className="block rounded-xl border border-red-800/50 px-8 py-2.5 text-center text-sm font-medium text-red-400 transition hover:bg-red-950/50"
              >
                Cancelar Agendamento
              </button>
            </div>
          )}

          {showConfirm && (
            <div className="mt-6 space-y-3">
              <div className="rounded-xl bg-red-900/20 px-4 py-3 text-center text-sm text-red-400 ring-1 ring-red-800/30">
                Tem certeza que deseja cancelar este agendamento?
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 rounded-xl border border-slate-600 px-8 py-2.5 text-center font-medium text-slate-300 transition hover:bg-slate-700/50"
                >
                  Não, manter
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1 rounded-xl bg-red-600 px-8 py-2.5 text-center font-medium text-white transition hover:bg-red-500 disabled:opacity-50"
                >
                  {cancelling ? "Cancelando..." : "Sim, cancelar"}
                </button>
              </div>
            </div>
          )}

          {appointment.status === "CANCELED" && (
            <div className="mt-6 text-center">
              <Link
                href="/"
                className="inline-block rounded-xl bg-indigo-600 px-8 py-2.5 font-medium text-white transition hover:bg-indigo-500"
              >
                Voltar
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
