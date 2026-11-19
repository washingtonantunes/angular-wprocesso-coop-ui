# Regras da biblioteca

Somente `public-api.ts` define o que os consumidores podem importar. Mudanças na API pública exigem build da biblioteca e das duas cascas. Os clientes OpenAPI são gerados a partir dos descritores mantidos aqui; não edite seus arquivos manualmente.

As cascas são responsáveis por configuração de ambiente, rotas, menu, home, administração e carregamento das aplicações de área. A biblioteca não depende de casca nem de aplicação remota. O contrato e o fluxo de publicação das áreas estão em [MICROFRONT.md](MICROFRONT.md).
