import { Component, computed, inject, OnInit, signal } from '@angular/core';
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

  protected filtroCategoria = signal('');

  ngOnInit(): void {
    this.productosService.getAllProductos();
    this.categoryService.getCategorias({ limit: 100 });
  }

  // Productos filtrados por categoría
  protected readonly productosFiltrados = computed(() => {
    let productos = this.productosService.productosCompletos();

    // Filtrar por categoría
    if (this.filtroCategoria()) {
      productos = productos.filter(p => p.categoriaId === this.filtroCategoria());
    }

    return productos;
  });

  verDetalle(productoId: string): void {
    this.router.navigate(['/productos', productoId]);
  }
}
