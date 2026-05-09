import { Component, input } from '@angular/core';
import { ProductoVisual } from '../../../core/models/mode_productos';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-producto-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-producto-carrito.html',
  styleUrl: './card-producto-carrito.css',
})
export class CardProductoCarrito {
  // Recibimos el producto con el nombre de categoría ya incluido
  producto = input.required<ProductoVisual>();
}
