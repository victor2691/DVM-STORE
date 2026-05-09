import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { CategoriaCardFondoCompleto } from '../../shared/components/categoria-card-fondo-completo/categoria-card-fondo-completo';
import { CategoryService } from '../../core/services/categoria-service';
import { ProductosService } from '../../core/services/productos-services';
import { HeroBanner } from '../../shared/components/hero-banner/hero-banner';
import { CardProductoCarrito } from '../../shared/components/card-producto-carrito/card-producto-carrito';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CategoriaCardFondoCompleto, HeroBanner, CardProductoCarrito],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements OnInit {
  protected readonly categoryService = inject(CategoryService);
  protected readonly productosService = inject(ProductosService);

  ngOnInit(): void {
    // Un solo llamado para cada cosa
    this.categoryService.getCategorias({ limit: 3 });
    this.productosService.getAllProductos();
  }

  // 1. Producto para el HERO (el primero destacado)
  protected readonly productoHero = computed(() => {
    return this.productosService.productosCompletos()
      .find(p => p.destacado);
  });

  // 2. Productos para el GRID (excluyendo el del Hero)
  protected readonly productosGrid = computed(() => {
    const hero = this.productoHero();

    return this.productosService.productosCompletos()
      .filter(p => p.id !== hero?.id)
      .slice(0, 4);
  });
}
