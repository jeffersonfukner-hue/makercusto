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
| S02 | [S] 2 | Bloquear saldo negativo ordinário; ajustes justificados e rastreáveis | P | CI PostgreSQL descartável #45095409926 comprova rejeição transacional de baixa acima do saldo para confirmação sem reserva; ainda faltam ajustes, concorrência multi-sessão e outras operações. |
| S03 | [S] 3 | Baixa física somente após confirmação de produção, nunca na simulação | P | Cadastro/cálculo atuais não baixam estoque; falta mecanismo efetivo de confirmação e baixa idempotente. |
| S04 | [S] 4 | BOM de kit versionada; histórico imutável; incluir fabricados/comprados/ferramentas/montagem | P | `mc_product_revisions` e `mc_product_components` reais; ainda só peças fabricadas e sem execução ligada à revisão usada. |
| S05 | [S] 5 | Rateio explícito por tipo de saída em mesa mista, sem divisão arbitrária | A | `mc_cost_pools`/`mc_cost_allocations` vazias; motor atual não aceita uma mesa com saídas distintas e bases explícitas por categoria. |
| S06 | [S] 6 | Estorno com novo evento vinculado, motivo/autor/data, sem reescrever original | A | Sem operações de estoque confirmado/estorno na API; `mc_stock_movements` vazio. |
| R01 | [R] RES | Reserva opcional lógica, sem baixa, com saldo físico menos reservas e reconciliação | P | Migração P01 preparada na branch (não aplicada): RPC de reserva, saldo físico menos reservas, auditoria e conciliação incremental; CI #45102955980 aprovou SQL e disputa concorrente; fechamento/cancelamento e JWT real pendentes. |
| R02 | [R] PAR | Confirmações incrementais e idempotentes, contabilizando só novos consumos e saídas | P | RPC L3 executada no PostgreSQL 17 efêmero; teste de delta, replay idempotente e payload divergente aprovado; ainda falta conciliação de reservas, snapshots monetários e autenticação real. |
| R03 | [R] FAL | Falha pode consumir material e tempo com zero peças boas; perda separada | A | `mc_production_failures` vazia; sem operação de falha. |
| R04 | [R] RET | Retrabalho separado e vinculado, com novos custos/snapshots sem alterar original | A | Sem RPC/fluxo de retrabalho; revisões de produto não substituem produção retrabalhada. |
| R05 | [R] RAT | Rateio mensurável por categoria, base declarada e conciliação integral | A | Ausente fluxo de distribuição de custos por execução mista. |
| P01 | [P01] A–F | Liberação segura de sobras; expiração não libera automaticamente; origem/excedente; troca de bobina; parcial; concorrência | P | Na branch: reserva lógica, idempotência, consumo parcial, auditoria de excedente por bobina e duas reservas concorrentes testadas no CI. Ainda sem aplicação no banco real, expiração sinalizada, cancelamento/encerramento e fluxo de troca de lote. |
| P02 | [P02] A–F | Confirmação parcial opcional, delta por evento, IDs/idempotência, auditabilidade, encerramento e concorrência | P | CI PostgreSQL #45095409926 validou confirmação inicial, autoria em auditoria, replay e bloqueio de saldo; encerramento, concorrência em duas sessões e reserva ativa ainda bloqueados. |
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


## Progresso L2/L3 em código — 22/11/2026 (ainda sem comprovação operacional do banco)
- A migração `20261122212500_print_execution_l2_l3.sql` e o módulo Impressões adicionam registro descritivo de execução com impressora física, saída(s), quantidade e proveniência; não atribuem consumo automaticamente.
- Confirmações incrementais foram implementadas **em SQL versionado** com chave idempotente, conferência de payload, bloqueio transacional, validação de saldos e registros de saída/consumo. Nenhuma execução real foi contabilizada.
- L3 tem limites explícitos: não encerra produção nem concilia reserva ativa; não realiza rateio financeiro nem cria snapshot monetário completo de confirmação. Fluxos de exceção, reversão e perdas completas permanecem pendentes.
- Não alterar contagem de 17 P / 22 A / 0 C até a migração ser aplicada e os testes de banco e autorização comprovarem os novos comportamentos. O CI com REST simulado valida somente o frontend.


## Pré-validação complementar L2/L3 (22/11/2026)
- Leitura do banco confirmou migrações L1 presentes, mas funções e tabela de eventos L2/L3 **ainda não instaladas**; sem migração de teste aplicada.
- Existe roteiro de regressão transacional reversível em `supabase/tests/l2_l3_rollback.sql`, versionado e **não executado**. Até execução isolada real, não reclassificar P02, S02, S03 ou G02 como completas.
- Revisão do código incluiu restrição explícita de lote de filamento em gramas e identificação não nula de peça. Concorrência entre sessões e autorização por login real não foram testadas.


