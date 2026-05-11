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

  // Estados para edición
  productoEnEdicion: string | null = null;
  categoriaEnEdicion: string | null = null;

  constructor() {
    // Verificar autenticación y rol de admin
    if (!this.authService.estaAutenticadoYActivo()) {
      this.router.navigate(['/login']);
      return;
    }

    // Verificar que sea admin
    if (!this.authService.tieneRol('admin')) {
      console.warn('Acceso denegado: usuario no es administrador');
      this.router.navigate(['/catalogo']);
      return;
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
      const datos = this.formularioProducto.value;
      
      if (this.productoEnEdicion) {
        // ACTUALIZAR producto existente
        this.productosService.actualizarProducto(this.productoEnEdicion, {
          ...datos,
          id: this.productoEnEdicion,
          categoriaId: datos.categoria
        });
        this.productoEnEdicion = null;
      } else {
        // CREAR nuevo producto
        this.productosService.crearProducto({
          ...datos,
          id: Date.now().toString(),
          categoriaId: datos.categoria
        });
      }
      
      this.formularioProducto.reset();
    } else {
      this.marcarCamposComoTocados(this.formularioProducto);
    }
  }

  editarProducto(id: string): void {
    const producto = this.productosService.getProductoById(id);
    if (producto) {
      this.productoEnEdicion = id;
      this.formularioProducto.patchValue({
        nombre: producto.nombre,
        categoria: producto.categoriaId,
        precio: producto.precio,
        stock: producto.stock,
        descripcion: producto.descripcion,
        imagenUrl: producto.imagenUrl,
        destacado: producto.destacado,
        oferta: producto.oferta
      });
      // Scroll al formulario
      const elemento = document.querySelector('.form-group');
      elemento?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  eliminarProducto(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      this.productosService.eliminarProducto(id);
      if (this.productoEnEdicion === id) {
        this.productoEnEdicion = null;
        this.formularioProducto.reset();
      }
    }
  }

  cancelarEdicionProducto(): void {
    this.productoEnEdicion = null;
    this.formularioProducto.reset();
  }

  guardarCategoria(): void {
    if (this.formularioCategoria.valid) {
      const datos = this.formularioCategoria.value;
      
      if (this.categoriaEnEdicion) {
        // ACTUALIZAR categoría existente
        this.categoryService.actualizarCategoria(this.categoriaEnEdicion, {
          ...datos,
          id: this.categoriaEnEdicion
        });
        this.categoriaEnEdicion = null;
      } else {
        // CREAR nueva categoría
        this.categoryService.crearCategoria({
          ...datos,
          id: Date.now().toString()
        });
      }
      
      this.formularioCategoria.reset();
    } else {
      this.marcarCamposComoTocados(this.formularioCategoria);
    }
  }

  editarCategoria(id: string): void {
    const categoria = this.categoryService.getCategoriaById(id);
    if (categoria) {
      this.categoriaEnEdicion = id;
      this.formularioCategoria.patchValue({
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        imagenUrl: categoria.imagenUrl,
        slug: categoria.slug
      });
      // Scroll al formulario
      const elemento = document.querySelector('.form-group');
      elemento?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  eliminarCategoria(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      this.categoryService.eliminarCategoria(id);
      if (this.categoriaEnEdicion === id) {
        this.categoriaEnEdicion = null;
        this.formularioCategoria.reset();
      }
    }
  }

  cancelarEdicionCategoria(): void {
    this.categoriaEnEdicion = null;
    this.formularioCategoria.reset();
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
