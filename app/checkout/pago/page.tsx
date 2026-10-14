"use client";

import Link from "next/link";
import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface OrdenData {
  id: string;
  total: number;
  formData: { email: string };
}

interface DatosCheckout {
  reference: string;
  amountInCents: number;
  signature: string;
}

export default function PaginaPagoWompi() {
  const router = useRouter();
  const [orden, setOrden] = useState<OrdenData | null>(null);
  const [checkout, setCheckout] = useState<DatosCheckout | null>(null);
  const [errorWidget, setErrorWidget] = useState("");
  const [procesando, setProcesando] = useState(false);
  const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY;

  useEffect(() => {
    let activo = true;

    const prepararCheckout = async () => {
      const datosGuardados = localStorage.getItem("orden_pendiente_naya");
      if (!datosGuardados) {
        router.replace("/checkout");
        return;
      }

      let datos: OrdenData;
      try {
        datos = JSON.parse(datosGuardados) as OrdenData;
      } catch {
        router.replace("/checkout");
        return;
      }

      if (!datos.id || !Number.isFinite(datos.total) || datos.total <= 0) {
        router.replace("/checkout");
        return;
      }

      startTransition(() => setOrden(datos));

      try {
        const response = await fetch("/api/wompi/firma", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: datos.id }),
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "No se pudo preparar el pago con Wompi.");
        }

        if (activo) {
          startTransition(() => setCheckout(result as DatosCheckout));
        }
      } catch (error) {
        if (activo) {
          setErrorWidget(error instanceof Error ? error.message : "No se pudo preparar el pago con Wompi.");
        }
      }
    };

    void prepararCheckout();
    return () => {
      activo = false;
    };
  }, [router]);

  const irAWompi = () => {
    if (!orden || !checkout || !publicKey) {
      setErrorWidget("No se pudo preparar el pago con Wompi. Revisa la configuración e intenta nuevamente.");
      return;
    }

    setProcesando(true);
    try {
      const form = document.createElement("form");
      form.method = "GET";
      form.action = "https://checkout.wompi.co/p/";

      const campos: Record<string, string> = {
        "public-key": publicKey,
        currency: "COP",
        "amount-in-cents": String(checkout.amountInCents),
        reference: checkout.reference,
        "signature:integrity": checkout.signature,
      };

      if (window.location.protocol === "https:") {
        const redirectUrl = new URL("/checkout/confirmacion", window.location.origin);
        redirectUrl.searchParams.set("reference", checkout.reference);
        campos["redirect-url"] = redirectUrl.toString();
      }

      if (orden.formData?.email) {
        campos["customer-data:email"] = orden.formData.email;
      }

      for (const [name, value] of Object.entries(campos)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error("No se pudo redirigir al checkout de Wompi:", error);
      setErrorWidget("No se pudo abrir el checkout de Wompi. Intenta nuevamente.");
      setProcesando(false);
    }
  };

  if (!orden) {
    return <div className="min-h-screen flex items-center justify-center text-stone-500">Cargando información del pedido...</div>;
  }

  return (
    <main className="min-h-screen bg-stone-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/checkout" className="text-xs text-stone-500 hover:text-emerald-900 font-medium inline-flex items-center gap-1 transition mb-6">
          ← Volver a los datos de envío
        </Link>

        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-stone-200">
          <h1 className="text-xl font-bold text-stone-900 mb-2">Paga tu pedido</h1>
          <p className="text-sm text-stone-500 mb-6">Continuarás al checkout seguro de Wompi.</p>

          <div className="flex justify-between items-center border-y border-stone-200 py-4 mb-6">
            <span className="font-semibold text-stone-700">Total a pagar</span>
            <span className="text-xl font-bold text-stone-900">
              ${((checkout?.amountInCents ?? Math.round(orden.total * 100)) / 100).toLocaleString("es-CO")} COP
            </span>
          </div>

          {!publicKey && <p className="text-sm text-red-600 mb-4">Falta configurar la llave pública de Wompi.</p>}
          {errorWidget && <p className="mb-4 text-sm text-red-600" role="alert">{errorWidget}</p>}

          <button
            type="button"
            onClick={irAWompi}
            disabled={!checkout || !publicKey || procesando}
            className="w-full bg-[#8cc63f] hover:bg-[#7cb433] text-white font-bold py-4 rounded-xl transition text-sm shadow-sm cursor-pointer disabled:opacity-50"
          >
            {procesando ? "Conectando con Wompi..." : errorWidget ? "Pago no disponible" : checkout ? "Pagar con Wompi" : "Preparando pago seguro..."}
          </button>
        </div>
      </div>
    </main>
  );
}