## Complemento de evidência L3 — 22/11/2026
- O frontend agora rejeita deltas fracionários por saída, excesso acima das peças planejadas pendentes e massa com precisão superior a 0,001 g.
- Testes de retry da confirmação com mesma chave de idempotência e rejeições locais aprovados em ambiente REST simulado; CI #45094382511: 86 Playwright desktop/mobile, tipos, unitários e build, `success`.
- **Sem mudança de classificação** das 39 políticas: o backend L3 permanece como migração não aplicada; testes reais transacionais, isolamento entre usuários, concorrência, reservas e snapshot conciliado continuam ausentes.

## Atualização de aderência verificada — PostgreSQL 17 efêmero, 22/11/2026
- **CI:** #45095409926 (`success`, commit `cd1f58729587c279e822d5b972ab9f998ab2bc03`). SQL de fundação, inventário inicial L1, registro de impressão L2 e confirmação L3 aplicado e testado somente em banco descartável com fixtures sintéticas.
- **Reclassificação justificada:** S02 A→P, R02 A→P, P02 A→P. **Estado corrente: 20 parciais, 19 ausentes, 0 completas.** As contagens históricas L1 (17/22) acima permanecem registros da etapa anterior.
- **Testes SQL positivos:** L2 não movimenta estoque; L3 lança somente o delta; replay de mesma chave e payload retorna confirmação original; payload diferente rejeitado; estoque insuficiente rejeitado com saldo preservado; identidade alheia rejeitada; `anon` sem EXECUTE; `ROLLBACK` não persistiu produção.
- **Não comprovado:** fluxo de usuários autenticados reais, RLS cruzado por oficinas distintas, concorrência multi-sessão, consumo com reserva ativa, snapshots de confirmação, produção em estoque de acabados, encerramento e rateio financeiro. Nenhuma das 39 homologações recebeu status C.
- **Sem alterações no Supabase operacional**, merge ou deploy; persistência ocorreu apenas no container temporário de CI.

## Verificação de concorrência e isolamento L3 — 22/11/2026
- **CI #45095841121** (`success`, `20dac01db2c3b7889f8586da237bf8f6357d8dac`): PostgreSQL 17 descartável com duas sessões simultâneas consumindo a mesma bobina, duas ordens distintas e 10 g de saldo. Uma baixa de 7 g aprovada, segunda recusada, saldo físico final de 3 g e somente uma confirmação persistente. Verificados isolamento de leitura de produção/movimentos e rejeição de confirmação por identidade sintética não membro.
- Esta evidência amplia a cobertura **parcial** de S02, R02, P02 e G02. **A contagem mantém 20 parciais, 19 ausentes e 0 completas**, preservando as 39 homologações.
- **Limitações:** testes executados no container PostgreSQL do GitHub Actions com identidade simulada e sem Supabase Auth real. Não comprovam autorização efetiva com JWT de usuários reais; confirmação com reservas ativas, produção em estoque acabado, snapshots monetários, estornos, rateio e encerramento permanecem pendentes. Nenhuma migração L2/L3 foi aplicada no Supabase operacional.

## Preparação de aplicação real L2/L3 — 22/11/2026
- Verificados por leitura os objetos reais no Supabase MakerCusto: L2/L3 ausentes, zero produções/confirmações/lotes/movimentos, PostgreSQL 17.12. Preflight de leitura executado sem erros; não houve aplicação DDL.
- **CI #45099111748 (`success`)** validou preflight e postflight SQL no PostgreSQL 17 efêmero, após executar a migração. Também passou regressão de rollback, duas confirmações concorrentes, isolamento sob identidade simulada, tipagem, unitários, build e **86/86 Playwright**.
- Plano de implantação com gates e recuperação documentado em `docs/PLANO_APLICACAO_CONTROLADA_L2_L3.md`; sem execução operacional autorizada. **Contagem preservada: 20 P, 19 A, 0 C.**
- Requisitos ainda não cobertos: JWT real e RLS com usuários Supabase reais, reservas ativas, snapshots financeiros, estoque de acabados, estornos e fechamento definitivo.


