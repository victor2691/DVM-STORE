import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('DVM-STORE');
  private authService = inject(AuthService);

  ngOnInit(): void {
    // Verificar si existe una sesión guardada al cargar la app
    this.authService.verificarSesion();
  }
}
