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

## Revisão de permissões/fluxos — 20/11/2026
- [x] Auditar plano-mestre e modelo lógico do commit `896877b8`; documentar 12 achados, matriz, seis fluxos e oito propostas em `docs/REVISAO_PERMISSOES_E_CADASTROS.md`.
- [ ] Homologar rascunhos do Compartilhado, comportamento após cancelamento, campos publicáveis, acesso gratuito a S, múltiplas oficinas, custo de lote e curadoria global.
- [ ] Separar dados operacionais privados de fichas G/S no esquema físico e criar testes RLS de autoria, assinatura e imutabilidade.
- [ ] Definir chaves estrangeiras para estoque e composição de produtos antes de migrações.

## Homologação adicional das permissões — 20/11/2026
- [x] Homologar as oito **direções** propostas no relatório `REVISAO_PERMISSOES_E_CADASTROS.md` (base `3878be18`), com registro em `HOMOLOGACAO_PERMISSOES_2026-11-20.md`.
- [x] Evoluir o modelo lógico com domínios, rascunho/publicação, oficina prevista, referências de estoque/produtos e validações futuras.
- [ ] Definir retenção, limites, leitura e exportação após cancelamento; destino de publicações já realizadas.
- [ ] Homologar campos específicos publicáveis de cada cadastro e critérios de moderação das sugestões globais.
- [ ] Homologar o contrato de multi-oficina/equipes, modelagem relacional final e método complementar de custeio/estoque.
- [ ] Somente após essas decisões, preparar migrações e testes RLS em projeto de laboratório autorizado. Nenhum banco criado.

## Contrato detalhado de cadastros — proposta técnica 20/11/2026
- [x] Propor campos, tipos, relações, ações e validações para referências globais, cópias pessoais, impressoras físicas e filamentos com compras/bobinas em `docs/CONTRATOS_CADASTROS_E_FILAMENTOS.md`.
- [x] Separar preço e estoque particulares das fichas descritivas compartilháveis, preservando as 13 decisões homologadas.
- [ ] Homologar tabelas específicas vs catálogo unificado, tarifa elétrica por oficina, fluxo de instância de impressora, normalização por nome/variante, retenção e campos descritivos publicáveis.
- [ ] Antes de SQL: definir FKs entre oficinas/itens, concorrência, regra de lotes sem nota, custo e política de estoque negativo; preparar testes RLS e de regressão em projeto de laboratório autorizado.

## Contrato de estoque e produtos — 20/11/2026
- [x] Registrar quatro decisões técnicas homologadas em `docs/HOMOLOGACAO_CADASTROS_2026-11-20.md` (base `4bab9d0c`).
- [x] Criar proposta `docs/CONTRATO_ESTOQUE_PRODUTOS.md`: identidades de estoque, compras, lotes, ledger, ferramentas e serviços, composição de kits com revisões, produção e snapshots.
- [ ] Homologar modelo de item estocável/FKs, saldo negativo/lote, reserva, baixa, estorno e transações.
- [ ] Homologar rateio de mesa com múltiplos produtos, revisões de kits, precisão financeira e custos adicionais antes de SQL.
- [ ] Preparar testes SQL/RLS somente depois de aprovação específica, sem provisionar projeto nesta rodada.

## Seis regras homologadas — estoque, produtos e produção (20/11/2026)
- [x] Homologar seis princípios no `docs/HOMOLOGACAO_ESTOQUE_2026-11-20.md`, preservando 17 anteriores.
- [x] Modelar proposta adicional de eventos de estoque, FKs por oficina, transações, composição por revisão, rateio, estornos e cenários de teste em `docs/REFINAMENTO_ESTOQUE_PRODUCAO.md`.
- [ ] Decidir política de reserva, lote indefinido, baixa parcial/falha e estorno parcial.
- [ ] Aprovar fórmula(s) de rateio e conciliação de energia/tempo/purga para mesas mistas.
- [ ] Aprovar schema físico, chaves estrangeiras, precisão monetária e controle de concorrência antes de SQL e RLS.

## Produção real e rateio — contrato de proposta (20/11/2026)
- [x] Revisar documentação do commit `ca53d01c` e formalizar `docs/MODELAGEM_PRODUCAO_REAL_E_RATEIO.md`.
- [x] Documentar propostas de reservas, confirmação incremental, falha, retrabalho, múltiplas saídas na mesma mesa, custos separados por categoria, conciliação e testes futuros.
- [ ] Homologar política de reserva e expiração; confirmacões parciais; falhas com consumo e sem produto bom; custo de retrabalho; direcionadores de rateio.
- [ ] Definir custo de pausa, unidade, precisão/centavos, lote sem identificação, segurança concorrente e proveniência dos dados do fatiador.
- [ ] Preparar esquema físico/RLS e testes quando autorizado; **não criar banco nem mudar código nesta fase**.

