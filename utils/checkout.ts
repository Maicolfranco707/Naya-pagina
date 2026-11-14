import { WHATSAPP_NUMBER } from "@/utils/contacto";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export const processWhatsAppCheckout = (cartItems: CartItem[], total: number) => {
  let message = "🌿 *Nuevo Pedido - NAYA* 🌿\n\nHola, me gustaría adquirir los siguientes productos:\n";
  
  cartItems.forEach(item => {
    message += `• ${item.name} (x${item.quantity})\n`;
  });
  
  const formattedTotal = new Intl.NumberFormat('es-CO', { 
    style: 'currency', currency: 'COP', minimumFractionDigits: 0 
  }).format(total);

  message += `\n*Total a pagar:* ${formattedTotal}\n\nQuedo atento(a) para coordinar el pago y envío. ¡Muchas gracias!`;
  
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
};