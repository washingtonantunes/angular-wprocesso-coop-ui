# Biblioteca comum Angular

`angular-wprocesso-coop-ui` é compilada com `ng-packagr`. Sua única API pública é `projects/angular-wprocesso-coop-ui/src/public-api.ts`. Casca e remoto importam pelo nome `angular-wprocesso-coop-ui`, sem caminhos internos. O Angular recomenda consumir o pacote compilado e usar o build em modo watch durante o desenvolvimento: [Creating libraries](https://angular.dev/tools/libraries/creating-libraries).

## Compilar e consumir

Na primeira instalação, execute `npm install` e `npm run build` nesta pasta. O cliente de autenticação é gerado antes do build. Depois, instale as dependências das cascas e do front de área. Para acompanhar alterações da UI sem repetir comandos, mantenha `npm run watch` nesta pasta e `npm run start:dev` em cada aplicação desejada.

As aplicações do exemplo usam `file:../angular-wprocesso-coop-ui/dist/angular-wprocesso-coop-ui` durante o desenvolvimento local e a demonstração. Em um pipeline real, a plataforma publicaria versões da UI em um repositório de pacotes interno. Essa publicação não está implementada. As aplicações remotas têm builds e publicações próprios; as cascas não declaram dependência de pacote para uma área.

## Instância única

A casca registra `provideCoopUi(...)` uma vez. O Native Federation compartilha Angular, PrimeNG, RxJS e a UI com o remoto. A aplicação de área precisa da UI para compilar, mas não registra outra sessão. Duas cópias da UI criariam dois serviços de sessão, e a tela de produto poderia não enxergar o login da casca. As versões instaladas de casca e área devem coincidir. A casca compara as versões dos pacotes compartilhados em `remoteEntry.json` e ignora uma área incompatível. Confira também os manifestos gerados, o `npm ls angular-wprocesso-coop-ui` e a página de prova, que exibe o usuário da sessão da casca.

O contrato de exposições, a configuração por ambiente, os comandos de execução e a publicação de uma área estão em [MICROFRONT.md](MICROFRONT.md).
