import { Leaf, Droplet, Sparkles, Flower2 } from 'lucide-react';

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
}