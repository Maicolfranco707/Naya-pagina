"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowLeft, MessageCircle, Sparkles, X } from "lucide-react";
import type { Producto } from "@/utils/productos";

// IDs de productos en Supabase.
const ID = {
  shampooCayena: 1, shampooRomero: 3, coco: 5, ampCrecimiento: 6, kiwi: 7, uva: 8, cherry: 9,
  ampNutricion: 10, kitRomero: 11, kitCayena: 12,
} as const;

export type InicioTest = "cabello" | "piel" | null;
type Linea = "cayena" | "romero";
type Extra = "nutricion" | "crecimiento";
type Paso = "inicio" | "cabello1" | "cabello2" | "piel1" | "resultado";

interface Opcion<T> { valor: T; titulo: string; detalle: string; emoji: string }

const QUE_CUIDAR: Opcion<"cabello" | "piel" | "ambos">[] = [
  { valor: "cabello", titulo: "Mi cabello", detalle: "Shampoo, acondicionador y ampolletas", emoji: "💇‍♀️" },
  { valor: "piel", titulo: "Mi piel", detalle: "Mantequillas corporales", emoji: "🧴" },
  { valor: "ambos", titulo: "Los dos", detalle: "Una rutina completa", emoji: "✨" },
];
const CABELLO: Opcion<Linea>[] = [
  { valor: "cayena", titulo: "Reseco, opaco o con frizz", detalle: "Le falta brillo y suavidad", emoji: "🌺" },
  { valor: "romero", titulo: "Débil, quebradizo o se me cae", detalle: "Lo siento frágil", emoji: "🌿" },
  { valor: "romero", titulo: "Graso en la raíz", detalle: "Se ensucia rápido", emoji: "💧" },
  { valor: "cayena", titulo: "Difícil de peinar", detalle: "Se enreda con facilidad", emoji: "🪮" },
];
const OBJETIVO: Opcion<Extra>[] = [
  { valor: "crecimiento", titulo: "Que crezca más", detalle: "Quiero ver más largo", emoji: "📏" },
  { valor: "crecimiento", titulo: "Frenar la caída", detalle: "Que se caiga menos", emoji: "🛡️" },
  { valor: "nutricion", titulo: "Hidratación profunda", detalle: "Suave y manejable", emoji: "💦" },
  { valor: "nutricion", titulo: "Brillo y cero frizz", detalle: "Que se vea sano", emoji: "✨" },
];
const PIEL: Opcion<number>[] = [
  { valor: ID.kiwi, titulo: "Divertida y fresca", detalle: "Mantequilla de Kiwi", emoji: "🥝" },
  { valor: ID.uva, titulo: "Sofisticada", detalle: "Mantequilla de Uva", emoji: "🍇" },
  { valor: ID.cherry, titulo: "Dulce y romántica", detalle: "Mantequilla Cherry", emoji: "🍒" },
  { valor: ID.coco, titulo: "Relajada, alma de playa", detalle: "Mantequilla Coco Festival", emoji: "🥥" },
];

const RAZON_LINEA: Record<Linea, string> = {
  cayena: "La línea Cayena hidrata, controla el frizz y devuelve el brillo al cabello seco.",
  romero: "La línea Romero fortalece la hebra, ayuda a frenar la caída y controla la grasa.",
};

interface Props {
  abierto: boolean;
  inicio: InicioTest;
  productos: Producto[];
  imagen: (p: Producto) => string;
  onClose: () => void;
  onAgregar: (productos: Producto[]) => void;
  whatsappHref: string;
}

