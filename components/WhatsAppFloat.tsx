import { MessageCircle } from 'lucide-react';

export default function WhatsAppFloat() {
  return (
    <a 
      href="https://wa.me/573135731901?text=Hola%20👋%20Estoy%20interesado(a)%20en%20los%20productos%20capilares%20de%20NAYA." 
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 bg-green-600 text-white p-4 rounded-full shadow-2xl hover:bg-green-700 transition-all hover:scale-110 flex items-center justify-center border-2 border-white/40 cursor-pointer"
      aria-label="WhatsApp"
    >
      <MessageCircle size={28} />
    </a>
  );
}