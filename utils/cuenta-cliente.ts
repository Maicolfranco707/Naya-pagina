/** Departamentos de Colombia con su capital (para sugerir la tarifa de envío). */
export const CAPITALES_POR_DEPARTAMENTO: Record<string, string> = {
  "Amazonas": "Leticia",
  "Antioquia": "Medellín",
  "Arauca": "Arauca",
  "Atlántico": "Barranquilla",
  "Bogotá D.C.": "Bogotá",
  "Bolívar": "Cartagena",
  "Boyacá": "Tunja",
  "Caldas": "Manizales",
  "Caquetá": "Florencia",
  "Casanare": "Yopal",
  "Cauca": "Popayán",
  "Cesar": "Valledupar",
  "Chocó": "Quibdó",
  "Córdoba": "Montería",
  "Cundinamarca": "Bogotá",
  "Guainía": "Inírida",
  "Guaviare": "San José del Guaviare",
  "Huila": "Neiva",
  "La Guajira": "Riohacha",
  "Magdalena": "Santa Marta",
  "Meta": "Villavicencio",
  "Nariño": "Pasto",
  "Norte de Santander": "Cúcuta",
  "Putumayo": "Mocoa",
  "Quindío": "Armenia",
  "Risaralda": "Pereira",
  "San Andrés y Providencia": "San Andrés",
  "Santander": "Bucaramanga",
  "Sucre": "Sincelejo",
  "Tolima": "Ibagué",
  "Valle del Cauca": "Cali",
  "Vaupés": "Mitú",
  "Vichada": "Puerto Carreño",
};

export const DEPARTAMENTOS = Object.keys(CAPITALES_POR_DEPARTAMENTO);

function normalizarLugar(texto: string) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
}

const CAPITALES = new Set(Object.values(CAPITALES_POR_DEPARTAMENTO).map(normalizarLugar));

/** true si la ciudad es una capital de departamento (o Bogotá). */
export function esCiudadCapital(ciudad: string) {
  const limpia = normalizarLugar(ciudad).replace(/\b(d\.?c\.?)$/, "").trim();
  return CAPITALES.has(limpia) || limpia === "santa fe de bogota";
}

export interface PerfilCliente {
  first_name: string | null;
  last_name: string | null;
  identification: string | null;
  phone: string | null;
  address: string | null;
  apartment: string | null;
  region: string | null;
  city: string | null;
  postal_code: string | null;
}

export const PERFIL_VACIO: PerfilCliente = {
  first_name: "",
  last_name: "",
  identification: "",
  phone: "",
  address: "",
  apartment: "",
  region: "Antioquia",
  city: "",
  postal_code: "",
};

export const COLUMNAS_PERFIL =
  "first_name, last_name, identification, phone, address, apartment, region, city, postal_code";

/** Número corto y legible a partir de la referencia de Wompi (NAYA-xxxxxxxx...). */
export function numeroPedido(reference: string) {
  return `#${reference.replace(/^NAYA-/i, "").slice(0, 8).toUpperCase()}`;
}

export const ESTADO_PEDIDO: Record<string, string> = {
  pending: "Recibido",
  processing: "En preparación",
  shipped: "Enviado",
  completed: "Entregado",
  cancelled: "Cancelado",
};

export const ESTADO_PAGO: Record<string, string> = {
  pending: "Pago pendiente",
  approved: "Pagado",
  declined: "Pago rechazado",
  voided: "Pago anulado",
  error: "Error en el pago",
};

export function formatoPesos(valor: number) {
  return `$${valor.toLocaleString("es-CO")} COP`;
}
