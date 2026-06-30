import { slugify, getDayName, generateTimeSlots } from "@/lib/utils"

describe("slugify", () => {
  it("converts text to a URL-friendly slug", () => {
    expect(slugify("Barbearia do João")).toBe("barbearia-do-joao")
  })

  it("removes accents", () => {
    expect(slugify("Salão de Beleza")).toBe("salao-de-beleza")
  })

  it("removes special characters", () => {
    expect(slugify("Clínica - Dr. José")).toBe("clinica-dr-jose")
  })

  it("handles empty string", () => {
    expect(slugify("")).toBe("")
  })
})

describe("getDayName", () => {
  it("returns correct day name for a given date", () => {
    expect(getDayName(new Date(2026, 5, 28))).toBe("sunday")
    expect(getDayName(new Date(2026, 5, 29))).toBe("monday")
    expect(getDayName(new Date(2026, 5, 30))).toBe("tuesday")
    expect(getDayName(new Date(2026, 6, 1))).toBe("wednesday")
    expect(getDayName(new Date(2026, 6, 2))).toBe("thursday")
    expect(getDayName(new Date(2026, 6, 3))).toBe("friday")
    expect(getDayName(new Date(2026, 6, 4))).toBe("saturday")
  })
})

describe("generateTimeSlots", () => {
  it("generates slots between start and end times", () => {
    const slots = generateTimeSlots("08:00", "10:00", 30, [])
    expect(slots).toEqual(["08:00", "08:30", "09:00", "09:30"])
  })

  it("excludes occupied slots", () => {
    const occupied = [{ date: new Date("2026-06-28T08:30:00") }]
    const slots = generateTimeSlots("08:00", "10:00", 30, occupied)
    expect(slots).toEqual(["08:00", "09:00", "09:30"])
  })

  it("returns empty array when no time available", () => {
    const slots = generateTimeSlots("08:00", "08:00", 30, [])
    expect(slots).toEqual([])
  })

  it("uses duration as slot interval", () => {
    const slots = generateTimeSlots("09:00", "12:00", 60, [])
    expect(slots).toEqual(["09:00", "10:00", "11:00"])
  })
})
