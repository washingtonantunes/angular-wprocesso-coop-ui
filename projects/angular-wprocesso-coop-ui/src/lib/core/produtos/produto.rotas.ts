import { Routes } from '@angular/router';

import { authGuard } from '../guards/auth.guard';
import { funcionalidadeGuard } from '../guards/funcionalidade.guard';

import { RotaProduto } from './produto.model';

// Os guards são aplicados aqui para que nenhuma rota de produto fique sem eles.
export function montarRotasDeProdutos(rotas: RotaProduto[]): Routes {
  return rotas.map((rota) => ({
    path: rota.path,
    canMatch: [authGuard, funcionalidadeGuard(rota.funcionalidade, rota.produtoCodigo)],
    loadComponent: rota.loadComponent,
  }));
}
