import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

export const runtime = "nodejs";

/** Vista previa del cupón en el checkout. El descuento real lo vuelve a calcular create_order. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { code?: unknown; subtotal?: unknown; email?: unknown } | null;
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  const subtotal = typeof body?.subtotal === "number" ? body.subtotal : NaN;
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (!code || code.length > 30 || !Number.isInteger(subtotal) || subtotal < 0) {
    return NextResponse.json({ valid: false, message: "Escribe un código válido." }, { status: 400 });
  }

  try {
    const { data, error } = await createSupabaseServerClient().rpc("evaluate_coupon", {
      p_code: code,
      p_subtotal: subtotal,
      p_email: email || null,
    });
    if (error) {
      console.error("No se pudo validar el cupón:", error.message);
      return NextResponse.json({ valid: false, message: "No pudimos validar el código. Intenta de nuevo." }, { status: 502 });
    }
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Supabase no está configurado.";
    return NextResponse.json({ valid: false, message }, { status: 503 });
  }
}
