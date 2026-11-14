export const DEPARTAMENTOS = ["Antioquia", "Bogotá D.C.", "Cundinamarca"] as const;
export const POBLACIONES = ["Medellín", "Bello", "Envigado"] as const;

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
  region: DEPARTAMENTOS[0],
  city: POBLACIONES[0],
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
