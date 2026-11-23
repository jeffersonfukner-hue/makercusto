# Auditoria de aderência — 39 homologações MakerCusto

**Data da verificação:** 22/11/2026 (Brasília).  
**Objeto:** contratos homologados em 20/11/2026 versus branch `feat/fundacao-makercusto`, código-fonte, testes de interface e inventário de tabelas do Supabase MakerCusto `bxtbfdddcxbyaomydgxn`.  
**Escopo:** leitura de código, documentação normativa e metadados de banco. **Sem teste operacional integral de estoque/produção, sem ensaio de invasão/isolamento entre usuários e sem homologação visual deste lote.**

## Critério de evidência

- **P — Parcial comprovado:** existe implementação relacionada, mas ainda não cobre toda a política homologada ou não foi validada de ponta a ponta.
- **A — Ausente na implementação inspecionada:** não foi encontrado fluxo funcional correspondente no código e nas APIs consultadas. Tabela vazia no banco **não** comprova operação.
- **C — Completo comprovado:** comportamento integral, segurança e testes da política demonstrados. **Nenhuma das 39 políticas alcançou C nesta auditoria.**
- Esta matriz avalia **políticas como unidades únicas** (P01-A–F integram apenas P01). Não confundir *homologação da decisão* com *homologação da implementação*.
- **Fontes normativas:** `PLANO_MESTRE_MAKERCUSTO.md` §2 [E], `HOMOLOGACAO_PERMISSOES_2026-11-20.md` [D], `HOMOLOGACAO_CADASTROS_2026-11-20.md` [T], `HOMOLOGACAO_ESTOQUE_2026-11-20.md` [S], `HOMOLOGACAO_PRODUCAO_2026-11-20.md` [R], `HOMOLOGACAO_*_P01..P09_2026-11-20.md` [P01..P09], `HOMOLOGACAO_CONCILIACAO_EXCEPCIONAL_GAP01_2026-11-20.md` [G1], `HOMOLOGACAO_PERMISSOES_GAP02_2026-11-20.md` [G2].

## Matriz individual — 39 políticas

