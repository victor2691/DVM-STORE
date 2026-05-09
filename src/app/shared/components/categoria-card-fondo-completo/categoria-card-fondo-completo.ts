import { Component, Input } from '@angular/core';
import { Categoria } from '../../../core/models/model_categorias';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-categoria-card-fondo-completo',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './categoria-card-fondo-completo.html',
  styleUrl: './categoria-card-fondo-completo.css',
})
export class CategoriaCardFondoCompleto {
    @Input() category!: Categoria;
}
