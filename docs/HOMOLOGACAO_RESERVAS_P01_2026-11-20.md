# MakerCusto — Homologação P01: reservas e sobras

**Data:** 20/11/2026 (Brasília). **Status: HOMOLOGADA expressamente pelo proprietário.**
**Base:** `docs/CONTINUIDADE.md` no commit `7f7d2615`; revisão P01 apresentada na conversa, aprovada integralmente como **uma política consolidada** (P01-A a P01-F). As **28 homologações anteriores são preservadas**; total acumulado **29 políticas/diretrizes** (5 estruturais + 8 permissões + 4 técnicas + 6 estoque + 5 produção + 1 P01).

## Princípio preexistente RES — preservado
Reserva é opcional, lógica e **não movimenta fisicamente** o estoque. Disponível = físico menos reservas ativas. Não reservar acima do disponível. Consumo físico só é baixado na confirmação; conciliar baixa e reserva atomicamente, sem dedução dupla. Estoque negativo é bloqueado por padrão. A presente P01 detalha esse princípio e não o substitui.

## Política P01 homologada
- **P01-A — Sobra:** ao encerrar definitivamente ou cancelar uma ordem, liberar automaticamente o saldo reservado e não consumido, com trilha de auditoria. Não liberar sobras durante confirmações parciais enquanto a ordem continuar aberta.
- **P01-B — Prazo:** vencimento **opcional** e sinalizado para revisão, sem liberação automática pelo simples decurso do prazo, sem qualquer baixa física automática. Uma ordem longa/pausada não perde a reserva automaticamente.
- **P01-C — Excedente:** consumo real maior que a reserva poderá ser confirmado quando existir saldo disponível e origem identificada; avisar e registrar diferença. Se o material estiver em outra bobina, identificar a origem por lote. Se a confirmação ordinária geraria inconsistência ou saldo negativo, bloqueá-la e preservar as informações informadas para conciliação; material fisicamente consumido não pode ser apagado nem tratado como não ocorrido.
- **P01-D — Troca de bobina:** registrar separadamente as quantidades efetivamente consumidas e o preço histórico de cada lote/bobina. Ajustar/liberar reserva de origem de forma auditável, sem consumo duplicado ou substituição de preço anterior.
- **P01-E — Cancelamento parcial:** reduzir a necessidade ainda não consumida, liberar apenas o excedente reservado e preservar todas as confirmações e movimentações anteriores. Não apagar eventos.
- **P01-F — Concorrência:** validar reservas/consumos e saldo disponível no servidor, com operação transacional segura, para impedir duas ordens de comprometer simultaneamente a mesma quantidade e evitar saldo negativo ou dedução dupla. A validação somente no navegador é insuficiente.

## Exemplos hipotéticos (não fatos de produção)
1. Bobina PETG 1.000 g; reserva 300 g: físico 1.000 g, disponível 700 g. Confirmação de consumo de 280 g e encerramento da ordem: baixa 280 g, libera sobra reservada 20 g, físico 720 g, reserva zero, disponível 720 g.
2. Reserva 300 g; consumo real 330 g: confirmar somente com origem identificada e 30 g adicionais disponíveis, registrando excedente e custo; se não houver saldo suficiente, bloquear a confirmação ordinária e abrir conciliação, sem apagar a ocorrência física.
3. Troca de bobina: A 180 g × R$ 68/kg = R$ 12,24; B 120 g × R$ 73/kg = R$ 8,76; total 300 g e R$ 21,00, com linhas distintas por lote. Preços hipotéticos.
4. Duas ordens disputam os últimos 100 g: transações devem impedir reservas simultâneas superiores ao saldo disponível.

## Limites e decisões ainda NÃO homologados
- Regras detalhadas de reservas de kits multicomponentes, locais distintos, bobinas parcialmente utilizadas e ordens abandonadas; política de prioridade/reprogramação entre ordens.
- Procedimento operacional completo de conciliação quando material **já consumido fisicamente** excede o saldo registrado; exceções de inventário e papéis autorizados.
- P02 confirmações parciais/UX; P03 falhas e perdas; P04 retrabalho; P05 fórmulas de rateio; P06 precisão financeira: **todas pendentes**.
- Também seguem abertos pausas/energia P07, consumo sem lote P08, estorno parcial P09, regras fiscais, permissões de equipe/RLS, esquema SQL físico.
- Homologação documental **não autoriza** código, SQL, migrações, banco, Supabase, merge, deploy ou testes de execução. Nenhum deles foi realizado nesta etapa.
