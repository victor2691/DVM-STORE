import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login implements OnInit {
  protected authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  formularioLogin!: FormGroup;
  mostrarPassword = false;

  ngOnInit(): void {
    // Crear formulario reactivo
    this.formularioLogin = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(100)
      ]]
    });

    // Si ya está autenticado, redirigir según su rol
    if (this.authService.estaAutenticadoYActivo()) {
      this.redirigirPorRol();
    }
  }

  login(): void {
    // Limpiar errores previos
    this.authService.error.set(null);

    // Validar formulario reactivo
    if (!this.formularioLogin.valid) {
      this.marcarCamposTocados(this.formularioLogin);
      return;
    }

    const { username, password } = this.formularioLogin.value;

    // Realizar login
    const resultado = this.authService.login(username, password);

    if (resultado.success) {
      // Login exitoso
      this.formularioLogin.reset();
      
      // Redirigir según el rol del usuario
      this.redirigirPorRol();
    } else {
      // Login fallido - limpiar solo la contraseña
      this.formularioLogin.patchValue({ password: '' });
    }
  }

  private marcarCamposTocados(form: FormGroup): void {
    Object.keys(form.controls).forEach(key => {
      form.get(key)?.markAsTouched();
    });
  }

  private redirigirPorRol(): void {
    const usuario = this.authService.usuarioActual();
    
    if (!usuario) return;

    // Redirigir según el rol
    if (usuario.rol === 'admin') {
      this.router.navigate(['/admin']).catch(err => {
        console.error('Error en navegación a /admin:', err);
      });
    } else if (usuario.rol === 'cliente') {
      this.router.navigate(['/catalogo']).catch(err => {
        console.error('Error en navegación a /catalogo:', err);
      });
    } else {
      // Fallback
      this.router.navigate(['/']);
    }
  }

  toggleMostrarPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  // Métodos auxiliares para validación
  obtenerErrorMensaje(campo: string): string {
    const control = this.formularioLogin.get(campo);
    
    if (!control?.touched || !control?.errors) return '';

    if (control.errors['required']) {
      return `${campo === 'username' ? 'Usuario' : 'Contraseña'} es requerido`;
    }
    if (control.errors['minLength']) {
      return `Mínimo ${control.errors['minLength'].requiredLength} caracteres`;
    }
    if (control.errors['maxLength']) {
      return `Máximo ${control.errors['maxLength'].requiredLength} caracteres`;
    }
    return 'Campo inválido';
  }

  esValidoVisualmente(campo: string): boolean {
    const control = this.formularioLogin.get(campo);
    return !!(control && control.valid && (control.dirty || control.touched));
  }

  tieneErrorVisualmente(campo: string): boolean {
    const control = this.formularioLogin.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
