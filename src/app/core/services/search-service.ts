import { Injectable, inject, signal, computed } from '@angular/core';
import { ProductosService } from './productos-services';
import { ProductoVisual } from '../models/mode_productos';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private productosService = inject(ProductosService);

  // Signal para almacenar el término de búsqueda
  readonly searchQuery = signal<string>('');

  // Computed que filtra los productos en tiempo real
  readonly resultados = computed<ProductoVisual[]>(() => {
    const query = this.searchQuery().toLowerCase().trim();

    if (!query) {
      return [];
    }

    return this.productosService.productosCompletos().filter(producto =>
      producto.nombre.toLowerCase().includes(query) ||
      producto.nombreCategoria.toLowerCase().includes(query) ||
      producto.descripcion.toLowerCase().includes(query)
    );
  });

  // Signal para el modal
  readonly modalAbierto = signal<boolean>(false);

  constructor() {}

  buscar(query: string): void {
    this.searchQuery.set(query);
  }

  limpiar(): void {
    this.searchQuery.set('');
  }

  abrirModal(): void {
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
    this.limpiar();
  }
}
