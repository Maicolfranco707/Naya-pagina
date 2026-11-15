"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Check, Copy } from "lucide-react";

// Banner de oferta (estilo campaña). Para cambiar la oferta, edita estas constantes.
const CODIGO = "BIENVENIDA10";
const CINTA = ["10% OFF", CODIGO, "ENVÍO GRATIS DESDE $150.000"];

function Cinta({ className }: { className: string }) {
  const texto = Array.from({ length: 6 }, () => CINTA).flat();
  return (
    <div className={`naya-promo__tape ${className}`} aria-hidden="true">
      {texto.map((t, i) => <span key={i}>{t}</span>)}
    </div>
  );
}

export default function PromoBanner({ onShop }: { onShop: () => void }) {
  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(CODIGO);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Si no se puede copiar, el código sigue visible.
    }
  };

  return (
    <div className="naya-promo">
      <Cinta className="naya-promo__tape--top" />
      <Cinta className="naya-promo__tape--bottom" />

      <div className="naya-promo__copy">
        <p className="naya-promo__eyebrow">Bienvenida NAYA</p>
        <h2 className="naya-promo__title">
          <strong>10%</strong>
          <span>OFF</span>
        </h2>
        <p className="naya-promo__subtitle">en tu primera compra</p>

        <button type="button" className="naya-promo__code" onClick={copiar} aria-label={`Copiar el código ${CODIGO}`}>
          <small>Código de descuento</small>
          <span>
            {CODIGO}
            {copiado ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
          </span>
          <em>{copiado ? "¡Copiado!" : "Toca para copiar"}</em>
        </button>

        <div className="naya-promo__actions">
          <button type="button" className="naya-promo__cta" onClick={onShop}>
            Comprar ahora <ArrowRight size={17} aria-hidden="true" />
          </button>
          <p>Envío gratis desde $150.000</p>
        </div>
      </div>

      <div className="naya-promo__products" aria-hidden="true">
        <div className="naya-promo__photo naya-promo__photo--back">
          <Image src="/naya_foto/kit-romero.png" alt="" fill sizes="(max-width: 767px) 45vw, 22vw" className="object-cover" priority />
        </div>
        <div className="naya-promo__photo naya-promo__photo--front">
          <Image src="/naya_foto/kit-cayena.png" alt="" fill sizes="(max-width: 767px) 50vw, 25vw" className="object-cover" priority />
        </div>
        <span className="naya-promo__sticker">-10%</span>
      </div>
    </div>
  );
}
