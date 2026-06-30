# AgendaMe — Documentação

## Tecnologias

| Tecnologia | Versão | Função |
|---|---|---|
| **Next.js** | 16.2.9 | Framework React fullstack (App Router) |
| **React** | 19.2.4 | UI |
| **TypeScript** | 5.x | Tipagem estática |
| **Prisma** | 7.8.0 | ORM + migrations + type-safe client |
| **PostgreSQL** | — | Banco de dados |
| **Tailwind CSS** | 4 | Estilização utilitária |
| **Zod** | 4.4.3 | Validação de schemas |
| **Jose** | 6.2.3 | JWT (JSON Web Token) |
| **bcrypt** | 6.0.0 | Hash de senhas |
| **Jest** | 30.4.2 | Testes unitários |
| **ts-jest** | 29.4.11 | TypeScript para Jest |

---

## Estrutura de Arquivos

```
agendame/
├── prisma/
│   ├── schema.prisma              # Modelos do banco de dados
│   ├── seed.ts                    # Cria SUPER_ADMIN inicial
│   └── migrations/                # Migrations geradas pelo Prisma
│       ├── 20260628213532_init/
│       ├── 20260628224318_add_notifications/
│       └── 20260628224829_add_notification_fields/
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Layout raiz (fontes, metadata)
│   │   ├── page.tsx               # Landing page pública
│   │   ├── globals.css            # Estilos globais + animações Tailwind v4
│   │   ├── favicon.ico
│   │   ├── (public)/              # Rotas públicas (sem auth)
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── [slug]/
│   │   │       ├── page.tsx       # Página pública da empresa
│   │   │       └── book/
│   │   │           ├── page.tsx           # Formulário de agendamento
│   │   │           └── success/page.tsx   # Confirmação pós-agendamento
│   │   ├── (protected)/           # Rotas protegidas (com auth)
│   │   │   ├── layout.tsx         # Sidebar + verificação de sessão
│   │   │   └── dashboard/
│   │   │       ├── page.tsx              # Visão geral + notificações
│   │   │       ├── services/page.tsx     # CRUD de serviços (só ADMIN)
│   │   │       ├── appointments/page.tsx # Lista de agendamentos (só ADMIN)
│   │   │       ├── users/page.tsx        # CRUD de admins (só SUPER_ADMIN)
│   │   │       └── settings/page.tsx     # Horários de funcionamento (só ADMIN)
│   │   └── api/                  # API Routes (backend)
│   │       ├── register/route.ts          # POST - Criar conta + empresa
│   │       ├── login/route.ts             # POST - Autenticar
│   │       ├── logout/route.ts            # POST - Encerrar sessão
│   │       ├── users/
│   │       │   ├── route.ts               # GET/POST - Listar/criar admins
│   │       │   ├── [id]/route.ts          # DELETE - Remover admin
│   │       │   └── businesses/route.ts    # GET - Listar empresas (para dropdown)
│   │       ├── services/
│   │       │   ├── route.ts               # GET/POST - Listar/criar serviços
│   │       │   ├── [id]/route.ts          # PUT/DELETE - Editar/remover serviço
│   │       │   └── [id]/delete/route.ts   # POST - Remover serviço (via form)
│   │       ├── appointments/
│   │       │   ├── route.ts               # GET/POST - Listar/criar agendamentos
│   │       │   ├── [id]/route.ts          # PATCH/DELETE - Status/remover
│   │       │   ├── slots/route.ts         # GET - Horários disponíveis (público)
│   │       │   └── public/route.ts        # GET/DELETE - Info pública do agendamento
│   │       ├── settings/route.ts          # GET/PUT - Horários de funcionamento
│   │       └── notifications/
│   │           ├── route.ts               # GET/PATCH - Notificações
│   │           └── check-reminders/route.ts # GET - Verificar lembretes pendentes
│   ├── components/
│   │   ├── landing-nav.tsx         # Navbar da landing page (client)
│   │   ├── scroll-reveal.tsx       # Animação de scroll (client)
│   │   ├── copy-link.tsx           # Botão copiar link (client)
│   │   └── notification-list.tsx   # Lista de notificações (client)
│   ├── lib/
│   │   ├── auth.ts                 # JWT, sessão, hash de senha
│   │   ├── prisma.ts               # Conexão com banco (singleton)
│   │   ├── utils.ts                # Funções utilitárias
│   │   ├── whatsapp.ts             # Integração WhatsApp
│   │   └── __tests__/
│   │       └── utils.test.ts       # Testes unitários
│   └── generated/prisma/           # Prisma Client auto-gerado
│       ├── client.ts
│       └── enums.ts
├── proxy.ts                        # Middleware de autenticação
├── next.config.ts                  # Configuração do Next.js
├── prisma.config.ts                # Configuração do Prisma
├── jest.config.ts                  # Configuração do Jest
├── tsconfig.json
├── postcss.config.mjs              # PostCSS + Tailwind v4
├── package.json
├── AGENTS.md                       # Notas sobre versão do Next.js
├── DOCS.md                         # Este arquivo
├── ROADMAP.md                      # Roadmap do projeto
└── README.md
```

