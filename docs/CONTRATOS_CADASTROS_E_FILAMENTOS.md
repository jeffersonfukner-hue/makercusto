# MakerCusto — Contratos de dados de catálogos, cópias, impressoras e filamentos

**Status:** PROPOSTA TÉCNICA para revisão. **Base:** documentação da branch `feat/fundacao-makercusto` em 20/11/2026 (HEAD inicial `eb610b31`). **Não** é migração SQL, criação de banco, implementação de API ou homologação dos detalhes em aberto.

Fontes normativas: `PLANO_MESTRE_MAKERCUSTO.md` (cinco regras), `HOMOLOGACAO_PERMISSOES_2026-11-20.md` (oito diretrizes), `MODELO_DE_DADOS.md`, `PADROES.md`, `CONTINUIDADE.md`. Os requisitos dessas fontes são preservados, e escolhas abaixo são identificadas como propostas quando não aprovadas.

## 1. Contratos de proteção e nomenclatura

**Homologado:** (a) G/global original não pode ser alterado pelo usuário; personalização cria cópia renomeável, ID próprio, referência/versão da origem; (b) fichas S/compartilhadas publicadas legíveis por assinantes Compartilhado e Full, editáveis pelo autor e administração específica; (c) Full P/privado por padrão e publicação voluntária de **cópia separada**; (d) dados financeiros, compras, estoque e histórico particulares não podem ser publicados; (e) visitante/gratuito leem G, não leem S inicialmente; (f) rascunhos Compartilhado privados até confirmação; (g) cancelamento preserva autoria/privacidade e bloqueia **novas** ações pagas; (h) `workspace_id` previsto; (i) custo preferencial do lote real com snapshot imutável; (j) curadoria global por administrador; estoque auditável e kits multicomponentes.

**Crítico:** `global/shared/private` é visibilidade de **fichas descritivas copiáveis**, não autorização para divulgar a instância física da impressora, compra, rolo adquirido, fornecedor ou movimento de estoque. Esses registros são sempre operacionais/particulares à oficina. Não reutilizar um campo `scope` indiferenciado em toda tabela.

## 2. Estratégia relacional recomendada (AINDA NÃO HOMOLOGADA)

Para evitar `JSONB` arbitrário e FKs polimórficas sem integridade, **propor tabelas específicas** por espécie de entidade, com campos comuns padronizados:

- `filament_types` — tipos (PLA, PETG etc.)
- `colors` — cores genéricas
- `brands` — fabricantes/marcas
- `printer_models` — modelos de impressoras
- `filament_specifications` — combinação descritiva de tipo, cor, marca e variante (quando aplicável)

As cinco tabelas são **fichas copiáveis**, com `scope` e propriedade. Uma tabela genérica `catalog_entries` pode ser reconsiderada; **não escolher SQL físico antes de aprovação**. Para evitar FK conflitante de cada ficha à origem, cada entidade tem `source_id` FK *à sua própria tabela*. `printer_instances`, `filament_purchases` e `filament_lots` ficam em tabelas operacionais separadas, sempre particulares.

### 2.1 Colunas comuns de ficha copiável (proposta)

| Campo | Tipo lógico | Restrição/proveniência |
| --- | --- | --- |
| `id` | UUID | PK, imutável |
| `scope` | global / private / shared | G só administração; S depende de plano ativo |
| `owner_user_id` | UUID opcional | Nulo somente em G; identidade autenticada validada no servidor, não pelo payload |
| `source_id` | UUID opcional | FK para ficha da mesma entidade; diferente de `id`; evitar ciclos |
| `source_version` | inteiro opcional | Versão da origem no momento da cópia; obrigatória se `source_id` existir |
| `name` | texto não vazio | Editável na própria cópia, não em G pelo usuário |
| `normalized_name` | texto | Canonização para busca/deduplicação contextual, sem eliminar nomes distintos legítimos |
| `version` | inteiro positivo | Revisão própria, não sincroniza automaticamente com `source_version` |
| `status` | draft / published / archived | Rascunho não pode ser lido por outros; `shared` exige `published` |
| `created_at`, `updated_at` | data-hora com fuso | Geradas no servidor |
| `archived_at` | data-hora opcional | Inativação sem destruir referências históricas |

**Invariantes:** `global => owner_user_id IS NULL`; `private/shared => owner_user_id NOT NULL`; `scope=shared => status=published`; um rascunho ainda não publicado é privado; cópia recebe nova identidade e retém `source_id`/`source_version`. Atualizar `owner_user_id`, `scope`, `source_id`, `source_version`, `created_at` ou `version` arbitrariamente pela API é proibido. Publicação do Full usa **outra linha S**, não muda P para S. A aplicação deve impedir ciclos de origem até mesmo em cópias de cópias.

