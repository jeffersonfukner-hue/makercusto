# MakerCusto — Homologação P03: falhas e perdas

**Data:** 20/11/2026 (Brasília). **Status: HOMOLOGADA EXPRESSAMENTE** pelo proprietário, P03-A a P03-F como **uma única política consolidada**. A base é a proposta P03 apresentada na conversa após o commit `7613f5a0`, com referência às homologações `docs/HOMOLOGACAO_PRODUCAO_2026-11-20.md`, `docs/HOMOLOGACAO_RESERVAS_P01_2026-11-20.md` e `docs/HOMOLOGACAO_CONFIRMACOES_P02_2026-11-20.md`.
**Contagem:** 30 regras anteriores preservadas (28 iniciais + P01 + P02), mais P03 (1) = **31 homologações**. As seis sub-regras não contam individualmente.

## Princípios já homologados preservados
- FAL: registrar consumo real/estimado identificado, inclusive com zero peças boas, sem gerar estoque acabado fictício e sem repassar automaticamente perdas para saídas boas.
- P01: reservas opcionais e lógicas, liberação somente nos momentos previstos, separação por lote e validação concorrente.
- P02: somente a confirmação explícita baixa estoque; incrementos idempotentes, snapshots/auditoria, encerramento conciliado.
- RAT: custo da mesa é conciliado por categoria e destino, sem dupla contagem; fórmulas específicas continuam pendentes.
- RET: retrabalho vinculado e separado, sem modificar snapshot da execução original.

## P03 — seis sub-regras expressamente aprovadas
1. **P03-A — Classificação:** registrar falha total ou parcial, motivo e momento aproximado. Motivos sugeridos: falta de filamento, descolamento, entupimento, configuração, falha elétrica, defeito de modelo ou desconhecido. **Não exigir causa inventada:** permitir motivo desconhecido.
2. **P03-B — Consumo e perda física:** guardar consumo total confirmado com origem por lote/bobina e, quando mensurável, distinguir quantidades de produto bom, material descartado e material recuperável. Não duplicar purga incluída no slicer. **Proveniência obrigatória** para medido versus estimado, sem apresentar estimativa como medição.
3. **P03-C — Custo separado:** atribuir custo da falha a categoria financeira própria, incluindo filamento, energia, máquina e outros custos aplicáveis. Conciliar custo total com parcelas destinadas a peças boas e perdas, sem duplicações. Identificar energia/máquina não medidas como **estimativas**.
4. **P03-D — Destino de perdas/peças:** diferenciar descarte definitivo, material recuperável e peça defeituosa retrabalhável. Recuperação não gera segunda unidade automaticamente; somente operação vinculada e confirmada pode registrar produto recuperado, conforme RET/P02. **Não reconhecer valor automático de recuperação** sem política de valorização aprovada.
5. **P03-E — Indicadores e precificação:** apresentar separadamente custo de produção aprovada, custo de falhas, taxa de falhas por unidades e percentual financeiro perdido (não equivalentes). Permitir, futuramente, provisão comercial de perdas **explicitamente configurada** pelo maker na formação de preço, sem alterar snapshots históricos, sem nova baixa e sem repasse automático a peças boas.
6. **P03-F — Confirmação e trilha:** ocorrência de falha pode ser documentada antes da confirmação financeira/física. Somente confirmação explícita baixa estoque, com ator, data/hora, resultados, quantidades e fonte da informação; retificações preservam original. Se consumo físico ocorreu mas saldo registrado não é suficiente, exigir conciliação específica conforme P01/P02, sem criar saldo negativo automaticamente nem apagar fato físico.

## Exemplos ilustrativos, não medições reais
- Falha total: 80 g PETG a R$100/kg (R$8,00), energia estimada R$1,50 e desgaste de máquina R$2,00 = custo da falha R$11,50; **zero** produtos bons e zero entrada de acabados.
- Falha parcial: 10 suportes previstos, 7 bons, 3 rejeitados, 100 g PETG total a R$100/kg = R$10,00 de material. Não dividir cegamente R$10 por dez; critérios de alocação por destino continuam dependentes de P05.
- Peça defeituosa com custo anterior R$4,00 e possibilidade de acabamento: permanecer classificada como recuperável até confirmação de retrabalho separado. A capitalização/incorporação de custo do retrabalho é P04 e **não está aprovada** por P03.

## Exceções e decisões ainda abertas
- **P04:** incorporação financeira e valorização do retrabalho; **P05:** bases/fórmulas específicas de rateio para materiais, energia, purga e perdas; **P06:** precisão decimal e arredondamento.
- **P07:** energia consumida durante pausa, ociosidade, aquecimento e retomada; **P08:** consumo sem lote; **P09:** estorno parcial.
- Método de valorização de resíduo recuperado, critérios de movimentação de materiais recicláveis, classificação fiscal/contábil, permissões para confirmação e correção, controles multi-oficina, RLS e esquema físico de SQL.
- A homologação não autoriza estimar custo ocultamente, alterar histórico, repassar perda automaticamente, provisionar banco ou alterar aplicação.

**Escopo:** apenas documentos na branch `feat/fundacao-makercusto`; não executar código, testes funcionais, migrações, banco, merge ou deploy.
