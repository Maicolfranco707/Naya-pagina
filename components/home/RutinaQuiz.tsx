"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, Sparkles, X } from "lucide-react";
import type { Producto } from "@/utils/productos";

// Test "¿Qué mantequilla eres?" — IDs de las mantequillas en Supabase.
type Mantequilla = "coco" | "uva" | "kiwi" | "cherry";
const ID_MANTEQUILLA: Record<Mantequilla, number> = { coco: 5, kiwi: 7, uva: 8, cherry: 9 };

const RESULTADO: Record<Mantequilla, { titulo: string; texto: string }> = {
  kiwi: { titulo: "Eres Kiwi 🥝", texto: "Divertida, fresca y llena de energía. Su aroma verde y frutal te acompaña todo el día." },
  uva: { titulo: "Eres Uva 🍇", texto: "Sofisticada y elegante. Un aroma profundo y especial, como tú." },
  cherry: { titulo: "Eres Cherry 🍒", texto: "Dulce y romántica. Un aroma a cereza delicioso que deja tu piel suave y perfumada." },
  coco: { titulo: "Eres Coco Festival 🥥", texto: "Relajada y con alma de playa. Un aroma tropical que te hace sentir de vacaciones." },
};

interface Opcion { valor: Mantequilla; titulo: string; detalle: string; emoji: string }
const PREGUNTAS: Array<{ titulo: string; texto?: string; opciones: Opcion[] }> = [
  {
    titulo: "¿Cómo eres tú?",
    texto: "Cada mantequilla tiene su personalidad.",
    opciones: [
      { valor: "kiwi", titulo: "Divertida y espontánea", detalle: "Siempre con energía", emoji: "😄" },
      { valor: "uva", titulo: "Elegante y segura", detalle: "Me gustan los detalles", emoji: "💅" },
      { valor: "cherry", titulo: "Dulce y romántica", detalle: "Soy puro corazón", emoji: "💗" },
      { valor: "coco", titulo: "Tranquila y relajada", detalle: "Todo con calma", emoji: "🌴" },
    ],
  },
  {
    titulo: "Tu plan ideal de fin de semana",
    opciones: [
      { valor: "coco", titulo: "Playa, sol y piscina", detalle: "Nada como el calor", emoji: "🏖️" },
      { valor: "kiwi", titulo: "Salir con mis amigas", detalle: "Planes y risas", emoji: "🎉" },
      { valor: "uva", titulo: "Una cena especial", detalle: "Con una copa de vino", emoji: "🍷" },
      { valor: "cherry", titulo: "Spa en casa", detalle: "Velas, música y skincare", emoji: "🛁" },
    ],
  },
  {
    titulo: "¿Qué aroma te enamora?",
    opciones: [
      { valor: "cherry", titulo: "Dulce", detalle: "Frutos rojos y cereza", emoji: "🍒" },
      { valor: "coco", titulo: "Tropical", detalle: "Coco y vacaciones", emoji: "🥥" },
      { valor: "kiwi", titulo: "Fresco", detalle: "Frutal y verde", emoji: "🥝" },
      { valor: "uva", titulo: "Intenso", detalle: "Profundo y especial", emoji: "🍇" },
    ],
  },
];

interface Props {
  abierto: boolean;
  productos: Producto[];
  imagen: (p: Producto) => string;
  onClose: () => void;
  onAgregar: (productos: Producto[]) => void;
  /** "pagina": el test ocupa su propia página (/test-mantequillas), sin la tienda detrás. */
  modo?: "modal" | "pagina";
  /** En modo página: ya se agregó al carrito. */
  agregado?: boolean;
}

