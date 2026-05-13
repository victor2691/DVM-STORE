import { Component, inject, signal, computed, HostListener } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../../core/services/auth-service';
import { CategoryService } from '../../../core/services/categoria-service';
import { SearchService } from '../../../core/services/search-service';
import { ProductosService } from '../../../core/services/productos-services';
import { CartService } from '../../../core/services/cart-service';
import { CardProductoCarrito } from '../card-producto-carrito/card-producto-carrito';


@Component({
  selector: 'app-public-header',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    RouterModule,
    MatIconModule,
    CommonModule,
    FormsModule,
    MatInputModule,
    MatSelectModule,
    CardProductoCarrito
  ],
  templateUrl: './public-header.html',
  styleUrl: './public-header.css',
})
export class PublicHeader {
  protected authService = inject(AuthService);
  protected categoryService = inject(CategoryService);
  protected searchService = inject(SearchService);
  protected productosService = inject(ProductosService);
  protected cartService = inject(CartService);
  private router = inject(Router);

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.searchService.modalAbierto()) {
      this.cerrarBusqueda();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']).catch(err => {
      console.error('Error en navegación a /login:', err);
    });
  }

  abrirBusqueda(): void {
    this.searchService.abrirModal();
  }

  cerrarBusqueda(): void {
    this.searchService.cerrarModal();
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchService.buscar(input.value);
  }

  irAlProducto(): void {
    this.cerrarBusqueda();
  }
}
