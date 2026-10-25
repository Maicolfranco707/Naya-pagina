"use client";

import { startTransition, useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Inter, Playfair_Display } from "next/font/google";
import { ArrowRight, ChevronLeft, ChevronRight, Leaf, ShoppingBag, Sparkles, Volume2, VolumeX } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Benefits from "@/components/home/Benefits";
import { CommunityGallery, CustomerReviews } from "@/components/home/CommunitySections";
import NayaFooter from "@/components/layout/NayaFooter";
import NayaWhatsAppButton from "@/components/layout/NayaWhatsAppButton";
import NewsletterSignup from "@/components/home/NewsletterSignup";
import type { Producto } from "@/utils/productos";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
});

interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

const numeroWhatsAppNaya = "573042051221";
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
  const productosFiltrados = productos.filter((producto) => {
    const coincideCategoria = categoriaActiva === "Todos"
        || categoriaVisible(producto) === categoriaActiva;
    const coincideBusqueda = !consulta
      || normalizarBusqueda(
        [producto.nombre, producto.categoria, producto.descripcion, producto.detalles].join(" ")
      ).includes(consulta)
      || (consulta.startsWith("ampoll") && esAmpolleta(producto));
    return coincideCategoria && coincideBusqueda;
  });

  // TODO: ordenar por ventas cuando el catálogo exponga datos de popularidad.
  const productosDestacados = productos.slice(0, 4);
  const productoCabello = productos.find((producto) => /shampoo|acondicionador/i.test(producto.nombre));
  const productoPiel = productos.find((producto) => /mantequilla|corporal/i.test(`${producto.nombre} ${producto.categoria}`));

  const seleccionarColeccion = (term: string) => {
    setSearchTerm(term);
    setCategoriaActiva("Todos");
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
    <main className={`storefront min-h-screen font-sans ${inter.variable} ${playfairDisplay.variable}`}>
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
                href={`https://wa.me/${numeroWhatsAppNaya}?text=${encodeURIComponent(mensajeAsesoriaMantequillas)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Recibe asesoría por WhatsApp"
              />
              <a
                className="naya-hero__whatsapp absolute z-10 block cursor-pointer md:hidden"
                style={{ left: "22%", top: "52%", width: "56%", height: "6.5%" }}
                href={`https://wa.me/${numeroWhatsAppNaya}?text=${encodeURIComponent(mensajeAsesoriaMantequillas)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Recibe asesoría por WhatsApp"
              />
            </>
          ) : (
            <a
              className="naya-hero__image-link"
              href="#catalogo"
              aria-label={`${imagenesHero[heroIndex].alt}. Explorar colección`}
              onClick={(event) => {
                if (Date.now() - heroSwipeTime.current < 500) {
                  event.preventDefault();
                  return;
                }
                seleccionarColeccion(imagenesHero[heroIndex].busqueda);
              }}
            />
          )}
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

      <section id="mas-vendidos" className="naya-featured">
        <div className="naya-section-heading">
          <span className="naya-section-heading__eyebrow">Favoritos botánicos</span>
          <h2>Los más vendidos</h2>
          <p>Rituales sencillos para acompañar tu cuidado todos los días.</p>
        </div>

        {errorProductos ? (
          <p className="naya-section-message" role="alert">{errorProductos}</p>
        ) : cargandoProductos ? (
          <p className="naya-section-message">Cargando productos...</p>
        ) : productosDestacados.length === 0 ? (
          <p className="naya-section-message">Pronto encontrarás aquí nuestros favoritos.</p>
        ) : (
          <div className="naya-featured__grid">
            {productosDestacados.map((producto) => (
              <article className="naya-product-card" key={producto.id}>
                <div className="naya-product-card__image">
                  <Image
                    src={imagenProducto(producto)}
                    alt={producto.nombre}
                    fill
                    sizes="(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 25vw"
                    className="object-contain"
                  />
                </div>
                <div className="naya-product-card__body">
                  <span className="naya-product-card__category">{categoriaVisible(producto)}</span>
                  <h3>{producto.nombre}</h3>
                  <p className="naya-product-card__price">${producto.precio.toLocaleString("es-CO")} COP</p>
                  <div className="naya-product-card__actions">
                    <button type="button" className="naya-button naya-button--outline" onClick={() => abrirModal(producto)}>
                      Compra rápida
                    </button>
                    <button
                      type="button"
                      className="naya-button"
                      onClick={() => {
                        agregarAlCarrito(producto);
                        setCarritoAbierto(true);
                      }}
                    >
                      <ShoppingBag size={15} aria-hidden="true" />
                      Agregar al carrito
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div id="kits-rituales" className="naya-kits">
          <div className="naya-kits__heading">
            <span className="naya-section-heading__eyebrow">Rutinas completas</span>
            <h3>Kits de cuidado capilar</h3>
            <p>Todo lo esencial para un ritual botánico, en una sola compra.</p>
          </div>
          <div className="naya-kits__grid">
            {kitsPromocionales.map((kit) => (
              <article className="naya-kit-card" key={kit.nombre}>
                <div className="naya-kit-card__image">
                  <Image
                    src={kit.imagen}
                    alt={kit.nombre}
                    fill
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 36vw, 28vw"
                    className="object-contain"
                  />
                </div>
                <div className="naya-kit-card__body">
                  <span className="naya-product-card__category">Ahorra en tu rutina</span>
                  <h4>{kit.nombre}</h4>
                  <p>{kit.descripcion}</p>
                  <div className="naya-kit-card__pricing">
                    <del>Por separado: ${kit.precioSeparado.toLocaleString("es-CO")}</del>
                    <span className="naya-kit-card__price">${kit.precio.toLocaleString("es-CO")} COP</span>
                    <span className="naya-kit-card__saving">Ahorras ${(kit.precioSeparado - kit.precio).toLocaleString("es-CO")} COP</span>
                  </div>
                  <button
                    type="button"
                    className="naya-button"
                    onClick={() => {
                      const productoKit: Producto = {
                        id: kit.id,
                        categoria: "Kit capilar",
                        nombre: kit.nombre,
                        descripcion: kit.descripcion,
                        detalles: kit.descripcion,
                        precio: kit.precio,
                        imagen: kit.imagen,
                      };
                      agregarAlCarrito(productoKit);
                      setCarritoAbierto(true);
                    }}
                  >
                    <ShoppingBag size={15} aria-hidden="true" />
                    Agregar kit al carrito
                  </button>
                </div>
              </article>
            ))}
          </div>
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
            <span className="naya-brand__eyebrow">Hechas en Medellín, con extractos botánicos</span>
            <h2>Cómo usar nuestras ampolletas</h2>
            <p>Un paso extra en tu rutina para darle al cabello lo que necesita.</p>
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
                href={`https://wa.me/${numeroWhatsAppNaya}?text=${encodeURIComponent(mensajeAsesoriaAmpolletas)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Pedir asesoría <ArrowRight size={15} aria-hidden="true" />
              </a>
              <button
                type="button"
                className="naya-button naya-button--outline"
                onClick={() => seleccionarColeccion("Ampolleta")}
              >
                Ver ampolletas
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="categorias" className="naya-categories">
        <div className="naya-section-heading">
          <span className="naya-section-heading__eyebrow">Encuentra tu ritual</span>
          <h2>Explora NAYA</h2>
          <p>Un cuidado consciente para cada parte de ti.</p>
        </div>
        <div className="naya-categories__grid">
          <a
            className="naya-category-card"
            href="#catalogo"
            onClick={() => seleccionarColeccion("Capilar")}
          >
            <div className="naya-category-card__image">
              {productoCabello ? (
                <Image src={imagenProducto(productoCabello)} alt="" fill sizes="(max-width: 640px) 90vw, 33vw" className="object-contain p-5" />
              ) : (
                <div className="naya-category-card__placeholder"><Leaf size={34} aria-hidden="true" /></div>
              )}
            </div>
            <div className="naya-category-card__label">
              <div><h3>Cabello</h3><p>Fuerza y vitalidad desde la raíz</p></div>
              <ArrowRight size={18} aria-hidden="true" />
            </div>
          </a>
          <a
            className="naya-category-card"
            href="#catalogo"
            onClick={() => seleccionarColeccion("Mantequilla")}
          >
            <div className="naya-category-card__image">
              {productoPiel ? (
                <Image src={imagenProducto(productoPiel)} alt="" fill sizes="(max-width: 640px) 90vw, 33vw" className="object-contain p-5" />
              ) : (
                <div className="naya-category-card__placeholder"><Sparkles size={34} aria-hidden="true" /></div>
              )}
            </div>
            <div className="naya-category-card__label">
              <div><h3>Piel</h3><p>Hidratación de origen botánico</p></div>
              <ArrowRight size={18} aria-hidden="true" />
            </div>
          </a>
          <a className="naya-category-card" href="#kits-rituales">
            <div className="naya-category-card__image">
              <Image
                src="/naya_foto/kit-romero.png"
                alt="Kit capilar de Romero NAYA"
                fill
                sizes="(max-width: 640px) 90vw, 33vw"
                className="object-contain p-4"
              />
            </div>
            <div className="naya-category-card__label">
              <div><h3>Kits</h3><p>Tu rutina completa, en un solo ritual</p></div>
              <ArrowRight size={18} aria-hidden="true" />
            </div>
          </a>
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
        {consulta && !cargandoProductos && !errorProductos && (
          <p className="mb-5 text-center text-sm text-naya-cream/75" role="status" aria-live="polite">
            {productosFiltrados.length > 0
              ? `${productosFiltrados.length} ${productosFiltrados.length === 1 ? "producto encontrado" : "productos encontrados"} para “${searchTerm.trim()}”`
              : `No encontramos productos para “${searchTerm.trim()}”.`}
          </p>
        )}
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
            <div className="col-span-full py-12 text-center">
              <p className="text-sm text-naya-cream/70">
                {consulta ? "Prueba con otro nombre, categoría o característica del producto." : "No hay productos disponibles en esta categoría."}
              </p>
              {consulta && (
                <button
                  type="button"
                  onClick={() => actualizarBusqueda("")}
                  className="primary-action mt-4 px-5 py-2 text-sm font-bold"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          ) : productosFiltrados.map((producto) => (
            <div 
              key={producto.id} 
              className={`product-card ${acentoProducto(producto)} p-4 sm:p-5 transition duration-300 hover:-translate-y-1 group cursor-pointer flex flex-col`}
              onClick={() => abrirModal(producto)}
            >
              <div className="product-card__image relative h-56 sm:h-64 w-full mb-4 overflow-hidden flex items-center justify-center">
                <Image 
                  src={imagenProducto(producto)}
                  alt={producto.nombre}
                  fill
                  sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) calc(50vw - 40px), 280px"
                  className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <span className="product-card__category text-[10px] font-bold uppercase tracking-wider">
                {categoriaVisible(producto)}
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

      <CustomerReviews />
      <CommunityGallery />
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