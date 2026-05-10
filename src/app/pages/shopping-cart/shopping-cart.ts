import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart-service';

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shopping-cart.html',
  styleUrls: ['./shopping-cart.css'],
})
export class ShoppingCart {
  protected readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  continuarCompra(): void {
    if (this.cartService.totalItems() > 0) {
      this.router.navigate(['/checkout']);
    }
  }

  volverAlCatalogo(): void {
    this.router.navigate(['/catalogo']);
  }

  eliminarProducto(productoId: string): void {
    this.cartService.eliminarDelCarrito(productoId);
  }

  actualizarCantidad(productoId: string, cantidad: number): void {
    this.cartService.actualizarCantidad(productoId, cantidad);
  }

  vaciarCarrito(): void {
    if (confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
      this.cartService.vaciarCarrito();
    }
  }
}
