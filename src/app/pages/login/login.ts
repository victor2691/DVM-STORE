import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginPage {
  protected authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';

  async login(): Promise<void> {
    try {
      const usuario = await this.authService.login({ email: this.email, password: this.password });

      if (usuario.rol === 'admin') {
        void this.router.navigate(['/admin/dashboard'], {
          queryParams: { section: 'estadisticas' },
        });
        return;
      }

      void this.router.navigate(['/']);
    } catch (error) {
      // Handle error, maybe show message
    }
  }
}
