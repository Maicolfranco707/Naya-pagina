import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

export const runtime = "nodejs";

interface CreateOrderBody {
  customer: Record<string, string>;
  items: Array<{ id: number; cantidad: number }>;
  shippingCost: number;
  paymentProvider: "wompi" | "whatsapp";
}

export async function POST(request: Request) {
  let body: CreateOrderBody;
  try {
    body = await request.json() as CreateOrderBody;
  } catch {
    return NextResponse.json({ error: "La solicitud no contiene JSON válido." }, { status: 400 });
  }

  if (
    !body.customer ||
    !Array.isArray(body.items) ||
    ![25000, 30000].includes(body.shippingCost) ||
    !["wompi", "whatsapp"].includes(body.paymentProvider)
  ) {
    return NextResponse.json({ error: "Revisa los datos del pedido e intenta de nuevo." }, { status: 400 });
  }

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.rpc("create_order", {
      p_customer: body.customer,
      p_items: body.items,
      p_shipping_cop: body.shippingCost,
      p_payment_provider: body.paymentProvider,
    });

    if (error) {
      console.error("Supabase order creation failed:", error.message);
      return NextResponse.json(
        { error: "No se pudo guardar el pedido. Verifica el catálogo y vuelve a intentar." },
        { status: 400 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Supabase no está configurado.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}