**Pendência importante:** como o Compartilhado lida com armazenamento permanente de rascunhos privados e se um item S já publicado pode voltar a P. Proposta conservadora: publicação cria nova linha S a partir de P e **não** reclassifica original, para todos os planos; isso ainda requer homologação para o Compartilhado.

## 3. Especificação de cada entidade copiável

| Entidade | Obrigatório (proposta) | Avançado/opcional | Não pertencer à ficha publicável |
| --- | --- | --- | --- |
| `filament_types` | `name`; `category` opcional na proposta mínima | intervalo recomendado de temperatura e observações, **com fonte** | custo do rolo, consumo pessoal |
| `colors` | `name` | código HEX ou referência comercial, acabamento, observações | quantidade em estoque, preço pessoal |
| `brands` | `name` | país/site oficial e aliases; dados verificáveis | fornecedores particulares, preço da compra |
| `printer_models` | `name`, `brand_id` | volume XYZ mm, tecnologia, bicos compatíveis, wattagem nominal e referência de fonte | valor efetivamente pago, watts medidos no usuário, horas de uso, número de série |
| `filament_specifications` | `type_id`, `color_id`, `brand_id` (quando conhecidos); `name` | diâmetro mm, acabamento, densidade, temperatura de extrusão/mesa, fabricante, observações e fontes | lote físico, compra, preço da bobina, fornecedor particular |

**Precisão:** propriedades como potência/vida útil ou parâmetros de PETG são **estimativas ou dados com fonte**. Não povoar catálogo global com preço de aquisição ou consumo pessoal como se fossem especificações oficiais. Lista inicial global sugerida, não exaustiva, de cores/tipos/marcas e modelos frequentes; permitir submissão de termos novos à curadoria (usuário não insere diretamente G). O campo `brand_id` de `printer_models` deve apontar marca de uso permitido; FKs de fichas compartilhadas devem ter resolução de acesso válida em cada escopo e versão.

**Questão de UX:** rótulos Tipo/Cor/Marca/Impressora com botão `+` discreto no mesmo alinhamento, modal Normal/Avançado, busca/seleção/copiar/renomear; telas de listagem dedicadas. Alterações em cadastros retornam à calculadora sem perder o rascunho. São requisitos já documentados; os contratos de layout detalhados continuam pendentes.

## 4. Impressora física — `printer_instances` (proposta)

Referência descritiva de modelo `printer_models` **não** é a máquina do maker. A instância física é pessoal, mesmo se o modelo original é global/compartilhado.

| Campo | Tipo lógico | Regra |
| --- | --- | --- |
| `id` | UUID PK | instância única |
| `workspace_id` | UUID FK | oficina proprietária; obrigatória no desenho |
| `created_by_user_id` | UUID | auditoria da criação |
| `model_id` | UUID FK `printer_models` | pode referenciar global ou ficha acessível conforme direitos |
| `nickname` | texto | renomeável pelo usuário; exemplo “Kobra X bancada” |
| `purchase_price_brl` | decimal ≥0, opcional | preço real particular, nunca global |
| `acquired_at` | data opcional | opcional |
| `average_watts` | decimal ≥0, opcional | valor medido ou estimado, com indicador de origem |
| `watts_basis` | measured / estimated / manufacturer | não confundir cálculo de energia com valor nominal |
| `lifetime_hours` | decimal >0, opcional | estimativa editável de depreciação |
| `maintenance_cost_policy` | referência opcional | método de rateio a homologar; não duplicar depreciação |
| `currency` | BRL no MVP | futura extensibilidade |
| `status` | active / inactive | inativar sem reescrever custos antigos |
| `created_at`, `updated_at` | timestamps | rastreabilidade |

**Tarifa elétrica:** atributo da oficina/período, **não característica fixa do modelo global**. Proposta: `workspace_energy_rates(id, workspace_id, price_per_kwh_brl, effective_from, effective_to)` e override pontual no cálculo; a UI atual acopla tarifa ao perfil da impressora, mas o banco precisa evitar replicar tarifa em cada equipamento. Se houver tarifas múltiplas (local/horário), política futura.

**Seleção padrão:** `user_preferences.last_printer_instance_id` só aponta instância acessível à oficina; criar novo produto recupera a última válida, podendo alterá-la. Visitante usa `localStorage` no navegador e perde após limpar o armazenamento; dados de conta requerem serviço futuro. A UI de protótipo ainda usa estado temporário e **não implementa persistência local**.

**Cálculo:** energia = `average_watts/1000 * hours * R$/kWh`; depreciação = `purchase_price_brl/lifetime_hours * hours`, sem declarar essas hipóteses como medições. No snapshot registrar valores efetivamente escolhidos e proveniência, não apenas ID da impressora.

## 5. Filamento — definição, compra, bobina e consumo (proposta)

