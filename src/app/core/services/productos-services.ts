import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, computed } from '@angular/core';
import { Producto } from '../models/mode_productos';
import { CategoryService } from './categoria-service';

export interface ProductoVisual extends Producto {
  nombreCategoria: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProductosService {
  private http = inject(HttpClient);
  private categoryService = inject(CategoryService);
  private apiUrl = 'http://localhost:3000/productos';

  cargando = signal(false);
  error = signal<string | null>(null);
  productos = signal<Producto[]>([]);

  // ESTA ES LA PIEZA QUE FALTABA: El Join
  public productosCompletos = computed<ProductoVisual[]>(() => {
    const categorias = this.categoryService.categorias();
    return this.productos().map((prod) => ({
      ...prod,
      nombreCategoria: categorias.find((c) => c.id === prod.categoriaId)?.nombre || 'General'
    }));
  });

  getAllProductos(): void {
    this.cargando.set(true);
    this.http.get<Producto[]>(this.apiUrl).subscribe({
      next: (resp) => {
        this.productos.set(resp);
        this.cargando.set(false);
        this.error.set(null);
      },
      error: () => {
        this.error.set('Error al cargar productos');
        this.cargando.set(false);
      },
    });
  }

  // CREATE - Crear nuevo producto
  crearProducto(producto: Omit<Producto, 'id'>): void {
    this.cargando.set(true);
    this.http.post<Producto>(this.apiUrl, producto).subscribe({
      next: (nuevoProducto) => {
        // Agregar a la lista sin recargar todo
        const productosActuales = this.productos();
        this.productos.set([...productosActuales, nuevoProducto]);
        this.cargando.set(false);
        this.error.set(null);
      },
      error: () => {
        this.error.set('Error al crear producto');
        this.cargando.set(false);
      },
    });
  }

  // READ - Obtener un producto específico
  getProductoById(id: string): Producto | undefined {
    return this.productos().find(p => p.id === id);
  }

  // UPDATE - Actualizar producto completo
  actualizarProducto(id: string, producto: Producto): void {
    this.cargando.set(true);
    this.http.put<Producto>(`${this.apiUrl}/${id}`, producto).subscribe({
      next: (productoActualizado) => {
        // Actualizar en la lista
        const productosActuales = this.productos();
        const indice = productosActuales.findIndex(p => p.id === id);
        if (indice !== -1) {
          const nuevosProductos = [...productosActuales];
          nuevosProductos[indice] = productoActualizado;
          this.productos.set(nuevosProductos);
        }
        this.cargando.set(false);
        this.error.set(null);
      },
      error: () => {
        this.error.set('Error al actualizar producto');
        this.cargando.set(false);
      },
    });
  }

  // PATCH - Actualizar solo algunos campos
  editarProducto(id: string, cambios: Partial<Producto>): void {
    this.cargando.set(true);
    this.http.patch<Producto>(`${this.apiUrl}/${id}`, cambios).subscribe({
      next: (productoActualizado) => {
        // Actualizar en la lista
        const productosActuales = this.productos();
        const indice = productosActuales.findIndex(p => p.id === id);
        if (indice !== -1) {
          const nuevosProductos = [...productosActuales];
          nuevosProductos[indice] = productoActualizado;
          this.productos.set(nuevosProductos);
        }
        this.cargando.set(false);
        this.error.set(null);
      },
      error: () => {
        this.error.set('Error al editar producto');
        this.cargando.set(false);
      },
    });
  }

  // DELETE - Eliminar producto
  eliminarProducto(id: string): void {
    this.cargando.set(true);
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        // Eliminar de la lista
        const productosActuales = this.productos();
        this.productos.set(productosActuales.filter(p => p.id !== id));
        this.cargando.set(false);
        this.error.set(null);
      },
      error: () => {
        this.error.set('Error al eliminar producto');
        this.cargando.set(false);
      },
    });
  }
}