---

## Fluxo Completo da Aplicação

### 1. Cadastro (`/register`)

1. Usuário preenche nome da empresa, nome, email e senha
2. `POST /api/register` valida com Zod
3. Verifica unicidade do email (409 se já existir)
4. Gera slug a partir do nome da empresa com `slugify()`
5. Se o slug já existir, adiciona timestamp
6. Cria `Business` + `User` (role: `ADMIN`) no banco via nested create
7. Gera JWT com `jose` (HS256) e salva em cookie `session` (7 dias, httpOnly, secure)
8. Retorna 201 com dados da empresa e usuário

### 2. Login (`/login`)

1. Usuário informa email + senha
2. `POST /api/login` busca `User` pelo email (inclui `Business`)
3. Compara senha com `bcrypt.compare`
4. Gera JWT e salva em cookie `session`
5. Retorna `{ user, business }` com role

### 3. Logout

- `POST /api/logout` — deleta cookie `session`, redireciona para `/login`

### 4. Middleware (`proxy.ts`)

- Bloqueia APIs protegidas sem cookie `session` (retorna 401 JSON)
- Redireciona `/dashboard` sem sessão para `/login`
- Redireciona `/login` ou `/register` com sessão para `/dashboard`
- Rotas públicas: `/api/register`, `/api/login`, `/api/appointments`
- Aplica a todas rotas exceto arquivos estáticos (`_next/static`, `favicon.ico`, etc.)

### 5. Dashboard (`/dashboard`)

**Layout protegido** (`(protected)/layout.tsx`):
- Toda rota em `(protected)` executa `verifyAuth()`:
  - Lê cookie `session` → decodifica JWT com `jose`
  - Se inválido/expirado → redirect `/login`
- Sidebar adaptável conforme o papel:
  - **ADMIN**: Visão Geral, Serviços, Agendamentos, Configurações
  - **SUPER_ADMIN**: Visão Geral, Usuários
- Rodapé da sidebar com nome do papel e botão "Sair"

**Visão Geral** (`dashboard/page.tsx`):
- **ADMIN**:
  - Cards: Serviços (link para /services), Agendamentos (link para /appointments), Link Público
  - Seção "Seu link de agendamento" com `CopyLink`
  - Lista de notificações com `NotificationList`
- **SUPER_ADMIN**:
  - Cards: Administradores (link para /users), Empresas (total), Função (badge Super Admin)
  - Mesmo link de agendamento e notificações

### 6. Gerenciamento de Serviços (`/dashboard/services`)

- **Apenas ADMIN** (SUPER_ADMIN é bloqueado via API com 403)
- Lista serviços do business via `GET /api/services`
- Formulário para criar novo (nome, duração, preço) → `POST /api/services`
- Editar cada serviço inline → `PUT /api/services/[id]`
- Remover com confirmação → `POST /api/services/[id]/delete`
- Delete usa transação: remove appointments vinculados → depois o serviço
- Notificações toast (auto-destroi em 3s)

### 7. Gerenciamento de Usuários (`/dashboard/users`)

- **Apenas SUPER_ADMIN** (roles diferentes retornam 403)
- Lista todos administradores da plataforma via `GET /api/users`
- Cada card mostra: nome, email, badge "SUPER ADMIN" (se for), empresa vinculada
- Formulário para criar novo admin:
  - Campos: nome, email, senha, empresa (select dropdown)
  - `POST /api/users` valida email único, cria user com role `ADMIN`
- Remover admin com confirmação → `DELETE /api/users/[id]`
  - SUPER_ADMIN não pode ser removido (protegido)

### 8. Agendamento Público (`/[slug]`)

1. Cliente acessa `/[slug]` (server component) e vê serviços da empresa
2. Clica em "Agendar" em um serviço → `/[slug]/book?serviceId=X`
3. Escolhe data → `GET /api/appointments/slots?slug=X&date=Y&serviceId=Z`:
   - Busca business por slug
   - Obtém `BusinessSettings.workHours` (migração automática do formato antigo)
   - Expande os slots com `getExpandedSlots()` (se houver almoço, divide o período)
   - Gera slots com `generateTimeSlots()`, excluindo horários ocupados e o almoço
