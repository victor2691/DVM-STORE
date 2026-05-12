import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterModule, RouterOutlet, MatToolbarModule, MatButtonModule],
  template: `
    <mat-toolbar class="admin-toolbar" color="primary">
      <span class="admin-title">DVM Store - Panel Admin</span>
      <span class="spacer"></span>
      <button mat-button routerLink="/admin/inventario" routerLinkActive="nav-button--active" aria-label="Ir a inventario">
        Inventario
      </button>
      <button mat-button routerLink="/admin/categorias" routerLinkActive="nav-button--active" aria-label="Ir a categorías">
        Categorías
      </button>
      <button mat-stroked-button class="home-button" routerLink="/" aria-label="Volver al inicio">
        Inicio
      </button>
    </mat-toolbar>
    <div class="admin-content">
      <router-outlet />
    </div>
  `,
  styles: `
    .admin-toolbar {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .admin-title {
      font-weight: 600;
      font-size: 1.1rem;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .home-button {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      border-color: rgba(255, 255, 255, 0.45);
      color: #fff;
    }

    .nav-button--active {
      background: rgba(255, 255, 255, 0.14);
    }

    .admin-content {
      min-height: calc(100vh - 72px);
      padding: 1.5rem;
      background: #f5f7fa;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayout {}
