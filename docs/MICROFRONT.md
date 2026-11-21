# Fronts de área carregados em tempo de execução

## Ferramenta e contrato

As cascas e as áreas usam `@angular-architects/native-federation-v4@20.3.12` com Angular 20.3 e o builder de aplicação baseado em esbuild. O adaptador delega ao ApplicationBuilder do Angular; veja a [documentação oficial](https://github.com/native-federation/angular-adapter#versions) e a [documentação do runtime](https://native-federation.com/docs/v4/angular-adapter/runtime/). O pacote 20.3.12 usa `@softarc/native-federation-orchestrator@4.0.0` para inicialização e carregamento.

Cada aplicação de área publica `remoteEntry.json` e duas exposições, `./central` e `./cooperativa`. Cada exposição exporta `ROTAS_PRODUTOS: RotaProduto[]` e `MENU_PRODUTOS: ItemMenuProduto[]`, tipos da API pública da UI. Cada rota declara `path`, `funcionalidade`, `produtoCodigo` e `loadComponent`; cada item declara `area`, `label`, `icon`, `routerLink`, `funcionalidade` e `produtoCodigo`. A casca aplica `authGuard` e `funcionalidadeGuard` em `canMatch` antes de carregar a página, e filtra o menu pelas funcionalidades do login. A exposição pode ser lida ao iniciar a casca; o código da página permanece em um chunk carregado somente após o guard.

## Configuração da casca

Cada casca lê `microfronts.config.json` antes do bootstrap. O JSON mapeia um nome de área ao URL de seu `remoteEntry.json`:

```json
{
  "credito": "http://localhost:4202/remoteEntry.json"
}
```

Em Docker local, o arquivo servido pela casca aponta para `http://localhost:4202/remoteEntry.json`. O Compose monta `microfronts.docker.config.json` como arquivo externo da casca. O endereço precisa ser acessível pelo navegador; em outro servidor, substitua `localhost` pelo URL público da área. O remoto serve seus arquivos com CORS. Para acrescentar uma área, publique seu remoto e acrescente uma entrada ao JSON montado em cada casca. Essa alteração de configuração dispensa build da casca. O arquivo é servido sem cache. A URL do back de segurança usada pela autenticação continua vindo do environment da casca e é fornecida à UI por `provideCoopUi(...)`. Cada casca gera e configura os próprios clientes de segurança e cadastro, com as URLs do seu environment.

Antes de inicializar a federação, a casca lê cada `remoteEntry.json` com limite de cinco segundos e compara as versões de `@angular/core`, `primeng/config`, `rxjs` e `angular-wprocesso-coop-ui` com as suas. Uma área indisponível ou incompatível é registrada no console e omitida do menu e das rotas. A casca continua funcionando. O manifesto federado marca os pacotes compartilhados como `singleton` e `strictVersion`; os artefatos de casca e área devem usar a mesma versão da UI e dos pacotes de plataforma.

## Subcaminhos e carga tardia no mapa de compartilhamento

Regra geral: **todo módulo que o runtime carrega por import dinâmico precisa estar, nominalmente, no `shared` do `federation.config.js`.** O `shareAll` compartilha cada pacote só pelo entry principal (`.`), e o `ignoreUnusedDeps` (que produz o log `Removed unused dependencies`) ainda remove do mapa o que nenhum arquivo importa estaticamente. Um subcaminho (`pacote/algo`) ou um secondary carregado só em tempo de execução cai fora do mapa: o `npm run build` passa, mas a federação não resolve o specifier no runtime e falha com `Unable to resolve specifier '<specifier>'` ou `Failed to resolve module specifier '<specifier>'`. Declarar o specifier no `shared` o mantém no mapa mesmo sem import estático; confira sempre que ele aparece em `dist/<aplicacao>/browser/remoteEntry.json`.

Casos existentes:

- **Locale (só nas cascas).** Cada casca importa `@angular/common/locales/pt` e chama `registerLocaleData` no `app.config.ts` para fixar `pt-BR`. O `shared` espalha `...shareAngularLocales(['pt'])`, helper do pacote de config do Native Federation que registra o locale e seus submódulos. Para outro locale (ex.: `en`), importe-o no `app.config.ts` e inclua a sigla: `shareAngularLocales(['pt', 'en'])`. A área `angular-wprocesso-coop-credito` não importa locale e não precisa do helper.
- **Preset do tema PrimeNG (só nas cascas).** O tema da casca (`src/themes/coop-*.ts`) faz `import Aura from '@primeuix/themes/aura'`. O `shared` espalha `...share({ '@primeuix/themes/aura': singleton })`, que resolve esse subcaminho e os seus (como `/tokens`). Para usar outro preset (ex.: `lara`), troque o import no tema e o specifier aqui.
- **Engine de animações (nas cascas e no crédito).** As cascas usam `provideAnimationsAsync`, que carrega `@angular/platform-browser/animations/async`, e este importa dinamicamente `@angular/animations/browser` quando a primeira animação dispara — por exemplo ao abrir/fechar um painel do `p-panelmenu` dentro do `p-drawer`. Esse secondary não tem import estático, então o `ignoreUnusedDeps` o removia do mapa: sem ele, o PrimeNG fica sem engine, os painéis já aparecem abertos e não fecham. O `shared` espalha `...share({ '@angular/animations': { ...singleton, includeSecondaries: { keepAll: true } } })`. O `keepAll` é necessário: com `includeSecondaries: true` o Native Federation expande os secondaries mas descarta a marca, e o passo de remoção de dependências não usadas poda `@angular/animations/browser` de novo; só `includeSecondaries: { keepAll: true }` mantém a marca e preserva o secondary no `remoteEntry.json` mesmo sem import estático. Mantém-se `provideAnimationsAsync` (carga tardia preservada, como no seguros); não se troca para `provideAnimations`. Os três projetos declaram isto de forma idêntica para que o singleton resolva independentemente da ordem de carga.

Em todos mantém-se o `shareAll` com o override da UI; os helpers e o `share` apenas acrescentam specifiers ao mapa.

## Criar uma área

1. Crie `angular-wprocesso-coop-<area>` como aplicação Angular 20.3 com Native Federation 20.3.12, seguindo `angular-wprocesso-coop-credito`.
2. Use a UI compilada pela API pública. Declare Angular, PrimeNG, RxJS e UI nas mesmas versões da plataforma. A área não chama `provideCoopUi` quando carregada pela casca.
3. Organize cada produto em `src/app/central/<produto>/` e `src/app/cooperativa/<produto>/`. Exporte as listas de rotas e menu pelas duas exposições. Não importe código de casca nem de outra área.
4. Gere os clientes dos backs que a área chama — o back da área e os de plataforma de que precisar — a partir do descritor do back real. A UI não expõe mais os clientes de segurança e cadastro.
5. Rode `npm run build`, confira os pacotes compartilhados em `dist/<aplicacao>/browser/remoteEntry.json` e teste os dois participantes e os guards.
6. Publique os arquivos do build da área em um serviço próprio. Configure os endereços nos JSONs das cascas. Publique futuras correções substituindo apenas o front da área; use nomes de arquivo com hash para os chunks e sirva `remoteEntry.json` sem cache.

## Desenvolvimento local e Docker

Na pasta da UI, execute `npm run build` uma vez e depois `npm run watch`. Em terminais separados, execute `npm run start:dev` em `angular-wprocesso-coop-credito` (4202), `angular-wprocesso-coop-central` (4200) e `angular-wprocesso-coop-cooperativa` (4201). Os backs de segurança e cadastro usam 8080 e 8081. Uma alteração na área recompila somente seu servidor; recarregue a casca no navegador para ler a exposição atualizada.

De `wprocesso-coop/`, `docker compose -f compose.microfront.yaml up --build -d` sobe os backs em H2 e os três fronts. Para publicar somente uma correção do Crédito, execute `docker compose -f compose.microfront.yaml build credito` e `docker compose -f compose.microfront.yaml up -d --no-deps credito`. As imagens das cascas permanecem as mesmas. O Dockerfile da área compila a UI como dependência de build; a federação compartilha a instância da UI em execução com a casca.
