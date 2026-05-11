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

  // CREATE - Crear nueva categoría
  crearCategoria(categoria: Omit<Categoria, 'id'>): void {
    this.cargando.set(true);
    this.http.post<Categoria>(this.apiUrl, categoria).subscribe({
      next: (nuevaCategoria) => {
        const categoriasActuales = this.categorias();
        this.categorias.set([...categoriasActuales, nuevaCategoria]);
        this.cargando.set(false);
        this.error.set(null);
      },
      error: () => {
        this.error.set('Error al crear categoría');
        this.cargando.set(false);
      },
    });
  }

  // READ - Obtener categoría específica
  getCategoriaById(id: string): Categoria | undefined {
    return this.categorias().find(c => c.id === id);
  }

  // UPDATE - Actualizar categoría completa
  actualizarCategoria(id: string, categoria: Categoria): void {
    this.cargando.set(true);
    this.http.put<Categoria>(`${this.apiUrl}/${id}`, categoria).subscribe({
      next: (categoriaActualizada) => {
        const categoriasActuales = this.categorias();
        const indice = categoriasActuales.findIndex(c => c.id === id);
        if (indice !== -1) {
          const nuevasCategorias = [...categoriasActuales];
          nuevasCategorias[indice] = categoriaActualizada;
          this.categorias.set(nuevasCategorias);
        }
        this.cargando.set(false);
        this.error.set(null);
      },
      error: () => {
        this.error.set('Error al actualizar categoría');
        this.cargando.set(false);
      },
    });
  }

  // PATCH - Editar solo algunos campos
  editarCategoria(id: string, cambios: Partial<Categoria>): void {
    this.cargando.set(true);
    this.http.patch<Categoria>(`${this.apiUrl}/${id}`, cambios).subscribe({
      next: (categoriaActualizada) => {
        const categoriasActuales = this.categorias();
        const indice = categoriasActuales.findIndex(c => c.id === id);
        if (indice !== -1) {
          const nuevasCategorias = [...categoriasActuales];
          nuevasCategorias[indice] = categoriaActualizada;
          this.categorias.set(nuevasCategorias);
        }
        this.cargando.set(false);
        this.error.set(null);
      },
      error: () => {
        this.error.set('Error al editar categoría');
        this.cargando.set(false);
      },
    });
  }

  // DELETE - Eliminar categoría
  eliminarCategoria(id: string): void {
    this.cargando.set(true);
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        const categoriasActuales = this.categorias();
        this.categorias.set(categoriasActuales.filter(c => c.id !== id));
        this.cargando.set(false);
        this.error.set(null);
      },
      error: () => {
        this.error.set('Error al eliminar categoría');
        this.cargando.set(false);
      },
    });
  }
}
