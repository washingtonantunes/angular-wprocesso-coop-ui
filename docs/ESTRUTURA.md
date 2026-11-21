# Estrutura da biblioteca

`projects/angular-wprocesso-coop-ui/src/public-api.ts` é a API pública única. Em `src/lib/`, `core/` contém sessão, guards, interceptors, layout e montagem de rotas e menu de produto; `shared/` contém componentes, constantes, pipes, diretivas e o cliente OpenAPI de autenticação; `login/` contém a tela de entrada; `coop-ui.config.ts` define a configuração fornecida pela casca.

A biblioteca guarda apenas o cliente de autenticação, gerado a partir do back de segurança e restrito às operações do tag `Auth`, em `shared/services/seguranca/api/`. Ele é usado só internamente pela sessão (`AuthService` e a tela de login) e não faz parte da API pública. Os demais clientes — as outras operações de segurança e as de cadastro — são gerados em cada front que os chama, para que uma mudança de contrato de um back não obrigue a republicar a biblioteca nem a refazer o build das áreas.

A biblioteca não conhece rotas, menus de plataforma, temas, environments ou páginas iniciais das cascas. A casca fornece o menu ao componente de barra lateral e os valores de grupo, tipo, participante e URLs ao `provideCoopUi(...)`. As exposições remotas usam os tipos públicos de rota e menu da biblioteca; o carregamento por endereço fica nas cascas. Veja [MICROFRONT.md](MICROFRONT.md).
