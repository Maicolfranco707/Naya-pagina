import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const reference = new URL(request.url).searchParams.get("reference");
  if (!reference || !/^NAYA-[a-f0-9]{32}$/i.test(reference)) {
    return NextResponse.json({ error: "Referencia de pedido inválida." }, { status: 400 });
  }

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.rpc("get_order_payment_status", {
      p_reference: reference,
    });

    if (error) {
      console.error("Supabase order status query failed:", error.message);
      return NextResponse.json({ error: "No se pudo consultar el pedido." }, { status: 502 });
    }
    if (!Array.isArray(data) || data.length !== 1) {
      return NextResponse.json({ error: "No se encontró el pedido." }, { status: 404 });
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Supabase no está configurado.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}