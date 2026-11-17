import type { Metadata } from "next";
import Link from "next/link";
import { WHATSAPP_NUMBER } from "@/utils/contacto";
import { ENVIO_ANTIOQUIA, ENVIO_GRATIS_DESDE, ENVIO_NACIONAL } from "@/utils/envios";

export const metadata: Metadata = {
  title: "Envíos, cambios y devoluciones | NAYA",
  description: "Costos y tiempos de envío, seguimiento del pedido, cambios, devoluciones y derecho de retracto en NAYA.",
  alternates: { canonical: "/envios" },
};

const pesos = (v: number) => `$${v.toLocaleString("es-CO")}`;
const WHATSAPP = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola NAYA, tengo una pregunta sobre mi pedido.")}`;

export default function EnviosPage() {
  return (
    <main className="storefront account-page">
      <section className="account-card legal-page">
        <Link href="/" className="account-logo" aria-label="NAYA, volver al inicio">NAYA</Link>
        <h1>Envíos, cambios y devoluciones</h1>

        <h2>Costo del envío</h2>
        <table className="legal-table">
          <thead><tr><th>Destino</th><th>Costo</th><th>Tiempo estimado</th></tr></thead>
          <tbody>
            <tr><td>Medellín y área metropolitana</td><td>{pesos(ENVIO_ANTIOQUIA)}</td><td>2 a 5 días hábiles</td></tr>
            <tr><td>Resto de Antioquia</td><td>{pesos(ENVIO_ANTIOQUIA)}</td><td>3 a 5 días hábiles</td></tr>
            <tr><td>Resto de Colombia</td><td>{pesos(ENVIO_NACIONAL)}</td><td>3 a 5 días hábiles a ciudades principales; más de 5 a otros municipios</td></tr>
          </tbody>
        </table>
        <p><strong>Envío gratis</strong> en compras desde {pesos(ENVIO_GRATIS_DESDE)} (después de aplicar descuentos).</p>
        <p>Despachamos desde Medellín con transportadoras nacionales. Los tiempos cuentan a partir de la confirmación del pago y no incluyen fines de semana ni festivos.</p>

        <h2>Seguimiento de tu pedido</h2>
        <p>Cuando despachamos tu pedido te enviamos el número de guía por WhatsApp. Si compraste con tu cuenta, también lo ves en <Link href="/cuenta">Mi cuenta → Mis pedidos</Link>, junto con el estado: recibido, en preparación, enviado o entregado.</p>

        <h2>Si tu pedido llega con un problema</h2>
        <p>Si un producto llega roto, derramado, vencido o no corresponde a lo que pediste, escríbenos por WhatsApp dentro de los <strong>5 días hábiles</strong> siguientes a la entrega, con fotos del producto y del empaque. Lo revisamos y te lo cambiamos sin costo o te devolvemos el dinero.</p>

        <h2>Derecho de retracto</h2>
        <p>Por ser una compra por internet, tienes derecho a retractarte dentro de los <strong>5 días hábiles</strong> siguientes a la entrega (Ley 1480 de 2011, artículo 47). Para aceptarlo, el producto debe estar sellado, sin abrir ni usar y en su empaque original, porque son productos de cuidado personal. Los costos de la devolución corren por cuenta del cliente.</p>
        <p>Una vez recibamos y revisemos el producto, te devolvemos el dinero por el mismo medio de pago, a más tardar en 30 días calendario.</p>

        <h2>Cambios</h2>
        <p>Si quieres cambiar un producto sellado por otro, escríbenos dentro de los 5 días hábiles siguientes a la entrega. El costo del envío del cambio lo asume el cliente, salvo que el error haya sido nuestro.</p>

        <h2>¿Dudas?</h2>
        <p>Escríbenos por <a href={WHATSAPP} target="_blank" rel="noreferrer">WhatsApp</a> y te ayudamos.</p>
      </section>
    </main>
  );
}
