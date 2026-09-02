'use client';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem, processWhatsAppCheckout } from '@/utils/checkout';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemoveItem: (id: number) => void;
}

export default function CartDrawer({ isOpen, onClose, cart, onUpdateQuantity, onRemoveItem }: CartDrawerProps) {
  if (!isOpen) return null;

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-naya-sand h-full shadow-2xl flex flex-col justify-between p-6 md:p-8 border-l border-naya-stone/40">
        <div>
          <div className="flex items-center justify-between pb-6 border-b border-naya-stone/40">
            <h2 className="text-xl font-serif text-naya-green flex items-center gap-2.5">
              <ShoppingBag size={20} className="text-naya-terracotta" /> Tu Carrito NAYA
            </h2>
            <button onClick={onClose} className="text-naya-green p-2 hover:bg-naya-stone/30 rounded-full transition-colors cursor-pointer" aria-label="Cerrar">
              <X size={22} />
            </button>
          </div>

          <div className="py-6 space-y-4 max-h-[52vh] overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-center text-naya-green/60 py-16 font-serif text-base">Tu carrito se encuentra vacío.</p>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex items-center justify-between bg-white/80 p-4 rounded-2xl border border-naya-stone/30 shadow-2xs">
                  <div className="space-y-1">
                    <h4 className="font-serif font-semibold text-naya-green text-sm">{item.name}</h4>
                    <p className="text-xs text-naya-green/70">$${item.price.toLocaleString('es-CO')} c/u</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-naya-stone rounded-xl bg-naya-sand overflow-hidden shadow-2xs">
                      <button onClick={() => onUpdateQuantity(item.id, -1)} className="px-2.5 py-1 text-xs text-naya-green hover:bg-naya-stone/50 transition-colors cursor-pointer">-</button>
                      <span className="px-2 text-xs font-bold text-naya-green">{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.id, 1)} className="px-2.5 py-1 text-xs text-naya-green hover:bg-naya-stone/50 transition-colors cursor-pointer">+</button>
                    </div>
                    <button onClick={() => onRemoveItem(item.id)} className="text-naya-terracotta hover:opacity-80 transition-opacity p-1 cursor-pointer" aria-label="Eliminar">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-t border-naya-stone/40 pt-6 space-y-5">
          <div className="flex justify-between items-center text-lg font-serif text-naya-green font-bold">
            <span>Total estimado:</span>
            <span>$${total.toLocaleString('es-CO')} <span className="text-xs font-sans font-normal text-naya-green/60">COP</span></span>
          </div>
          <button
            disabled={cart.length === 0}
            onClick={() => processWhatsAppCheckout(cart, total)}
            className="w-full bg-green-700 text-white py-4 rounded-2xl font-medium uppercase tracking-wider text-xs hover:bg-green-800 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Finalizar Compra por WhatsApp 📱</span>
            <ArrowRight size={15} />
          </button>
          <p className="text-[10px] text-center text-naya-green/60 tracking-wider">
            Serás redirigido a WhatsApp con el resumen completo de tu pedido listo para enviar.
          </p>
        </div>
      </div>
    </div>
  );
}