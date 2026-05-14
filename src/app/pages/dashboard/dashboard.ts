import { Component, DestroyRef, computed, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';
import { ProductosService } from '../../core/services/productos-services';
import { CategoryService } from '../../core/services/categoria-service';
import { InventarioPage } from '../admin-inventario/inventario';
import { AdminCategoriasPage } from '../admin-categorias/categorias';
import { AdminUsuariosPage } from '../admin-usuarios/usuarios';
import { AdminStockChartComponent } from '../../shared/components/admin-stock-chart/admin-stock-chart';

type DashboardSection = 'estadisticas' | 'categorias' | 'usuarios' | 'inventario';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, InventarioPage, AdminCategoriasPage, AdminUsuariosPage, AdminStockChartComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard implements OnInit {
  private readonly chartPalette = ['#5b6cff', '#ff7a59', '#00b894', '#f4b400', '#8e44ad'];
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  protected authService = inject(AuthService);
  protected productosService = inject(ProductosService);
  protected categoryService = inject(CategoryService);
  protected stockChartData = computed(() => {
    const categorias = this.categoryService.categorias();
    const productos = this.productosService.productosCompletos();

    return categorias
      .map((categoria, index) => {
        const value = productos
          .filter((producto) => producto.categoriaId === categoria.id)
          .reduce((sum, producto) => sum + producto.stock, 0);

        return {
          name: categoria.nombre,
          value,
          color: this.chartPalette[index % this.chartPalette.length],
        };
      })
      .filter((item) => item.value > 0);
  });

  seccionActiva: DashboardSection = 'estadisticas';
  formularioCategoria!: FormGroup;

  constructor() {
    // Verificar autenticación
    if (!this.authService.estaAutenticado) {
      this.router.navigate(['/login']);
    }
    this.inicializarFormularios();
  }

  ngOnInit(): void {
    this.productosService.getAllProductos();
    this.categoryService.getCategorias({ limit: 100 });

    this.activatedRoute.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const section = params.get('section');

        if (this.esSeccionValida(section)) {
          this.seccionActiva = section;
        }
      });
  }

  private inicializarFormularios(): void {
    // Formulario de categoría
    this.formularioCategoria = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      imagenUrl: ['', Validators.required],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]]
    });
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

  protected cambiarSeccion(seccion: DashboardSection): void {
    this.seccionActiva = seccion;
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

  private esSeccionValida(valor: string | null): valor is DashboardSection {
    return valor === 'estadisticas' || valor === 'categorias' || valor === 'usuarios' || valor === 'inventario';
  }
}
