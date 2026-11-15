import { createSupabaseAdminClient } from "@/utils/supabase/server";
import { deliverEmail } from "@/utils/email/order-emails";
import { instruccionesAsistente } from "@/utils/whatsapp/conocimiento";
import { enviarTexto, marcarLeidoEscribiendo } from "@/utils/whatsapp/meta";

const HISTORIAL = 16;                         // mensajes previos que ve la IA
const PAUSA_SI_RESPONDE_PERSONA_H = 12;       // si alguien de NAYA escribe desde el celular, el bot se calla
const PAUSA_SI_PIDE_ASESORA_H = 24;
const ETIQUETA_ASESORA = "[ASESORA]";

export interface MensajeEntrante {
  waId: string;
  nombre: string | null;
  mensajeId: string;
  tipo: string;
  texto: string | null;
}

function horasDesdeAhora(horas: number) {
  return new Date(Date.now() + horas * 3600_000).toISOString();
}

async function preguntarIA(sistema: string, historial: Array<{ role: "user" | "assistant"; content: string }>) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Falta configurar ANTHROPIC_API_KEY.");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-haiku-5-5",
      max_tokens: 500,
      system: sistema,
      messages: historial,
    }),
  });
  if (!response.ok) {
    throw new Error(`Anthropic ${response.status}: ${(await response.text()).slice(0, 300)}`);
  }
  const data = await response.json() as { content?: Array<{ type: string; text?: string }> };
  return (data.content ?? []).filter((b) => b.type === "text").map((b) => b.text ?? "").join("").trim();
}

/** La API exige turnos alternados que empiecen por el cliente: une los seguidos del mismo rol. */
function ordenarTurnos(filas: Array<{ role: string; content: string }>) {
  const turnos: Array<{ role: "user" | "assistant"; content: string }> = [];
  for (const fila of filas) {
    const role = fila.role === "user" ? "user" : "assistant";
    const contenido = fila.role === "owner" ? `(Respuesta de la asesora de NAYA) ${fila.content}` : fila.content;
    const ultimo = turnos[turnos.length - 1];
    if (ultimo && ultimo.role === role) ultimo.content += `\n${contenido}`;
    else turnos.push({ role, content: contenido });
  }
  while (turnos.length && turnos[0].role !== "user") turnos.shift();
  return turnos;
}

async function avisarAsesora(waId: string, nombre: string | null, ultimoMensaje: string) {
  const correo = process.env.STORE_NOTIFICATION_EMAIL;
  if (!correo) return;
  const enlace = `https://wa.me/${waId}`;
  const texto = `${nombre ?? "Un cliente"} (+${waId}) pidió hablar con una asesora.\n\nÚltimo mensaje: "${ultimoMensaje}"\n\nResponder: ${enlace}\n\nEl bot queda en pausa ${PAUSA_SI_PIDE_ASESORA_H} horas en esta conversación.`;
  const html = `<p><strong>${(nombre ?? "Un cliente").replace(/[<>&]/g, "")}</strong> (+${waId}) pidió hablar con una asesora.</p>
<p>Último mensaje: “${ultimoMensaje.replace(/[<>&]/g, "")}”</p>
<p><a href="${enlace}" style="display:inline-block;background:#25d366;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:bold">Responder por WhatsApp</a></p>
<p style="color:#666;font-size:12px">El bot queda en pausa ${PAUSA_SI_PIDE_ASESORA_H} horas en esta conversación.</p>`;
  try {
    await deliverEmail(correo, `Cliente pide asesora por WhatsApp · +${waId} | NAYA`, html, texto);
  } catch (error) {
    console.error("No se pudo avisar a la asesora:", error instanceof Error ? error.message : error);
  }
}

