"use client";

import { ChevronDown, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/utils/supabase/browser";
import { WHATSAPP_NUMBER } from "@/utils/contacto";

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onOpenQuiz?: () => void;
}

const cabelloLinks = [
  { label: "Romero", term: "Romero" },
  { label: "Cayena", term: "Cayena" },
  { label: "Shampoo", term: "Shampoo" },
  { label: "Acondicionadores", term: "Acondicionador" },
  { label: "Ampolletas", term: "Ampolleta" },
];

function MenuLinks({
  links,
  onSelect,
}: {
  links: Array<{ label: string; term: string }>;
  onSelect: (term: string) => void;
}) {
  return links.map(({ label, term }) => (
    <button
      key={label}
      type="button"
      onClick={() => onSelect(term)}
      className="naya-nav__dropdown-link"
    >
      {label}
    </button>
  ));
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

export default function Navbar({
  cartCount,
  onOpenCart,
  searchTerm,
  onSearchChange,
  onOpenQuiz,
}: NavbarProps) {
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const [openMenu, setOpenMenu] = useState<"cabello" | "piel" | null>(null);
  const [accountName, setAccountName] = useState("");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const timer = window.setInterval(() => {
      setAnnouncementIndex((current) => (current + 1) % ANUNCIOS.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let activo = true;
    let unsubscribe = () => {};

    const comprobarSesion = async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
          if (activo) setAccountName(getCustomerName(session?.user ?? null));
        });
        unsubscribe = () => authListener.subscription.unsubscribe();

        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (activo) setAccountName(getCustomerName(data.session?.user ?? null));
      } catch (error) {
        console.error("No se pudo comprobar la sesión del cliente:", error);
        if (activo) setAuthError("No se pudo comprobar la sesión.");
      }
    };

    void comprobarSesion();
    return () => {
      activo = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const selectCollection = (term: string) => {
    onSearchChange(term);
    setOpenMenu(null);
    setMobileMenuOpen(false);
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
  };

  const goToKits = () => {
    setOpenMenu(null);
    setMobileMenuOpen(false);
    document.getElementById("kits-rituales")?.scrollIntoView({ behavior: "smooth" });
  };

  const irAlCatalogo = () => {
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
  };

  const navLinks = (
    <>
      <div className="nh-nav__group">
        <button
          type="button"
          className="nh-nav__link"
          aria-expanded={openMenu === "cabello"}
          onClick={() => setOpenMenu(openMenu === "cabello" ? null : "cabello")}
        >
          Cabello <ChevronDown size={13} aria-hidden="true" />
        </button>
        {openMenu === "cabello" && (
          <div className="nh-nav__dropdown">
            <MenuLinks links={cabelloLinks} onSelect={selectCollection} />
          </div>
        )}
      </div>
      <div className="nh-nav__group">
        <button
          type="button"
          className="nh-nav__link"
          aria-expanded={openMenu === "piel"}
          onClick={() => setOpenMenu(openMenu === "piel" ? null : "piel")}
        >
          Piel <ChevronDown size={13} aria-hidden="true" />
        </button>
        {openMenu === "piel" && (
          <div className="nh-nav__dropdown">
            <MenuLinks links={[{ label: "Mantequillas", term: "Mantequilla" }]} onSelect={selectCollection} />
          </div>
        )}
      </div>
      <button type="button" className="nh-nav__link" onClick={goToKits}>Kits</button>
      <button type="button" className="nh-nav__link" onClick={() => selectCollection("")}>Todos</button>
      {onOpenQuiz && <button type="button" className="nh-nav__link nh-nav__link--accent" onClick={onOpenQuiz}>Haz el test</button>}
    </>
  );

  return (
    <>
      <div className="nh-announcement" aria-live="polite">
        {announcementIndex === 2 ? (
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">{ANUNCIOS[2]}</a>
        ) : (
          <span key={announcementIndex}>{ANUNCIOS[announcementIndex]}</span>
        )}
      </div>

      <header className="nh">
        <div className="nh__row">
          <div className="nh__left">
            <button
              type="button"
              className="nh__icon nh__only-mobile"
              onClick={() => { setMobileMenuOpen((open) => !open); setSearchOpen(false); }}
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} strokeWidth={1.6} /> : <Menu size={22} strokeWidth={1.6} />}
            </button>
            <button
              type="button"
              className="nh__icon nh__only-mobile"
              onClick={() => { setSearchOpen((open) => !open); setMobileMenuOpen(false); }}
              aria-label="Buscar productos"
            >
              <Search size={21} strokeWidth={1.6} />
            </button>
            <nav className="nh-nav nh__only-desktop" aria-label="Navegación principal">{navLinks}</nav>
          </div>

          <a href="#inicio" className="nh__logo" aria-label="NAYA, ir al inicio">NAYA</a>

          <div className="nh__right">
            <button
              type="button"
              className="nh__icon nh__only-desktop"
              onClick={() => setSearchOpen((open) => !open)}
              aria-label="Buscar productos"
              aria-expanded={searchOpen}
            >
              <Search size={21} strokeWidth={1.6} />
            </button>
            <Link href="/cuenta" className="nh__icon" aria-label={accountName ? `Mi cuenta (${accountName})` : "Mi cuenta"} title={accountName || "Mi cuenta"}>
              <UserRound size={21} strokeWidth={1.6} aria-hidden="true" />
              {accountName && <span className="nh__dot" aria-hidden="true" />}
            </Link>
            <button
              type="button"
              className="nh__icon"
              onClick={onOpenCart}
              aria-label={`Abrir carrito, ${cartCount} productos`}
            >
              <ShoppingBag size={21} strokeWidth={1.6} aria-hidden="true" />
              {cartCount > 0 && <span className="nh__badge">{cartCount}</span>}
            </button>
          </div>
          {authError && <p className="naya-header__auth-error" role="alert">{authError}</p>}
        </div>

        {searchOpen && (
          <div className="nh-search">
            <form
              className="nh-search__inner"
              onSubmit={(event) => { event.preventDefault(); setSearchOpen(false); irAlCatalogo(); }}
            >
              <Search size={18} aria-hidden="true" />
              <input
                ref={searchRef}
                type="search"
                value={searchTerm}
                onChange={(event) => onSearchChange(event.target.value)}
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
            <p className="nh-mobile__title">Cabello</p>
            <MenuLinks links={cabelloLinks} onSelect={selectCollection} />
            <p className="nh-mobile__title">Piel</p>
            <MenuLinks links={[{ label: "Mantequillas", term: "Mantequilla" }]} onSelect={selectCollection} />
            <p className="nh-mobile__title">Tienda</p>
            <button type="button" className="naya-nav__dropdown-link" onClick={goToKits}>Kits</button>
            <button type="button" className="naya-nav__dropdown-link" onClick={() => selectCollection("")}>Todos los productos</button>
            {onOpenQuiz && (
              <button type="button" className="naya-nav__dropdown-link" onClick={() => { setMobileMenuOpen(false); onOpenQuiz(); }}>✨ Descubre tu rutina (test)</button>
            )}
            <Link href="/cuenta" className="naya-nav__dropdown-link" onClick={() => setMobileMenuOpen(false)}>
              {accountName ? `Mi cuenta (${accountName})` : "Iniciar sesión / Mi cuenta"}
            </Link>
          </nav>
        )}
      </header>
    </>
  );
}
