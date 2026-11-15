import { after, NextResponse } from "next/server";
import { atenderMensaje, registrarRespuestaDeAsesora, type MensajeEntrante } from "@/utils/whatsapp/bot";
import { firmaMetaValida } from "@/utils/whatsapp/meta";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Meta verifica la URL del webhook con este GET (una sola vez, al configurarlo). */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const tokenEsperado = process.env.WHATSAPP_VERIFY_TOKEN;
  if (
    tokenEsperado &&
    params.get("hub.mode") === "subscribe" &&
    params.get("hub.verify_token") === tokenEsperado
  ) {
    return new Response(params.get("hub.challenge") ?? "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

interface CambioWhatsApp {
  field?: string;
  value?: {
    contacts?: Array<{ wa_id?: string; profile?: { name?: string } }>;
    messages?: Array<{ from?: string; id?: string; type?: string; text?: { body?: string }; button?: { text?: string }; interactive?: { button_reply?: { title?: string }; list_reply?: { title?: string } } }>;
    message_echoes?: Array<{ to?: string; id?: string; type?: string; text?: { body?: string } }>;
  };
}

export async function POST(request: Request) {
  const cuerpo = await request.text();
  if (!firmaMetaValida(cuerpo, request.headers.get("x-hub-signature-256"))) {
    return NextResponse.json({ error: "Firma inválida." }, { status: 401 });
  }

  let payload: { entry?: Array<{ changes?: CambioWhatsApp[] }> };
  try {
    payload = JSON.parse(cuerpo);
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const entrantes: MensajeEntrante[] = [];
  const ecos: Array<{ waId: string; id: string; texto: string }> = [];

  for (const entry of payload.entry ?? []) {
    for (const cambio of entry.changes ?? []) {
      const value = cambio.value;
      if (!value) continue;

      if (cambio.field === "messages") {
        const nombre = value.contacts?.[0]?.profile?.name ?? null;
        for (const m of value.messages ?? []) {
          if (!m.from || !m.id) continue;
          const texto = m.text?.body
            ?? m.button?.text
            ?? m.interactive?.button_reply?.title
            ?? m.interactive?.list_reply?.title
            ?? null;
          entrantes.push({ waId: m.from, nombre, mensajeId: m.id, tipo: m.type ?? "desconocido", texto });
        }
      }

      // Mensajes enviados por NAYA desde la app del celular (coexistencia)
      if (cambio.field === "smb_message_echoes") {
        for (const eco of value.message_echoes ?? []) {
          if (eco.to && eco.id) ecos.push({ waId: eco.to, id: eco.id, texto: eco.text?.body ?? "" });
        }
      }
    }
  }

  // Responder a Meta de inmediato y procesar después (Meta reintenta si tardamos)
  after(async () => {
    for (const eco of ecos) {
      try {
        await registrarRespuestaDeAsesora(eco.waId, eco.id, eco.texto);
      } catch (error) {
        console.error("Error registrando respuesta de asesora:", error instanceof Error ? error.message : error);
      }
    }
    for (const entrante of entrantes) {
      try {
        await atenderMensaje(entrante);
      } catch (error) {
        console.error("Error atendiendo mensaje de WhatsApp:", error instanceof Error ? error.message : error);
      }
    }
  });

  return NextResponse.json({ received: true });
}
