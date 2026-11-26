# MakerCusto — Homologação P06: precisão financeira e arredondamento

**Data de aprovação expressa:** 20/11/2026 (Brasília).
**Situação:** HOMOLOGADA — P06-A a P06-F como **uma única política consolidada**, conforme aprovação expressa do proprietário após revisão detalhada.
**Contagem normativa:** 33 homologações anteriores (28 iniciais + P01 a P05) preservadas; P06 acrescenta uma política, totalizando **34 homologações**. P06-A–F são sub-regras, não seis novas políticas.
**Referências:** `docs/CONTINUIDADE.md`, `docs/CONTRATO_ESTOQUE_PRODUTOS.md`, `docs/MODELAGEM_PRODUCAO_REAL_E_RATEIO.md`, `docs/HOMOLOGACAO_RATEIO_P05_2026-11-20.md` e homologações P01–P04.

## Fundamentos preservados
- Preço por lote e consumo por unidade-base com origem identificada; snapshots imutáveis.
- P05: apropriação direta primeiro, rateio explícito de categorias compartilhadas; todos os destinos de uma categoria conciliados, sem dupla contagem.
- P01/P02: reserva lógica e confirmação incremental/idempotente; P03/P04: perdas separadas, retrabalho incremental, sem reescrever custos históricos.
- A presente política é de precisão e conciliação gerencial; não homologa requisitos fiscais/contábeis, moeda estrangeira, esquema SQL nem estornos parciais específicos.

## P06 — seis sub-regras HOMOLOGADAS
1. **P06-A — Decimal exato, precisão interna e origem:** usar aritmética decimal exata na fonte de verdade de quantidades e custos, evitando aritmética binária de ponto flutuante como autoridade financeira. Valores financeiros lançados são conciliados em centavos (BRL); preços unitários/intermediários mantêm **ao menos oito casas decimais quando representáveis**, ou precisão maior/racional suficiente para divisões periódicas sem truncamento intermediário que afete o fechamento. Filamento pode ser representado com resolução até **0,001 g**, mas somente registrar a precisão efetiva da medição/origem; preservar valor, unidade e resolução originais. Não criar falsa precisão ao importar informação do slicer.
2. **P06-B — Custo proporcional do lote:** preservar preço total e quantidade original da compra, ou preço da unidade-base do lote identificado, antes de converter unidades. Material consumido: `custo = (quantidade_usada / quantidade_comprada) × preço_total_compra`; alternativa equivalente com preço exato por unidade-base. Não arredondar custo por grama antecipadamente. Frete, tributos e demais despesas de aquisição só entram depois de política específica.
3. **P06-C — Arredondamento monetário:** usar arredondamento decimal **half-up** ao converter custos positivos para um valor monetário lançado em centavos, somente no ponto de fechamento definido. Exemplos: 1,234 → R$1,23; 1,235 → R$1,24; 1,236 → R$1,24. Custos internos e quotas preservam precisão anterior ao fechamento. Estorno espelha exatamente o valor monetário original revertido, sem reprecificar por valores atuais; estorno parcial detalhado fica em P09. Exigências fiscais específicas podem demandar outro método e não estão aprovadas.
4. **P06-D — Resíduo de centavos em rateios:** fixar o total monetário da categoria em centavos, apurar quotas exatas por base válida P05, atribuir inicialmente centavos inteiros de cada quota e distribuir os centavos que restarem pela **maior parte fracionária**, com desempate determinístico por identificador estável. A soma distribuída é exatamente o total da categoria; nenhum centavo desaparece, duplica ou é transferido para categoria alheia. A regra descrita aplica-se aos custos positivos; correções/estornos devem referenciar a alocação original, sem rateio retroativo arbitrário.
5. **P06-E — Total e custo unitário distintos:** guardar custo total conciliado do lote/execução e quantidade pertinente; calcular custo unitário derivado com precisão ampliada, exibindo arredondamento apenas para leitura. Não reconstruir custo histórico multiplicando custo unitário exibido pela quantidade. Quando for necessário lançar valores monetários por unidade, distribuir centavos de modo conciliado com o total conforme P06-D. Custos diferentes de peças boas, retrabalhadas e rejeitadas permanecem diferenciados; média única não substitui rastreabilidade de custos atribuídos.
6. **P06-F — Snapshot e auditoria financeira:** registrar moeda, fonte/versão de fórmula, escala e método de arredondamento, valores calculados, valores lançados e alocação de resíduos; exigir conciliação de destinos com cada categoria e de categorias com a execução. Correções não editam snapshots históricos: gerar eventos vinculados e auditáveis conforme regras prévias, mantendo P09 pendente para detalhes de estorno parcial.

## Exemplos hipotéticos — não dados de produção real
- Bobina de 1 kg por R$68,00, consumo de 0,35 g: custo exato `68 / 1000 × 0,35 = R$0,0238`. Para 100 peças idênticas, total R$2,38; arredondar cada peça para R$0,02 e multiplicar daria R$2,00, diferença indevida R$0,38.
- Multicor de P05: branco 86 g × R$68/kg = R$5,848, dourado 44 g × R$100/kg = R$4,400; total interno R$10,248; fechamento positivo por half-up = R$10,25. A soma das linhas arredondadas não deve ser usada como método universal de fechamento.
- Três destinos igualmente elegíveis rateiam R$10,00: quotas teóricas R$3,333…, distribuição conciliada R$3,34/R$3,33/R$3,33, centavo extra pelo identificador estável em empate.
- Mesa de 20 chaveiros com custo total R$10,25: custo médio derivado R$0,5125; exibir R$0,51 não autoriza reconstruir total R$10,20. Se necessário atribuir centavos por unidade: cinco unidades R$0,52 e quinze unidades R$0,51 = R$10,25, sem modificar o valor agregado.

## Exceções e decisões NÃO homologadas por consequência
- **P07:** consumo energético em pausas, aquecimento, ociosidade e retomada.
- **P08:** tratamento de consumo físico sem lote de origem.
- **P09:** política detalhada de estorno parcial e recomposição de saldos/custos.
- Impostos e faturamento, moeda estrangeira/câmbio, exigências de documentos fiscais, custos acessórios de aquisição, política fiscal/contábil de inventários, autorização e segregação por oficina/equipe, RLS, desenho e escalas físicas SQL, migrações e testes.
- Não fixar quantidade de casas decimais da coluna física do banco por inferência: garantir o contrato matemático ao selecionar tipo/escala na futura modelagem.
- Não tratar valores simulados da interface como cálculo efetivamente implementado.

**Escopo executado:** documentação na branch `feat/fundacao-makercusto` somente. Nenhuma mudança em código, SQL, banco/Supabase, merge ou deploy; testes funcionais/RLS não executados nesta atividade.
