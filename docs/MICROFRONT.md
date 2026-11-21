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

As telas de uma área rodam na página da casca e chamam os backs pela origem dela, com caminhos relativos `/api/coop-<back>`. O encaminhamento desses caminhos para cada back é configuração de ambiente da casca, não código: no desenvolvimento local fica em `proxy.local.conf.json` de cada casca; no Docker, o servidor web da casca é montado pelo Compose a partir de `docker-wprocesso-coop/nginx/front-<casca>.conf`, sem rebuild da imagem (a imagem mantém um `nginx.conf` padrão, para rodar sem o Compose). Incluir uma área é, portanto, **duas configurações de ambiente por casca**: a entrada no arquivo de endereços (acima) e a rota do back da área nesse encaminhamento. A área aponta o `rootUrl` dos clientes gerados para esses caminhos relativos; o motivo e a forma estão em `docs/PADROES.md` do crédito.

## Subcaminhos e carga tardia no mapa de compartilhamento

Regra geral: **todo módulo que o runtime carrega por import dinâmico precisa estar, nominalmente, no `shared` do `federation.config.js`.** O `shareAll` compartilha cada pacote só pelo entry principal (`.`), e o `ignoreUnusedDeps` (que produz o log `Removed unused dependencies`) ainda remove do mapa o que nenhum arquivo importa estaticamente. Um subcaminho (`pacote/algo`) ou um secondary carregado só em tempo de execução cai fora do mapa: o `npm run build` passa, mas a federação não resolve o specifier no runtime e falha com `Unable to resolve specifier '<specifier>'` ou `Failed to resolve module specifier '<specifier>'`. Declarar o specifier no `shared` o mantém no mapa mesmo sem import estático; confira sempre que ele aparece em `dist/<aplicacao>/browser/remoteEntry.json`.

Casos existentes:

- **Locale (só nas cascas).** Cada casca importa `@angular/common/locales/pt` e chama `registerLocaleData` no `app.config.ts` para fixar `pt-BR`. O `shared` espalha `...shareAngularLocales(['pt'])`, helper do pacote de config do Native Federation que registra o locale e seus submódulos. Para outro locale (ex.: `en`), importe-o no `app.config.ts` e inclua a sigla: `shareAngularLocales(['pt', 'en'])`. A área `angular-wprocesso-coop-credito` não importa locale e não precisa do helper.
- **Preset do tema PrimeNG (só nas cascas).** O tema da casca (`src/themes/coop-*.ts`) faz `import Aura from '@primeuix/themes/aura'`. O `shared` espalha `...share({ '@primeuix/themes/aura': singleton })`, que resolve esse subcaminho e os seus (como `/tokens`). Para usar outro preset (ex.: `lara`), troque o import no tema e o specifier aqui.
- **Engine de animações (nas cascas e no crédito).** As cascas usam `provideAnimationsAsync`, que carrega `@angular/animations/browser` sob demanda (por exemplo ao abrir/fechar um painel do `p-panelmenu` dentro do `p-drawer`). O `shared` espalha `...share({ '@angular/animations': { ...singleton, includeSecondaries: { keepAll: true } } })`: o `keepAll` é obrigatório para preservar esse secondary (que não tem import estático) no `remoteEntry.json`; sem ele o PrimeNG fica sem engine de animação e os painéis do menu não fecham. Mantém-se `provideAnimationsAsync`; não se troca para `provideAnimations`. Os três projetos declaram isto de forma idêntica.

Em todos mantém-se o `shareAll` com o override da UI; os helpers e o `share` apenas acrescentam specifiers ao mapa.

## Criar uma área

1. Crie `angular-wprocesso-coop-<area>` como aplicação Angular 20.3 com Native Federation 20.3.12, seguindo `angular-wprocesso-coop-credito`.
2. Use a UI compilada pela API pública. Declare Angular, PrimeNG, RxJS e UI nas mesmas versões da plataforma. A área não chama `provideCoopUi` quando carregada pela casca.
3. Organize cada produto em `src/app/central/<produto>/` e `src/app/cooperativa/<produto>/`. Exporte as listas de rotas e menu pelas duas exposições. Não importe código de casca nem de outra área. Dê **nomes de arquivo distintos** aos componentes que as duas exposições carregam por `loadComponent` (ex.: `operacao-lista-central.component.ts` e `operacao-lista-cooperativa.component.ts`, não o mesmo `operacao-lista.component.ts` nas duas): no build de produção o chunk de carga tardia é chaveado pelo nome do arquivo, então dois arquivos de mesmo nome em exposições diferentes colidem e só um é registrado no `remoteEntry.json`. A exposição cujo chunk não foi registrado falha no runtime com `Unable to resolve specifier '@nf-internal/<arquivo>-<hash>'` (em `ng serve` não aparece, porque o dev usa os entryPoints direto).
4. Gere os clientes dos backs que a área chama, o back da área e os de plataforma de que precisar, a partir do descritor do back real. A UI não expõe mais os clientes de segurança e cadastro.
5. Rode `npm run build`, confira os pacotes compartilhados em `dist/<aplicacao>/browser/remoteEntry.json` e teste os dois participantes e os guards.
6. Publique os arquivos do build da área em um serviço próprio. Em cada casca, acrescente as duas configurações de ambiente: a entrada no arquivo de endereços e a rota do back da área no encaminhamento (`proxy.local.conf.json` no local, `docker-wprocesso-coop/nginx/front-<casca>.conf` no Docker). Publique futuras correções substituindo apenas o front da área; use nomes de arquivo com hash para os chunks e sirva `remoteEntry.json` sem cache.

## Desenvolvimento local e Docker

Na pasta da UI, execute `npm run build` uma vez e depois `npm run watch`. Em terminais separados, execute `npm run start:dev` em `angular-wprocesso-coop-credito` (4202), `angular-wprocesso-coop-central` (4200) e `angular-wprocesso-coop-cooperativa` (4201). Os backs de segurança e cadastro usam 8080 e 8081. Uma alteração na área recompila somente seu servidor; recarregue a casca no navegador para ler a exposição atualizada.

De `wprocesso-coop/docker-wprocesso-coop/`, `docker compose up --build -d` sobe MySQL, Redis, os três backs e os três fronts. Para publicar somente uma correção do Crédito, execute `docker compose up -d --build --no-deps front-credito`. As imagens das cascas permanecem as mesmas. O Dockerfile da área compila a UI como dependência de build; a federação compartilha a instância da UI em execução com a casca.
