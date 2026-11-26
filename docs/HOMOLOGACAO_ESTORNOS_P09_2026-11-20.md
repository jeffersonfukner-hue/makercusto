# MakerCusto — Homologação P09: estornos parciais e correções de produção

**Data de aprovação:** 20/11/2026 (Brasília). **Situação: HOMOLOGADA EXPRESSAMENTE** pelo proprietário como **uma única política consolidada P09-A a P09-F**.
**Contagem:** preservadas as **36 homologações anteriores** (28 iniciais + P01 a P08), P09 acrescenta **uma** política e resulta em **37 homologações acumuladas**.
**Base normativa:** `docs/CONTINUIDADE.md`, `docs/HOMOLOGACAO_CONFIRMACOES_P02_2026-11-20.md`, `docs/HOMOLOGACAO_RESERVAS_P01_2026-11-20.md`, `docs/HOMOLOGACAO_FALHAS_P03_2026-11-20.md`, `docs/HOMOLOGACAO_RETRABALHO_P04_2026-11-20.md`, `docs/HOMOLOGACAO_PRECISAO_P06_2026-11-20.md`, `docs/HOMOLOGACAO_CONSUMO_SEM_LOTE_P08_2026-11-20.md` e `docs/REFINAMENTO_ESTOQUE_PRODUCAO.md`.

## Invariantes anteriores preservadas
- Estorno não apaga nem reescreve movimentos, eventos de produção, reservas ou snapshots históricos; utiliza compensação auditável e vinculada.
- P01/P02: somente confirmação explícita altera saldos físicos, eventos incrementais/idempotentes, concorrência controlada, saldo não negativo por padrão; cancelamento não devolve material extrudado.
- P03/P04: perdas e recuperações sem peças duplicadas e retrabalho separado; P05/P06: custos por categoria conciliados, centavos e snapshots preservados; P08: origem física desconhecida não autoriza baixa arbitrária.

## Política P09 — seis regras expressamente homologadas
1. **P09-A — Estorno parcial referenciado:** permitir compensar parcela de evento confirmado identificando evento/linha de origem, quantidade reversível residual, motivo, responsável e instante da operação. Nunca compensar valor/quantidade acima do saldo ainda reversível; confirmações independentes da mesma execução não são canceladas automaticamente.
2. **P09-B — Consumo registrado versus devolução física:** distinguir erro de lançamento de material realmente consumido. Quando excesso confirmado nunca foi consumido, corrigir consumo e estoque do lote identificado mediante evidência, evento compensatório e validações. Material de fato extrudado **não** retorna automaticamente como bobina/filamento utilizável; devolução física exige material reaproveitável existente, condição, origem e movimentação verificável. Resíduos continuam sujeitos a P03 e políticas específicas de recuperação.
3. **P09-C — Quantidades boas/rejeitadas:** permitir reclassificar e retificar saídas confirmadas, mantendo quantidade física reconciliada; transferência de condição não cria unidade adicional nem automaticamente estorna filamento consumido. Validar estoque de acabados e dependências posteriores (venda, reserva, kit, outra produção); bloquear correção ordinária incompatível e exigir procedimento específico pendente.
4. **P09-D — Compensação financeira histórica:** referenciar preço, lote, quota e snapshot monetário **da confirmação original**, preservando a foto histórica. Compensar proporcionalmente somente a parcela efetivamente elegível, com custos categorizados/rateados conforme P05 e valores em centavos conforme P06; não reprecificar por compra ou tarifa posterior. Estorno integral da linha com valor monetário já distribuído espelha exatamente o montante original; estorno parcial conserva limites e resíduos para conciliação.
5. **P09-E — Atomicidade, concorrência e idempotência:** cada compensação tem identificador/chave de idempotência, origem, autor e horário. Todos os efeitos de estoque, quantidades, custos e relações são transacionais: ou todos, ou nenhum. Reenvio idêntico não repete efeitos; chave idêntica com conteúdo divergente é rejeitada. Bloquear estorno concorrente acima do reversível, saldo negativo e conflitos com reservas ou operações posteriores; registrar ocorrência pendente quando exigir conciliação excepcional.
6. **P09-F — Auditoria e saldo líquido:** apresentar confirmação original, compensações referenciadas e resultado líquido por material, produto, perda, custo e reserva. Nunca modificar snapshots originais, apagar histórico ou reabrir ordem/recriar reservas automaticamente. Nova produção ou nova reserva requer evento específico e autorização pertinente.

## Exemplos ilustrativos (não dados reais)
- Consumo confirmado de **150 g** de PETG a R$80/kg = R$12,00, medição corrigida para **120 g**: compensação de **30 g e R$2,40** apenas se os 30 g não tiverem sido efetivamente consumidos; líquido 120 g e R$9,60, com original preservado.
- Impressão fracassada realmente consumiu 100 g e gerou zero produtos bons: classificar perdas; não estornar material só porque 60 g foram descartados.
- Mesa com 20 unidades inicialmente boas e três reprovadas na inspeção: reclassificar para 17 boas e 3 rejeitadas, total físico 20, sem nova entrada, baixa adicional ou custo de perda automaticamente atribuído às 17 boas.
- Rateio original R$10,00 entre três destinos = R$3,34/R$3,33/R$3,33. Estorno integral do primeiro destino deve compensar **R$3,34**, sem dividir R$10/3 novamente nem deslocar centavos históricos.
- Se um produto já foi vendido/reservado/usado em kit, a correção ordinária deve validar movimentos posteriores; não transformar venda em estoque disponível por estorno de produção.

## Limites e exceções explicitamente NÃO homologados por P09
- Conciliação extraordinária de material **fisicamente consumido** sem saldo registrado ou sem origem conhecida; procedimentos operacionais, evidências mínimas, permissões e aprovadores especiais.
- Tratamento de peças vendidas/devolvidas, troca, garantia, correção fiscal de venda e cadeia posterior incompatível, bem como fechamento financeiro com custo de origem desconhecido.
- Valorização contábil/fiscal do inventário, ajuste posterior de custo real, tributos/frete, devolução de material reciclado e critérios de aproveitamento.
- Depreciação/manutenção durante pausas, tarifas variáveis de energia, permissões de equipe/RLS, forma SQL física e migrações.
- Exceções não autorizam saldo negativo automático, violação de reservas, recálculo retroativo, baixa arbitrária nem alteração destrutiva de registros.
- **Escopo:** documentação somente na branch `feat/fundacao-makercusto`; nenhuma mudança de código, SQL, banco, merge ou deploy. Testes funcionais e RLS não executados.
