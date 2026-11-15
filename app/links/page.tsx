import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, Gift, ShoppingBag, Sparkles, Truck } from "lucide-react";

export const metadata: Metadata = {
  title: "NAYA · Links",
  description: "Tienda online, WhatsApp y redes de NAYA Renovación.",
  alternates: { canonical: "/links" },
};

const WHATSAPP = "https://wa.me/573042051221?text=Hola%20NAYA%2C%20quiero%20hacer%20un%20pedido";
const INSTAGRAM = "https://www.instagram.com/naya_renovacion/";
const TIKTOK = "https://www.tiktok.com/@nayarenovacion";

function IconoWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
      <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z" />
    </svg>
  );
}
function IconoInstagram() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconoTikTok() {
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" fill="currentColor" aria-hidden="true">
      <path d="M16.6 3c.3 2.2 1.6 3.6 3.9 3.8v3.1c-1.4.1-2.6-.3-3.9-1.1v5.9c0 7.5-8.2 9.8-11.5 4.5-2.1-3.4-.8-9.3 6-9.6v3.3c-.5.1-1.1.2-1.6.4-1.5.5-2.4 1.5-2.2 3.2.5 3.3 6.6 4.3 6.1-2.2V3h3.2z" />
    </svg>
  );
}

const ENLACES = [
  { titulo: "Tienda online", texto: "Compra con tarjeta, PSE o Nequi", href: "/", icono: ShoppingBag, destacado: true },
  { titulo: "Comprar por WhatsApp", texto: "Te asesoramos y hacemos tu pedido", href: WHATSAPP, icono: IconoWhatsApp, externo: true },
  { titulo: "Todos los productos", texto: "Capilar, ampolletas, kits y mantequillas", href: "/productos", icono: Sparkles },
  { titulo: "¿Qué mantequilla eres?", texto: "Haz el test y descubre tu aroma", href: "/test-mantequillas", icono: Gift },
  { titulo: "Instagram", texto: "@naya_renovacion", href: INSTAGRAM, icono: IconoInstagram, externo: true },
  { titulo: "TikTok", texto: "Videos, tips y ofertas", href: TIKTOK, icono: IconoTikTok, externo: true },
];

export default function LinksPage() {
  return (
    <main className="nl">
      <div className="nl__card">
        <div className="nl__avatar">
          <Image src="/naya_foto/kit-romero.png" alt="" fill sizes="96px" className="object-cover" priority />
        </div>
        <h1 className="nl__name">NAYA</h1>
        <p className="nl__tag">Cosmética natural para tu cabello y tu piel · Hecho en Medellín</p>

        <div className="nl__social">
          <a href={WHATSAPP} target="_blank" rel="noreferrer" aria-label="WhatsApp de NAYA"><IconoWhatsApp /></a>
          <a href={INSTAGRAM} target="_blank" rel="noreferrer" aria-label="Instagram de NAYA"><IconoInstagram /></a>
          <a href={TIKTOK} target="_blank" rel="noreferrer" aria-label="TikTok de NAYA"><IconoTikTok /></a>
        </div>

        <div className="nl__promo">
          <span>10% OFF en tu primera compra</span>
          <strong>BIENVENIDA10</strong>
        </div>

        <ul className="nl__links">
          {ENLACES.map(({ titulo, texto, href, icono: Icono, externo, destacado }) => (
            <li key={titulo}>
              <a
                href={href}
                className={destacado ? "nl__link nl__link--main" : "nl__link"}
                {...(externo ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                <span className="nl__icon"><Icono /></span>
                <span className="nl__text"><b>{titulo}</b><small>{texto}</small></span>
                <ArrowUpRight size={18} aria-hidden="true" className="nl__arrow" />
              </a>
            </li>
          ))}
        </ul>

        <p className="nl__foot"><Truck size={15} aria-hidden="true" /> Envíos a toda Colombia · Gratis desde $150.000</p>
      </div>
    </main>
  );
}