## Revisão para homologação das cinco decisões de produção (20/11/2026)
- [x] Revisar commit `e479d08e` e formalizar recomendações, exemplos e limites em `docs/PROPOSTAS_HOMOLOGACAO_PRODUCAO_2026-11-20.md`.
- [ ] Homologar RES (reserva opcional), PAR (confirmação incremental), FAL (perda com 0 peças boas), RET (retrabalho separado) e RAT (rateio por categoria com conciliação).
- [ ] Detalhar exceções: vencimento e sobras da reserva, medição e tratamento de pausas, fórmula específica de rateio, custo de refugo incorporado ou separado, critérios de estorno parcial.
- [ ] Escolher precisão financeira e esquema de banco e testar RLS/transações apenas em etapa futura autorizada.

## Homologação de cinco regras de produção — 20/11/2026
- [x] RES, PAR, FAL, RET e RAT homologadas com registro em `docs/HOMOLOGACAO_PRODUCAO_2026-11-20.md` e preservação das 23 decisões anteriores.
- [ ] Resolver reserva residual/vencimento, concorrência e política de lote.
- [ ] Detalhar fluxo parcial, falha e retrabalho com critérios financeiros.
- [ ] Homologar fórmulas por grupo de custo e regras de precisão/centavos.
- [ ] Somente depois, refinar esquema físico e testes RLS, sem execução de banco sem autorização.

## 21/11/2026 — Regra de produto: pronta para imprimir (homologada)
- [ ] Pré-popular fichas completas de modelos de impressora: fabricante, modelo, tecnologia, volume de impressão e demais especificações disponíveis em fonte oficial; indicar fonte, data/versão e não preencher como "oficial" o que não foi verificado.
- [ ] Pré-popular **estimativas operacionais utilizáveis**, incluindo consumo médio durante impressão, vida útil e valores financeiros ilustrativos, claramente marcadas e editáveis. O usuário não deve fazer cálculos técnicos para conseguir usar o MakerCusto.
- [ ] Separar fabricante e modelo em seletores dependentes, modelos de maior uso primeiro e pesquisa fácil.
- [ ] Implementar **Copiar e personalizar** modelo original em uma etapa: nome próprio da impressora (ex.: "Aninha"), herdar todos os parâmetros e alterar somente exceções; salvar vínculo de origem e manter original intacto.
- [ ] Estender catálogo útil pré-populado a cores, marcas e tipos de filamento, com pesquisa e opções personalizadas sem duplicatas.
- [ ] Testar seleção rápida, valores de partida, cópia com nome, ajustes individuais, original intacto e preservação do histórico em desktop/mobile.

### Ideia de monetização futura — Plus (registrar, não executar agora)
- [ ] **Dicas e perfis otimizados por tipo de impressão:** combinando impressora/modelo, filamento e objetivo (articulados, miniaturas, peças técnicas, acabamento, resistência, velocidade); orientações por fatiador quando aplicável, parâmetros revisados e origem/validação indicadas. Definir plano pago e escopo comercial em momento posterior; não confundir dicas com valores oficiais do fabricante.

## Padrão universal — referência pronta, cópia personalizada e normalização (21/11/2026)
- [ ] Implementar um fluxo reutilizável para todas as entidades cabíveis: selecionar referência protegida, consultar campos já preenchidos, clonar completamente, nomear cópia e alterar somente as exceções.
- [ ] Fichas de filamentos por fabricante/linha/tipo com presets consultáveis de slicer (temperatura, mesa, velocidade, ventilação, retração, secagem), fontes e compatibilidade, incluindo Masterprint PETG e SUNLU PLA depois de verificar referências.
- [ ] Manter consulta básica de parâmetros no cadastro; reservar otimizações por aplicação/impressora/material para proposta comercial Plus futura.
- [ ] Normalização global de nomes por tipo de dado: vermelho fosco → Vermelho Fosco, siglas técnicas preservadas, grafias oficiais, prevenção de duplicatas e sugestão de correção para erros.
- [ ] Testes de original imutável, cópia integral, edição independente, histórico, formatação de nomes, deduplicação e responsividade.

## Ajuda dinâmica e até três sugestões por campo (21/11/2026)
- [ ] Componente reutilizável de dica abaixo de campos relevantes, variando conforme preenchimento, seleção, erro ou valor atípico, sem poluir a tela.
- [ ] Autocomplete limitado a 3 sugestões clicáveis por entrada, priorizando prefixo/popularidade/similaridade e respeitando fabricante, tipo e catálogo; sem resultados inventados.
- [ ] Aplicar progressivamente em impressoras, filamentos (marca/tipo/cor/linha), nomes próprios, parâmetros técnicos, compras e custo; avaliar campo por campo e não apresentar dica quando não ajuda.
- [ ] Avisos claros para duplicata ou provável erro de grafia; ao escolher sugestão, preencher campo certo e conservar demais valores.
- [ ] Testar teclado, toque mobile 320px, acessibilidade, reação durante digitação, falsos positivos, nomes oficiais imutáveis e ausência de requisições excessivas.

