import type { Producto } from "@/utils/productos";
import { medirAgregarAlCarrito } from "@/utils/analytics";

/** Categorías de la tienda (menú COMPRAR, filtros y "productos relacionados"). */
export type CategoriaTienda = "Capilar" | "Ampolletas" | "Corporal" | "Kits";
export const CATEGORIAS_TIENDA: CategoriaTienda[] = ["Capilar", "Ampolletas", "Corporal", "Kits"];

export function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

/** "Mantequilla Corporal  Cherry" → "mantequilla-corporal-cherry" */
export function slugProducto(producto: Pick<Producto, "nombre">): string {
  return normalizar(producto.nombre).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function urlProducto(producto: Pick<Producto, "nombre">): string {
  return `/producto/${slugProducto(producto)}`;
}

export function categoriaTienda(producto: Producto): CategoriaTienda {
  const texto = normalizar(`${producto.nombre} ${producto.categoria}`);
  if (texto.startsWith("kit") || normalizar(producto.categoria).startsWith("kit")) return "Kits";
  if (texto.includes("ampollet")) return "Ampolletas";
  if (texto.includes("mantequilla") || texto.includes("corporal") || texto.includes("frutal")) return "Corporal";
  return "Capilar";
}

/** Foto de cada producto (algunas fotos son mejores que la guardada en Supabase). */
export function imagenDe(producto: Producto): string {
  const texto = normalizar(`${producto.nombre} ${producto.categoria}`);
  if (normalizar(producto.categoria).startsWith("kit")) return producto.imagen;
  if (texto.includes("ampollet") && texto.includes("crecimiento")) return "/naya_foto/ampolleta-crecimiento-jardin.jpg";
  if (texto.includes("ampollet") && texto.includes("nutricion")) return "/naya_foto/ampolleta-nutricion-jardin.jpg";
  if (texto.includes("shampoo") && texto.includes("cayena")) return "/naya_foto/shampoocayena.png";
  if (texto.includes("shampoo") && texto.includes("romero")) return "/naya_foto/shampooromero.png";
  if (texto.includes("acondicionador") && texto.includes("romero")) return "/naya_foto/acondicionador2.png";
  if (texto.includes("acondicionador") && texto.includes("cayena")) return "/naya_foto/acondicionador1.png";
  return producto.imagen;
}

export interface InfoProducto {
  beneficios: string[];
  modoUso: string;
  idealPara: string;
  /** Fotos extra para la galería de la página del producto. */
  galeria?: string[];
}

// TODO (NAYA): revisar estos textos con la información real de cada producto.
const SHAMPOO = "Aplica sobre el cabello húmedo y masajea el cuero cabelludo con las yemas de los dedos durante 1 a 2 minutos. Enjuaga con abundante agua y repite si lo necesitas.";
const ACONDICIONADOR = "Después del shampoo, retira el exceso de agua y aplica de medios a puntas. Deja actuar de 2 a 3 minutos, desenreda con los dedos y enjuaga.";
const MANTEQUILLA = "Aplica sobre la piel limpia y seca, idealmente después de la ducha. Masajea con movimientos circulares hasta que se absorba, sobre todo en codos, rodillas, manos y piernas.";

export const INFO_PRODUCTOS: Record<number, InfoProducto> = {
  1: { // Shampoo de Cayena
    beneficios: ["Favorece el crecimiento del cabello", "Nutre el folículo piloso"],
    modoUso: `${SHAMPOO} Complementa con el Acondicionador de Cayena.`,
    idealPara: "Cabello normal, seco, opaco o con frizz.",
  },
  2: { // Acondicionador de Cayena
    beneficios: ["Desenreda al instante", "Deja el cabello suave y manejable", "Ayuda a controlar el frizz"],
    modoUso: ACONDICIONADOR,
    idealPara: "Cabello seco, opaco, con frizz o difícil de peinar.",
  },
  3: { // Shampoo de Romero
    beneficios: ["Fortalece la hebra capilar", "Ayuda a controlar el exceso de grasa", "Acompaña el crecimiento saludable"],
    modoUso: `${SHAMPOO} Complementa con el Acondicionador de Romero.`,
    idealPara: "Cabello débil, quebradizo, con caída o graso en la raíz.",
    galeria: ["/naya_foto/shampoo-romero-espuma.jpg"],
  },
  4: { // Acondicionador de Romero
    beneficios: ["Hidrata y desenreda", "Aporta fuerza al cabello débil", "Suavidad sin peso"],
    modoUso: ACONDICIONADOR,
    idealPara: "Cabello débil, quebradizo o con tendencia a la caída.",
  },
  5: { // Mantequilla Coco Festival
    beneficios: ["Hidratación profunda", "Con vitamina E", "Aroma tropical a coco"],
    modoUso: MANTEQUILLA,
    idealPara: "Piel seca o áspera que necesita hidratación extra.",
  },
  6: { // Ampolleta de Crecimiento
    beneficios: ["Ayuda a potenciar el crecimiento", "A base de ácido hialurónico, biotina y romero", "Deja el cabello suave y con brillo"],
    modoUso: "Uso 1: mezcla la ampolleta con la misma cantidad de agua hasta formar una crema. Aplica y deja actuar mínimo 20 minutos (lo ideal es ponerte un gorrito para generar calor). Enjuaga y aplica el acondicionador para sellar.\nUso 2: agrega el contenido de la ampolleta a tu Shampoo de Romero NAYA, deja reposar 12 horas y listo.",
    idealPara: "Cabello débil, con caída o que quieres que crezca más.",
  },
  7: { // Mantequilla Kiwi
    beneficios: ["Hidratación profunda", "Con vitamina E", "Aroma fresco y frutal"],
    modoUso: MANTEQUILLA,
    idealPara: "Piel seca o áspera que necesita hidratación extra.",
  },
  8: { // Mantequilla Uva
    beneficios: ["Hidratación profunda", "Con vitamina E", "Aroma intenso y especial"],
    modoUso: MANTEQUILLA,
    idealPara: "Piel seca o áspera que necesita hidratación extra.",
  },
  9: { // Mantequilla Cherry
    beneficios: ["Hidratación profunda", "Con vitamina E", "Aroma dulce a cereza"],
    modoUso: MANTEQUILLA,
    idealPara: "Piel seca o áspera que necesita hidratación extra.",
  },
  10: { // Ampolleta de Nutrición
    beneficios: ["Nutrición e hidratación profunda al instante"],
    modoUso: "Uso 1: mezcla la ampolleta con la misma cantidad de agua hasta formar una crema. Aplica de medios a puntas con el cabello limpio y deja actuar mínimo 20 minutos (lo ideal es ponerte un gorrito para generar calor). Enjuaga y aplica el acondicionador para sellar.\nUso 2: agrega el contenido de la ampolleta a tu Shampoo de Romero NAYA, deja reposar 12 horas y listo.",
    idealPara: "Cabellos porosos, maltratados, con procesos químicos o expuestos a piscina, sol y mar.",
  },
  11: { // Kit de Romero
    beneficios: ["Rutina completa en 3 pasos", "Fortalece y ayuda a frenar la caída", "Ahorras frente a comprar por separado"],
    modoUso: "1. Lava con el Shampoo de Romero. 2. Aplica el Acondicionador de Romero de medios a puntas y enjuaga. 3. Complementa con la ampolleta, mezclada con tu shampoo o directamente en la raíz.",
    idealPara: "Cabello débil, quebradizo, con caída o graso en la raíz.",
    galeria: ["/naya_foto/shampoo-romero-espuma.jpg"],
  },
  12: { // Kit de Cayena
    beneficios: ["Rutina completa en 3 pasos", "Hidrata, da brillo y controla el frizz", "Ahorras frente a comprar por separado"],
    modoUso: "1. Lava con el Shampoo de Cayena. 2. Mezcla la Ampolleta de Nutrición con la misma cantidad de agua, aplícala de medios a puntas y deja actuar 20 minutos. 3. Enjuaga y sella con el Acondicionador de Cayena.",
    idealPara: "Cabello seco, opaco o con frizz.",
    galeria: ["/naya_foto/ig/cayena-flor.jpg"],
  },
};

/** Los favoritos que se muestran en el inicio (ids de Supabase). */
export const IDS_FAVORITOS = [12, 11, 6, 9];

/** "Otros productos que te podrían interesar": primero de la misma categoría, luego del resto. */
export function relacionados(producto: Producto, todos: Producto[], cantidad = 4): Producto[] {
  // Primero lo de la misma línea (Romero con Romero, Cayena con Cayena); luego la misma categoría.
  const linea = (p: Producto) => {
    const n = normalizar(p.nombre);
    if (n.includes("romero") || (n.includes("ampollet") && n.includes("crecimiento"))) return "romero";
    if (n.includes("cayena") || (n.includes("ampollet") && n.includes("nutricion"))) return "cayena";
    if (n.includes("mantequilla")) return "mantequilla";
    return "";
  };
  const miLinea = linea(producto);
  const miCat = categoriaTienda(producto);
  const puntaje = (p: Producto) => (miLinea && linea(p) === miLinea ? 2 : 0) + (categoriaTienda(p) === miCat ? 1 : 0);
  return todos
    .filter((p) => p.id !== producto.id)
    .map((p, i) => ({ p, s: puntaje(p), i }))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .slice(0, cantidad)
    .map((x) => x.p);
}

export const CLAVE_CARRITO = "carrito_naya";
export interface ItemCarrito { producto: Producto; cantidad: number }

export function leerCarrito(): ItemCarrito[] {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE_CARRITO) ?? "[]");
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

/** Agrega al carrito guardado y avisa a la página (evento "naya-carrito"). Devuelve el total de unidades. */
export function agregarAlCarritoGuardado(producto: Producto, cantidad = 1): number {
  const carrito = leerCarrito();
  const existe = carrito.find((i) => i.producto.id === producto.id);
  if (existe) existe.cantidad += cantidad;
  else carrito.push({ producto, cantidad });
  localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
  window.dispatchEvent(new Event("naya-carrito"));
  medirAgregarAlCarrito({ id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad });
  return carrito.reduce((s, i) => s + i.cantidad, 0);
}
