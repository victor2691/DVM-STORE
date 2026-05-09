import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const soloAdminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const usuario = authService.usuario();

  if (!usuario || usuario.rol !== 'admin') {
    void router.navigateByUrl('/');
    return false;
  }

  return true;
};
