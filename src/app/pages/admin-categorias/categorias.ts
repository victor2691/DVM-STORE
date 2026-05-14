import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Categoria } from '../../core/models/model_categorias';
import { CategoryService } from '../../core/services/categoria-service';
import { ProductosService } from '../../core/services/productos-services';

@Component({
  selector: 'app-admin-categorias',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSlideToggleModule,
    MatTooltipModule,
  ],
  templateUrl: './categorias.html',
  styleUrl: './categorias.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCategoriasPage {
  private readonly document = inject(DOCUMENT);
  private readonly formBuilder = inject(FormBuilder);
  private readonly categoryService = inject(CategoryService);
  private readonly productosService = inject(ProductosService);

  protected readonly editandoId = signal<string | null>(null);
  protected readonly mostrarFormulario = signal(false);

  protected readonly formulario = this.formBuilder.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    slug: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: ['', [Validators.required, Validators.minLength(10)]],
    imagenUrl: [''],
    activo: [true],
  });

  protected readonly categorias = this.categoryService.categorias;
  protected readonly cargando = this.categoryService.cargando;
  protected readonly error = this.categoryService.error;
  protected readonly resumen = computed(() => {
    const categorias = this.categoryService.categorias();
    const productos = this.productosService.productos();

    return {
      total: categorias.length,
      activas: categorias.filter((categoria) => categoria.activo).length,
      inactivas: categorias.filter((categoria) => !categoria.activo).length,
      conProductos: categorias.filter((categoria) =>
        productos.some((producto) => producto.categoriaId === categoria.id)
      ).length,
    };
  });

  protected readonly categoriasDetalladas = computed(() => {
    const categorias = this.categoryService.categorias();
    const productos = this.productosService.productos();

    return categorias
      .map((categoria) => {
        const productosCategoria = productos.filter((producto) => producto.categoriaId === categoria.id);

        return {
          ...categoria,
          totalProductos: productosCategoria.length,
          productosActivos: productosCategoria.filter((producto) => producto.activo).length,
          stockTotal: productosCategoria.reduce((total, producto) => total + producto.stock, 0),
        };
      })
      .sort((categoriaA, categoriaB) => categoriaA.nombre.localeCompare(categoriaB.nombre));
  });

  constructor() {
    this.categoryService.getCategorias({ sort: 'nombre', order: 'asc' });
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
      slug: '',
      descripcion: '',
      imagenUrl: '',
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

    const editandoId = this.editandoId();
    const datos = this.formulario.getRawValue();
    const slug = this.normalizarSlug(datos.slug || datos.nombre);
    const categoriaActual = this.categorias().find((categoria) => categoria.id === editandoId);
    const payload = {
      nombre: datos.nombre.trim(),
      slug,
      descripcion: datos.descripcion.trim(),
      activo: datos.activo,
      imagenUrl: datos.imagenUrl.trim() || categoriaActual?.imagenUrl || this.obtenerImagenPlaceholder(slug),
    };

    try {
      if (editandoId) {
        await this.categoryService.actualizarCategoria(editandoId, payload);
      } else {
        await this.categoryService.crearCategoria(payload);
      }

      this.limpiarFormulario();
    } catch {
      console.error('Error al guardar categoría');
    }
  }

  protected async eliminar(categoria: Categoria): Promise<void> {
    const totalProductos = this.obtenerTotalProductos(categoria.id);
    const mensaje = totalProductos > 0
      ? `La categoría ${categoria.nombre} tiene ${totalProductos} producto(s) asociados. ¿Deseas eliminarla de todos modos?`
      : `¿Estás seguro de que deseas eliminar la categoría ${categoria.nombre}?`;

    if (!confirm(mensaje)) {
      return;
    }

    try {
      await this.categoryService.eliminarCategoria(categoria.id);
    } catch {
      console.error('Error al eliminar categoría');
    }
  }

  protected editar(categoria: Categoria): void {
    this.formulario.reset({
      nombre: categoria.nombre,
      slug: categoria.slug,
      descripcion: categoria.descripcion,
      imagenUrl: categoria.imagenUrl,
      activo: categoria.activo,
    });
    this.editandoId.set(categoria.id);
    this.mostrarFormulario.set(true);
    this.desplazarAlFormulario();
  }

  protected cargarImagen(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      this.formulario.controls.imagenUrl.setValue(result);
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  protected vistaPreviaImagen(): string {
    const rawImage = this.formulario.controls.imagenUrl.getRawValue().trim();

    if (rawImage) {
      return rawImage;
    }

    const slug = this.normalizarSlug(
      this.formulario.controls.slug.getRawValue() || this.formulario.controls.nombre.getRawValue()
    );

    return this.obtenerImagenPlaceholder(slug || 'technology');
  }

  protected cancelar(): void {
    this.limpiarFormulario();
  }

  protected estadoCategoria(categoria: Categoria): string {
    return categoria.activo ? 'Activa' : 'Inactiva';
  }

  protected claseEstado(categoria: Categoria): string {
    return categoria.activo
      ? 'estado-chip estado-chip--activo'
      : 'estado-chip estado-chip--inactivo';
  }

  private obtenerTotalProductos(categoriaId: string): number {
    return this.productosService.productos().filter((producto) => producto.categoriaId === categoriaId).length;
  }

  private normalizarSlug(valor: string): string {
    return valor
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private obtenerImagenPlaceholder(slug: string): string {
    return `https://images.unsplash.com/featured/?technology,${slug}`;
  }

  private desplazarAlFormulario(): void {
    setTimeout(() => {
      const formulario = this.document.getElementById('categorias-formulario');
      formulario?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
}