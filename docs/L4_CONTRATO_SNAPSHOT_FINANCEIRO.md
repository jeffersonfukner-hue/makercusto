# MakerCusto — contrato técnico do snapshot financeiro L4 (proposta de implementação)

**Registro:** 23/11/2026. **Estado:** estrutura técnica em evolução; NÃO é homologação de fechamento operacional nem autorização de migração no Supabase. Base: homologações P05, P06 e P09.

## Distinção crítica

- `reconcilePrintAllocation` concilia **apenas** as categorias explícitas fornecidas, sem duplicar centavos. `status=reconciled` significa somente *conciliação matemática das linhas*, não custo final.
- `preparePrintFinancialDraft` gera estrutura **não persistida**, `status=pending_financial_close`, com `financialSnapshot=null` obrigatório. Assim, um subtotal matematicamente conciliado não pode ser confundido com fechamento financeiro.
- Origem L3 `unit_cost_snapshot` arredondada a **6 casas** é indicativa e NÃO equivale ao preço original exato por lote definido em P06. Uma migração de origem exata é necessária antes de permitir fechamento final sem divergências.
- Não presumir custos ausentes como zero: distinguir explicitamente **desconhecido**, **estimado**, **zero comprovado** e **categoria não aplicável declarada**.

## Campos mínimos de um snapshot final futuro (não persistido nesta etapa)

- Identificação: `workspace_id`, `execution_id`, `snapshot_id`, revisão da execução, autor, momento confirmado, versão da fórmula, moeda e método de arredondamento.
- Entrada congelada: IDs de confirmação/consumo, ID de lote e comprovação de custo na data, massa medida e resolução de origem, preço total original e quantidade-base, estado de custo, fatos P07 (fases, leituras e tarifa da oficina) e versões de composição aplicáveis.
- Custo por categoria: identificador único de origem, natureza (modelo/purga/perda/energia/máquina/trabalho/acessórios), custo decimal antes do fechamento, indicador de valor conhecido/estimado, critério, unidade de base e justificativa; origem histórica só pode ser contabilizada uma vez por categoria.
- Distribuição: ID de saída, quantidade boa/rejeitada/retrabalho, base atribuível, quotas exatas, valor fechado em centavos, resíduo e desempate determinístico.
- Conciliação obrigatória: soma de destinos por categoria = total fechado da categoria; soma das categorias = custo fechado total da execução; histórico de preços não pode ser recalculado silenciosamente com valores atuais.
- Histórico e correções P09: snapshot publicado **imutável**, correção apenas por novo evento referenciado, com chave idempotente, autorização, assinatura de payload, saldo reversível e trilha de auditoria.

## Condições de bloqueio antes de qualquer confirmação financeira

1. Consumo sem identificação de lote ou custo desconhecido.
2. Origem financeira de precisão insuficiente (6 casas) ou ausência do preço-base original não mutável.
3. Modelo/purga/perda registrados sem atribuição de todos os consumos confirmados, ou mesma referência repetida.
4. Categorias aplicáveis com custo desconhecido, não analisadas ou sem método/base justificada (energia, máquina, trabalho, acessórios); não inferir inexistência de custo pelo silêncio.
5. Saídas rejeitadas e retrabalho não conciliados, ou repasse silencioso das perdas às peças boas.
6. Ausência de autorização/RLS, idempotência, controle de concorrência, confirmação P07, snapshots de origem e testes de estorno P09.

**Contrato deste lote:** nenhum endpoint grava, modifica, confirma ou encerra custo financeiro. Nenhuma tabela final nem migração operacional é aplicada. A prévia continua funcionando com subtotais apenas, e o diagnóstico de pendências é mostrado explicitamente.

## Testes e evidências previstas

- Vitest: fechamento parcial sempre pendente, origem desconhecida, fonte estimada, limitação de seis casas, referência duplicada, cobertura de consumo e categoria não atribuída.
- Playwright: no exemplo guirlanda + estrela grande + estrela pequena, conferir status pendente e impedimento de tomar custo desconhecido como zero.
- SQL: testes existentes de leitura histórica/RLS permanecem sem mutações operacionais; não testar persistência inexistente como se estivesse pronta.