| ID | Fonte | Exigência homologada (síntese fiel) | Estado | Evidência e principal lacuna |
| --- | --- | --- | :---: | --- |
| E01 | [E] §2.1 | Referências globais protegidas; personalização por cópia independente, renomeável, versionada, sem alterar original | P | `App.tsx`, `FilamentProfilePanel.tsx` e `supabase.ts`: seleção global, clones locais e impressora da oficina; falta comprovar ciclo completo, versões e proteção de todas as entidades no servidor. |
| E02 | [E] §2.2 | Compartilhado: publicação para Compartilhado/Full, leitura nesses planos; só autor/admin edita | A | `supabase.ts` não implementa publicação, permissões por assinatura nem leitura de fichas publicadas. |
| E03 | [E] §2.3 | Full privado por padrão; publicação voluntária de cópia separada; leitura de Compartilhado | A | Não há fluxo Full/assinatura/publicação na UI/API inspecionada. |
| E04 | [E] §2.4 | Estoque de matéria-prima, comprados e acabados com movimentos auditáveis | P | L1 criou RPC para inventário inicial com lote, movimento e evento atômicos; ainda sem compra, consumo/baixa ou estoque de acabados. Teste reversível, nenhum saldo real lançado. |
| E05 | [E] §2.5 | Kit com peças fabricadas, itens comprados, ferramentas e montagem | P | `ProductWorkspace.tsx` e `mc_product_components` cobrem peças fabricadas, revisão e custo informado; não incluem componentes comprados, ferramentas e serviços de montagem. |
| D01 | [D] 1 | Rascunhos Compartilhado privados, publicação apenas mediante confirmação | A | Fluxo de rascunho/publicação Shared ausente. |
| D02 | [D] 2 | Downgrade preserva dados/privacidade e bloqueia novas operações pagas | A | Transições e validação de assinatura não implementadas. |
| D03 | [D] 3 | Somente fichas descritivas publicáveis; jamais compras, saldos, custos e dados financeiros particulares | A | Não há endpoint/publicação com allowlist de campos auditável; a separação conceitual no esquema não comprova esta política. |
| D04 | [D] 4 | Cópia com ID novo, referência e versão da origem, renomeável, independente | P | `FilamentProfilePanel.tsx` guarda clone com `sourceId` no localStorage; cobertura incompleta de versões/cópias remotas de todas as classes. |
| D05 | [D] 5 | Gratuito não lê fichas Compartilhado; continua lendo globais | P | `loadPrinterModels` lê `scope=global`; não existe catálogo Shared funcional para verificar negação por plano em testes. |
| D06 | [D] 6 | `workspace_id` preparado para isolamento e crescimento multi-oficina | P | 33 tabelas públicas listadas com RLS ligado; `mc_workspaces` e vinculação à oficina existem; testes cruzados de IDs e permissões ainda não demonstrados. |
| D07 | [D] 7 | Preço real do lote consumido como prioridade; snapshot imutável | P | `mc_cost_snapshots` e RPC de revisão existem, mas `mc_stock_lots` vazio e cálculo `src/domain/cost.ts` usa preços informados em `number`, sem consumo por lote real. |
| D08 | [D] 8 | Só administração autorizada mantém/versiona globais; usuário sugere, com curadoria | P | Referências globais consultáveis; fluxo auditado de sugestão/moderação/versionamento administrativo ausente. |
| T01 | [T] 1 | Tabelas específicas para tipo/cor/marca/modelo/definição de filamento | P | Existe `mc_catalog` genérica, `mc_filaments` e referências de impressoras; não há o conjunto de entidades específicas homologadas como estrutura principal. |
| T02 | [T] 2 | Impressora física particular separada do modelo global; ID/valor/potência/vida/histórico próprios | P | `mc_printers` com campos próprios e `model_id`; histórico efetivo por unidade não demonstrado. |
| T03 | [T] 3 | Tarifa elétrica própria da oficina; ajuste pontual e valor histórico congelado | P | `mc_energy_tariffs` existe vazia; calculadora aceita tarifa manual; não comprova registro/histórico de tarifa da oficina. |
| T04 | [T] 4 | Definição de filamento, compra e bobina/lote em entidades separadas | P | Tabelas `mc_filaments`, `mc_purchases`, `mc_stock_lots` separadas; sem fluxo funcional de compra/bobina e custo histórico. |
| S01 | [S] 1 | Identidade estocável própria por oficina com vínculos verificáveis e sem expor saldos | P | `mc_inventory_items` e `workspace_id` estruturados; sem operações ou teste entre oficinas. |
| S02 | [S] 2 | Bloquear saldo negativo ordinário; ajustes justificados e rastreáveis | A | Sem endpoint de movimento/validação de saldo disponível em uso; não inferir regra de tabela vazia. |
| S03 | [S] 3 | Baixa física somente após confirmação de produção, nunca na simulação | P | Cadastro/cálculo atuais não baixam estoque; falta mecanismo efetivo de confirmação e baixa idempotente. |
| S04 | [S] 4 | BOM de kit versionada; histórico imutável; incluir fabricados/comprados/ferramentas/montagem | P | `mc_product_revisions` e `mc_product_components` reais; ainda só peças fabricadas e sem execução ligada à revisão usada. |
| S05 | [S] 5 | Rateio explícito por tipo de saída em mesa mista, sem divisão arbitrária | A | `mc_cost_pools`/`mc_cost_allocations` vazias; motor atual não aceita uma mesa com saídas distintas e bases explícitas por categoria. |
| S06 | [S] 6 | Estorno com novo evento vinculado, motivo/autor/data, sem reescrever original | A | Sem operações de estoque confirmado/estorno na API; `mc_stock_movements` vazio. |
| R01 | [R] RES | Reserva opcional lógica, sem baixa, com saldo físico menos reservas e reconciliação | A | `mc_production_reservations` existe vazia; fluxo/reserva por execução ausentes da API. |
| R02 | [R] PAR | Confirmações incrementais e idempotentes, contabilizando só novos consumos e saídas | A | `mc_production_confirmations` vazia; sem API de confirmações. |
| R03 | [R] FAL | Falha pode consumir material e tempo com zero peças boas; perda separada | A | `mc_production_failures` vazia; sem operação de falha. |
| R04 | [R] RET | Retrabalho separado e vinculado, com novos custos/snapshots sem alterar original | A | Sem RPC/fluxo de retrabalho; revisões de produto não substituem produção retrabalhada. |
| R05 | [R] RAT | Rateio mensurável por categoria, base declarada e conciliação integral | A | Ausente fluxo de distribuição de custos por execução mista. |
| P01 | [P01] A–F | Liberação segura de sobras; expiração não libera automaticamente; origem/excedente; troca de bobina; parcial; concorrência | A | Sem mecanismo de reserva/encerramento executável e testado. |
| P02 | [P02] A–F | Confirmação parcial opcional, delta por evento, IDs/idempotência, auditabilidade, encerramento e concorrência | A | Sem confirmação física e deltas registrados; testes E2E focados em UI com REST simulado. |
| P03 | [P03] A–F | Falha total/parcial, consumo/refugo, custo separado, destinos, indicadores e trilha | A | Fluxo operacional de falhas ausente. |
| P04 | [P04] A–F | Retrabalho vinculado e custeio incremental, reimpressão como nova execução, sem produção duplicada | A | Fluxo de retrabalho e vínculo de execuções ausente. |
| P05 | [P05] A–F | Rateio por categoria (massa/cor/lote, purga, energia, máquina, trabalho, perdas) e conciliação | A | `calculateCost` soma categorias básicas; não recebe saídas múltiplas nem lotes reais, nem rateio auditado por categoria. |
| P06 | [P06] A–F | Decimal exato, precisão intermediária, half-up, resíduos por partes fracionárias/ID, snapshot monetário reconciliado | A | `src/domain/cost.ts` usa `number`/operações binárias e não implementa algoritmo decimal de rateio monetário; snapshots atuais não comprovam reconciliação exigida. |
| P07 | [P07] A–F | Aquecimento/ativo/pausas/retomada diferenciados, potência/energia por fase, sem dupla contagem | A | Motor atual usa `averageWatts × hours`; não há fases por execução. |
| P08 | [P08] A–F | Bobina pré-existente inventariada sem compra fictícia; origem/medição, custo desconhecido e conciliação | P | `mc_register_existing_spool`, `mc_list_existing_spools`, `MaterialsWorkspace.tsx` cobrem inventário inicial com proveniência de massa e custo desconhecido; sem consumo, conciliação posterior ou fechamento financeiro. |
| P09 | [P09] A–F | Estorno parcial referenciado com limites, material extrudado não volta, centavos históricos, idempotência e auditoria | A | Sem endpoint/fluxo de estorno parcial e compensações auditáveis. |
| G01 | [G1] A–F | Ocorrência física pendente separada de baixa; evidência/investigação/regularização sem inventar origem | A | `mc_inventory_issues` existe vazia; sem fluxo de ocorrência/investigação/aprovação. |
| G02 | [G2] A–F | Identidade/isolamento, capacidades por operação, autorizações especiais segregadas e auditoria | P | RPCs de cadastro consultadas verificam `auth.uid()`, membro ativo e papel básico; não cobrem matriz completa de solicitações/aprovações/estornos, nem testes cross-tenant. |

