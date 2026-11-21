# MakerCusto — Homologação operacional de estoque e produtos

**Aprovação expressa:** 20/11/2026, referente às seis recomendações do `docs/CONTRATO_ESTOQUE_PRODUTOS.md` presentes no commit `7d7507cc2cc79e623908e40b79e0bee8165726d1`.

**Status:** seis regras operacionais HOMOLOGADAS. Permanecem íntegras as cinco regras estruturais, as oito diretrizes de permissões e as quatro escolhas técnicas já aprovadas — **23 decisões/diretrizes homologadas (5+8+4+6)**. Não há aprovação implícita dos detalhes técnicos adicionais deste documento ou do modelo físico.

## Seis regras homologadas

1. **Identidade estocável por oficina.** Cada item sujeito a estoque tem identidade própria dentro de `workspace_id`, com vínculos verificáveis à sua definição, sem publicar custos/saldos ao compartilhar ficha de catálogo. A escolha exata de FKs e de tabela unificadora é **proposta técnica**, não parte automática desta homologação.
2. **Bloqueio de saldo negativo por padrão.** Movimentos que reduziriam saldo disponível abaixo de zero devem ser rejeitados nas operações ordinárias. Ajustes de inventário precisam de justificativa e rastreabilidade; exceções e permissões especiais **não foram aprovadas**.
3. **Baixa somente na confirmação da produção.** Cálculo, edição de produto e simulação não movimentam estoque. Somente a **confirmação de produção** gera baixa efetiva, com prevenção de duplicidade. O instante técnico, baixa parcial, falhas e cancelamentos ainda precisam de detalhamento.
4. **Composição de kits versionada.** Cada alteração de composição gera uma versão rastreável; produções e custos antigos conservam a composição utilizada. Kits podem incluir itens impressos, comprados, ferramentas e montagem.
5. **Rateio explícito para mesas mistas.** Quando uma mesa produz tipos de item diferentes, o sistema deve identificar a distribuição de tempo/energia/perdas/custo por saída, sem tratá-los como unidades iguais ou aplicar divisão arbitrária. **Nenhuma fórmula específica de rateio foi homologada nesta etapa.**
6. **Estornos auditáveis.** Corrigir uma movimentação contabilizada gera evento de estorno/compensação vinculado ao original, com motivo, data e responsável; não apagar ou sobrescrever silenciosamente a movimentação original.

## Fronteiras e decisões ainda abertas

- Identidade física de estoque: `inventory_items` e tabelas específicas/subtipos, FK cruzadas de mesmo `workspace_id`, unidades e local padrão.
- Reserva de materiais para ordens, tratamento de saldo *disponível* versus *físico* e estoque sem lote.
- Exceções de saldo negativo (se serão admitidas), ajuste/inventário autorizado, devoluções e movimentações entre locais.
- Definição do evento de confirmação de produção, baixa parcial, falha, retrabalho e reversão de produção já confirmada.
- Fórmula e critério de rateio de mesas mistas, medição de tempos/energia, purga/perdas compartilhadas e produtos rejeitados.
- Granularidade de versões da composição, troca de componentes, kits aninhados e concorrência de edição.
- Arredondamento/precisão, tributos, custo médio/FIFO como alternativas e conciliação de compras.
- Autorizações de equipes multi-oficina, retenção/assinatura, campos publicáveis por entidade.

**Nenhuma modificação em código, banco, produção, SQL, migrações, merge ou deploy foi autorizada por esta aprovação.**
