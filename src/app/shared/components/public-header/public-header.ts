import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';


@Component({
  selector: 'app-public-header',
  imports: [MatToolbarModule, MatButtonModule, RouterModule],
  templateUrl: './public-header.html',
  styleUrl: './public-header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicHeader {
  protected readonly authService = inject(AuthService);
  protected readonly esAdmin = computed(() => this.authService.usuario()?.rol === 'admin');

  protected logout(): void {
    this.authService.logout();
  }
}