export default function RutinaQuiz({ abierto, productos, imagen, onClose, onAgregar, modo = "modal", agregado = false }: Props) {
  const [respuestas, setRespuestas] = useState<Mantequilla[]>([]);

  useEffect(() => {
    if (!abierto || modo === "pagina") return;
    setRespuestas([]);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [abierto, onClose, modo]);

  if (!abierto) return null;

  const paso = respuestas.length;
  const terminado = paso >= PREGUNTAS.length;

  // La que más se repite; si hay empate, gana el aroma (la última respuesta).
  let ganadora: Mantequilla | null = null;
  if (terminado) {
    const conteo = respuestas.reduce<Record<string, number>>((c, r) => ({ ...c, [r]: (c[r] ?? 0) + 1 }), {});
    const max = Math.max(...Object.values(conteo));
    const empatadas = Object.keys(conteo).filter((k) => conteo[k] === max) as Mantequilla[];
    ganadora = empatadas.includes(respuestas[respuestas.length - 1]) ? respuestas[respuestas.length - 1] : empatadas[0];
  }
  const producto = ganadora ? productos.find((p) => p.id === ID_MANTEQUILLA[ganadora!]) : undefined;
  const pregunta = PREGUNTAS[Math.min(paso, PREGUNTAS.length - 1)];

  return (
    <div
      className={modo === "pagina" ? "nq-page" : "nq"}
      role={modo === "pagina" ? undefined : "dialog"}
      aria-modal={modo === "pagina" ? undefined : true}
      aria-labelledby="nq-title"
      onClick={modo === "pagina" ? undefined : onClose}
    >
      <div className="nq__panel" onClick={(e) => e.stopPropagation()}>
        <div className="nq__top">
          {paso > 0 && !terminado ? (
            <button type="button" className="nq__icon" onClick={() => setRespuestas((r) => r.slice(0, -1))} aria-label="Pregunta anterior"><ArrowLeft size={20} /></button>
          ) : <span />}
          <p className="nq__brand">¿Qué mantequilla eres?</p>
          {modo === "pagina" ? <span /> : (
            <button type="button" className="nq__icon" onClick={onClose} aria-label="Cerrar test"><X size={20} /></button>
          )}
        </div>
        {!terminado && (
          <div className="nq__progress" aria-hidden="true"><span style={{ width: `${((paso + 1) / PREGUNTAS.length) * 100}%` }} /></div>
        )}

        <div className="nq__body" key={paso}>
          {!terminado ? (
            <>
              <p className="nq__step">Pregunta {paso + 1} de {PREGUNTAS.length}</p>
              <h2 id="nq-title">{pregunta.titulo}</h2>
              {pregunta.texto && <p className="nq__lead">{pregunta.texto}</p>}
              <div className="nq__options">
                {pregunta.opciones.map((o) => (
                  <button key={o.titulo} type="button" className="nq__option" onClick={() => setRespuestas((r) => [...r, o.valor])}>
                    <span className="nq__emoji" aria-hidden="true">{o.emoji}</span>
                    <span><strong>{o.titulo}</strong><small>{o.detalle}</small></span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="nq__eyebrow"><Sparkles size={14} aria-hidden="true" /> Tu mantequilla NAYA</p>
              <h2 id="nq-title">{ganadora ? RESULTADO[ganadora].titulo : ""}</h2>
              {ganadora && <p className="nq__lead">{RESULTADO[ganadora].texto}</p>}
              {producto ? (
                <>
                  <div className="nq__result">
                    <span className="nq__result-photo"><Image src={imagen(producto)} alt={producto.nombre} fill sizes="(max-width: 520px) 70vw, 260px" className="object-cover" /></span>
                    <div>
                      <strong>{producto.nombre.trim()}</strong>
                      <small>Hidratación profunda con vitamina E</small>
                      <b>${producto.precio.toLocaleString("es-CO")}</b>
                    </div>
                  </div>
                  {agregado ? (
                    <div className="nq__added">
                      <p><Check size={16} aria-hidden="true" /> ¡Listo! La agregamos a tu carrito.</p>
                      <Link href="/checkout" className="nq__cta nq__cta--link">Ir a pagar</Link>
                      <Link href="/" className="nq__secondary">Seguir comprando</Link>
                    </div>
                  ) : (
                    <button type="button" className="nq__cta" onClick={() => onAgregar([producto])}>
                      Agregar al carrito
                    </button>
                  )}
                  <p className="nq__coupon">Usa <strong>BIENVENIDA10</strong> y obtén 10% OFF en tu primera compra.</p>
                </>
              ) : (
                <p className="nq__lead">Estamos cargando los productos. Intenta de nuevo en un momento.</p>
              )}
              <div className="nq__after">
                <button type="button" onClick={() => setRespuestas([])}>Repetir el test</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
