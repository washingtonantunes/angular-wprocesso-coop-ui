# Padrões de implementação

Componentes são standalone, declaram somente os imports necessários e usam `inject()` para DI. Estado local usa `signal()` e estado derivado usa `computed()`.

O `authGuard` valida a sessão e o tipo configurado pela casca. O `funcionalidadeGuard` atua em `canMatch`, antes do carregamento da tela, e recebe a funcionalidade exigida e, quando aplicável, o código do produto. `montarRotasDeProdutos()` aplica os dois guards às rotas declaradas pela área. `montarMenuDeProdutos()` filtra pela funcionalidade efetiva e agrupa os itens por área.

`provideCoopUi(...)` é chamado uma vez no `app.config.ts` da casca. Recebe o grupo enviado no login, o tipo aceito, o nome exibido e os endereços base dos backs, obtidos do environment da casca. Ele registra as configurações dos dois clientes gerados. Nenhum endereço de ambiente é fixado na biblioteca.

Chamadas de API usam os serviços gerados. Para um valor com exibição e entrada, use o pipe e a diretiva correspondentes. A lógica de máscara não fica no componente.
