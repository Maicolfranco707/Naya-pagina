import { CreditCard, Leaf, Truck } from "lucide-react";

const pilares = [
  {
    icon: <Truck aria-hidden="true" />,
    title: "Envíos a toda Colombia",
    desc: "Despachamos desde Medellín hasta la puerta de tu casa.",
  },
  {
    icon: <Leaf aria-hidden="true" />,
    title: "Hecho con extractos botánicos",
    desc: "Romero, cayena y frutas en cada fórmula.",
  },
  {
    icon: <CreditCard aria-hidden="true" />,
    title: "Paga como prefieras",
    desc: "Tarjeta, PSE o Nequi con Wompi, o transferencia por WhatsApp.",
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