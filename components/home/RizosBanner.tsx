"use client";

import Image from "next/image";
import { ArrowRight, Leaf, MapPin, MessageCircle } from "lucide-react";

const DETALLES = [
  { icono: Leaf, texto: "Extractos botánicos" },
  { icono: MapPin, texto: "Hecho en Medellín" },
  { icono: MessageCircle, texto: "Asesoría por WhatsApp" },
];

export default function RizosBanner({ onShop }: { onShop: () => void }) {
  return (
    <div className="naya-rz">
      <div className="naya-rz__photo">
        <span className="naya-rz__arch-line" aria-hidden="true" />
        <div className="naya-rz__arch">
          <Image src="/naya_foto/rizos-modelo.jpg" alt="Clienta de NAYA con shampoo y acondicionador para rizos" fill sizes="(max-width: 767px) 70vw, 34vw" className="object-cover" style={{ objectPosition: "center 30%" }} />
        </div>
      </div>

      <div className="naya-rz__copy">
        <p className="naya-rz__eyebrow">NAYA · Cuidado capilar</p>
        <h2>Rizos que hablan de ti</h2>
        <p className="naya-rz__text">Nutrición y suavidad para realzar tu belleza natural.</p>
        <ul className="naya-rz__chips">
          {DETALLES.map(({ icono: Icono, texto }) => (
            <li key={texto}><Icono size={15} aria-hidden="true" /> {texto}</li>
          ))}
        </ul>
        <button type="button" className="naya-rz__cta" onClick={onShop}>
          Ver línea capilar <ArrowRight size={17} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
