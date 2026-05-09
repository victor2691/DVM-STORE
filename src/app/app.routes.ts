import { Routes } from '@angular/router';
import { redirectIfAuthenticatedGuard } from './core/guards/redirect-if-authenticated.guard';
import { soloAdminGuard } from './core/guards/solo-admin.guard';
import { PublicLayout } from './layouts/public-layout/public-layout';
import { AdminLayout } from './layouts/admin-layout/admin-layout';
import { Home } from './pages/home/home';

export const routes: Routes = [
	{
		path: '',
		component: PublicLayout,
		children: [
			{ path: '', component: Home },
			{
				path: 'login',
				canMatch: [redirectIfAuthenticatedGuard],
				loadComponent: () =>
					import('./pages/login/login').then((module) => module.LoginPage),
			},
		],
	},
	{
		path: 'admin',
		component: AdminLayout,
		canActivate: [soloAdminGuard],
		children: [
			{ path: '', pathMatch: 'full', redirectTo: 'inventario' },
			{
				path: 'inventario',
				loadComponent: () =>
					import('./pages/admin-inventario/inventario').then(
						(module) => module.InventarioPage
					),
			},
		],
	},
	{ path: '**', redirectTo: '' },
];
