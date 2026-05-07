import { Component, inject } from '@angular/core';
import { CategoriaCardFondoCompleto } from '../../shared/components/categoria-card-fondo-completo/categoria-card-fondo-completo';
import { CategoryService } from '../../core/services/categoria-service';

@Component({
  selector: 'app-home',
  imports: [CategoriaCardFondoCompleto],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
 categoryService  = inject(CategoryService);

 ngOnInit(): void {
   this.categoryService.getCategorias({ limit: 3 });
 }


}
