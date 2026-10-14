"use client";

import { startTransition, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Producto } from "@/utils/productos";

interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

const imagenesHero = [
  {
    id: 1,
    imagen: "/naya_foto/modelo1.png",
    titulo: "RENOVACIÓN PROFUNDA EN TU PIEL Y CABELLO",
    subtitulo: "Fusionamos extractos naturales con la sabiduría ancestral de nuestras raíces. Cuidado consciente para ti."
  },
  {
    id: 2,
    imagen: "/naya_foto/modelo2.png",
    titulo: "RENOVACIÓN PROFUNDA EN TU PIEL Y CABELLO",
    subtitulo: "Fusionamos extractos naturales con la sabiduría ancestral de nuestras raíces. Cuidado consciente para ti."
  }
];

const categorias = ["Todos", "Línea Capilar", "Tratamiento Capilar", "Línea Corporal", "Tratamiento Corporal", "Línea Frutal"];

function acentoProducto(producto: Producto): string {
  const linea = `${producto.categoria} ${producto.nombre}`.toLowerCase();
  if (linea.includes("nutrición") || linea.includes("nutricion")) {
    return "product-card--nutrition";
  }
  if (linea.includes("corporal") || linea.includes("frutal")) {
    return "product-card--body";
  }
  return "product-card--hair";
}

