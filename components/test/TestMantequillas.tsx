"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, ShoppingBag, X } from "lucide-react";
import type { Producto } from "@/utils/productos";

// Test "¿Qué mantequilla eres?" a pantalla completa (estilo Fauno).
type Mantequilla = "coco" | "uva" | "kiwi" | "cherry";

const MANTEQUILLAS: Record<Mantequilla, { id: number; nombre: string; titulo: string; texto: string; aroma: string; img: string; color: string }> = {
  kiwi: { id: 7, nombre: "Kiwi", titulo: "Mantequilla de Kiwi", texto: "Eres alegre y espontánea. Te va un aroma fresco y frutal para el día a día.", aroma: "Fresco, verde y frutal", img: "/naya_foto/kiwi.png", color: "#dfe8c9" },
  uva: { id: 8, nombre: "Uva", titulo: "Mantequilla de Uva", texto: "Te gustan los detalles y los planes tranquilos. Te va un aroma intenso y especial.", aroma: "Intenso, profundo y especial", img: "/naya_foto/uva.png", color: "#e3dcef" },
  cherry: { id: 9, nombre: "Cherry", titulo: "Mantequilla Cherry", texto: "Te encanta consentirte. Te va un aroma dulce que deja la piel suave y perfumada.", aroma: "Dulce, a frutos rojos y cereza", img: "/naya_foto/cherry.png", color: "#f4dbdf" },
  coco: { id: 5, nombre: "Coco Festival", titulo: "Mantequilla Coco Festival", texto: "Vas a tu ritmo y te encanta el calor. Te va un aroma tropical y cremoso.", aroma: "Tropical, cremoso, a coco", img: "/naya_foto/coco_festival.png", color: "#efe6d6" },
};

interface Opcion { valor: Mantequilla; texto: string }
const PREGUNTAS: Array<{ titulo: string; opciones: Opcion[] }> = [
  {
    titulo: "¿Cómo te describirían tus amigas?",
    opciones: [
      { valor: "kiwi", texto: "Divertida y espontánea" },
      { valor: "uva", texto: "Elegante y segura de sí misma" },
      { valor: "cherry", texto: "Dulce y romántica" },
      { valor: "coco", texto: "Tranquila y relajada" },
    ],
  },
  {
    titulo: "¿Cuál es tu plan ideal de fin de semana?",
    opciones: [
      { valor: "coco", texto: "Playa, sol y piscina" },
      { valor: "kiwi", texto: "Salir con mis amigas" },
      { valor: "uva", texto: "Una cena especial con una copa de vino" },
      { valor: "cherry", texto: "Spa en casa: velas, música y skincare" },
    ],
  },
  {
    titulo: "¿Qué aroma te enamora?",
    opciones: [
      { valor: "cherry", texto: "Dulce, a frutos rojos" },
      { valor: "coco", texto: "Tropical, a coco" },
      { valor: "kiwi", texto: "Fresco y frutal" },
      { valor: "uva", texto: "Intenso y profundo" },
    ],
  },
];

function calcular(respuestas: Mantequilla[]): Mantequilla {
  const conteo = respuestas.reduce<Record<string, number>>((c, r) => ({ ...c, [r]: (c[r] ?? 0) + 1 }), {});
  const max = Math.max(...Object.values(conteo));
  const empatadas = Object.keys(conteo).filter((k) => conteo[k] === max) as Mantequilla[];
  const ultima = respuestas[respuestas.length - 1];
  return empatadas.includes(ultima) ? ultima : empatadas[0]; // en empate gana el aroma
}

function agregarAlCarrito(producto: Producto) {
  const carrito = JSON.parse(localStorage.getItem("carrito_naya") ?? "[]") as Array<{ producto: Producto; cantidad: number }>;
  const existe = carrito.find((i) => i.producto.id === producto.id);
  if (existe) existe.cantidad += 1;
  else carrito.push({ producto, cantidad: 1 });
  localStorage.setItem("carrito_naya", JSON.stringify(carrito));
  return carrito.reduce((s, i) => s + i.cantidad, 0);
}

