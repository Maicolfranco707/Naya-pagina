"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronRight, Minus, Plus, Truck } from "lucide-react";
import ProductoCard from "@/components/shop/ProductoCard";
import { agregarAlCarritoGuardado, categoriaTienda, imagenDe, INFO_PRODUCTOS } from "@/utils/catalogo";
import type { Producto } from "@/utils/productos";
import { medirVerProducto } from "@/utils/analytics";
import Estrellas from "@/components/shop/Estrellas";
import ResenasProducto from "@/components/shop/ResenasProducto";
import { promedio, type Resena } from "@/utils/resenas";

export default function ProductoDetalle({ producto, relacionados, resenas = [] }: { producto: Producto; relacionados: Producto[]; resenas?: Resena[] }) {
  const router = useRouter();
  const info = INFO_PRODUCTOS[producto.id];
  const fotos = [imagenDe(producto), ...(info?.galeria ?? [])];
  const [foto, setFoto] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const [abierta, setAbierta] = useState<string>("descripcion");
  const [barraVisible, setBarraVisible] = useState(false);
  const zonaCompra = useRef<HTMLDivElement>(null);
  const categoria = categoriaTienda(producto);
  const nombre = producto.nombre.replace(/\s+/g, " ").trim();

  const secciones = [
    { id: "descripcion", titulo: "Descripción", contenido: <p>{producto.detalles || producto.descripcion}</p> },
    info && { id: "beneficios", titulo: "Beneficios", contenido: <ul>{info.beneficios.map((b) => <li key={b}>{b}</li>)}</ul> },
    info && { id: "uso", titulo: "Modo de uso", contenido: <p style={{ whiteSpace: "pre-line" }}>{info.modoUso}</p> },
    info && { id: "ideal", titulo: "Ideal para", contenido: <p>{info.idealPara}</p> },
  ].filter(Boolean) as Array<{ id: string; titulo: string; contenido: React.ReactNode }>;

  useEffect(() => {
    medirVerProducto({ id: producto.id, nombre: producto.nombre, precio: producto.precio });
  }, [producto.id, producto.nombre, producto.precio]);

  // Barra fija de compra en celular: aparece cuando el botón principal sale de la pantalla.
  useEffect(() => {
    const zona = zonaCompra.current;
    if (!zona || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entrada]) => {
      setBarraVisible(!entrada.isIntersecting && entrada.boundingClientRect.top < 0);
    });
    observer.observe(zona);
    return () => observer.disconnect();
  }, []);

  const agregar = () => {
    agregarAlCarritoGuardado(producto, cantidad);
    setAgregado(true);
  };

  return (
    <div className="pd">
      <nav className="pd__crumbs" aria-label="Ruta">
        <Link href="/">Inicio</Link><ChevronRight size={13} aria-hidden="true" />
        <Link href={`/productos?cat=${encodeURIComponent(categoria)}`}>{categoria}</Link><ChevronRight size={13} aria-hidden="true" />
        <span>{nombre}</span>
      </nav>

      <div className="pd__main">
        <div className="pd__gallery">
          <div className="pd__photo">
            <Image src={fotos[foto]} alt={nombre} fill sizes="(max-width: 860px) 100vw, 50vw" className="object-cover" priority />
          </div>
          {fotos.length > 1 && (
            <div className="pd__thumbs">
              {fotos.map((src, i) => (
                <button key={src} type="button" className={i === foto ? "pd__thumb pd__thumb--active" : "pd__thumb"} onClick={() => setFoto(i)} aria-label={`Ver foto ${i + 1}`}>
                  <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pd__info">
          <p className="pd__cat">{categoria}</p>
          <h1>{nombre}</h1>
          {resenas.length > 0 && (
            <a href="#rv-title" className="pd__rating"><Estrellas valor={promedio(resenas)} tamano={15} /> {resenas.length} {resenas.length === 1 ? "reseña" : "reseñas"}</a>
          )}
          <p className="pd__price">${producto.precio.toLocaleString("es-CO")} <small>COP</small></p>
          <p className="pd__short">{producto.descripcion}</p>
          <p className="pd__ship"><Truck size={16} aria-hidden="true" /> Envío gratis en compras desde $150.000</p>

          <div className="pd__buy" ref={zonaCompra}>
            <div className="pd__qty" aria-label="Cantidad">
              <button type="button" onClick={() => setCantidad((c) => Math.max(1, c - 1))} aria-label="Reducir cantidad"><Minus size={16} /></button>
              <span>{cantidad}</span>
              <button type="button" onClick={() => setCantidad((c) => Math.min(20, c + 1))} aria-label="Aumentar cantidad"><Plus size={16} /></button>
            </div>
            <button type="button" className="pd__add" onClick={agregar}>Agregar al carrito</button>
          </div>
          <button type="button" className="pd__now" onClick={() => { agregarAlCarritoGuardado(producto, cantidad); router.push("/checkout"); }}>
            Comprar ahora
          </button>
          {agregado && (
            <p className="pd__added"><Check size={16} aria-hidden="true" /> Agregado al carrito. <Link href="/checkout">Ir a pagar</Link></p>
          )}
          <p className="pd__coupon">10% OFF en tu primera compra con el código <strong>BIENVENIDA10</strong>.</p>

          <div className="pd__acc">
            {secciones.map((s) => (
              <div key={s.id} className="pd__acc-item">
                <button type="button" className="pd__acc-head" aria-expanded={abierta === s.id} onClick={() => setAbierta(abierta === s.id ? "" : s.id)}>
                  {s.titulo} <Plus size={16} aria-hidden="true" className={abierta === s.id ? "pd__acc-icon pd__acc-icon--open" : "pd__acc-icon"} />
                </button>
                {abierta === s.id && <div className="pd__acc-body">{s.contenido}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>


      <ResenasProducto productoId={producto.id} resenas={resenas} />

      <div className={barraVisible ? "pd-sticky pd-sticky--visible" : "pd-sticky"} aria-hidden={!barraVisible}>
        <div className="pd-sticky__info">
          <span className="pd-sticky__name">{nombre}</span>
          <span className="pd-sticky__price">${(producto.precio * cantidad).toLocaleString("es-CO")}</span>
        </div>
        <button type="button" className="pd-sticky__btn" onClick={agregar} tabIndex={barraVisible ? 0 : -1}>
          {agregado ? <><Check size={16} aria-hidden="true" /> Agregado</> : "Agregar al carrito"}
        </button>
      </div>

      {relacionados.length > 0 && (
        <section className="pd__related" aria-labelledby="pd-related-title">
          <h2 id="pd-related-title">Otros productos que te podrían interesar</h2>
          <div className="naya-shop__grid">
            {relacionados.map((p) => <ProductoCard key={p.id} producto={p} onAgregar={(x) => agregarAlCarritoGuardado(x)} />)}
          </div>
        </section>
      )}
    </div>
  );
}
