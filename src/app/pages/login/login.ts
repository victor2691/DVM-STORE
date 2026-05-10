import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  protected authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';

  login(): void {
    if (this.authService.login(this.username, this.password)) {
      this.router.navigate(['/admin']);
    }
  }
}
