import nodemailer from "nodemailer";
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
  discount_cop: number | null;
  coupon_code: string | null;
  total_cop: number;
  payment_provider: string;
  order_items: Array<{
    product_name: string;
    unit_price_cop: number;
    quantity: number;
    line_total_cop: number;
    products: { image_url: string } | null;
    image_url: string | null;
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

function orderNumber(reference: string) {
  const code = reference.replace(/^NAYA-/i, "").slice(0, 8).toUpperCase();
  return `#${code}`;
}

function formatCop(value: number) {
  return `$${value.toLocaleString("es-CO")} COP`;
}

function productImageUrl(imagePath: string | null) {
  if (!imagePath) return null;

  if (/^https?:\/\//i.test(imagePath)) return imagePath;

  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  if (!configuredSiteUrl) {
    throw new Error("Configura NEXT_PUBLIC_SITE_URL para incluir imágenes en los correos.");
  }
  const imageUrl = new URL(imagePath, configuredSiteUrl);
  if (imageUrl.protocol !== "https:" && imageUrl.protocol !== "http:") {
    throw new Error(`URL de imagen de producto no válida: ${imagePath}`);
  }
  return imageUrl.toString();
}

function orderHtml(order: OrderEmailData, heading: string, intro: string) {
  const items = order.order_items.map((item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e8e1d8;color:#213a35">
        ${item.image_url ? `<img src="${escapeHtml(item.image_url)}" alt="${escapeHtml(item.product_name)}" width="64" height="64" style="display:block;width:64px;height:64px;object-fit:cover;border-radius:6px;margin-bottom:8px" />` : ""}
        ${escapeHtml(item.product_name)} × ${item.quantity}
      </td>
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
        <p style="margin-bottom:4px">Pedido <strong style="font-size:18px">${orderNumber(order.reference)}</strong></p>
        <p style="margin-top:0;color:#9aa5a1;font-size:11px">Referencia de pago: ${escapeHtml(order.reference)}</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tbody>${items}</tbody>
        </table>
        <table style="width:100%;margin-top:12px;font-size:14px">
          <tbody>
            <tr><td style="padding:5px 0">Subtotal</td><td style="padding:5px 0;text-align:right">${formatCop(order.subtotal_cop)}</td></tr>
            ${order.discount_cop ? `<tr><td style="padding:5px 0">Descuento${order.coupon_code ? ` (${escapeHtml(order.coupon_code)})` : ""}</td><td style="padding:5px 0;text-align:right;color:#2f6b45">−${formatCop(order.discount_cop)}</td></tr>` : ""}
            <tr><td style="padding:5px 0">Envío</td><td style="padding:5px 0;text-align:right">${order.shipping_cop === 0 ? "Gratis" : formatCop(order.shipping_cop)}</td></tr>
            <tr><td style="padding:10px 0;border-top:1px solid #e8e1d8;font-weight:bold">Total</td><td style="padding:10px 0;border-top:1px solid #e8e1d8;text-align:right;font-weight:bold">${formatCop(order.total_cop)}</td></tr>
          </tbody>
        </table>
        <p style="margin-bottom:0;color:#65726e;font-size:13px">
          ${escapeHtml(order.customer_name)} · ${escapeHtml(order.customer_email)} · ${escapeHtml(order.customer_phone)}<br />
          ${escapeHtml(order.shipping_address)}${order.shipping_apartment ? `, ${escapeHtml(order.shipping_apartment)}` : ""}, ${escapeHtml(order.shipping_city)}, ${escapeHtml(order.shipping_region)}
        </p>
      </div>
      <p style="padding:0 12px;color:#65726e;font-size:12px">Gracias por elegir NAYA.</p>
    </div>
  </body>
</html>`;
}

function orderText(order: OrderEmailData, heading: string, intro: string) {
  const items = order.order_items
    .map((item) => `- ${item.product_name} x ${item.quantity}: ${formatCop(item.line_total_cop)}${item.image_url ? `\n  Imagen: ${item.image_url}` : ""}`)
    .join("\n");

  return [
    `NAYA | ${heading}`,
    "",
    intro,
    `Pedido: ${orderNumber(order.reference)}`,
    `Referencia de pago: ${order.reference}`,
    "",
    items,
    "",
    `Subtotal: ${formatCop(order.subtotal_cop)}`,
    ...(order.discount_cop ? [`Descuento${order.coupon_code ? ` (${order.coupon_code})` : ""}: -${formatCop(order.discount_cop)}`] : []),
    `Envío: ${order.shipping_cop === 0 ? "Gratis" : formatCop(order.shipping_cop)}`,
    `Total: ${formatCop(order.total_cop)}`,
    "",
    `Cliente: ${order.customer_name}`,
    `Correo: ${order.customer_email}`,
    `Teléfono: ${order.customer_phone}`,
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

// Si hay credenciales de Gmail (correo + contraseña de aplicación), los correos
// salen desde ese Gmail y llegan a cualquier destinatario. Si no, se usa Resend.
async function deliverEmail(to: string, subject: string, html: string, text: string) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");

  if (gmailUser && gmailPassword) {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: gmailUser, pass: gmailPassword },
    });
    await transporter.sendMail({
      from: `"NAYA Cosmética Natural" <${gmailUser}>`,
      to,
      subject,
      html,
      text,
    });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    throw new Error("Falta configurar GMAIL_USER y GMAIL_APP_PASSWORD (o RESEND_API_KEY y RESEND_FROM_EMAIL).");
  }
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({ from, to, subject, html, text });
  if (error) throw new Error(error.message);
}

async function sendOnce(eventKey: string, to: string, subject: string, html: string, text: string) {
  const claimed = await claimEmailEvent(eventKey);
  if (!claimed) return false;

  try {
    await deliverEmail(to, subject, html, text);
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
    .select("id, reference, customer_name, customer_email, customer_phone, shipping_address, shipping_apartment, shipping_city, shipping_region, subtotal_cop, discount_cop, coupon_code, shipping_cop, total_cop, payment_provider, order_items(product_name, unit_price_cop, quantity, line_total_cop, products(image_url))")
    .eq("id", orderId)
    .single();

  if (error || !data) throw new Error(`No se pudo cargar la orden para notificar: ${error?.message ?? "sin datos"}`);
  const rawOrder = data as unknown as Omit<OrderEmailData, "order_items"> & {
    order_items: Array<Omit<OrderEmailData["order_items"][number], "products" | "image_url"> & {
      products: { image_url: string } | null;
    }>;
  };

  return {
    ...rawOrder,
    order_items: rawOrder.order_items.map((item) => ({
      ...item,
      image_url: productImageUrl(item.products?.image_url ?? null),
    })),
  };
}

export async function sendOrderPlacedEmails(orderId: string) {
  const order = await loadOrder(orderId);
  const subject = `Recibimos tu pedido ${orderNumber(order.reference)} | NAYA`;
  const intro = order.payment_provider === "wompi"
    ? "Recibimos tu pedido. El pago está pendiente de confirmación."
    : "Recibimos tu pedido. Nuestro equipo coordinará contigo la transferencia por WhatsApp.";
  const html = orderHtml(order, "Pedido recibido", intro);
  const text = orderText(order, "Pedido recibido", intro);
  const notificationEmail = process.env.STORE_NOTIFICATION_EMAIL;

  const results = await Promise.allSettled([
    sendOnce(`order-placed:${order.id}:customer`, order.customer_email, subject, html, text),
    ...(notificationEmail
      ? [sendOnce(`order-placed:${order.id}:store`, notificationEmail, `Nuevo pedido ${orderNumber(order.reference)} · ${formatCop(order.total_cop)} | NAYA`, html, text)]
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
  if (!notificationEmail) {
    throw new Error("Falta configurar STORE_NOTIFICATION_EMAIL para enviar el aviso de venta.");
  }

  await Promise.all([
    sendOnce(`payment-approved:${order.id}:customer`, order.customer_email, `¡Pago confirmado! Tu pedido ${orderNumber(order.reference)} | NAYA`, html, text),
    sendOnce(`payment-approved:${order.id}:store`, notificationEmail, `Nueva venta ${orderNumber(order.reference)} · ${formatCop(order.total_cop)} | NAYA`, html, text),
  ]);
}