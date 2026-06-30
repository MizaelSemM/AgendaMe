# 🚀 AgendaMe

> Um SaaS completo de agendamento online para empresas como barbearias, clínicas, salões de beleza e prestadores de serviços.

AgendaMe permite que empresas gerenciem seus serviços, horários de funcionamento, equipe e agendamentos em um único painel administrativo, enquanto os clientes realizam reservas através de uma página pública personalizada.

---

## ✨ Demonstração

> **Deploy:** *(adicione aqui o link da Vercel)*

> **Documentação completa:** [`DOCS.md`](./DOCS.md)

---

## 📷 Preview

> Adicione aqui algumas imagens ou GIFs do sistema.

* Landing Page
* Dashboard
* Gerenciamento de Serviços
* Página Pública de Agendamento
* Área de Configurações

---

# 🎯 Funcionalidades

## Área Pública

* Landing Page responsiva
* Cadastro de empresas
* Login de administradores
* Página pública personalizada para cada empresa
* Agendamento online
* Horários disponíveis em tempo real
* Cancelamento público de agendamentos
* Confirmação do agendamento

---

## Dashboard Administrativo

### Visão Geral

* Dashboard com estatísticas
* Sistema de notificações
* Link público compartilhável

### Serviços

* Criar serviços
* Editar serviços
* Excluir serviços
* Definir duração
* Definir preço

### Agendamentos

* Listagem completa
* Concluir atendimento
* Cancelar atendimento
* Excluir registros

### Horários de Funcionamento

* Configuração por dia da semana
* Horário de abertura e fechamento
* Intervalo de almoço
* Múltiplos períodos por dia

### Administração

* Cadastro de administradores
* Gerenciamento de empresas
* Controle de permissões

---

# 🔐 Autenticação

O sistema possui autenticação completa utilizando:

* JWT
* Cookies HttpOnly
* Hash de senhas com bcrypt
* Middleware de proteção de rotas
* Controle de permissões baseado em Roles

### Roles

* **SUPER_ADMIN**

  * Gerencia toda a plataforma
  * Cria administradores
  * Gerencia empresas

* **ADMIN**

  * Gerencia apenas sua empresa
  * Serviços
  * Agendamentos
  * Configurações

---

# 📲 Integração WhatsApp

O sistema possui integração preparada para APIs como:

* Evolution API
* Z-API

Quando configurada, a aplicação envia:

* Confirmação do agendamento
* Lembrete automático antes do horário marcado

---

# 🧪 Testes

O projeto possui testes unitários utilizando **Jest**.

```bash
npm test
```

---

# 🛠️ Tecnologias

| Tecnologia      | Utilização           |
| --------------- | -------------------- |
| Next.js 16      | Framework Full Stack |
| React 19        | Interface            |
| TypeScript      | Tipagem              |
| Prisma ORM      | Banco de Dados       |
| PostgreSQL      | Persistência         |
| Tailwind CSS v4 | Estilização          |
| Zod             | Validação            |
| JWT (Jose)      | Autenticação         |
| bcrypt          | Hash de Senhas       |
| Jest            | Testes Unitários     |

---

# 🗂️ Arquitetura

```
src
│
├── app
├── components
├── lib
├── generated
│
prisma
│
proxy.ts
```

A aplicação segue uma arquitetura organizada em camadas:

* Interface (App Router)
* API Routes
* Camada de autenticação
* Prisma ORM
* PostgreSQL

---

# ⚙️ Instalação

Clone o projeto

```bash
git clone https://github.com/seuusuario/agendame.git
```

Entre na pasta

```bash
cd agendame
```

Instale as dependências

```bash
npm install
```

Configure as variáveis de ambiente

```env
DATABASE_URL=

JWT_SECRET=

NEXT_PUBLIC_URL=

WHATSAPP_API_URL=

WHATSAPP_API_KEY=

WHATSAPP_INSTANCE=
```

Execute as migrations

```bash
npx prisma migrate dev
```

Execute o seed

```bash
npx tsx prisma/seed.ts
```

Inicie o projeto

```bash
npm run dev
```

---

# 📜 Scripts

```bash
npm run dev
```

Servidor de desenvolvimento.

```bash
npm run build
```

Build de produção.

```bash
npm start
```

Executa a versão de produção.

```bash
npm test
```

Executa os testes.

```bash
npx prisma studio
```

Interface visual do banco.

---

# 📌 Principais Recursos Técnicos

* Arquitetura Full Stack com Next.js
* API REST
* Autenticação JWT
* Middleware de autorização
* CRUD completo
* Sistema de Roles
* Slugs únicos
* Geração automática de horários
* Validação com Zod
* Hash seguro de senhas
* Integração com PostgreSQL
* Prisma ORM
* Testes Unitários
* Código totalmente tipado com TypeScript

---

# 🚀 Próximas Funcionalidades

* Plano PRO
* Pagamentos
* Dashboard com gráficos
* Calendário
* Upload de imagens
* Integração Google Calendar
* Integração Stripe
* Sistema de Assinaturas

---

## 🧪 Demo

🔗 Live: [https://seu-projeto.vercel.app ](https://agendame-neon.vercel.app/) 
📦 Repo: https://github.com/MizaelSemM/AgendaMe

---

# 👨‍💻 Autor

Desenvolvido por **MizaelSemM**

Se este projeto foi útil para você, deixe uma ⭐ no repositório.
