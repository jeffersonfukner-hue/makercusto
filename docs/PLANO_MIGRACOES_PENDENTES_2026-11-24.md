# MakerCusto — plano de atualização do Supabase (24/11/2026)

## Escopo e autorização
- **Plano somente leitura / documentação. Não executar DDL, DML, migrações ou alterações operacionais sem autorização explícita do proprietário.**
- Fonte: branch `feat/fundacao-makercusto`, PR #1; inventário das migrações no GitHub; consultas de catálogo e histórico por conector Supabase do projeto **MakerCusto** (não o LAB).
- CI #500 https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45441395716 aprovado no SHA `d51bb995a262cc3f32b3ccf94e8280445523409e`; CI valida testes com banco descartável, **não equivale a aplicar no banco existente**.

## Estado observado do banco
- `supabase_migrations.schema_migrations`: dez registros; último `20261123022622` (`print_execution_l2_l3`). As versões reais no banco diferem dos timestamps dos arquivos do GitHub; **não comparar nomes/versões apenas numericamente sem correspondência funcional**.
- `public.mc_list_saved_calculations(uuid)` e `public.mc_append_product_calculation(...)` inexistentes segundo `pg_proc`.
- Tabelas-base existentes segundo `to_regclass`: `mc_energy_tariffs`, `mc_services`, `mc_production_reservations`, `mc_cost_snapshots`, `mc_printers`.
- Captura do Preview: ficha do produto salva mas consulta da calculadora falha com `PGRST202`/schema cache para `mc_list_saved_calculations(p_workspace_id)`. Ausência foi confirmada, não se conclui perda de dados.

## Ordem proposta, seguindo os arquivos versionados

### Lote A — reservas e segurança de movimentos P01 (4 migrações)
1. `20261122235000_print_reservation_p01_partial.sql` — reserva parcial, confirmação e consulta.
2. `20261123001000_print_reservation_p01_lifecycle.sql` — revisão de prazo e cancelamento.
3. `20261123002000_print_reservation_p01_partial_cancel.sql` — redução parcial.
4. `20261123003500_print_reservation_p01_lot_swap.sql` — troca de bobina reservada.

### Lote B — conciliação física GAP01 (4 migrações)
5. `20261123005500_gap01_physical_occurrences.sql` — ocorrências físicas.
6. `20261123014500_gap01_investigation_tracking.sql` — investigação e histórico.
7. `20261123110500_gap01_inventory_adjustment_proposals.sql` — propostas sem efeito de estoque.
8. `20261123112000_gap01_reconciliation_dossier.sql` — leitura de dossiê.

### Lote C — fichas e calculadora (3 migrações)
9. `20261123123500_component_linked_assemblies.sql` — vínculos entre componentes/conjuntos.
10. `20261123125000_reuse_saved_calculations.sql` — RPC `mc_list_saved_calculations(uuid)` (erro atual do Preview).
11. `20261123152000_append_product_calculation.sql` — revisão de cálculo na mesma ficha.

### Lote D — L4, energia P07 e mão de obra (9 migrações)
12. `20261123190000_l4_consumption_sources_readonly.sql` — origem dos consumos.
13. `20261123200000_l4_exact_origin_capture.sql` — captura de origem exata.
14. `20261123212000_l4_close_review_pending.sql` — revisão de fechamento.
15. `20261123223000_l4_readiness_dossier.sql` — prontidão do fechamento.
16. `20261123233000_p07_energy_evidence.sql` — tarifas e intervalos.
17. `20261123234000_p07_integral_measurement.sql` — medição integral e revisões.
18. `20261124001000_l4_machine_origin.sql` — origem da máquina.
19. `20261124002000_l4_labor_evidence.sql` — evidência de serviços/mão de obra.
20. `20261124003000_l4_labor_revisions.sql` — revisão auditável de mão de obra.

## Critérios antes de autorizar a aplicação
1. Conferir o conteúdo integral dos scripts, funções substituídas, triggers, permissões e dependências com o **estado atual do banco**, incluindo objetos alterados desde a última migração.
2. Levantar os registros e constraints relevantes, principalmente reservas ativas e versões de snapshots, para antecipar conflitos. Não alterar ou saneá-los silenciosamente.
3. Executar os 20 scripts na ordem em **banco descartável clonado em estrutura compatível**, com cenários representativos e regressões SQL. Os testes do CI são evidência parcial, não simulam necessariamente dados e deriva do banco operacional.
4. Preparar backup recuperável e verificar procedimento de restauração antes da execução real. Não usar backup não testado como garantia de reversibilidade.
5. Aplicar somente após autorização específica do proprietário, com registro de cada execução, falha e validação pós-migração. Considerar transações e irreversibilidade de dados/triggers; não presumir rollback automático do lote inteiro.
6. Confirmar funções por `pg_proc` e privilégios, testes RPC autenticados do workspace correto, registros da tabela `schema_migrations`, isolamento por oficina, e retorno da consulta de cálculos no Preview. A homologação visual é exclusiva do proprietário.
7. Manter frontend compatível com a versão de banco ativa; não liberar deploy somente por CI verde. Não aplicar todas as migrações como reação isolada a um erro de uma RPC.

## Riscos e limitações
- Migrações existentes foram testadas em CI com PostgreSQL descartável, mas não foi demonstrado replay completo sobre cópia fiel do banco real.
- Existem timestamps diferentes entre versões reais registradas no Supabase e nomes dos arquivos do repositório; a correspondência deve ser feita por objetos, assinatura e efeitos, não somente por número de versão.
- Alguns scripts substituem RPCs e instalam triggers de captura/imutabilidade: efeitos sobre dados existentes requerem análise e janela autorizada.
- Algumas migrações representam módulos incompletos (L4/P07/P09); aplicá-las não comprova prontidão operacional.
- **Estado:** plano preparado, nenhuma migração executada neste trabalho. NÃO FAÇA O DEPLOY AINDA.
