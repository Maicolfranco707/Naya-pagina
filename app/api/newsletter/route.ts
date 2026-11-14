import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 200) {
    return NextResponse.json({ error: "Escribe un correo válido." }, { status: 400 });
  }

  try {
    const { error } = await createSupabaseServerClient().from("newsletter_subscribers").insert({ email, source: "home" });
    // 23505 = ya estaba suscrito: para el cliente es igual de válido.
    if (error && error.code !== "23505") {
      console.error("No se pudo guardar la suscripción:", error.message);
      return NextResponse.json({ error: "No pudimos suscribirte. Intenta de nuevo." }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Supabase no está configurado.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