## Implantação do esquema L2/L3 — 22/11/2026
- Migração `print_execution_l2_l3` aplicada **com autorização do proprietário** exclusivamente ao Supabase MakerCusto: histórico `20261123022622`. Preflight e postflight no banco real executados sem erro. RPCs `mc_create_print`, `mc_confirm_print` e `mc_list_prints` e tabela `mc_production_output_events` existem, com RLS/grants pós-verificados.
- Nenhuma produção, confirmação ou movimento de estoque foi gerado durante a aplicação. **Permanece 20 P, 19 A, 0 C**: esquema presente ≠ fluxo de negócio integralmente homologado.
- Testes reais de Supabase Auth (sessão/JWT/usuários e oficinas), reservas, fechamento e snapshots continuam pendentes. Frontend ainda não publicado; nenhuma homologação visual adicional.

## Evidência de isolamento multi-oficina — 22/11/2026
- CI #45101156582 **success** (SHA `00e79a1c1612cab8eaba0fb6da1102776a99604e`). Regressão SQL passou com duas oficinas contendo impressões distintas. Cada proprietário fictício viu os dados da própria oficina e **não** viu os da outra, tanto por `mc_list_prints` quanto por RLS em `mc_productions`.
- Supabase MakerCusto real: grants de três RPCs validados, `anon` sem EXECUTE; tabela de deltas com RLS ativo e `authenticated` sem INSERT. Base operacional ainda sem impressões/confirmacões/movimentos.
- Limite: isolamento de duas oficinas foi comprovado **somente no PostgreSQL descartável com identidades simuladas**, não com JWT real de Supabase Auth. Nenhuma política reclassificada; permanecem **20 P, 19 A, 0 C** e as 39 homologações preservadas.

## Evidência L3 para FAL e tempo incremental — 22/11/2026
- Interface permite tempo físico incremental (h, até 4 casas) **opcional**, enviado à RPC sem valores presumidos; suporta falha com zero peças boas e unidades rejeitadas.
- CI #45101704098 `success`: teste SQL de falha com 0 boas, 1 rejeitada, 1 g e 0,5 h, preservando saldo e resultado do produto; teste Playwright de tempo, retry idempotente e precisão; 86/86 E2E e demais verificações aprovadas.
- Implementação permanece **parcial**, sem alterar a contagem **20 P, 19 A, 0 C**, pois as regras FAL/RAT/RET e demais diretrizes exigem ainda conciliação, snapshots, autorizações JWT reais e validação de fluxo completo. Nenhum deploy ou migração adicional ocorreu.

## Avanço P01 comprovado no CI isolado — 22/11/2026
- **CI #45102955980** (`success`, commit `728fa31b0df4b1f7ff41e3fab98c89a92c970b10`): PostgreSQL 17 descartável, reserva opcional lógica por lote e baixa parcial conciliada; proteção de reserva alheia e disponibilidade; replay idempotente; auditoria de excedentes; corrida P01-F (duas reservas simultâneas 60 g cada sobre bobina de 100 g: 1 aprovada, 1 negada, físico 100 g, reserva 60 g). Testes Playwright 88/88 aprovados.
- **Reclassificação apenas do código na branch:** R01 A→P e P01 A→P. **Estado atual da matriz: 22 P, 17 A, 0 C**. As contagens 20/19 anteriores permanecem como referência histórica do estágio L2/L3.
- **Não comprovado/não instalado:** a migração P01 ainda não foi aplicada no Supabase MakerCusto, nem houve JWT de usuário real, publicação do frontend ou aceite visual. P01-A/B/E e GAP01 completos, fechamento seguro, reservas de kits e ajustes excepcionais continuam pendentes. Não alterar as 39 decisões homologadas.


## Complemento P01-A/B e P01-F — 23/11/2026
- **CI #45104085956** (`success`, `53a3456c4893bfbee8d64c73b8deb5826f4eec74`): PostgreSQL 17 descartável com cancelamento auditado de ordem aberta e liberação do saldo lógico de reserva sem reverter consumos reais; prazo opcional sinalizado, sem liberação automática; RPCs protegidas por owner/manager; rejeição de payload divergente em retry; corrida entre cancelamento e confirmação transacional testada; **90/90 Playwright**, tipos, unitários e build aprovados.
- A regra P01-A é parcial porque **encerramento definitivo** continua bloqueado até custeio; P01-B possui implementação inicial de data de revisão manual. As políticas R01/P01 continuam **P** e a matriz permanece com **22 parciais, 17 ausentes e nenhuma completamente validada**.
- **Ainda ausentes neste lote:** cancelamento parcial P01-E com redução de necessidade, troca de lote e liberação proporcional auditada (P01-D), conciliação excepcional GAP01, estoque acabado, snapshots financeiros, testes de JWT reais e homologação visual.
- **Não aplicado** no Supabase operacional; sem merge/deploy. As 39 homologações documentais não foram modificadas.


