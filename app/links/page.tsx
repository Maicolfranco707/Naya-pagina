import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "NAYA · Links",
  description: "Tienda online, WhatsApp y redes de NAYA Renovación.",
  alternates: { canonical: "/links" },
};

const WHATSAPP = "https://wa.me/573042051221?text=Hola%20NAYA%2C%20quiero%20hacer%20un%20pedido";
const FACEBOOK = "https://www.facebook.com/share/1CJUGboHRu/";
const TIKTOK = "https://www.tiktok.com/@nayarenovacion";

function IconoWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
      <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z" />
    </svg>
  );
}
function IconoFacebook() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3z" />
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
  { titulo: "Tienda online", href: "/" },
  { titulo: "Pedidos por WhatsApp", href: WHATSAPP, externo: true },
  { titulo: "Facebook", href: FACEBOOK, externo: true },
  { titulo: "TikTok", href: TIKTOK, externo: true },
];

export default function LinksPage() {
  return (
    <main className="nl">
      <div className="nl__card">
        <div className="nl__avatar">
          <Image src="/naya_foto/naya-logo.png" alt="Logo de NAYA" fill sizes="190px" className="object-cover" priority />
        </div>
        <h1 className="nl__name">NAYA Renovación</h1>
        <p className="nl__tag">Cuidado natural · Medellín, Colombia</p>

        <div className="nl__social">
          <a href={WHATSAPP} target="_blank" rel="noreferrer" aria-label="WhatsApp de NAYA"><IconoWhatsApp /></a>
          <a href={FACEBOOK} target="_blank" rel="noreferrer" aria-label="Facebook de NAYA"><IconoFacebook /></a>
          <a href={TIKTOK} target="_blank" rel="noreferrer" aria-label="TikTok de NAYA"><IconoTikTok /></a>
        </div>

        <ul className="nl__links">
          {ENLACES.map(({ titulo, href, externo }) => (
            <li key={titulo}>
              <a href={href} className="nl__link" {...(externo ? { target: "_blank", rel: "noreferrer" } : {})}>
                {titulo}
              </a>
            </li>
          ))}
        </ul>

        <p className="nl__foot">Envíos a toda Colombia</p>
      </div>
    </main>
  );
}
