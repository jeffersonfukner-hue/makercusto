# MakerCusto — Homologação P02: confirmações parciais

**Data:** 20/11/2026 (Brasília). **Status: HOMOLOGADA expressamente pelo proprietário** em conversa, como **uma única política consolidada** com seis sub-regras P02-A a P02-F. 
**Base documental:** `docs/CONTINUIDADE.md`, `docs/HOMOLOGACAO_PRODUCAO_2026-11-20.md`, `docs/HOMOLOGACAO_RESERVAS_P01_2026-11-20.md` e `docs/MODELAGEM_PRODUCAO_REAL_E_RATEIO.md`, na branch `feat/fundacao-makercusto`.
**Total:** 30 homologações (28 anteriores + P01 + P02); não contar as seis sub-regras como seis novas homologações.

## Regras anteriores inalteradas
- PAR: confirmações incrementais, idempotentes, registram apenas novos consumos/saídas; baixa somente na confirmação.
- RES e P01: reservas opcionais, não físicas, liberação de sobra no encerramento/cancelamento definitivo, não em confirmações parciais; excedente sujeito a origem/saldo; concorrência transacional.
- FAL, RET, RAT: falhas sem peças boas são registráveis, retrabalhos são operações próprias e rateio de mesa mista é explícito e conciliado.
- Snapshots históricos imutáveis, movimentos auditáveis e saldo negativo bloqueado por padrão permanecem válidos.

## Política P02 homologada
1. **P02-A — Confirmação parcial opcional:** permitir tanto uma confirmação final única quanto múltiplas confirmações incrementais na mesma execução. Início, pausa e conclusão física não confirmam nem dão baixa automaticamente. Simples e Avançado usam o mesmo mecanismo, sem motores de estoque diferentes.
2. **P02-B — Valores incrementais:** em cada evento lançar exclusivamente consumos, peças boas e rejeitadas **novos**, não novamente os totais acumulados. Exibir previsto, confirmado acumulado e pendente; não transformar estimativa em consumo medido sem identificação. Quantidades estimadas e reais devem ser identificadas por proveniência.
3. **P02-C — Transação idempotente:** cada confirmação possui identificador, chave de idempotência, autor e horário. Consumo, movimentos de estoque, saídas, conciliação das reservas e snapshot correspondente devem ocorrer na mesma transação ou não ocorrer. Reenvio idêntico não duplica; mesma chave com payload divergente é rejeitada; controlar concorrência no servidor.
4. **P02-D — Conferência no encerramento:** encerramento definitivo exige conferir materiais, produtos bons, refugos, custos/rateios aplicáveis e reservas. Somente ao encerrar liberar reservas residuais como homologado em P01. A tela deve distinguir encerramento de confirmação parcial.
5. **P02-E — Correções auditáveis:** não apagar nem sobrescrever confirmação já registrada. Ajustes devem ser eventos complementares ou estornos referenciados; política detalhada de **estorno parcial permanece pendente em P09**.
6. **P02-F — Excedente de consumo:** aceitar quantidade real superior ao planejado com origem identificada, disponibilidade de estoque e confirmação explícita da diferença; preservar informação inserida para conciliação caso falte saldo/origem, sem confirmar movimento inconsistente nem apagar consumo físico efetivo. Aplica P01-C e P01-F.

## Cenários hipotéticos — não são observações de produção
- Planejados 20 chaveiros/160 g PETG. Confirmar incrementalmente (8 bons/64 g), (7 bons/56 g) e (5 bons/40 g): total confirmado 20 bons/160 g; reenviar o segundo evento não gera nova baixa.
- Execução interrompida após 90 g: registrar sete boas e três rejeitadas em uma confirmação, sem adicionar novamente massa de rejeitos se incluída nos 90 g. Custos de falha continuam sujeitos às decisões P03/P05.
- Bobina A 70 g e bobina B 45 g em confirmações separadas: custo, origem e movimento próprios para cada lote, sem substituir dados de A.
- Consumo acima da previsão: exigir confirmação explícita do excedente e validação transacional de saldo/origem.

## Limites **não homologados** por consequência
- P03 classificação/precificação de falhas, P04 incorporação financeira de retrabalho, P05 fórmulas específicas de rateio, P06 precisão/arredondamento.
- P07 pausas e energia, P08 consumo sem lote, P09 critérios detalhados de estorno parcial.
- Método definitivo de aferição de massa por etapa quando apenas o total do slicer é conhecido; fluxo completo de conciliação de divergência física versus saldo, permissões de operadores/equipes, RLS, SQL físico e migração.
- A confirmação incremental não autoriza ratear automaticamente a massa total estimada entre peças nem duplicar purga/perdas já contidas no slicer.

**Escopo:** aprovação e registro documental apenas. Não há implementação funcional, SQL, banco, migração, merge, deploy ou testes de execução/RLS nesta atividade.