4. Preenche nome, telefone e email (opcional)
5. Confirma → `POST /api/appointments` (público, sem auth):
   - Valida com Zod
   - Verifica se o horário está dentro do funcionamento
   - Verifica conflito com outros agendamentos (mesmo horário + duração, não cancelados)
   - Cria `Appointment` no banco
   - Cria `Notification` tipo "reminder" para 30 minutos antes
   - Envia mensagem de confirmação via WhatsApp (silent se não configurado)
6. Redireciona para `/[slug]/book/success?id=X`

### 9. Página de Sucesso (`/[slug]/book/success`)

- Busca detalhes do agendamento via `GET /api/appointments/public?id=X`
- Mostra: serviço, data/hora, dados do cliente, nome da empresa
- Aviso sobre lembrete via WhatsApp 30 min antes
- Botão para cancelar agendamento (com confirmação)

### 10. Gerenciamento de Agendamentos (`/dashboard/appointments`)

- **Apenas ADMIN** (SUPER_ADMIN bloqueado)
- Lista todos agendamentos do business via `GET /api/appointments`
- Status: CONFIRMED (azul), CANCELED (vermelho), DONE (verde)
- Ações por status:
  - CONFIRMED: Concluir → `PATCH` status=DONE; Cancelar → `DELETE`
  - CANCELED/DONE: Excluir → `DELETE`
- Notificações toast

### 11. Horários de Funcionamento (`/dashboard/settings`)

- **Apenas ADMIN** (SUPER_ADMIN bloqueado)
- Toggle por dia da semana (liga/desliga)
- Horário de início e fim por dia
- **Almoço**: toggle por dia com horário personalizável (padrão 12:00–14:00)
  - A duração é calculada e exibida automaticamente (ex: `2h`)
  - Quando ativo, o sistema exclui esse intervalo dos horários disponíveis
  - O agendamento público e a validação no backend respeitam o almoço
- Salva via `PUT /api/settings` → upsert em `BusinessSettings.workHours`
- `GET /api/settings` retorna configuração atual ou `{ workHours: {} }`
- Compatibilidade retroativa: dados salvos no formato antigo são migrados automaticamente

#### Formato do `workHours`

```typescript
// Typescript (src/lib/utils.ts)
type TimeSlot = { start: string; end: string }

type DayConfig = {
  slots: TimeSlot[]              // Um ou mais períodos de trabalho
  lunchBreak?: TimeSlot          // Opcional: horário do almoço
}

// Exemplo real no banco:
{
  "monday": {
    "slots": [{ "start": "08:00", "end": "18:00" }],
    "lunchBreak": { "start": "12:00", "end": "14:00" }
  },
  "tuesday": {
    "slots": [{ "start": "08:00", "end": "12:00" }, { "start": "13:00", "end": "18:00" }]
  }
}
```

#### Funções auxiliares (`src/lib/utils.ts`)

| Função | Descrição |
|---|---|
| `migrateWorkHours(data)` | Converte dados do formato array antigo para `DayConfig` |
| `getExpandedSlots(dayConfig)` | Se `lunchBreak` existe, divide o slot em dois (antes/depois do almoço) |
| `isTimeInLunchBreak(minutes, dayConfig)` | Verifica se um minuto cai dentro do horário de almoço |

### 12. Lembretes (30 min antes)

- `GET /api/notifications/check-reminders` (sem auth, para cron)
- Busca notificações com `scheduledAt` no minuto atual e `sentAt = null`
- Envia WhatsApp com lembrete (se configurado)
- Marca como enviado (`sentAt = now()`)

---

## Modelos do Banco (Prisma)

### Business
| Campo | Tipo | Descrição |
|---|---|---|
| id | Int (autoincrement) | PK |
| name | String | Nome da empresa |
| slug | String (unique) | Slug para URL pública |
| plan | Plan (FREE/PRO) | Plano do assinante |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |
| Relações | | users, services, appointments, notifications, settings |

### User
| Campo | Tipo | Descrição |
|---|---|---|
| id | Int (autoincrement) | PK |
| name | String | Nome do admin |
| email | String (unique) | Email de login |
| password | String | Hash bcrypt |
| role | Role (SUPER_ADMIN/ADMIN) | Nível de acesso |
| businessId | Int | FK → Business |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

