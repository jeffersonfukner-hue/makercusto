# MakerCusto — contrato lógico de estoque, produtos e kits

**Estado:** PROPOSTA TÉCNICA ainda não homologada. Base: plano-mestre, modelo de dados, contrato de filamentos e homologações no GitHub em 20/11/2026, commit-base `4bab9d0c`. **Nenhum SQL, banco, migração ou código foi alterado.**

## 1. Regras homologadas que este desenho preserva

- Estoque de **matérias-primas, itens comprados e produtos acabados**, com entradas, saídas, perdas, ajustes e inventários auditáveis.
- Produtos e kits podem conter várias peças impressas, insumos comprados, ferramentas reutilizáveis e montagem.
- Preços reais do lote consumido são prioritários e snapshots confirmados permanecem imutáveis.
- Dados operacionais, compras, fornecedores, movimentos e custos particulares nunca são publicados com fichas globais ou compartilhadas.
- Prever `workspace_id`, ainda sem autorizar colaboração; tabelas de catálogo específicas, impressoras físicas separadas de modelos, tarifa elétrica por oficina e definição/compra/bobina de filamento separadas.

## 2. Conceitos e entidades propostas

| Entidade | Campos/relacionamentos sugeridos | Papel |
| --- | --- | --- |
| `workspaces` | id, owner_user_id, nome, status | fronteira de propriedade dos dados operacionais |
| `stock_locations` | id, workspace_id FK, nome | local opcional; permitir local padrão no MVP |
| `inventory_items` | id, workspace_id FK, categoria, unidade_base, referência descritiva | identidade de item estocável **particular**, sem escopo público |
| `suppliers` | id, workspace_id FK, nome/contato | fornecedor particular |
| `purchases` | id, workspace_id FK, supplier_id?, data, documento, status | compra privada |
| `purchase_lines` | id, purchase_id FK, inventory_item_id FK, quantidade/unidade original, quantidade_base, preço total em BRL | histórico de preço, sem sobrescrever |
| `stock_lots` | id, workspace_id, inventory_item_id, purchase_line_id?, etiqueta, quantidade inicial | lote físico; bobina de filamento como subtipo/referência 1:1, nunca saldo duplicado |
| `stock_movements` | id, workspace_id, inventory_item_id, lot_id?, location_id?, delta_unidade_base, tipo, source_event_id, estorno_de?, data e autor | ledger auditável; fonte oficial do saldo |
| `stock_balances` | workspace/item/lote/local e quantidade agregada | projeção reconstruível, não fonte independente |
| `tools` | id, workspace_id, nome, preço, vida útil, custo por uso | ferramentas reutilizáveis, **sem baixa da ferramenta por produto** |
| `services` | id, workspace_id, nome, unidade, custo por hora/minuto/peça | montagem/acabamento |
| `products` | id, workspace_id, nome, sku?, tipo, status | produto, componente produzido ou kit |
| `product_revisions` | id, product_id FK, versão, estado, vigência | receita/BOM versionada, sem alterar passado |
| `product_components` | id, revision_id FK, tipo, product_child_id? / inventory_item_id? / tool_id? / service_id?, quantidade/unidade | composição; apenas um alvo, FKs coerentes, sem ciclos |
| `production_runs` | id, workspace_id, printer_instance_id FK, início/término, tempo planejado/real, status | mesa/execução produtiva |
| `production_outputs` | id, run_id, product_id, revisão, quantidade boa/refugo | vários produtos diferentes na mesma impressão |
| `production_consumption` | id, run_id, inventory_item_id, lot_id?, peso modelo, purga, desperdício, fonte da medição | consumo rastreável |
| `cost_snapshots` e `cost_snapshot_lines` | oficina, revisão, execução, versão fórmula, preço, quantidade, origem lote/compra | congelam custo histórico |

**Chaves relacionais:** `item_ref` e `component_ref` polimórficos dos documentos preliminares **não são SQL final**. Exigir FK real e validação de mesmo `workspace_id`; escolher tabela unificadora `inventory_items` + subtipos ou relações específicas antes de migrações.

## 3. Ciclo do estoque proposto

1. Criar definição **descritiva** do material → não cria estoque.
2. Registrar compra e linhas de itens com quantidade, unidade e preço de embalagem, salvando histórico.
3. Receber compra cria lote/bobina(s) e movimentos **positivos** de entrada, de modo transacional.
4. Simular cálculo/produto **não baixa estoque**. A baixa ocorrerá no evento produtivo confirmado; o ponto exato de confirmação ainda precisa ser homologado.
5. Confirmar produção gera consumo identificado, movimentos **negativos**, entradas dos produtos acabados quando couberem, e snapshot de custos.
6. Perdas e inventários geram movimentos próprios com motivo e evidência; correção usa estorno associado, sem UPDATE destrutivo.
7. Transferência entre locais cria saída e entrada correlacionadas na **mesma transação**, sem alterar o total da oficina.
8. Reenvio de operação com mesmo `source_event_id` deve ser idempotente, evitando baixa dupla.