| Entidade | Dados principais | Limites de privacidade |
| --- | --- | --- |
| `filament_specifications` | combinação descritiva tipo/cor/marca/variante, versão/fonte | copiável/publicável apenas campos descritivos |
| `purchases` | `id`, `workspace_id`, `supplier_id?`, data, documento, moeda | somente oficina |
| `purchase_lines` | `id`, `purchase_id`, `filament_specification_id`, quantidade adquirida, unidade, total pago, taxas atribuídas? | somente oficina; preço histórico |
| `filament_lots` | `id`, `workspace_id`, `purchase_line_id`, identificador/etiqueta, quantidade inicial em g, situação | bobina/lote próprio e rastreável |
| `stock_movements` | `workspace_id`, `inventory_item_id`, `lot_id`, `quantity_delta_g`, motivo, `source_event_id`, estorno | nunca publicar |
| `production_consumption` | `run_id`, `filament_lot_id`, peso modelo g, purga g, desperdício g, `source_event_id` | consumo da execução, uma única baixa efetiva |
| `cost_snapshot_lines` | fonte de preço, g consumidos, custo unitário vigente no lote, custo calculado | imutável depois de confirmado |

**Unidades:** para material, armazenar quantidade base em **gramas** e manter a unidade informada (`g`/`kg`) por auditoria; `package_price` é preço TOTAL pago pela embalagem e **não** preço/kg. `cost_per_g = purchase_line_total / purchased_grams` (regra simples proposta, com custos acessórios pendentes). Múltiplos rolos/compra podem ter preços distintos; nenhuma compra reescreve a anterior. Compra de 250 g/1 kg/1,3 kg é convertida em g sem perder informação original.

**Custo prioritário homologado:** usar preço do **lote realmente selecionado**. Se não houver lote identificado, permitir apenas custo **estimado e marcado como tal** no cálculo manual, sem inventar seleção FIFO ou média ponderada. Capturar preço aplicado e referência no snapshot; políticas fiscais, frete rateado e estoque negativo permanecem abertas.

**Purga/desperdício:** consumo total = modelo + perdas **somente quando não estiverem incluídas** na pesagem. Proteger contra duplicidade. Filamento total (rápido) e detalhamento por cor são alternativas exclusivas no motor; manter dados de ambas as entradas sem somá-las.

**Cadastro em dois níveis:** definição de filamento não cria automaticamente bobina no estoque. Compra cria entrada rastreável, bobina/lote e movimento; um nome de cor não é quantidade adquirida.

## 6. Fluxos e ações — contrato de aplicação proposto

| Ação | Pré-condições | Pós-condições | Erro esperado |
| --- | --- | --- | --- |
| `listGlobal(kind)` | usuário ou visitante | mostra referências G sem mutação | tipo inválido |
| `createCopy(kind, source_id, name)` | origem legível; autenticado/assinatura conforme destino | ID novo, origem/versão capturados, privado inicialmente | origem sem acesso ou nome vazio |
| `updateOwnCopy(id, patch)` | dono e direitos ativos | altera apenas campos permitidos da cópia; incrementa versão | ID alheio/global, campos imutáveis |
| `publishCopy(id, confirmed)` | autor, plano habilitado, confirmado | gera **nova ficha compartilhada**, original mantém escopo; projeção descritiva | sem assinatura, ausência de consentimento, dados proibidos |
| `suggestGlobal(kind, payload)` | usuário elegível, política de moderação | cria sugestão separada de G, sem inserir no catálogo | duplicação, conteúdo inválido |
| `registerPrinter(instance)` | oficina própria | vincula modelo e instância particular, parâmetros editáveis | FKs cruzando oficinas ou modelo inacessível |
| `selectLastPrinter` | última seleção válida | registra preferência própria, não altera outras oficinas | instância alheia/inativa |
| `registerFilamentPurchase` | oficina própria, definição válida | compra/linha/lote/movimento de entrada atômicos | entrada duplicada, conversão inválida |
| `consumeFilament` | produção própria, lote disponível | movimento auditável idempotente + quantidade consumida | saldo insuficiente conforme futura política |
| `saveCostSnapshot` | cálculo validado | registra fórmula, quantidade, preço, fonte e versão em histórico congelado | valores inválidos ou custo sem proveniência |

**Separação de modais:** Normal exige somente dados mínimos úteis ao cálculo, Avançado revela detalhes opcionais; botão Salvar deixa claro quando o destino é local, nuvem privada ou publicação. Sem conta, ações em memória/`localStorage` não devem prometer persistência remota.

## 7. Matriz de permissões vinculada às entidades

