import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { finalize } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

import { AuthService } from '../core/services/auth.service';
import { ToastService } from '../core/services/toast.service';
import { COOP_UI_CONFIG } from '../coop-ui.config';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  imports: [ReactiveFormsModule, ButtonModule, CardModule, InputTextModule, PasswordModule],
})
export class LoginComponent {
  readonly config = inject(COOP_UI_CONFIG);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  carregando = signal(false);

  formulario: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required],
  });

  onEntrar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.carregando.set(true);

    const { email, senha } = this.formulario.getRawValue();

    this.authService
      .login(email, senha)
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (sessao) => {
          if (sessao.tipo !== this.config.tipo) {
            this.authService.limparSessao();
            this.toastService.mostrarMsgAlerta(`Este acesso é exclusivo de usuários da ${this.config.participante}`);
            return;
          }
          this.router.navigate(['/home']);
        },
        error: (erro: HttpErrorResponse) => {
          this.toastService.mostrarMsgErro(erro);
        },
      });
  }
}
