/**
 * Tarifas de envío (estilo Fauno, despacho desde Medellín).
 * IMPORTANTE: la misma regla vive en Supabase (función shipping_quote), que es la que cobra.
 * Si cambias algo aquí, cámbialo también allá.
 */
export const ENVIO_GRATIS_DESDE = 150000;
export const ENVIO_ANTIOQUIA = 10000;
export const ENVIO_NACIONAL = 14900;

const AREA_METROPOLITANA = ["medellin", "envigado", "bello", "sabaneta", "itagui"];

function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

export interface CotizacionEnvio {
  costo: number;
  zona: string;
  tiempo: string;
  gratis: boolean;
}

/** subtotalNeto = subtotal menos el descuento del cupón. */
export function cotizarEnvio(departamento: string, ciudad: string, subtotalNeto: number): CotizacionEnvio {
  const esAntioquia = normalizar(departamento) === "antioquia";
  const esAreaMetro = esAntioquia && AREA_METROPOLITANA.includes(normalizar(ciudad));
  const zona = esAreaMetro ? "Medellín y área metropolitana" : esAntioquia ? "Resto de Antioquia" : "Resto de Colombia";
  const tiempo = esAreaMetro
    ? "2 a 5 días hábiles"
    : esAntioquia
      ? "3 a 5 días hábiles"
      : "3 a 5 días hábiles a ciudades principales; más de 5 a otros municipios";
  if (subtotalNeto >= ENVIO_GRATIS_DESDE) return { costo: 0, zona, tiempo, gratis: true };
  return { costo: esAntioquia ? ENVIO_ANTIOQUIA : ENVIO_NACIONAL, zona, tiempo, gratis: false };
}