export default function RutinaQuiz({ abierto, inicio, productos, imagen, onClose, onAgregar, whatsappHref }: Props) {
  const [paso, setPaso] = useState<Paso>("inicio");
  const [historial, setHistorial] = useState<Paso[]>([]);
  const [cuidar, setCuidar] = useState<"cabello" | "piel" | "ambos">("cabello");
  const [linea, setLinea] = useState<Linea | null>(null);
  const [extra, setExtra] = useState<Extra | null>(null);
  const [mantequilla, setMantequilla] = useState<number | null>(null);

  useEffect(() => {
    if (!abierto) return;
    // Reinicia el test cada vez que se abre (y salta la primera pregunta si se abrió desde un banner).
    setLinea(null); setExtra(null); setMantequilla(null); setHistorial([]);
    if (inicio === "piel") { setCuidar("piel"); setPaso("piel1"); }
    else if (inicio === "cabello") { setCuidar("cabello"); setPaso("cabello1"); }
    else setPaso("inicio");
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [abierto, inicio, onClose]);

  if (!abierto) return null;

  const ir = (siguiente: Paso) => { setHistorial((h) => [...h, paso]); setPaso(siguiente); };
  const atras = () => { setHistorial((h) => { const copia = [...h]; const prev = copia.pop(); if (prev) setPaso(prev); return copia; }); };

  const buscar = (id: number) => productos.find((p) => p.id === id);
  const recomendados: Array<{ producto: Producto; razon: string }> = [];
  if (paso === "resultado") {
    if (linea) {
      const kit = buscar(linea === "cayena" ? ID.kitCayena : ID.kitRomero);
      if (kit) recomendados.push({ producto: kit, razon: RAZON_LINEA[linea] });
      const ampDelKit: Extra = linea === "cayena" ? "nutricion" : "crecimiento";
      if (extra && extra !== ampDelKit) {
        const amp = buscar(extra === "nutricion" ? ID.ampNutricion : ID.ampCrecimiento);
        if (amp) recomendados.push({ producto: amp, razon: extra === "nutricion" ? "Para sumar hidratación profunda y brillo." : "Para estimular el crecimiento y fortalecer desde la raíz." });
      }
    }
    if (mantequilla) {
      const m = buscar(mantequilla);
      if (m) recomendados.push({ producto: m, razon: "Hidratación profunda con vitamina E y el aroma que va contigo." });
    }
  }
  const total = recomendados.reduce((s, r) => s + r.producto.precio, 0);
  const totalPasos = cuidar === "ambos" ? 4 : 3;
  const numeroPaso = { inicio: 1, cabello1: 2, cabello2: 3, piel1: cuidar === "ambos" ? 4 : 2, resultado: totalPasos }[paso];

  const Tarjetas = <T,>({ opciones, onElegir }: { opciones: Opcion<T>[]; onElegir: (v: T) => void }) => (
    <div className="nq__options">
      {opciones.map((o) => (
        <button key={o.titulo} type="button" className="nq__option" onClick={() => onElegir(o.valor)}>
          <span className="nq__emoji" aria-hidden="true">{o.emoji}</span>
          <span><strong>{o.titulo}</strong><small>{o.detalle}</small></span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="nq" role="dialog" aria-modal="true" aria-labelledby="nq-title" onClick={onClose}>
      <div className="nq__panel" onClick={(e) => e.stopPropagation()}>
        <div className="nq__top">
          {historial.length > 0 && paso !== "resultado" ? (
            <button type="button" className="nq__icon" onClick={atras} aria-label="Pregunta anterior"><ArrowLeft size={20} /></button>
          ) : <span />}
          <p className="nq__brand">Test NAYA</p>
          <button type="button" className="nq__icon" onClick={onClose} aria-label="Cerrar test"><X size={20} /></button>
        </div>
        {paso !== "resultado" && (
          <div className="nq__progress" aria-hidden="true"><span style={{ width: `${(numeroPaso / totalPasos) * 100}%` }} /></div>
        )}

        <div className="nq__body" key={paso}>
          {paso === "inicio" && (
            <>
              <h2 id="nq-title">Descubre tu rutina ideal</h2>
              <p className="nq__lead">Responde 3 preguntas y te decimos qué productos NAYA son para ti.</p>
              <Tarjetas opciones={QUE_CUIDAR} onElegir={(v) => { setCuidar(v); ir(v === "piel" ? "piel1" : "cabello1"); }} />
            </>
          )}
          {paso === "cabello1" && (
            <>
              <h2 id="nq-title">¿Cómo sientes tu cabello?</h2>
              <Tarjetas opciones={CABELLO} onElegir={(v) => { setLinea(v); ir("cabello2"); }} />
            </>
          )}
          {paso === "cabello2" && (
            <>
              <h2 id="nq-title">¿Qué es lo que más quieres lograr?</h2>
              <Tarjetas opciones={OBJETIVO} onElegir={(v) => { setExtra(v); ir(cuidar === "ambos" ? "piel1" : "resultado"); }} />
            </>
          )}
          {paso === "piel1" && (
            <>
              <h2 id="nq-title">¿Cómo eres tú?</h2>
              <p className="nq__lead">Cada mantequilla tiene su personalidad. Elige la que va contigo.</p>
              <Tarjetas opciones={PIEL} onElegir={(v) => { setMantequilla(v); ir("resultado"); }} />
            </>
          )}
          {paso === "resultado" && (
            <>
              <p className="nq__eyebrow"><Sparkles size={14} aria-hidden="true" /> Tu rutina NAYA</p>
              <h2 id="nq-title">{recomendados.length > 1 ? "Estos son para ti" : "Este es para ti"}</h2>
              {recomendados.length === 0 ? (
                <p className="nq__lead">Estamos cargando los productos. Intenta de nuevo en un momento.</p>
              ) : (
                <ul className="nq__results">
                  {recomendados.map(({ producto, razon }) => (
                    <li key={producto.id}>
                      <span className="nq__thumb"><Image src={imagen(producto)} alt="" fill sizes="88px" className="object-cover" /></span>
                      <div>
                        <strong>{producto.nombre}</strong>
                        <small>{razon}</small>
                        <b>${producto.precio.toLocaleString("es-CO")}</b>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {recomendados.length > 0 && (
                <>
                  <button type="button" className="nq__cta" onClick={() => onAgregar(recomendados.map((r) => r.producto))}>
                    Agregar {recomendados.length > 1 ? "mi rutina" : ""} al carrito · ${total.toLocaleString("es-CO")}
                  </button>
                  <p className="nq__coupon">Usa <strong>BIENVENIDA10</strong> y obtén 10% OFF en tu primera compra.</p>
                </>
              )}
              <div className="nq__after">
                <button type="button" onClick={() => { setHistorial([]); setLinea(null); setExtra(null); setMantequilla(null); setPaso("inicio"); }}>Repetir el test</button>
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer"><MessageCircle size={15} aria-hidden="true" /> ¿Dudas? Habla con una asesora</a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
