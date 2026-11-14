"use client";

import { startTransition, useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Leaf, Lock, Minus, Play, Plus, ShoppingBag, Trash2, Volume2, VolumeX, X } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Benefits from "@/components/home/Benefits";
import NayaFooter from "@/components/layout/NayaFooter";
import NayaWhatsAppButton from "@/components/layout/NayaWhatsAppButton";
import NewsletterSignup from "@/components/home/NewsletterSignup";
import { WHATSAPP_NUMBER } from "@/utils/contacto";
import type { Producto } from "@/utils/productos";
import { ENVIO_GRATIS_DESDE } from "@/utils/envios";

interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

const mensajeAsesoriaMantequillas = "Hola NAYA, quiero asesoría sobre las mantequillas corporales.";
const mensajeAsesoriaAmpolletas = "Hola NAYA, quiero asesoría sobre las ampolletas.";
const VIDEO_AMPOLLETAS_TIENE_AUDIO = true;

// TODO: confirmar estos pasos con NAYA antes de publicar.
const pasosAmpolletas = [
  "Lava tu cabello con tu shampoo NAYA.",
  "Aplica la ampolleta sobre el cabello y masajea suavemente.",
  "Déjala actuar el tiempo indicado en la etiqueta y termina tu rutina.",
];

// TODO: agregar descripción real de cada ampolleta.
const nombresAmpolletas = ["Ampolleta de Crecimiento", "Ampolleta de Nutrición"];

const imagenesHero = [
  {
    id: 1,
    escritorio: "/naya_foto/modelo3escritorio.png",
    celular: "/naya_foto/modelo3Movil.png",
    alt: "NAYA: Rizos que hablan de ti",
    busqueda: "Capilar",
  },
  {
    id: 2,
    escritorio: "/naya_foto/modelo4escritorio.png",
    celular: "/naya_foto/modelo4Movil.png",
    alt: "NAYA: cuidado botánico para tu cabello",
    busqueda: "Capilar",
  },
  {
    id: 3,
    escritorio: "/naya_foto/naya-banner-mantequillas-1920x800.webp",
    celular: "/naya_foto/naya-banner-mantequillas-1080x1350.webp",
    alt: "Mantequillas corporales NAYA",
    busqueda: "Mantequilla",
  },
];

const categorias = ["Todos", "Kits", "Línea Capilar", "Ampolletas", "Línea Frutal"];

// Los kits son productos reales en Supabase (ids 11 y 12) para que se puedan pagar.
const ID_KIT_ROMERO = 11;
const ID_KIT_CAYENA = 12;

const kitsPromocionales = [
  {
    id: ID_KIT_ROMERO,
    nombre: "Kit de Romero",
    descripcion: "Shampoo + ampolleta + acondicionador",
    imagen: "/naya_foto/kit-romero.png",
    precio: 82000,
    precioSeparado: 86000,
  },
  {
    id: ID_KIT_CAYENA,
    nombre: "Kit de Cayena",
    descripcion: "Shampoo + ampolleta + acondicionador",
    imagen: "/naya_foto/kit-cayena.png",
    precio: 82000,
    precioSeparado: 86000,
  },
];

const beneficiosFranja = [
  "Hecho en Medellín",
  "Extractos botánicos",
  "Envío gratis desde $150.000",
  "Paga con tarjeta, PSE o Nequi",
  "Asesoría por WhatsApp",
];

const lineasCapilares = [
  {
    id: "cayena",
    nombre: "Línea Cayena",
    titular: "Para el cabello opaco, reseco o con frizz",
    texto: "Una flor con muchas propiedades para tu cabello: limpia sin resecar y le devuelve el brillo y la suavidad.",
    beneficios: ["Brillo natural", "Desenreda y controla el frizz", "Ideal para uso diario"],
    kitId: ID_KIT_CAYENA,
    busqueda: "cayena",
  },
  {
    id: "romero",
    nombre: "Línea Romero",
    titular: "Para el cabello débil, quebradizo o con caída",
    texto: "Elige el Romero si notas que tu cabello está más débil: fortalece la hebra y estimula un crecimiento saludable.",
    beneficios: ["Ayuda a frenar la caída", "Controla el exceso de grasa", "Fortalece desde la raíz"],
    kitId: ID_KIT_ROMERO,
    busqueda: "romero",
  },
];

