import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosService } from '../../core/services/productos-services';
import { CategoryService } from '../../core/services/categoria-service';
import { computed } from '@angular/core';
import { CardProductoCarrito } from '../../shared/components/card-producto-carrito/card-producto-carrito';

@Component({
  selector: 'app-mas-vendidos',
  standalone: true,
  imports: [CommonModule, FormsModule, CardProductoCarrito],
  templateUrl: './mas-vendidos.html',
  styleUrls: ['./mas-vendidos.css'],
})
export class MasVendidos implements OnInit {
  protected productosService = inject(ProductosService);
  protected categoryService = inject(CategoryService);

  busqueda = '';
  filtroCategoria = '';

  protected readonly productosFiltrados = computed(() => {
    const productos = this.productosService.productosCompletos();

    // Ordenar por stock descendente (más vendidos = más stock disponible)
    let filtrados = [...productos].sort((a, b) => b.stock - a.stock);

    // Filtrar por categoría si está seleccionada
    if (this.filtroCategoria) {
      filtrados = filtrados.filter(p => p.categoriaId === this.filtroCategoria);
    }

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

  ngOnInit(): void {
    this.productosService.getAllProductos();
    this.categoryService.getCategorias({ limit: 100 });
  }
}
