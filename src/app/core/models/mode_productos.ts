export interface Producto {
  id: string;
  nombre: string;
  categoriaId: string;
  precio: number;
  stock: number;
  imagenUrl: string;
  destacado: boolean;
  oferta: boolean;
  descripcion: string;
  activo: boolean;
}
// Esta es la que usarás en las Cards
export interface ProductoVisual extends Producto {
  nombreCategoria: string;
}
