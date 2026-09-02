"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function ConfirmacionPage() {
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const txId = params.get("transactionId") || params.get("id");
    const ref = params.get("reference");

    if (txId) setTransactionId(txId);
    if (ref) setReference(ref);

    const storedTx = localStorage.getItem("wompi_transaction_id");
    if (!txId && storedTx) setTransactionId(storedTx);
  }, []);

  const mensaje = useMemo(() => {
    if (transactionId) {
      return "Tu pago fue confirmado por Wompi. Estamos procesando tu pedido.";
    }
    return "Estamos validando tu transacción. Gracias por comprar en Naya.";
  }, [transactionId]);

  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-stone-200 text-center">
        <h1 className="text-2xl font-bold text-stone-900 mb-3">{transactionId ? "Pago recibido" : "Procesando pago"}</h1>
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