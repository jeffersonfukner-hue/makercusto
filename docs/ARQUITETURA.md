# Arquitetura do MakerCusto

- React + TypeScript + Vite, site estático.
- `src/domain/cost.ts`: cálculo puro e independente da interface.
- `src/App.tsx`: formulário interativo; estados apenas em memória, sem armazenamento persistente.
- `src/styles.css`: tokens e estilo responsivo (desktop/mobile).
- Materiais multicor: `materials` com nome, peso do modelo, purga adicional e preço/kg; `grams/pricePerKg` são campos legados de compatibilidade e só entram quando `materials` está ausente.
- `materialBreakdown` expõe valores por cor para auditoria do custo. Não ler diretamente número de peças da cor como número de produtos finais.
- Vitest: motor matemático e validação; Playwright: interface e responsividade.
- GitHub Actions: tipagem, unitários, build, E2E; sem deploy.
- IndexedDB, PWA, G-code/3MF, multi-mesas e composição de kits ficam no backlog.
- Sem backend, autenticação ou transmissão de parâmetros de custos.
- Valores monetários ainda são cálculos em Number; em versão de produção persistente, adotar precisão decimal e regra explícita de arredondamento.

- MaterialLine pode incluir tipo, marca, packageQuantity, packageUnit e packagePrice; o motor calcula preço/kg derivado quando esses campos existem. Campos legados seguem compatíveis para regressão.
- UI de compra é um formulário único em estado de rascunho: linhas são persistidas apenas em memória após Adicionar à tabela/Salvar alteração. Por padrão, só resumo agregado é mostrado; tabela é expandida explicitamente.

- Dois modos de filamento mutuamente exclusivos na UI: simples usa grams/pricePerKg legados, normalizados de g/kg e R$/g ou R$/kg, com materials=undefined; detalhado usa materials da tabela. Ambos preservam estado ao alternar e jamais são somados.

- O cadastro de impressoras proposto diferencia perfis locais de sessão e cadastros persistentes dos planos futuros. Equipamento selecionado alimenta printerPrice, averageWatts, lifetimeHours e pricePerKwh; não modifica dados de filamento.
- Planos futuros: compartilhado com visibilidade para assinantes Compartilhado/Full; privado com isolamento por usuário. Exigir autorização baseada em proprietário e visibilidade, não somente no papel authenticated; compartilhamento opt-in e proteção de itens privados.

## Proposta de domínio para futura persistência (não implementada)

Separar modo de cálculo (Simples/Avançado), profundidade do modal (Normal/Avançado) e plano de dados (gratuito/Compartilhado/Full). São três dimensões independentes.

**Entidades lógicas preliminares** — nomes definitivos e migrações dependem de revisão técnica:
- `users/profiles/subscriptions`: identidade e elegibilidade do plano, dados de autorização sob controle do servidor.
- `catalog_types`, `catalog_colors`, `catalog_brands`, `printer_models`: referências globais acessíveis a todos os planos. Novas sugestões passam por deduplicação e curadoria antes de virar item global.
- `printers`: instâncias de impressoras de um usuário; referenciam um modelo global, mas têm custo, potência, vida útil e alterações próprios, sem sobrescrever o modelo.
- `filaments`, `filament_purchases`, `material_lots`: tipos/cores/marcas, transações datadas e rolos/lotes; preservar custo histórico de compras distintas.
- `tools` (reutilizáveis), `supplies` (consumíveis comprados), `products` e `product_components`: entidades separadas, com unidade de medida, composição e custo.
- `stock_movements` e `stock_balances`: entradas, saídas, ajustes e rastreabilidade. Saldo derivado de movimentações, não apenas campo editável solto.
- `print_cost_snapshots`: custo de cada impressão congelado com versão/referência de preço, equipamento e materiais à época; alterações futuras não reescrevem histórico.
- `user_preferences`: última impressora utilizada e preferências do formulário.

**Acesso e visibilidade:** catálogos globais são leitura geral; registros compartilhados podem ser lidos por Compartilhado e Full conforme regras de plano; itens Full são privados por padrão. Somente proprietário ou função autorizada altera cada registro. Propor políticas RLS por entidade e verificar combinações de planos, autorias e permissões antes da conexão real. Regras de publicação/edição de contribuições precisam de decisão explícita.

**Implementação incremental:** interfaces de domínio independentes do backend; persistência do visitante por armazenamento local e do usuário autenticado por serviço Supabase futuro. Sincronização e migração do localStorage para conta precisam de política de conflitos e consentimento. Não gravar secrets/chave service_role no frontend.

**Estado atual:** nenhuma tabela, autenticação, migração ou cobrança criada nesta etapa.