### Service
| Campo | Tipo | Descrição |
|---|---|---|
| id | Int (autoincrement) | PK |
| name | String | Nome do serviço |
| duration | Int | Duração em minutos |
| price | Decimal(10,2) | Preço |
| businessId | Int | FK → Business (onDelete: Cascade) |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |
| Relações | | appointments |

### Appointment
| Campo | Tipo | Descrição |
|---|---|---|
| id | Int (autoincrement) | PK |
| customerName | String | Nome do cliente |
| customerPhone | String | Telefone do cliente |
| customerEmail | String? | Email do cliente (opcional) |
| date | DateTime | Data/hora do agendamento |
| status | AppointmentStatus | CONFIRMED / CANCELED / DONE |
| serviceId | Int | FK → Service (RESTRICT) |
| businessId | Int | FK → Business (onDelete: Cascade) |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

### Notification
| Campo | Tipo | Descrição |
|---|---|---|
| id | Int (autoincrement) | PK |
| businessId | Int | FK → Business (onDelete: Cascade) |
| type | String | "reminder" |
| title | String | Título da notificação |
| message | String | Mensagem |
| read | Boolean | Lida ou não (default: false) |
| customerPhone | String? | Telefone para WhatsApp |
| customerName | String? | Nome do cliente |
| scheduledAt | DateTime? | Quando disparar lembrete |
| sentAt | DateTime? | Quando foi enviado |
| createdAt | DateTime | Auto |

### BusinessSettings
| Campo | Tipo | Descrição |
|---|---|---|
| id | Int (autoincrement) | PK |
| businessId | Int (unique) | FK → Business (onDelete: Cascade) |
| workHours | Json | `Record<string, DayConfig>` — vide seção de horários |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

---

## Sistema de Roles e Autorização

### Roles
- **`SUPER_ADMIN`**: Administrador da plataforma. Gerencia todos os admins. Acesso apenas a: Visão Geral, Usuários. Bloqueado de serviços, agendamentos, configurações.
- **`ADMIN`**: Administrador de uma empresa. Acesso a: Visão Geral, Serviços, Agendamentos, Configurações. Bloqueado de gerenciamento de usuários.

### Fluxo de Autorização
1. **API Routes**: Cada handler chama `getSession()` para obter o JWT do cookie
2. **Role check**: Compara `session.role` com o papel esperado
   - Serviços/Agendamentos/Settings: `if (session.role === "SUPER_ADMIN") return 403`
   - Users: `if (session.role !== "SUPER_ADMIN") return 403`
3. **Layout**: `verifyAuth()` no layout protegido redireciona para `/login` se não autenticado
4. **Sidebar**: Renderiza itens de navegação conforme o papel

---

## Autenticação (`src/lib/auth.ts`)

- `encrypt(payload)` → Gera JWT com `jose` (HS256, expira 7 dias)
- `decrypt(session)` → Verifica e decodifica JWT
- `createSession(userId, businessId, role)` → Salva cookie `session` (httpOnly, secure, sameSite lax, 7 dias)
- `deleteSession()` → Remove cookie
- `getSession()` → Lê e decodifica cookie
- `verifyAuth()` → Obtém sessão ou redireciona para `/login`
- `requireRole(...roles)` → Verifica se tem um dos papéis especificados (não usado atualmente)
- `hashPassword(password)` → bcrypt hash (salt rounds: 10)
- `comparePassword(password, hash)` → bcrypt compare

### Cookie de Sessão
- Nome: `session`
- Conteúdo: JWT com `{ userId, businessId, role, expiresAt }`
- Duração: 7 dias
- HttpOnly: true
- Secure: true
- SameSite: lax

---

## API Routes — Resumo Completo

