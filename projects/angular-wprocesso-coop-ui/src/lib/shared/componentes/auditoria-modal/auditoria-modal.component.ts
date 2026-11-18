import { CommonModule, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';

import { AuditoriaResponseDto } from '../../services/seguranca/api/models';
import { AuditoriaService } from '../../services/seguranca/api/services';

import { ModalLayoutComponent } from '../modal-layout/modal-layout.component';

import { ToastService } from '../../../core/services/toast.service';

type TipoAuditoria = 'ADD' | 'MOD' | 'DEL';

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
export class AuditoriaModalComponent implements OnInit {
  private readonly ref = inject(DynamicDialogRef);
  private readonly config = inject(DynamicDialogConfig);
  private readonly auditoriaService = inject(AuditoriaService);
  private readonly toastService = inject(ToastService);
  private readonly datePipe = inject(DatePipe);

  entidade = this.config.data?.entidade as string;
  id = this.config.data?.id as number;

  auditorias = signal<AuditoriaResponseDto[]>([]);
  carregando = signal(false);
  filtroData = signal<Date | null>(null);

  exibirDialogJson = false;
  dadosJson: unknown = null;

  ngOnInit(): void {
    this.carregarAuditoria();
  }

  onBuscar(): void {
    this.carregarAuditoria();
  }

  onLimparData(): void {
    this.filtroData.set(null);
    this.carregarAuditoria();
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

  private carregarAuditoria(): void {
    this.carregando.set(true);

    const dataFormatada = this.filtroData() ? (this.datePipe.transform(this.filtroData(), 'yyyy-MM-dd') ?? undefined) : undefined;

    this.auditoriaService
      .buscarAuditoria({
        dto: {
          entidade: this.entidade,
          id: this.id,
          data: dataFormatada,
        },
      })
      .subscribe({
        next: (response) => {
          this.auditorias.set(response);
          this.carregando.set(false);
        },
        error: (erro: HttpErrorResponse) => {
          this.toastService.mostrarMsgErro(erro);
          this.carregando.set(false);
        },
      });
  }
}
