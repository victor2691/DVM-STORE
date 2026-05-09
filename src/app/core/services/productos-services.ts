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
}
