# MakerCusto — Homologação GAP-01: conciliação excepcional de estoque

**Data de aprovação expressa:** 20/11/2026 (Brasília).
**Status:** HOMOLOGADA EXPRESSAMENTE, como **uma única política consolidada GAP01-A a GAP01-F**, conforme aprovação do proprietário.
**Contagem:** preservadas integralmente as **37 homologações anteriores** (28 iniciais + P01 a P09); GAP-01 acrescenta **uma** homologação, totalizando **38**. As seis sub-regras não contam separadamente.
**Base documental:** `docs/CONTINUIDADE.md`, `docs/HOMOLOGACAO_RESERVAS_P01_2026-11-20.md`, `docs/HOMOLOGACAO_CONFIRMACOES_P02_2026-11-20.md`, `docs/HOMOLOGACAO_FALHAS_P03_2026-11-20.md`, `docs/HOMOLOGACAO_CONSUMO_SEM_LOTE_P08_2026-11-20.md`, `docs/HOMOLOGACAO_ESTORNOS_P09_2026-11-20.md` e `docs/REFINAMENTO_ESTOQUE_PRODUCAO.md`.

## Princípio central
Distinguir **fato físico observado**, **estoque contabilizado** e **conciliação financeira**. Uma ocorrência física legítima não pode ser apagada por falta de saldo cadastrado; tampouco autoriza baixa inconsistente, saldo negativo automático, entrada fictícia ou custo arbitrário. A operação extraordinária fica pendente até haver regularização fundada e autorizada nos limites efetivamente homologados.

## GAP01-A a GAP01-F — uma política consolidada HOMOLOGADA

1. **GAP01-A — Ocorrência física independente da confirmação:** registrar a ocorrência de consumo informada/observada, inclusive quando o saldo ou o lote cadastrado é insuficiente, com vínculo a execução, material, quantidade, fonte de aferição, momento, responsável e possível origem. Diferenciar expressamente **ocorrência pendente** de **baixa de estoque confirmada**; a primeira não gera movimento físico contabilizado nem snapshot financeiro confirmado. Não duplicar consumo ao concluir a conciliação.
2. **GAP01-B — Investigação por evidências:** verificar, sem assumir antecipadamente, se a diferença decorre de entrada omitida de material real, troca de bobina/lote, erro na quantidade informada ou outra causa identificável. Relacionar evidência e responsável ao evento; não inventar compra, fornecedor, massa ou lote. Corrigir somente a causa verificada.
3. **GAP01-C — Inventário corretivo verificável:** admitir proposta de ajuste de inventário quando houver material físico anteriormente não contabilizado ou erro de contagem demonstrado. Exigir justificativa, origem, quantidade, lote/oficina e evidências; registrar novo evento auditável. **Não** criar automaticamente entrada positiva para fazer uma confirmação passar. Critérios mínimos de evidência, níveis de confiança, autorização e papéis continuam pendentes de decisão separada.
4. **GAP01-D — Reserva protegida:** manter reservas ativas da própria e de outras ordens conforme P01. Uma divergência não autoriza liberar ou consumir reserva alheia, nem a antecipar liberação de sobras. Confirmar consumo excedente somente quando origem e disponibilidade estiverem verificadas; se isso não ocorrer, preservar ocorrência pendente para conciliação. Qualquer alteração legítima de reserva exige evento auditável e respeito à concorrência/transação.
5. **GAP01-E — Estornos e regularização não destrutiva:** quando a conciliação envolver erro em evento **já confirmado**, utilizar eventos compensatórios vinculados conforme P09, sem apagar movimento ou snapshot antigo e sem devolver ao estoque filamento que foi realmente extrudado. Validar saldo, lote, dependências e idempotência; não gerar duas baixas pelo mesmo consumo. Operações extraordinárias sem prova/autoridade suficientes permanecem pendentes.
6. **GAP01-F — Estados e fechamento:** distinguir ocorrência **registrada**, **em análise**, **regularizada** e **pendente de decisão** como estados lógicos de acompanhamento (nomes e persistência física ainda não definidos). Preservar trilha de autor, justificativa, evidências e eventos associados. Regularização física não implica automaticamente encerramento financeiro: custo desconhecido segue pendente. Ao regularizar, confirmar saldos, reservas, consumo e custos aplicáveis somente segundo P01–P09 e políticas específicas posteriormente autorizadas.

