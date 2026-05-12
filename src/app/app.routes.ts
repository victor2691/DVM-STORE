import { Routes } from '@angular/router';
import { redirectIfAuthenticatedGuard } from './core/guards/redirect-if-authenticated.guard';
import { soloAdminGuard } from './core/guards/solo-admin.guard';
import { PublicLayout } from './layouts/public-layout/public-layout';
import { AdminLayout } from './layouts/admin-layout/admin-layout';
import { Home } from './pages/home/home';

export const routes: Routes = [
  // --- RUTAS PÚBLICAS (Tienda) ---
  {
    path: '',
    component: PublicLayout,
    children: [
      { path: '', component: Home },
      {
        path: 'catalogo',
        loadComponent: () => import('./pages/product-catalog/product-catalog').then(m => m.ProductCatalog)
      },
      {
        path: 'productos/:id',
        loadComponent: () => import('./pages/product-details/product-details').then(m => m.ProductDetails)
      },
      {
        path: 'carrito',
        loadComponent: () => import('./pages/shopping-cart/shopping-cart').then(m => m.ShoppingCart)
      },
      {
        path: 'checkout',
        loadComponent: () => import('./pages/checkout/checkout').then(m => m.Checkout)
      },
      {
        path: 'liquidacion',
        loadComponent: () => import('./pages/liquidacion/liquidacion').then(m => m.Liquidacion)
      },
      {
        path: 'categoria/:id',
        loadComponent: () => import('./pages/categoria-productos/categoria-productos').then(m => m.CategoriaProductos)
      },
      {
        path: 'mas-vendidos',
        loadComponent: () => import('./pages/mas-vendidos/mas-vendidos').then(m => m.MasVendidos)
      },
      {
        path: 'login',
        canMatch: [redirectIfAuthenticatedGuard],
        loadComponent: () => import('./pages/login/login').then((m) => m.LoginPage),
      },
    ],
  },

  // --- RUTAS DE ADMINISTRACIÓN (Protegidas) ---
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [soloAdminGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'inventario',
        loadComponent: () => import('./pages/admin-inventario/inventario').then(m => m.InventarioPage),
      },
      {
        path: 'categorias',
        loadComponent: () => import('./pages/admin-categorias/categorias').then(m => m.AdminCategoriasPage),
      },
    ],
  },

  // --- COMODÍN ---
  { path: '**', redirectTo: '' },
];
