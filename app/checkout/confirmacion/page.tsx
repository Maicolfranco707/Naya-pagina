"use client";

import Link from "next/link";
import { startTransition, useEffect, useMemo, useState } from "react";

export default function ConfirmacionPage() {
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const txId = params.get("transactionId") || params.get("id");
    const ref = params.get("reference");

    startTransition(() => {
      if (txId) setTransactionId(txId);
      if (ref) setReference(ref);
    });

    if (!ref) return;

    let activo = true;
    let intentos = 0;
    let estadoFinal = false;
    const consultarEstado = async () => {
      try {
        const response = await fetch(`/api/orders/estado?reference=${encodeURIComponent(ref)}`);
        const data = await response.json();
        if (activo && response.ok) {
          const status = String(data.payment_status);
          startTransition(() => setPaymentStatus(status));
          if (["approved", "declined", "voided", "error"].includes(status)) {
            estadoFinal = true;
            window.clearInterval(intervalo);
          }
        }
      } catch (error) {
        console.error("No se pudo consultar el estado del pedido:", error);
      }
    };

    const intervalo = window.setInterval(() => {
      intentos += 1;
      if (intentos >= 15 || estadoFinal) {
        window.clearInterval(intervalo);
        return;
      }
      void consultarEstado();
    }, 4000);
    void consultarEstado();

    return () => {
      activo = false;
      window.clearInterval(intervalo);
    };
  }, []);

  const mensaje = useMemo(() => {
    if (paymentStatus === "approved") {
      return "Wompi aprobó el pago. Estamos preparando tu pedido.";
    }
    if (paymentStatus === "declined") return "Wompi no aprobó el pago. Puedes intentar con otro medio de pago.";
    if (paymentStatus === "voided") return "La transacción fue anulada.";
    if (paymentStatus === "error") return "Wompi reportó un error al procesar el pago.";
    return "Estamos esperando la confirmación segura de Wompi. Esta página se actualizará automáticamente.";
  }, [paymentStatus]);

  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-stone-200 text-center">
        <h1 className="text-2xl font-bold text-stone-900 mb-3">{paymentStatus === "approved" ? "Pago aprobado" : "Pago en validación"}</h1>
        <p className="text-sm text-stone-600 mb-2">{mensaje}</p>
        {transactionId && (
          <p className="text-xs text-stone-500 mb-6">ID de transacción: {transactionId}</p>
        )}
        {reference && (
          <p className="text-xs text-stone-500 mb-6">Referencia: {reference}</p>
        )}
        <Link href="/" className="inline-block bg-[#8cc63f] hover:bg-[#7cb433] text-white font-bold py-3 px-6 rounded-xl transition text-sm">
          Volver a la tienda
        </Link>
      </div>
    </main>
  );
}