export default function TestMantequillas() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [etapa, setEtapa] = useState<"bienvenida" | "preguntas" | "resultado">("bienvenida");
  const [respuestas, setRespuestas] = useState<Mantequilla[]>([]);
  const [elegida, setElegida] = useState<Mantequilla | null>(null);
  const [agregados, setAgregados] = useState<number[]>([]);
  const [enCarrito, setEnCarrito] = useState(0);

  useEffect(() => {
    document.title = "¿Qué mantequilla eres? | NAYA";
    try {
      const c = JSON.parse(localStorage.getItem("carrito_naya") ?? "[]") as Array<{ cantidad: number }>;
      setEnCarrito(c.reduce((s, i) => s + (i.cantidad || 0), 0));
    } catch { /* carrito vacío */ }
    fetch("/api/productos")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Producto[]) => setProductos(Array.isArray(data) ? data : []))
      .catch(() => setProductos([]));
  }, []);

  const paso = respuestas.length;
  const progreso = etapa === "bienvenida" ? 0 : etapa === "preguntas" ? Math.round((paso / PREGUNTAS.length) * 100) : 100;

  const responder = (valor: Mantequilla) => {
    const nuevas = [...respuestas, valor];
    setRespuestas(nuevas);
    if (nuevas.length === PREGUNTAS.length) {
      setElegida(calcular(nuevas));
      setEtapa("resultado");
      window.scrollTo(0, 0);
    }
  };

  const reiniciar = () => { setRespuestas([]); setElegida(null); setAgregados([]); setEtapa("bienvenida"); };
  const producto = (m: Mantequilla) => productos.find((p) => p.id === MANTEQUILLAS[m].id);
  const agregar = (p: Producto) => {
    try { setEnCarrito(agregarAlCarrito(p)); setAgregados((a) => [...a, p.id]); } catch (e) { console.error("No se pudo agregar al carrito:", e); }
  };

  const principal = elegida ? producto(elegida) : undefined;
  const otras = (Object.keys(MANTEQUILLAS) as Mantequilla[]).filter((m) => m !== elegida);

  return (
    <div className="tm">
      <header className="tm__header">
        <Link href="/" className="tm__logo" aria-label="NAYA, ir a la tienda">NAYA</Link>
        <div className="tm__header-actions">
          {enCarrito > 0 && (
            <Link href="/checkout" className="tm__cart" aria-label={`Ir a pagar, ${enCarrito} productos en el carrito`}>
              <ShoppingBag size={20} strokeWidth={1.6} aria-hidden="true" /><span>{enCarrito}</span>
            </Link>
          )}
          <Link href="/" className="tm__close" aria-label="Salir del test y volver a la tienda"><X size={22} strokeWidth={1.6} /></Link>
        </div>
      </header>

      <main className="tm__main">
        {etapa === "bienvenida" && (
          <section className="tm__welcome tm__fade">
            <div className="tm__welcome-photo">
              <Image src="/naya_foto/mantequilla-mano.jpg" alt="Clienta con la Mantequilla Corporal NAYA" fill sizes="(max-width: 860px) 100vw, 50vw" className="object-cover" priority />
            </div>
            <div className="tm__welcome-copy">
              <p className="tm__eyebrow">Test de mantequillas</p>
              <h1>¿Qué mantequilla NAYA es para ti?</h1>
              <p className="tm__lead">Tenemos cuatro aromas: Coco, Uva, Kiwi y Cherry. Responde 3 preguntas rápidas y te decimos cuál va contigo.</p>
              <button type="button" className="tm__start" onClick={() => setEtapa("preguntas")}>
                Empezar <ArrowRight size={18} aria-hidden="true" />
              </button>
              <p className="tm__time">Toma menos de un minuto.</p>
            </div>
          </section>
        )}

        {etapa === "preguntas" && paso < PREGUNTAS.length && (
          <section className="tm__question tm__fade" key={paso}>
            <p className="tm__count">Pregunta {paso + 1} / {PREGUNTAS.length}</p>
            <h2>{PREGUNTAS[paso].titulo}</h2>
            <div className="tm__options">
              {PREGUNTAS[paso].opciones.map((o, i) => (
                <button key={o.texto} type="button" className="tm__option" style={{ animationDelay: `${i * 60}ms` }} onClick={() => responder(o.valor)}>
                  <span className="tm__radio" aria-hidden="true" />
                  <span>{o.texto}</span>
                </button>
              ))}
            </div>
          </section>
        )}


        {etapa === "resultado" && elegida && (
          <section className="tm__result tm__fade">
            <div className="tm__result-photo">
              <Image src={MANTEQUILLAS[elegida].img} alt={`Mantequilla corporal ${MANTEQUILLAS[elegida].nombre}`} fill sizes="(max-width: 860px) 90vw, 440px" className="object-cover" priority />
            </div>
            <div className="tm__result-copy">
              <p className="tm__eyebrow">Tu resultado</p>
              <h1>{MANTEQUILLAS[elegida].titulo}</h1>
              <p className="tm__lead">{MANTEQUILLAS[elegida].texto}</p>
              <dl className="tm__specs">
                <div><dt>Aroma</dt><dd>{MANTEQUILLAS[elegida].aroma}</dd></div>
                <div><dt>Para</dt><dd>Piel seca o áspera</dd></div>
                <div><dt>Con</dt><dd>Vitamina E</dd></div>
              </dl>
              {principal ? (
                <div className="tm__buy">
                  <p className="tm__price">${principal.precio.toLocaleString("es-CO")} <small>COP</small></p>
                  {agregados.includes(principal.id) ? (
                    <div className="tm__added">
                      <p><Check size={17} aria-hidden="true" /> ¡Agregada a tu carrito!</p>
                      <Link href="/checkout" className="tm__btn tm__btn--primary">Ir a pagar</Link>
                      <Link href="/" className="tm__btn tm__btn--ghost">Seguir comprando</Link>
                    </div>
                  ) : (
                    <button type="button" className="tm__btn tm__btn--primary" onClick={() => agregar(principal)}>
                      <ShoppingBag size={18} aria-hidden="true" /> Agregar al carrito
                    </button>
                  )}
                  <p className="tm__coupon">10% OFF en tu primera compra con el código <strong>BIENVENIDA10</strong>.</p>
                </div>
              ) : (
                <p className="tm__lead">Cargando el producto…</p>
              )}
              <button type="button" className="tm__restart" onClick={reiniciar}>Repetir el test</button>
            </div>

            <div className="tm__others">
              <h3>Los otros aromas</h3>
              <ul>
                {otras.map((m) => {
                  const p = producto(m);
                  return (
                    <li key={m}>
                      <span className="tm__other-photo"><Image src={MANTEQUILLAS[m].img} alt="" fill sizes="160px" className="object-cover" /></span>
                      <strong>{MANTEQUILLAS[m].nombre}</strong>
                      <small>{MANTEQUILLAS[m].aroma}</small>
                      {p && (agregados.includes(p.id) ? (
                        <span className="tm__other-added"><Check size={15} aria-hidden="true" /> Agregada</span>
                      ) : (
                        <button type="button" onClick={() => agregar(p)}>Agregar · ${p.precio.toLocaleString("es-CO")}</button>
                      ))}
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        )}
      </main>

      {etapa === "preguntas" && (
        <footer className="tm__progress">
          <button
            type="button"
            className="tm__back"
            onClick={() => (paso === 0 ? setEtapa("bienvenida") : setRespuestas((r) => r.slice(0, -1)))}
            aria-label="Pregunta anterior"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="tm__bar-wrap">
            <span className="tm__bar-label">{progreso}% completo</span>
            <div className="tm__bar"><span style={{ width: `${progreso}%` }} /></div>
          </div>
        </footer>
      )}
    </div>
  );
}
