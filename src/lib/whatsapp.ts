import "server-only"

type WhatsAppConfig = {
  apiUrl: string
  apiKey: string
  instance: string
  enabled: boolean
}

function getConfig(): WhatsAppConfig {
  return {
    apiUrl: process.env.WHATSAPP_API_URL || "",
    apiKey: process.env.WHATSAPP_API_KEY || "",
    instance: process.env.WHATSAPP_INSTANCE || "",
    enabled: !!(
      process.env.WHATSAPP_API_URL &&
      process.env.WHATSAPP_API_KEY &&
      process.env.WHATSAPP_INSTANCE
    ),
  }
}

export async function sendMessage(to: string, message: string) {
  const config = getConfig()
  if (!config.enabled) return false

  try {
    const res = await fetch(
      `${config.apiUrl}/message/sendText/${config.instance}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apiKey": config.apiKey,
        },
        body: JSON.stringify({
          number: to.replace(/\D/g, ""),
          text: message,
        }),
      }
    )

    return res.ok
  } catch (error) {
    console.error("WhatsApp send error:", error)
    return false
  }
}

export function formatPhone(phone: string): string {
  return phone.replace(/\D/g, "")
}
