import { Directive, ElementRef, forwardRef, HostListener, inject, Renderer2 } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';

const TAMANHO_FIXO = 10;
const TAMANHO_CELULAR = 11;

export function normalizarTelefone(valor: string | null | undefined): string {
  return (valor ?? '').replace(/\D/g, '').slice(0, TAMANHO_CELULAR);
}

export function formatarTelefone(valor: string | null | undefined): string {
  const digitos = normalizarTelefone(valor);

  if (digitos.length <= 2) {
    return digitos.length > 0 ? `(${digitos}` : '';
  }

  const ddd = digitos.slice(0, 2);
  const numero = digitos.slice(2);
  const tamanhoPrefixo = digitos.length > TAMANHO_FIXO ? 5 : 4;

  if (numero.length <= tamanhoPrefixo) {
    return `(${ddd}) ${numero}`;
  }
  return `(${ddd}) ${numero.slice(0, tamanhoPrefixo)}-${numero.slice(tamanhoPrefixo)}`;
}

@Directive({
  selector: 'input[appTelefoneMask]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TelefoneMaskDirective),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => TelefoneMaskDirective),
      multi: true,
    },
  ],
})
export class TelefoneMaskDirective implements ControlValueAccessor, Validator {
  private readonly elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);

  private onChange: (valor: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(valor: string | null): void {
    this.atualizarVisualizacao(valor);
  }

  registerOnChange(onChange: (valor: string) => void): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean): void {
    this.renderer.setProperty(this.elementRef.nativeElement, 'disabled', isDisabled);
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    const telefone = normalizarTelefone(valor);
    this.atualizarVisualizacao(telefone);
    this.onChange(telefone);
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouched();
  }

  private atualizarVisualizacao(valor: string | null | undefined): void {
    this.renderer.setProperty(this.elementRef.nativeElement, 'value', formatarTelefone(valor));
  }

  validate(control: AbstractControl): ValidationErrors | null {
    const valor = normalizarTelefone(control.value);
    if (!valor) return null; // vazio: deixa pro Validators.required decidir

    return valor.length === TAMANHO_FIXO || valor.length === TAMANHO_CELULAR ? null : { telefoneInvalido: true };
  }
}
