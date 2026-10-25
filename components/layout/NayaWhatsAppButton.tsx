import { MessageCircle } from "lucide-react";

export default function NayaWhatsAppButton() {
  return (
    <a
      href="https://wa.me/573042051221?text=Hola%20NAYA%2C%20quiero%20recibir%20asesor%C3%ADa."
      target="_blank"
      rel="noreferrer"
      className="naya-whatsapp"
      aria-label="Contactar a NAYA por WhatsApp"
    >
      <MessageCircle size={22} aria-hidden="true" />
      <span>¿Te ayudamos?</span>
    </a>
  );
}
