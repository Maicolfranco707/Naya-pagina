import { Star } from "lucide-react";

export default function Estrellas({ valor, tamano = 16 }: { valor: number; tamano?: number }) {
  return (
    <span className="rv-stars" aria-label={`${valor.toFixed(1)} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={tamano} aria-hidden="true" className={n <= Math.round(valor) ? "rv-stars__on" : "rv-stars__off"} />
      ))}
    </span>
  );
}
