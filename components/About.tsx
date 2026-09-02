export default function About() {
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
}