# Estrutura da biblioteca

`projects/angular-wprocesso-coop-ui/src/public-api.ts` é a API pública única. Em `src/lib/`, `core/` contém sessão, guards, interceptors, layout e montagem de rotas e menu de produto; `shared/` contém componentes, constantes, pipes, diretivas e clientes OpenAPI; `login/` contém a tela de entrada; `coop-ui.config.ts` define a configuração fornecida pela casca.

Os clientes gerados continuam separados por back em `shared/services/seguranca/api/` e `shared/services/cadastro/api/`. A API pública os expõe como `SegurancaModels`, `SegurancaServices`, `CadastroModels` e `CadastroServices`, evitando colisões entre nomes dos dois contratos. Nenhum consumidor importa o caminho interno.

A biblioteca não conhece rotas, menus de plataforma, temas, environments ou páginas iniciais das cascas. A casca fornece o menu ao componente de barra lateral e os valores de grupo, tipo, participante e URLs ao `provideCoopUi(...)`.
