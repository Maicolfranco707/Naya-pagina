const fs = require('fs');
const path = require('path');

const carpetas = ['components', 'utils', 'app'];
carpetas.forEach(carpeta => {
  const rutaCarpeta = path.join(__dirname, carpeta);
  if (!fs.existsSync(rutaCarpeta)) {
    fs.mkdirSync(rutaCarpeta, { recursive: true });
    console.log(`📁 Carpeta creada: ${carpeta}`);
  }
});

const archivos = {
  'tailwind.config.ts': `import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        naya: {
          green: '#1F3A34',
          terracotta: '#BE5B4C',
          sand: '#E9E7D7',
          stone: '#CECCBF',
          light: '#F4F3ED',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Manrope"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
export default config;`,

  'app/globals.css': `@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  scroll-behavior: smooth;
  background-color: #E9E7D7;
  color: #1F3A34;
  font-family: 'Manrope', sans-serif;
  -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #E9E7D7;
}
::-webkit-scrollbar-thumb {
  background: #CECCBF;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #BE5B4C;
}`,

  'utils/checkout.ts': `export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export const processWhatsAppCheckout = (cartItems: CartItem[], total: number) => {
  const phoneNumber = "573135731901";
  let message = "🌿 *Nuevo Pedido - NAYA* 🌿\\n\\nHola, me gustaría adquirir los siguientes productos:\\n";
  
  cartItems.forEach(item => {
    message += \`• \${item.name} (x\${item.quantity})\\n\`;
  });
  
  const formattedTotal = new Intl.NumberFormat('es-CO', { 
    style: 'currency', currency: 'COP', minimumFractionDigits: 0 
  }).format(total);

  message += \`\\n*Total a pagar:* \${formattedTotal}\\n\\nQuedo atento(a) para coordinar el pago y envío. ¡Muchas gracias!\`;
  
  const encodedMessage = encodeURIComponent(message);
  window.open(\`https://wa.me/\${phoneNumber}?text=\${encodedMessage}\`, '_blank');
};`,

  'components/Navbar.tsx': `'use client';
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

      <nav className={\`sticky top-0 z-50 transition-all duration-300 \${scrolled ? 'bg-[#E9E7D7]/95 backdrop-blur-md shadow-sm py-3.5' : 'bg-naya-sand py-5'} border-b border-naya-stone/40\`}>
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
}`,

  'components/Hero.tsx': `export default function Hero() {
  return (
    <section id="inicio" className="relative bg-naya-sand py-24 md:py-36 px-6 md:px-12 overflow-hidden flex items-center">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        
        <div className="lg:col-span-7 space-y-8 text-center lg:text-left z-10">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] bg-naya-stone/30 text-naya-green px-4 py-2 rounded-full font-semibold border border-naya-stone/50">
            <span>✦ Bienestar capilar consciente</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-naya-green leading-[1.15]">
            La esencia botánica para la salud de tu cabello.
          </h1>
          
          <p className="text-base md:text-lg text-naya-green/80 font-sans leading-relaxed max-w-xl mx-auto lg:mx-0">
            Fórmulas magistrales inspiradas en la sabiduría de la tierra. Nutrición pura, texturas sensoriales y renovación profunda desde la raíz.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
            <a 
              href="#catalogo" 
              className="bg-naya-green text-naya-sand px-8 py-4 rounded-full font-medium tracking-wide hover:bg-naya-terracotta transition-all duration-200 shadow-sm text-center text-sm inline-flex items-center justify-center cursor-pointer"
            >
              Explorar Colección
            </a>
            <a 
              href="#nosotros" 
              className="border border-naya-green/40 text-naya-green px-8 py-4 rounded-full font-medium tracking-wide hover:border-naya-green hover:bg-naya-green/5 transition-all duration-200 text-center text-sm inline-flex items-center justify-center cursor-pointer"
            >
              Nuestra Historia
            </a>
          </div>
        </div>

        <div className="lg:col-span-5 relative">
          <div className="relative mx-auto max-w-md lg:max-w-none h-[480px] md:h-[580px] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/40">
            <img 
              src="https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&q=80&w=1000" 
              alt="Ritual capilar botánico NAYA" 
              className="w-full h-full object-cover filter brightness-95"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-naya-green/40 via-transparent to-transparent"></div>
          </div>
          
          <div className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-naya-stone/50 hidden sm:block max-w-[200px]">
            <p className="font-serif text-naya-green text-2xl font-bold">100%</p>
            <p className="text-xs text-naya-green/70 font-sans tracking-wide mt-1">Extractos puros y activos naturales botánicos.</p>
          </div>
        </div>

      </div>
    </section>
  );
}`,

  'components/About.tsx': `export default function About() {
  return (
    <section id="nosotros" className="py-28 bg-[#F4F3ED] px-6 md:px-12 border-y border-naya-stone/30">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        <div className="relative h-[450px] md:h-[520px] rounded-[2rem] overflow-hidden shadow-xl">
          <img 
            src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=900" 
            alt="Ingredientes naturales NAYA" 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-6">
          <span className="text-xs uppercase tracking-[0.3em] text-naya-terracotta font-semibold">
            ✦ Tradición & Ciencia Botánica
          </span>
          <h2 className="text-3xl md:text-5xl font-serif text-naya-green leading-tight">
            Una pausa consciente para reconectar con tu esencia.
          </h2>
          <p className="text-naya-green/80 leading-relaxed font-sans text-base">
            En NAYA creemos que el verdadero cuidado capilar no necesita artificios. Fusionamos botánica avanzada con rituales de bienestar para ofrecerte fórmulas limpias, libres de sulfatos y parabenos, que devuelven la vitalidad natural a tu melena.
          </p>
          
          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-naya-stone/40">
            <div>
              <h4 className="font-serif text-3xl text-naya-green font-bold">Zero</h4>
              <p className="text-xs tracking-wider uppercase text-naya-green/70 mt-1">Sulfatos ni químicos agresivos</p>
            </div>
            <div>
              <h4 className="font-serif text-3xl text-naya-green font-bold">Puro</h4>
              <p className="text-xs tracking-wider uppercase text-naya-green/70 mt-1">Respeto por el ecosistema</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}`,

  'components/Benefits.tsx': `import { Leaf, Droplet, Sparkles, Flower2 } from 'lucide-react';

const pilares = [
  { icon: <Leaf className="w-6 h-6 text-naya-terracotta" />, title: "Botánica Pura", desc: "Ingredientes cosechados con respeto para nutrir cada hebra desde la raíz." },
  { icon: <Droplet className="w-6 h-6 text-naya-terracotta" />, title: "Hidratación Profunda", desc: "Retención de humedad óptima para un cabello suave, elástico y sedoso." },
  { icon: <Sparkles className="w-6 h-6 text-naya-terracotta" />, title: "Brillo Espejo", desc: "Devuelve la luminosidad perdida frente al estrés ambiental diario." },
  { icon: <Flower2 className="w-6 h-6 text-naya-terracotta" />, title: "Fuerza y Vitalidad", desc: "Estimula el folículo capilar para prevenir el quiebre y promover grosor." },
];

export default function Benefits() {
  return (
    <section id="beneficios" className="py-28 bg-naya-sand px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <span className="text-xs uppercase tracking-[0.3em] text-naya-terracotta font-semibold">✦ Filosofía NAYA</span>
          <h2 className="text-3xl md:text-5xl font-serif text-naya-green">El arte del cuidado capilar consciente</h2>
          <p className="text-naya-green/70 font-sans">Diseñado minuciosamente para transformar tu rutina diaria en un ritual de lujo personal.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pilares.map((item, index) => (
            <div 
              key={index}
              className="bg-white/70 backdrop-blur-sm p-10 rounded-[2rem] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-start space-y-5 border border-naya-stone/30 group"
            >
              <div className="p-4 bg-naya-sand rounded-2xl group-hover:bg-naya-terracotta/10 transition-colors">
                {item.icon}
              </div>
              <h3 className="font-serif text-xl text-naya-green font-semibold">{item.title}</h3>
              <p className="text-sm text-naya-green/70 leading-relaxed font-sans">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`,

  'components/Catalog.tsx': `'use client';
import { useState } from 'react';
import { CartItem } from '@/utils/checkout';
import { ArrowRight } from 'lucide-react';

interface CatalogProps {
  onAddToCart: (product: CartItem) => void;
  searchTerm: string;
}

const productos = [
  { id: 1, name: 'Shampoo Reparador Botánico', price: 65000, category: 'Shampoos', badge: 'Más vendido', image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&q=80&w=700' },
  { id: 2, name: 'Acondicionador Nutritivo Ancestral', price: 60000, category: 'Acondicionadores', badge: 'Esencial', image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=700' },
  { id: 3, name: 'Aceite Capilar de Argán & Romero', price: 75000, category: 'Tratamientos', badge: 'Favorito', image: 'https://images.unsplash.com/photo-1608248597359-994b5aa6b6a2?auto=format&fit=crop&q=80&w=700' },
  { id: 4, name: 'Mascarilla Capilar Regeneradora', price: 85000, category: 'Tratamientos', badge: 'Nuevo', image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&q=80&w=700' },
  { id: 5, name: 'Shampoo Purificante Herbal', price: 62000, category: 'Shampoos', badge: '', image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80&w=700' },
  { id: 6, name: 'Tónico Crecimiento Intenso', price: 70000, category: 'Tratamientos', badge: 'Alta demanda', image: 'https://images.unsplash.com/photo-1608248597359-994b5aa6b6a2?auto=format&fit=crop&q=80&w=700' },
];

export default function Catalog({ onAddToCart, searchTerm }: CatalogProps) {
  const [categoria, setCategoria] = useState('Todos');
  const categorias = ['Todos', 'Shampoos', 'Acondicionadores', 'Tratamientos'];

  const filtrados = productos.filter(prod => {
    const matchCat = categoria === 'Todos' || prod.category === categoria;
    const matchSearch = prod.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <section id="catalogo" className="py-28 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
        <span className="text-xs uppercase tracking-[0.3em] text-naya-terracotta font-semibold">✦ Catálogo Exclusivo</span>
        <h2 className="text-4xl md:text-5xl font-serif text-naya-green">Fórmulas para tu ritual diario</h2>
        <p className="text-naya-green/70 font-sans">Selecciona los productos ideales para devolverle la vida a tu melena.</p>
        
        <div className="flex flex-wrap justify-center gap-2.5 pt-6">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoria(cat)}
              className={\`px-6 py-2.5 rounded-full text-xs uppercase tracking-wider font-medium transition-all duration-200 cursor-pointer \${categoria === cat ? 'bg-naya-green text-naya-sand shadow-sm' : 'bg-white/80 text-naya-green hover:bg-naya-stone/40'}\`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filtrados.length === 0 ? (
          <p className="col-span-full text-center text-naya-green/60 py-16 font-serif text-lg">No se encontraron productos con ese criterio.</p>
        ) : (
          filtrados.map((prod) => (
            <div 
              key={prod.id}
              className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between border border-naya-stone/30 group"
            >
              <div>
                <div className="h-80 overflow-hidden relative bg-naya-sand">
                  <img 
                    src={prod.image} 
                    alt={prod.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-[0.98]"
                  />
                  {prod.badge && (
                    <span className="absolute top-4 left-4 bg-naya-green text-naya-sand text-[10px] uppercase tracking-[0.2em] font-semibold px-3.5 py-1.5 rounded-full shadow-xs">
                      {prod.badge}
                    </span>
                  )}
                </div>
                <div className="p-8 space-y-3">
                  <span className="text-[11px] text-naya-terracotta font-semibold uppercase tracking-[0.2em]">{prod.category}</span>
                  <h3 className="text-2xl font-serif text-naya-green leading-snug">{prod.name}</h3>
                  <p className="text-xl font-bold text-naya-green font-sans pt-1">
                    $\${prod.price.toLocaleString('es-CO')} <span className="text-xs font-normal text-naya-green/60">COP</span>
                  </p>
                </div>
              </div>
              <div className="p-8 pt-0">
                <button
                  onClick={() => onAddToCart({ id: prod.id, name: prod.name, price: prod.price, quantity: 1 })}
                  className="w-full bg-naya-green text-naya-sand py-4 rounded-2xl font-medium text-xs tracking-wider uppercase hover:bg-naya-terracotta transition-all duration-200 shadow-xs flex items-center justify-center gap-2 cursor-pointer group/btn"
                >
                  <span>Agregar al Carrito</span>
                  <ArrowRight size={15} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}`,

  'components/Gallery.tsx': `export default function Gallery() {
  const imagenes = [
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=700",
    "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=700",
    "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&q=80&w=700",
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=700"
  ];

  return (
    <section id="galeria" className="py-28 bg-[#F4F3ED] px-6 md:px-12 border-y border-naya-stone/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <span className="text-xs uppercase tracking-[0.3em] text-naya-terracotta font-semibold">✦ Experiencia Visual</span>
          <h2 className="text-4xl md:text-5xl font-serif text-naya-green">El universo NAYA</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {imagenes.map((img, idx) => (
            <div key={idx} className="h-96 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 group">
              <img src={img} alt="Estética NAYA" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`,

  'components/Testimonials.tsx': `'use client';
import { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonios = [
  { name: 'Valentina Gómez', text: 'Mi cabello cambió por completo desde el primer uso del shampoo reparador. Tiene un brillo natural increíble.', role: 'Cliente frecuente' },
  { name: 'Camila Restrepo', text: 'Me encanta que sean productos libres de químicos. El aroma botánico es delicioso y la textura mejoró notablemente.', role: 'Cliente verificado' },
  { name: 'Lucía Fernández', text: 'El aceite capilar es una joya absoluta. Hidrata con profundidad sin dejar pesada la melena. 100% recomendado.', role: 'Cliente verificado' }
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent(curr => curr === 0 ? testimonios.length - 1 : curr - 1);
  const next = () => setCurrent(curr === testimonios.length - 1 ? 0 : curr + 1);

  return (
    <section className="py-28 bg-naya-sand px-6 md:px-12">
      <div className="max-w-4xl mx-auto text-center space-y-12">
        <div className="space-y-4">
          <span className="text-xs uppercase tracking-[0.3em] text-naya-terracotta font-semibold">✦ Testimonios</span>
          <h2 className="text-4xl font-serif text-naya-green">Lo que experimentan nuestras clientas</h2>
        </div>

        <div className="bg-white p-10 md:p-16 rounded-[2.5rem] shadow-sm relative border border-naya-stone/40">
          <Quote className="mx-auto text-naya-terracotta/30 w-12 h-12 mb-6" />
          
          <div className="flex justify-center gap-1.5 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={18} className="fill-amber-400 text-amber-400" />
            ))}
          </div>

          <p className="text-xl md:text-2xl text-naya-green/90 font-serif italic mb-8 leading-relaxed max-w-2xl mx-auto">
            "{testimonios[current].text}"
          </p>

          <div>
            <h4 className="font-semibold text-naya-green text-lg">{testimonios[current].name}</h4>
            <span className="text-xs text-naya-green/60 tracking-wider uppercase mt-1 block">{testimonios[current].role}</span>
          </div>

          <div className="absolute inset-y-0 left-6 flex items-center">
            <button onClick={prev} className="p-3 bg-naya-sand rounded-full text-naya-green hover:bg-naya-stone transition-all shadow-xs cursor-pointer flex items-center justify-center" aria-label="Anterior">
              <ChevronLeft size={20} />
            </button>
          </div>
          <div className="absolute inset-y-0 right-6 flex items-center">
            <button onClick={next} className="p-3 bg-naya-sand rounded-full text-naya-green hover:bg-naya-stone transition-all shadow-xs cursor-pointer flex items-center justify-center" aria-label="Siguiente">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}`,

  'components/Contact.tsx': `export default function Contact() {
  return (
    <section id="contacto" className="py-28 px-6 md:px-12 max-w-2xl mx-auto">
      <div className="bg-white p-10 md:p-14 rounded-[2.5rem] shadow-sm border border-naya-stone/40">
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs uppercase tracking-[0.3em] text-naya-terracotta font-semibold">✦ Soporte Botánico</span>
          <h2 className="text-3xl md:text-4xl font-serif text-naya-green">Contáctanos</h2>
          <p className="text-naya-green/70 text-sm font-sans">¿Tienes dudas sobre qué rutina elegir? Escríbenos directamente.</p>
        </div>

        <form className="space-y-6 flex flex-col" onSubmit={(e) => { e.preventDefault(); alert('¡Mensaje enviado con éxito!'); }}>
          <div>
            <label className="block text-naya-green text-xs uppercase tracking-wider font-semibold mb-2">Nombre completo</label>
            <input 
              type="text" 
              placeholder="Tu nombre"
              required
              className="w-full border-b border-naya-stone py-3 focus:outline-none focus:border-naya-terracotta bg-transparent text-naya-green text-sm transition-colors" 
            />
          </div>
          <div>
            <label className="block text-naya-green text-xs uppercase tracking-wider font-semibold mb-2">Correo electrónico</label>
            <input 
              type="email" 
              placeholder="tu@correo.com"
              required
              className="w-full border-b border-naya-stone py-3 focus:outline-none focus:border-naya-terracotta bg-transparent text-naya-green text-sm transition-colors" 
            />
          </div>
          <div>
            <label className="block text-naya-green text-xs uppercase tracking-wider font-semibold mb-2">Mensaje o consulta</label>
            <textarea 
              rows={4}
              placeholder="Cuéntanos sobre tu tipo de cabello..."
              required
              className="w-full border-b border-naya-stone py-3 focus:outline-none focus:border-naya-terracotta bg-transparent resize-none text-naya-green text-sm transition-colors" 
            />
          </div>
          <button type="submit" className="bg-naya-green text-naya-sand py-4 rounded-full hover:bg-naya-terracotta transition-all duration-200 w-full font-medium text-xs uppercase tracking-wider shadow-xs mt-4 cursor-pointer flex items-center justify-center">
            Enviar Mensaje
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-naya-stone/40 text-center space-y-3">
          <p className="text-xs text-naya-green/60 uppercase tracking-widest font-semibold">Canales Oficiales</p>
          <div className="flex justify-center gap-8 text-xs font-semibold uppercase tracking-wider text-naya-green">
            <a href="https://wa.me/573135731901" target="_blank" rel="noopener noreferrer" className="hover:text-naya-terracotta transition-colors">WhatsApp</a>
            <a href="#" className="hover:text-naya-terracotta transition-colors">Instagram</a>
            <a href="#" className="hover:text-naya-terracotta transition-colors">TikTok</a>
          </div>
        </div>
      </div>
    </section>
  );
}`,

  'components/CartDrawer.tsx': `'use client';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem, processWhatsAppCheckout } from '@/utils/checkout';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemoveItem: (id: number) => void;
}

export default function CartDrawer({ isOpen, onClose, cart, onUpdateQuantity, onRemoveItem }: CartDrawerProps) {
  if (!isOpen) return null;

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-naya-sand h-full shadow-2xl flex flex-col justify-between p-6 md:p-8 border-l border-naya-stone/40">
        <div>
          <div className="flex items-center justify-between pb-6 border-b border-naya-stone/40">
            <h2 className="text-xl font-serif text-naya-green flex items-center gap-2.5">
              <ShoppingBag size={20} className="text-naya-terracotta" /> Tu Carrito NAYA
            </h2>
            <button onClick={onClose} className="text-naya-green p-2 hover:bg-naya-stone/30 rounded-full transition-colors cursor-pointer" aria-label="Cerrar">
              <X size={22} />
            </button>
          </div>

          <div className="py-6 space-y-4 max-h-[52vh] overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-center text-naya-green/60 py-16 font-serif text-base">Tu carrito se encuentra vacío.</p>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex items-center justify-between bg-white/80 p-4 rounded-2xl border border-naya-stone/30 shadow-2xs">
                  <div className="space-y-1">
                    <h4 className="font-serif font-semibold text-naya-green text-sm">{item.name}</h4>
                    <p className="text-xs text-naya-green/70">$\${item.price.toLocaleString('es-CO')} c/u</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-naya-stone rounded-xl bg-naya-sand overflow-hidden shadow-2xs">
                      <button onClick={() => onUpdateQuantity(item.id, -1)} className="px-2.5 py-1 text-xs text-naya-green hover:bg-naya-stone/50 transition-colors cursor-pointer">-</button>
                      <span className="px-2 text-xs font-bold text-naya-green">{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.id, 1)} className="px-2.5 py-1 text-xs text-naya-green hover:bg-naya-stone/50 transition-colors cursor-pointer">+</button>
                    </div>
                    <button onClick={() => onRemoveItem(item.id)} className="text-naya-terracotta hover:opacity-80 transition-opacity p-1 cursor-pointer" aria-label="Eliminar">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-t border-naya-stone/40 pt-6 space-y-5">
          <div className="flex justify-between items-center text-lg font-serif text-naya-green font-bold">
            <span>Total estimado:</span>
            <span>$\${total.toLocaleString('es-CO')} <span className="text-xs font-sans font-normal text-naya-green/60">COP</span></span>
          </div>
          <button
            disabled={cart.length === 0}
            onClick={() => processWhatsAppCheckout(cart, total)}
            className="w-full bg-green-700 text-white py-4 rounded-2xl font-medium uppercase tracking-wider text-xs hover:bg-green-800 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Finalizar Compra por WhatsApp 📱</span>
            <ArrowRight size={15} />
          </button>
          <p className="text-[10px] text-center text-naya-green/60 tracking-wider">
            Serás redirigido a WhatsApp con el resumen completo de tu pedido listo para enviar.
          </p>
        </div>
      </div>
    </div>
  );
}`,

  'components/Footer.tsx': `export default function Footer() {
  return (
    <footer className="bg-naya-green text-naya-sand py-20 px-6 md:px-12 border-t border-naya-stone/20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left items-center">
        <div>
          <h3 className="text-3xl font-serif font-bold tracking-[0.2em] mb-2">NAYA</h3>
          <p className="text-xs text-naya-sand/70 italic font-serif">"Belleza que nace desde la raíz."</p>
        </div>
        <div className="flex justify-center gap-8 text-xs font-medium uppercase tracking-widest text-naya-sand/90">
          <a href="#inicio" className="hover:text-naya-terracotta transition-colors">Inicio</a>
          <a href="#nosotros" className="hover:text-naya-terracotta transition-colors">Nosotros</a>
          <a href="#catalogo" className="hover:text-naya-terracotta transition-colors">Colección</a>
          <a href="#contacto" className="hover:text-naya-terracotta transition-colors">Contacto</a>
        </div>
        <div className="text-center md:text-right text-[11px] text-naya-sand/50 tracking-wider font-sans">
          <p>&copy; 2026 NAYA. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}`,

  'components/WhatsAppFloat.tsx': `import { MessageCircle } from 'lucide-react';

export default function WhatsAppFloat() {
  return (
    <a 
      href="https://wa.me/573135731901?text=Hola%20👋%20Estoy%20interesado(a)%20en%20los%20productos%20capilares%20de%20NAYA." 
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 bg-green-600 text-white p-4 rounded-full shadow-2xl hover:bg-green-700 transition-all hover:scale-110 flex items-center justify-center border-2 border-white/40 cursor-pointer"
      aria-label="WhatsApp"
    >
      <MessageCircle size={28} />
    </a>
  );
}`,

  'app/page.tsx': `'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Benefits from '@/components/Benefits';
import Catalog from '@/components/Catalog';
import Gallery from '@/components/Gallery';
import Testimonials from '@/components/Testimonials';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import { CartItem } from '@/utils/checkout';
import { Toaster, toast } from 'react-hot-toast';

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddToCart = (product: CartItem) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, product];
    });
    
    toast.success(\`¡\${product.name} agregado al carrito!\`, {
      style: {
        background: '#1F3A34',
        color: '#E9E7D7',
        fontFamily: 'Manrope, sans-serif'
      }
    });
    
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const handleRemoveItem = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <main className="min-h-screen bg-naya-sand font-sans text-naya-green selection:bg-naya-terracotta selection:text-white">
      <Toaster position="top-center" />
      <Navbar 
        cartCount={totalCount} 
        onOpenCart={() => setIsCartOpen(true)} 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
      />
      <Hero />
      <About />
      <Benefits />
      <Catalog onAddToCart={handleAddToCart} searchTerm={searchTerm} />
      <Gallery />
      <Testimonials />
      <Contact />
      <Footer />
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />
      <WhatsAppFloat />
    </main>
  );
}`
};

for (const [rutaArchivo, contenido] of Object.entries(archivos)) {
  const rutaCompleta = path.join(__dirname, rutaArchivo);
  fs.writeFileSync(rutaCompleta, contenido.trim(), 'utf8');
  console.log(`✅ Archivo generado: ${rutaArchivo}`);
}

console.log('\n🎉 ¡Botones organizados y optimizados con éxito!');