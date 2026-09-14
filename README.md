# Employee Documents API

API RESTful para gerenciamento do fluxo de documentação de colaboradores. Cada colaborador é vinculado a tipos de documentos obrigatórios, gerando pendências que são resolvidas através do envio de documentos, com histórico de versões e apenas uma versão ativa por vez.

## Stack

Node.js, TypeScript, NestJS 12, Prisma 7 (com driver adapter para PostgreSQL), PostgreSQL, Passport com JWT, class-validator, Pino, Terminus, Vitest.

## Como rodar

1. Copie `.env.example` para `.env` e ajuste `DATABASE_URL` para um banco PostgreSQL local.
2. Instale as dependências: `npm install`.
3. Aplique as migrations e gere o client do Prisma: `npm run db:migrate`.
4. Rode o seed inicial (usuário admin e tipos de documento base): `npm run db:seed`.
5. Suba a aplicação: `npm run start:dev`.

A API sobe em `http://localhost:3000`. O login inicial após o seed é `admin@inmeta.com` / `admin1234`.

Para rodar os testes: `npm test`.

## Endpoints principais

1. `POST /auth/login` autentica e retorna um access token JWT.
2. `POST /employees`, `GET /employees` (paginado), `GET /employees/:id`, `PATCH /employees/:id`, `DELETE /employees/:id` para cadastro de colaboradores.
3. `POST /document-types`, `GET /document-types`, `GET /document-types/:id`, `PATCH /document-types/:id`, `DELETE /document-types/:id` para os tipos de documento.
4. `POST /requirements` vincula em lote tipos de documento a um colaborador. `GET /requirements` lista pendências com paginação e filtros. `DELETE /requirements/:id` desvincula.
5. `POST /requirements/:requirementId/documents` envia (ou reenvia) um documento para uma pendência.
6. `GET /stats` retorna percentual de documentação completa, tipos mais pendentes e últimos envios.
7. `GET /health` verifica a conectividade com o banco.

Todas as rotas exigem autenticação, exceto login e health check.

## Decisões técnicas

1. Prisma fixado na versão 7.10.0, evitando a release candidate 8.0 disponível no momento do desenvolvimento.
2. Conexão com o banco via driver adapter (`@prisma/adapter-pg`), exigido pela arquitetura do Prisma 7.
3. Versionamento de documentos em duas tabelas, `Document` e `DocumentVersion`, mantendo uma única fonte de verdade sobre a versão ativa e histórico completo sem sobrescrever registros antigos.
4. Vinculação de tipos de documento a colaboradores aceita uma lista e roda dentro de uma transação, garantindo que o lote inteiro seja criado ou nada seja criado.
5. Envio de documento atualiza `Document`, `DocumentVersion` e o status do requirement na mesma transação, incluindo uma escrita direta na tabela de outro módulo dentro do repository responsável pelo envio, escolha feita para manter a atomicidade sem introduzir um mecanismo genérico de transação compartilhada entre módulos.
6. Cada módulo de domínio segue o padrão Service e Repository com contrato (abstract class), permitindo trocar a implementação concreta sem alterar quem a consome.
7. Autenticação via JWT, sem endpoint de registro público. Usuários são provisionados via seed.
8. Tratamento de erros centralizado em um exception filter global, convertendo exceptions HTTP, erros de validação e erros do Prisma (constraint única, chave estrangeira, registro não encontrado) para um formato de resposta único.
9. Logs estruturados em JSON via Pino, com identificador de requisição, e health check via Terminus.

## Limitações conhecidas

1. Estatísticas são recalculadas a cada requisição, sem cache. Candidato natural a otimização caso o volume de dados cresça.
2. Envio de documento é uma representação lógica dos dados, sem upload de arquivo.
3. Testes automatizados cobrem as regras de negócio centrais (vinculação atômica e versionamento de documentos), não a aplicação inteira.
4. Listagem de tipos de documento não é paginada, por ser naturalmente uma lista pequena e curada.

