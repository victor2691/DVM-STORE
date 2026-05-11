import { Component, input, inject } from '@angular/core';
import { ProductoVisual } from '../../../core/models/mode_productos';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../../core/services/cart-service';

@Component({
  selector: 'app-card-producto-carrito',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './card-producto-carrito.html',
  styleUrl: './card-producto-carrito.css',
})
export class CardProductoCarrito {
  // Recibimos el producto con el nombre de categoría ya incluido
  producto = input.required<ProductoVisual>();

  private cartService = inject(CartService);

  agregarAlCarrito(event: Event): void {
    event.stopPropagation(); // Evita que se active el routerLink
    this.cartService.agregarAlCarrito(this.producto(), 1);
  }
}
