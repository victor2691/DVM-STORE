import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Categoria } from '../../core/models/model_categorias';
import { CategoryService } from '../../core/services/categoria-service';
import { ProductosService } from '../../core/services/productos-services';
import { Producto } from '../../core/models/mode_productos';

@Component({
  selector: 'app-inventario',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTooltipModule,
  ],
  templateUrl: './inventario.html',
  styleUrl: './inventario.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventarioPage {
  private readonly document = inject(DOCUMENT);
  private readonly formBuilder = inject(FormBuilder);
  private readonly categoryService = inject(CategoryService);
  private readonly productosService = inject(ProductosService);

  protected readonly editandoId = signal<string | null>(null);
  protected readonly mostrarFormulario = signal(false);

  protected readonly formulario = this.formBuilder.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    categoriaId: ['', [Validators.required]],
    precio: [0, [Validators.required, Validators.min(0.01)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    imagenUrl: ['', [Validators.required]],
    descripcion: ['', [Validators.required, Validators.minLength(10)]],
    destacado: [false],
    oferta: [false],
    activo: [true],
  });

  protected readonly categorias = this.categoryService.categorias;
  protected readonly cargando = this.productosService.cargando;
  protected readonly error = this.productosService.error;
  protected readonly resumen = computed(() => {
    const productos = this.productosService.productos();

    return {
      total: productos.length,
      activos: productos.filter((producto) => producto.activo).length,
      disponibles: productos.filter((producto) => producto.activo && producto.stock > 0).length,
      agotados: productos.filter((producto) => producto.stock <= 0).length,
    };
  });

  protected readonly productosPorCategoria = computed(() => {
    const productos = this.productosService.productos();
    const cats = this.categoryService.categorias();

    return cats
      .map((categoria) => this.crearGrupoCategoria(categoria, productos))
      .sort((grupoA, grupoB) => grupoB.productos.length - grupoA.productos.length);
  });

  constructor() {
    this.categoryService.getCategorias();
    this.productosService.getAllProductos();
  }

  protected abrirFormularioNuevo(): void {
    this.limpiarFormulario();
    this.mostrarFormulario.set(true);
    this.desplazarAlFormulario();
  }

  protected limpiarFormulario(): void {
    this.formulario.reset({
      nombre: '',
      categoriaId: '',
      precio: 0,
      stock: 0,
      imagenUrl: '',
      descripcion: '',
      destacado: false,
      oferta: false,
      activo: true,
    });
    this.editandoId.set(null);
    this.mostrarFormulario.set(false);
  }

  protected async guardar(): Promise<void> {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const datos = this.formulario.getRawValue();
    const editandoId = this.editandoId();

    try {
      if (editandoId) {
        await this.productosService.actualizarProducto(editandoId, datos);
      } else {
        await this.productosService.crearProducto(datos);
      }
      this.limpiarFormulario();
    } catch {
      console.error('Error al guardar producto');
    }
  }

  protected async eliminar(id: string): Promise<void> {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await this.productosService.eliminarProducto(id);
      } catch {
        console.error('Error al eliminar producto');
      }
    }
  }

  protected editar(producto: Producto): void {
    this.formulario.patchValue(producto);
    this.editandoId.set(producto.id);
    this.mostrarFormulario.set(true);
    this.desplazarAlFormulario();
  }

  protected cancelar(): void {
    this.limpiarFormulario();
  }

  protected estadoDisponibilidad(producto: Producto): string {
    if (!producto.activo) {
      return 'Inactivo';
    }

    if (producto.stock <= 0) {
      return 'Agotado';
    }

    if (producto.stock <= 5) {
      return 'Stock bajo';
    }

    return 'Disponible';
  }

  protected claseDisponibilidad(producto: Producto): string {
    if (!producto.activo) {
      return 'estado-chip estado-chip--inactivo';
    }

    if (producto.stock <= 0) {
      return 'estado-chip estado-chip--agotado';
    }

    if (producto.stock <= 5) {
      return 'estado-chip estado-chip--bajo';
    }

    return 'estado-chip estado-chip--disponible';
  }

  private crearGrupoCategoria(categoria: Categoria, productos: Producto[]) {
    const productosCategoria = productos
      .filter((producto) => producto.categoriaId === categoria.id)
      .sort((productoA, productoB) => productoA.nombre.localeCompare(productoB.nombre));

    return {
      categoria,
      productos: productosCategoria,
      disponibles: productosCategoria.filter((producto) => producto.activo && producto.stock > 0).length,
      agotados: productosCategoria.filter((producto) => producto.stock <= 0).length,
      valorInventario: productosCategoria.reduce(
        (acumulado, producto) => acumulado + producto.precio * producto.stock,
        0
      ),
    };
  }

  private desplazarAlFormulario(): void {
    setTimeout(() => {
      const formulario = this.document.getElementById('inventario-formulario');
      formulario?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
}
