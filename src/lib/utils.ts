export type TimeSlot = { start: string; end: string }

export type DayConfig = {
  slots: TimeSlot[]
  lunchBreak?: TimeSlot
}

export type WorkHours = Record<string, DayConfig>

export function migrateWorkHours(data: unknown): WorkHours {
  const result: WorkHours = {}
  if (!data || typeof data !== "object") return result
  for (const [day, value] of Object.entries(data as Record<string, unknown>)) {
    if (Array.isArray(value)) {
      result[day] = { slots: value as TimeSlot[] }
    } else if (value && typeof value === "object" && "slots" in (value as object)) {
      result[day] = value as DayConfig
    }
  }
  return result
}

export function getExpandedSlots(dayConfig: DayConfig): TimeSlot[] {
  if (!dayConfig.lunchBreak) return dayConfig.slots

  const expanded: TimeSlot[] = []
  for (const slot of dayConfig.slots) {
    if (slot.start < dayConfig.lunchBreak.start && slot.end > dayConfig.lunchBreak.end) {
      expanded.push({ start: slot.start, end: dayConfig.lunchBreak.start })
      expanded.push({ start: dayConfig.lunchBreak.end, end: slot.end })
    } else {
      expanded.push(slot)
    }
  }
  return expanded
}

export function isTimeInLunchBreak(timeMinutes: number, dayConfig: DayConfig): boolean {
  if (!dayConfig.lunchBreak) return false
  const [lH, lM] = dayConfig.lunchBreak.start.split(":").map(Number)
  const [leH, leM] = dayConfig.lunchBreak.end.split(":").map(Number)
  const lunchStart = lH * 60 + lM
  const lunchEnd = leH * 60 + leM
  return timeMinutes >= lunchStart && timeMinutes < lunchEnd
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s*-\s*/g, "-")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function apiError(message: string, status: number = 400) {
  return Response.json({ error: message }, { status })
}

export function apiSuccess(data: unknown, status: number = 200) {
  return Response.json(data, { status })
}

const DAY_MAP: Record<string, string> = {
  sunday: "sunday",
  monday: "monday",
  tuesday: "tuesday",
  wednesday: "wednesday",
  thursday: "thursday",
  friday: "friday",
  saturday: "saturday",
}

export function getDayName(date: Date): string {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
  return days[date.getDay()]
}

export function generateTimeSlots(
  start: string,
  end: string,
  duration: number,
  existingAppointments: { date: Date }[]
): string[] {
  const slots: string[] = []
  const [startH, startM] = start.split(":").map(Number)
  const [endH, endM] = end.split(":").map(Number)

  let current = startH * 60 + startM
  const endTotal = endH * 60 + endM

  const occupiedMinutes = new Set<number>()
  for (const apt of existingAppointments) {
    const aptDate = new Date(apt.date)
    const mins = aptDate.getHours() * 60 + aptDate.getMinutes()
    for (let m = mins; m < mins + duration; m++) {
      occupiedMinutes.add(m)
    }
  }

  while (current + duration <= endTotal) {
    if (!occupiedMinutes.has(current)) {
      const h = Math.floor(current / 60).toString().padStart(2, "0")
      const m = (current % 60).toString().padStart(2, "0")
      slots.push(`${h}:${m}`)
    }
    current += duration
  }

  return slots
}
