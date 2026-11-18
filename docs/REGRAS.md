# Regras da biblioteca

Somente `public-api.ts` define o que os consumidores podem importar. Mudanças na API pública exigem build da biblioteca e das duas cascas. Os clientes OpenAPI são gerados a partir dos descritores mantidos aqui; não edite seus arquivos manualmente.

As cascas são responsáveis por configuração de ambiente, rotas, menu, home, administração e registro de produtos. A biblioteca não depende de casca nem de biblioteca de área. O fluxo de entrega e o modelo para futuras bibliotecas de área estão em [BIBLIOTECAS.md](BIBLIOTECAS.md).
