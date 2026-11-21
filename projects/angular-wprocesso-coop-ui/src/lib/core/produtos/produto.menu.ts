import { MenuItem } from 'primeng/api';

import { AuthService } from '../services/auth.service';

import { ItemMenuProduto } from './produto.model';

export function montarMenuDeProdutos(authService: AuthService, itens: ItemMenuProduto[]): MenuItem[] {
  const areas = new Map<string, MenuItem[]>();

  itens
    .filter((item) => authService.temFuncionalidade(item.funcionalidade) && authService.temAcessoProduto(item.produtoCodigo))
    .forEach((item) => {
      const itensDaArea = areas.get(item.area) ?? [];
      itensDaArea.push({ label: item.label, icon: item.icon, routerLink: item.routerLink });
      areas.set(item.area, itensDaArea);
    });

  return [...areas.entries()].map(([area, items]) => ({ label: area, icon: 'pi pi-briefcase', items }));
}
