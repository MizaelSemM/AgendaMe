"use client"

import { useEffect, useState } from "react"

type User = {
  id: number
  name: string
  email: string
  role: string
  businessId: number
  createdAt: string
  business: { name: string; slug: string }
}

type Business = {
  id: number
  name: string
  slug: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [selectedBusinessId, setSelectedBusinessId] = useState("")
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  async function loadUsers() {
    const res = await fetch("/api/users")
    if (res.ok) setUsers(await res.json())
  }

  async function loadBusinesses() {
    const res = await fetch("/api/users/businesses")
    if (res.ok) setBusinesses(await res.json())
  }

  useEffect(() => {
    loadUsers()
    loadBusinesses()
  }, [])

  async function addUser(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedBusinessId) {
      setNotification({ type: "error", text: "Selecione uma empresa" })
      return
    }
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        businessId: parseInt(selectedBusinessId),
      }),
    })
    if (res.ok) {
      setName("")
      setEmail("")
      setPassword("")
      setSelectedBusinessId("")
      setNotification({ type: "success", text: "Administrador criado com sucesso" })
      loadUsers()
    } else {
      const data = await res.json().catch(() => ({}))
      setNotification({ type: "error", text: data.error || "Erro ao criar administrador" })
    }
  }

  async function deleteUser(id: number) {
    setConfirmDeleteId(null)
    const res = await fetch(`/api/users/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
    if (res.ok) {
      setNotification({ type: "success", text: "Administrador removido" })
      loadUsers()
    } else {
      const data = await res.json().catch(() => ({}))
      setNotification({ type: "error", text: data.error || "Erro ao remover administrador" })
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Usuários</h1>
        <p className="mt-1 text-sm text-slate-400">
          Gerencie todos os administradores da plataforma
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
        <h2 className="mb-4 text-lg font-semibold text-slate-100">Novo Administrador</h2>
        <form onSubmit={addUser} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              placeholder="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="rounded-xl border border-slate-600 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-200 transition-colors placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-900/50"
            />
            <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-xl border border-slate-600 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-200 transition-colors placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-900/50"
            />
            <input
              placeholder="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-xl border border-slate-600 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-200 transition-colors placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-900/50"
            />
            <select
              value={selectedBusinessId}
              onChange={(e) => setSelectedBusinessId(e.target.value)}
              required
              className="rounded-xl border border-slate-600 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-200 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-900/50"
            >
              <option value="">Selecione uma empresa</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} (/{b.slug})
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="self-start rounded-xl bg-indigo-600 px-6 py-2.5 font-medium text-white shadow-sm transition hover:bg-indigo-500 active:scale-[0.98]"
          >
            Adicionar
          </button>
        </form>
      </div>

      <div className="space-y-3">
        {users.map((user) => (
          <div key={user.id} className="animate-slide-up rounded-2xl bg-slate-800 p-5 shadow-sm ring-1 ring-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-700/50 text-lg">
                  👤
                </div>
                <div>
                  <p className="font-semibold text-slate-100">
                    {user.name}
                    {user.role === "SUPER_ADMIN" && (
                      <span className="ml-2 rounded-full bg-indigo-900/30 px-2 py-0.5 text-xs font-medium text-indigo-400">
                        SUPER ADMIN
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-slate-400">{user.email}</p>
                  <p className="text-xs text-slate-500">
                    {user.business.name} /{user.business.slug}
                  </p>
                </div>
              </div>

              {user.role !== "SUPER_ADMIN" && (
                <div>
                  {confirmDeleteId === user.id ? (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => deleteUser(user.id)}
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
                      onClick={() => setConfirmDeleteId(user.id)}
                      className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-400 transition hover:bg-slate-700/50"
                    >
                      Remover
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <div className="rounded-2xl bg-slate-800 p-8 text-center shadow-sm ring-1 ring-slate-700/50">
            <p className="text-sm text-slate-400">Nenhum administrador encontrado.</p>
          </div>
        )}
      </div>
    </div>
  )
}
