import { Component, inject, signal, computed } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../../core/services/auth-service';
import { SearchService } from '../../../core/services/search-service';
import { CategoryService } from '../../../core/services/categoria-service';


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
    MatSelectModule
  ],
  templateUrl: './public-header.html',
  styleUrl: './public-header.css',
})
export class PublicHeader {
  protected authService = inject(AuthService);
  protected searchService = inject(SearchService);
  protected categoryService = inject(CategoryService);
  private router = inject(Router);
  
  protected searchModalOpen = signal(false);
  protected categorias = computed(() => this.categoryService.categorias());

  protected toggleSearchModal(): void {
    this.searchModalOpen.update(val => !val);
  }

  protected closeSearchModal(): void {
    this.searchModalOpen.set(false);
  }

  protected resetFiltros(): void {
    this.searchService.resetFiltros();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']).catch(err => {
      console.error('Error en navegación a /login:', err);
    });
  }
}