const INSTAGRAM_URL = "https://www.instagram.com/naya_renovacion/";

// Galería #RitualNAYA (como #LAMOUROSA): cada foto abre su publicación de Instagram.
// Para cambiar una: pega el enlace del post en `url` y la foto (guárdala en public/naya_foto/ig/) en `src`.
// `video` (opcional): archivo .mp4 en public/naya_foto/ig/; se reproduce en silencio y en bucle, y `src` es la portada.
// TODO: reemplazar `src` por la portada original de cada publicación.
const galeriaRitual: Array<{ url: string; etiqueta: string; src: string; posicion: string; video?: string }> = [
  { url: "https://www.instagram.com/reel/DbqnInaA7an/", etiqueta: "Cayena, nuestra flor favorita", src: "/naya_foto/kit-cayena.png", posicion: "center 55%", video: "/naya_foto/ig/cayena-feria.mp4" },
  { url: "https://www.instagram.com/reel/Da5qMJUAtPu/", etiqueta: "Ampolleta de Crecimiento", src: "/naya_foto/shampooromero.png", posicion: "center 45%", video: "/naya_foto/ig/ampolleta-crecimiento.mp4" },
  { url: "https://www.instagram.com/reel/DevAICsAv4Q/", etiqueta: "¿Qué mantequilla eres?", src: "/naya_foto/cherry.png", posicion: "center 60%" },
  { url: "https://www.instagram.com/p/De8ARoIg7w0/", etiqueta: "Ampolleta de Nutrición", src: "/naya_foto/ampolletarosa.png", posicion: "center 50%" },
  { url: "https://www.instagram.com/reel/DffMq5pAWv-/", etiqueta: "Rutina de una clienta", src: "/naya_foto/shampoocayena.png", posicion: "center 45%" },
  { url: "https://www.instagram.com/p/DfPr4-kILd4/", etiqueta: "El aliado de tu shampoo", src: "/naya_foto/kit-romero.png", posicion: "center 55%" },
];

