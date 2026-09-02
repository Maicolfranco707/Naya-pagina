export default function Contact() {
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
}