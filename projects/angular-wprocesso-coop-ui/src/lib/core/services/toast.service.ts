import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { MessageService } from 'primeng/api';

interface CorpoErro {
  mensagemDesenvolvedor?: string;
  mensagemUsuario?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly messageService = inject(MessageService);

  mostrarMsgSucesso(mensagem: string): void {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: mensagem });
  }

  mostrarMsgErro(errorResponse: HttpErrorResponse | string | unknown): void {
    if (errorResponse instanceof HttpErrorResponse && errorResponse.error instanceof Blob) {
      void errorResponse.error.text().then((erro) => this.exibirMensagemErro(errorResponse, this.extrairCorpoErroTexto(erro)));
      return;
    }

    this.exibirMensagemErro(errorResponse);
  }

  private exibirMensagemErro(errorResponse: HttpErrorResponse | string | unknown, corpoBlob?: CorpoErro | null): void {
    let mensagem = 'Erro ao processar serviço remoto. Tente novamente.';

    if (typeof errorResponse === 'string') {
      mensagem = errorResponse;
    } else if (errorResponse instanceof HttpErrorResponse) {
      const corpo = corpoBlob ?? this.extrairCorpoErro(errorResponse);

      if (corpo?.mensagemUsuario) {
        mensagem = corpo.mensagemUsuario;
      } else if (errorResponse.status === 403) {
        mensagem = 'Você não tem permissão para executar esta ação';
      } else if (errorResponse.status >= 400 && errorResponse.status <= 499) {
        mensagem = 'Ocorreu um erro ao processar a sua solicitação';
      }

      if (corpo?.mensagemDesenvolvedor) {
        this.logError('Erro do desenvolvedor:', corpo.mensagemDesenvolvedor);
      } else {
        this.logError('Erro completo:', errorResponse);
      }
    }

    this.messageService.add({
      severity: 'error',
      summary: 'Erro',
      detail: mensagem,
    });
  }

  private extrairCorpoErro(errorResponse: HttpErrorResponse): CorpoErro | null {
    const erro = errorResponse.error;
    if (!erro) return null;
    if (typeof erro === 'string') {
      return this.extrairCorpoErroTexto(erro);
    }
    return erro;
  }

  private extrairCorpoErroTexto(erro: string): CorpoErro | null {
    try {
      return JSON.parse(erro);
    } catch {
      return null;
    }
  }

  mostrarMsgInfo(mensagem: string): void {
    this.messageService.add({ severity: 'info', summary: 'Info', detail: mensagem });
  }

  mostrarMsgAlerta(mensagem: string): void {
    this.messageService.add({ severity: 'warn', summary: 'Warn', detail: mensagem });
  }

  private logError(titulo: string, erro: HttpErrorResponse | unknown): void {
     
    console.error(titulo, erro);
  }
}
