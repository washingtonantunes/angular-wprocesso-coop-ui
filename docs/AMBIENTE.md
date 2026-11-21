# Ambiente e execução

Angular 20, TypeScript 5.9, PrimeNG 20 e `ng-openapi-gen`. A versão exata de cada dependência está em `package.json` e `package-lock.json`.

```bash
npm install
npm run build
npm run watch
```

`npm run build` e `npm run watch` geram o cliente OpenAPI de autenticação antes da compilação. Assim, uma instalação limpa consegue criar o pacote sem passos manuais extras. `npm run watch` recompila o pacote `dist/` enquanto o servidor de uma casca está ativo. O projeto é uma biblioteca e não possui `ng serve` próprio.

O contrato OpenAPI de autenticação fica em `projects/angular-wprocesso-coop-ui/src/lib/shared/services/seguranca/apidescriptor/`. Atualize o descritor a partir do `/v3/api-docs` do back de segurança e execute `npm run generate:seguranca` ou `npm run generate:full`. A geração é restrita às operações do tag `Auth`. Os arquivos em `api/` são gerados e não devem ser editados. O script ajusta reexportações de tipos após a geração.
