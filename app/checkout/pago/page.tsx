"use client";

import Link from "next/link";
import Script from "next/script";
import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface OrdenData {
  total: number;
}

interface WompiWidgetCheckout {
  open: (callback?: (result: { transaction?: { id: string } }) => void) => void;
}

declare global {
  interface Window {
    WidgetCheckout?: new (config: {
      currency: "COP";
      amountInCents: number;
      reference: string;
      publicKey: string;
      redirectUrl: string;
    }) => WompiWidgetCheckout;
  }
}

const WOMPI_SCRIPT_URL = "https://checkout.wompi.co/widget.js";

function generarReferencia(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `NAYA-${crypto.randomUUID()}`;
  }

  return `NAYA-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function PaginaPagoWompi() {
  const router = useRouter();
  const [orden, setOrden] = useState<OrdenData | null>(null);
  const [referencia, setReferencia] = useState("");
  const [widgetCargado, setWidgetCargado] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY;

  useEffect(() => {
    const datosGuardados = localStorage.getItem("orden_pendiente_naya");

    if (!datosGuardados) {
      router.replace("/checkout");
      return;
    }

    try {
      const datos = JSON.parse(datosGuardados) as OrdenData;
      if (!Number.isFinite(datos.total) || datos.total <= 0) {
        router.replace("/checkout");
        return;
      }

      startTransition(() => {
        setOrden(datos);
        setReferencia(generarReferencia());
      });
    } catch {
      router.replace("/checkout");
    }
  }, [router]);

  const abrirWidget = () => {
    if (!orden || !referencia || !publicKey || !window.WidgetCheckout) {
      alert("No se pudo cargar el medio de pago. Intenta nuevamente.");
      return;
    }

    const redirectUrl = `${window.location.origin}/checkout/confirmacion`;
    setProcesando(true);

    const checkout = new window.WidgetCheckout({
      currency: "COP",
      amountInCents: Math.round(orden.total * 100),
      reference: referencia,
      publicKey,
      redirectUrl,
    });

    checkout.open((result) => {
      if (result.transaction?.id) {
        localStorage.setItem("wompi_transaction_id", result.transaction.id);
      }
      window.location.assign(`/checkout/confirmacion?reference=${encodeURIComponent(referencia)}`);
    });
  };

  if (!orden) {
    return <div className="min-h-screen flex items-center justify-center text-stone-500">Cargando información del pedido...</div>;
  }

  return (
    <>
      <Script
        src={WOMPI_SCRIPT_URL}
        strategy="afterInteractive"
        onLoad={() => setWidgetCargado(true)}
      />
      <main className="min-h-screen bg-stone-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Link href="/checkout" className="text-xs text-stone-500 hover:text-emerald-900 font-medium inline-flex items-center gap-1 transition mb-6">
            ← Volver a los datos de envío
          </Link>

          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-stone-200">
            <h1 className="text-xl font-bold text-stone-900 mb-2">Paga tu pedido</h1>
            <p className="text-sm text-stone-500 mb-6">Serás dirigido al checkout seguro de Wompi.</p>

            <div className="flex justify-between items-center border-y border-stone-200 py-4 mb-6">
              <span className="font-semibold text-stone-700">Total a pagar</span>
              <span className="text-xl font-bold text-stone-900">${orden.total.toLocaleString("es-CO")} COP</span>
            </div>

            {!publicKey && <p className="text-sm text-red-600 mb-4">Falta configurar la llave pública de Wompi.</p>}

            <button
              type="button"
              onClick={abrirWidget}
              disabled={!widgetCargado || !publicKey || procesando}
              className="w-full bg-[#8cc63f] hover:bg-[#7cb433] text-white font-bold py-4 rounded-xl transition text-sm shadow-sm cursor-pointer disabled:opacity-50"
            >
              {procesando ? "Procesando pago..." : widgetCargado ? "Pagar con Wompi" : "Cargando pago..."}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}