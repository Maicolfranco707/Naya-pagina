import { NextResponse } from "next/server";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/utils/supabase/server";
import { deliverEmail } from "@/utils/email/order-emails";
import { paginaRastreo } from "@/utils/transportadoras";

function escapar(texto: string) {
  return texto.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

// Envía al cliente un correo con el número de guía. Solo lo puede llamar un administrador.
export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { data: esAdmin, error: adminError } = await createSupabaseServerClient(token).rpc("is_admin");
  if (adminError || esAdmin !== true) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

  const body = await request.json().catch(() => null) as { orderId?: unknown } | null;
  const orderId = typeof body?.orderId === "string" ? body.orderId : "";
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) return NextResponse.json({ error: "Pedido no válido." }, { status: 400 });

  const { data: pedido, error } = await createSupabaseAdminClient()
    .from("orders")
    .select("reference, customer_name, customer_email, shipping_city, tracking_carrier, tracking_number")
    .eq("id", orderId)
    .maybeSingle();
  if (error || !pedido) return NextResponse.json({ error: "No encontramos el pedido." }, { status: 404 });
  if (!pedido.tracking_number) return NextResponse.json({ error: "El pedido no tiene guía." }, { status: 400 });

  const nombre = escapar(String(pedido.customer_name).split(" ")[0] ?? "");
  const numero = `#${String(pedido.reference).replace(/^NAYA-/i, "").slice(0, 8).toUpperCase()}`;
  const transportadora = pedido.tracking_carrier && pedido.tracking_carrier !== "Otra" ? escapar(pedido.tracking_carrier) : "";
  const guia = escapar(pedido.tracking_number);
  const rastreo = paginaRastreo(pedido.tracking_carrier);
  const sitio = process.env.NEXT_PUBLIC_SITE_URL || "https://naya-pagina.vercel.app";

  const html = `<!doctype html>
<html lang="es">
  <body style="margin:0;background:#f6efe6;font-family:Arial,sans-serif;color:#213a35">
    <div style="max-width:600px;margin:0 auto;padding:32px 18px">
      <div style="background:#213a35;padding:24px 28px;color:#f6efe6">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:2px">NAYA</p>
        <h1 style="margin:0;font-size:24px">Tu pedido va en camino</h1>
      </div>
      <div style="background:#fff;padding:28px">
        <p style="margin-top:0">Hola ${nombre}, ya despachamos tu pedido <strong>${numero}</strong>.</p>
        <div style="margin:18px 0;padding:16px 18px;border-radius:10px;background:#f6efe6">
          ${transportadora ? `<p style="margin:0 0 6px;font-size:14px">Transportadora: <strong>${transportadora}</strong></p>` : ""}
          <p style="margin:0;font-size:14px">Número de guía: <strong style="font-size:18px">${guia}</strong></p>
        </div>
        ${rastreo ? `<p><a href="${rastreo}" style="display:inline-block;background:#b86b2e;color:#fff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:999px;font-size:14px">Rastrear mi envío</a></p>
        <p style="color:#65726e;font-size:13px">En la página de la transportadora busca la opción de rastreo y pega tu número de guía.</p>` : ""}
        <p style="color:#65726e;font-size:13px">Si tienes alguna pregunta, responde este correo o escríbenos por WhatsApp. ¡Gracias por comprar en NAYA!</p>
        <p style="margin-bottom:0;font-size:12px;color:#9aa5a1"><a href="${sitio}/envios" style="color:#9aa5a1">Envíos, cambios y devoluciones</a></p>
      </div>
    </div>
  </body>
</html>`;
  const texto = `Hola ${String(pedido.customer_name).split(" ")[0]}, tu pedido NAYA ${numero} va en camino.\n${pedido.tracking_carrier && pedido.tracking_carrier !== "Otra" ? `Transportadora: ${pedido.tracking_carrier}\n` : ""}Número de guía: ${pedido.tracking_number}\n${rastreo ? `Rastrea tu envío en ${rastreo}\n` : ""}¡Gracias por comprar en NAYA!`;

  try {
    await deliverEmail(pedido.customer_email, `Tu pedido NAYA ${numero} va en camino 🚚`, html, texto);
  } catch (envioError) {
    console.error("No se pudo enviar el correo de la guía:", envioError);
    return NextResponse.json({ error: "No se pudo enviar el correo." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
