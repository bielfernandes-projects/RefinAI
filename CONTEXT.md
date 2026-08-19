# RefinAI - Contexto do Projeto

## Visao Geral

**RefinAI** e um Micro-SaaS voltado para Product Owners/Managers brasileiros, posicionado como "Canivete Suico do PO". Oferece 8 modulos de IA para refinamento de backlog, priorizacao, geracao de specs tecnicas e simulacao de certificacoes PSPO.

## Stack Tecnologica

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| UI | shadcn/ui + Lucide Icons, dark mode nativo |
| Auth/DB | Supabase (PostgreSQL + Auth + RLS + Realtime) |
| IA | Google Gemini 1.5 Flash (padrao) + BYOK (OpenAI, Anthropic) |
| Pagamentos | Stripe (checkout lifetime) |
| Deploy | Vercel (preview + production) |
| CI/CD | GitHub Actions (typecheck, lint, test, build) |

## Dominio do Negocio

### Terminologia Chave (DDD Glossario)

| Termo | Definicao | Observacao |
|-------|-----------|------------|
| **Projeto** | Container de alto nivel, multiplos por usuario. Isola demands, roadmap e contexto. | Unidade de escopo maxima. |
| **Contexto do Projeto** | JSON com nicho, stack, tamanho do time, QA, metodologia. Armazenado em `projects.context_json`. | Usado por todos os modulos para contextualizar IA. |
| **Demanda** | Unidade atomica de trabalho: user story, bug, task ou epic pequena. | Unidade minima de producao. |
| **Epico** | Demanda com `type: 'epic'` e `parent_demand_id` self-referential. | Container de historias. |
| **Kanban** | Quadro de status customizavel por projeto via `project_statuses` com `phase` enum. | 3 defaults: draft, refining, finished. |
| **Fase** | Enum `draft`, `refining`, `finished` ou `null`. Controla visibilidade no roadmap. | `finished` = pronto para release. |
| **RICE** | Framework de priorizacao: Reach x Impact x Confidence / Effort. | Ranking paralelo com GUT. |
| **GUT** | Framework de priorizacao: Gravidade x Urgencia x Tendencia. | Ranking paralelo com RICE. |
| **Spec** | Especificacao tecnica gerada pela IA em Markdown estruturado. | Output do Modulo 1. |
| **Detetive de Gaps** | Fase 1 do Modulo 1: IA identifica lacunas no rascunho. | Gera perguntas estruturadas. |
| **Pseudo-codigo** | Output do Modulo 4 em TypeScript-like. | Regras de negocio em formato tecnico. |
| **Vertical Slicing** | Modulo 5: quebra historias em fatias verticais por funcionalidade. | Cria demands filhas. |

### Modulos do Produto

| # | Modulo | Descricao | Status |
|---|--------|-----------|--------|
| 1 | Tradutor de Demanda | Rascunho -> Perguntas -> Spec Markdown | MVP |
| 2 | Priorizador | RICE + GUT lado a lado | MVP |
| 3 | Tradutor Reverso | Nivelar demanda para 3 audiencias | MVP |
| 4 | Desdobrador | Demanda -> Pseudo-codigo TS | MVP |
| 5 | Fatiador de Epicos | Vertical slicing em stories | MVP |
| 6 | Release Notes | 3 artefatos de demandas finished | MVP |
| 7 | Roadmap | Now/Next/Later + OKRs + drag-drop | MVP |
| 8 | Simulador PSPO | PSPO I (80q) + PSPO II (40q) | MVP |

### Fluxo Principal (Modulo 1)

```
Rascunho (textarea)
    |
    v
Fase 1: Detetive de Gaps (IA)
    |
    v
Perguntas estruturadas (categorias: data_origin, edge_case, business_rule, acceptance_criteria)
    |
    v
Respostas do usuario
    |
    v
Fase 2: Gerador Lean (IA + contexto + rascunho + respostas)
    |
    v
Spec Markdown estruturado
    |
    v
[Export] Copy Jira | Copy Bitrix | Salvar como Demand
```

## Decisoes de Design

- **Pricing**: Lifetime Deal unico (R$ 19,90-29,90), BYOK e feature, nao tier
- **Idioma**: Tudo em PT-BR. Questoes do simulador em PT-BR
- **Dark mode**: Nativo, padrao do produto
- **Audio input**: NAO incluido no MVP
- **PSPO III**: Fora do MVP
- **Export PNG**: Roadmap via html2canvas
- **Prompt injection hardening**: System messages estritos, JSON schema forocado

## Infra

| Recurso | Identificador |
|---------|---------------|
| GitHub Org | `bielfernandes-projects` |
| GitHub Repo | `RefinAI` |
| Vercel | Projeto linkado ao repo |
| Supabase | `bccjuxdwpgqhicgohtgi` |
| Dominio (futuro) | `refinai.com.br` |
| Dominio (atual) | `refinai.gf.dev.br` |
