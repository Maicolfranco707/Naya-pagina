'use client';
import { ShoppingBag, Menu, X, Search, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function Navbar({ cartCount, onOpenCart, searchTerm, setSearchTerm }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <div className="bg-naya-green text-naya-sand text-xs py-2 px-4 text-center tracking-[0.2em] uppercase font-medium flex items-center justify-center gap-2">
        <Sparkles size={13} className="text-naya-terracotta" />
        <span>Envío gratis a todo el país por compras superiores a $120.000 COP</span>
      </div>

      <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#E9E7D7]/95 backdrop-blur-md shadow-sm py-3.5' : 'bg-naya-sand py-5'} border-b border-naya-stone/40`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          
          <a href="#inicio" className="text-3xl md:text-4xl font-serif tracking-[0.25em] text-naya-green font-bold">
            NAYA
          </a>

          <div className="hidden lg:flex items-center gap-10 font-medium text-sm text-naya-green/90 tracking-wider">
            <a href="#inicio" className="hover:text-naya-terracotta transition-colors">Inicio</a>
            <a href="#nosotros" className="hover:text-naya-terracotta transition-colors">Nosotros</a>
            <a href="#beneficios" className="hover:text-naya-terracotta transition-colors">Filosofía</a>
            <a href="#catalogo" className="hover:text-naya-terracotta transition-colors">Colección</a>
            <a href="#galeria" className="hover:text-naya-terracotta transition-colors">Experiencia</a>
            <a href="#contacto" className="hover:text-naya-terracotta transition-colors">Contacto</a>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <input 
                type="text" 
                placeholder="Buscar ritual..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/70 border border-naya-stone rounded-full px-4 py-2 pl-10 text-xs text-naya-green placeholder-naya-green/50 focus:outline-none focus:border-naya-terracotta w-44 transition-all shadow-2xs"
              />
              <Search size={14} className="absolute left-3.5 top-2.5 text-naya-green/50" />
            </div>

            <button 
              onClick={onOpenCart} 
              className="relative p-3 bg-naya-green text-naya-sand rounded-full hover:bg-naya-terracotta transition-all duration-200 shadow-xs flex items-center justify-center cursor-pointer group"
              aria-label="Abrir carrito"
            >
              <ShoppingBag size={18} className="group-hover:scale-105 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-naya-terracotta text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
            
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="lg:hidden p-2.5 bg-naya-stone/30 text-naya-green rounded-full hover:bg-naya-stone/50 transition-colors cursor-pointer flex items-center justify-center" 
              aria-label="Menú"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-naya-sand border-b border-naya-stone px-8 py-8 flex flex-col gap-5 font-serif text-xl text-naya-green shadow-xl animate-fadeIn">
            <a href="#inicio" onClick={() => setIsOpen(false)} className="hover:text-naya-terracotta">Inicio</a>
            <a href="#nosotros" onClick={() => setIsOpen(false)} className="hover:text-naya-terracotta">Nosotros</a>
            <a href="#beneficios" onClick={() => setIsOpen(false)} className="hover:text-naya-terracotta">Filosofía</a>
            <a href="#catalogo" onClick={() => setIsOpen(false)} className="hover:text-naya-terracotta">Colección</a>
            <a href="#galeria" onClick={() => setIsOpen(false)} className="hover:text-naya-terracotta">Experiencia</a>
            <a href="#contacto" onClick={() => setIsOpen(false)} className="hover:text-naya-terracotta">Contacto</a>
          </div>
        )}
      </nav>
    </>
  );
}