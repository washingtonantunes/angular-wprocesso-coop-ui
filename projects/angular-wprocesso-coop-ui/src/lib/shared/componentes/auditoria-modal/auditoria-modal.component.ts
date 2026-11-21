import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, signal, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';

import { ModalLayoutComponent } from '../modal-layout/modal-layout.component';

type TipoAuditoria = 'ADD' | 'MOD' | 'DEL';

export interface RegistroAuditoria {
  tipo?: TipoAuditoria;
  dataHora?: string;
  usuario?: string;
  dados?: unknown;
}

// O componente não chama API: recebe os registros e o estado como signals e devolve a busca
// por data para quem o abre, que faz a chamada com o cliente gerado da própria aplicação.
export interface AuditoriaModalData {
  registros: Signal<RegistroAuditoria[]>;
  carregando: Signal<boolean>;
  onBuscar: (filtroData: string | null) => void;
}

@Component({
  selector: 'app-auditoria-modal',
  templateUrl: './auditoria-modal.component.html',
  styleUrl: './auditoria-modal.component.css',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DatePickerModule,
    DialogModule,
    TableModule,
    TagModule,
    ToolbarModule,
    TooltipModule,
    ModalLayoutComponent,
  ],
  providers: [DatePipe],
})
export class AuditoriaModalComponent {
  private readonly ref = inject(DynamicDialogRef);
  private readonly config = inject(DynamicDialogConfig);
  private readonly datePipe = inject(DatePipe);

  private readonly data = this.config.data as AuditoriaModalData;

  readonly auditorias = this.data.registros;
  readonly carregando = this.data.carregando;

  filtroData = signal<Date | null>(null);

  exibirDialogJson = false;
  dadosJson: unknown = null;

  onBuscar(): void {
    const dataFormatada = this.filtroData() ? (this.datePipe.transform(this.filtroData(), 'yyyy-MM-dd') ?? null) : null;
    this.data.onBuscar(dataFormatada);
  }

  onFechar(): void {
    this.ref.close();
  }

  onVerDados(dados: unknown): void {
    this.dadosJson = dados;
    this.exibirDialogJson = true;
  }

  severidadeTipo(tipo: TipoAuditoria | undefined): 'success' | 'info' | 'danger' | 'secondary' {
    switch (tipo) {
      case 'ADD':
        return 'success';
      case 'MOD':
        return 'info';
      case 'DEL':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  labelTipo(tipo: TipoAuditoria | undefined): string {
    switch (tipo) {
      case 'ADD':
        return 'Criação';
      case 'MOD':
        return 'Alteração';
      case 'DEL':
        return 'Exclusão';
      default:
        return tipo ?? '—';
    }
  }
}
