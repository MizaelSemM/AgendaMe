"use client"

import { useEffect, useRef, useState, useCallback } from "react"

type NotificationItem = {
  id: number
  type: string
  title: string
  message: string
  read: boolean
  sentAt: string | null
  createdAt: string
}

function playNotificationSound() {
  try {
    const ctx = new AudioContext()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()

    oscillator.connect(gain)
    gain.connect(ctx.destination)

    oscillator.type = "sine"
    oscillator.frequency.setValueAtTime(880, ctx.currentTime)
    oscillator.frequency.setValueAtTime(1100, ctx.currentTime + 0.1)

    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.3)
  } catch {
    // Audio not supported
  }
}

export function NotificationList({
  notifications: initial,
  unreadCount: initialUnread,
}: {
  notifications: NotificationItem[]
  unreadCount: number
}) {
  const [notifications, setNotifications] = useState(initial)
  const [unreadCount, setUnreadCount] = useState(initialUnread)
  const prevCountRef = useRef(initialUnread)
  const soundPlayedRef = useRef(false)

  useEffect(() => {
    if (!soundPlayedRef.current && unreadCount > 0) {
      playNotificationSound()
      soundPlayedRef.current = true
    }
  }, [unreadCount])

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/notifications")
        if (!res.ok) return
        const data: NotificationItem[] = await res.json()
        setNotifications(data)
        const newUnread = data.filter((n) => !n.read).length
        if (newUnread > prevCountRef.current) {
          playNotificationSound()
        }
        prevCountRef.current = newUnread
        setUnreadCount(newUnread)
      } catch {
        // ignore polling errors
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const markAllRead = useCallback(async () => {
    await fetch("/api/notifications", { method: "PATCH" })
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }, [])

  const deleteNotification = useCallback(async (id: number) => {
    const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" })
    if (res.ok) {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }
  }, [])

  return (
    <div className="rounded-2xl bg-slate-800 p-6 shadow-sm ring-1 ring-slate-700/50">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-slate-100">Notificações</h2>
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-xs font-medium text-white">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs font-medium text-indigo-400 transition hover:text-indigo-300"
          >
            Marcar todas lidas
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-500">
            Nenhuma notificação
          </p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`group relative rounded-xl px-4 py-3 transition ${
                n.read
                  ? "bg-slate-900/30"
                  : "bg-indigo-900/20 ring-1 ring-indigo-800/30"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p
                    className={`text-sm ${
                      n.read ? "text-slate-400" : "font-medium text-slate-100"
                    }`}
                  >
                    {n.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">{n.message}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-slate-600">
                    {new Date(n.createdAt).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <button
                    onClick={() => deleteNotification(n.id)}
                    className="opacity-0 transition-opacity group-hover:opacity-100 rounded-lg p-1 text-xs text-red-400 hover:bg-slate-700/50"
                    title="Excluir notificação"
                  >
                    ✕
                  </button>
                </div>
              </div>
              {n.sentAt && (
                <p className="mt-1 text-xs text-emerald-500">
                  ✓ Enviado em{" "}
                  {new Date(n.sentAt).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
