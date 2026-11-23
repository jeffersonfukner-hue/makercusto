# MakerCusto — plano de aplicação controlada L2/L3

**Estado:** PREPARADO, **NÃO AUTORIZADO PARA EXECUÇÃO NO SUPABASE OPERACIONAL**.  
**Data:** 22/11/2026 (Brasília).  
**Repositório:** `jeffersonfukner-hue/makercusto`; **branch:** `feat/fundacao-makercusto`.  
**Supabase MakerCusto:** `bxtbfdddcxbyaomydgxn`. Nenhum outro projeto ou banco deve ser utilizado.

## Objetivo e limites

Instalar exclusivamente a migração versionada `supabase/migrations/20261122212500_print_execution_l2_l3.sql` após autorização específica de **alterar o esquema do banco operacional MakerCusto**. Não publicar o frontend, não fazer merge, não lançar bobinas, não lançar impressões reais ou fictícias e não alterar saldos.

L2 oferece registro descritivo de impressões sem movimentação de estoque. L3 inicial oferece confirmação incremental, consumo de lote específico e auditoria idempotente; **não** autoriza fechamento definitivo, reserva ativa, rateio financeiro nem lançamento em estoque de produtos acabados. As 39 decisões homologadas continuam vigentes e sua aderência permanece parcial.

## Evidências e pré-requisitos

- Banco consultado por SQL de leitura em 22/11/2026: PostgreSQL **17.12**, **zero** produções, confirmações, lotes e movimentos; as RPCs `mc_create_print` e `mc_confirm_print` e a tabela `mc_production_output_events` não estavam instaladas.
- Tabelas operacionais críticas existentes com RLS. Leitura das políticas: `SELECT` restrito a `authenticated` e `mc_member(workspace_id)`. Alguns privilégios históricos de escrita direta em produção existiam: a migração os **revoga**. Esta é uma mudança intencional de contrato que precisa de homologação com o frontend conectado ao banco.
- Antes da aplicação, exigir **CI verde para o commit final**, evidências de testes reversíveis e concorrência do PostgreSQL descartável, uma janela de manutenção e confirmação de que o operador está no projeto Supabase MakerCusto correto.
- Alerta de segurança do Supabase já presente: funções `SECURITY DEFINER` acessíveis a `authenticated` foram sinalizadas pelo advisor. Elas dependem de verificações internas de autorização; não modificar outras funções neste lote. Referência: https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable
- Os testes no GitHub Actions usam identidades **sintéticas**, não são evidência de login JWT real e não simulam Supabase Auth integral.

## Procedimento após autorização explícita

1. Confirmar o **projeto id** e a **branch/commit**. Reexecutar a consulta das migrações aplicadas; não aplicar se o L2/L3 já tiver sido instalado parcialmente ou se aparecerem novos objetos/linhas relevantes. Não presumir estado antigo.
2. Verificar se a operação pode ser feita sem serviço pago, sem upgrade, sem deploy, e consultar se existe backup/restauração adequada para o banco. **Não criar custo** ou contratar backup sem nova autorização.
3. Executar `supabase/tests/l2_l3_preflight_readonly.sql` em **somente leitura**. O script falha se houver produção já registrada, RPCs L2/L3 pré-existentes, falta de fundação/L1, Postgres inesperado ou RLS desabilitado. Se falhar, interromper.
4. Aplicar **somente** o conteúdo aprovado da migração `20261122212500_print_execution_l2_l3.sql` usando o registro de migrações do Supabase. Não editar manualmente o SQL durante a aplicação, não ativar integrações adicionais.
5. Executar `supabase/tests/l2_l3_postflight_readonly.sql` para validar tabela/eventos, funções e grants. Reexecutar os advisors de segurança e consultar metadados do esquema. **Não executar o teste reversível que cria dados no banco real**: esses testes pertencem ao CI isolado.
6. Verificar, no plano de aplicação de frontend separado, a autenticação real e permissões de owner/manager versus usuário estranho/anon **antes de permitir confirmações físicas reais**. Qualquer atualização do frontend/preview requer autorização própria e validação visual do proprietário.
7. Registrar evidências observadas, SHA, hash da migração, horário de início e término **efetivamente observados**, resultados e eventuais falhas em `docs/REGISTRO_DE_ATIVIDADES.md` e `docs/CONTINUIDADE.md`.

## Plano de falha e reversão

- **Antes de aplicar:** se o preflight, backup/capacidade de recuperação ou autorização falhar, **não executar DDL**.
- **Durante a aplicação:** interromper se ocorrer erro; não repetir automaticamente uma migração parcialmente aplicada. Inspecionar catálogo/migrações/permissions apenas em leitura antes de qualquer correção.
- **Depois de aplicar, antes de usar:** manter confirmações reais desativadas. Falha no postflight bloqueia habilitação de frontend. A intervenção de recuperação do banco exige **nova autorização específica**.
- **Se já houver dados gravados:** não fazer `DROP TABLE`, `DROP FUNCTION` ou apagar confirmações/estoque como "rollback". Planejar **migração corretiva compatível** ou recuperação respaldada por backup validado.
- **Dados contábeis:** nunca inventar custo, quantidade, data, tempo ou consumo; snapshot monetário completo permanece L4.

## Critérios de aceite

Migração aplicada uma única vez e documentada **somente após autorização**, preflight/postflight aprovados, tabela de deltas com RLS, anon sem RPCs de produção, authenticated sem INSERT/UPDATE/DELETE direto nas tabelas de execução, owner/manager autorizados por contexto real da oficina, não membros sem leitura/execução, saldo e idempotência protegidos. Até todas essas provas, manter L3 classificado **parcial** e não homologado para uso operacional.

## Resultado da preparação — 22/11/2026
- `supabase/tests/l2_l3_preflight_readonly.sql` executado em leitura no Supabase MakerCusto sem erro; não gerou dados nem alterou esquema.
- `supabase/tests/l2_l3_postflight_readonly.sql` executado **somente em PostgreSQL descartável** via CI #45099111748 com `success`. O mesmo pipeline comprovou rollback, concorrência, RLS sintético, tipos, unitários, build e 86/86 Playwright. Evidência: https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45099111748 .
- A instalação no Supabase operacional **não aconteceu**. A aplicação demanda autorização específica nova e confirmação de recursos/backup; não interpretar este plano como autorização.
