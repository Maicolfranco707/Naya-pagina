// Transportadoras para el número de guía. La página es donde el cliente puede rastrear su envío.
export const TRANSPORTADORAS: Record<string, string> = {
  "Interrapidísimo": "https://www.interrapidisimo.com/",
  "Servientrega": "https://www.servientrega.com/",
  "Coordinadora": "https://www.coordinadora.com/",
  "Envía": "https://envia.co/",
  "TCC": "https://www.tcc.com.co/",
  "Otra": "",
};

export function paginaRastreo(transportadora: string | null | undefined) {
  return transportadora ? TRANSPORTADORAS[transportadora] ?? "" : "";
}
