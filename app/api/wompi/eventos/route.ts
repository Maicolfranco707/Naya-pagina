import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/utils/supabase/server";
import { sendPaymentApprovedEmails } from "@/utils/email/order-emails";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const event = await request.json();
    
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
      await sendPaymentApprovedEmails(data.id);
      console.log(`¡Correo de pago aprobado enviado con éxito para la orden ${data.id}!`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido en el webhook.";
    console.error("Error en el webhook de Wompi:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}