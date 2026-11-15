"use client";

import Image from "next/image";
import { ArrowRight, MessageCircle } from "lucide-react";

const AROMAS = [
  { nombre: "Coco", src: "/naya_foto/coco_festival.png" },
  { nombre: "Uva", src: "/naya_foto/uva.png" },
  { nombre: "Kiwi", src: "/naya_foto/kiwi.png" },
  { nombre: "Cherry", src: "/naya_foto/cherry.png" },
];

export default function MantequillasBanner({ onShop, whatsappHref }: { onShop: () => void; whatsappHref: string }) {
  return (
    <div className="naya-mb">
      <div className="naya-mb__copy">
        <p className="naya-mb__eyebrow">Línea corporal</p>
        <h2>Mantequillas corporales</h2>
        <p className="naya-mb__text">Hidratación profunda con vitamina E para piel seca o áspera. Elige tu aroma favorito.</p>

        <ul className="naya-mb__aromas" aria-label="Aromas disponibles">
          {AROMAS.map((a) => (
            <li key={a.nombre}>
              <span className="naya-mb__thumb"><Image src={a.src} alt="" fill sizes="56px" className="object-cover" /></span>
              {a.nombre}
            </li>
          ))}
        </ul>

        <div className="naya-mb__actions">
          <button type="button" className="naya-mb__cta" onClick={onShop}>
            Ver mantequillas <ArrowRight size={16} aria-hidden="true" />
          </button>
          <a className="naya-mb__wa" href={whatsappHref} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={17} aria-hidden="true" /> ¿Cuál es para ti? Te asesoramos
          </a>
        </div>
        <p className="naya-mb__price">Desde <strong>$28.500</strong></p>
      </div>

      <div className="naya-mb__photo">
        <Image src="/naya_foto/mantequilla-mano.jpg" alt="Clienta con la Mantequilla Corporal NAYA" fill sizes="(max-width: 767px) 100vw, 45vw" className="object-cover" style={{ objectPosition: "center 40%" }} />
      </div>
    </div>
  );
}
