import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosService } from '../../core/services/productos-services';
import { CategoryService } from '../../core/services/categoria-service';
import { computed } from '@angular/core';
import { CardProductoCarrito } from '../../shared/components/card-producto-carrito/card-producto-carrito';

@Component({
  selector: 'app-liquidacion',
  standalone: true,
  imports: [CommonModule, FormsModule, CardProductoCarrito],
  templateUrl: './liquidacion.html',
  styleUrls: ['./liquidacion.css'],
})
export class Liquidacion implements OnInit {
  protected productosService = inject(ProductosService);
  protected categoryService = inject(CategoryService);

  protected filtroCategoria = signal('');

  protected readonly productosFiltrados = computed(() => {
    const productos = this.productosService.productosCompletos();

    // Filtrar solo productos en oferta
    let filtrados = productos.filter(p => p.oferta);

    // Filtrar por categoría si está seleccionada
    if (this.filtroCategoria()) {
      filtrados = filtrados.filter(p => p.categoriaId === this.filtroCategoria());
    }

    return filtrados;
  });

  ngOnInit(): void {
    this.productosService.getAllProductos();
    this.categoryService.getCategorias({ limit: 100 });
  }
}