## Exemplos hipotéticos — não fatos de produção verificados
- Bobina com **80 g cadastrados**, produção observada de **100 g**: registrar ocorrência e divergência de 20 g, sem lançar baixa automática de 100 g contra 80 g ou inventar 20 g. Investigar antes de confirmar.
- Evidência comprova entrada prévia de **50 g** não registrada: após validação e autorização pertinentes, evento de regularização pode representar saldo 80 + 50 = 130 g; confirmação efetiva de 100 g deixa 30 g. **Não** atribuir 50 g a uma compra imaginária.
- Troca comprovada de bobina: **75 g** de A a R$68/kg = R$5,10 e **45 g** de B a R$80/kg = R$3,60; total **120 g** e **R$8,70**, preservados custos e lotes próprios. Uma reserva original de 100 g de A exige conciliação segundo o estado da ordem, sem liberar indevidamente a parcela ainda comprometida.
- Saldo físico cadastrado de **150 g** e reserva ativa de outra ordem de **100 g**: disponível para uma ordem não reservada = **50 g**; tentativa de confirmar 70 g normalmente é bloqueada até regularização, sem afetar reserva alheia.
- Entrada de **200 g** com saídas posteriores confirmadas somando **180 g**: estornar 50 g da entrada sem resolver dependências produziria saldo negativo de 30 g e deve ser bloqueado para investigação, conforme P09.

## Preservação das homologações precedentes
- **RES/P01:** reserva lógica, disponibilidade = físico − reservas, sem saldo negativo por padrão, concorrência e origem válidas.
- **PAR/P02:** somente confirmação explícita e idempotente causa baixa; eventos são incrementais e atômicos; informação física divergente não é descartada.
- **FAL/P03:** falhas podem consumir material e gerar zero peças boas, perdas separadas.
- **RET/P04, RAT/P05 e P06:** retrabalho próprio, rateio conciliado e dinheiro decimal preciso; snapshots históricos imutáveis.
- **P07:** energia por fases sem dupla contagem.
- **P08:** inventário sem compra fictícia e origem operacional distinguível da comercial; custo desconhecido não vira zero.
- **P09:** estorno parcial referenciado e auditável; consumo real extrudado não retorna ficticiamente ao estoque.

## Exceções expressamente NÃO homologadas nesta decisão
- **Permissões e aprovadores:** quem solicita/valida/aprova ajustes extraordinários e separação de papéis/equipes, incluindo RLS.
- **Evidências mínimas:** quais fotos, pesagens, relatórios ou documentos e graus de confiança são suficientes; critérios de liberação de saldo inicialmente incerto.
- **Conciliação sem origem comprovada:** tratamento definitivo caso nunca seja possível determinar bobina/lote, autorização de baixa excepcional e eventual compensação de estoque físico/cadastral.
- **Fechamento financeiro com custo desconhecido:** fluxo e autorização específicos; regularização de quantidade não presume precificação.
- **Fiscalidade/contabilidade:** inventário, valorização de perdas/recuperáveis, compras sem nota, ajustes e tributos.
- **Vendas, devoluções e garantias:** tratamento de movimentos posteriores incompatíveis com estorno.
- **Depreciação em pausas, tarifas variáveis, SQL físico, índices, FKs, transações concretas, migrações, banco e testes:** não decididos nem executados.
- A aprovação da GAP-01 **não** autoriza saldos negativos automáticos, alterações em produção, SQL, banco, merge ou deploy.

**Escopo da atividade:** exclusivamente registro documental na branch `feat/fundacao-makercusto`, PR #1 draft.
