export interface Producto {
  id: string;
  nombre: string;
  categoriaId: string;
  precio: number;
  stock: number;
  imagenUrl: string;
  destacado: boolean;
  oferta: boolean;
}
