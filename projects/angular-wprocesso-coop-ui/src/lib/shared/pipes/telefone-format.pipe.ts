import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'telefoneFormat',
})
export class TelefoneFormatPipe implements PipeTransform {
  transform(valor: string | null | undefined): string {
    const digitos = (valor ?? '').replace(/\D/g, '').slice(0, 11);

    if (digitos.length <= 2) {
      return digitos.length > 0 ? `(${digitos}` : '';
    }

    const ddd = digitos.slice(0, 2);
    const numero = digitos.slice(2);
    const tamanhoPrefixo = digitos.length > 10 ? 5 : 4;

    if (numero.length <= tamanhoPrefixo) {
      return `(${ddd}) ${numero}`;
    }
    return `(${ddd}) ${numero.slice(0, tamanhoPrefixo)}-${numero.slice(tamanhoPrefixo)}`;
  }
}