export default function Home() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargandoProductos, setCargandoProductos] = useState(true);
  const [errorProductos, setErrorProductos] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [cantidadModal, setCantidadModal] = useState(1);
  
  // Estado para el Slider del Hero (2 imágenes)
  const [heroIndex, setHeroIndex] = useState(0);

  // Estado del Carrito
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [carritoCargado, setCarritoCargado] = useState(false);

  useEffect(() => {
    let activo = true;
    fetch("/api/productos")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "No se pudo cargar el catálogo.");
        if (activo) setProductos(data as Producto[]);
      })
      .catch((error: unknown) => {
        if (activo) setErrorProductos(error instanceof Error ? error.message : "No se pudo cargar el catálogo.");
      })
      .finally(() => {
        if (activo) setCargandoProductos(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    const carritoGuardado = localStorage.getItem("carrito_naya");
    if (carritoGuardado) {
      try {
        const itemsGuardados = JSON.parse(carritoGuardado) as ItemCarrito[];
        startTransition(() => setCarrito(itemsGuardados));
      } catch (e) {
        console.error("Error al cargar el carrito", e);
      }
    }
    startTransition(() => setCarritoCargado(true));
  }, []);

  useEffect(() => {
    if (carritoCargado) localStorage.setItem("carrito_naya", JSON.stringify(carrito));
  }, [carrito, carritoCargado]);

  // Cambio automático entre las 2 imágenes cada 4 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev === 0 ? 1 : 0));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const agregarAlCarrito = (producto: Producto, cant: number = 1) => {
    setCarrito((prevCarrito) => {
      const existe = prevCarrito.find((item) => item.producto.id === producto.id);
      if (existe) {
        return prevCarrito.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + cant }
            : item
        );
      }
      return [...prevCarrito, { producto, cantidad: cant }];
    });
  };

  const cambiarCantidadCarrito = (id: number, delta: number) => {
    setCarrito((prevCarrito) =>
      prevCarrito
        .map((item) => {
          if (item.producto.id === id) {
            const nuevaCant = item.cantidad + delta;
            return nuevaCant > 0 ? { ...item, cantidad: nuevaCant } : null;
          }
          return item;
        })
        .filter((item): item is ItemCarrito => item !== null)
    );
  };

  const eliminarDelCarrito = (id: number) => {
    setCarrito((prevCarrito) => prevCarrito.filter((item) => item.producto.id !== id));
  };

  const totalProductosCarrito = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  const totalPrecioCarrito = carrito.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0);

  const productosFiltrados = categoriaActiva === "Todos" 
    ? productos 
    : productos.filter(p => p.categoria === categoriaActiva);

  const abrirModal = (producto: Producto) => {
    setProductoSeleccionado(producto);
    setCantidadModal(1);
  };

  return (
    <main className="storefront min-h-screen font-sans">
      {/* BARRA DE ANUNCIO */}
      <div className="bg-naya-green text-naya-cream text-xs text-center py-2.5 px-4 font-medium tracking-wide">
        Bienestar corporal y capilar desde la ancestralidad y lo natural 🌿 | Envíos a todo el país
      </div>

      {/* HEADER / NAVBAR */}
      <header className="sticky top-0 bg-naya-cream/95 backdrop-blur-md border-b border-naya-green/10 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <a href="#" className="text-3xl font-serif font-semibold text-naya-green tracking-wider">
            NAYA
          </a>

          <nav className="hidden md:flex space-x-8 text-sm font-semibold text-naya-green">
            <a href="#catalogo" className="hover:text-naya-copper transition">Productos</a>
            <a href="#garantias" className="hover:text-naya-copper transition">¿Por qué elegirnos?</a>
            <a href="https://wa.me/573042051221" target="_blank" className="hover:text-naya-copper transition">Contacto</a>
          </nav>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setCarritoAbierto(true)}
              className="primary-action text-xs font-bold px-5 py-2.5 flex items-center gap-2 shadow-sm"
            >
              <span>🛒 Mi Carrito</span>
              <span className="bg-naya-cream text-naya-green text-[10px] font-bold px-2 py-0.5 rounded-full">
                {totalProductosCarrito}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO / BANNER PRINCIPAL CON SLIDER AUTOMÁTICO */}
      <section id="inicio" className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          <div className="space-y-6">
            <span className="text-naya-copper text-xs font-bold tracking-widest uppercase">
              Rituales de Cuidado Botánico
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif leading-tight min-h-30 flex items-center transition-all duration-500">
              {imagenesHero[heroIndex].titulo}
            </h1>
            <p className="text-naya-cream/80 text-sm sm:text-base font-light leading-relaxed max-w-lg transition-all duration-500">
              {imagenesHero[heroIndex].subtitulo}
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <a 
                href="#catalogo" 
                className="primary-action inline-flex items-center justify-center font-bold text-sm px-8 py-3.5"
              >
                Explorar Catálogo
              </a>
            </div>
          </div>

          <div className="relative flex flex-col items-center justify-center">
            {/* Contenedor limpio de la Imagen (sin marcos ni fondos) */}
            <div className="relative w-full max-w-105 h-90 sm:h-115 rounded-[20px] overflow-hidden shadow-2xl ring-1 ring-naya-cream/20">
              <Image 
                key={imagenesHero[heroIndex].id}
                src={imagenesHero[heroIndex].imagen}
                alt={imagenesHero[heroIndex].titulo}
                fill
                sizes="(max-width: 1024px) 100vw, 420px"
                className="object-cover transition-all duration-700 ease-in-out"
              />
            </div>

            {/* Puntos Indicadores Inferiores */}
            <div className="flex justify-center items-center gap-3 mt-4">
              <button
                onClick={() => setHeroIndex(0)}
                className={`transition-all duration-300 rounded-full ${
                  heroIndex === 0 
                    ? "w-8 h-2.5 bg-naya-copper"
                    : "w-2.5 h-2.5 bg-naya-cream/40 hover:bg-naya-cream/70"
                }`}
                title="Imagen 1"
              />
              <button
                onClick={() => setHeroIndex(1)}
                className={`transition-all duration-300 rounded-full ${
                  heroIndex === 1 
                    ? "w-8 h-2.5 bg-naya-copper"
                    : "w-2.5 h-2.5 bg-naya-cream/40 hover:bg-naya-cream/70"
                }`}
                title="Imagen 2"
              />
            </div>
          </div>
        </div>
      </section>

      {/* GARANTÍAS Y MÉTODOS DE PAGO */}
      <section id="garantias" className="py-8 px-4 sm:px-6 border-b">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 flex flex-col items-center">
            <span className="text-3xl mb-2">💳</span>
            <h4 className="font-bold text-sm text-naya-green">PSE, Nequi y Tarjetas</h4>
            <p className="text-xs text-naya-green/65 mt-1">Pagos 100% seguros y directos</p>
          </div>
          <div className="p-4 flex flex-col items-center">
            <span className="text-3xl mb-2">🚚</span>
            <h4 className="font-bold text-sm text-naya-green">Envíos a toda Colombia</h4>
            <p className="text-xs text-naya-green/65 mt-1">Rápido y directo a tu puerta</p>
          </div>
          <div className="p-4 flex flex-col items-center">
            <span className="text-3xl mb-2">🌿</span>
            <h4 className="font-bold text-sm text-naya-green">Fórmulas Botánicas</h4>
            <p className="text-xs text-naya-green/65 mt-1">Extractos 100% naturales</p>
          </div>
          <div className="p-4 flex flex-col items-center">
            <span className="text-3xl mb-2">💬</span>
            <h4 className="font-bold text-sm text-naya-green">Asesoría Personalizada</h4>
            <p className="text-xs text-naya-green/65 mt-1">Atención directa en WhatsApp</p>
          </div>
        </div>
      </section>

      {/* CATÁLOGO */}
      <section id="catalogo" className="px-4 sm:px-6 py-16">
        <div className="mb-8 text-center">
          <span className="text-naya-copper text-xs font-bold uppercase tracking-[0.2em]">La colección NAYA</span>
          <h2 className="text-4xl sm:text-5xl font-serif text-naya-cream mt-2">Nuestros Productos</h2>
          <p className="text-naya-cream/75 text-sm mt-2 max-w-md mx-auto">Formulaciones botánicas para un cuidado ritual diario.</p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaActiva(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold transition ${
                categoriaActiva === cat
                  ? "bg-naya-copper text-naya-green shadow-md"
                    : "bg-naya-cream/10 text-naya-cream border border-naya-cream/20 hover:bg-naya-cream/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid de Productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {errorProductos ? (
            <div className="col-span-full py-12 text-center" role="alert">
              <p className="text-sm text-naya-cream">{errorProductos}</p>
              <button type="button" onClick={() => window.location.reload()} className="primary-action mt-3 px-5 py-2 text-sm font-bold">
                Volver a intentar
              </button>
            </div>
          ) : cargandoProductos ? (
            <p className="col-span-full py-12 text-center text-sm text-naya-cream/70">Cargando productos...</p>
          ) : productosFiltrados.length === 0 ? (
            <p className="col-span-full py-12 text-center text-sm text-naya-cream/70">No hay productos disponibles en esta categoría.</p>
          ) : productosFiltrados.map((producto) => (
            <div 
              key={producto.id} 
              className={`product-card ${acentoProducto(producto)} p-4 sm:p-5 transition duration-300 hover:-translate-y-1 group cursor-pointer flex flex-col`}
              onClick={() => abrirModal(producto)}
            >
              <div className="product-card__image relative h-56 sm:h-64 w-full mb-4 overflow-hidden flex items-center justify-center">
                <Image 
                  src={producto.imagen}
                  alt={producto.nombre}
                  fill
                  sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) calc(50vw - 40px), 280px"
                  className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <span className="product-card__category text-[10px] font-bold uppercase tracking-wider">
                {producto.categoria}
              </span>
              <h3 className="text-xl font-semibold text-naya-green mt-1 line-clamp-1">
                {producto.nombre}
              </h3>
              <p className="text-xs text-naya-green/70 mt-1 grow line-clamp-2">
                {producto.descripcion}
              </p>
              
              <div className="product-card__accent mt-4 pt-3 border-t flex flex-col gap-2">
                <div className="font-bold text-naya-green text-base">
                  ${producto.precio.toLocaleString('es-CO')} COP
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      abrirModal(producto);
                    }}
                    className="secondary-action text-xs py-2 font-semibold"
                  >
                    Detalles
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      agregarAlCarrito(producto, 1);
                      setCarritoAbierto(true);
                    }}
                    className="primary-action text-xs py-2 font-bold"
                  >
                    + Carrito
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MODAL DETALLE DE PRODUCTO */}
      {productoSeleccionado && (
        <div className="fixed inset-0 bg-naya-green/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-naya-cream rounded-[20px] max-w-2xl w-full p-5 sm:p-8 relative shadow-2xl border border-naya-green/10 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setProductoSeleccionado(null)}
              className="absolute top-4 right-4 bg-naya-green/10 hover:bg-naya-green/15 text-naya-green rounded-full w-9 h-9 flex items-center justify-center font-bold transition"
            >
              ✕
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div className={`product-card__image relative h-64 sm:h-72 w-full rounded-[20px] flex items-center justify-center ${acentoProducto(productoSeleccionado)}`}>
                <Image 
                  src={productoSeleccionado.imagen}
                  alt={productoSeleccionado.nombre}
                  fill
                  sizes="(max-width: 640px) calc(100vw - 40px), 300px"
                  className="object-contain p-4"
                />
              </div>

              <div className="space-y-4">
                <span className={`product-card__category text-xs font-bold uppercase tracking-wider ${acentoProducto(productoSeleccionado)}`}>
                  {productoSeleccionado.categoria}
                </span>
                <h3 className="text-3xl font-semibold font-serif text-naya-green">
                  {productoSeleccionado.nombre}
                </h3>
                <p className="text-sm text-naya-green/75 leading-relaxed">
                  {productoSeleccionado.detalles || productoSeleccionado.descripcion}
                </p>

                <div className="text-2xl font-bold text-naya-green pt-2">
                  ${(productoSeleccionado.precio * cantidadModal).toLocaleString('es-CO')} COP
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <span className="text-xs font-semibold text-naya-green/75">Cantidad:</span>
                  <div className="flex items-center border border-naya-green/20 rounded-full">
                    <button 
                      onClick={() => setCantidadModal(Math.max(1, cantidadModal - 1))}
                      className="px-3 py-1 font-bold text-naya-green hover:bg-naya-green/10 rounded-l-full"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 text-sm font-semibold text-naya-green">{cantidadModal}</span>
                    <button 
                      onClick={() => setCantidadModal(cantidadModal + 1)}
                      className="px-3 py-1 font-bold text-naya-green hover:bg-naya-green/10 rounded-r-full"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex flex-col gap-2">
                  <button 
                    onClick={() => {
                      agregarAlCarrito(productoSeleccionado, cantidadModal);
                      setProductoSeleccionado(null);
                      setCarritoAbierto(true);
                    }}
                    className="primary-action w-full font-bold text-sm py-3 shadow-md"
                  >
                    🛒 Agregar al Carrito
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER / SLIDE-OVER DEL CARRITO */}
      {carritoAbierto && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            className="absolute inset-0 bg-naya-green/60 backdrop-blur-sm transition-opacity"
            onClick={() => setCarritoAbierto(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-naya-cream shadow-2xl flex flex-col">
              
              {/* Header del Carrito */}
              <div className="p-5 sm:p-6 bg-naya-green text-naya-cream flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🛒</span>
                  <h2 className="text-xl font-serif font-bold">Tu Carrito</h2>
                </div>
                <button 
                  onClick={() => setCarritoAbierto(false)}
                  className="text-naya-cream hover:text-naya-copper text-xl font-bold p-1"
                >
                  ✕
                </button>
              </div>

              {/* Lista de productos */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 divide-y divide-naya-green/10">
                {carrito.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-naya-green/50 space-y-3">
                    <span className="text-5xl">🌿</span>
                    <p className="text-sm font-medium">Tu carrito está vacío.</p>
                    <p className="text-xs">Añade productos de NAYA para comenzar tu pedido.</p>
                  </div>
                ) : (
                  carrito.map((item) => (
                    <div key={item.producto.id} className="py-4 flex gap-4 items-center">
                      <div className="relative h-16 w-16 bg-white/70 rounded-[14px] shrink-0 flex items-center justify-center">
                        <Image 
                          src={item.producto.imagen}
                          alt={item.producto.nombre}
                          fill
                          sizes="64px"
                          className="object-contain p-1"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-naya-green truncate">{item.producto.nombre}</h4>
                        <p className="text-xs text-naya-green/65 font-semibold mt-0.5">
                          ${(item.producto.precio * item.cantidad).toLocaleString('es-CO')} COP
                        </p>
                        
                        <div className="flex items-center space-x-2 mt-2">
                          <div className="flex items-center border border-naya-green/20 rounded-full">
                            <button 
                              onClick={() => cambiarCantidadCarrito(item.producto.id, -1)}
                              className="px-2 py-0.5 text-xs text-naya-green hover:bg-naya-green/10 rounded-full"
                            >
                              -
                            </button>
                            <span className="px-2 py-0.5 text-xs font-medium text-naya-green">{item.cantidad}</span>
                            <button 
                              onClick={() => cambiarCantidadCarrito(item.producto.id, 1)}
                              className="px-2 py-0.5 text-xs text-naya-green hover:bg-naya-green/10 rounded-full"
                            >
                              +
                            </button>
                          </div>
                          
                          <button 
                            onClick={() => eliminarDelCarrito(item.producto.id)}
                            className="text-[10px] text-naya-green/60 hover:text-naya-copper hover:underline ml-auto"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Botones de Finalizar Compra */}
              {carrito.length > 0 && (
                <div className="p-5 sm:p-6 border-t border-naya-green/10 bg-white/50 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-naya-green/70 font-medium">Subtotal ({totalProductosCarrito} ítems)</span>
                    <span className="font-bold text-naya-green text-lg">
                      ${totalPrecioCarrito.toLocaleString('es-CO')} COP
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Link 
                      href="/checkout"
                      className="primary-action w-full font-bold text-center text-xs py-3.5 transition block shadow-lg"
                    >
                      🔒 Finalizar Compra y Pagar
                    </Link>

                    <Link
                      href="/checkout?metodo=whatsapp"
                      className="secondary-action w-full font-semibold text-xs py-3 transition flex items-center justify-center gap-2"
                    >
                      <span>💬</span> O pedir directo por WhatsApp
                    </Link>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </main>
  );
}