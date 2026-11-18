import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/**
 * Usado em canMatch, sempre depois do authGuard: sem a funcionalidade a rota não
 * casa e o código dela não é carregado. Em rota de produto, recebe também o
 * código do produto e bloqueia quando o usuário não tem acesso a ele.
 */
export const funcionalidadeGuard = (codigo: string, produtoCodigo?: string): CanMatchFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.temFuncionalidade(codigo)) {
      return router.createUrlTree(['/home']);
    }

    if (produtoCodigo && !authService.temAcessoProduto(produtoCodigo)) {
      return router.createUrlTree(['/home']);
    }

    return true;
  };
};
