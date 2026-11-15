"use client";

import { ChevronDown, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/utils/supabase/browser";
import { WHATSAPP_NUMBER } from "@/utils/contacto";
import { CATEGORIAS_TIENDA, categoriaTienda, urlProducto } from "@/utils/catalogo";
import type { Producto } from "@/utils/productos";

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

const ANUNCIOS = [
  "10% OFF en tu primera compra con BIENVENIDA10",
  "Envío gratis en compras desde $150.000",
  "Recibe asesoría por WhatsApp",
];

function getCustomerName(user: User | null) {
  const fullName = user?.user_metadata?.full_name;
  if (typeof fullName === "string" && fullName.trim()) return fullName.trim();
  return user?.email?.split("@")[0] ?? "";
}

// Los productos del menú se cargan una sola vez por visita.
let productosMenu: Producto[] | null = null;

export default function Navbar({ cartCount, onOpenCart, searchTerm, onSearchChange }: NavbarProps) {
  const router = useRouter();
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [comprarOpen, setComprarOpen] = useState(false);
  const [busqueda, setBusqueda] = useState(searchTerm ?? "");
  const [productos, setProductos] = useState<Producto[]>(productosMenu ?? []);
  const [accountName, setAccountName] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const cierreMenu = useRef<number | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setAnnouncementIndex((c) => (c + 1) % ANUNCIOS.length), 4500);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (productosMenu) return;
    fetch("/api/productos")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Producto[]) => {
        if (!Array.isArray(data)) return;
        productosMenu = data;
        setProductos(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let activo = true;
    let unsubscribe = () => {};
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
        if (activo) setAccountName(getCustomerName(session?.user ?? null));
      });
      unsubscribe = () => listener.subscription.unsubscribe();
      void supabase.auth.getSession().then(({ data }) => {
        if (activo) setAccountName(getCustomerName(data.session?.user ?? null));
      });
    } catch (error) {
      console.error("No se pudo comprobar la sesión del cliente:", error);
    }
    return () => { activo = false; unsubscribe(); };
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const buscar = (event: React.FormEvent) => {
    event.preventDefault();
    const q = busqueda.trim();
    setSearchOpen(false);
    router.push(q ? `/productos?q=${encodeURIComponent(q)}` : "/productos");
  };

  const abrirComprar = () => { if (cierreMenu.current) window.clearTimeout(cierreMenu.current); setComprarOpen(true); };
  const cerrarComprar = () => { cierreMenu.current = window.setTimeout(() => setComprarOpen(false), 150); };

  const columnas = CATEGORIAS_TIENDA.map((cat) => ({
    cat,
    items: productos.filter((p) => categoriaTienda(p) === cat),
  }));

  return (
    <>
      <div className="nh-announcement" aria-live="polite">
        {announcementIndex === 2 ? (
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">{ANUNCIOS[2]}</a>
        ) : (
          <span key={announcementIndex}>{ANUNCIOS[announcementIndex]}</span>
        )}
      </div>

      <header className="nh" onMouseLeave={cerrarComprar}>
        <div className="nh__row">
          <div className="nh__left">
            <button
              type="button"
              className="nh__icon nh__only-mobile"
              onClick={() => { setMobileMenuOpen((o) => !o); setSearchOpen(false); }}
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} strokeWidth={1.6} /> : <Menu size={22} strokeWidth={1.6} />}
            </button>
            <button
              type="button"
              className="nh__icon nh__only-mobile"
              onClick={() => { setSearchOpen((o) => !o); setMobileMenuOpen(false); }}
              aria-label="Buscar productos"
            >
              <Search size={21} strokeWidth={1.6} />
            </button>
            <nav className="nh-nav nh__only-desktop" aria-label="Navegación principal">
              <button
                type="button"
                className={`nh-nav__link${comprarOpen ? " nh-nav__link--open" : ""}`}
                aria-expanded={comprarOpen}
                onMouseEnter={abrirComprar}
                onClick={() => setComprarOpen((o) => !o)}
              >
                Comprar <ChevronDown size={13} aria-hidden="true" />
              </button>
              <Link href="/productos?cat=Kits" className="nh-nav__link">Kits</Link>
              <a href="/test-mantequillas" target="_blank" rel="noopener" className="nh-nav__link nh-nav__link--accent">Test mantequillas</a>
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="nh-nav__link">Contacto</a>
            </nav>
          </div>

          <Link href="/" className="nh__logo" aria-label="NAYA, ir al inicio">NAYA</Link>

          <div className="nh__right">
            <button
              type="button"
              className="nh__icon nh__only-desktop"
              onClick={() => setSearchOpen((o) => !o)}
              aria-label="Buscar productos"
              aria-expanded={searchOpen}
            >
              <Search size={21} strokeWidth={1.6} />
            </button>
            <Link href="/cuenta" className="nh__icon" aria-label={accountName ? `Mi cuenta (${accountName})` : "Mi cuenta"} title={accountName || "Mi cuenta"}>
              <UserRound size={21} strokeWidth={1.6} aria-hidden="true" />
              {accountName && <span className="nh__dot" aria-hidden="true" />}
            </Link>
            <button type="button" className="nh__icon" onClick={onOpenCart} aria-label={`Abrir carrito, ${cartCount} productos`}>
              <ShoppingBag size={21} strokeWidth={1.6} aria-hidden="true" />
              {cartCount > 0 && <span className="nh__badge">{cartCount}</span>}
            </button>
          </div>
        </div>

        {comprarOpen && (
          <div className="nh-mega nh__only-desktop" onMouseEnter={abrirComprar} onMouseLeave={cerrarComprar}>
            <div className="nh-mega__inner">
              {columnas.map(({ cat, items }) => (
                <div key={cat} className="nh-mega__col">
                  <Link href={`/productos?cat=${encodeURIComponent(cat)}`} className="nh-mega__title" onClick={() => setComprarOpen(false)}>{cat}</Link>
                  {items.map((p) => (
                    <Link key={p.id} href={urlProducto(p)} className="nh-mega__link" onClick={() => setComprarOpen(false)}>
                      {p.nombre.replace(/\s+/g, " ").trim().replace(/^Mantequilla Corporal /, "Mantequilla ")}
                    </Link>
                  ))}
                </div>
              ))}
              <div className="nh-mega__col">
                <p className="nh-mega__title">Descubre</p>
                <Link href="/productos" className="nh-mega__link" onClick={() => setComprarOpen(false)}>Todos los productos</Link>
                <a href="/test-mantequillas" target="_blank" rel="noopener" className="nh-mega__link">¿Qué mantequilla eres?</a>
              </div>
            </div>
          </div>
        )}

        {searchOpen && (
          <div className="nh-search">
            <form className="nh-search__inner" onSubmit={buscar}>
              <Search size={18} aria-hidden="true" />
              <input
                ref={searchRef}
                type="search"
                value={busqueda}
                onChange={(e) => { setBusqueda(e.target.value); onSearchChange?.(e.target.value); }}
                placeholder="¿Qué estás buscando? Shampoo, ampolleta, mantequilla…"
                aria-label="Buscar productos"
              />
              <button type="button" className="nh__icon" onClick={() => setSearchOpen(false)} aria-label="Cerrar búsqueda">
                <X size={20} strokeWidth={1.6} />
              </button>
            </form>
          </div>
        )}

        {mobileMenuOpen && (
          <nav className="nh-mobile" aria-label="Menú">
            {columnas.map(({ cat, items }) => (
              <div key={cat}>
                <Link href={`/productos?cat=${encodeURIComponent(cat)}`} className="nh-mobile__title" onClick={() => setMobileMenuOpen(false)}>{cat}</Link>
                {items.map((p) => (
                  <Link key={p.id} href={urlProducto(p)} className="naya-nav__dropdown-link" onClick={() => setMobileMenuOpen(false)}>
                    {p.nombre.replace(/\s+/g, " ").trim().replace(/^Mantequilla Corporal /, "Mantequilla ")}
                  </Link>
                ))}
              </div>
            ))}
            <p className="nh-mobile__title">Más</p>
            <Link href="/productos" className="naya-nav__dropdown-link" onClick={() => setMobileMenuOpen(false)}>Todos los productos</Link>
            <a href="/test-mantequillas" target="_blank" rel="noopener" className="naya-nav__dropdown-link nh-nav__quiz">¿Qué mantequilla eres? Haz el test</a>
            <Link href="/cuenta" className="naya-nav__dropdown-link" onClick={() => setMobileMenuOpen(false)}>
              {accountName ? `Mi cuenta (${accountName})` : "Iniciar sesión / Mi cuenta"}
            </Link>
          </nav>
        )}
      </header>
    </>
  );
}
