import { Component, computed, inject } from '@angular/core';
import { CategoriaCardFondoCompleto } from '../../shared/components/categoria-card-fondo-completo/categoria-card-fondo-completo';
import { CategoryService } from '../../core/services/categoria-service';
import { ProductosService } from '../../core/services/productos-services';
import { Producto } from '../../core/models/mode_productos';

@Component({
  selector: 'app-home',
  imports: [CategoriaCardFondoCompleto],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
 categoryService  = inject(CategoryService);
   productosService = inject(ProductosService);
   
 productoHero = computed<Producto | null>(() => {
    return this.productosService.productos()[0] ?? null;
  });


 ngOnInit(): void {
   this.categoryService.getCategorias({ limit: 3 });
   this.productosService.getProductos({ destacado: true, limit: 1 });
   
// tomar el primero como hero


 }


}
