import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Categoria } from '../models/model_categorias';


@Injectable({
  providedIn: 'root',
})
export class CategoryService {

  private apiUrl = 'http://localhost:3000/categorias';

  // SIGNALS
  cargando = signal(false);
  error = signal<string | null>(null);
  categorias = signal<Categoria[]>([]);

  constructor(private http: HttpClient) {}

  /**
   * Obtener categorías
   *
   * limit -> cantidad de resultados
   * slug -> filtrar por slug
   * search -> búsqueda general
   * sort -> campo para ordenar
   * order -> asc | desc
   */

  getCategorias(options?: {
    limit?: number;
    slug?: string;
    search?: string;
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

    // FILTRAR POR SLUG
    if (options?.slug) {
      params = params.set('slug', options.slug);
    }

    // BUSCADOR GENERAL
    if (options?.search) {
      params = params.set('q', options.search);
    }

    // ORDENAR
    if (options?.sort) {
      params = params.set('_sort', options.sort);
    }

    // ASC O DESC
    if (options?.order) {
      params = params.set('_order', options.order);
    }

    this.http.get<Categoria[]>(this.apiUrl, { params }).subscribe({
      next: (resp) => {
        this.categorias.set(resp);
        this.cargando.set(false);
      },

      error: () => {
        this.error.set('Error al cargar categorías');
        this.cargando.set(false);
      },
    });
  }
}
