import { NextResponse } from "next/server";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/utils/supabase/server";
import { limitarSolicitudes } from "@/utils/rate-limit";
import { deliverEmail } from "@/utils/email/order-emails";

export const runtime = "nodejs";

/** Reseñas aprobadas (las más recientes), para el inicio o para un producto (?producto=ID). */
export async function GET(request: Request) {
  const productoParam = new URL(request.url).searchParams.get("producto");
  const productoId = productoParam && /^\d+$/.test(productoParam) ? Number(productoParam) : null;
  try {
    let consulta = createSupabaseServerClient()
      .from("product_reviews")
      .select("id, product_id, author_name, city, rating, comment, created_at")
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .limit(productoId ? 50 : 6);
    if (productoId) consulta = consulta.eq("product_id", productoId);
    const { data, error } = await consulta;
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("No se pudieron leer las reseñas:", error instanceof Error ? error.message : error);
    return NextResponse.json([]);
  }
}

/** Un cliente deja su reseña; queda pendiente hasta que NAYA la apruebe en el admin. */
export async function POST(request: Request) {
  const bloqueado = await limitarSolicitudes(request, "reviews", 3, 3600);
  if (bloqueado) return bloqueado;

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const nombre = typeof body?.nombre === "string" ? body.nombre.trim() : "";
  const ciudad = typeof body?.ciudad === "string" ? body.ciudad.trim().slice(0, 60) : "";
  const comentario = typeof body?.comentario === "string" ? body.comentario.trim() : "";
  const calificacion = Number(body?.calificacion);
  const productoId = typeof body?.productoId === "number" && Number.isInteger(body.productoId) ? body.productoId : null;
  // Campo trampa para bots: un humano no lo llena
  if (typeof body?.sitio === "string" && body.sitio) return NextResponse.json({ ok: true });

  if (nombre.length < 2 || nombre.length > 60 || comentario.length < 5 || comentario.length > 800
    || !Number.isInteger(calificacion) || calificacion < 1 || calificacion > 5) {
    return NextResponse.json({ error: "Revisa tu nombre, la calificación y el comentario." }, { status: 400 });
  }

  try {
    const { error } = await createSupabaseAdminClient().from("product_reviews").insert({
      product_id: productoId,
      author_name: nombre,
      city: ciudad || null,
      rating: calificacion,
      comment: comentario,
    });
    if (error) throw error;
  } catch (error) {
    console.error("No se pudo guardar la reseña:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "No pudimos guardar tu opinión. Intenta de nuevo." }, { status: 502 });
  }

  const correo = process.env.STORE_NOTIFICATION_EMAIL;
  if (correo) {
    const limpio = (t: string) => t.replace(/[<>&]/g, "");
    const estrellas = "★".repeat(calificacion) + "☆".repeat(5 - calificacion);
    try {
      await deliverEmail(
        correo,
        `Nueva reseña por aprobar (${estrellas}) | NAYA`,
        `<p><strong>${limpio(nombre)}</strong>${ciudad ? ` (${limpio(ciudad)})` : ""} dejó una reseña:</p><p style="font-size:18px;color:#b86b2e">${estrellas}</p><p>“${limpio(comentario)}”</p><p>Apruébala o descártala en el admin, pestaña <strong>Reseñas</strong>.</p>`,
        `${nombre}${ciudad ? ` (${ciudad})` : ""} dejó una reseña: ${estrellas}\n\n"${comentario}"\n\nApruébala o descártala en el admin, pestaña Reseñas.`,
      );
    } catch (error) {
      console.error("No se pudo avisar de la reseña:", error instanceof Error ? error.message : error);
    }
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
