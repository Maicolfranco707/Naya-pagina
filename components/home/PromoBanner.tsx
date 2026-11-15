"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, Check, Copy } from "lucide-react";

// Banner de oferta (estilo campaña). Para cambiar la oferta, edita estas constantes.
const CODIGO = "BIENVENIDA10";
const CINTA = ["10% OFF", CODIGO, "ENVÍO GRATIS DESDE $150.000"];

// Productos que van rotando en el banner (fotos en public/naya_foto).
const PRODUCTOS = [
  { nombre: "Shampoo de Romero", src: "/naya_foto/shampoo-romero-espuma.jpg" },
  { nombre: "Ampolleta de Nutrición", src: "/naya_foto/ampolleta-nutricion-jardin.jpg" },
  { nombre: "Mantequilla Cherry", src: "/naya_foto/cherry.png" },
  { nombre: "Kit de Cayena", src: "/naya_foto/kit-cayena.png" },
  { nombre: "Ampolleta de Crecimiento", src: "/naya_foto/ampolleta-crecimiento-jardin.jpg" },
  { nombre: "Mantequilla Kiwi", src: "/naya_foto/kiwi.png" },
  { nombre: "Shampoo de Cayena", src: "/naya_foto/shampoocayena.png" },
  { nombre: "Kit de Romero", src: "/naya_foto/kit-romero.png" },
];

function posicion(i: number, actual: number) {
  const n = PRODUCTOS.length;
  const d = (i - actual + n) % n;
  if (d === 0) return "front";
  if (d === 1) return "right";
  if (d === n - 1) return "left";
  if (d === 2) return "next";
  return "hidden";
}

function Cinta({ className }: { className: string }) {
  const texto = Array.from({ length: 4 }, () => CINTA).flat();
  return (
    <div className={`naya-promo__tape ${className}`} aria-hidden="true">
      {/* dos copias iguales para que la cinta corra sin saltos */}
      <div className="naya-promo__tape-track">
        {[0, 1].map((copia) => (
          <div key={copia} className="naya-promo__tape-group">
            {texto.map((t, i) => <span key={i}>{t}</span>)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PromoBanner({ onShop }: { onShop: () => void }) {
  const [copiado, setCopiado] = useState(false);
  const [actual, setActual] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setActual((a) => (a + 1) % PRODUCTOS.length), 2600);
    return () => window.clearInterval(id);
  }, []);

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
        {PRODUCTOS.map((p, i) => (
          <figure key={p.src} className="naya-promo__card" data-pos={posicion(i, actual)}>
            <Image src={p.src} alt="" fill sizes="(max-width: 767px) 40vw, 20vw" className="object-cover" priority={i < 3} />
            <figcaption>{p.nombre}</figcaption>
          </figure>
        ))}
        <span className="naya-promo__sticker">-10%</span>
      </div>
    </div>
  );
}
