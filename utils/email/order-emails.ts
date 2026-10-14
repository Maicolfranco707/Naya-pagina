import { Resend } from "resend";
import { createSupabaseAdminClient } from "@/utils/supabase/server";

interface OrderEmailData {
  id: string;
  reference: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_apartment: string | null;
  shipping_city: string;
  shipping_region: string;
  subtotal_cop: number;
  shipping_cop: number;
  total_cop: number;
  payment_provider: string;
  order_items: Array<{
    product_name: string;
    unit_price_cop: number;
    quantity: number;
    line_total_cop: number;
  }>;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function formatCop(value: number) {
  return `$${value.toLocaleString("es-CO")} COP`;
}

function orderHtml(order: OrderEmailData, heading: string, intro: string) {
  const items = order.order_items.map((item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e8e1d8;color:#213a35">${escapeHtml(item.product_name)} × ${item.quantity}</td>
      <td style="padding:10px 0;border-bottom:1px solid #e8e1d8;text-align:right;color:#213a35">${formatCop(item.line_total_cop)}</td>
    </tr>`).join("");

  return `<!doctype html>
<html lang="es">
  <body style="margin:0;background:#f6efe6;font-family:Arial,sans-serif;color:#213a35">
    <div style="max-width:600px;margin:0 auto;padding:32px 18px">
      <div style="background:#213a35;padding:24px 28px;color:#f6efe6">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:2px">NAYA</p>
        <h1 style="margin:0;font-size:24px">${heading}</h1>
      </div>
      <div style="background:#fff;padding:28px">
        <p style="margin-top:0">${intro}</p>
        <p>Pedido <strong>${escapeHtml(order.reference)}</strong></p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tbody>${items}</tbody>
        </table>
        <table style="width:100%;margin-top:12px;font-size:14px">
          <tbody>
            <tr><td style="padding:5px 0">Subtotal</td><td style="padding:5px 0;text-align:right">${formatCop(order.subtotal_cop)}</td></tr>
            <tr><td style="padding:5px 0">Envío</td><td style="padding:5px 0;text-align:right">${formatCop(order.shipping_cop)}</td></tr>
            <tr><td style="padding:10px 0;border-top:1px solid #e8e1d8;font-weight:bold">Total</td><td style="padding:10px 0;border-top:1px solid #e8e1d8;text-align:right;font-weight:bold">${formatCop(order.total_cop)}</td></tr>
          </tbody>
        </table>
        <p style="margin-bottom:0;color:#65726e;font-size:13px">${escapeHtml(order.customer_name)} · ${escapeHtml(order.shipping_address)}${order.shipping_apartment ? `, ${escapeHtml(order.shipping_apartment)}` : ""}, ${escapeHtml(order.shipping_city)}, ${escapeHtml(order.shipping_region)}</p>
      </div>
      <p style="padding:0 12px;color:#65726e;font-size:12px">Gracias por elegir NAYA.</p>
    </div>
  </body>
</html>`;
}

function orderText(order: OrderEmailData, heading: string, intro: string) {
  const items = order.order_items
    .map((item) => `- ${item.product_name} x ${item.quantity}: ${formatCop(item.line_total_cop)}`)
    .join("\n");

  return [
    `NAYA | ${heading}`,
    "",
    intro,
    `Pedido: ${order.reference}`,
    "",
    items,
    "",
    `Subtotal: ${formatCop(order.subtotal_cop)}`,
    `Envío: ${formatCop(order.shipping_cop)}`,
    `Total: ${formatCop(order.total_cop)}`,
    "",
    `Cliente: ${order.customer_name}`,
    `Dirección: ${order.shipping_address}${order.shipping_apartment ? `, ${order.shipping_apartment}` : ""}, ${order.shipping_city}, ${order.shipping_region}`,
    "",
    "Gracias por elegir NAYA.",
  ].join("\n");
}

async function claimEmailEvent(eventKey: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("email_notifications").insert({ event_key: eventKey });

  if (error?.code === "23505") return false;
  if (error) throw new Error(`No se pudo registrar el correo transaccional: ${error.message}`);
  return true;
}

async function sendOnce(eventKey: string, to: string, subject: string, html: string, text: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    throw new Error("Falta configurar RESEND_API_KEY o RESEND_FROM_EMAIL.");
  }

  const claimed = await claimEmailEvent(eventKey);
  if (!claimed) return false;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({ from, to, subject, html, text });
    if (error) throw new Error(error.message);
    return true;
  } catch (error) {
    const supabase = createSupabaseAdminClient();
    await supabase.from("email_notifications").delete().eq("event_key", eventKey);
    throw error;
  }
}

async function loadOrder(orderId: string): Promise<OrderEmailData> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, reference, customer_name, customer_email, customer_phone, shipping_address, shipping_apartment, shipping_city, shipping_region, subtotal_cop, shipping_cop, total_cop, payment_provider, order_items(product_name, unit_price_cop, quantity, line_total_cop)")
    .eq("id", orderId)
    .single();

  if (error || !data) throw new Error(`No se pudo cargar la orden para notificar: ${error?.message ?? "sin datos"}`);
  return data as unknown as OrderEmailData;
}

export async function sendOrderPlacedEmails(orderId: string) {
  const order = await loadOrder(orderId);
  const subject = `Recibimos tu pedido ${order.reference} | NAYA`;
  const intro = order.payment_provider === "wompi"
    ? "Recibimos tu pedido. El pago está pendiente de confirmación."
    : "Recibimos tu pedido. Nuestro equipo coordinará contigo la transferencia por WhatsApp.";
  const html = orderHtml(order, "Pedido recibido", intro);
  const text = orderText(order, "Pedido recibido", intro);
  const notificationEmail = process.env.STORE_NOTIFICATION_EMAIL;

  const results = await Promise.allSettled([
    sendOnce(`order-placed:${order.id}:customer`, order.customer_email, subject, html, text),
    ...(notificationEmail
      ? [sendOnce(`order-placed:${order.id}:store`, notificationEmail, `Nuevo pedido ${order.reference} | NAYA`, html, text)]
      : []),
  ]);

  for (const result of results) {
    if (result.status === "rejected") {
      console.error("Order placed email failed:", result.reason instanceof Error ? result.reason.message : "unknown error");
    }
  }
}

export async function sendPaymentApprovedEmails(orderId: string) {
  const order = await loadOrder(orderId);
  const intro = "Wompi confirmó tu pago. Estamos preparando tu pedido.";
  const html = orderHtml(order, "Pago confirmado", intro);
  const text = orderText(order, "Pago confirmado", intro);
  const notificationEmail = process.env.STORE_NOTIFICATION_EMAIL;

  await Promise.all([
    sendOnce(`payment-approved:${order.id}:customer`, order.customer_email, `Pago confirmado para ${order.reference} | NAYA`, html, text),
    ...(notificationEmail
      ? [sendOnce(`payment-approved:${order.id}:store`, notificationEmail, `Pago aprobado ${order.reference} | NAYA`, html, text)]
      : []),
  ]);
}