# Backlog priorizado

## Etapa 1 — Fundação e cálculo inicial (PR #1)
- [x] Documentação, arquitetura, contrato e regras de trabalho
- [x] SPA estática responsiva e motor de custos
- [x] Testes unitários/E2E + CI sem deploy
- [x] CI fundação aprovado (#44795814820)
- [ ] Homologação visual do proprietário

## Extensão incremental — Multicor na mesma PR, antes da homologação
- [x] Materiais por cor com preços individuais
- [x] Purga/perdas separadas por material, sem dupla contagem
- [x] Detalhamento dos custos e testes de regressão
- [x] CI da extensão aprovado (#44798323962, commit 77412e98)
- [ ] Homologação visual da extensão
- [x] Uma cor expandida por vez; demais resumidas com peso e custo (CI novo pendente)

## Etapa 2 — Perfil do maker
- [ ] Impressoras, filamentos, materiais e tarifa configuráveis
- [ ] IndexedDB e exportação/importação de configurações
- [ ] PWA/offline

## Etapa 3 — Composição de lotes
- [ ] Múltiplas mesas e rateio entre produtos diferentes
- [ ] Quantidade de componentes por produto, montagem e kits
- [ ] Falhas/retrabalho e purga real sem somas duplicadas

## Etapa 4 — Entrada de fatiador
- [ ] G-code/3MF com amostras reais e proveniência dos valores

## Etapa 5 — Comercial
- [ ] Canais, taxas/impostos e preço mínimo
- [ ] Orçamento compartilhável/PDF

## Etapa 6 — Nuvem (sob decisão futura)
- [ ] Contas, sincronização e custo estimado vs. realizado

Não ampliar escopo sem homologação.

## Prioridades novas registradas em 20/11/2026 — sem ampliar MVP agora
- [ ] **Planejar integração Supabase**, sem criar banco ou conectar ambiente antes da aprovação da arquitetura e custos.
- [ ] **Salvar cada impressão/cálculo** em conta do usuário com histórico de custos e versões dos parâmetros.
- [ ] **Cadastro simples de materiais**: tipo (PLA, PETG ou outro), quantidade em kg/g, preço informado e unidade de consumo. Também permitir acessórios, cola, embalagem e outros insumos de processo.
- [ ] **Histórico de compras por material**: registrar compras sucessivas sem sobrescrever preços históricos (exemplo: PLA azul R$68 e, uma semana depois, R$73).
- [ ] **Definir política de custo por compra/lote**: custo real do rolo selecionado versus último preço ou média ponderada; registrar origem da decisão no cálculo salvo.
- [ ] **Modo completo / Pro futuro**: fabricante, cor, data e valor de compra, lote opcional, bobinas individuais e etiqueta imprimível com data, preço, identificação e referência ao lote.
- [ ] **Outros insumos do processo**: catálogo genérico com unidade, custo, consumo por projeto e histórico de aquisição, sem limitar a filamentos.
- [ ] **UX multicor**: mostrar uma linha-resumo por material preenchido; abrir/fechar apenas um formulário de edição por vez, preservando seus valores.
- [ ] **Privacidade e autenticação**: escopo por usuário, políticas RLS e proteção do histórico antes de qualquer banco real.

**Decisão de escopo:** manter o aplicativo simples por enquanto. Supabase e modo Pro são planejamento; não implementar cadastros extensos ou conexão agora.

- [x] Inserir nova cor no topo e expandir automaticamente (evitar cliques repetidos por falta de feedback). CI/homologação da revisão pendentes.

## Ideias recebidas — cadastros assistidos (20/11/2026)
- [x] Piloto de campo Cor: sugestões de cores comuns, digitação livre e memorização local sem duplicar nomes equivalentes (CI/homologação pendentes).
- [ ] Estender o mesmo padrão para tipo de material (PLA, PLA+, PETG etc.), fabricante, marca e modelos de impressora, quando esses cadastros existirem.
- [ ] Sincronizar preferências por conta no Supabase, após definição de autenticação e RLS.
- [ ] Preservar distinção entre **catálogo de nomes** e **registro de compra por lote/preço**, sem sobrescrever o custo histórico.

**Método para novas ideias:** registrar na continuidade e backlog, identificar escopo e dependências, aplicar apenas incrementos pequenos e testáveis; recursos Pro e infraestrutura não entram automaticamente na entrega atual.

- [x] Evitar duplicação de cadastros vazios ao clicar repetidamente em Adicionar cor; reabrir o pendente e adicionar somente após nome, peso e preço válidos (CI pendente).

## UX — resumo padrão e tabela compacta (20/11/2026)
- [x] Visão padrão: total de filamento usado, preço médio ponderado por kg e custo total.
- [x] Botão discreto Detalhar por cor: formulário compacto acima, tabela alinhada com preço/quantidade de embalagem, quantidade usada, custo por linha e total.
- [x] Aceitar 250g, 300g, 1kg e 1,3kg com preço da embalagem; converter internamente para preço por grama.
- [x] Salvar somente ao clicar Adicionar à tabela, nunca gerar linhas vazias após cliques repetidos.
- [ ] CI verde e homologação mobile/desktop para este incremento.

- [x] Corrigir modo simples para editar peso total e preço (g/kg e R$/g ou R$/kg), deixando Detalhar por cor como opção alternativa; preservar valores sem dupla contagem (CI/homologação pendentes).