**Contagem conferida:** 5 E + 8 D + 4 T + 6 S + 5 R + 9 P + 2 G = **39**.

## Evidência técnica verificada (sem confundir estrutura com implementação)

1. **Supabase, leitura de metadados:** `list_tables` do projeto `bxtbfdddcxbyaomydgxn` retornou 33 tabelas públicas, todas com `rls_enabled=true`. Existem 4 linhas em `mc_products`, 4 em `mc_product_revisions`, 3 em `mc_product_components`, 4 em `mc_cost_snapshots`, 1 impressora em `mc_printers` e 1 oficina. As tabelas de estoque, compras, produção, reservas, confirmações, falhas, auditoria, custos por linha/pool e conciliação estão vazias. **RLS ligado não é teste de política nem prova de isolamento.**
2. **Frontend `src/data/supabase.ts`:** autenticação REST, oficinas, catálogos, impressoras, produtos e RPCs de conjuntos; não há consumo/estoque/produção/compra/estorno. `src/App.tsx`, `src/components/ProductWorkspace.tsx` e `src/components/WorkshopDashboard.tsx` cobrem simulação e cadastro, não o ciclo de fabricação confirmado.
3. **Motor `src/domain/cost.ts`:** fórmula simples, material multicor, energia total, depreciação, acessórios, montagem, margem e markup, usando `number`. **Não satisfaz P06 completo** nem vincula lote real/produção.
4. **Catálogos e UX:** `src/components/FilamentProfilePanel.tsx` guarda cópias pessoais e `sourceId` localmente; `src/components/SmartField.tsx` ajuda com sugestões; são incrementos concretos, mas não equivalem a cadastro estruturado Full/Compartilhado.
5. **Testes `tests/app.spec.ts`:** cobertura da calculadora e cadastros com REST simulado. Não há testes E2E de confirmação física, reserva, inventário, estorno, conciliação e separação por perfis/planos. CI verde não cobre tais processos.
6. **Documento em descompasso:** `docs/ARQUITETURA.md` e parte de `docs/BACKLOG.md` mantêm informações antigas (Supabase como futuro, sem autenticação); não usar esses estados como verdade atual.

