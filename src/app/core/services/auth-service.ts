import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  LoginCredentials,
  UsuarioAutenticado,
  UsuarioRecord,
} from '../models/model_usuario';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = 'http://localhost:3000/usuarios';
  private readonly storageKey = 'dvm-store-session';

  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly usuario = signal<UsuarioAutenticado | null>(this.restoreSession());
  readonly isAuthenticated = computed(() => this.usuario() !== null);

  async login(credentials: LoginCredentials): Promise<UsuarioAutenticado> {
    this.cargando.set(true);
    this.error.set(null);

    try {
      let params = new HttpParams();
      params = params.set('email', credentials.email.trim().toLowerCase());
      params = params.set('password', credentials.password);
      params = params.set('activo', String(true));

      const usuarios = await firstValueFrom(
        this.http.get<UsuarioRecord[]>(this.apiUrl, { params })
      );

      const usuario = usuarios.at(0);

      if (!usuario) {
        throw new Error('Credenciales incorrectas');
      }

      const sessionUser = this.toSessionUser(usuario);
      this.persistSession(sessionUser);
      this.usuario.set(sessionUser);

      return sessionUser;
    } catch {
      this.error.set('Correo o contraseña incorrectos');
      throw new Error('Correo o contraseña incorrectos');
    } finally {
      this.cargando.set(false);
    }
  }

  logout(): void {
    this.clearSession();
    this.error.set(null);
    this.usuario.set(null);
    void this.router.navigateByUrl('/');
  }

  private toSessionUser(usuario: UsuarioRecord): UsuarioAutenticado {
    const { password: _password, ...sessionUser } = usuario;
    return sessionUser;
  }

  private persistSession(usuario: UsuarioAutenticado): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(usuario));
  }

  private restoreSession(): UsuarioAutenticado | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const rawSession = localStorage.getItem(this.storageKey);

    if (!rawSession) {
      return null;
    }

    try {
      return JSON.parse(rawSession) as UsuarioAutenticado;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }

  private clearSession(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.removeItem(this.storageKey);
  }
}