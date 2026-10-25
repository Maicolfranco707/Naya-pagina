import { Plus, Star } from "lucide-react";

// TODO: Replace sample reviews with real, approved customer testimonials before launch.
const resenasEjemplo = [
  {
    comentario: "Mi cabello se siente más suave desde que sumé el romero a mi rutina.",
    nombre: "Cliente de ejemplo 1",
    ciudad: "Medellín · ejemplo",
  },
  {
    comentario: "La mantequilla deja mi piel hidratada y con un aroma delicioso.",
    nombre: "Cliente de ejemplo 2",
    ciudad: "Bogotá · ejemplo",
  },
  {
    comentario: "Me encantó convertir el cuidado de mi cabello en un ritual.",
    nombre: "Cliente de ejemplo 3",
    ciudad: "Cali · ejemplo",
  },
];

const espaciosComunidad = [
  "Foto de comunidad 1",
  "Foto de comunidad 2",
  "Foto de comunidad 3",
  "Foto de comunidad 4",
  "Foto de comunidad 5",
  "Foto de comunidad 6",
];

export function CustomerReviews() {
  return (
    <section id="resenas" className="naya-reviews">
      <div className="naya-section-heading">
        <span className="naya-section-heading__eyebrow">Voces de la comunidad</span>
        <h2>Rituales que inspiran</h2>
        <p>Historias de cuidado que pronto compartiremos contigo.</p>
      </div>
      <div className="naya-reviews__grid">
        {resenasEjemplo.map((resena) => (
          <article className="naya-review-card" key={resena.nombre}>
            <span className="naya-review-card__sample">Reseña de ejemplo</span>
            <div className="naya-review-card__stars" aria-label="5 de 5 estrellas · ejemplo">
              {Array.from({ length: 5 }, (_, index) => (
                <Star key={index} size={15} fill="currentColor" aria-hidden="true" />
              ))}
            </div>
            <blockquote>“{resena.comentario}”</blockquote>
            <p className="naya-review-card__author">{resena.nombre}</p>
            <p className="naya-review-card__city">{resena.ciudad}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function CommunityGallery() {
  return (
    <section id="naya-usada-por" className="naya-community">
      <div className="naya-section-heading">
        <span className="naya-section-heading__eyebrow">Nuestra comunidad</span>
        <h2>NAYA usada por</h2>
        <p>Este espacio pronto estará lleno de sus rituales y momentos NAYA.</p>
      </div>
      <div className="naya-community__grid">
        {espaciosComunidad.map((espacio, index) => (
          <figure className={`naya-community__tile naya-community__tile--${index + 1}`} key={espacio}>
            <div className="naya-community__placeholder" aria-hidden="true">
              <Plus size={28} strokeWidth={1.4} />
              <span>Foto próximamente</span>
            </div>
            <figcaption>{espacio}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
