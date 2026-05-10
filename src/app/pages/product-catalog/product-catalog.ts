import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosService } from '../../core/services/productos-services';
import { CategoryService } from '../../core/services/categoria-service';
import { CardProductoCarrito } from '../../shared/components/card-producto-carrito/card-producto-carrito';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, CardProductoCarrito],
  templateUrl: './product-catalog.html',
  styleUrls: ['./product-catalog.css'],
})
export class ProductCatalog implements OnInit {
  protected readonly productosService = inject(ProductosService);
  protected readonly categoryService = inject(CategoryService);
  private router = inject(Router);

  filtroCategoria = '';
  busqueda = '';

  ngOnInit(): void {
    this.productosService.getAllProductos();
    this.categoryService.getCategorias({ limit: 100 });
  }

  // Productos filtrados por categoría y búsqueda
  protected readonly productosFiltrados = computed(() => {
    let productos = this.productosService.productosCompletos();

    // Filtrar por categoría
    if (this.filtroCategoria) {
      productos = productos.filter(p => p.categoriaId === this.filtroCategoria);
    }

    // Filtrar por búsqueda
    if (this.busqueda) {
      const search = this.busqueda.toLowerCase();
      productos = productos.filter(p => 
        p.nombre.toLowerCase().includes(search) || 
        p.descripcion.toLowerCase().includes(search)
      );
    }

    return productos;
  });

  verDetalle(productoId: string): void {
    this.router.navigate(['/productos', productoId]);
  }

  limpiarFiltros(): void {
    this.filtroCategoria = '';
    this.busqueda = '';
  }
}
