"use client";

import Image from "next/image";
import { ArrowRight, CreditCard, Leaf, Truck } from "lucide-react";

const DETALLES = [
  { icono: Leaf, texto: "Extractos botánicos" },
  { icono: Truck, texto: "Envío gratis desde $150.000" },
  { icono: CreditCard, texto: "Tarjeta, PSE o Nequi" },
];

export default function RitualBanner({ onShop, onBody }: { onShop: () => void; onBody: () => void }) {
  return (
    <div className="naya-rt">
      <div className="naya-rt__copy">
        <p className="naya-rt__eyebrow">NAYA · Cuidado natural</p>
        <h2>Tu piel merece un ritual</h2>
        <p className="naya-rt__text">Nutrición, suavidad y bienestar con el poder de la naturaleza.</p>
        <div className="naya-rt__actions">
          <button type="button" className="naya-rt__cta" onClick={onShop}>
            Descubre NAYA <ArrowRight size={17} aria-hidden="true" />
          </button>
          <button type="button" className="naya-rt__link" onClick={onBody}>Ver mantequillas</button>
        </div>
        <ul className="naya-rt__list">
          {DETALLES.map(({ icono: Icono, texto }) => (
            <li key={texto}><Icono size={16} aria-hidden="true" /> {texto}</li>
          ))}
        </ul>
      </div>

      <div className="naya-rt__photo">
        <Image src="/naya_foto/ritual-modelo.jpg" alt="Clienta de NAYA con la mantequilla corporal Coco Festival" fill sizes="(max-width: 767px) 100vw, 50vw" className="object-cover" style={{ objectPosition: "center 25%" }} />
      </div>
    </div>
  );
}
