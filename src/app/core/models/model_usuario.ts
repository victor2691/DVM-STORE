export interface UsuarioRecord {
  id: string;
  nombreCompleto: string;
  email: string;
  password: string;
  rol: 'admin' | 'cliente';
  activo: boolean;
}

export type UsuarioAutenticado = Omit<UsuarioRecord, 'password'>;

export interface LoginCredentials {
  email: string;
  password: string;
}