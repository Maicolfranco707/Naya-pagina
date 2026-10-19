import { CreditCard, Leaf, Truck } from "lucide-react";

const pilares = [
  {
    icon: <Truck aria-hidden="true" />,
    title: "Envíos a todo Colombia",
    desc: "Llevamos tu ritual NAYA hasta la puerta de tu casa.",
  },
  {
    icon: <Leaf aria-hidden="true" />,
    title: "Cuidado de origen natural",
    desc: "Fórmulas inspiradas en extractos botánicos.",
  },
  {
    icon: <CreditCard aria-hidden="true" />,
    title: "Transferencia o Nequi",
    desc: "Opciones de pago para que elijas cómo comprar.",
  },
];

export default function Benefits() {
  return (
    <section id="garantias" className="naya-trust" aria-label="Beneficios de comprar en NAYA">
      {pilares.map((item) => (
        <article className="naya-trust__item" key={item.title}>
          <span className="naya-trust__icon">{item.icon}</span>
          <div>
            <h2>{item.title}</h2>
            <p>{item.desc}</p>
          </div>
        </article>
      ))}
    </section>
  );
}