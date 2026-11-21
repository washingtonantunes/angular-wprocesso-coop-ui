# angular-wprocesso-coop-ui

Biblioteca Angular comum às cascas Central e Cooperativa e às aplicações remotas de área do wprocesso-coop. Reúne sessão, login, guards, interceptors, layout, componentes, pipes, diretivas, constantes e o cliente gerado da API de autenticação. Os demais clientes de API são gerados em cada front que os chama.

## Uso

```bash
npm install
npm run build
```

O pacote compilado fica em `dist/angular-wprocesso-coop-ui`. Todo consumidor importa apenas de `angular-wprocesso-coop-ui`, sua API pública única. As cascas configuram grupo, tipo, rótulo e URLs dos backs com `provideCoopUi(...)`.

## Documentação

- [docs/MICROFRONT.md](docs/MICROFRONT.md): contrato das exposições, configuração, execução e publicação independente das áreas.

| Documento                                  | Conteúdo                                                      |
| ------------------------------------------ | ------------------------------------------------------------- |
| [docs/BIBLIOTECAS.md](docs/BIBLIOTECAS.md) | Empacotamento e consumo local da UI                           |
| [docs/AMBIENTE.md](docs/AMBIENTE.md)       | Instalação, build, watch e geração do cliente de autenticação |
| [docs/ESTRUTURA.md](docs/ESTRUTURA.md)     | Estrutura e API pública                                       |
| [docs/PADROES.md](docs/PADROES.md)         | Convenções de implementação e configuração                    |
| [docs/LAYOUT.md](docs/LAYOUT.md)           | Layout e componentes comuns                                   |
| [docs/PRIMENG.md](docs/PRIMENG.md)         | PrimeNG e PrimeFlex                                           |
| [docs/REGRAS.md](docs/REGRAS.md)           | Regras de manutenção                                          |
