"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface Producto {
  id: number;
  categoria: string;
  nombre: string;
  descripcion: string;
  detalles?: string;
  precio: number;
  imagen: string;
}

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

const productos: Producto[] = [
  {
    id: 1,
    categoria: "Línea Capilar",
    nombre: "Shampoo de Cayena",
    descripcion: "Limpieza profunda y cuidado natural para el cuero cabelludo.",
    detalles: "Formulado con extractos herbales para limpiar sin resecar. Estimula la circulación del cuero cabelludo y promueve el brillo natural.",
    precio: 34000,
    imagen: "/naya_foto/shampoo1.png",
  },
  {
    id: 2,
    categoria: "Línea Capilar",
    nombre: "Acondicionador de  Cayena",
    descripcion: "Desenredo inmediato, suavidad y brillo natural.",
    detalles: "Sella la cutícula capilar dejando el cabello suave, manejable y libre de frizz. Ideal para uso diario.",
    precio: 34000,
    imagen: "/naya_foto/acondi1.png",
  },
  {
    id: 3,
    categoria: "Línea Capilar",
    nombre: "Shampoo de Romero",
    descripcion: "Fortalece la hebra capilar y estimula el crecimiento saludable.",
    detalles: "Enriquecido con extracto puro de romero para limpiar profundamente, controlar el exceso de grasa y prevenir la caída del cabello.",
    precio: 34000,
    imagen: "/naya_foto/shampoo2.png",
  },
  {
    id: 4,
    categoria: "Línea Capilar",
    nombre: "Acondicionador de Romero",
    descripcion: "Hidratación y fuerza para cabellos débiles o con tendencia a la caída.",
    detalles: "Aporta suavidad extrema y desenredo mientras aprovecha los beneficios antioxidantes y fortalecedores del romero.",
    precio: 34000,
    imagen: "/naya_foto/acondi2.png",
  },
  {
    id: 5,
    categoria: "Línea Corporal",
    nombre: "Mantequilla Corporal Coco Festival",
    descripcion: "Ultra hidratación y nutrición intensiva para la piel.",
    detalles: "Enriquecida con mantecas naturales y aroma a coco. Restaura la barrera de hidratación cutánea en zonas muy secas.",
    precio: 28500,
    imagen: "/naya_foto/coco_festival.png",
  },
  {
    id: 6,
    categoria: "Tratamiento Capilar",
    nombre: "Tónico Crecimiento Intensivo",
    descripcion: "Estimula la hebra capilar y fortalece desde la raíz.",
    detalles: "Aplica directamente en la raíz para acelerar el crecimiento y frenar la caída excesiva.",
    precio: 18000,
    imagen: "/naya_foto/crecimiento.png",
  },
  {
    id: 7,
    categoria: "Línea Frutal",
    nombre: " Mantequilla Corporal Kiwi",
    descripcion: "Revitalización e hidratación profunda con antioxidantes.",
    detalles: "Aporta vitaminas y nutrientes esenciales para devolverle la vitalidad al cabello o piel deshidratada.",
    precio: 28500,
    imagen: "/naya_foto/kiwi.png",
  },
  {
    id: 8,
    categoria: "Línea Frutal",
    nombre: "Mantequilla Corporal Uva",
    descripcion: "Reparación intensiva para cabellos maltratados.",
    detalles: "Propiedades antioxidantes de la uva que reparan los daños causados por el calor y procesamientos químicos.",
    precio: 28500,
    imagen: "/naya_foto/uva.png",
  },
  {
    id: 9,
    categoria: "Línea Frutal",
    nombre: "Mantequilla Corporal  Cherry",
    descripcion: "Renovación celular y aroma delicioso para tu piel.",
    detalles: "Remueve suavemente las células muertas dejando la piel sedosa, renovada y con un delicioso perfume a cereza.",
    precio: 28500,
    imagen: "/naya_foto/cherry.png",
  },
  {
    id: 10,
    categoria: "Tratamiento Corporal",
    nombre: "Crema Nutrición Profunda",
    descripcion: "Restaura la elasticidad y suavidad de tu piel.",
    detalles: "Fórmula de rápida absorción que nutre profundamente sin dejar sensación grasosa.",
    precio: 18000,
    imagen: "/naya_foto/nutricion.png",
  },
];

const categorias = ["Todos", "Línea Capilar", "Tratamiento Capilar", "Línea Corporal", "Tratamiento Corporal", "Línea Frutal"];

