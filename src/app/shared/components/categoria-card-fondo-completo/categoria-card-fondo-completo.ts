import { Component, input } from '@angular/core';
import { Categoria } from '../../../core/models/model_categorias';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-categoria-card-fondo-completo',
  standalone: true,
  imports: [MatCardModule, RouterModule],
  templateUrl: './categoria-card-fondo-completo.html',
  styleUrl: './categoria-card-fondo-completo.css',
})
export class CategoriaCardFondoCompleto {
  category = input.required<Categoria>();
}
