import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'documentoFormat',
})
export class DocumentoFormatPipe implements PipeTransform {
  transform(valor: string | null | undefined): string {
    const documento = (valor ?? '').toUpperCase().replace(/[^0-9A-Z]/g, '');

    if (/^\d*$/.test(documento) && documento.length <= 11) {
      return documento
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }

    return documento
      .replace(/(.{2})(.{1,3})/, '$1.$2')
      .replace(/(.{2})\.(.{3})(.{1,3})/, '$1.$2.$3')
      .replace(/(.{2})\.(.{3})\.(.{3})(.{1,4})/, '$1.$2.$3/$4')
      .replace(/(\/\w{4})(\w{1,2})$/, '$1-$2');
  }
}
