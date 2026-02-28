# Requisitos do Serviço Salva

## Visão Geral
Sistema de controle financeiro para cadastro de entradas (recebidos) e despesas, com dois módulos:
- **Backend**: Node.js + Express, com banco de dados SQLite em memória (via `better-sqlite3`).
- **Frontend**: React (criado com Vite), consumindo a API REST do backend.

### Diretórios
- `salva-service/backend` — API REST (Node.js + Express)
- `salva-service/frontend` — Interface web (React + Vite)

---

## Modelo de Dados — Lançamento

Cada lançamento financeiro possui os seguintes campos:

| Campo              | Tipo      | Obrigatório | Descrição                                                        |
|--------------------|-----------|-------------|------------------------------------------------------------------|
| `id`               | INTEGER   | auto        | Chave primária, autoincremento                                   |
| `status`           | TEXT      | sim         | Enum: `pendente`, `pago`, `cancelado`                            |
| `tipo`             | TEXT      | sim         | Enum: `entrada`, `despesa`                                       |
| `descricao`        | TEXT      | sim         | Descrição do lançamento                                          |
| `valor`            | REAL      | sim         | Valor bruto do lançamento (em R$)                                |
| `veterinario`      | TEXT      | não         | Nome do veterinário relacionado                                  |
| `valorVeterinario` | REAL      | não         | Valor destinado ao veterinário (em R$)                           |
| `motorista`        | TEXT      | não         | Nome do motorista relacionado                                    |
| `valorMotorista`   | REAL      | não         | Valor destinado ao motorista (em R$)                             |
| `mesReferente`     | TEXT      | sim         | Mês de referência no formato `YYYY-MM` (ex: `2026-02`)          |
| `data`             | TEXT      | sim         | Data do lançamento no formato `YYYY-MM-DD`                       |
| `valorImposto`     | REAL      | não         | Valor do imposto incidente (em R$)                               |
| `resultadoLiquido` | REAL      | calculado   | **Campo calculado**: `valor - valorVeterinario - valorMotorista - valorImposto` |
| `createdAt`        | TEXT      | auto        | Data de criação (ISO 8601)                                       |
| `updatedAt`        | TEXT      | auto        | Data da última atualização (ISO 8601)                            |

> **Nota**: `resultadoLiquido` deve ser calculado automaticamente pelo backend ao salvar/atualizar. Campos opcionais não informados devem ser tratados como `0` no cálculo.

---

## API REST — Endpoints

Base URL: `http://localhost:3001/api`

| Método   | Rota                  | Descrição                                      |
|----------|-----------------------|------------------------------------------------|
| `GET`    | `/lancamentos`        | Lista todos os lançamentos (com filtros opcionais) |
| `GET`    | `/lancamentos/:id`    | Retorna um lançamento por ID                   |
| `POST`   | `/lancamentos`        | Cria um novo lançamento                        |
| `PUT`    | `/lancamentos/:id`    | Atualiza um lançamento existente               |
| `DELETE` | `/lancamentos/:id`    | Remove um lançamento                           |

### Filtros no GET `/lancamentos` (query params opcionais)
- `tipo` — filtrar por `entrada` ou `despesa`
- `status` — filtrar por `pendente`, `pago` ou `cancelado`
- `mesReferente` — filtrar por mês (ex: `2026-02`)

### Resposta padrão
```json
{
  "success": true,
  "data": { ... }
}
```
Em caso de erro:
```json
{
  "success": false,
  "error": "mensagem do erro"
}
```

---

## Frontend — Tela Principal

### Listagem (tabela)
- Exibir todos os lançamentos em uma tabela com todas as colunas do modelo.
- Colorir linhas por tipo: **verde claro** para entradas, **vermelho claro** para despesas.
- Permitir filtrar por **tipo**, **status** e **mês referente** (dropdowns acima da tabela).
- Exibir um resumo no topo: **Total Entradas**, **Total Despesas**, **Saldo Líquido**.
- Botões de **Editar** e **Excluir** em cada linha.

### Formulário (cadastro/edição)
- Modal ou seção expansível para criar/editar lançamentos.
- Campos do formulário conforme modelo de dados (exceto `id`, `resultadoLiquido`, `createdAt`, `updatedAt`).
- Validação no frontend: campos obrigatórios, valor numérico positivo, formato de data.
- Botão **Salvar** e **Cancelar**.

### UX
- Interface responsiva (funcionar em desktop e mobile).
- Usar CSS simples ou uma lib de componentes leve (ex: CSS modules ou styled-components).
- Feedback visual ao salvar/excluir (toast ou mensagem inline).

---

## Requisitos Técnicos

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Banco de dados**: SQLite em memória via `better-sqlite3` (fácil de trocar por persistente depois)
- **Porta**: 3001
- **CORS**: habilitado para `http://localhost:5173` (porta padrão do Vite)
- **Validação**: Validar dados de entrada nos endpoints (campos obrigatórios, tipos corretos)
- **Scripts**: `npm start` para iniciar o servidor, `npm run dev` para modo com hot-reload (nodemon)

### Frontend
- **Framework**: React 18+ com Vite
- **Porta**: 5173 (padrão Vite)
- **HTTP Client**: `fetch` nativo ou `axios`
- **Scripts**: `npm run dev` para desenvolvimento, `npm run build` para produção

---

## Estrutura de Pastas Sugerida

```
salva-service/
  backend/
    package.json
    server.js              # Entry point — Express + config
    db.js                  # Inicialização do SQLite em memória + criação da tabela
    routes/
      lancamentos.js       # Rotas CRUD de lançamentos
    middleware/
      errorHandler.js      # Middleware de tratamento de erros
  frontend/
    package.json
    vite.config.js
    index.html
    src/
      App.jsx
      App.css
      components/
        LancamentoTable.jsx    # Tabela de listagem
        LancamentoForm.jsx     # Formulário de cadastro/edição
        LancamentoFilters.jsx  # Filtros (tipo, status, mês)
        ResumoFinanceiro.jsx   # Cards de resumo (totais)
      services/
        api.js                 # Funções de chamada à API
```

---

## Como Executar

```bash
# Backend
cd salva-service/backend
npm install
npm run dev

# Frontend (em outro terminal)
cd salva-service/frontend
npm install
npm run dev
```

O frontend estará disponível em `http://localhost:5173` e o backend em `http://localhost:3001`.

---

## Observações
- O sistema deve ser simples, focado em produtividade e facilidade de uso.
- O backend pode ser expandido futuramente para persistência real (SQLite em arquivo) e autenticação.
- Ao reiniciar o backend, os dados são perdidos (banco em memória). Isso é intencional para desenvolvimento.
- O `resultadoLiquido` nunca deve ser enviado pelo frontend — é sempre calculado pelo backend.
