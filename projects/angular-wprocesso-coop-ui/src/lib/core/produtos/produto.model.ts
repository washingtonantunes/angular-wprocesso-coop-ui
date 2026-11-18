import { Type } from '@angular/core';

/** Rota declarada por um produto em `features/<area>/<produto>/<produto>.routes.ts`. */
export interface RotaProduto {
  /** Caminho completo da rota, no formato `<area>/<produto>/...`. */
  path: string;
  /** Funcionalidade exigida para acessar a rota. */
  funcionalidade: string;
  /** Código do produto no catálogo. */
  produtoCodigo: string;
  loadComponent: () => Promise<Type<unknown>>;
}

/** Item de menu declarado por um produto em `features/<area>/<produto>/<produto>.menu.ts`. */
export interface ItemMenuProduto {
  /** Nome da área, usado como grupo no menu (ex.: Crédito). */
  area: string;
  label: string;
  icon: string;
  /** Caminho de uma rota do produto, iniciado por barra. */
  routerLink: string;
  /** Funcionalidade que torna o item visível. */
  funcionalidade: string;
  /** Código do produto no catálogo. */
  produtoCodigo: string;
}
