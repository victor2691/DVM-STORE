import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { UsuarioRecord } from '../models/model_usuario';

export type UsuarioPayload = Omit<UsuarioRecord, 'id'>;

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/usuarios';

  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly usuarios = signal<UsuarioRecord[]>([]);

  getUsuarios(options?: {
    role?: UsuarioRecord['rol'];
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }): void {
    this.cargando.set(true);
    this.error.set(null);

    let params = new HttpParams();

    if (options?.role) {
      params = params.set('rol', options.role);
    }

    if (options?.search) {
      params = params.set('q', options.search);
    }

    if (options?.sort) {
      params = params.set('_sort', options.sort);
    }

    if (options?.order) {
      params = params.set('_order', options.order);
    }

    this.http.get<UsuarioRecord[]>(this.apiUrl, { params }).subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('Error al cargar clientes');
        this.cargando.set(false);
      },
    });
  }

  async crearUsuario(usuario: UsuarioPayload): Promise<UsuarioRecord> {
    this.cargando.set(true);
    this.error.set(null);

    try {
      const nuevoUsuario = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario),
      }).then((response) => response.json() as Promise<UsuarioRecord>);

      this.usuarios.update((usuarios) => [...usuarios, nuevoUsuario]);
      return nuevoUsuario;
    } catch {
      this.error.set('Error al crear cliente');
      throw new Error('Error al crear cliente');
    } finally {
      this.cargando.set(false);
    }
  }

  async actualizarUsuario(id: string, cambios: Partial<UsuarioPayload>): Promise<UsuarioRecord> {
    this.cargando.set(true);
    this.error.set(null);

    try {
      const usuarioActualizado = await fetch(`${this.apiUrl}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cambios),
      }).then((response) => response.json() as Promise<UsuarioRecord>);

      this.usuarios.update((usuarios) =>
        usuarios.map((usuario) => (usuario.id === id ? usuarioActualizado : usuario))
      );
      return usuarioActualizado;
    } catch {
      this.error.set('Error al actualizar cliente');
      throw new Error('Error al actualizar cliente');
    } finally {
      this.cargando.set(false);
    }
  }

  async eliminarUsuario(id: string): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);

    try {
      await fetch(`${this.apiUrl}/${id}`, { method: 'DELETE' });
      this.usuarios.update((usuarios) => usuarios.filter((usuario) => usuario.id !== id));
    } catch {
      this.error.set('Error al eliminar cliente');
      throw new Error('Error al eliminar cliente');
    } finally {
      this.cargando.set(false);
    }
  }
}