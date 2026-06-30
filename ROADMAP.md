# 🗺️ ROADMAP DO PROJETO

---

## 1. Objetivo do Projeto

Desenvolver uma plataforma SaaS multi-tenant de agendamentos, onde cada empresa (ex: barbearia, salão, clínica) pode se cadastrar, configurar seus serviços e receber agendamentos de clientes por meio de uma página pública personalizada com slug único.

Cada empresa opera de forma totalmente isolada: seus dados, serviços e agendamentos são visíveis apenas para seus próprios administradores.

---

## 2. Requisitos Funcionais

- [ ] Cadastro de empresa com criação automática de usuário administrador
- [ ] Login com autenticação via JWT ou sessão
- [ ] Dashboard protegido por autenticação, com dados isolados por empresa (multi-tenant)
- [ ] CRUD de serviços por empresa
- [ ] Visualização e gerenciamento de agendamentos
- [ ] Configuração de horários de funcionamento
- [ ] Página pública da empresa acessível via slug (`/barbearia-joao`)
- [ ] Fluxo de agendamento público para clientes (sem necessidade de login)
- [ ] Redirecionamento automático para o dashboard após login/cadastro

---

## 3. Requisitos Não Funcionais

- [ ] Isolamento completo de dados por tenant (multi-tenancy via `businessId`)
- [ ] Senhas armazenadas com hash seguro (ex: bcrypt)
- [ ] Autenticação stateless com JWT ou gerenciamento de sessão seguro
- [ ] Slugs únicos por empresa para URLs públicas
- [ ] Suporte a planos com preço ÚNICO(FREE, PRO, etc.)
- [ ] API RESTful com rotas públicas e protegidas bem definidas
- [ ] Middleware de autenticação e autorização nas rotas protegidas
- [ ] Código organizado e escalável seguindo separação de responsabilidades

---

## 4. Modelagem do Banco de Dados

### Tabela `Business` (Tenant)

| Campo       | Tipo      | Descrição                          |
|-------------|-----------|-------------------------------------|
| `id`        | Int / UUID | ID da empresa                      |
| `name`      | String    | Nome da empresa                    |
| `slug`      | String    | Nome para URL (`barbearia-joao`)   |
| `plan`      | Enum      | Plano do SaaS (`FREE`, `PRO`, etc) |
| `createdAt` | DateTime  | Data de criação                    |

---

### Tabela `User` (Admins do sistema)

| Campo        | Tipo      | Descrição                          |
|--------------|-----------|-------------------------------------|
| `id`         | Int / UUID | ID do usuário                      |
| `name`       | String    | Nome do dono da empresa            |
| `email`      | String    | Email de login                     |
| `password`   | String    | Senha com hash                     |
| `role`       | Enum      | `SUPER_ADMIN` ou `ADMIN`           |
| `businessId` | FK        | Empresa à qual o usuário pertence  |

---

### Tabela `Service`

| Campo        | Tipo      | Descrição                          |
|--------------|-----------|-------------------------------------|
| `id`         | Int / UUID | ID do serviço                      |
| `name`       | String    | Nome do serviço (Corte, Barba...) |
| `duration`   | Int       | Duração em minutos                 |
| `price`      | Decimal   | Preço do serviço                   |
| `businessId` | FK        | Empresa dona do serviço            |

---

### Tabela `Appointment`

| Campo           | Tipo      | Descrição                              |
|-----------------|-----------|----------------------------------------|
| `id`            | Int / UUID | ID do agendamento                     |
| `customerName`  | String    | Nome do cliente                        |
| `customerPhone` | String    | Telefone do cliente                    |
| `serviceId`     | FK        | Serviço escolhido                      |
| `date`          | DateTime  | Data e hora do agendamento             |
| `status`        | Enum      | `CONFIRMED`, `CANCELED`, `DONE`        |
| `businessId`    | FK        | Empresa dona do agendamento            |

---

## 5. Fluxo do Usuário

### Fluxo do Administrador (Dono da Empresa)

