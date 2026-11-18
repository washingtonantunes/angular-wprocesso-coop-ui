import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'enumFormat',
})
export class EnumFormatPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return '';
    }

    return value
      .toLowerCase() // Converte para minúsculas
      .split('_') // Divide por underscore
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Primeira letra maiúscula
      .join(' '); // Junta com espaços
  }
}
