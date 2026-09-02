export default function Gallery() {
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
}