"use client";

import { ChevronDown, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
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

export default function Navbar({
  cartCount,
  onOpenCart,
  searchTerm,
  onSearchChange,
}: NavbarProps) {
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<"cabello" | "piel" | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setAnnouncementIndex((current) => (current + 1) % 2);
    }, 4500);

    return () => window.clearInterval(timer);
  }, []);

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

  const searchInput = (
    <label className="naya-nav__search">
      <Search aria-hidden="true" size={17} />
      <input
        type="search"
        value={searchTerm}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Buscar productos"
        aria-label="Buscar productos"
      />
    </label>
  );

  return (
    <>
      <div className="naya-announcement" aria-live="polite">
        {announcementIndex === 0 ? (
          <a
            href="https://wa.me/573042051221"
            target="_blank"
            rel="noreferrer"
            aria-label="Recibe asesoría por WhatsApp"
          >
            Recibe asesoría por WhatsApp
          </a>
        ) : (
          <span>Envíos a todo Colombia</span>
        )}
      </div>

      <header className="naya-header">
        <div className="naya-header__top">
          <div className="naya-header__search-desktop">{searchInput}</div>

          <button
            type="button"
            className="naya-header__icon naya-header__mobile-search"
            onClick={() => setMobileSearchOpen((open) => !open)}
            aria-label={mobileSearchOpen ? "Cerrar búsqueda" : "Abrir búsqueda"}
            aria-expanded={mobileSearchOpen}
          >
            {mobileSearchOpen ? <X size={20} /> : <Search size={20} />}
          </button>

          <a href="#inicio" className="naya-header__logo" aria-label="NAYA, ir al inicio">
            NAYA
          </a>

          <button
            type="button"
            className="naya-header__cart"
            onClick={onOpenCart}
            aria-label={`Abrir carrito, ${cartCount} productos`}
          >
            <ShoppingBag size={19} strokeWidth={1.7} aria-hidden="true" />
            <span className="naya-header__cart-label">Carrito</span>
            <span className="naya-header__cart-count">{cartCount}</span>
          </button>
        </div>

        {mobileSearchOpen && (
          <div className="naya-header__mobile-search-panel">{searchInput}</div>
        )}

        <nav className="naya-nav" aria-label="Navegación principal">
          <button
            type="button"
            className="naya-nav__mobile-toggle"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-expanded={mobileMenuOpen}
            aria-controls="naya-nav-links"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            <span>{mobileMenuOpen ? "Cerrar" : "Menú"}</span>
          </button>

          <div
            id="naya-nav-links"
            className={`naya-nav__links${mobileMenuOpen ? " naya-nav__links--open" : ""}`}
          >
            <div className="naya-nav__group">
              <button
                type="button"
                className="naya-nav__trigger"
                aria-expanded={openMenu === "cabello"}
                onClick={() => setOpenMenu(openMenu === "cabello" ? null : "cabello")}
              >
                Cabello <ChevronDown size={13} aria-hidden="true" />
              </button>
              {openMenu === "cabello" && (
                <div className="naya-nav__dropdown">
                  <MenuLinks links={cabelloLinks} onSelect={selectCollection} />
                </div>
              )}
            </div>

            <div className="naya-nav__group">
              <button
                type="button"
                className="naya-nav__trigger"
                aria-expanded={openMenu === "piel"}
                onClick={() => setOpenMenu(openMenu === "piel" ? null : "piel")}
              >
                Piel <ChevronDown size={13} aria-hidden="true" />
              </button>
              {openMenu === "piel" && (
                <div className="naya-nav__dropdown">
                  <MenuLinks links={[{ label: "Mantequillas", term: "Mantequilla" }]} onSelect={selectCollection} />
                </div>
              )}
            </div>

            <button type="button" className="naya-nav__link" onClick={goToKits}>
              Kits
            </button>
            <button type="button" className="naya-nav__link" onClick={goToKits}>
              Ofertas
            </button>
          </div>
        </nav>
      </header>
    </>
  );
}
