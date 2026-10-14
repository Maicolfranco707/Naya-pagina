import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY;
  const integritySecret = process.env.WOMPI_INTEGRITY_SECRET;

  if (!publicKey || !integritySecret) {
    return NextResponse.json(
      { error: "Falta configurar la llave pública o WOMPI_INTEGRITY_SECRET en el servidor." },
      { status: 503 }
    );
  }

  const secretPrefix = publicKey.startsWith("pub_test_")
    ? "test_integrity_"
    : publicKey.startsWith("pub_prod_")
      ? "prod_integrity_"
      : "";

  if (!secretPrefix || !integritySecret.startsWith(secretPrefix)) {
    return NextResponse.json(
      { error: "La llave pública y el secreto de integridad pertenecen a ambientes distintos." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null) as { orderId?: string } | null;
  if (!body?.orderId || !/^[0-9a-f-]{36}$/i.test(body.orderId)) {
    return NextResponse.json({ error: "El identificador del pedido no es válido." }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_order_payment_data", {
    p_order_id: body.orderId,
  });

  if (error || !Array.isArray(data) || data.length !== 1) {
    return NextResponse.json({ error: "No se encontró un pedido pendiente para pagar." }, { status: 404 });
  }

  const { reference, amount_in_cents: amountInCents } = data[0];
  const signature = createHash("sha256")
    .update(`${reference}${amountInCents}COP${integritySecret}`)
    .digest("hex");

  return NextResponse.json({ orderId: body.orderId, reference, amountInCents, signature });
}