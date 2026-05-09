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
      },
      error: () => {
        this.error.set('Error al cargar productos');
        this.cargando.set(false);
      },
    });
  }

  async crearProducto(producto: Omit<Producto, 'id'>): Promise<Producto> {
    this.cargando.set(true);
    this.error.set(null);

    try {
      const nuevoProducto = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(producto),
      }).then((res) => res.json());

      this.productos.update((ps) => [...ps, nuevoProducto]);
      return nuevoProducto;
    } catch {
      this.error.set('Error al crear producto');
      throw new Error('Error al crear producto');
    } finally {
      this.cargando.set(false);
    }
  }

  async actualizarProducto(id: string, cambios: Partial<Producto>): Promise<Producto> {
    this.cargando.set(true);
    this.error.set(null);

    try {
      const actualizado = await fetch(`${this.apiUrl}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cambios),
      }).then((res) => res.json());

      this.productos.update((ps) =>
        ps.map((p) => (p.id === id ? actualizado : p))
      );
      return actualizado;
    } catch {
      this.error.set('Error al actualizar producto');
      throw new Error('Error al actualizar producto');
    } finally {
      this.cargando.set(false);
    }
  }

  async eliminarProducto(id: string): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);

    try {
      await fetch(`${this.apiUrl}/${id}`, { method: 'DELETE' });
      this.productos.update((ps) => ps.filter((p) => p.id !== id));
    } catch {
      this.error.set('Error al eliminar producto');
      throw new Error('Error al eliminar producto');
    } finally {
      this.cargando.set(false);
    }
  }
}
