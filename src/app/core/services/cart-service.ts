import { Injectable, signal, computed } from '@angular/core';
import { Producto } from '../models/mode_productos';

export interface ItemCarrito extends Producto {
  cantidad: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  items = signal<ItemCarrito[]>([]);

  // Total de items
  totalItems = computed(() => {
    return this.items().reduce((sum, item) => sum + item.cantidad, 0);
  });

  // Total precio
  totalPrecio = computed(() => {
    return this.items().reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  });

  // Agregar producto al carrito
  agregarAlCarrito(producto: Producto, cantidad: number = 1): void {
    const itemsActuales = this.items();
    const itemExistente = itemsActuales.find(item => item.id === producto.id);

    if (itemExistente) {
      // Si ya existe, aumentar cantidad
      itemExistente.cantidad += cantidad;
      this.items.set([...itemsActuales]);
    } else {
      // Si no existe, agregarlo
      const nuevoItem: ItemCarrito = {
        ...producto,
        cantidad
      };
      this.items.set([...itemsActuales, nuevoItem]);
    }
  }

  // Eliminar producto del carrito
  eliminarDelCarrito(productoId: string): void {
    const itemsActuales = this.items();
    this.items.set(itemsActuales.filter(item => item.id !== productoId));
  }

  // Actualizar cantidad
  actualizarCantidad(productoId: string, cantidad: number): void {
    const itemsActuales = this.items();
    const item = itemsActuales.find(i => i.id === productoId);
    
    if (item) {
      if (cantidad <= 0) {
        this.eliminarDelCarrito(productoId);
      } else {
        item.cantidad = cantidad;
        this.items.set([...itemsActuales]);
      }
    }
  }

  // Vaciar carrito
  vaciarCarrito(): void {
    this.items.set([]);
  }

  // Obtener items del carrito
  obtenerItems(): ItemCarrito[] {
    return this.items();
  }
}
