import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProductosService } from '../../core/services/productos-services';
import { CategoryService } from '../../core/services/categoria-service';
import { computed } from '@angular/core';
import { CardProductoCarrito } from '../../shared/components/card-producto-carrito/card-producto-carrito';

@Component({
  selector: 'app-categoria-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, CardProductoCarrito],
  templateUrl: './categoria-productos.html',
  styleUrls: ['./categoria-productos.css'],
})
export class CategoriaProductos implements OnInit {
  protected productosService = inject(ProductosService);
  protected categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);

  categoriaId = '';
  busqueda = '';

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.categoriaId = params['id'];
      this.productosService.getAllProductos();
      this.categoryService.getCategorias({ limit: 100 });
    });
  }

  protected readonly categoriaActual = computed(() => {
    return this.categoryService.categorias().find(c => c.id === this.categoriaId);
  });

  protected readonly categoriaNombre = computed(() => {
    const categoria = this.categoriaActual();
    return categoria ? categoria.nombre : 'Categoría no encontrada';
  });

  protected readonly productosFiltrados = computed(() => {
    const productos = this.productosService.productosCompletos();

    // Filtrar por categoría actual
    let filtrados = productos.filter(p => p.categoriaId === this.categoriaId);

    // Filtrar por búsqueda
    if (this.busqueda) {
      const search = this.busqueda.toLowerCase();
      filtrados = filtrados.filter(p =>
        p.nombre.toLowerCase().includes(search) ||
        p.descripcion.toLowerCase().includes(search)
      );
    }

    return filtrados;
  });

}
