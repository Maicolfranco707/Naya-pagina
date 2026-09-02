'use client';
import { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonios = [
  { name: 'Valentina Gómez', text: 'Mi cabello cambió por completo desde el primer uso del shampoo reparador. Tiene un brillo natural increíble.', role: 'Cliente frecuente' },
  { name: 'Camila Restrepo', text: 'Me encanta que sean productos libres de químicos. El aroma botánico es delicioso y la textura mejoró notablemente.', role: 'Cliente verificado' },
  { name: 'Lucía Fernández', text: 'El aceite capilar es una joya absoluta. Hidrata con profundidad sin dejar pesada la melena. 100% recomendado.', role: 'Cliente verificado' }
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((curr) => (curr === 0 ? testimonios.length - 1 : curr - 1));
  const next = () => setCurrent((curr) => (curr === testimonios.length - 1 ? 0 : curr + 1));

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
}