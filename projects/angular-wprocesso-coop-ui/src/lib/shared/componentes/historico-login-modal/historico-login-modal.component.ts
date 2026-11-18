import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule, TablePageEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { HistoricoLoginPaginadoResponseDto } from '../../services/seguranca/api/models';
import { UsuarioService } from '../../services/seguranca/api/services';

import { ModalLayoutComponent } from '../modal-layout/modal-layout.component';

import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-historico-login-modal',
  templateUrl: './historico-login-modal.component.html',
  imports: [CommonModule, ButtonModule, TableModule, TagModule, TooltipModule, ModalLayoutComponent],
})
export class HistoricoLoginModalComponent implements OnInit {
  private readonly ref = inject(DynamicDialogRef);
  private readonly config = inject(DynamicDialogConfig);
  private readonly usuarioService = inject(UsuarioService);
  private readonly toastService = inject(ToastService);

  usuarioId = this.config.data?.usuarioId as number;

  historicos = signal<HistoricoLoginPaginadoResponseDto[]>([]);
  carregando = signal(true);

  pagina = signal(0);
  porPagina = signal(5);
  totalRegistros = signal(0);

  ngOnInit(): void {
    this.carregarHistorico();
  }

  onFechar(): void {
    this.ref.close();
  }

  onPageChange(event: TablePageEvent): void {
    this.pagina.set(event.first / event.rows);
    this.porPagina.set(event.rows);
    this.carregarHistorico();
  }

  private carregarHistorico(): void {
    this.carregando.set(true);

    this.usuarioService
      .pesquisarHistoricosLoginPaginado({
        usuarioId: this.usuarioId,
        pageable: { page: this.pagina(), size: this.porPagina() },
      })
      .subscribe({
        next: (response) => {
          this.historicos.set(response.content ?? []);
          this.totalRegistros.set(response.totalElements ?? 0);
          this.carregando.set(false);
        },
        error: (erro: HttpErrorResponse) => {
          this.toastService.mostrarMsgErro(erro);
          this.carregando.set(false);
        },
      });
  }
}