function textoNormalizado(texto: string): string {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function normalizarBusqueda(texto: string): string {
  return textoNormalizado(texto).trim().replace(/\s+/g, " ");
}

function esKit(producto: Producto): boolean {
  return textoNormalizado(producto.categoria).startsWith("kit");
}

function esAmpolleta(producto: Producto): boolean {
  if (esKit(producto)) return false;
  const texto = textoNormalizado(
    [producto.nombre, producto.categoria, producto.descripcion, producto.detalles].join(" ")
  );
  return /ampollet|ampoll|tonico|crema.*nutricion.*profund|nutricion.*profund.*crema/.test(texto);
}

function categoriaVisible(producto: Producto): string {
  const texto = textoNormalizado(`${producto.nombre} ${producto.categoria}`);
  if (esKit(producto)) return "Kits";
  if (esAmpolleta(producto)) return "Ampolletas";
  if (texto.includes("mantequilla") && texto.includes("coco")) return "Línea Frutal";
  return producto.categoria;
}

// Palabras que la gente escribe distinto a como están en el catálogo.
const SINONIMOS_BUSQUEDA: Record<string, string> = {
  champu: "shampoo",
  shampu: "shampoo",
  champoo: "shampoo",
  pelo: "capilar",
  cabello: "capilar",
  cuerpo: "corporal",
  serum: "ampolleta",
  vitamina: "ampolleta",
  combo: "kit",
};

const PALABRAS_VACIAS = new Set(["de", "del", "la", "las", "el", "los", "y", "para", "con", "un", "una", "en"]);

/** Lleva cada palabra a su forma base: sin plural y con sinónimos ("shampoos" → "shampoo"). */
function raizBusqueda(palabra: string): string {
  let raiz = SINONIMOS_BUSQUEDA[palabra] ?? palabra;
  if (raiz.length > 5 && raiz.endsWith("es")) raiz = raiz.slice(0, -2);
  else if (raiz.length > 3 && raiz.endsWith("s")) raiz = raiz.slice(0, -1);
  return SINONIMOS_BUSQUEDA[raiz] ?? raiz;
}

function palabrasBusqueda(consulta: string): string[] {
  return consulta
    .split(" ")
    .filter((palabra) => palabra && !PALABRAS_VACIAS.has(palabra))
    .map(raizBusqueda);
}

function textoBuscable(producto: Producto): string {
  return normalizarBusqueda(
    [
      producto.nombre,
      producto.categoria,
      producto.descripcion,
      producto.detalles,
      categoriaVisible(producto),
      esAmpolleta(producto) ? "ampolleta" : "",
    ].join(" ")
  );
}

function imagenProducto(producto: Producto): string {
  if (producto.id === ID_KIT_ROMERO || producto.id === ID_KIT_CAYENA) return producto.imagen;
  const texto = textoNormalizado(
    [producto.nombre, producto.categoria, producto.descripcion, producto.detalles].join(" ")
  );
  if (/ampollet.*crecimiento|crecimiento.*ampollet|tonico.*crecimiento|crecimiento.*tonico/.test(texto)) {
    return "/naya_foto/ampolletaverde.png";
  }
  if (/ampollet.*nutricion|nutricion.*ampollet|crema.*nutricion|nutricion.*profund/.test(texto)) {
    return "/naya_foto/ampolletarosa.png";
  }
  if (texto.includes("shampoo") && texto.includes("cayena")) return "/naya_foto/shampoocayena.png";
  if (texto.includes("shampoo") && texto.includes("romero")) return "/naya_foto/shampooromero.png";
  if (texto.includes("acondicionador") && texto.includes("romero")) return "/naya_foto/acondicionador2.png";
  if (texto.includes("acondicionador") && texto.includes("cayena")) return "/naya_foto/acondicionador1.png";
  return producto.imagen;
}

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
  const [searchTerm, setSearchTerm] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [cantidadModal, setCantidadModal] = useState(1);
  
  // Estado del carrusel principal.
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroPausado, setHeroPausado] = useState(false);
  const [videoAmpolletasVisible, setVideoAmpolletasVisible] = useState(false);
  const [prefiereMovimientoReducido, setPrefiereMovimientoReducido] = useState(false);
  const [videoAmpolletasSilenciado, setVideoAmpolletasSilenciado] = useState(true);
  const heroTouchStart = useRef<number | null>(null);
  const heroSwipeTime = useRef(0);
  const videoAmpolletasRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoAmpolletasRef.current;
    if (!video) return;

    const movimientoReducido = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observer = new IntersectionObserver(
      ([entry]) => setVideoAmpolletasVisible(entry.isIntersecting),
      { threshold: 0.25 }
    );
    const actualizarPreferencia = () => setPrefiereMovimientoReducido(movimientoReducido.matches);

    observer.observe(video);
    actualizarPreferencia();
    movimientoReducido.addEventListener("change", actualizarPreferencia);

    return () => {
      observer.disconnect();
      movimientoReducido.removeEventListener("change", actualizarPreferencia);
    };
  }, []);

  useEffect(() => {
    const video = videoAmpolletasRef.current;
    if (!video) return;

    if (videoAmpolletasVisible && !prefiereMovimientoReducido) {
      video.play().catch((error: unknown) => {
        console.warn("No se pudo reproducir el video de las ampolletas:", error);
      });
    } else {
      video.pause();
    }
  }, [videoAmpolletasVisible, prefiereMovimientoReducido]);

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
        const idsViejos: Record<number, number> = { [-1]: ID_KIT_ROMERO, [-2]: ID_KIT_CAYENA };
        const itemsGuardados = (JSON.parse(carritoGuardado) as ItemCarrito[]).map((item) =>
          idsViejos[item.producto.id]
            ? { ...item, producto: { ...item.producto, id: idsViejos[item.producto.id] } }
            : item
        );
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

  // Cambio automático entre los banners cada 5 segundos.
  useEffect(() => {
    if (heroPausado) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % imagenesHero.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroPausado]);

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

  const consulta = normalizarBusqueda(searchTerm);
  const palabras = palabrasBusqueda(consulta);
  const buscaKits = palabras.some((palabra) => palabra.startsWith("kit"));
  const productosDeCategoria = productos.filter((producto) =>
    categoriaActiva === "Todos" || categoriaVisible(producto) === categoriaActiva
  );
  // Primero productos que tengan TODAS las palabras; si no hay, los que tengan ALGUNA.
  const coincidenTodas = productosDeCategoria.filter((producto) => {
    const texto = textoBuscable(producto);
    return palabras.every((palabra) => texto.includes(palabra));
  });
  const productosFiltrados = palabras.length === 0
    ? productosDeCategoria
    : coincidenTodas.length > 0
      ? coincidenTodas
      : productosDeCategoria.filter((producto) => {
        const texto = textoBuscable(producto);
        return palabras.some((palabra) => palabra !== "kit" && texto.includes(palabra));
      });

  const verCategoria = (categoria: string) => {
    setSearchTerm("");
    setCategoriaActiva(categoria);
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
  };

  const abrirModal = (producto: Producto) => {
    setProductoSeleccionado(producto);
    setCantidadModal(1);
  };

  const actualizarBusqueda = (term: string) => {
    setSearchTerm(term);
    setCategoriaActiva("Todos");
    if (term.trim()) {
      requestAnimationFrame(() => {
        document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
      });
    }
  };

  return (
    <main className="storefront min-h-screen font-sans">
      <Navbar
        cartCount={totalProductosCarrito}
        onOpenCart={() => setCarritoAbierto(true)}
        searchTerm={searchTerm}
        onSearchChange={actualizarBusqueda}
      />

      <section
        id="inicio"
        className="naya-hero"
        aria-label="Banners de NAYA"
        onMouseEnter={() => setHeroPausado(true)}
        onMouseLeave={() => setHeroPausado(false)}
        onTouchStart={(event) => {
          heroTouchStart.current = event.changedTouches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          const start = heroTouchStart.current;
          heroTouchStart.current = null;
          if (start === null) return;
          const end = event.changedTouches[0]?.clientX;
          if (end === undefined || Math.abs(start - end) < 40) return;
          event.preventDefault();
          heroSwipeTime.current = Date.now();
          setHeroIndex((current) =>
            (current + (start > end ? 1 : -1) + imagenesHero.length) % imagenesHero.length
          );
        }}
      >
        <div className="naya-hero__link">
          <picture className="naya-hero__picture">
            <source
              media="(min-width: 768px)"
              srcSet={imagenesHero[heroIndex].escritorio}
            />
            <img
              src={imagenesHero[heroIndex].celular}
              alt={imagenesHero[heroIndex].alt}
              fetchPriority={heroIndex === 0 ? "high" : "auto"}
              loading={heroIndex === 0 ? "eager" : "lazy"}
            />
          </picture>
          {heroIndex === 2 ? (
            <>
              <a
                className="naya-hero__whatsapp absolute z-10 hidden cursor-pointer md:block"
                style={{ left: "9.5%", top: "76%", width: "21.5%", height: "11%" }}
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensajeAsesoriaMantequillas)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Recibe asesoría por WhatsApp"
              />
              <a
                className="naya-hero__whatsapp absolute z-10 block cursor-pointer md:hidden"
                style={{ left: "22%", top: "52%", width: "56%", height: "6.5%" }}
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensajeAsesoriaMantequillas)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Recibe asesoría por WhatsApp"
              />
            </>
          ) : null}
        </div>

        <div className="naya-hero__arrows" aria-label="Controles del carrusel">
          <button
            type="button"
            className="naya-hero__arrow"
            aria-label="Banner anterior"
            onClick={() => setHeroIndex((current) => (current - 1 + imagenesHero.length) % imagenesHero.length)}
          >
            <ChevronLeft size={24} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="naya-hero__arrow"
            aria-label="Banner siguiente"
            onClick={() => setHeroIndex((current) => (current + 1) % imagenesHero.length)}
          >
            <ChevronRight size={24} aria-hidden="true" />
          </button>
        </div>

        <div className="naya-hero__dots" aria-label="Navegación de banners">
          {imagenesHero.map((banner, index) => (
            <button
              key={banner.id}
              type="button"
              onClick={() => setHeroIndex(index)}
              className={heroIndex === index ? "naya-hero__dot naya-hero__dot--active" : "naya-hero__dot"}
              aria-label={`Mostrar banner ${index + 1} de ${imagenesHero.length}`}
              aria-pressed={heroIndex === index}
            />
          ))}
        </div>
      </section>

      <div className="naya-marquee" aria-label="Por qué comprar en NAYA">
        <div className="naya-marquee__track">
          {[0, 1].map((copia) => (
            <ul key={copia} aria-hidden={copia === 1}>
              {beneficiosFranja.map((texto) => (
                <li key={texto}>
                  <Leaf size={14} aria-hidden="true" />
                  {texto}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <section id="kits-rituales" className="naya-lines" aria-labelledby="naya-lines-title">
        <div className="naya-lines__intro">
          <h2 id="naya-lines-title">¿Cayena o Romero?</h2>
          <p>Cada cabello necesita algo distinto. Elige tu línea y llévate el kit completo: shampoo, acondicionador y ampolleta.</p>
        </div>
        <div className="naya-lines__grid">
          {lineasCapilares.map((linea) => {
            const kit = kitsPromocionales.find((item) => item.id === linea.kitId);
            if (!kit) return null;
            return (
              <article key={linea.id} className={`naya-line naya-line--${linea.id}`}>
                <div className="naya-line__media">
                  <Image
                    src={kit.imagen}
                    alt={kit.nombre}
                    fill
                    sizes="(max-width: 767px) 92vw, 44vw"
                    className="object-cover"
                  />
                  <span className="naya-line__badge">Ahorras ${(kit.precioSeparado - kit.precio).toLocaleString("es-CO")}</span>
                </div>
                <div className="naya-line__body">
                  <p className="naya-line__name">{linea.nombre}</p>
                  <h3>{linea.titular}</h3>
                  <p className="naya-line__text">{linea.texto}</p>
                  <ul className="naya-line__benefits">
                    {linea.beneficios.map((beneficio) => <li key={beneficio}>{beneficio}</li>)}
                  </ul>
                  <div className="naya-line__price">
                    <span>{kit.nombre}</span>
                    <strong>${kit.precio.toLocaleString("es-CO")}</strong>
                    <del>${kit.precioSeparado.toLocaleString("es-CO")}</del>
                  </div>
                  <div className="naya-line__actions">
                    <button
                      type="button"
                      className="naya-line__buy"
                      onClick={() => {
                        agregarAlCarrito(productos.find((producto) => producto.id === kit.id) ?? {
                          id: kit.id,
                          categoria: "Kits",
                          nombre: kit.nombre,
                          descripcion: kit.descripcion,
                          detalles: kit.descripcion,
                          precio: kit.precio,
                          imagen: kit.imagen,
                        });
                        setCarritoAbierto(true);
                      }}
                    >
                      <ShoppingBag size={16} aria-hidden="true" />
                      Comprar el kit
                    </button>
                    <button type="button" className="naya-line__more" onClick={() => actualizarBusqueda(linea.busqueda)}>
                      Ver productos sueltos
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section id="naya-marca" className="naya-brand">
        <div className="naya-brand__inner">
          <figure className="naya-brand__video-column">
            <div className="naya-brand__video-frame">
              <div className="naya-brand__video-viewport">
                <Image
                  src="/naya_foto/ampolletaverde.png"
                  alt=""
                  fill
                  sizes="(max-width: 767px) 280px, 368px"
                  className="naya-brand__video-poster"
                />
                <video
                  ref={videoAmpolletasRef}
                  aria-label="Video del proceso de preparación de las ampolletas NAYA"
                  autoPlay={videoAmpolletasVisible && !prefiereMovimientoReducido}
                  muted={videoAmpolletasSilenciado}
                  loop
                  playsInline
                  preload="metadata"
                  poster="/naya_foto/ampolletaverde.png"
                >
                  <source src="/videos/naya-ampolletas.mp4" type="video/mp4" />
                </video>
              </div>
              {VIDEO_AMPOLLETAS_TIENE_AUDIO && !prefiereMovimientoReducido && (
                <button
                  type="button"
                  className="naya-brand__video-sound"
                  aria-label={videoAmpolletasSilenciado ? "Activar sonido" : "Silenciar"}
                  onClick={() => {
                    const video = videoAmpolletasRef.current;
                    if (!video) return;
                    video.muted = !videoAmpolletasSilenciado;
                    setVideoAmpolletasSilenciado(video.muted);
                  }}
                >
                  {videoAmpolletasSilenciado
                    ? <VolumeX size={18} aria-hidden="true" />
                    : <Volume2 size={18} aria-hidden="true" />}
                </button>
              )}
            </div>
            <figcaption>Así preparamos nuestras ampolletas</figcaption>
          </figure>

          <div className="naya-brand__copy">
            <h2>Nutrición o Crecimiento: tu cabello elige</h2>
            <p>Nuestras ampolletas son el paso extra después del shampoo. Así se usan:</p>
            <ol className="naya-ampoule-steps">
              {pasosAmpolletas.map((paso, index) => (
                <li key={paso}>
                  <span aria-hidden="true">{index + 1}</span>
                  <p>{paso}</p>
                </li>
              ))}
            </ol>
            <div className="naya-ampoule-products">
              {nombresAmpolletas.map((nombre) => (
                <div className="naya-ampoule-products__item" key={nombre}>{nombre}</div>
              ))}
            </div>
            <div className="naya-brand__actions">
              <a
                className="naya-button"
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensajeAsesoriaAmpolletas)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Pedir asesoría <ArrowRight size={15} aria-hidden="true" />
              </a>
              <button
                type="button"
                className="naya-button naya-button--outline"
                onClick={() => verCategoria("Ampolletas")}
              >
                Ver ampolletas
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="catalogo" className="naya-shop" aria-labelledby="naya-shop-title">
        <div className="naya-shop__header">
          <h2 id="naya-shop-title">Todos los productos</h2>
          <div className="naya-shop__tabs" role="tablist" aria-label="Filtrar productos">
            {categorias.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={categoriaActiva === cat}
                onClick={() => setCategoriaActiva(cat)}
                className={categoriaActiva === cat ? "naya-shop__tab naya-shop__tab--active" : "naya-shop__tab"}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {consulta && !cargandoProductos && !errorProductos && (
          <div className="naya-shop__search" role="status" aria-live="polite">
            <span>
              {productosFiltrados.length > 0
                ? `${productosFiltrados.length} ${productosFiltrados.length === 1 ? "resultado" : "resultados"} para “${searchTerm.trim()}”`
                : `No encontramos productos para “${searchTerm.trim()}”.`}
            </span>
            <button type="button" onClick={() => actualizarBusqueda("")}>Quitar búsqueda</button>
          </div>
        )}

        {errorProductos ? (
          <div className="naya-shop__empty" role="alert">
            <p>{errorProductos}</p>
            <button type="button" className="naya-button" onClick={() => window.location.reload()}>Volver a intentar</button>
          </div>
        ) : cargandoProductos ? (
          <p className="naya-shop__empty">Cargando productos...</p>
        ) : productosFiltrados.length === 0 ? (
          <div className="naya-shop__empty">
            <p>
              {buscaKits
                ? "Los kits están en la sección ¿Cayena o Romero?, más arriba."
                : consulta ? "Prueba con otra palabra, por ejemplo: shampoo, romero o mantequilla." : "No hay productos disponibles en esta categoría."}
            </p>
            {buscaKits && <a href="#kits-rituales" className="naya-button">Ver kits</a>}
          </div>
        ) : (
          <div className="naya-shop__grid">
            {productosFiltrados.map((producto) => (
              <article key={producto.id} className={`naya-card ${acentoProducto(producto)}`}>
                <button
                  type="button"
                  className="naya-card__media"
                  onClick={() => abrirModal(producto)}
                  aria-label={`Ver detalles de ${producto.nombre}`}
                >
                  <Image
                    src={imagenProducto(producto)}
                    alt={producto.nombre}
                    fill
                    sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 22vw"
                    className={esAmpolleta(producto) ? "object-contain" : "object-cover"}
                  />
                </button>
                <div className="naya-card__info">
                  <p className="naya-card__line">{categoriaVisible(producto)}</p>
                  <h3>
                    <button type="button" onClick={() => abrirModal(producto)}>{producto.nombre.trim()}</button>
                  </h3>
                  <p className="naya-card__price">${producto.precio.toLocaleString("es-CO")}</p>
                </div>
                <button
                  type="button"
                  className="naya-card__add"
                  onClick={() => {
                    agregarAlCarrito(producto, 1);
                    setCarritoAbierto(true);
                  }}
                >
                  Agregar al carrito
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="naya-ritual" aria-labelledby="naya-ritual-title">
        <h2 id="naya-ritual-title">#RitualNAYA</h2>
        <div className="naya-ritual__grid">
          {galeriaRitual.map((foto) => {
            return (
              <a
                key={foto.url}
                href={foto.url}
                target="_blank"
                rel="noopener noreferrer"
                className="naya-ritual__tile"
                aria-label={`${foto.etiqueta}, ver en Instagram`}
              >
                <Image src={foto.src} alt="" fill sizes="(max-width: 767px) 50vw, 33vw" className="object-cover" style={{ objectPosition: foto.posicion }} />
                {foto.video && (
                  <>
                    <video
                      className="naya-ritual__video"
                      src={foto.video}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      aria-hidden="true"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                    <span className="naya-ritual__play" aria-hidden="true"><Play size={14} fill="currentColor" /></span>
                  </>
                )}
                <span className="naya-ritual__label">
                  <small>NAYA</small>
                  {foto.etiqueta}
                </span>
              </a>
            );
          })}
        </div>
        <a className="naya-ritual__ig" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
          Síguenos en Instagram @naya_renovacion <ArrowRight size={15} aria-hidden="true" />
        </a>
      </section>

      <Benefits />
      <NewsletterSignup />
      <NayaFooter />
      <NayaWhatsAppButton />

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
                  src={imagenProducto(productoSeleccionado)}
                  alt={productoSeleccionado.nombre}
                  fill
                  sizes="(max-width: 640px) calc(100vw - 40px), 300px"
                  className="object-contain p-4"
                />
              </div>

              <div className="space-y-4">
                <span className={`product-card__category text-xs font-bold uppercase tracking-wider ${acentoProducto(productoSeleccionado)}`}>
                  {categoriaVisible(productoSeleccionado)}
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

      {/* CARRITO */}
      {carritoAbierto && (
        <div className="naya-cart" role="dialog" aria-modal="true" aria-labelledby="naya-cart-title">
          <button type="button" className="naya-cart__backdrop" aria-label="Cerrar carrito" onClick={() => setCarritoAbierto(false)} />
          <aside className="naya-cart__panel">
            <header className="naya-cart__header">
              <h2 id="naya-cart-title">
                Tu carrito{totalProductosCarrito > 0 && <span> ({totalProductosCarrito})</span>}
              </h2>
              <button type="button" className="naya-cart__close" aria-label="Cerrar carrito" onClick={() => setCarritoAbierto(false)}>
                <X size={22} aria-hidden="true" />
              </button>
            </header>

            {carrito.length === 0 ? (
              <div className="naya-cart__empty">
                <ShoppingBag size={36} strokeWidth={1.4} aria-hidden="true" />
                <p>Tu carrito está vacío</p>
                <button type="button" className="naya-cart__checkout" onClick={() => { setCarritoAbierto(false); document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" }); }}>
                  Ver productos
                </button>
              </div>
            ) : (
              <>
                <div className="naya-cart__free">
                  <p>
                    {totalPrecioCarrito >= ENVIO_GRATIS_DESDE
                      ? "¡Tu pedido tiene envío gratis!"
                      : <>Te faltan <strong>${(ENVIO_GRATIS_DESDE - totalPrecioCarrito).toLocaleString("es-CO")}</strong> para el envío gratis</>}
                  </p>
                  <div className="naya-cart__free-bar" aria-hidden="true">
                    <span style={{ width: `${Math.min(100, (totalPrecioCarrito / ENVIO_GRATIS_DESDE) * 100)}%` }} />
                  </div>
                </div>
                <ul className="naya-cart__items">
                  {carrito.map((item) => (
                    <li key={item.producto.id} className="naya-cart__item">
                      <div className="naya-cart__thumb">
                        <Image
                          src={imagenProducto(item.producto)}
                          alt={item.producto.nombre}
                          fill
                          sizes="84px"
                          className="object-cover"
                        />
                      </div>
                      <div className="naya-cart__info">
                        <div className="naya-cart__row">
                          <h3>{item.producto.nombre.trim()}</h3>
                          <button
                            type="button"
                            className="naya-cart__remove"
                            aria-label={`Quitar ${item.producto.nombre} del carrito`}
                            onClick={() => eliminarDelCarrito(item.producto.id)}
                          >
                            <Trash2 size={16} aria-hidden="true" />
                          </button>
                        </div>
                        <p className="naya-cart__unit">${item.producto.precio.toLocaleString("es-CO")} c/u</p>
                        <div className="naya-cart__row">
                          <div className="naya-cart__qty" aria-label="Cantidad">
                            <button type="button" aria-label="Quitar uno" onClick={() => cambiarCantidadCarrito(item.producto.id, -1)}>
                              <Minus size={14} aria-hidden="true" />
                            </button>
                            <span>{item.cantidad}</span>
                            <button type="button" aria-label="Agregar uno" onClick={() => cambiarCantidadCarrito(item.producto.id, 1)}>
                              <Plus size={14} aria-hidden="true" />
                            </button>
                          </div>
                          <strong>${(item.producto.precio * item.cantidad).toLocaleString("es-CO")}</strong>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <footer className="naya-cart__footer">
                  <div className="naya-cart__subtotal">
                    <span>Subtotal</span>
                    <strong>${totalPrecioCarrito.toLocaleString("es-CO")} COP</strong>
                  </div>
                  <p className="naya-cart__note">Envío $10.000 en Antioquia y $14.900 al resto del país. Códigos de descuento en el siguiente paso.</p>
                  <Link href="/checkout" className="naya-cart__checkout">
                    <Lock size={16} aria-hidden="true" />
                    Ir a pagar
                  </Link>
                  <Link href="/checkout?metodo=whatsapp" className="naya-cart__whatsapp">
                    Prefiero pedir por WhatsApp
                  </Link>
                </footer>
              </>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}