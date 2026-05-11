import { Injectable, signal } from '@angular/core';

export interface Usuario {
  id: string;
  username: string;
  email: string;
  rol: 'admin' | 'cliente';
  timestamp?: number;
}

export interface LoginResponse {
  success: boolean;
  usuario?: Usuario;
  rol?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  usuarioActual = signal<Usuario | null>(null);
  estaAutenticado = signal(false);
  error = signal<string | null>(null);
  cargando = signal(false);
  
  // Control de intentos fallidos (anti fuerza bruta)
  private intentosFallidos = 0;
  private ultimoIntento = 0;
  private readonly MAXIMOS_INTENTOS = 5;
  private readonly TIEMPO_ESPERA_MS = 30000; // 30 segundos

  // Base de datos simple (en producción sería una API)
  private readonly USUARIOS_VALIDOS = [
    { username: 'admin', password: 'admin', rol: 'admin' as const, email: 'admin@dvmstore.com', id: '1' },
    { username: 'cliente', password: 'cliente', rol: 'cliente' as const, email: 'cliente@dvmstore.com', id: '2' }
  ];

  login(username: string, password: string): LoginResponse {
    this.error.set(null);
    this.cargando.set(true);

    // Validar entrada
    if (!this.validarEntrada(username, password)) {
      const errMsg = 'Usuario y contraseña son requeridos';
      this.error.set(errMsg);
      this.cargando.set(false);
      return { success: false, error: errMsg };
    }

    // Verificar intentos fallidos
    if (this.intentosFallidos >= this.MAXIMOS_INTENTOS) {
      const tiempoTranscurrido = Date.now() - this.ultimoIntento;
      if (tiempoTranscurrido < this.TIEMPO_ESPERA_MS) {
        const tiempoRestante = Math.ceil((this.TIEMPO_ESPERA_MS - tiempoTranscurrido) / 1000);
        const errMsg = `Demasiados intentos fallidos. Intenta en ${tiempoRestante}s`;
        this.error.set(errMsg);
        this.cargando.set(false);
        return { success: false, error: errMsg };
      } else {
        this.intentosFallidos = 0;
      }
    }

    // Buscar usuario
    const usuarioValido = this.USUARIOS_VALIDOS.find(
      u => u.username.toLowerCase() === username.trim().toLowerCase() && 
           u.password === password
    );

    if (usuarioValido) {
      this.intentosFallidos = 0; // Reset intentos
      
      const usuario: Usuario = {
        id: usuarioValido.id,
        username: usuarioValido.username,
        email: usuarioValido.email,
        rol: usuarioValido.rol,
        timestamp: Date.now()
      };

      this.usuarioActual.set(usuario);
      this.estaAutenticado.set(true);
      
      // Guardar sesión con timestamp
      localStorage.setItem('sesion', JSON.stringify(usuario));
      this.logAuditoria('LOGIN_EXITOSO', usuarioValido.username);
      
      this.cargando.set(false);
      return { success: true, usuario, rol: usuarioValido.rol };
    } else {
      this.intentosFallidos++;
      this.ultimoIntento = Date.now();
      
      const errMsg = 'Usuario o contraseña incorrectos';
      this.error.set(errMsg);
      this.logAuditoria('LOGIN_FALLIDO', username);
      
      this.cargando.set(false);
      return { success: false, error: errMsg };
    }
  }

  logout(): void {
    const usuarioActualValue = this.usuarioActual();
    if (usuarioActualValue) {
      this.logAuditoria('LOGOUT', usuarioActualValue.username);
    }
    
    this.usuarioActual.set(null);
    this.estaAutenticado.set(false);
    this.error.set(null);
    localStorage.removeItem('sesion');
  }

  // Recuperar sesión si existe y es válida
  verificarSesion(): void {
    try {
      const sesionGuardada = localStorage.getItem('sesion');
      
      if (sesionGuardada) {
        const usuario = JSON.parse(sesionGuardada) as Usuario;
        
        // Validar que la sesión sea válida
        if (this.validarSesion(usuario)) {
          this.usuarioActual.set(usuario);
          this.estaAutenticado.set(true);
          this.logAuditoria('SESION_RECUPERADA', usuario.username);
        } else {
          // Sesión inválida o expirada
          localStorage.removeItem('sesion');
          this.estaAutenticado.set(false);
        }
      }
    } catch (error) {
      console.error('Error al recuperar sesión:', error);
      localStorage.removeItem('sesion');
      this.estaAutenticado.set(false);
    }
  }

  // Validar que el usuario tiene un rol específico
  tieneRol(rol: 'admin' | 'cliente'): boolean {
    const usuario = this.usuarioActual();
    return usuario?.rol === rol;
  }

  // Validar que el usuario está autenticado
  estaAutenticadoYActivo(): boolean {
    return this.estaAutenticado() && this.usuarioActual() !== null;
  }

  // Métodos privados
  private validarEntrada(username: string, password: string): boolean {
    if (!username || !password) return false;
    if (username.trim().length < 1 || password.length < 1) return false;
    return true;
  }

  private validarSesion(usuario: Usuario): boolean {
    // Validar estructura
    if (!usuario.id || !usuario.username || !usuario.rol) {
      return false;
    }

    // Validar que el usuario existe en la BD local
    const usuarioValido = this.USUARIOS_VALIDOS.find(u => u.id === usuario.id);
    return !!usuarioValido;
  }

  private logAuditoria(evento: string, usuario: string): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${evento}: ${usuario}`);
    
    // En producción, esto se enviaría a un servidor
    // this.httpClient.post('/api/auditoria', { evento, usuario, timestamp })
  }
}