**Decisão pendente:** estoque negativo permitido ou bloqueado, reserva, baixa parcial, lote indefinido, devoluções, cancelamentos e movimentações geradas por venda.

## 4. Custos e unidades

- Converter g↔kg para unidade base **grama**, mantendo quantidade/unidade originais da compra; para acessórios usar unidades, e para cola/tinta considerar mL/L quando aplicável. Não converter dimensões diferentes.
- Preço total da embalagem ≠ preço/kg; custo do material real = quantidade consumida × preço por unidade-base **do lote identificado**. Custos acessórios de aquisição/frete/impostos ainda não definidos.
- Massa usada = massa de modelo + purga/desperdício declarados **se não estiverem incluídos**; sem duplicação.
- Ferramentas reutilizáveis geram rateio por uso/tempo, não consumo integral por produto; impedir dupla depreciação.
- Kits devem ratear serviços, insumos e componentes por **unidade de produto final**, diferentemente de quantidade de peças por mesa.
- Uma mesa com produtos diversos requer critério explícito de energia, tempo, purga, perdas e máquinas entre as saídas; não aplicar rateio arbitrário sem decisão.
- Snapshot registra versão da fórmula, lote/custo, data e parâmetros efetivos; reajuste futuro não modifica cálculo anterior.
- Proposta financeira: precisão decimal em BRL e regra explícita de arredondamento antes de persistir; não transportar `Number` do protótipo como regra definitiva.

## 5. Invariantes de teste futuro (NÃO executadas)

| ID | Teste exigido |
| --- | --- |
| EST-01 | Compra/estoque de oficina A jamais é acessível via IDs por usuário de B, mesmo se ambos usam catálogo compartilhado |
| EST-02 | Duas compras PLA branco de R$ 68 e R$ 73 ficam separadas por lote e não sobrescrevem custo antigo |
| EST-03 | Usar 120 g de lote de 1 kg a R$ 68 custa R$ 8,16 sem despesas adicionais e baixa só o lote escolhido |
| EST-04 | Repetir evento de consumo com mesma chave não duplica saída |
| EST-05 | Ajuste de inventário de -10 g registra motivo e movimento próprio |
| EST-06 | Transferir 200 g do local A ao B preserva total da oficina |
| EST-07 | Kit com corpo impresso, argola comprada e serviço de montagem não duplica custo e não consome ferramenta |
| EST-08 | Impedir `A→B→A` na composição de produtos |
| EST-09 | Mesa contendo 30 corpos e 10 suportes permite resultados e rateio separadamente |
| EST-10 | Alterar receita/preço depois não reescreve revisão/snapshot da produção anterior |

## 6. Contrato de composição e produção — decisões ainda abertas

- Versionamento de composição: ficha de produto pode mudar, porém execução confirmada aponta revisão usada. Definir se BOM é congelada ao iniciar ou concluir produção.
- Quantidade de componentes, variantes, cores, kits aninhados, substitutos opcionais, embalagem e arquivos STL/3MF.
- Quando simulação se torna pedido/reserva, início de produção ou baixa confirmada; tratamento de falha e retrabalho.
- Rateio de energia, tempo de impressão, desperdício e custo de mão de obra em mesas com vários produtos.
- Definir orçamento versus produção real, e quem aprova retificações de movimentos e snapshots.
- Precisão das medidas, custo unitário, arredondamento; fornecedores, frete, impostos e manutenção.

## 7. Pendências de arquitetura antes de SQL

Aprovar: identidade `inventory_items` com FK/subtipos, política de saldo/lote/reserva; gatilho de baixa, BOM por revisão e rateio entre produtos; movimentações atômicas e política de estorno; custos complementares; direitos de oficinas e assinaturas. As **17 regras já homologadas** permanecem preservadas. Nenhuma implementação é autorizada por este documento.

## 8. Atualização de homologação — 20/11/2026

O proprietário HOMOLOGOU seis recomendações operacionais oriundas deste contrato: identidade estocável por oficina, bloqueio de saldo negativo por padrão, baixa somente ao confirmar produção, kits versionados, rateio explícito em mesas mistas e estornos auditáveis. Fonte formal `HOMOLOGACAO_ESTOQUE_2026-11-20.md`. O total passa a **23 decisões** (5+8+4+6).

As menções anteriores à ausência de decisão sobre *se* bloquear saldo negativo, *se* versionar BOM ou *se* exigir rateio/estorno estão superadas **nesses princípios**. Continuam pendentes seus detalhes de implementação, exceções, fórmulas e esquema físico. Ver propostas separadas em `REFINAMENTO_ESTOQUE_PRODUCAO.md`.
