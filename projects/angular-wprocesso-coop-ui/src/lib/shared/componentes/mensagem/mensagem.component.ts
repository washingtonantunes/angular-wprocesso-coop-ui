import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';

import { startWith } from 'rxjs';

interface ValidationMessages {
  [key: string]: string;
}

@Component({
  selector: 'app-mensagem',
  templateUrl: './mensagem.component.html',
  styleUrl: './mensagem.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MensagemComponent {
  private readonly destroyRef = inject(DestroyRef);

  readonly control = input.required<AbstractControl | null>();
  readonly customMessages = input<ValidationMessages>({});

  private readonly tick = signal(0);

  private readonly defaultMessages: ValidationMessages = {
    required: 'Campo obrigatório',
    email: 'E-mail inválido',
    min: 'Valor mínimo: {min}',
    max: 'Valor máximo: {max}',
    minlength: 'Mínimo de {requiredLength} caracteres',
    maxlength: 'Máximo de {requiredLength} caracteres',
    pattern: 'Formato inválido',
    cpfInvalido: 'CPF inválido',
    cnpjInvalido: 'CNPJ inválido',
    telefoneInvalido: 'Telefone inválido',
    nomeInvalido: 'Informe um nome válido',
    nomeComercialInvalido: 'Informe um nome comercial válido',
  };

  readonly mensagem = computed(() => {
    this.tick();
    const ctrl = this.control();
    if (!ctrl || !ctrl.errors || !ctrl.touched) {
      return null;
    }
    const errorKey = Object.keys(ctrl.errors)[0];
    const errorValue = ctrl.errors[errorKey];
    const template = this.customMessages()[errorKey] ?? this.defaultMessages[errorKey] ?? 'Campo inválido';
    return this.interpolate(template, errorValue);
  });

  constructor() {
    effect(() => {
      const ctrl = this.control();
      if (!ctrl) return;
      ctrl.events.pipe(startWith(null), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.tick.update((n) => n + 1));
    });
  }

  private interpolate(template: string, errorValue: unknown): string {
    if (!errorValue || typeof errorValue !== 'object') return template;
    let msg = template;
    for (const key of Object.keys(errorValue as Record<string, unknown>)) {
      msg = msg.replace(`{${key}}`, String((errorValue as Record<string, unknown>)[key]));
    }
    return msg;
  }
}
