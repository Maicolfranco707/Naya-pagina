import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { limitarSolicitudes } from "@/utils/rate-limit";

export const runtime = "nodejs";

interface CreateOrderBody {
  customer: Record<string, string>;
  items: Array<{ id: number; cantidad: number }>;
  paymentProvider: "wompi" | "whatsapp";
  couponCode?: string | null;
}

export async function POST(request: Request) {
  // Máximo 8 pedidos cada 10 minutos por visitante
  const bloqueado = await limitarSolicitudes(request, "orders", 8, 600);
  if (bloqueado) return bloqueado;

  let body: CreateOrderBody;
  try {
    body = await request.json() as CreateOrderBody;
  } catch {
    return NextResponse.json({ error: "La solicitud no contiene JSON válido." }, { status: 400 });
  }

  if (
    !body.customer ||
    !Array.isArray(body.items) ||
    !["wompi", "whatsapp"].includes(body.paymentProvider) ||
    (body.couponCode != null && (typeof body.couponCode !== "string" || body.couponCode.length > 30))
  ) {
    return NextResponse.json({ error: "Revisa los datos del pedido e intenta de nuevo." }, { status: 400 });
  }

  try {
    // Si el cliente inició sesión, el pedido queda ligado a su cuenta (orders.user_id = auth.uid()).
    // Un token vencido o inválido no bloquea la compra: el pedido se guarda como invitado.
    let accessToken: string | undefined;
    const authHeader = request.headers.get("authorization") ?? "";
    const bearer = authHeader.match(/^Bearer\s+(.+)$/i)?.[1];
    if (bearer) {
      const { data: userData, error: userError } = await createSupabaseServerClient().auth.getUser(bearer);
      if (!userError && userData.user) accessToken = bearer;
    }

    const supabase = createSupabaseServerClient(accessToken);
    const { data, error } = await supabase.rpc("create_order", {
      p_customer: body.customer,
      p_items: body.items,
      p_payment_provider: body.paymentProvider,
      p_coupon: body.couponCode?.trim() || null,
    });

    if (error) {
      console.error("Supabase order creation failed:", error.message);
      const cuponInvalido = error.message.match(/Coupon: (.+)$/)?.[1];
      if (cuponInvalido) {
        return NextResponse.json({ error: cuponInvalido, couponError: true }, { status: 400 });
      }
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