export default function Home() {
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [cantidadModal, setCantidadModal] = useState(1);
  
  // Estado para el Slider del Hero (2 imágenes)
  const [heroIndex, setHeroIndex] = useState(0);

  // Estado del Carrito
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);

  // Cargar el carrito guardado al iniciar la página
  useEffect(() => {
    const carritoGuardado = localStorage.getItem("carrito_naya");
    if (carritoGuardado) {
      try {
        setCarrito(JSON.parse(carritoGuardado));
      } catch (e) {
        console.error("Error al cargar el carrito", e);
      }
    }
  }, []);

  // Guardar en localStorage cada vez que el carrito cambie
  useEffect(() => {
    localStorage.setItem("carrito_naya", JSON.stringify(carrito));
  }, [carrito]);

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

  const enviarWhatsAppCarrito = () => {
    if (carrito.length === 0) return;

    let mensaje = "Hola NAYA 🌿, me gustaría realizar el siguiente pedido:\n\n";
    carrito.forEach((item) => {
      mensaje += `• ${item.cantidad}x ${item.producto.nombre} ($${(item.producto.precio * item.cantidad).toLocaleString('es-CO')} COP)\n`;
    });
    mensaje += `\n*Total estimado:* $${totalPrecioCarrito.toLocaleString('es-CO')} COP`;
    mensaje += "\n\n¿Me confirman la disponibilidad y datos de envío?";

    window.open(`https://wa.me/573042051221?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const productosFiltrados = categoriaActiva === "Todos" 
    ? productos 
    : productos.filter(p => p.categoria === categoriaActiva);

  const abrirModal = (producto: Producto) => {
    setProductoSeleccionado(producto);
    setCantidadModal(1);
  };

  return (
    <main className="min-h-screen bg-stone-50 text-slate-800">
      {/* BARRA DE ANUNCIO */}
      <div className="bg-emerald-900 text-stone-100 text-xs text-center py-2.5 px-4 font-light tracking-wide">
        Bienestar corporal y capilar desde la ancestralidad y lo natural 🌿 | Envíos a todo el país
      </div>

      {/* HEADER / NAVBAR */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-stone-200 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="#" className="text-3xl font-serif font-bold text-emerald-900 tracking-wider">
            NAYA
          </a>

          <nav className="hidden md:flex space-x-8 text-sm font-medium text-emerald-900">
            <a href="#catalogo" className="hover:text-amber-700 transition">Productos</a>
            <a href="#garantias" className="hover:text-amber-700 transition">¿Por qué elegirnos?</a>
            <a href="https://wa.me/573042051221" target="_blank" className="hover:text-amber-700 transition">Contacto</a>
          </nav>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setCarritoAbierto(true)}
              className="bg-emerald-900 text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-emerald-800 transition flex items-center gap-2 shadow-sm"
            >
              <span>🛒 Mi Carrito</span>
              <span className="bg-white text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {totalProductosCarrito}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO / BANNER PRINCIPAL CON SLIDER AUTOMÁTICO */}
      <section className="bg-emerald-900 text-stone-100 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-emerald-300 text-xs font-semibold tracking-widest uppercase">
              Rituales de Cuidado Botánico
            </span>
            <h1 className="text-4xl sm:text-5xl font-serif leading-tight min-h-[120px] flex items-center transition-all duration-500">
              {imagenesHero[heroIndex].titulo}
            </h1>
            <p className="text-stone-300 text-sm sm:text-base font-light leading-relaxed max-w-lg transition-all duration-500">
              {imagenesHero[heroIndex].subtitulo}
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <a 
                href="#catalogo" 
                className="bg-amber-100 text-slate-900 font-semibold text-sm px-8 py-3.5 rounded-full hover:shadow-lg transition"
              >
                Explorar Catálogo
              </a>
            </div>
          </div>

          <div className="relative flex flex-col items-center justify-center">
            {/* Contenedor limpio de la Imagen (sin marcos ni fondos) */}
            <div className="relative w-full max-w-[420px] h-[460px] rounded-2xl overflow-hidden shadow-2xl">
              <Image 
                key={imagenesHero[heroIndex].id}
                src={imagenesHero[heroIndex].imagen}
                alt={imagenesHero[heroIndex].titulo}
                fill
                className="object-cover transition-all duration-700 ease-in-out"
              />
            </div>

            {/* Puntos Indicadores Inferiores */}
            <div className="flex justify-center items-center gap-3 mt-4">
              <button
                onClick={() => setHeroIndex(0)}
                className={`transition-all duration-300 rounded-full ${
                  heroIndex === 0 
                    ? "w-8 h-2.5 bg-amber-300" 
                    : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"
                }`}
                title="Imagen 1"
              />
              <button
                onClick={() => setHeroIndex(1)}
                className={`transition-all duration-300 rounded-full ${
                  heroIndex === 1 
                    ? "w-8 h-2.5 bg-amber-300" 
                    : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"
                }`}
                title="Imagen 2"
              />
            </div>
          </div>
        </div>
      </section>

      {/* GARANTÍAS Y MÉTODOS DE PAGO */}
      <section id="garantias" className="bg-white border-b border-stone-200 py-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 flex flex-col items-center">
            <span className="text-3xl mb-2">💳</span>
            <h4 className="font-bold text-sm text-emerald-900">PSE, Nequi y Tarjetas</h4>
            <p className="text-xs text-stone-500 mt-1">Pagos 100% seguros y directos</p>
          </div>
          <div className="p-4 flex flex-col items-center">
            <span className="text-3xl mb-2">🚚</span>
            <h4 className="font-bold text-sm text-emerald-900">Envíos a toda Colombia</h4>
            <p className="text-xs text-stone-500 mt-1">Rápido y directo a tu puerta</p>
          </div>
          <div className="p-4 flex flex-col items-center">
            <span className="text-3xl mb-2">🌿</span>
            <h4 className="font-bold text-sm text-emerald-900">Fórmulas Botánicas</h4>
            <p className="text-xs text-stone-500 mt-1">Extractos 100% naturales</p>
          </div>
          <div className="p-4 flex flex-col items-center">
            <span className="text-3xl mb-2">💬</span>
            <h4 className="font-bold text-sm text-emerald-900">Asesoría Personalizada</h4>
            <p className="text-xs text-stone-500 mt-1">Atención directa en WhatsApp</p>
          </div>
        </div>
      </section>

      {/* CATÁLOGO */}
      <section id="catalogo" className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-serif text-emerald-900">Nuestros Productos</h2>
          <p className="text-stone-600 text-sm mt-1 max-w-md mx-auto">Formulaciones botánicas para un cuidado ritual diario.</p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaActiva(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold transition ${
                categoriaActiva === cat
                  ? "bg-emerald-900 text-white shadow-md"
                  : "bg-stone-200/80 text-stone-700 hover:bg-stone-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid de Productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {productosFiltrados.map((producto) => (
            <div 
              key={producto.id} 
              className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm hover:shadow-lg transition flex flex-col group cursor-pointer"
              onClick={() => abrirModal(producto)}
            >
              <div className="relative h-56 w-full mb-4 rounded-xl overflow-hidden bg-stone-50 flex items-center justify-center">
                <Image 
                  src={producto.imagen}
                  alt={producto.nombre}
                  fill
                  className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                {producto.categoria}
              </span>
              <h3 className="text-base font-bold text-emerald-900 mt-1 line-clamp-1">
                {producto.nombre}
              </h3>
              <p className="text-xs text-stone-500 mt-1 flex-grow line-clamp-2">
                {producto.descripcion}
              </p>
              
              <div className="mt-4 pt-3 border-t border-stone-100 flex flex-col gap-2">
                <div className="font-bold text-slate-900 text-base">
                  ${producto.precio.toLocaleString('es-CO')} COP
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      abrirModal(producto);
                    }}
                    className="bg-stone-100 text-emerald-900 text-xs py-2 rounded-lg hover:bg-stone-200 transition font-semibold"
                  >
                    Detalles
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      agregarAlCarrito(producto, 1);
                      setCarritoAbierto(true);
                    }}
                    className="bg-emerald-900 text-white text-xs py-2 rounded-lg hover:bg-emerald-800 transition font-semibold"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl border border-stone-100 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setProductoSeleccionado(null)}
              className="absolute top-4 right-4 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-full w-9 h-9 flex items-center justify-center font-bold transition"
            >
              ✕
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div className="relative h-64 sm:h-72 w-full bg-stone-50 rounded-2xl flex items-center justify-center">
                <Image 
                  src={productoSeleccionado.imagen}
                  alt={productoSeleccionado.nombre}
                  fill
                  className="object-contain p-4"
                />
              </div>

              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-stone-100 px-3 py-1 rounded-full">
                  {productoSeleccionado.categoria}
                </span>
                <h3 className="text-2xl font-bold font-serif text-emerald-900">
                  {productoSeleccionado.nombre}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {productoSeleccionado.detalles || productoSeleccionado.descripcion}
                </p>

                <div className="text-2xl font-bold text-slate-900 pt-2">
                  ${(productoSeleccionado.precio * cantidadModal).toLocaleString('es-CO')} COP
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <span className="text-xs font-semibold text-stone-600">Cantidad:</span>
                  <div className="flex items-center border border-stone-300 rounded-lg">
                    <button 
                      onClick={() => setCantidadModal(Math.max(1, cantidadModal - 1))}
                      className="px-3 py-1 font-bold text-stone-600 hover:bg-stone-100 rounded-l-lg"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 text-sm font-semibold">{cantidadModal}</span>
                    <button 
                      onClick={() => setCantidadModal(cantidadModal + 1)}
                      className="px-3 py-1 font-bold text-stone-600 hover:bg-stone-100 rounded-r-lg"
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
                    className="w-full bg-emerald-900 text-white font-semibold text-sm py-3 rounded-xl hover:bg-emerald-800 transition shadow-md"
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
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setCarritoAbierto(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
              
              {/* Header del Carrito */}
              <div className="p-6 bg-emerald-900 text-white flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🛒</span>
                  <h2 className="text-xl font-serif font-bold">Tu Carrito</h2>
                </div>
                <button 
                  onClick={() => setCarritoAbierto(false)}
                  className="text-white hover:text-stone-300 text-xl font-bold p-1"
                >
                  ✕
                </button>
              </div>

              {/* Lista de productos */}
              <div className="flex-1 overflow-y-auto p-6 divide-y divide-stone-100">
                {carrito.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-stone-400 space-y-3">
                    <span className="text-5xl">🌿</span>
                    <p className="text-sm font-medium">Tu carrito está vacío.</p>
                    <p className="text-xs">Añade productos de NAYA para comenzar tu pedido.</p>
                  </div>
                ) : (
                  carrito.map((item) => (
                    <div key={item.producto.id} className="py-4 flex gap-4 items-center">
                      <div className="relative h-16 w-16 bg-stone-50 rounded-lg flex-shrink-0 flex items-center justify-center">
                        <Image 
                          src={item.producto.imagen}
                          alt={item.producto.nombre}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 truncate">{item.producto.nombre}</h4>
                        <p className="text-xs text-stone-500 font-semibold mt-0.5">
                          ${(item.producto.precio * item.cantidad).toLocaleString('es-CO')} COP
                        </p>
                        
                        <div className="flex items-center space-x-2 mt-2">
                          <div className="flex items-center border border-stone-200 rounded">
                            <button 
                              onClick={() => cambiarCantidadCarrito(item.producto.id, -1)}
                              className="px-2 py-0.5 text-xs text-stone-600 hover:bg-stone-100"
                            >
                              -
                            </button>
                            <span className="px-2 py-0.5 text-xs font-medium">{item.cantidad}</span>
                            <button 
                              onClick={() => cambiarCantidadCarrito(item.producto.id, 1)}
                              className="px-2 py-0.5 text-xs text-stone-600 hover:bg-stone-100"
                            >
                              +
                            </button>
                          </div>
                          
                          <button 
                            onClick={() => eliminarDelCarrito(item.producto.id)}
                            className="text-[10px] text-red-500 hover:underline ml-auto"
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
                <div className="p-6 border-t border-stone-200 bg-stone-50 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-stone-600 font-medium">Subtotal ({totalProductosCarrito} ítems)</span>
                    <span className="font-bold text-slate-900 text-lg">
                      ${totalPrecioCarrito.toLocaleString('es-CO')} COP
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Link 
                      href="/checkout"
                      className="w-full bg-emerald-900 text-white font-semibold text-center text-xs py-3.5 rounded-xl hover:bg-emerald-800 transition block shadow-lg"
                    >
                      🔒 Finalizar Compra y Pagar
                    </Link>

                    <button 
                      onClick={enviarWhatsAppCarrito}
                      className="w-full bg-emerald-600 text-white font-semibold text-xs py-3 rounded-xl hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                    >
                      <span>💬</span> O pedir directo por WhatsApp
                    </button>
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