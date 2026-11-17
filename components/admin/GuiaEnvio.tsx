"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/utils/supabase/browser";
import { TRANSPORTADORAS } from "@/utils/transportadoras";

interface Props {
  pedido: { id: string; reference: string; customer_name: string; customer_phone: string; tracking_carrier?: string | null; tracking_number?: string | null };
  onGuardado: (cambios: { tracking_carrier: string | null; tracking_number: string | null; order_status?: string }) => void;
}

function telefonoWhatsApp(telefono: string) {
  const digitos = telefono.replace(/\D/g, "");
  return digitos.length === 10 ? `57${digitos}` : digitos;
}

export default function GuiaEnvio({ pedido, onGuardado }: Props) {
  const [transportadora, setTransportadora] = useState(pedido.tracking_carrier ?? "");
  const [guia, setGuia] = useState(pedido.tracking_number ?? "");
  const [guardando, setGuardando] = useState(false);
  const [estado, setEstado] = useState("");

  const guardar = async () => {
    setGuardando(true);
    setEstado("");
    try {
      const cambios: Record<string, string | null> = {
        tracking_carrier: transportadora || null,
        tracking_number: guia.trim() || null,
        updated_at: new Date().toISOString(),
      };
      // Al poner la guía, el pedido pasa a "Enviado".
      if (guia.trim()) cambios.order_status = "shipped";
      const { error } = await createSupabaseBrowserClient().from("orders").update(cambios).eq("id", pedido.id);
      if (error) throw error;
      onGuardado({ tracking_carrier: cambios.tracking_carrier, tracking_number: cambios.tracking_number, ...(guia.trim() ? { order_status: "shipped" } : {}) });
      setEstado("Guardado");
    } catch (reason) {
      setEstado(reason instanceof Error ? reason.message : "No se pudo guardar la guía.");
    } finally {
      setGuardando(false);
    }
  };

  const guardada = pedido.tracking_number && pedido.tracking_number === guia.trim();
  const nombre = pedido.customer_name.split(" ")[0];
  const mensaje = `Hola ${nombre}, tu pedido NAYA ${pedido.reference} ya va en camino 🚚\nTransportadora: ${transportadora || "—"}\nNúmero de guía: ${guia.trim()}\n¡Gracias por tu compra!`;

  return (
    <div className="mt-3 border-t border-stone-100 pt-3">
      <h3 className="text-xs font-semibold uppercase text-stone-500">Guía de envío</h3>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <select value={transportadora} onChange={(e) => setTransportadora(e.target.value)} className="border border-stone-300 bg-white px-2 py-1.5 text-sm">
          <option value="">Transportadora</option>
          {Object.keys(TRANSPORTADORAS).map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input value={guia} onChange={(e) => setGuia(e.target.value)} placeholder="Número de guía" maxLength={60} className="min-w-0 flex-1 border border-stone-300 px-2 py-1.5 text-sm" />
        <button type="button" onClick={() => void guardar()} disabled={guardando} className="bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60">
          {guardando ? "Guardando..." : "Guardar"}
        </button>
      </div>
      {estado && <p className="mt-1 text-xs text-stone-500">{estado}</p>}
      {guardada && (
        <a
          href={`https://wa.me/${telefonoWhatsApp(pedido.customer_phone)}?text=${encodeURIComponent(mensaje)}`}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
        >
          Avisar al cliente por WhatsApp
        </a>
      )}
    </div>
  );
}
