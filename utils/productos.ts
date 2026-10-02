export interface Producto {
  id: number;
  categoria: string;
  nombre: string;
  descripcion: string;
  detalles?: string;
  precio: number;
  imagen: string;
}

export const productos: Producto[] = [
  { id: 1, categoria: "Línea Capilar", nombre: "Shampoo de Cayena", descripcion: "Limpieza profunda y cuidado natural para el cuero cabelludo.", detalles: "Formulado con extractos herbales para limpiar sin resecar. Estimula la circulación del cuero cabelludo y promueve el brillo natural.", precio: 34000, imagen: "/naya_foto/shampoo1.png" },
  { id: 2, categoria: "Línea Capilar", nombre: "Acondicionador de  Cayena", descripcion: "Desenredo inmediato, suavidad y brillo natural.", detalles: "Sella la cutícula capilar dejando el cabello suave, manejable y libre de frizz. Ideal para uso diario.", precio: 34000, imagen: "/naya_foto/acondi1.png" },
  { id: 3, categoria: "Línea Capilar", nombre: "Shampoo de Romero", descripcion: "Fortalece la hebra capilar y estimula el crecimiento saludable.", detalles: "Enriquecido con extracto puro de romero para limpiar profundamente, controlar el exceso de grasa y prevenir la caída del cabello.", precio: 34000, imagen: "/naya_foto/shampoo2.png" },
  { id: 4, categoria: "Línea Capilar", nombre: "Acondicionador de Romero", descripcion: "Hidratación y fuerza para cabellos débiles o con tendencia a la caída.", detalles: "Aporta suavidad extrema y desenredo mientras aprovecha los beneficios antioxidantes y fortalecedores del romero.", precio: 34000, imagen: "/naya_foto/acondi2.png" },
  { id: 5, categoria: "Línea Corporal", nombre: "Mantequilla Corporal Coco Festival", descripcion: "Ultra hidratación y nutrición intensiva para la piel.", detalles: "Enriquecida con mantecas naturales y aroma a coco. Restaura la barrera de hidratación cutánea en zonas muy secas.", precio: 28500, imagen: "/naya_foto/coco_festival.png" },
  { id: 6, categoria: "Tratamiento Capilar", nombre: "Tónico Crecimiento Intensivo", descripcion: "Estimula la hebra capilar y fortalece desde la raíz.", detalles: "Aplica directamente en la raíz para acelerar el crecimiento y frenar la caída excesiva.", precio: 18000, imagen: "/naya_foto/crecimiento.png" },
  { id: 7, categoria: "Línea Frutal", nombre: " Mantequilla Corporal Kiwi", descripcion: "Revitalización e hidratación profunda con antioxidantes.", detalles: "Aporta vitaminas y nutrientes esenciales para devolverle la vitalidad al cabello o piel deshidratada.", precio: 28500, imagen: "/naya_foto/kiwi.png" },
  { id: 8, categoria: "Línea Frutal", nombre: "Mantequilla Corporal Uva", descripcion: "Reparación intensiva para cabellos maltratados.", detalles: "Propiedades antioxidantes de la uva que reparan los daños causados por el calor y procesamientos químicos.", precio: 28500, imagen: "/naya_foto/uva.png" },
  { id: 9, categoria: "Línea Frutal", nombre: "Mantequilla Corporal  Cherry", descripcion: "Renovación celular y aroma delicioso para tu piel.", detalles: "Remueve suavemente las células muertas dejando la piel sedosa, renovada y con un delicioso perfume a cereza.", precio: 28500, imagen: "/naya_foto/cherry.png" },
  { id: 10, categoria: "Tratamiento Corporal", nombre: "Crema Nutrición Profunda", descripcion: "Restaura la elasticidad y suavidad de tu piel.", detalles: "Fórmula de rápida absorción que nutre profundamente sin dejar sensación grasosa.", precio: 18000, imagen: "/naya_foto/nutricion.png" },
];