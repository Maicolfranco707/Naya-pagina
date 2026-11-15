import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/utils/supabase/server";
import { sendPaymentApprovedEmails } from "@/utils/email/order-emails";

export const runtime = "nodejs";

// Wompi firma cada evento: SHA256(valores de signature.properties + timestamp + secreto de eventos).
// Si la firma no coincide, el evento no viene de Wompi y se rechaza.
function eventoFirmadoPorWompi(event: Record<string, unknown>) {
  const secret = process.env.WOMPI_EVENTS_SECRET;
  if (!secret) throw new Error("Falta configurar WOMPI_EVENTS_SECRET.");

  const signature = event.signature as { properties?: unknown; checksum?: unknown } | undefined;
  const properties = signature?.properties;
  const checksum = signature?.checksum;
  if (!Array.isArray(properties) || typeof checksum !== "string" || event.timestamp === undefined) {
    return false;
  }

  const data = event.data as Record<string, unknown> | undefined;
  let concatenated = "";
  for (const property of properties) {
    if (typeof property !== "string") return false;
    let value: unknown = data;
    for (const key of property.split(".")) {
      value = value && typeof value === "object" ? (value as Record<string, unknown>)[key] : undefined;
    }
    if (value === undefined || value === null) return false;
    concatenated += String(value);
  }
  concatenated += String(event.timestamp) + secret;

  const expected = createHash("sha256").update(concatenated).digest("hex");
  const received = checksum.toLowerCase();
  return expected.length === received.length
    && timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}

export async function POST(request: Request) {
  try {
    const event = await request.json();

    if (!eventoFirmadoPorWompi(event)) {
      console.warn("Evento de Wompi con firma inválida, se ignora.");
      return NextResponse.json({ error: "Firma inválida." }, { status: 401 });
    }
    
    // Verificamos que sea un evento de transacción actualizada
    if (event.event !== "transaction.updated") {
      return NextResponse.json({ received: true });
    }

    const transaction = event.data?.transaction;
    const reference = transaction?.reference;
    const transactionId = transaction?.id;
    const amountInCents = transaction?.amount_in_cents;
    const status = transaction?.status;

    const paymentStatus: Record<string, string> = {
      APPROVED: "approved",
      DECLINED: "declined",
      VOIDED: "voided",
      ERROR: "error",
      PENDING: "pending",
    };

    if (!reference || !transactionId || !status || !paymentStatus[status]) {
      return NextResponse.json({ error: "Datos de transacción inválidos." }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // El monto cobrado debe coincidir con el total del pedido
    if (status === "APPROVED") {
      const { data: order } = await supabase
        .from("orders")
        .select("total_cop")
        .eq("reference", reference)
        .eq("payment_provider", "wompi")
        .maybeSingle();
      if (order && Number(amountInCents) !== Number(order.total_cop) * 100) {
        console.error(`Monto no coincide en ${reference}: ${amountInCents} vs ${order.total_cop * 100}`);
        return NextResponse.json({ error: "El monto no coincide con el pedido." }, { status: 400 });
      }
    }
    
    // Actualizamos el estado en la base de datos de Supabase
    const { data, error } = await supabase
      .from("orders")
      .update({
        payment_status: paymentStatus[status],
        payment_transaction_id: String(transactionId),
        order_status: status === "APPROVED" ? "processing" : "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("reference", reference)
      .eq("payment_provider", "wompi")
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("Error al actualizar la orden en Supabase:", error.message);
      return NextResponse.json({ error: "No se pudo actualizar la orden." }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "No se encontró una orden con esa referencia." }, { status: 404 });
    }

    // Si el pago fue aprobado, disparamos el envío del correo
    if (status === "APPROVED") {
      try {
        await sendPaymentApprovedEmails(data.id);
        console.log(`¡Correo de pago aprobado enviado con éxito para la orden ${data.id}!`);
      } catch (emailError) {
        console.error("No se pudo enviar el correo de pago aprobado:", emailError);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido en el webhook.";
    console.error("Error en el webhook de Wompi:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}