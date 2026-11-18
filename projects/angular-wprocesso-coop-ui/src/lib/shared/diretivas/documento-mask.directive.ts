import { Directive, ElementRef, forwardRef, HostListener, inject, Renderer2 } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';

export function normalizarDocumento(valor: string | null | undefined): string {
  return (valor ?? '')
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, '')
    .slice(0, 14);
}

function formatarCpf(documento: string): string {
  return documento
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatarCnpj(documento: string): string {
  return documento
    .replace(/(.{2})(.{1,3})/, '$1.$2')
    .replace(/(.{2})\.(.{3})(.{1,3})/, '$1.$2.$3')
    .replace(/(.{2})\.(.{3})\.(.{3})(.{1,4})/, '$1.$2.$3/$4')
    .replace(/(\/\w{4})(\w{1,2})$/, '$1-$2');
}

export function formatarDocumento(valor: string | null | undefined): string {
  const documento = normalizarDocumento(valor);
  const temLetra = /[A-Z]/.test(documento);

  if (!temLetra && documento.length <= 11) {
    return formatarCpf(documento);
  }
  return formatarCnpj(documento);
}

export function validarCpf(cpf: string): boolean {
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const calcularDv = (base: string, pesoInicial: number): number => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) {
      soma += parseInt(base[i], 10) * (pesoInicial - i);
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const dv1 = calcularDv(cpf.slice(0, 9), 10);
  const dv2 = calcularDv(cpf.slice(0, 10), 11);
  return dv1 === parseInt(cpf[9], 10) && dv2 === parseInt(cpf[10], 10);
}

export function validarCnpj(cnpj: string): boolean {
  if (cnpj.length !== 14) return false;
  // DVs (últimos 2) precisam ser numéricos
  if (!/^\d{2}$/.test(cnpj.slice(12))) return false;
  // Rejeita sequências repetidas (ex: 00000000000000)
  if (/^(.)\1{13}$/.test(cnpj)) return false;

  const valor = (c: string): number => c.charCodeAt(0) - 48;

  const calcularDv = (base: string): number => {
    const pesos = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let soma = 0;
    for (let i = 0; i < base.length; i++) {
      soma += valor(base[i]) * pesos[i];
    }
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const dv1 = calcularDv(cnpj.slice(0, 12));
  const dv2 = calcularDv(cnpj.slice(0, 13));
  return dv1 === parseInt(cnpj[12], 10) && dv2 === parseInt(cnpj[13], 10);
}

export function validarDocumento(valor: string | null | undefined): boolean {
  const doc = normalizarDocumento(valor);
  const temLetra = /[A-Z]/.test(doc);
  return temLetra ? validarCnpj(doc) : doc.length === 11 ? validarCpf(doc) : validarCnpj(doc);
}

@Directive({
  selector: 'input[appDocumentoMask]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DocumentoMaskDirective),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DocumentoMaskDirective),
      multi: true,
    },
  ],
})
export class DocumentoMaskDirective implements ControlValueAccessor, Validator {
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
    const documento = normalizarDocumento(valor);
    this.atualizarVisualizacao(documento);
    this.onChange(documento);
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouched();
  }

  private atualizarVisualizacao(valor: string | null | undefined): void {
    this.renderer.setProperty(this.elementRef.nativeElement, 'value', formatarDocumento(valor));
  }

  validate(control: AbstractControl): ValidationErrors | null {
    const valor = normalizarDocumento(control.value);
    if (!valor) return null; // vazio: deixa pro Validators.required decidir

    const temLetra = /[A-Z]/.test(valor);
    if (temLetra || valor.length > 11) {
      return validarCnpj(valor) ? null : { cnpjInvalido: true };
    }
    return validarCpf(valor) ? null : { cpfInvalido: true };
  }
}