## Página pública e acompanhamento do produto — etapas futuras

- [ ] **Contadores na página sem login.** Mostrar em destaque os totais reais de visitas e cálculos gratuitos realizados. Explorar a posição ao lado da introdução “Impressão 3D sem complicação” ou dos botões, com adaptação ao celular. Definir o que conta como visita e como cálculo realizado para evitar inflar os totais com recargas, digitação e robôs.
- [ ] **Chamada para criar conta.** Posicionar perto dos contadores e explicar o benefício de salvar e acessar os cadastros. Definir o modelo comercial, inclusive eventual cobrança da conta ou de funcionalidades, antes de anunciar condições na página.
- [ ] **Área administrativa.** Após os ajustes de layout e funcionalidades, planejar um painel privado para acompanhar visitas, uso da calculadora, funil de criação de conta e vendas, com indicadores para entender interesse e conversão.

## Confirmações, progresso e suporte

- [x] **Confirmações de alteração em cadastros.** Revisões de produtos, peças e conjuntos, revisão de custo na calculadora, edição de impressora própria, troca de foto principal e remoção de peças da composição pedem confirmação no padrão do site. Cancelar preserva o rascunho ou o registro.
- [x] **Confirmações em Impressões.** Usar o diálogo do site em consumo incremental, troca de bobina, redução parcial e cancelamento. Preservar justificativas, formulário e chave de reenvio.
- [ ] Homologar os diálogos e o feedback de operações em Impressões no Preview.
- [ ] **Feedback de operações demoradas.** Mostrar carregamento, etapa atual, falha e opção Detalhes. Usar porcentagem apenas quando a operação expuser progresso mensurável. Em operações sem total conhecido, mostrar estado indeterminado e a última etapa confirmada. Envio de fotos já mostra o arquivo atual, a quantidade concluída e detalhes de falha. Impressões já sinaliza espera pela resposta e atualização da lista.
- [ ] **Suporte por WhatsApp.** Permitir configurar o número de suporte na futura área administrativa e oferecer um link nas mensagens de erro pertinentes. O usuário pode revisar o texto que será encaminhado. Sistema de tickets fica para etapa posterior.
- [ ] **Ajuda por contexto.** Nas próximas revisões de interface, mover explicações auxiliares para o ícone de informação junto ao título, rótulo ou ação. Deixar erros e informações necessárias para agir à vista.

## Calculadora aritmética de bolso

- [ ] Disponibilizar uma calculadora de operações básicas, acessível pelo ícone junto ao nome do usuário na área logada e por um atalho equivalente na versão gratuita. O atalho abre a calculadora sem sair da tela atual ou perder os dados em edição. Escopo inicial: soma, subtração, multiplicação e divisão.
- [ ] Acrescentar um pequeno bloco de notas ao lado da calculadora e acessível dentro dela para anotar valores e contas rápidas sem sair da tela em edição.
- [ ] Estudar uma conversão estimada entre USD e BRL na calculadora de bolso. Usar como cenário o orçamento de 12 itens para um cliente nos Estados Unidos, com valor unitário, quantidade, total e cotação aplicada. Avaliar fonte da cotação, data e hora da referência e a possibilidade de informar uma taxa manual. Manter calculadora, notas e conversão atrás das prioridades atuais de Pedidos e histórico de custos.

## Organização da oficina

- [ ] Consolidar os cadastros em telas de consulta e gestão próprias para cada entidade. Preservar os atalhos rápidos na calculadora e reaproveitar a mesma lógica de cadastro.
- [ ] Homologar o registro de pedidos por produto, histórico de revisões de custo e isolamento por oficina no Preview após autorização específica para a migração de Pedidos.

## Custos gerais de montagem

- [ ] Decidir como registrar cola, embalagem e consumíveis de baixo valor na montagem. Avaliar custos gerais rateados ou valores por unidade/conjunto conforme a forma de registrar o consumo. Retomar numa etapa posterior.

## Resultado único da calculadora

- [x] Reaproveitar um único painel de resultado em Cálculo, Composição, Configurações e Observações. Manter compartilhamento, orçamento e planejamento/registro de pedidos no mesmo painel. Preservar a origem ativa ao trocar de aba, com escolha explícita entre impressão direta e montagem por partes e sem copiar automaticamente os dados de uma forma de produção para a outra.
- [x] Nos pedidos por composição, multiplicar pelo número de produtos montados. Exibir mesas apenas ao usar uma estimativa de impressão direta, ou quando houver dados próprios de produção para as partes.

- [x] Aplicar e validar a migração do método de produção de Pedidos no Supabase de teste.
- [ ] Homologar o painel único e o pedido por montagem no Preview.
- [x] Aplicar a migração de precificação da composição no Supabase de teste.
- [ ] Homologar no Preview a recuperação em outro aparelho, a troca de método no mesmo produto e o valor usado no pedido.
