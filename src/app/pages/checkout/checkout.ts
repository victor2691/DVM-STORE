import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart-service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css'],
})
export class Checkout {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  protected readonly cartService = inject(CartService);

  formularioEnvio!: FormGroup;
  formularioMetodoPago!: FormGroup;
  pasoActual: 'envio' | 'pago' | 'confirmacion' = 'envio';
  ordenCreada = false;
  numeroOrden = '';

  constructor() {
    this.inicializarFormularios();
  }

  private inicializarFormularios(): void {
    // Formulario de envío con validaciones
    this.formularioEnvio = this.fb.group({
      nombreCompleto: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-()]{7,}$/)]],
      direccion: ['', [Validators.required, Validators.minLength(5)]],
      ciudad: ['', [Validators.required]],
      codigoPostal: ['', [Validators.required, Validators.pattern(/^\d{4,}$/)]],
      metodoPago: ['tarjeta', Validators.required]
    });

    // Formulario de pago con validaciones
    this.formularioMetodoPago = this.fb.group({
      numeroTarjeta: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      nombreTarjeta: ['', [Validators.required]],
      fechaVencimiento: ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]]
    });
  }

  continuarAPago(): void {
    if (this.formularioEnvio.valid) {
      this.pasoActual = 'pago';
    } else {
      this.marcarCamposComoTocados(this.formularioEnvio);
    }
  }

  procesarPago(): void {
    if (this.formularioMetodoPago.valid && this.cartService.totalItems() > 0) {
      this.numeroOrden = `ORD-${Date.now()}`;
      this.pasoActual = 'confirmacion';
      this.ordenCreada = true;
      this.cartService.vaciarCarrito();
    } else {
      this.marcarCamposComoTocados(this.formularioMetodoPago);
    }
  }

  volverACarrito(): void {
    this.router.navigate(['/carrito']);
  }

  irAlHome(): void {
    this.router.navigate(['/']);
  }

  private marcarCamposComoTocados(form: FormGroup): void {
    Object.keys(form.controls).forEach(key => {
      form.get(key)?.markAsTouched();
    });
  }

  obtenerErrorMensaje(campo: string, grupo: FormGroup): string {
    const control = grupo.get(campo);
    if (!control?.touched || !control?.errors) return '';

    if (control.errors['required']) {
      return `${this.obtenerNombreCampo(campo)} es requerido`;
    }
    if (control.errors['minLength']) {
      return `Mínimo ${control.errors['minLength'].requiredLength} caracteres`;
    }
    if (control.errors['email']) {
      return 'Email inválido';
    }
    if (control.errors['pattern']) {
      return `Formato inválido de ${this.obtenerNombreCampo(campo)}`;
    }
    return 'Campo inválido';
  }

  private obtenerNombreCampo(campo: string): string {
    const nombres: { [key: string]: string } = {
      nombreCompleto: 'Nombre completo',
      email: 'Email',
      telefono: 'Teléfono',
      direccion: 'Dirección',
      ciudad: 'Ciudad',
      codigoPostal: 'Código postal',
      numeroTarjeta: 'Número de tarjeta',
      nombreTarjeta: 'Nombre en tarjeta',
      fechaVencimiento: 'Fecha de vencimiento',
      cvv: 'CVV'
    };
    return nombres[campo] || campo;
  }
}
