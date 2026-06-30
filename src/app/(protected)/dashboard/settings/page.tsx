"use client"

import { useCallback, useEffect, useState } from "react"

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]

const DAY_LABELS: Record<string, string> = {
  monday: "Segunda-feira",
  tuesday: "Terça-feira",
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
  saturday: "Sábado",
  sunday: "Domingo",
}

type TimeSlot = { start: string; end: string }
type DayConfig = {
  slots: TimeSlot[]
  lunchBreak?: TimeSlot
}

export default function SettingsPage() {
  const [workHours, setWorkHours] = useState<Record<string, DayConfig>>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.workHours) setWorkHours(data.workHours)
      })
  }, [])

  function toggleDay(day: string) {
    setWorkHours((prev) => {
      const next = { ...prev }
      if (next[day]) {
        delete next[day]
      } else {
        next[day] = { slots: [{ start: "08:00", end: "18:00" }] }
      }
      return next
    })
  }

  function updateSlot(day: string, index: number, field: "start" | "end", value: string) {
    setWorkHours((prev) => {
      const next = { ...prev }
      const config = { ...next[day] }
      const slots = [...config.slots]
      slots[index] = { ...slots[index], [field]: value }
      config.slots = slots
      next[day] = config
      return next
    })
  }

  function addSlot(day: string) {
    setWorkHours((prev) => {
      const next = { ...prev }
      const config = { ...next[day] }
      const slots = [...config.slots]
      const lastEnd = slots.length > 0 ? slots[slots.length - 1].end : "18:00"
      const [h] = lastEnd.split(":").map(Number)
      const start = `${String(h + 1).padStart(2, "0")}:00`
      const end = `${String(h + 3).padStart(2, "0")}:00`
      slots.push({ start, end })
      config.slots = slots
      next[day] = config
      return next
    })
  }

  function removeSlot(day: string, index: number) {
    setWorkHours((prev) => {
      const next = { ...prev }
      const config = { ...next[day] }
      const slots = config.slots.filter((_, i) => i !== index)
      if (slots.length === 0) {
        delete next[day]
      } else {
        config.slots = slots
        next[day] = config
      }
      return next
    })
  }

  const toggleLunchBreak = useCallback((day: string, enabled: boolean) => {
    setWorkHours((prev) => {
      const next = { ...prev }
      const config = { ...next[day] }
      if (enabled) {
        config.lunchBreak = { start: "12:00", end: "14:00" }
      } else {
        delete config.lunchBreak
      }
      next[day] = config
      return next
    })
  }, [])

  function updateLunchBreak(day: string, field: "start" | "end", value: string) {
    setWorkHours((prev) => {
      const next = { ...prev }
      const config = { ...next[day] }
      if (config.lunchBreak) {
        config.lunchBreak = { ...config.lunchBreak, [field]: value }
      }
      next[day] = config
      return next
    })
  }

  async function save() {
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workHours }),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">
          Horários de Funcionamento
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Configure os dias e horários de atendimento
        </p>
      </div>

      <div className="mb-8 space-y-3">
        {DAYS.map((day, i) => {
          const dayConfig = workHours[day]
          const enabled = !!dayConfig

          return (
            <div
              key={day}
              className="animate-slide-up rounded-2xl bg-slate-800 p-5 shadow-sm ring-1 ring-slate-700/50"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <label className="flex cursor-pointer items-center gap-3">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => toggleDay(day)}
                    className="sr-only"
                  />
                  <div
                    className={`h-6 w-11 rounded-full transition-colors ${
                      enabled ? "bg-indigo-600" : "bg-slate-600"
                    }`}
                  >
                    <div
                      className={`h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
                        enabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </div>
                </div>
                <span className="font-medium text-slate-200">
                  {DAY_LABELS[day]}
                </span>
              </label>

              {enabled && dayConfig && (
                <div className="ml-14 mt-4 space-y-3">
                  {dayConfig.slots.map((slot, j) => (
                    <div key={j}>
                      {j > 0 && (
                        <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
                          <div className="h-px flex-1 bg-slate-700/50" />
                          <span>Intervalo</span>
                          <div className="h-px flex-1 bg-slate-700/50" />
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <input
                          type="time"
                          value={slot.start}
                          onChange={(e) => updateSlot(day, j, "start", e.target.value)}
                          className="rounded-xl border border-slate-600 bg-slate-900/50 px-4 py-2 text-sm text-slate-200 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-900/50"
                        />
                        <span className="text-sm text-slate-500">até</span>
                        <input
                          type="time"
                          value={slot.end}
                          onChange={(e) => updateSlot(day, j, "end", e.target.value)}
                          className="rounded-xl border border-slate-600 bg-slate-900/50 px-4 py-2 text-sm text-slate-200 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-900/50"
                        />
                        <button
                          onClick={() => removeSlot(day, j)}
                          className="rounded-lg p-1.5 text-xs text-red-400 transition hover:bg-slate-700/50"
                          title="Remover horário"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => addSlot(day)}
                      className="rounded-lg border border-dashed border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:border-slate-500 hover:text-slate-200"
                    >
                      + Adicionar horário
                    </button>
                  </div>

                  <div className="border-t border-slate-700/50 pt-3">
                    <label className="flex cursor-pointer items-center gap-3">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={!!dayConfig.lunchBreak}
                          onChange={(e) => toggleLunchBreak(day, e.target.checked)}
                          className="sr-only"
                        />
                        <div
                          className={`h-5 w-10 rounded-full transition-colors ${
                            dayConfig.lunchBreak ? "bg-amber-600" : "bg-slate-600"
                          }`}
                        >
                          <div
                            className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                              dayConfig.lunchBreak ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </div>
                      </div>
                      <span className="flex items-center gap-1.5 text-sm font-medium text-slate-300">
                        <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75C12 21 9 19.5 9 19.5m6 0s-3 1.5-6 1.5m6-1.5v-1.5c0-1.5-.75-2.25-3-2.25s-3 .75-3 2.25v1.5" />
                        </svg>
                        Almoço
                      </span>
                    </label>

                    {dayConfig.lunchBreak && (
                      <div className="ml-10 mt-3 flex items-center gap-3">
                        <input
                          type="time"
                          value={dayConfig.lunchBreak.start}
                          onChange={(e) => updateLunchBreak(day, "start", e.target.value)}
                          className="rounded-xl border border-amber-700/50 bg-slate-900/50 px-4 py-2 text-sm text-slate-200 transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-900/50"
                        />
                        <span className="text-sm text-slate-500">até</span>
                        <input
                          type="time"
                          value={dayConfig.lunchBreak.end}
                          onChange={(e) => updateLunchBreak(day, "end", e.target.value)}
                          className="rounded-xl border border-amber-700/50 bg-slate-900/50 px-4 py-2 text-sm text-slate-200 transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-900/50"
                        />
                        <span className="text-xs text-slate-500">
                          (
                          {(() => {
                            const [sh, sm] = dayConfig.lunchBreak.start.split(":").map(Number)
                            const [eh, em] = dayConfig.lunchBreak.end.split(":").map(Number)
                            const diff = eh * 60 + em - (sh * 60 + sm)
                            const h = Math.floor(diff / 60)
                            const m = diff % 60
                            return `${h}h${m > 0 ? String(m).padStart(2, "0") : ""}`
                          })()}
                          )
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button
        onClick={save}
        className="rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white shadow-lg shadow-indigo-900/50 transition-all hover:bg-indigo-500 hover:shadow-xl active:scale-[0.98]"
      >
        {saved ? "✓ Horários salvos!" : "Salvar Horários"}
      </button>
    </div>
  )
}
