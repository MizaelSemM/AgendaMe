"use client"

import { useEffect, useState } from "react"

type Service = {
  id: number
  name: string
  duration: number
  price: number
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [name, setName] = useState("")
  const [duration, setDuration] = useState("")
  const [price, setPrice] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState("")
  const [editDuration, setEditDuration] = useState("")
  const [editPrice, setEditPrice] = useState("")
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  async function loadServices() {
    const res = await fetch("/api/services")
    if (res.ok) setServices(await res.json())
  }

  useEffect(() => {
    loadServices()
  }, [])

  async function addService(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        duration: parseInt(duration),
        price: parseFloat(price),
      }),
    })
    if (res.ok) {
      setName("")
      setDuration("")
      setPrice("")
      loadServices()
    }
  }

  function startEdit(service: Service) {
    setEditingId(service.id)
    setEditName(service.name)
    setEditDuration(String(service.duration))
    setEditPrice(String(service.price))
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function saveEdit(id: number) {
    const res = await fetch(`/api/services/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName,
        duration: parseInt(editDuration),
        price: parseFloat(editPrice),
      }),
    })
    if (res.ok) {
      cancelEdit()
      loadServices()
    }
  }

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  async function deleteService(id: number) {
    setConfirmDeleteId(null)
    try {
      const res = await fetch(`/api/services/${id}/delete`, {
        method: "POST",
        credentials: "include",
      })
      if (res.ok) {
        setNotification({ type: "success", text: "Serviço removido com sucesso" })
        loadServices()
      } else {
        const data = await res.json().catch(() => ({}))
        setNotification({ type: "error", text: data.error || "Erro ao remover serviço" })
      }
    } catch {
      setNotification({ type: "error", text: "Erro de conexão ao remover serviço" })
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Serviços</h1>
        <p className="mt-1 text-sm text-slate-400">
          Gerencie os serviços oferecidos pela sua empresa
        </p>
      </div>

      {notification && (
        <div
          className={`mb-6 animate-slide-up rounded-xl px-5 py-3 text-sm font-medium ring-1 ${
            notification.type === "success"
              ? "bg-emerald-900/30 text-emerald-400 ring-emerald-800/30"
              : "bg-red-900/30 text-red-400 ring-red-800/30"
          }`}
        >
          {notification.text}
        </div>
      )}

      <div className="mb-8 rounded-2xl bg-slate-800 p-6 shadow-sm ring-1 ring-slate-700/50">
        <h2 className="mb-4 text-lg font-semibold text-slate-100">Novo Serviço</h2>
        <form onSubmit={addService} className="flex flex-col gap-4 sm:flex-row">
          <input
            placeholder="Nome do serviço"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="flex-1 rounded-xl border border-slate-600 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-200 transition-colors placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-900/50"
          />
          <input
            placeholder="Duração (min)"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
            className="w-36 rounded-xl border border-slate-600 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-200 transition-colors placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-900/50"
          />
          <input
            placeholder="Preço (R$)"
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="w-32 rounded-xl border border-slate-600 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-200 transition-colors placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-900/50"
          />
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-6 py-2.5 font-medium text-white shadow-sm transition hover:bg-indigo-500 active:scale-[0.98]"
          >
            Adicionar
          </button>
        </form>
      </div>

      <div className="space-y-3">
        {services.map((service) => (
          <div key={service.id} className="animate-slide-up rounded-2xl bg-slate-800 shadow-sm ring-1 ring-slate-700/50">
            <div className="flex items-center justify-between p-5">
              <div>
                <p className="font-semibold text-slate-100">{service.name}</p>
                <p className="mt-0.5 text-sm text-slate-400">
                  {service.duration} min • R$ {Number(service.price).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => startEdit(service)}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-400 transition hover:bg-slate-700/50"
                >
                  Editar
                </button>
                {confirmDeleteId === service.id ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => deleteService(service.id)}
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
                    onClick={() => setConfirmDeleteId(service.id)}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-400 transition hover:bg-slate-700/50"
                  >
                    Remover
                  </button>
                )}
              </div>
            </div>

            {editingId === service.id && (
              <div className="flex flex-col gap-3 border-t border-slate-700/50 p-5 sm:flex-row">
                <input
                  placeholder="Nome"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-600 bg-slate-900/50 px-4 py-2 text-sm text-slate-200 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-900/50"
                />
                <input
                  placeholder="Duração (min)"
                  type="number"
                  value={editDuration}
                  onChange={(e) => setEditDuration(e.target.value)}
                  className="w-36 rounded-xl border border-slate-600 bg-slate-900/50 px-4 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-900/50"
                />
                <input
                  placeholder="Preço"
                  type="number"
                  step="0.01"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-32 rounded-xl border border-slate-600 bg-slate-900/50 px-4 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-900/50"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(service.id)}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700/50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {services.length === 0 && (
          <div className="rounded-2xl bg-slate-800 p-8 text-center shadow-sm ring-1 ring-slate-700/50">
            <p className="text-sm text-slate-400">Nenhum serviço cadastrado ainda.</p>
          </div>
        )}
      </div>
    </div>
  )
}
