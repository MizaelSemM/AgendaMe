"use client"

import { useActionState } from "react"

async function login(_prev: unknown, formData: FormData) {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: formData.get("email"),
      password: formData.get("password"),
    }),
  })

  if (!res.ok) {
    const data = await res.json()
    return { error: data.error || "Erro ao entrar" }
  }

  window.location.href = "/dashboard"
  return {}
}

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 px-4">
      <div className="animate-slide-up w-full max-w-md">
        <div className="rounded-2xl bg-slate-800 p-8 shadow-xl ring-1 ring-slate-700/50">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-900/50">
              <span className="text-xl font-bold text-white">A</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Entrar</h1>
            <p className="mt-1 text-sm text-slate-400">
              Acesse sua conta AgendaMe
            </p>
          </div>

          <form action={action} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-300">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="rounded-xl border border-slate-600 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-200 transition-colors placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-900/50"
                placeholder="seu@email.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-slate-300">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="rounded-xl border border-slate-600 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-200 transition-colors placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-900/50"
                placeholder="••••••••"
              />
            </div>

            {state?.error && (
              <div className="animate-scale-in rounded-xl bg-red-900/50 px-4 py-3 text-sm text-red-400 ring-1 ring-red-800/50">
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white shadow-lg shadow-indigo-900/50 transition-all hover:bg-indigo-500 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Não tem conta?{" "}
            <a href="/register" className="font-medium text-indigo-400 transition hover:text-indigo-300">
              Cadastre-se
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
