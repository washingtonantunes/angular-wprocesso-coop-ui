import { Component, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterModule } from '@angular/router';

import { filter } from 'rxjs';

import { MenuItem } from 'primeng/api';
import { DrawerModule } from 'primeng/drawer';
import { PanelMenuModule } from 'primeng/panelmenu';

import { COOP_UI_CONFIG } from '../../../coop-ui.config';

@Component({
  selector: 'app-barra-lateral',
  templateUrl: './barra-lateral.component.html',
  styleUrl: './barra-lateral.component.css',
  imports: [RouterModule, DrawerModule, PanelMenuModule],
})
export class BarraLateralComponent {
  private readonly router = inject(Router);
  readonly config = inject(COOP_UI_CONFIG);

  display = signal(false);
  itens = input<MenuItem[]>([]);

  private readonly navigationEvents = toSignal(this.router.events.pipe(filter((event) => event instanceof NavigationEnd)));

  constructor() {
    effect(() => {
      const navEvent = this.navigationEvents();
      if (navEvent) {
        this.display.set(false);
      }
    });
  }

  alternar(): void {
    this.display.update((value) => !value);
  }
}
