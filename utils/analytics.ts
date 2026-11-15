/**
 * Medición para anuncios (Píxel de Meta) y estadísticas (Google Analytics).
 * Solo funciona si en Vercel están NEXT_PUBLIC_META_PIXEL_ID y/o NEXT_PUBLIC_GA_ID.
 */

type Item = { id: number | string; nombre: string; precio: number; cantidad?: number };

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

function enviar(metaEvento: string, metaDatos: Record<string, unknown>, gaEvento: string, gaDatos: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    window.fbq?.("track", metaEvento, metaDatos);
    window.gtag?.("event", gaEvento, gaDatos);
  } catch {
    // La medición nunca debe romper la tienda
  }
}

const gaItems = (items: Item[]) =>
  items.map((i) => ({ item_id: String(i.id), item_name: i.nombre.trim(), price: i.precio, quantity: i.cantidad ?? 1 }));

export function medirVerProducto(item: Item) {
  enviar(
    "ViewContent",
    { content_ids: [String(item.id)], content_name: item.nombre.trim(), content_type: "product", value: item.precio, currency: "COP" },
    "view_item",
    { currency: "COP", value: item.precio, items: gaItems([item]) },
  );
}

export function medirAgregarAlCarrito(item: Item) {
  const cantidad = item.cantidad ?? 1;
  enviar(
    "AddToCart",
    { content_ids: [String(item.id)], content_name: item.nombre.trim(), content_type: "product", value: item.precio * cantidad, currency: "COP" },
    "add_to_cart",
    { currency: "COP", value: item.precio * cantidad, items: gaItems([item]) },
  );
}

export function medirInicioCheckout(items: Item[], total: number) {
  enviar(
    "InitiateCheckout",
    { content_ids: items.map((i) => String(i.id)), num_items: items.reduce((s, i) => s + (i.cantidad ?? 1), 0), value: total, currency: "COP" },
    "begin_checkout",
    { currency: "COP", value: total, items: gaItems(items) },
  );
}

const CLAVE_COMPRA = "naya_compra_pendiente";

/** Se guarda antes de ir a Wompi, para medir la compra cuando el pago se aprueba. */
export function guardarCompraPendiente(reference: string, total: number, items: Item[]) {
  try {
    sessionStorage.setItem(CLAVE_COMPRA, JSON.stringify({ reference, total, items }));
  } catch {
    // sin almacenamiento: no se mide la compra
  }
}

export function medirCompraAprobada(reference: string) {
  try {
    const guardada = sessionStorage.getItem(CLAVE_COMPRA);
    if (!guardada) return;
    const compra = JSON.parse(guardada) as { reference: string; total: number; items: Item[] };
    if (compra.reference !== reference) return;
    sessionStorage.removeItem(CLAVE_COMPRA); // una sola vez por compra
    enviar(
      "Purchase",
      { content_ids: compra.items.map((i) => String(i.id)), content_type: "product", value: compra.total, currency: "COP" },
      "purchase",
      { transaction_id: reference, currency: "COP", value: compra.total, items: gaItems(compra.items) },
    );
  } catch {
    // ignorar
  }
}