## Avanço verificado do Lote L1 (22/11/2026)

- **Banco:** instaladas funções `mc_register_existing_spool` e `mc_list_existing_spools`. Cadastro inicial cria definição de filamento, item de estoque, lote de origem `initial_inventory`, evento e movimento físico em transação única, sem inventar compra ou fornecedor.
- **Segurança:** revogados `INSERT/UPDATE/DELETE/TRUNCATE/TRIGGER` diretos de `anon` e `authenticated` nas tabelas `mc_stock_events`, `mc_stock_movements` e `mc_stock_lots`. `has_table_privilege` verificou as negativas, com `anon` sem EXECUTE da RPC. A operação exige proprietário/gestor ativo na oficina.
- **Testes reais de banco, sem persistir dados:** criação com quantidade 325,125 g e custo desconhecido, replay idempotente, recusa de replay com origem divergente e bloqueio de outra oficina; leitura do saldo. Após ROLLBACK, nenhum filamento, evento ou lote de teste permaneceu; 4 produtos reais foram preservados.
- **Frontend:** módulo Materiais com registro de bobina física, proveniência `measured/informed/estimated`, custo opcional e consulta de saldos. Homologação visual e publicação manual ainda pendentes.
- **Nova contagem:** **17 parciais; 22 ausentes nos fluxos examinados; 0 integralmente comprovadas.** L1 parcial não equivale à implementação completa de P08/E04.

## Prioridade de execução — primeiro caso real: Lançador de hélices

| Lote | Entrega verificável | Regras diretamente exercitadas | Critério mínimo |
| --- | --- | --- | --- |
| L1 — Insumos reais | Registrar filamento PETG, bobina física inventariada, quantidade/custo informado com proveniência; sem fornecedor/compra fictícia | T04, S01, P08 | Filamento/bobina persistidos com origem e saldo; custo desconhecido não vira zero; isolamento de oficina |
| L2 — Impressão | Registrar execução real por impressora com três tipos de saída (lançador/haste/hélice), quantidades, tempos, material/consumo e fonte | E05, S04, R03, P07 | Não inventar gramas, energia, tempo nem lançar estoque antes de confirmação |
| L3 — Confirmação segura | Confirmar de modo idempotente, consumir bobina e registrar unidades produzidas sem saldo negativo | S02/S03, R02, P01/P02, G02 | Reenvio não duplica, recusa saldo insuficiente, eventos e autoria auditáveis |
| L4 — Custo conciliado | Preço real da bobina; perdas/purga e energia separadas, rateio explícito entre as três peças, precisão P06 | D07, S05, R05, P05–P07 | Total e parcelas conciliados em centavos; sem base de rateio, pendência explícita |
| L5 — Recuperação e exceções | Falha, retrabalho, reversão parcial e conciliação com auditoria, preservando snapshots | S06, R03/R04, P03/P04/P09, G01/G02 | Eventos compensatórios, sem retorno fictício de material extrudado nem duplicação de produto |
| L6 — Planos e governança | Catálogos/assinaturas Compartilhado e Full, cópias publicadas e proteção fina de autor/privacidade | E01–E03, D01–D08, T01/T02 | Testes de autorização com usuários/planos/oficinas distintos antes de expor fichas publicamente |

**Bloqueio de segurança:** não habilitar confirmação de produção ou estoque financeiro pela UI antes de verificar idempotência, políticas de acesso, concorrência, saldos e integridade das transações. Prototipar gravações não contorna homologações.

## Próxima implementação sem reabrir decisões

- Iniciar **L1** sobre tabelas existentes, sem pressupor seus contratos completos; antes de código/SQL, inspecionar FKs, checks, grants e RLS específicos.
- Prosseguir **L2 e L3** de forma transacional e testável, usando *uma impressão real com três componentes*, sem simular compras nem quantidades.
- Registrar a cada lote evidências (migração, consulta, teste, commit e CI), atualizar esta matriz **somente** ao comprovar as exigências. Nunca considerar política completa por existir uma tabela.
- Não fazer merge/deploy ou publicar alterações, reservados ao proprietário.

## Limites desta auditoria

Esta é uma **matriz de aderência a partir dos arquivos consultados**, não uma certificação de segurança do Supabase ou uma varredura exaustiva de todos os gatilhos e funções SQL. Estados “A” indicam ausência de fluxo observável na implementação examinada, sem afirmar impossibilidade técnica ou inexistência de qualquer rotina interna não inspecionada. A homologação funcional exige testes de banco reais com reversão, permissões cruzadas, CI e aceitação visual do proprietário.
