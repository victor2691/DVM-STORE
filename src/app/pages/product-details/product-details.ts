import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductosService } from '../../core/services/productos-services';
import { CartService } from '../../core/services/cart-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-details.html',
  styleUrls: ['./product-details.css'],
})
export class ProductDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly productosService = inject(ProductosService);
  protected readonly cartService = inject(CartService);
  protected readonly Math = Math;

  cantidad = 1;
  mensajeAgregado = false;

  protected readonly productoActual = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return this.productosService.productosCompletos().find(p => p.id === id);
  });

  ngOnInit(): void {
    this.productosService.getAllProductos();
  }

  agregarAlCarrito(): void {
    const producto = this.productoActual();
    if (producto) {
      this.cartService.agregarAlCarrito(producto, this.cantidad);
      this.mensajeAgregado = true;
      
      setTimeout(() => {
        this.mensajeAgregado = false;
      }, 2000);
    }
  }

  irAlCarrito(): void {
    this.router.navigate(['/carrito']);
  }

  volver(): void {
    this.router.navigate(['/catalogo']);
  }
}
