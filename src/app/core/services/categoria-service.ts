import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Categoria } from '../models/model_categorias';

type CategoriaPayload = Omit<Categoria, 'id'>;

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/categorias';

  // SIGNALS
  cargando = signal(false);
  error = signal<string | null>(null);
  categorias = signal<Categoria[]>([]);

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

  async crearCategoria(categoria: CategoriaPayload): Promise<Categoria> {
    this.cargando.set(true);
    this.error.set(null);

    try {
      const nuevaCategoria = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoria),
      }).then((response) => response.json() as Promise<Categoria>);

      this.categorias.update((categorias) => [...categorias, nuevaCategoria]);
      return nuevaCategoria;
    } catch {
      this.error.set('Error al crear categoría');
      throw new Error('Error al crear categoría');
    } finally {
      this.cargando.set(false);
    }
  }

  async actualizarCategoria(id: string, cambios: Partial<CategoriaPayload>): Promise<Categoria> {
    this.cargando.set(true);
    this.error.set(null);

    try {
      const categoriaActualizada = await fetch(`${this.apiUrl}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cambios),
      }).then((response) => response.json() as Promise<Categoria>);

      this.categorias.update((categorias) =>
        categorias.map((categoria) => (categoria.id === id ? categoriaActualizada : categoria))
      );
      return categoriaActualizada;
    } catch {
      this.error.set('Error al actualizar categoría');
      throw new Error('Error al actualizar categoría');
    } finally {
      this.cargando.set(false);
    }
  }

  async eliminarCategoria(id: string): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);

    try {
      await fetch(`${this.apiUrl}/${id}`, { method: 'DELETE' });
      this.categorias.update((categorias) => categorias.filter((categoria) => categoria.id !== id));
    } catch {
      this.error.set('Error al eliminar categoría');
      throw new Error('Error al eliminar categoría');
    } finally {
      this.cargando.set(false);
    }
  }
}
