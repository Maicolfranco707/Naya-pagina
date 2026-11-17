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
      .select("id, product_id, author_name, city, rating, comment, created_at, verified_purchase, photos")
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .limit(productoId ? 100 : 6);
    if (productoId) consulta = consulta.eq("product_id", productoId);
    const { data, error } = await consulta;
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("No se pudieron leer las reseñas:", error instanceof Error ? error.message : error);
    return NextResponse.json([]);
  }
}

/** "Leidy Zapata" → "Leidy Z." (como lo muestran las tiendas, para cuidar la privacidad). */
function nombreCorto(completo: string) {
  const partes = completo.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "";
  const nombre = partes[0].charAt(0).toUpperCase() + partes[0].slice(1).toLowerCase();
  return partes[1] ? `${nombre} ${partes[1].charAt(0).toUpperCase()}.` : nombre;
}

/** Un cliente con cuenta deja su reseña; queda pendiente hasta que NAYA la apruebe en el admin. */
export async function POST(request: Request) {
  const bloqueado = await limitarSolicitudes(request, "reviews", 5, 3600);
  if (bloqueado) return bloqueado;

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Inicia sesión para escribir una reseña." }, { status: 401 });
  const { data: sesion, error: sesionError } = await createSupabaseServerClient(token).auth.getUser();
  const usuario = sesion?.user;
  if (sesionError || !usuario) return NextResponse.json({ error: "Inicia sesión para escribir una reseña." }, { status: 401 });

  // Llega como formulario (multipart) para poder traer fotos
  const form = await request.formData().catch(() => null);
  const comentario = String(form?.get("comentario") ?? "").trim();
  const calificacion = Number(form?.get("calificacion"));
  const productoTexto = String(form?.get("productoId") ?? "");
  const productoId = /^\d+$/.test(productoTexto) ? Number(productoTexto) : null;
  const fotos = (form?.getAll("fotos") ?? []).filter((f): f is File => f instanceof File && f.size > 0);
  if (fotos.length > 3) return NextResponse.json({ error: "Puedes subir hasta 3 fotos." }, { status: 400 });
  for (const foto of fotos) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(foto.type) || foto.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "Las fotos deben ser JPG, PNG o WEBP de menos de 2 MB." }, { status: 400 });
    }
  }
  if (!productoId || comentario.length < 5 || comentario.length > 800
    || !Number.isInteger(calificacion) || calificacion < 1 || calificacion > 5) {
    return NextResponse.json({ error: "Elige las estrellas y escribe al menos unas palabras." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  try {
    // Nombre del perfil o de la cuenta
    const { data: perfil } = await admin.from("customer_profiles").select("first_name, last_name, city").eq("user_id", usuario.id).maybeSingle();
    const completo = [perfil?.first_name, perfil?.last_name].filter(Boolean).join(" ")
      || String(usuario.user_metadata?.full_name ?? "")
      || "Cliente NAYA";
    const autor = nombreCorto(completo) || "Cliente NAYA";

    // ¿Compró este producto con su cuenta y el pago fue aprobado?
    const { data: compras } = await admin
      .from("orders")
      .select("id, order_items!inner(product_id)")
      .eq("user_id", usuario.id)
      .eq("payment_status", "approved")
      .eq("order_items.product_id", productoId)
      .limit(1);
    const verificada = (compras ?? []).length > 0;

    // ¿Ya tiene reseña de este producto? (antes de subir fotos)
    const { data: existente } = await admin.from("product_reviews").select("id").eq("product_id", productoId).eq("user_id", usuario.id).maybeSingle();
    if (existente) return NextResponse.json({ error: "Ya escribiste una reseña de este producto. ¡Gracias!" }, { status: 409 });

    const urls: string[] = [];
    for (const foto of fotos) {
      const extension = foto.type === "image/png" ? "png" : foto.type === "image/webp" ? "webp" : "jpg";
      const ruta = `${usuario.id}/${crypto.randomUUID()}.${extension}`;
      const { error: subidaError } = await admin.storage.from("review-photos").upload(ruta, Buffer.from(await foto.arrayBuffer()), { contentType: foto.type });
      if (subidaError) throw subidaError;
      urls.push(admin.storage.from("review-photos").getPublicUrl(ruta).data.publicUrl);
    }

    const { error } = await admin.from("product_reviews").insert({
      product_id: productoId,
      user_id: usuario.id,
      author_name: autor.slice(0, 60),
      city: perfil?.city ? String(perfil.city).slice(0, 60) : null,
      rating: calificacion,
      comment: comentario,
      verified_purchase: verificada,
      photos: urls,
    });
    if (error) {
      if (error.code === "23505") return NextResponse.json({ error: "Ya escribiste una reseña de este producto. ¡Gracias!" }, { status: 409 });
      throw error;
    }

    const correo = process.env.STORE_NOTIFICATION_EMAIL;
    if (correo) {
      const limpio = (t: string) => t.replace(/[<>&]/g, "");
      const estrellas = "★".repeat(calificacion) + "☆".repeat(5 - calificacion);
      await deliverEmail(
        correo,
        `Nueva reseña por aprobar (${estrellas}) | NAYA`,
        `<p><strong>${limpio(autor)}</strong>${verificada ? " (compra verificada)" : ""} dejó una reseña:</p><p style="font-size:18px;color:#b86b2e">${estrellas}</p><p>“${limpio(comentario)}”</p>${urls.map((u) => `<img src="${u}" alt="" width="120" style="border-radius:8px;margin:0 6px 6px 0" />`).join("")}<p>Apruébala o descártala en el admin, pestaña <strong>Reseñas</strong>.</p>`,
        `${autor}${verificada ? " (compra verificada)" : ""} dejó una reseña: ${estrellas}\n\n"${comentario}"\n\nApruébala o descártala en el admin, pestaña Reseñas.`,
      ).catch((e) => console.error("No se pudo avisar de la reseña:", e));
    }
  } catch (error) {
    console.error("No se pudo guardar la reseña:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "No pudimos guardar tu reseña. Intenta de nuevo." }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
