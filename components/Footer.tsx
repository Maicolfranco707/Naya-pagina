export default function Footer() {
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
}