'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { CartItem } from '@/utils/checkout';
import { ArrowRight } from 'lucide-react';

interface CatalogProps {
  onAddToCart: (product: CartItem) => void;
  searchTerm: string;
}

interface ProductoCatalogo {
  id: number;
  categoria: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
}

export default function Catalog({ onAddToCart, searchTerm }: CatalogProps) {
  const [categoria, setCategoria] = useState('Todos');
  const [productos, setProductos] = useState<ProductoCatalogo[]>([]);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    fetch('/api/productos')
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'No se pudo cargar el catálogo.');
        if (activo) setProductos(data as ProductoCatalogo[]);
      })
      .catch((reason: unknown) => {
        if (activo) setError(reason instanceof Error ? reason.message : 'No se pudo cargar el catálogo.');
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const categorias = ['Todos', ...new Set(productos.map((producto) => producto.categoria))];

  const filtrados = productos.filter(prod => {
    const matchCat = categoria === 'Todos' || prod.categoria === categoria;
    const matchSearch = prod.nombre.toLowerCase().includes(searchTerm.toLowerCase());
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
        {error ? (
          <p className="col-span-full text-center text-red-700 py-16" role="alert">{error}</p>
        ) : cargando ? (
          <p className="col-span-full text-center text-naya-green/60 py-16">Cargando productos...</p>
        ) : filtrados.length === 0 ? (
          <p className="col-span-full text-center text-naya-green/60 py-16 font-serif text-lg">No se encontraron productos con ese criterio.</p>
        ) : (
          filtrados.map((prod) => (
            <div 
              key={prod.id}
              className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between border border-naya-stone/30 group"
            >
              <div>
                <div className="h-80 overflow-hidden relative bg-naya-sand">
                  <Image
                    src={prod.imagen}
                    alt={prod.nombre}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.98]"
                  />
                </div>
                <div className="p-8 space-y-3">
                  <span className="text-[11px] text-naya-terracotta font-semibold uppercase tracking-[0.2em]">{prod.categoria}</span>
                  <h3 className="text-2xl font-serif text-naya-green leading-snug">{prod.nombre}</h3>
                  <p className="text-xl font-bold text-naya-green font-sans pt-1">
                    ${prod.precio.toLocaleString('es-CO')} <span className="text-xs font-normal text-naya-green/60">COP</span>
                  </p>
                </div>
              </div>
              <div className="p-8 pt-0">
                <button
                  onClick={() => onAddToCart({ id: prod.id, name: prod.nombre, price: prod.precio, quantity: 1 })}
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