# FinanTrack API

API REST para gerenciamento de finanças pessoais, desenvolvida com **NestJS, TypeScript e PostgreSQL**.

O FinanTrack permite que usuários autenticados organizem suas transações financeiras, gerenciem categorias e consultem resumos de receitas, despesas e saldo em períodos específicos.

## Funcionalidades

- Cadastro de usuários.
- Autenticação com JWT.
- Criptografia de senhas com bcrypt.
- Gerenciamento de categorias financeiras.
- Cadastro, consulta, atualização e exclusão de transações.
- Associação de transações e categorias ao usuário autenticado.
- Isolamento dos dados financeiros entre usuários.
- Resumo financeiro com total de receitas, despesas e saldo.
- Filtros por data no resumo financeiro.
- Validação de dados de entrada.
- Tratamento de erros com exceções HTTP.
- Testes automatizados com Jest.

## Tecnologias utilizadas

- **Node.js** — ambiente de execução JavaScript.
- **NestJS** — framework para construção da API.
- **TypeScript** — tipagem estática e organização do código.
- **PostgreSQL** — banco de dados relacional.
- **TypeORM** — mapeamento objeto-relacional e gerenciamento de consultas.
- **JWT** — autenticação por tokens.
- **bcrypt** — hash de senhas.
- **class-validator** — validação de dados.
- **class-transformer** — transformação de dados.
- **Jest** — testes automatizados.

## Estrutura do projeto

```text
src/
├── auth/
├── categories/
├── database/
├── transactions/
├── types/
├── users/
├── app.controller.ts
├── app.module.ts
├── app.service.ts
└── main.ts
```

### Organização dos módulos

- **auth:** autenticação e proteção de rotas.
- **users:** cadastro e gerenciamento de usuários.
- **categories:** gerenciamento de categorias financeiras.
- **transactions:** gerenciamento de transações e resumos financeiros.
- **database:** configuração e migrações do banco de dados.
- **types:** definições de tipos utilizados pela aplicação.

## Pré-requisitos

Antes de executar o projeto, você precisa ter instalado:

- Node.js
- npm
- PostgreSQL
- Git

## Como executar o projeto

### 1. Clonar o repositório

```bash
git clone https://github.com/pedroacioly27/finantrack-api.git
cd finantrack-api
```

### 2. Instalar as dependências

```bash
npm install
```

### 3. Configurar as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=
NODE_ENV=
JWT_SECRET=

DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_NAME=
```

Preencha as variáveis de acordo com seu ambiente local.

### 4. Configurar o banco de dados

Crie um banco de dados PostgreSQL e configure as variáveis de conexão no arquivo `.env`.

Certifique-se de que os nomes das variáveis correspondem aos utilizados na configuração do TypeORM.

### 5. Executar as migrações

Com o banco de dados configurado, execute:

```bash
npm run migration:run
```

Para desfazer a última migração aplicada, utilize:

```bash
npm run migration:revert
```

### 6. Iniciar a aplicação

Para executar em modo de desenvolvimento:

```bash
npm run start:dev
```

Para compilar o projeto:

```bash
npm run build
```

Para executar a versão compilada:

```bash
npm run start:prod
```

## Testes automatizados

O projeto utiliza Jest para testar os serviços, controllers e outras partes da aplicação.

Executar todos os testes:

```bash
npm test
```

Executar os testes em modo de observação:

```bash
npm run test:watch
```

Gerar relatório de cobertura:

```bash
npm run test:cov
```

## Principais recursos da API

| Recurso | Descrição |
|---|---|
| Autenticação | Cadastro e autenticação de usuários |
| Usuários | Gerenciamento de contas |
| Categorias | Criação, consulta, atualização e exclusão de categorias |
| Transações | Criação, consulta, atualização e exclusão de transações |
| Resumo financeiro | Cálculo de receitas, despesas e saldo |
| Filtros por data | Consulta de resumos em períodos específicos |

As rotas protegidas exigem um token JWT válido. As operações financeiras são associadas ao usuário autenticado para impedir o acesso indevido aos dados de outras contas.

## Objetivo do projeto

O FinanTrack é um projeto de portfólio voltado ao desenvolvimento backend, com foco em construção de APIs REST, autenticação, regras de negócio, persistência de dados relacionais e testes automatizados.

O projeto também serve como oportunidade de aprofundamento em boas práticas de organização de código e desenvolvimento com NestJS.

## Autor

**Pedro Acioly**

- GitHub: [pedroacioly27](https://github.com/pedroacioly27)
- Repositório: [finantrack-api](https://github.com/pedroacioly27/finantrack-api)