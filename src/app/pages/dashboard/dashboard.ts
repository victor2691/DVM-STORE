import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';
import { ProductosService } from '../../core/services/productos-services';
import { CategoryService } from '../../core/services/categoria-service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  protected authService = inject(AuthService);
  protected productosService = inject(ProductosService);
  protected categoryService = inject(CategoryService);

  seccionActiva: 'estadisticas' | 'productos' | 'categorias' = 'estadisticas';
  formularioProducto!: FormGroup;
  formularioCategoria!: FormGroup;

  constructor() {
    // Verificar autenticación
    if (!this.authService.estaAutenticado()) {
      this.router.navigate(['/login']);
    }
    this.inicializarFormularios();
  }

  ngOnInit(): void {
    this.productosService.getAllProductos();
    this.categoryService.getCategorias({ limit: 100 });
  }

  private inicializarFormularios(): void {
    // Formulario de producto
    this.formularioProducto = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      categoria: ['', Validators.required],
      precio: ['', [Validators.required, Validators.min(1)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      imagenUrl: ['', Validators.required],
      destacado: [false],
      oferta: [false]
    });

    // Formulario de categoría
    this.formularioCategoria = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      imagenUrl: ['', Validators.required],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]]
    });
  }

  guardarProducto(): void {
    if (this.formularioProducto.valid) {
      // Simulación - En producción, enviarías al servidor
      console.log('Producto guardado:', this.formularioProducto.value);
      alert('Producto guardado exitosamente');
      this.formularioProducto.reset();
    } else {
      this.marcarCamposComoTocados(this.formularioProducto);
    }
  }

  guardarCategoria(): void {
    if (this.formularioCategoria.valid) {
      // Simulación - En producción, enviarías al servidor
      console.log('Categoría guardada:', this.formularioCategoria.value);
      alert('Categoría guardada exitosamente');
      this.formularioCategoria.reset();
    } else {
      this.marcarCamposComoTocados(this.formularioCategoria);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
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
      return `Este campo es requerido`;
    }
    if (control.errors['minLength']) {
      return `Mínimo ${control.errors['minLength'].requiredLength} caracteres`;
    }
    if (control.errors['min']) {
      return `Mínimo ${control.errors['min'].min}`;
    }
    if (control.errors['pattern']) {
      return `Formato inválido`;
    }
    return 'Campo inválido';
  }
}