```
[Acessa /register]
       ↓
[Preenche dados da empresa + dados pessoais]
       ↓
[POST /api/register]
  → Cria Business (tenant)
  → Cria User com role = ADMIN
  → Liga o usuário ao businessId
  → Login automático
       ↓
[Redirecionado para /dashboard]
       ↓
[Configura serviços em /dashboard/services]
       ↓
[Define horários em /dashboard/settings]
       ↓
[Monitora agendamentos em /dashboard/appointments]
```

### Fluxo do Cliente (Agendamento Público)

```
[Acessa /barbearia-joao]
       ↓
[Sistema busca o Business pelo slug]
       ↓
[Visualiza serviços disponíveis]
       ↓
[Escolhe serviço e horário disponível]
       ↓
[Acessa /barbearia-joao/book]
       ↓
[Preenche nome e telefone]
       ↓
[POST /api/appointments → businessId = ID da empresa]
       ↓
[Agendamento confirmado]
```

---

## 6. Rotas

### Rotas Públicas

| Método | Rota                  | Descrição                              |
|--------|-----------------------|----------------------------------------|
| GET    | `/register`           | Página de cadastro de empresa          |
| POST   | `/api/register`       | Cria empresa + admin (multi-tenant)    |
| GET    | `/login`              | Página de login                        |
| POST   | `/api/login`          | Autenticação e criação de sessão/JWT   |
| GET    | `/[slug]`             | Página pública da empresa              |
| GET    | `/[slug]/book`        | Página de agendamento para o cliente   |
| POST   | `/api/appointments`   | Registra um novo agendamento           |

### Rotas Protegidas (requerem autenticação)

| Método | Rota                          | Descrição                            |
|--------|-------------------------------|--------------------------------------|
| GET    | `/dashboard`                  | Painel principal do admin            |
| GET    | `/dashboard/services`         | Listagem de serviços da empresa      |
| POST   | `/api/services`               | Criar novo serviço                   |
| PUT    | `/api/services/:id`           | Editar serviço                       |
| DELETE | `/api/services/:id`           | Remover serviço                      |
| GET    | `/dashboard/appointments`     | Listagem de agendamentos             |
| PATCH  | `/api/appointments/:id`       | Atualizar status do agendamento      |
| GET    | `/dashboard/settings`         | Configurações e horários da empresa  |
| PUT    | `/api/settings`               | Salvar horários de funcionamento     |

---

## 7. Estrutura de Pastas

```
/
├── app/
│   ├── (public)/
│   │   ├── register/
│   │   │   └── page.tsx          # Página de cadastro
│   │   ├── login/
│   │   │   └── page.tsx          # Página de login
│   │   └── [slug]/
│   │       ├── page.tsx          # Página pública da empresa
│   │       └── book/
│   │           └── page.tsx      # Página de agendamento
│   │
│   ├── (protected)/
│   │   └── dashboard/
│   │       ├── page.tsx          # Painel principal
│   │       ├── services/
│   │       │   └── page.tsx      # Gerenciar serviços
│   │       ├── appointments/
│   │       │   └── page.tsx      # Gerenciar agendamentos
│   │       └── settings/
│   │           └── page.tsx      # Horários da empresa
│   │
│   └── api/
│       ├── register/
│       │   └── route.ts          # POST - Cadastro de empresa
│       ├── login/
│       │   └── route.ts          # POST - Login
│       ├── services/
│       │   ├── route.ts          # GET / POST
│       │   └── [id]/
│       │       └── route.ts      # PUT / DELETE
│       ├── appointments/
│       │   ├── route.ts          # GET / POST
│       │   └── [id]/
│       │       └── route.ts      # PATCH
│       └── settings/
│           └── route.ts          # GET / PUT
│
├── components/
│   ├── ui/                       # Componentes genéricos (Button, Input...)
│   ├── dashboard/                # Componentes do painel admin
│   └── public/                   # Componentes das páginas públicas
│
├── lib/
│   ├── auth.ts                   # Lógica de autenticação / JWT
│   ├── prisma.ts                 # Instância do Prisma Client
│   └── utils.ts                  # Funções utilitárias
│
├── middleware.ts                 # Proteção de rotas autenticadas
├── prisma/
│   └── schema.prisma             # Modelagem do banco de dados
└── .env                          # Variáveis de ambiente
```

