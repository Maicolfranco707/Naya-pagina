import { createHmac, timingSafeEqual } from "node:crypto";

const GRAPH = "https://graph.facebook.com/v23.0";

/** Verifica que la petición viene de Meta (cabecera X-Hub-Signature-256 firmada con el App Secret). */
export function firmaMetaValida(cuerpo: string, firma: string | null) {
  const secreto = process.env.WHATSAPP_APP_SECRET;
  if (!secreto || !firma?.startsWith("sha256=")) return false;
  const esperada = createHmac("sha256", secreto).update(cuerpo).digest("hex");
  const recibida = firma.slice("sha256=".length);
  return esperada.length === recibida.length && timingSafeEqual(Buffer.from(esperada), Buffer.from(recibida));
}

async function llamarGraph(ruta: string, body: unknown) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) throw new Error("Falta configurar WHATSAPP_TOKEN o WHATSAPP_PHONE_NUMBER_ID.");

  const response = await fetch(`${GRAPH}/${phoneId}/${ruta}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`WhatsApp API ${response.status}: ${(await response.text()).slice(0, 300)}`);
  }
  return response.json() as Promise<{ messages?: Array<{ id: string }> }>;
}

export async function enviarTexto(para: string, texto: string) {
  const result = await llamarGraph("messages", {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: para,
    type: "text",
    text: { body: texto.slice(0, 4000), preview_url: true },
  });
  return result.messages?.[0]?.id ?? null;
}

/** Marca el mensaje como leído y muestra "escribiendo…" mientras el bot responde. */
export async function marcarLeidoEscribiendo(mensajeId: string) {
  try {
    await llamarGraph("messages", {
      messaging_product: "whatsapp",
      status: "read",
      message_id: mensajeId,
      typing_indicator: { type: "text" },
    });
  } catch (error) {
    console.warn("No se pudo marcar como leído:", error instanceof Error ? error.message : error);
  }
}
