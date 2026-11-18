# Bibliotecas Angular do wprocesso-coop

## Empacotamento

Cada biblioteca é um projeto Angular separado, gerado com Angular CLI e compilado com `ng-packagr`. A biblioteca UI tem somente o ponto de entrada principal `projects/angular-wprocesso-coop-ui/src/public-api.ts`. O comando `npm run build` gera o pacote em `dist/angular-wprocesso-coop-ui`. Consumidores importam pelo nome do pacote, nunca por caminhos internos ou arquivos `.ts` de origem. O Angular recomenda que aplicações apontem para a biblioteca compilada e usem `ng build --watch` no desenvolvimento: [Creating libraries](https://angular.dev/tools/libraries/creating-libraries).

## Desenvolvimento local e demonstração

Na primeira instalação, dentro de `angular-wprocesso-coop-ui`, execute `npm install` e `npm run build`. Depois, execute `npm install` em cada casca. O `package.json` delas usa `"angular-wprocesso-coop-ui": "file:../angular-wprocesso-coop-ui/dist/angular-wprocesso-coop-ui"`. Como a pasta está fora da casca, o npm cria um vínculo local em `node_modules`. No Windows, criar esse vínculo pode exigir o Modo de Desenvolvedor ou um terminal com permissão para links simbólicos.

Para trabalhar com a biblioteca, deixe `npm run watch` ativo nela e `npm run start:dev` ativo nas cascas desejadas. O watch recompila a biblioteca quando seus arquivos mudam. As cascas configuram `preserveSymlinks` e excluem `angular-wprocesso-coop-ui` do pré-empacotamento do servidor de desenvolvimento, para observar o pacote vinculado. Não é preciso repetir `npm install` após cada edição. Reinicie o servidor apenas se mudar a lista de dependências ou a configuração do build.

Para o build reproduzível, execute `npm run build` na UI antes de `npm run build` em cada casca. Uma biblioteca de área entra entre essas etapas: UI, área e casca. A dependência `file:` para a pasta `dist` é a forma de desenvolvimento local e de demonstração deste workspace. Em um pipeline real, as bibliotecas seriam publicadas em um repositório de pacotes interno, com versões controladas. A publicação não está implementada aqui.

## Instância única da UI

Cada casca declara a UI uma única vez em `dependencies` e chama `provideCoopUi(...)` uma única vez na configuração raiz. Bibliotecas de área declaram `angular-wprocesso-coop-ui`, `@angular/*` e PrimeNG em `peerDependencies`. Para compilar a área localmente, a UI entra também em `devDependencies` por `file:` apontando para o pacote compilado. A área não inclui a UI em `dependencies` nem a empacota. Duas cópias da UI criariam duas instâncias dos serviços de sessão; as telas do produto poderiam deixar de enxergar o login da casca. Verifique com `npm ls angular-wprocesso-coop-ui` na casca que há uma única resolução.

## Biblioteca de área

Uma área, por exemplo `angular-wprocesso-coop-credito`, tem um ponto de entrada `central` e outro `cooperativa`. As pastas `<participante>/<produto>/` exportam as rotas e os itens de menu do produto pelo respectivo ponto de entrada. A área importa somente de `angular-wprocesso-coop-ui` e de seus próprios arquivos. A casca Central importa apenas `angular-wprocesso-coop-credito/central`, e a Cooperativa apenas `angular-wprocesso-coop-credito/cooperativa`. O registro em `produtos.registro.ts` adiciona as rotas e o menu; o build da casca inclui o produto.

## Docker

O contexto é a pasta `wprocesso-coop/`, pois o Dockerfile precisa ler a biblioteca e a casca. De dentro dessa pasta:

```bash
docker build -f angular-wprocesso-coop-central/Dockerfile -t wprocesso-coop-central .
docker build -f angular-wprocesso-coop-cooperativa/Dockerfile -t wprocesso-coop-cooperativa .
```

Cada Dockerfile compila a UI em uma etapa, copia o pacote para o caminho relativo esperado pelo `file:` da casca e executa `npm ci` e `npm run build:docker` na casca. O container final contém apenas a aplicação compilada e o Nginx. Quando houver biblioteca de área, o Dockerfile compilará UI, depois área, depois casca, sempre dentro do mesmo contexto.
