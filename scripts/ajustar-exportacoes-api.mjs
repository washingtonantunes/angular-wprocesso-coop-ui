// O ng-openapi-gen reexporta os modelos com `export { X }`. Com isolatedModules,
// exigido pelo build do Angular, a reexportação de um tipo precisa ser
// `export type { X }`. Este script ajusta o models.ts de cada cliente gerado,
// preservando a exportação de valor para os modelos que são enum.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const RAIZ = 'projects/angular-wprocesso-coop-ui/src/lib/shared/services';

for (const servico of readdirSync(RAIZ)) {
  const arquivo = join(RAIZ, servico, 'api', 'models.ts');
  if (!existsSync(arquivo)) continue;

  const ajustado = readFileSync(arquivo, 'utf8').replace(/^export \{ (\w+) \} from '(.+)';$/gm, (linha, nome, caminho) => {
    const modelo = readFileSync(join(dirname(arquivo), `${caminho}.ts`), 'utf8');
    return /export enum /.test(modelo) ? linha : `export type { ${nome} } from '${caminho}';`;
  });

  writeFileSync(arquivo, ajustado);
  console.log(`Exportações ajustadas em ${arquivo}`);
}
