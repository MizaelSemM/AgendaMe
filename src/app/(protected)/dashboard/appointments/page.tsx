"use client"

import { useEffect, useState } from "react"

type Appointment = {
  id: number
  customerName: string
  customerPhone: string
  date: string
  status: string
  service: { name: string }
}

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  CONFIRMED: {
    label: "Confirmado",
    bg: "bg-blue-900/30",
    text: "text-blue-400",
    dot: "bg-blue-500",
  },
  CANCELED: {
    label: "Cancelado",
    bg: "bg-red-900/30",
    text: "text-red-400",
    dot: "bg-red-500",
  },
  DONE: {
    label: "Concluído",
    bg: "bg-emerald-900/30",
    text: "text-emerald-400",
    dot: "bg-emerald-500",
  },
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [notification, setNotification] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  async function loadAppointments() {
    const res = await fetch("/api/appointments", { credentials: "include" })
    if (res.ok) setAppointments(await res.json())
  }

  useEffect(() => {
    loadAppointments()
  }, [])

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  async function updateStatus(id: number, status: string) {
    const res = await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
      credentials: "include",
    })
    if (res.ok) loadAppointments()
  }

  async function cancelAppointment(id: number) {
    setConfirmDeleteId(null)
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (res.ok) {
        setNotification("Agendamento cancelado com sucesso")
        loadAppointments()
      } else {
        const data = await res.json().catch(() => ({}))
        setNotification(data.error || "Erro ao cancelar agendamento")
      }
    } catch {
      setNotification("Erro de conexão ao cancelar agendamento")
    }
  }

  async function deleteAppointment(id: number) {
    setConfirmDeleteId(null)
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (res.ok) {
        setNotification("Agendamento excluído permanentemente")
        loadAppointments()
      } else {
        const data = await res.json().catch(() => ({}))
        setNotification(data.error || "Erro ao excluir agendamento")
      }
    } catch {
      setNotification("Erro de conexão ao excluir agendamento")
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Agendamentos</h1>
        <p className="mt-1 text-sm text-slate-400">
          Acompanhe e gerencie todos os agendamentos
        </p>
      </div>

      {notification && (
        <div
          className={`mb-6 animate-slide-up rounded-xl px-5 py-3 text-sm font-medium ring-1 ${
            notification.startsWith("Erro")
              ? "bg-red-900/30 text-red-400 ring-red-800/30"
              : "bg-emerald-900/30 text-emerald-400 ring-emerald-800/30"
          }`}
        >
          {notification}
        </div>
      )}

      <div className="space-y-3">
        {appointments.map((apt) => {
          const config = statusConfig[apt.status] || statusConfig.CONFIRMED
          return (
            <div key={apt.id} className="animate-slide-up rounded-2xl bg-slate-800 p-5 shadow-sm ring-1 ring-slate-700/50">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-700/50 text-lg">
                    👤
                  </div>
                  <div>
                    <p className="font-semibold text-slate-100">{apt.customerName}</p>
                    <p className="mt-0.5 text-sm text-slate-400">{apt.service.name}</p>
                    <p className="text-sm text-slate-500">
                      {new Date(apt.date).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-sm text-slate-500">{apt.customerPhone}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full ${config.bg} px-3 py-1 text-xs font-medium ${config.text} ring-1 ring-inset ring-slate-700/50`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                    {config.label}
                  </span>

                  {apt.status === "CONFIRMED" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(apt.id, "DONE")}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-500"
                      >
                        Concluir
                      </button>
                      <button
                        onClick={() => cancelAppointment(apt.id)}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-500"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}

                  {(apt.status === "CANCELED" || apt.status === "DONE") && (
                    <div>
                      {confirmDeleteId === apt.id ? (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => deleteAppointment(apt.id)}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-500"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700/50"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(apt.id)}
                          className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-slate-600 hover:text-slate-200"
                        >
                          Excluir
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        {appointments.length === 0 && (
          <div className="rounded-2xl bg-slate-800 p-8 text-center shadow-sm ring-1 ring-slate-700/50">
            <p className="text-sm text-slate-400">Nenhum agendamento encontrado.</p>
          </div>
        )}
      </div>
    </div>
  )
}
