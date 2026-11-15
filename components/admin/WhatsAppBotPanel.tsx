"use client";

import { useEffect, useState } from "react";
import { Bot, MessageCircle } from "lucide-react";
import { createSupabaseBrowserClient } from "@/utils/supabase/browser";

interface Conversacion {
  wa_id: string;
  customer_name: string | null;
  bot_paused_until: string | null;
  handoff_requested_at: string | null;
  updated_at: string;
}

const fecha = (iso: string) =>
  new Date(iso).toLocaleString("es-CO", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export default function WhatsAppBotPanel() {
  const [encendido, setEncendido] = useState<boolean | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    (async () => {
      const [{ data: ajuste, error: errorAjuste }, { data: chats }] = await Promise.all([
        supabase.from("store_settings").select("value").eq("key", "whatsapp_bot_enabled").maybeSingle(),
        supabase.from("whatsapp_conversations")
          .select("wa_id, customer_name, bot_paused_until, handoff_requested_at, updated_at")
          .order("updated_at", { ascending: false })
          .limit(30),
      ]);
      if (errorAjuste) setError("No se pudo leer el estado del bot.");
      setEncendido(ajuste ? ajuste.value === true : true);
      setConversaciones((chats ?? []) as Conversacion[]);
    })();
  }, []);

  const cambiar = async () => {
    if (encendido === null) return;
    setGuardando(true);
    setError("");
    const nuevo = !encendido;
    const { error: errorGuardar } = await createSupabaseBrowserClient()
      .from("store_settings")
      .update({ value: nuevo, updated_at: new Date().toISOString() })
      .eq("key", "whatsapp_bot_enabled");
    if (errorGuardar) setError("No se pudo cambiar el estado del bot. Intenta de nuevo.");
    else setEncendido(nuevo);
    setGuardando(false);
  };

  const ahora = Date.now();

  return (
    <section className="mt-5 space-y-6">
      <div className="flex flex-col gap-4 border border-stone-300 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Bot size={22} className="mt-0.5 text-emerald-900" />
          <div>
            <h2 className="font-semibold text-stone-900">Asesora virtual de WhatsApp</h2>
            <p className="text-sm text-stone-600">
              {encendido === null ? "Cargando…" : encendido
                ? "Encendida: responde sola a los clientes que escriben al WhatsApp de NAYA."
                : "Apagada: no responde nada. Los mensajes llegan normal a tu WhatsApp para que los contestes tú."}
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={encendido === true}
          disabled={encendido === null || guardando}
          onClick={cambiar}
          className={`relative h-8 w-14 shrink-0 rounded-full transition-colors disabled:opacity-50 ${encendido ? "bg-emerald-700" : "bg-stone-300"}`}
        >
          <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${encendido ? "left-7" : "left-1"}`} />
          <span className="sr-only">{encendido ? "Apagar bot" : "Encender bot"}</span>
        </button>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <div>
        <h3 className="mb-2 text-sm font-semibold text-stone-700">Conversaciones recientes</h3>
        {conversaciones.length === 0 ? (
          <p className="border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">Todavía no hay conversaciones.</p>
        ) : (
          <ul className="divide-y divide-stone-200 border border-stone-300 bg-white">
            {conversaciones.map((c) => {
              const enPausa = c.bot_paused_until && new Date(c.bot_paused_until).getTime() > ahora;
              return (
                <li key={c.wa_id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium text-stone-900">{c.customer_name || `+${c.wa_id}`}</p>
                    <p className="text-xs text-stone-500">
                      +{c.wa_id} · {fecha(c.updated_at)}
                      {enPausa ? (c.handoff_requested_at ? " · Pidió asesora" : " · La atiende una persona") : ""}
                    </p>
                  </div>
                  <a href={`https://wa.me/${c.wa_id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-emerald-800 hover:underline">
                    <MessageCircle size={15} /> Abrir
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
