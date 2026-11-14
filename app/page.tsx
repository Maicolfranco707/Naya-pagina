"use client";

import { startTransition, useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Leaf, ShoppingBag, Volume2, VolumeX } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Benefits from "@/components/home/Benefits";
import NayaFooter from "@/components/layout/NayaFooter";
import NayaWhatsAppButton from "@/components/layout/NayaWhatsAppButton";
import NewsletterSignup from "@/components/home/NewsletterSignup";
import { WHATSAPP_NUMBER } from "@/utils/contacto";
import type { Producto } from "@/utils/productos";

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

const categorias = ["Todos", "Línea Capilar",  "Ampolletas", "Línea Frutal"];

const kitsPromocionales = [
  {
    id: -1,
    nombre: "Kit de Romero",
    descripcion: "Shampoo + ampolleta + acondicionador",
    imagen: "/naya_foto/kit-romero.png",
    precio: 82000,
    precioSeparado: 86000,
  },
  {
    id: -2,
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
  "Envíos a toda Colombia",
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
    kitId: -2,
    busqueda: "cayena",
  },
  {
    id: "romero",
    nombre: "Línea Romero",
    titular: "Para el cabello débil, quebradizo o con caída",
    texto: "Elige el Romero si notas que tu cabello está más débil: fortalece la hebra y estimula un crecimiento saludable.",
    beneficios: ["Ayuda a frenar la caída", "Controla el exceso de grasa", "Fortalece desde la raíz"],
    kitId: -1,
    busqueda: "romero",
  },
];

const INSTAGRAM_URL = "https://www.instagram.com/naya_renovacion/";

// TODO: reemplazar por fotos originales del Instagram de NAYA (clientas, tutoriales).
const fotosInstagram = [
  { src: "/naya_foto/shampoocayena.png", alt: "Shampoo de Cayena NAYA" },
  { src: "/naya_foto/kit-romero.png", alt: "Kit de Romero NAYA" },
  { src: "/naya_foto/ampolletarosa.png", alt: "Ampolleta de Nutrición NAYA" },
  { src: "/naya_foto/coco_festival.png", alt: "Mantequilla Coco Festival NAYA" },
];

function textoNormalizado(texto: string): string {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function normalizarBusqueda(texto: string): string {
  return textoNormalizado(texto).trim().replace(/\s+/g, " ");
}

function esAmpolleta(producto: Producto): boolean {
  const texto = textoNormalizado(
    [producto.nombre, producto.categoria, producto.descripcion, producto.detalles].join(" ")
  );
  return /ampollet|ampoll|tonico|crema.*nutricion.*profund|nutricion.*profund.*crema/.test(texto);
}

function categoriaVisible(producto: Producto): string {
  const texto = textoNormalizado(`${producto.nombre} ${producto.categoria}`);
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
      const irAKits = palabrasBusqueda(normalizarBusqueda(term)).some((palabra) => palabra.startsWith("kit"));
      requestAnimationFrame(() => {
        document.getElementById(irAKits ? "kits-rituales" : "catalogo")?.scrollIntoView({ behavior: "smooth" });
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
                        agregarAlCarrito({
                          id: kit.id,
                          categoria: "Kit capilar",
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

      <section className="naya-ig" aria-labelledby="naya-ig-title">
        <div className="naya-ig__copy">
          <h2 id="naya-ig-title">Mira cómo se usa en Instagram</h2>
          <p>Tutoriales, resultados de clientas y promociones primero en <strong>@naya_renovacion</strong>.</p>
          <a className="naya-button" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
            Seguir en Instagram <ArrowRight size={15} aria-hidden="true" />
          </a>
        </div>
        <div className="naya-ig__grid">
          {fotosInstagram.map((foto) => (
            <a key={foto.src} href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="naya-ig__tile" aria-label={`${foto.alt}, ver en Instagram`}>
              <Image src={foto.src} alt="" fill sizes="(max-width: 767px) 45vw, 18vw" className="object-cover" />
            </a>
          ))}
        </div>
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
                          src={imagenProducto(item.producto)}
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