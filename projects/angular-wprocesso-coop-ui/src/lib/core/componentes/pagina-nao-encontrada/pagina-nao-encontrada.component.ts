import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-pagina-nao-encontrada',
  templateUrl: './pagina-nao-encontrada.component.html',
  styleUrl: './pagina-nao-encontrada.component.css',
  imports: [CommonModule, ButtonModule],
})
export class PaginaNaoEncontradaComponent {
  private readonly router = inject(Router);

  voltarParaTelaHome(): void {
    this.router.navigate(['/home']);
  }
}
