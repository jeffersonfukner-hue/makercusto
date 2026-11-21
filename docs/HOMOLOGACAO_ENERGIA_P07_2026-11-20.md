# MakerCusto — Homologação P07: pausas e energia na produção

**Data:** 20/11/2026 (Brasília). **Status: HOMOLOGADA EXPRESSAMENTE** pelo proprietário, como **uma única política consolidada P07-A a P07-F**. As 34 políticas anteriores (28 iniciais e P01–P06) permanecem íntegras. **Total acumulado: 35 homologações**, não 40.
**Base documental:** `docs/CONTINUIDADE.md`, `docs/HOMOLOGACAO_PRECISAO_P06_2026-11-20.md`, `docs/HOMOLOGACAO_RATEIO_P05_2026-11-20.md`, `docs/MODELAGEM_PRODUCAO_REAL_E_RATEIO.md`, `docs/CONTRATOS_CADASTROS_E_FILAMENTOS.md` e revisão de P07 aprovada expressamente na conversa.

## Fundamentos anteriores preservados
- Tarifa elétrica vinculada à oficina; potência, vida útil e dados técnicos com origem declarada.
- P05: energia total da execução calculada uma vez, depois alocada de modo rastreável, sem dupla contagem e sem confundir massa com medição de energia.
- P06: valores decimais precisos, fechamento monetário auditável, snapshots históricos imutáveis.
- P01/P02: reserva lógica, baixa/contabilização física somente na confirmação explícita e idempotente; P03/P04: falhas, retrabalhos e reimpressões com custos e eventos próprios.

## P07 — regras HOMOLOGADAS
1. **P07-A — Tempo por fase:** identificar intervalos de aquecimento inicial, impressão ativa, pausa e retomada, com início/fim/duração, permitindo múltiplos intervalos por fase. O tempo total transcorrido serve para conciliação; não implica que todo o período seja impressão ativa. Intervalos desconhecidos permanecem não classificados, sem inventar uso de energia ou duração ativa.
2. **P07-B — Energia por fase:** priorizar energia medida quando disponível; sem medidor, estimar `energia_fase_kWh = potencia_media_fase_W × duracao_fase_h / 1000`. Somar energia de intervalos não sobrepostos para obter a execução. Potência nominal da fonte não é potência média real, e, se usada como referência, deve ser identificada como estimativa de fonte.
3. **P07-C — Pausa com consumo variável:** pausa não significa automaticamente zero energia nem potência igual à fase ativa. Registrar condição observada/informada (aquecida, parcialmente aquecida, motores ligados, espera, desligada ou desconhecida) e consumo medido/estimado correspondente. Permitir segmentar uma pausa longa em intervalos de condições distintas; quando a informação não existir, preservar lacuna explícita.
4. **P07-D — Retomada/reaquecimento:** registrar energia adicional e tempo próprio para recuperar condições e continuar, sem reiniciar contagem da execução nem reaplicar custos anteriores. Uma **reimpressão completa** é execução nova vinculada à falha original, de acordo com P04.
5. **P07-E — Fonte e tarifa:** preferir medição real da energia sobre estimativa para o mesmo intervalo de cobertura. Identificar a fonte como medida, estimada pelo maker ou calculada por especificação de fabricante; preservar medidor/intervalo, tarifa e período da oficina no snapshot. Para medição parcial, combinar somente intervalos não sobrepostos com estimativas explícitas nas lacunas. Se medição integral cobre todas as fases, ela substitui estimativas sobrepostas, que podem ficar apenas para comparação. Tarifas por horário ou outros regimes variáveis permanecem pendentes.
6. **P07-F — Conciliação e trilha:** preservar tempos, potências, fontes, intervalos, tarifas, consumo em kWh, custo, proveniência e lacunas. O custo energético é registrado **uma única vez** na categoria energia da execução e segue rateio P05 e precisão P06. Não homologar por consequência regras de depreciação/manutenção durante pausas ou períodos desligados; energia e desgaste da impressora permanecem categorias diferentes.

## Exemplos numéricos hipotéticos, não medições
- Aquecimento 10 min × 600 W = 0,10 kWh; impressão ativa 4 h × 150 W = 0,60 kWh; pausa 30 min × 80 W = 0,04 kWh; retomada 12 min × 500 W = 0,10 kWh. Total 4h52min, 0,84 kWh, a R$1,03/kWh = R$0,8652, fechado em **R$0,87** conforme P06. As potências são ilustrativas e não afirmam comportamento de equipamento específico.
- Pausa de 3 horas: a 0 W = 0 kWh; a 15 W = 0,045 kWh; a 80 W = 0,24 kWh; a 150 W = 0,45 kWh. Não supor que a impressora permaneceu ativa ou totalmente desligada.
- Medidor cobre a execução integral: 0,91 kWh medidos versus 0,84 kWh estimados pelas fases. Utilizar 0,91 kWh como consumo confirmado, se a medição for confiável e coincidir com todo o período, **não 1,75 kWh**. Preservar a estimativa apenas como comparativo.

## Pendências e exceções explicitamente NÃO homologadas
- **P08 — consumo de materiais sem lote:** aberto.
- **P09 — estornos parciais e compensações:** aberto.
- **Depreciação/manutenção durante pausas e períodos desligados:** política específica futura, sem inferir equivalência a tempo ativo.
- **Tarifas variáveis por horário, ponta/fora ponta, bandeiras e outros regimes:** detalhamento futuro; tarifa já segue oficina/período conforme regras anteriores.
- Fluxos de equipamentos sem telemetria, calibração/confiabilidade do medidor, lacunas complexas de medição, interpretação fiscal/contábil, permissões/RLS, campos físicos/SQL, migrações e testes.
- P07 **não** autoriza fabricação de leituras medidas, preenchimento de períodos desconhecidos por suposição, custos duplicados nem alteração retroativa de snapshots.

**Escopo:** exclusivamente documentação na branch `feat/fundacao-makercusto` e PR #1 draft; nenhum código, banco, SQL, migração, merge ou deploy autorizado. Testes funcionais/RLS não executados.
