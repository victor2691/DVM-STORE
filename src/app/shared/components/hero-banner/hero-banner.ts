import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ProductoVisual } from '../../../core/models/mode_productos';
import { CartService } from '../../../core/services/cart-service';

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hero-banner.html',
  styleUrl: './hero-banner.css',
})
export class HeroBanner {
  producto = input.required<ProductoVisual>();

  private cartService = inject(CartService);
  private router = inject(Router);

  comprarAhora(): void {
    this.cartService.agregarAlCarrito(this.producto(), 1);
  }

  verDetalles(): void {
    this.router.navigate(['/productos', this.producto().id]);
  }
}

