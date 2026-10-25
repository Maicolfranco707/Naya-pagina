export default function Hero() {
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
}