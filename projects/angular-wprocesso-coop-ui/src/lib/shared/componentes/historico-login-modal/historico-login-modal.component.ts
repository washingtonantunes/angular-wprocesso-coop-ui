import { CommonModule } from '@angular/common';
import { Component, inject, signal, Signal } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule, TablePageEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { ModalLayoutComponent } from '../modal-layout/modal-layout.component';

export interface RegistroHistoricoLogin {
  dataHora?: string;
  sucesso?: boolean;
  ip?: string;
}

// O componente não chama API: recebe a página de registros e o estado como signals e devolve
// a troca de página para quem o abre, que faz a chamada com o cliente gerado da própria aplicação.
export interface HistoricoLoginModalData {
  registros: Signal<RegistroHistoricoLogin[]>;
  carregando: Signal<boolean>;
  total: Signal<number>;
  onPagina: (pagina: number, porPagina: number) => void;
}

@Component({
  selector: 'app-historico-login-modal',
  templateUrl: './historico-login-modal.component.html',
  imports: [CommonModule, ButtonModule, TableModule, TagModule, TooltipModule, ModalLayoutComponent],
})
export class HistoricoLoginModalComponent {
  private readonly ref = inject(DynamicDialogRef);
  private readonly config = inject(DynamicDialogConfig);

  private readonly data = this.config.data as HistoricoLoginModalData;

  readonly historicos = this.data.registros;
  readonly carregando = this.data.carregando;
  readonly totalRegistros = this.data.total;

  porPagina = signal(5);

  onFechar(): void {
    this.ref.close();
  }

  onPageChange(event: TablePageEvent): void {
    const pagina = event.first / event.rows;
    this.porPagina.set(event.rows);
    this.data.onPagina(pagina, event.rows);
  }
}
