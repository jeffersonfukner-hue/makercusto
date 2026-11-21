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

## 20/11/2026 — Novo fluxo e monetização
- [x] Seletor/edição local de impressora acima do filamento, preenchendo energia e depreciação; configuração em memória para validar fluxo (CI/homologação pendentes).
- [ ] Modo Simples global e Avançado global de cálculo (independentes da assinatura).
- [ ] Plano gratuito: cálculo manual sem histórico em nuvem.
- [ ] Plano Compartilhado pago: catálogo comunitário de equipamentos/filamentos/itens consultável por Compartilhado e Full, com direitos de edição, moderação e privacidade definidos.
- [ ] Plano Full pago: cadastros exclusivamente privados e acesso de leitura opcional ao catálogo compartilhado.
- [ ] Modelo Supabase Auth + RLS por proprietário/visibilidade, cobrança, custos e regras de consentimento. Nenhum deploy nem criação de infraestrutura nesta etapa.

## Lote de requisitos — pré-homologação (20/11/2026, sem deploy a cada commit)

### Prioridade 1 — Fundação do cadastro
- [ ] Selecionar impressora como primeira entrada do produto; trazer automaticamente a última impressora usada quando iniciar um novo produto; permitir substituição.
- [ ] Botão "+" discreto ao lado do rótulo Impressora abre modal de cadastro; selecionar cadastro global existente, adicionar nova impressora e editar sem alterar modelos globais.
- [ ] Catálogo inicial de modelos populares de impressoras com identificação/marca e parâmetros **de exemplo identificados como estimativas**; potência/consumo, preço de compra e vida útil não podem ser apresentados como fatos oficiais sem fonte.
- [ ] Persistir última seleção e ajustes pessoais: localStorage para visitante; conta individual para autenticado quando banco disponível. Não prometer persistência entre dispositivos para visitantes.

### Prioridade 2 — Catálogos de filamento
- [ ] Pequeno botão "+" ao lado de cada rótulo Tipo de filamento, Cor e Marca, com modal próprio e sugestões já carregadas.
- [ ] Catálogos globais acessíveis a todos os planos, inclusive gratuito; termos novos normalizados (acentuação, caixa, espaços) e sem duplicatas.
- [ ] Especificar como novas entradas personalizadas são aprovadas/compartilhadas globalmente: não publicar entrada não moderada de um usuário para todos automaticamente.
- [ ] Cada modal tem **Normal** (mínimo de campos) e **Avançado** (informações opcionais); o modo de modal não altera o plano contratado.

### Prioridade 3 — Insumos, ferramentas e estoque
- [ ] Catálogo separado de **ferramentas reutilizáveis** (depreciação/manutenção, não consumir uma ferramenta por peça).
- [ ] Catálogo de **itens extras comprados**, não produzidos (argolas, ímãs, parafusos, embalagem etc.) com unidade, custo de compra, quantidade usada por produto e rateio.
- [ ] Controle de estoque com movimentações de entrada/saída/ajuste, saldo por unidade e rastreabilidade ao produto e lote; desenhar regras antes de construir.
- [ ] Histórico de preços e lotes de filamentos/insumos preserva preços antigos dos custos já salvos.
- [ ] Telas dedicadas de listagem, pesquisa, edição e cadastro para Impressoras, Filamentos, Tipos, Cores, Marcas, Ferramentas, Insumos e Estoque; manter calculadora de acesso rápido sem telas obrigatórias adicionais.

### Prioridade 4 — Banco (arquitetura primeiro, sem provisionar)
- [ ] Definir contratos de dados, identificadores estáveis, isolamento entre catálogo global, alterações por usuário, itens compartilhados e itens Full privados.
- [ ] Planejar Supabase: autenticação, RLS, visibilidade, assinaturas, preços históricos, saldos e registros de custo imutáveis; sem chaves secretas no navegador.
- [ ] Implementação futura via camadas de armazenamento intercambiáveis (memória/localStorage e serviço remoto) sem duplicar motor de cálculo.
- [ ] Testes automatizados de permissões: visitante, gratuito autenticado, Compartilhado e Full; leitura global, edição própria e bloqueio de dados privados.

**Ordem de entrega proposta:** fechar regras e telas principais → persistência local da última impressora → componentes reutilizáveis de modal/catálogos → listagens → desenho e testes da base Supabase → estoque/assinaturas. Sem publicar em cada commit; homologar o lote.

## Arquitetura mestre — homologação de regras (20/11/2026)
- [x] Registrar cinco regras estruturais HOMOLOGADAS de catálogo original protegido, cópia personalizada renomeável, plano Compartilhado, plano Full, estoque rastreável e composição de kits.
- [x] Elaborar `docs/PLANO_MESTRE_MAKERCUSTO.md` com fluxos, estados atuais, roadmap e pendências não decididas.
- [x] Elaborar `docs/MODELO_DE_DADOS.md` como projeto lógico, com entidades, relações, matriz de permissões, invariantes, segurança/RLS e migrações **não executadas**.
- [ ] Homologar pendências sobre rascunhos no Compartilhado, downgrade, propriedade de estoque, método de custeio, múltiplas oficinas, curadoria e privacidade.
- [ ] Revisar modelo lógico antes de escrever SQL/migrações; sem provisionar banco ou integrar assinaturas nesta etapa.