## Evolução P01-E: redução parcial auditada, CI 23/11/2026
- **CI #45105318775 `success` (SHA `92e310ed365cae2b25a7ac963da1ca30c4498420`)**: 92 Playwright desktop/mobile, SQL PostgreSQL efêmero com rollback, concorrência, RLS, tipos, unitários e build. Redução explícita da quantidade não produzida, sem diminuir boas/rejeitadas confirmadas; reservas liberadas somente por gramas informados e justificativa, com histórico anterior preservado, auditoria e idempotência. UI com validação de quantidade e liberação por reserva.
- **P01-E evoluiu dentro da política P01, que continua parcial (P)**: falta UI de múltiplas saídas e liberação multi-bobina atômica, integração com usuário real e homologação visual; P01-D troca de bobina, GAP01 e encerramento definitivo também pendentes. **Contagem permanece 22 P, 17 A e 0 C; nenhuma das 39 diretrizes foi re-homologada ou recontada.**
- Migração P01-E ainda **não aplicada no banco operacional**; nenhum merge/deploy.


## P01-D — Troca de bobina e custos históricos, evidência 23/11/2026
- CI #45107132919 `success`, commit `01ec36ecfa8698e985fe1cd8a8303a144589aeee`: 94/94 Playwright desktop/mobile, PostgreSQL 17 efêmero com rollback, serialização de duas trocas concorrentes, idempotência, limite de saldo, auditoria e autorização. O teste confirmou separação de 180 g do lote A a 0,068 R$/g e 120 g do lote B a 0,073 R$/g, com snapshots imutáveis; custo total R$21,00 **apenas no exemplo sintético**. Troca de reserva não gerou movimentação de estoque; consumo posterior foi confirmado individualmente por lote.
- **P01-D avançou dentro de P01, que continua status P. R01 também permanece P.** Aderência global mantém **22 parciais, 17 ausentes e 0 completas**, sem alterar as 39 homologações nem considerar validação visual ou JWT real.
- Migrações complementares P01 (incluindo `20261123003500_print_reservation_p01_lot_swap.sql`) permanecem **somente na branch**; Supabase operacional não alterado. GAP01, custos financeiros/fechamento L4, tratamento de inconsistências físicas, aprovações extraordinárias e operação autenticada com usuários reais seguem pendentes.


## GAP01-A: ocorrência física pendente — evidências 23/11/2026
- **CI #45108226913 `success`** (commit `d94edd1a4deba1dc4f90c0d9aaa649c6fb15b7fa`): 96/96 Playwright desktop/mobile, TypeScript, unitários, build, testes PostgreSQL com rollback, concorrência de estoque e isolamento entre oficinas. Migração e UI GAP01-A registram ocorrência física com autor, momento informado, quantidade observada, fonte, possível lote e evidência, **independentemente do saldo contábil**, sem afetar estoque, confirmações ou preço histórico. Reenvio idempotente e permissão por oficina comprovados em CI descartável.
- GAP01 continua **P**, não se deve reclassificar como completa porque investigação, aprovação excepcional, correção de inventário, estorno referenciado e estados definitivos estão ausentes. Aderência global mantém **22 P, 17 A, 0 C**, sem modificar as 39 homologações originais.
- Migração `20261123005500_gap01_physical_occurrences.sql` ainda **NÃO aplicada no Supabase MakerCusto real**; sem JWT real e sem homologação visual. Nenhum merge ou deploy.


## GAP01-B/F — investigação e transições pendentes, evidência 23/11/2026
- CI #45113967113 `success` (SHA funcional `926ef0f9eb6da8a246867b7a28f968af18f76d15`): 98/98 Playwright desktop/mobile, PostgreSQL descartável com rollback, isolamento por oficina, concorrência, tipos, unitários e build. Investigação append-only com hipótese/evidência/autor, observação original preservada, estados `registered/under_review/pending_decision` e replay idempotente sem estoque, custo ou aprovação extraordinária.
- **A GAP01 permanece P:** não inclui avaliação da suficiência da prova, proposta de ajuste/compensação, autorização de regularização, custo financeiro, estorno, nem aceite visual ou JWT real. **Matriz global permanece 22 P, 17 A, 0 C**; preservar integralmente as 39 homologações.
- Migração GAP01-B/F ainda **não aplicada ao Supabase MakerCusto operacional**, sem merge ou deploy.
