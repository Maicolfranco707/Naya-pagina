export interface Producto {
  id: number;
  categoria: string;
  nombre: string;
  descripcion: string;
  detalles?: string;
  precio: number;
  imagen: string;
}