/** Mensaje que alguien de NAYA envió desde la app del celular: se guarda y el bot se pausa. */
export async function registrarRespuestaDeAsesora(waId: string, mensajeId: string, texto: string) {
  const supabase = createSupabaseAdminClient();
  // Si es un mensaje que envió el propio bot, no es una persona respondiendo
  const { data: existente } = await supabase.from("whatsapp_messages").select("id").eq("wa_message_id", mensajeId).maybeSingle();
  if (existente) return;

  await supabase.from("whatsapp_conversations").upsert(
    { wa_id: waId, bot_paused_until: horasDesdeAhora(PAUSA_SI_RESPONDE_PERSONA_H), updated_at: new Date().toISOString() },
    { onConflict: "wa_id" },
  );
  await supabase.from("whatsapp_messages").insert({ wa_id: waId, role: "owner", content: texto || "(mensaje)", wa_message_id: mensajeId });
}

export async function atenderMensaje(entrante: MensajeEntrante) {
  const supabase = createSupabaseAdminClient();
  const ahora = new Date().toISOString();

  const { data: conversacion } = await supabase
    .from("whatsapp_conversations")
    .upsert(
      { wa_id: entrante.waId, ...(entrante.nombre ? { customer_name: entrante.nombre } : {}), updated_at: ahora },
      { onConflict: "wa_id" },
    )
    .select("bot_paused_until")
    .single();

  const texto = entrante.texto?.trim()
    || (entrante.tipo === "audio" ? "(El cliente envió una nota de voz)"
      : entrante.tipo === "image" ? "(El cliente envió una imagen)"
        : `(El cliente envió un mensaje de tipo ${entrante.tipo})`);

  // Guardar el mensaje; si ya existía (Meta reintenta), no responder dos veces
  const { error: errorGuardar } = await supabase
    .from("whatsapp_messages")
    .insert({ wa_id: entrante.waId, role: "user", content: texto.slice(0, 4000), wa_message_id: entrante.mensajeId });
  if (errorGuardar?.code === "23505") return;
  if (errorGuardar) throw new Error(`No se pudo guardar el mensaje: ${errorGuardar.message}`);

  // Una persona de NAYA está atendiendo esta conversación
  if (conversacion?.bot_paused_until && new Date(conversacion.bot_paused_until) > new Date()) return;

  await marcarLeidoEscribiendo(entrante.mensajeId);

  let respuesta: string;
  if (!entrante.texto?.trim()) {
    respuesta = entrante.tipo === "audio"
      ? "¡Gracias por tu mensaje! 🌿 Por ahora no puedo escuchar notas de voz. ¿Me lo escribes y te ayudo enseguida?"
      : "¡Gracias! Por ahora solo puedo leer mensajes de texto. ¿Me cuentas por escrito en qué te puedo ayudar?";
  } else {
    const { data: filas } = await supabase
      .from("whatsapp_messages")
      .select("role, content")
      .eq("wa_id", entrante.waId)
      .order("created_at", { ascending: false })
      .limit(HISTORIAL);
    const historial = ordenarTurnos((filas ?? []).reverse());

    try {
      respuesta = await preguntarIA(await instruccionesAsistente(), historial);
    } catch (error) {
      console.error("Fallo de la IA:", error instanceof Error ? error.message : error);
      respuesta = `¡Hola! Gracias por escribir a NAYA 🌿 Una asesora te responde muy pronto. ${ETIQUETA_ASESORA}`;
    }
  }

  const pideAsesora = respuesta.includes(ETIQUETA_ASESORA);
  respuesta = respuesta.replaceAll(ETIQUETA_ASESORA, "").replace(/\*\*(.+?)\*\*/g, "*$1*").trim()
    || "Una asesora te escribe muy pronto 🌿";

  const idEnviado = await enviarTexto(entrante.waId, respuesta);
  await supabase.from("whatsapp_messages").insert({
    wa_id: entrante.waId, role: "assistant", content: respuesta, wa_message_id: idEnviado,
  });

  if (pideAsesora) {
    await supabase.from("whatsapp_conversations").update({
      bot_paused_until: horasDesdeAhora(PAUSA_SI_PIDE_ASESORA_H),
      handoff_requested_at: new Date().toISOString(),
    }).eq("wa_id", entrante.waId);
    await avisarAsesora(entrante.waId, entrante.nombre, texto);
  }
}
