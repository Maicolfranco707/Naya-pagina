'use client';
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
              className={`px-6 py-2.5 rounded-full text-xs uppercase tracking-wider font-medium transition-all duration-200 cursor-pointer ${categoria === cat ? 'bg-naya-green text-naya-sand shadow-sm' : 'bg-white/80 text-naya-green hover:bg-naya-stone/40'}`}
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
                    $${prod.price.toLocaleString('es-CO')} <span className="text-xs font-normal text-naya-green/60">COP</span>
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
}