| Método | Rota | Auth | Role | Descrição |
|---|---|---|---|---|
| POST | /api/register | — | — | Criar conta + empresa |
| POST | /api/login | — | — | Autenticar |
| POST | /api/logout | ✓ | — | Encerrar sessão |
| GET | /api/users | ✓ | SUPER_ADMIN | Listar todos admins |
| POST | /api/users | ✓ | SUPER_ADMIN | Criar novo admin |
| DELETE | /api/users/[id] | ✓ | SUPER_ADMIN | Remover admin (não SUPER_ADMIN) |
| GET | /api/users/businesses | ✓ | SUPER_ADMIN | Listar empresas para dropdown |
| GET | /api/services | ✓ | ADMIN | Listar serviços do business |
| POST | /api/services | ✓ | ADMIN | Criar serviço |
| PUT | /api/services/[id] | ✓ | ADMIN | Atualizar serviço |
| DELETE | /api/services/[id] | ✓ | ADMIN | Remover serviço |
| POST | /api/services/[id]/delete | ✓ | ADMIN | Remover serviço (via form) |
| GET | /api/appointments | ✓ | ADMIN | Listar agendamentos |
| POST | /api/appointments | — | — | Criar agendamento (público) |
| PATCH | /api/appointments/[id] | ✓ | ADMIN | Alterar status |
| DELETE | /api/appointments/[id] | ✓ | ADMIN | Remover agendamento |
| GET | /api/appointments/slots | — | — | Horários disponíveis (público) |
| GET | /api/appointments/public | — | — | Detalhes do agendamento (público) |
| DELETE | /api/appointments/public | — | — | Cancelar agendamento (público) |
| GET | /api/settings | ✓ | ADMIN | Obter horários |
| PUT | /api/settings | ✓ | ADMIN | Atualizar horários |
| GET | /api/notifications | ✓ | ADMIN | Listar notificações |
| PATCH | /api/notifications | ✓ | ADMIN | Marcar como lidas |
| GET | /api/notifications/check-reminders | — | — | Disparar lembretes (cron) |

---

## Landing Page (`/page.tsx`)

Server component que exibe dados ao vivo do banco:

1. **Hero**: Gradiente, grid BG, blobs animados, headline, CTAs
2. **Stats**: 3 cards com contagens totais (empresas, agendamentos, serviços)
3. **How It Works**: 3 passos (Encontre, Agende, Compareça)
4. **Features**: 6 cards (Agendamento Online, Dashboard, Múltiplos Serviços, Notificações, Horários Flexíveis, Gestão de Equipe)
5. **For Businesses**: Proposta de valor + mockup visual
6. **Explore Services**: Lista até 6 empresas reais (exclui a empresa "AgendaMe Admin" do SUPER_ADMIN) com contagem de serviços
7. **Pricing**: Plano Gratuito (R$0) e Profissional (R$29, "Em Breve")
8. **Final CTA**: Register/Login buttons
9. **Footer**: Brand, links, copyright

---

## WhatsApp (`src/lib/whatsapp.ts`)

Integração via HTTP API (Evolution API, Z-API, etc.):

| Variável .env | Descrição |
|---|---|
| WHATSAPP_API_URL | URL base da API |
| WHATSAPP_API_KEY | Chave de autenticação |
| WHATSAPP_INSTANCE | Nome da instância |

Funções:
- `sendMessage(to, text)` → Envia mensagem via fetch para API
- `formatPhone(phone)` → Remove caracteres não numéricos

Se as variáveis não forem configuradas, o WhatsApp é ignorado silenciosamente.

---

## Testes

```bash
npm test              # Executa testes uma vez
npm run test:watch    # Modo watch
```

Testes em `src/lib/__tests__/utils.test.ts`:
- `slugify` — conversão de texto para slug (acentos, caracteres especiais, espaços)
- `getDayName` — nome do dia da semana em inglês
- `generateTimeSlots` — geração de horários disponíveis (com exclusão de ocupados)

---

## Scripts Disponíveis

| Script | Descrição |
|---|---|
| `npm run dev` | Dev server com Turbopack |
| `npm run build` | Build de produção |
| `npm start` | Servidor de produção |
| `npm test` | Testes unitários (Jest) |
| `npx prisma studio` | Interface visual do banco |
| `npx prisma migrate dev` | Criar nova migration |
| `npx prisma generate` | Regenerar Prisma Client |
| `npx tsx prisma/seed.ts` | Popular SUPER_ADMIN inicial |

---

## Seed

`prisma/seed.ts` cria:
- **Business**: "AgendaMe Admin" (slug: `agendame-admin`, plan: PRO)
- **User**: `admin@agendame.com` / senha: `admin123` (role: SUPER_ADMIN)

O seed é idempotente — verifica se o email já existe antes de criar.

---

## Variáveis de Ambiente (`.env`)

| Variável | Descrição | Obrigatório |
|---|---|---|
| DATABASE_URL | URL de conexão PostgreSQL | Sim |
| JWT_SECRET | Chave secreta para assinar JWT | Sim |
| NEXT_PUBLIC_URL | URL pública da aplicação | Sim |
| WHATSAPP_API_URL | URL base da API WhatsApp | Não |
| WHATSAPP_API_KEY | Chave de autenticação WhatsApp | Não |
| WHATSAPP_INSTANCE | Nome da instância WhatsApp | Não |
