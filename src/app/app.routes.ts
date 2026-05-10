import { Routes } from '@angular/router';
import { PublicLayout } from './layouts/public-layout/public-layout';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { ProductCatalog } from './pages/product-catalog/product-catalog';
import { ProductDetails } from './pages/product-details/product-details';
import { ShoppingCart } from './pages/shopping-cart/shopping-cart';
import { Checkout } from './pages/checkout/checkout';
import { Dashboard } from './pages/dashboard/dashboard';
import { Liquidacion } from './pages/liquidacion/liquidacion';
import { MasVendidos } from './pages/mas-vendidos/mas-vendidos';

export const routes: Routes = [
  // Rutas públicas
  {
    path: '',
    component: PublicLayout,
    children: [
      { path: '', component: Home },
      { path: 'catalogo', component: ProductCatalog },
      { path: 'productos/:id', component: ProductDetails },
      { path: 'carrito', component: ShoppingCart },
      { path: 'checkout', component: Checkout },
      { path: 'liquidacion', component: Liquidacion },
      { path: 'mas-vendidos', component: MasVendidos },
    ]
  },
  // Ruta de login
  { path: 'login', component: Login },
  // Ruta de admin/dashboard
  { path: 'admin', component: Dashboard },
  // Ruta no encontrada
  { path: '**', redirectTo: '' }
];