---

## 8. Regras de Negócio

- **Isolamento por tenant:** Toda query ao banco deve incluir o `businessId` do usuário autenticado. Nenhum dado de uma empresa pode ser acessado por outra.
- **Slug único:** O slug da empresa deve ser único no sistema. Gerado automaticamente a partir do nome ou informado pelo usuário.
- **Criação de admin:** No cadastro, o primeiro usuário criado para uma empresa recebe automaticamente a role `ADMIN`.
- **Hash de senha:** A senha nunca é armazenada em texto puro — deve ser aplicado `bcrypt` antes de persistir.
- **Agendamento público:** Clientes não precisam de conta para agendar. O `businessId` é resolvido pelo slug da URL.
- **Status de agendamento:** Somente o admin da empresa pode alterar o status (`CONFIRMED`, `CANCELED`, `DONE`).
- **Planos:** A lógica de limites por plano (ex: máx. de serviços no FREE) deve ser aplicada no servidor, nunca apenas no front-end.
- **Middleware de autenticação:** Todas as rotas `/dashboard` e `/api` (exceto `/api/register`, `/api/login` e rotas de agendamento público) devem verificar o token/sessão antes de processar a requisição.

---

## 9. Checklist de Desenvolvimento

### Setup Inicial
- [ ] Criar projeto (Next.js, Node, etc.)
- [ ] Configurar banco de dados (PostgreSQL / MySQL / SQLite)
- [ ] Configurar ORM (Prisma recomendado)
- [ ] Definir variáveis de ambiente (`.env`)
- [ ] Criar schema do banco com todas as tabelas

### Autenticação
- [ ] Implementar `POST /api/register`
- [ ] Implementar `POST /api/login`
- [ ] Configurar JWT ou gerenciamento de sessão
- [ ] Criar middleware de proteção de rotas

### Dashboard Admin
- [ ] Página `/dashboard` com dados isolados por tenant
- [ ] CRUD de serviços (`/dashboard/services`)
- [ ] Listagem e gestão de agendamentos (`/dashboard/appointments`)
- [ ] Configuração de horários (`/dashboard/settings`)

### Página Pública
- [ ] Página `/[slug]` com serviços da empresa
- [ ] Lógica de horários disponíveis
- [ ] Fluxo de agendamento `/[slug]/book`
- [ ] `POST /api/appointments` com validações

### Qualidade
- [ ] Validação de inputs no servidor (ex: Zod)
- [ ] Tratamento de erros com respostas padronizadas
- [ ] Testes das rotas principais
- [ ] Revisão de segurança (SQL injection, auth bypass, etc.)

---

## 10. Deploy

### Variáveis de Ambiente necessárias

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=sua_chave_secreta_aqui
NEXT_PUBLIC_APP_URL=https://seudominio.com
```

### Checklist de Deploy

- [ ] Configurar banco de dados em produção (ex: Railway, PlanetScale, Supabase, Neon)
- [ ] Executar migrations: `npx prisma migrate deploy`
- [ ] Configurar variáveis de ambiente na plataforma de deploy
- [ ] Deploy da aplicação (ex: Vercel, Railway, Render, VPS)
- [ ] Configurar domínio personalizado (opcional)
- [ ] Testar fluxo completo em produção:
  - [ ] Cadastro de empresa
  - [ ] Login e acesso ao dashboard
  - [ ] Criação de serviços
  - [ ] Agendamento público via slug
- [ ] Configurar monitoramento de erros (ex: Sentry)
- [ ] Configurar backups automáticos do banco

### Plataformas Recomendadas

| Serviço       | Uso                        |
|---------------|----------------------------|
| Vercel        | Deploy do front-end / API  |
| Railway       | Banco de dados + backend   |
| Supabase      | Banco PostgreSQL gerenciado|
| Neon          | PostgreSQL serverless       |
| Sentry        | Monitoramento de erros      |