export default function NayaFooter() {
  return (
    <footer id="contacto" className="naya-footer">
      <div className="naya-footer__main">
        <div className="naya-footer__brand">
          <a href="#inicio" className="naya-footer__logo">NAYA</a>
          <p>Renovación profunda en tu piel.</p>
          <span>Hecha con cuidado en Medellín, Colombia.</span>
        </div>

        <div className="naya-footer__links">
          <div>
            <h2>Explora</h2>
            <a href="#mas-vendidos">Más vendidos</a>
            <a href="#catalogo">Todos los productos</a>
            <a href="#kits-rituales">Kits</a>
          </div>
          <div>
            <h2>Conoce NAYA</h2>
            <a href="#naya-marca">Nuestra marca</a>
            <a href="#resenas">Reseñas</a>
            <a href="#naya-usada-por">Comunidad</a>
          </div>
          <div className="naya-footer__social">
            <h2>Síguenos</h2>
            <a href="https://www.instagram.com/naya_renovacion/" target="_blank" rel="noreferrer">
              Instagram @naya_renovacion
            </a>
            <a href="https://www.tiktok.com/@nayarenovacion" target="_blank" rel="noreferrer">
              TikTok @nayarenovacion
            </a>
            <a
              className="naya-footer__contact"
              href="https://wa.me/573042051221?text=Hola%20NAYA%2C%20quiero%20hacer%20una%20consulta."
              target="_blank"
              rel="noreferrer"
            >
              Contactar por WhatsApp
            </a>
          </div>
        </div>
      </div>
      <div className="naya-footer__bottom">
        <span>© {new Date().getFullYear()} NAYA. Todos los derechos reservados.</span>
        <span>Cosmética botánica · Medellín, Colombia</span>
      </div>
    </footer>
  );
}
