# MakerCusto — Homologação P08: consumo de material sem lote de compra conhecido

**Data:** 20/11/2026 (Brasília). **Status: HOMOLOGADA EXPRESSAMENTE**, pelo proprietário, P08-A a P08-F como **uma única política consolidada**.
**Contagem:** 35 homologações anteriores preservadas (28 iniciais + P01–P07); P08 acrescenta **uma** política, resultando em **36 homologações acumuladas**.
**Referências:** `docs/CONTINUIDADE.md`, `docs/HOMOLOGACAO_RESERVAS_P01_2026-11-20.md`, `docs/HOMOLOGACAO_CONFIRMACOES_P02_2026-11-20.md`, `docs/HOMOLOGACAO_PRECISAO_P06_2026-11-20.md`, `docs/CONTRATOS_CADASTROS_E_FILAMENTOS.md` e `docs/CONTRATO_ESTOQUE_PRODUTOS.md`.

## Distinção normativa
A falta de comprovante de **compra** não impede identificar operacionalmente a **bobina física**. Por outro lado, o fato de conhecer o tipo de material não permite escolher arbitrariamente qual bobina sofreu consumo.

## Seis sub-regras P08 homologadas
1. **P08-A — Inventário inicial sem compra fictícia.** Permitir registrar bobina/material existente fisicamente sem nota, fornecedor ou lote comercial conhecido por **entrada de inventário físico auditável**, vinculada à oficina, tipo, quantidade, data, responsável e método de aferição. Gerar identificação operacional própria do material, sem criar compra/nota/fornecedor fictício. Marca, cor exata ou fornecedor podem permanecer desconhecidos quando não houver evidência.
2. **P08-B — Quantidade e incerteza.** Registrar se a quantidade é pesada, estimada ou simplesmente informada, com método e resolução; ao pesar bobina parcialmente usada, distinguir peso bruto e tara do carretel antes de determinar filamento líquido. Se o saldo não tiver confiança suficiente, mantê-lo pendente de inventário em vez de liberá-lo automaticamente para baixas ordinárias.
3. **P08-C — Custo com proveniência.** Quando o preço original não for conhecido, permitir **estimativa identificada**, com método/referência, data, unidade, valor e responsável; preços de mercado ou de material similar não são preço histórico comprovado. Se não houver referência aceitável, manter custo **desconhecido**, nunca presumir custo zero.
4. **P08-D — Consumo confirmado de origem operacional identificada.** Após inventário e identificação física válidos, permitir consumo ordinário do lote de inventário, com confirmação explícita, saldo disponível, origem, quantidade e custo/histórico conforme P01/P02/P06. Quando a **bobina consumida permanecer desconhecida**, preservar ocorrência real pendente de conciliação **sem escolher lote arbitrariamente, sem baixa fictícia ou saldo negativo automático**. Registro da ocorrência não equivale à confirmação de movimento regular inconsistente.
5. **P08-E — Evidência e conciliação posteriores.** Permitir vincular posteriormente nota, compra, identificação de bobina e contagem física ao registro inicial sem duplicar entrada de estoque. Divergências exigem evento referenciado, justificativa e autor, sem reescrever movimentos/snapshots confirmados. Descoberta posterior de preço real não recalcula automaticamente produção anterior; ajustes gerenciais/contábeis específicos permanecem pendentes de política própria.
6. **P08-F — Estado de confiabilidade, alertas e auditoria.** Exibir distintamente materiais com compra comprovada, inventário inicial, custo estimado, custo desconhecido e consumo pendente de conciliação, com rastreabilidade por oficina. Alertar sobre regularização de materiais antigos sem impedir injustificadamente o uso de material **identificado e inventariado**. Ajustes especiais, permissões e reconciliações quando há saldo físico/cadastral insuficiente permanecem pendentes.

## Princípios anteriores explicitamente preservados
- **P01/P02:** reservas lógicas, origem operacional, saldo não negativo por padrão, baixa apenas na confirmação incremental idempotente e auditável; divergência física não pode ser apagada, mas não autoriza movimentação ordinária inconsistente.
- **P03/P04/P05:** perdas não somadas automaticamente a unidades boas, retrabalhos separados e atribuições conciliadas por categoria.
- **P06:** custo calculado com precisão decimal e snapshot histórico imutável. Custo estimado deve ser diferenciado de preço real de compra.
- **P07:** energia e tempos próprios; esta P08 não modifica custo energético nem horas de produção.
- A identificação operacional de inventário não equivale a inventar origem comercial, e a mera definição descritiva de filamento não gera estoque.

## Exemplos hipotéticos — não são observações reais
1. Bobina PETG branco sem etiqueta: peso bruto 640 g, tara estimada 190 g, líquido **estimado** de 450 g. Preço histórico desconhecido; referência hipotética de R$80/kg leva a **R$36,00 estimados**, não a custo de compra comprovado. A aceitação de saldo disponível depende da validação da aferição, não ocorre só pelo cálculo.
2. Após regularização, consumo confirmado de 120 g dessa bobina de inventário: saldo 450 - 120 = 330 g, custo do material por referência R$9,60, registrado com proveniência de estimativa. Nota encontrada posteriormente por R$68/kg não reescreve retroativamente os R$9,60.
3. Inventário inicial de cinco bobinas com saldos estimados de 650, 320, 450, 180 e 280 g totaliza 1.880 g; custos individuais podem ser comprovados, estimados ou desconhecidos. Não preencher preço ausente com zero nem com média universal.
4. Produção física consumiu 90 g PETG, mas há duas bobinas possíveis sem identificação confiável: manter ocorrência de 90 g e sua conciliação pendentes. Não dividir artificialmente 45 g/45 g, não selecionar lote aleatório e não gerar saldo negativo.

## Pendências expressas, NÃO homologadas por consequência
- **P09 — estornos parciais**, regras de compensação vinculadas e recomposição de saldo/custo.
- Processo completo de conciliação quando material **já consumido fisicamente** não corresponde ao saldo registrado; autorização de ajustes excepcionais, papéis permitidos e evidências mínimas para liberar saldo de inventário incerto.
- Fechamento financeiro de produções cujo custo permanece desconhecido: ocorrência deve ser preservada e fechamento financeiro não deve supor custo, mas procedimento definitivo, permissões e exceções aguardam decisão.
- Valorização contábil/fiscal de estoque inicial, ajuste de valor após documentação posterior, tratamento de notas fiscais, impostos/frete, reservas complexas e movimentação entre oficinas.
- Depreciação durante pausas, tarifas variáveis, RLS, modelo físico SQL, migrações, integrações e testes.
- **Escopo:** homologação documental na branch `feat/fundacao-makercusto`; nenhuma autorização para código, SQL, banco, merge ou deploy. Testes funcionais não realizados.
