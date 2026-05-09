import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth-service';

@Component({
  selector: 'app-formulario-inicio-sesion',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './formulario-inicio-sesion.html',
  styleUrl: './formulario-inicio-sesion.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormularioInicioSesionComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  protected readonly ocultarContrasena = signal(true);
  protected readonly errorServidor = signal<string | null>(null);
  protected readonly enviando = computed(() => this.authService.cargando());

  protected readonly formulario = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected async enviar(): Promise<void> {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.errorServidor.set(null);
    this.formulario.disable();

    try {
      await this.authService.login(this.formulario.getRawValue());
      await this.router.navigateByUrl('/');
    } catch {
      this.errorServidor.set(this.authService.error());
    } finally {
      this.formulario.enable();
    }
  }

  protected alternarContrasena(): void {
    this.ocultarContrasena.update((oculta) => !oculta);
  }

  protected tieneError(controlName: 'email' | 'password', errorName: string): boolean {
    const control = this.formulario.controls[controlName];
    return control.touched && control.hasError(errorName);
  }
}