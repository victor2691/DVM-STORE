import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Producto } from '../models/mode_productos';

@Injectable({
  providedIn: 'root',
})
export class ProductosService {

  private apiUrl = 'http://localhost:3000/productos';

  // SIGNALS
  cargando = signal(false);
  error = signal<string | null>(null);
  productos = signal<Producto[]>([]);

  constructor(private http: HttpClient) {}

  /**
   * Obtener productos
   *
   * limit       -> cantidad de resultados
   * categoriaId -> filtrar por categoría
   * destacado   -> productos destacados
   * oferta      -> productos en oferta
   * sort        -> campo para ordenar
   * order       -> asc | desc
   */
  getProductos(options?: {
    limit?: number;
    categoriaId?: string;
    destacado?: boolean;
    oferta?: boolean;
    sort?: string;
    order?: 'asc' | 'desc';
  }): void {

    this.cargando.set(true);
    this.error.set(null);

    let params = new HttpParams();

    // LIMITAR RESULTADOS
    if (options?.limit) {
      params = params.set('_limit', options.limit);
    }

    // FILTRAR POR CATEGORÍA
    if (options?.categoriaId) {
      params = params.set('categoriaId', options.categoriaId);
    }

    // DESTACADOS
    if (options?.destacado !== undefined) {
      params = params.set('destacado', options.destacado);
    }

    // OFERTA
    if (options?.oferta !== undefined) {
      params = params.set('oferta', options.oferta);
    }

    // ORDENAR
    if (options?.sort) {
      params = params.set('_sort', options.sort);
    }

    // ASC / DESC
    if (options?.order) {
      params = params.set('_order', options.order);
    }

    this.http.get<Producto[]>(this.apiUrl, { params }).subscribe({
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