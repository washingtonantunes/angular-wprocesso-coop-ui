import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

import { COOP_UI_CONFIG } from '../../coop-ui.config';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

// Usado em canMatch: sem sessão válida a rota não casa, e o código dela não
// chega a ser carregado.
export const authGuard: CanMatchFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);
  const config = inject(COOP_UI_CONFIG);

  if (!authService.estaAutenticado()) {
    return router.createUrlTree(['/login']);
  }

  if (authService.currentUser()?.tipo !== config.tipo) {
    toastService.mostrarMsgAlerta(`Este acesso é exclusivo de usuários da ${config.participante}`);
    authService.limparSessao();
    return router.createUrlTree(['/login']);
  }

  return true;
};
