# Homologação de produção RES, PAR, FAL, RET, RAT — MakerCusto

**Data:** 20/11/2026. **Aprovação expressa do proprietário** das cinco recomendações em `docs/PROPOSTAS_HOMOLOGACAO_PRODUCAO_2026-11-20.md`, commit-base `6e6e3e3b394576d82d382d853a10c27332f967a5`.

## Cinco regras HOMOLOGADAS

- **RES — reservas opcionais e lógicas:** não são baixas de estoque. A disponibilidade considera saldo físico menos reservas ativas. Não permitir reserva maior que o disponível; consumir na confirmação, com reconciliação da reserva sem dupla dedução.
- **PAR — confirmação incremental:** a mesma execução pode ser confirmada parcialmente em eventos distintos e idempotentes. Cada confirmação contabiliza somente os novos consumos/saídas, sem repetição.
- **FAL — falha de impressão:** permitir confirmar consumo efetivo de material e tempo com zero peças boas, contabilizando a perda separadamente, sem gerar estoque acabado inexistente ou repassar automaticamente a perda às unidades boas.
- **RET — retrabalho:** operação separada e vinculada à produção original, com material, tempo, custo e snapshot próprios, sem reescrever o histórico anterior.
- **RAT — rateio de mesa mista:** distribuição rastreável por categoria; atribuição direta quando mensurável, senão escolha explícita e documentada da base de rateio, com conciliação integral e sem dupla contagem. Não há fórmula única obrigatória homologada.

**Total acumulado:** 28 diretrizes homologadas (5 estruturais + 8 permissões + 4 técnicas + 6 estoque + 5 produção). Preservar todas as 23 anteriores.

## Limites e pendências NÃO homologados

- Prazos/expiração, cancelamento parcial, prioridade, troca de lote e liberação de sobras de reservas.
- UX das confirmações parciais, revisão de consumo estimado, encerramento de produção e simultaneidade.
- Classificação e precificação financeira de falhas/refugos, reaproveitamento, energia em pausas.
- Incorporação ou não do custo de retrabalho ao valor do produto acabado.
- Fórmula concreta de rateio por energia, purga, tempo e perdas; arredondamento de centavos e resíduos.
- Consumo sem lote, precisão monetária, estorno parcial, políticas de estoque de acabados, regras fiscais, permissões de equipes e downgrade, migração e banco físico.

**Escopo desta homologação:** somente documentação, sem código, Supabase, SQL, banco, merge, deploy ou publicação. Testes de execução/RLS não realizados.
