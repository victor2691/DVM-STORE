import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-panel-bienvenida-login',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './panel-bienvenida-login.html',
  styleUrl: './panel-bienvenida-login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelBienvenidaLoginComponent {
  protected readonly ventajas = [
    'Accede a tu historial y seguimiento de pedidos.',
    'Guarda tus productos favoritos y arma tu carrito más rápido.',
    'Consulta promociones y recomendaciones según tu perfil.',
  ];
}