| Domínio | Visitante/gratuito | Compartilhado pago | Full pago | Administrador oficial |
| --- | --- | --- | --- | --- |
| G tipos/cores/marcas/modelos | Ler; cópia local | Ler/copiar | Ler/copiar | Manter/versionar |
| S fichas publicadas | Não lê inicialmente | Ler/copiar; autor edita sua S | Ler/copiar; autor edita sua S | Somente intervenção autorizada e auditada |
| Rascunho próprio | Local | Privado até publicação explícita | Privado até publicação opcional | Não possui acesso automático |
| P privadas na nuvem | Não garantidas | Retenção/limites em aberto | Próprias, privadas por padrão | Não possui acesso automático |
| Impressora física, compra, bobina, estoque, custos | Local quando aplicável | Somente oficina própria | Somente oficina própria | Não possui acesso automático |

O plano **não altera a fórmula financeira** nem torna automático o compartilhamento. A decisão de múltiplas oficinas não implica equipes habilitadas.

## 8. Validações e índices propostos (sem SQL)

- `name` não vazio, tamanho máximo a definir; `normalized_name` por idioma/namespace com regra de prevenção de falso duplicado.
- Índice por `(kind, scope, normalized_name)` nas consultas, mas unicidade exata deve ser decidida por contexto/autor e `source_id`; duas cores comerciais podem ter o mesmo nome genérico.
- Chaves FK de mesmo `workspace_id` (compras/lotes/movimentos/produção); impedir referência à oficina alheia até em payload interno.
- Quantidades em g não negativas na compra; em movimento `quantity_delta_g` assinado e não zero, tipo coerente; `source_event_id` idempotente por oficina/operação.
- Custo, potência, tarifa e vida útil: números finitos, não negativos, divisor > 0 ao calcular depreciação; valor não informado é **null**, não zero implícito.
- Preços financeiros persistidos exigem tipo decimal e política de arredondamento; não copiar `Number` do protótipo para o banco.
- `source_version` capturada; após editar G administrativamente, cópias/snapshots permanecem inalterados. Histórico não eliminado por arquivamento de referência.
- Cadastro e publicação: validação na API/RLS além da interface; `owner_user_id` nunca é aceito do cliente sem verificação no servidor.
- Suporte a transações de compra e consumo; versão/concorrência para evitar perda de edição simultânea.

## 9. Regressões obrigatórias quando implementação autorizada

1. G não permite UPDATE/DELETE por nenhum plano; cópia renomeada mantém global original.
2. Full publica uma cópia S com novo ID e P permanece privado; S contém apenas campos descritivos permitidos.
3. Compartilhado tem rascunho não visível; publicação sem confirmação é rejeitada.
4. Gratuito não lê S; todos leem G.
5. Compras/estoques e valores particulares não aparecem ao ler definição global/compartilhada de filamento.
6. Duas bobinas de mesmo tipo/cor/marca com preços R$ 68 e R$ 73 permanecem em histórico independente.
7. Trocar de impressora aplica custo correto; outra oficina não pode selecionar a instância alheia.
8. Duplo clique em salvar compra/baixar estoque não gera duplicação; correção auditável por estorno.
9. Alterar preço de compra posterior não muda o snapshot já confirmado.
10. Alterar modo filamento total/detalhado nunca soma ambos.
11. Modal normal/avançado preserva rascunho; cadastrar tipo/cor/marca retorna ao ponto de partida.
12. Expiração de plano não torna P público nem apaga propriedade; novas ações pagas bloqueadas.

## 10. Questões pendentes para aprovação (sem decisão implícita)

- **Física das tabelas:** entidades específicas (recomendação) ou `catalog_entries` tipada; regras de FK de cópias com a origem.
- **Cadastros no Compartilhado:** rascunhos privados de longa duração, quantidade e destino após mudança de plano; publicar sempre como nova cópia é recomendação, ainda requer aceitação específica do fluxo para esse plano.
- **Campos compartilháveis por tipo:** lista branca exata, versões de ficha pública, fontes/atribuição e moderação.
- **Instância da impressora:** quando usuário personaliza modelo global, cria cópia de ficha, instância física, ou ambas? A regra homologada exige cópia para alterar global, mas não determina fluxo de instância.
- **Tarifa elétrica:** por oficina e vigência (recomendado), override de cálculo e política para cenários de horários/tarifas.
- **Filamentos:** variante técnica da mesma cor, necessidade de exigir marca, lote sem nota/compra formal e preço estimado sem bobina.
- **Estoque:** permitir saldo negativo? inventário e reserva; custos acessórios na aquisição e política fiscal.
- **Oficinas/equipes:** propriedade, membro, migração de dados local→conta e autorização de aparelhos múltiplos.
- **Assinaturas:** limites de contas e rascunhos, visibilidade de S antiga, prazos de retenção, exportação, reativação.
- **Privacidade:** campos que entram em catálogo compartilhado, exclusão de mídia/arquivos e política de LGPD.

A homologação das **13 regras** permanece válida; **nenhuma proposta nova deste contrato está automaticamente homologada**. O desenho não autoriza SQL, Supabase, alteração de código, merge ou deploy.
