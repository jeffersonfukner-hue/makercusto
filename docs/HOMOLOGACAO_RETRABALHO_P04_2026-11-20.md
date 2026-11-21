# MakerCusto — Homologação P04: retrabalho, recuperação e reimpressão

**Data:** 20/11/2026 (Brasília). **Situação: HOMOLOGADA EXPRESSAMENTE** pelo proprietário na conversa, como **uma única política consolidada**, abrangendo P04-A a P04-F.
**Referências:** `docs/CONTINUIDADE.md`, `docs/HOMOLOGACAO_PRODUCAO_2026-11-20.md`, `docs/HOMOLOGACAO_RESERVAS_P01_2026-11-20.md`, `docs/HOMOLOGACAO_CONFIRMACOES_P02_2026-11-20.md`, `docs/HOMOLOGACAO_FALHAS_P03_2026-11-20.md` e `docs/MODELAGEM_PRODUCAO_REAL_E_RATEIO.md`.
**Contagem:** 31 homologações anteriores inalteradas + P04 (uma política, não seis) = **32 homologações acumuladas**.

## Princípios anteriores preservados
- RET já homologada: operação de retrabalho separada, vinculada à produção original, com material, tempo, custo e snapshot próprios, sem reescrever o passado.
- P03: perdas e recuperáveis classificados sem gerar duplicações de estoque ou repassar automaticamente custo de falha a peças boas.
- P02: novos consumos/resultados confirmados de modo transacional e idempotente; correções por eventos auditáveis.
- P01: reserva lógica e origens/lotes preservados; não liberar sobras durante confirmações parciais.
- Custo histórico imutável, estoque não negativo por padrão, composição versionada e rateio explícito permanecem válidos.

## Política P04 homologada (seis sub-regras)
1. **P04-A — Vínculo de origem:** cada retrabalho referencia execução original e produtos/quantidades afetados, com motivo, responsável, datas e resultado. Quando não houver identidade de unidade específica, permitir vínculo rastreável a lote de produção, sem inventar identidade individual.
2. **P04-B — Custos adicionais próprios:** registrar separadamente insumos adicionais, trabalho, energia, máquina, ferramentas e componentes substituídos, apenas quando efetivamente aplicáveis; **não repetir** custos já incluídos na execução inicial.
3. **P04-C — Custo acumulado da peça recuperada:** após recuperação confirmada, apresentar custo original **atribuído à peça** mais custos incrementais de retrabalho. Preservar integralmente snapshot original, documentando o custo acumulado como valor gerencial derivado/vinculado. Peça já vendida ou baixada não recebe alteração retroativa automática em movimento ou custo de venda anterior.
4. **P04-D — Reimpressão completa:** registrar nova execução e seus consumos, tempo, custo e resultado, vinculada à falha original. O custo de peça descartada permanece como perda identificada, **não** incorporado automaticamente ao custo industrial da nova peça.
5. **P04-E — Recuperação malsucedida:** classificar como perda o custo original ainda atribuível mais custos incrementais realizados, **sem lançar novamente** a despesa original. Registrar destino físico (descarte ou recuperável). Não presumir valor monetário de resíduo reciclável sem política própria.
6. **P04-F — Confirmação, estoque e auditoria:** abrir retrabalho sem movimentar automaticamente estoque. Somente confirmar explicitamente consome insumos e registra resultado; peça recuperada muda de condição e **não gera unidade física duplicada**. Operações idempotentes, auditáveis e vinculadas; correções por estorno/retificação sem apagar eventos. Detalhes de estorno parcial ficam para P09.

## Exemplos hipotéticos, não resultados medidos
- Peça/chaveiro com impressão original R$4,00 + seis minutos de acabamento a R$20/h (R$2,00) + insumos R$0,50 = **custo gerencial acumulado R$6,50**, mantendo snapshot inicial R$4,00. Novo gasto R$2,50.
- Reimpressão: peça original descartada R$8,00; nova impressão aprovada R$8,50; gasto total para alcançar uma peça boa R$16,50; custo industrial próprio da nova execução R$8,50, perda da primeira R$8,00.
- Mesa com 20 peças: 15 aprovadas originalmente, 5 defeituosas; 3 recuperadas, 2 descartadas = **18 peças boas**, sem criar 23 unidades.
- Peça original R$5,00, tentativa de retrabalho R$3,00 e falha definitiva: custo acumulado da perda R$8,00, mas evento novo acrescenta somente R$3,00; não lançar R$8,00 como nova despesa autônoma.

## Fronteiras e pendências expressamente NÃO homologadas por P04
- **P05:** rateio de retrabalho compartilhado entre múltiplas unidades, bases de energia, purga, perdas e custos comuns.
- **P06:** precisão/centavos; **P07:** energia em pausas e etapas; **P08:** lote desconhecido; **P09:** detalhamento de estornos parciais.
- Valorização contábil/fiscal e regras de capitalização em estoque, garantia/assistência pós-venda, material reciclável/recuperável, aprovação/autorização, controle de unidades sem identificação, direitos de equipes/RLS e SQL físico.
- Custo gerencial acumulado **não equivale automaticamente** a critério contábil/fiscal; não recalcular histórico nem imputar perdas da impressão original à reimpressão.
- Sem código, SQL, migração, Supabase, banco, testes funcionais/RLS, merge ou deploy nesta homologação documental.
