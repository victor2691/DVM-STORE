import { Injectable, signal } from '@angular/core';

export interface Usuario {
  id: string;
  username: string;
  email: string;
  rol: 'admin' | 'user';
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  usuarioActual = signal<Usuario | null>(null);
  estaAutenticado = signal(false);
  error = signal<string | null>(null);

  // Login simple - usuario: admin, contraseña: admin
  login(username: string, password: string): boolean {
    this.error.set(null);
    
    if (username === 'admin' && password === 'admin') {
      const usuario: Usuario = {
        id: '1',
        username: 'admin',
        email: 'admin@dvmstore.com',
        rol: 'admin'
      };
      
      this.usuarioActual.set(usuario);
      this.estaAutenticado.set(true);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      return true;
    } else {
      this.error.set('Usuario o contraseña incorrectos');
      return false;
    }
  }

  logout(): void {
    this.usuarioActual.set(null);
    this.estaAutenticado.set(false);
    localStorage.removeItem('usuario');
  }

  // Recuperar sesión si existe
  verificarSesion(): void {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      const usuario = JSON.parse(usuarioGuardado) as Usuario;
      this.usuarioActual.set(usuario);
      this.estaAutenticado.set(true);
    }
  }
}
