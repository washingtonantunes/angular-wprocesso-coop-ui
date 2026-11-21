import { Component, computed, inject, output } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

import { COOP_UI_CONFIG } from '../../../coop-ui.config';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-barra-superior',
  imports: [ButtonModule, TooltipModule],
  templateUrl: './barra-superior.component.html',
  styleUrl: './barra-superior.component.css',
})
export class BarraSuperiorComponent {
  readonly config = inject(COOP_UI_CONFIG);
  private readonly authService = inject(AuthService);

  usuarioLogado = computed(() => this.authService.currentUser()?.nome || 'Usuário');

  alternarBarraLateral = output<void>();

  onAlternarBarraLateral(): void {
    this.alternarBarraLateral.emit();
  }

  onLogout(): void {
    this.authService.logout();
  }
}
