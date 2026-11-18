import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { COOP_UI_CONFIG } from '../../coop-ui.config';

import { map, Observable } from 'rxjs';

import { TokenResponseDto } from '../../shared/services/seguranca/api/models/token-response-dto';
import { AuthService as SegurancaAuthService } from '../../shared/services/seguranca/api/services/auth.service';

export type TipoPerfil = 'CENTRAL' | 'COOPERATIVA';

export interface SessaoUsuario {
  nome: string;
  tipo: TipoPerfil;
  cooperativaId: number | null;
  funcionalidades: string[];
  atributos: Record<string, string>;
}

const STORAGE_TOKEN_KEY = 'wprocesso_token';
const STORAGE_SESSAO_KEY = 'wprocesso_sessao';
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const EVENTOS_INTERACAO = ['click', 'keydown', 'scroll', 'touchstart'];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly config = inject(COOP_UI_CONFIG);
  private readonly router = inject(Router);
  private readonly segurancaAuthService = inject(SegurancaAuthService);

  currentUser = signal<SessaoUsuario | null>(null);

  estaAutenticado = computed(() => this.currentUser() !== null);

  private timerExpiracao?: ReturnType<typeof setTimeout>;
  private timerIdle?: ReturnType<typeof setTimeout>;
  private listenerIdle?: () => void;

  temFuncionalidade(codigo: string): boolean {
    return this.currentUser()?.funcionalidades.includes(codigo) ?? false;
  }

  // A autorização de funcionalidades de produto já vem calculada no login pelo back.
  temAcessoProduto(_produtoCodigo: string): boolean {
    return true;
  }

  // O login informa o grupo deste front, e o back devolve só as funcionalidades dele.
  login(email: string, senha: string): Observable<SessaoUsuario> {
    return this.segurancaAuthService
      .login({ body: { email, senha, grupo: this.config.grupo } })
      .pipe(map((response) => this.salvarSessao(response)));
  }

  salvarSessao(response: TokenResponseDto): SessaoUsuario {
    const sessao: SessaoUsuario = {
      nome: response.nome,
      tipo: response.tipo,
      cooperativaId: response.cooperativaId ?? null,
      funcionalidades: response.funcionalidades,
      atributos: response.atributos ?? {},
    };
    localStorage.setItem(STORAGE_TOKEN_KEY, response.token);
    localStorage.setItem(STORAGE_SESSAO_KEY, JSON.stringify(sessao));
    this.currentUser.set(sessao);
    this.agendarExpiracao(response.token);
    this.iniciarIdleTimeout();
    return sessao;
  }

  carregarSessao(): void {
    const token = this.getToken();
    const sessaoJson = localStorage.getItem(STORAGE_SESSAO_KEY);

    if (!token || !sessaoJson) {
      this.limparSessao();
      return;
    }

    const expiraEm = this.obterExpiracaoMs(token);
    if (expiraEm === null || expiraEm <= Date.now()) {
      this.limparSessao();
      return;
    }

    try {
      this.currentUser.set(JSON.parse(sessaoJson) as SessaoUsuario);
      this.agendarExpiracao(token);
      this.iniciarIdleTimeout();
    } catch {
      this.limparSessao();
    }
  }

  getToken(): string | null {
    return localStorage.getItem(STORAGE_TOKEN_KEY);
  }

  logout(): void {
    this.limparSessao();
    this.router.navigate(['/login']);
  }

  limparSessao(): void {
    this.cancelarTimerExpiracao();
    this.pararIdleTimeout();
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_SESSAO_KEY);
    this.currentUser.set(null);
  }

  private obterExpiracaoMs(token: string): number | null {
    try {
      const payloadBase64 = token.split('.')[1];
      const json = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(json) as { exp?: number };
      return payload.exp ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  }

  private agendarExpiracao(token: string): void {
    this.cancelarTimerExpiracao();

    const expiraEm = this.obterExpiracaoMs(token);
    if (expiraEm === null) {
      return;
    }

    const restanteMs = expiraEm - Date.now();
    if (restanteMs <= 0) {
      this.expirarSessao();
      return;
    }

    this.timerExpiracao = setTimeout(() => this.expirarSessao(), restanteMs);
  }

  private expirarSessao(): void {
    this.limparSessao();
    this.router.navigate(['/login']);
  }

  private cancelarTimerExpiracao(): void {
    if (this.timerExpiracao) {
      clearTimeout(this.timerExpiracao);
      this.timerExpiracao = undefined;
    }
  }

  private iniciarIdleTimeout(): void {
    this.pararIdleTimeout();
    const listener = (): void => this.resetarIdleTimeout();
    this.listenerIdle = listener;
    EVENTOS_INTERACAO.forEach((evt) => document.addEventListener(evt, listener, { passive: true }));
    this.resetarIdleTimeout();
  }

  private resetarIdleTimeout(): void {
    if (this.timerIdle) {
      clearTimeout(this.timerIdle);
    }
    this.timerIdle = setTimeout(() => this.logout(), IDLE_TIMEOUT_MS);
  }

  private pararIdleTimeout(): void {
    if (this.timerIdle) {
      clearTimeout(this.timerIdle);
      this.timerIdle = undefined;
    }
    if (this.listenerIdle) {
      const listener = this.listenerIdle;
      EVENTOS_INTERACAO.forEach((evt) => document.removeEventListener(evt, listener));
      this.listenerIdle = undefined;
    }
  }
}
