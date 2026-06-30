"use client"

import { useEffect, useState } from "react"

export function CopyLink({ slug }: { slug: string }) {
  const [origin, setOrigin] = useState("")

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-800/50 px-4 py-3 ring-1 ring-slate-700/50">
      <span className="flex-1 text-sm font-medium text-slate-300">
        {origin || "..."}/{slug}
      </span>
      <button
        onClick={() =>
          navigator.clipboard?.writeText(`${origin}/${slug}`)
        }
        className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-500"
      >
        Copiar
      </button>
    </div>
  )
}
