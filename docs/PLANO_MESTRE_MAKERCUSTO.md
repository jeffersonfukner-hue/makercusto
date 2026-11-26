# MakerCusto — PLANO MESTRE DO PRODUTO

> Documento de planejamento aprovado parcialmente em 20/11/2026. **Regras homologadas** estão explicitamente marcadas; fluxos e tabelas sugeridos são **propostas técnicas**, não autorização para provisionar banco ou publicar. Fonte do histórico: `docs/CONTINUIDADE.md`; tarefas: `docs/BACKLOG.md`; dados: `docs/MODELO_DE_DADOS.md`; registro: `docs/REGISTRO_DE_ATIVIDADES.md`.

## 1. Propósito e limites

MakerCusto é uma calculadora e futuro sistema de precificação/produção de impressão 3D com modo Simples para cálculo manual e Avançado para controle por material, equipamento, lote e produto. A lógica monetária é comum aos dois modos; o modo da calculadora e o tipo de modal Normal/Avançado não equivalem à assinatura. O gratuito calcula sem histórico de nuvem garantido; Compartilhado e Full são planos pagos de cadastros persistentes, a implementar futuramente.

### Estado de implementação em 20/11/2026

- React/TypeScript/Vite, motor puro em `src/domain/cost.ts`, CI GitHub; PR #1 em draft.
- Cálculo de filamento total em g/kg e R$/g ou R$/kg e alternância para detalhamento por cor, sem somar entradas dos dois modos.
- Seletor de impressora e edição de parâmetros *somente em memória da sessão*. Ainda não há telas de cadastro completas, modal reutilizável, autenticação, estoque, assinaturas, Supabase ou histórico remoto.
- Não antecipar autorização de merge ou deploy; lote de mudanças deve passar por CI e homologação visual antes de deploy **manual pelo proprietário**.

## 2. Cinco regras estruturais — HOMOLOGADAS em 20/11/2026

1. **Catálogo global imutável para usuários.** Somente a administração mantém/curadoria as referências oficiais; usuário **não edita o original**, só cria uma **cópia com ID próprio e nome editável**, ligada à origem. Alterações administrativas devem preservar referências/versões históricas, sem sobrescrita destrutiva.
2. **Plano Compartilhado.** Cadastros publicados no espaço compartilhado são consultáveis por assinantes **Compartilhado e Full**. Apenas o autor (ou autoridade administrativa explicitamente designada) edita seus registros; qualquer usuário que desejar alterar o de terceiro deve copiar.
3. **Plano Full.** Cadastros privados por padrão. Compartilhamento é voluntário mediante publicação **de cópia separada**; o registro privado original continua privado. O usuário Full também pode consultar cadastros compartilhados.
4. **Estoque.** Abrange matérias-primas, acessórios/itens comprados e produtos acabados; movimentações de entrada, saída, perda, ajuste e inventário, com trilha auditável.
5. **Composição de produtos e kits.** Um produto/kit pode ter diversas peças impressas, materiais, componentes comprados, ferramentas utilizadas e etapas de montagem.

**Esclarecimento da regra global homologada pelo proprietário:** dados globais *não são alteráveis diretamente pelo usuário*, inclusive assinantes Full. Ao personalizar, criar cópia renomeável com identidade independente e vínculo com original. A manutenção administrativa de referências globais não altera cópias ou históricos. Não interpretar cadastros globais como compartilhados: são conjuntos de visibilidade e governança distintos.

## 3. Modos e planos — dimensões distintas

| Dimensão | Opções | Efeito |
| --- | --- | --- |
| Cálculo | Simples / Avançado | Densidade dos campos, detalhamento e fluxo; ambos usam o mesmo motor financeiro |
| Modal | Normal / Avançado | Profundidade do cadastro; rascunho só é persistido em ação Salvar |
| Plano | Gratuito / Compartilhado / Full | Persistência remota e visibilidade; o plano não altera fórmula de custo |

**Proposta para o gratuito:** sem conta obrigatória; catálogos globais legíveis e parâmetros locais armazenáveis no dispositivo. Não prometer salvamento remoto ou sincronização. Dados locais podem desaparecer ao limpar armazenamento.

## 4. Fluxo de cálculo e produto

1. Novo produto/cálculo seleciona **primeiro a impressora**; sugere a última usada no dispositivo/conta (passível de troca). Se não encontrada, botão `+` no rótulo abre modal Normal/Avançado de cadastro ou cópia de modelo global.
2. Na tela Simples, informar consumo total de filamento + preço, tempo, quantidades e custos essenciais. Os demais campos têm padrões **explicitamente estimados** e edição opcional. Não exigir cadastro detalhado para calcular.
3. Na Avançada, alternar para filamentos por cor, selecionar tipo/cor/marca, quantidade adquirida, preço do rolo, perdas/purga adicionais; adicionar insumos, peças, ferramentas e composição de kit. Botões `+` pequenos ao lado de **Tipo, Cor, Marca, Impressora** abrem modais.
4. Reutilizar referências sem mutação do catálogo global: selecionar global, copiar para personalizar ou criar cadastro particular/compartilhado conforme permissão.
5. Calcular energia, depreciação, acessórios, montagem, custo por lote, custo unitário, receita, lucro bruto estimado, margem e markup; custos de impressora/filamentos não são somados em duplicidade.
6. No futuro, ao salvar uma fabricação, congelar **snapshot de custo e origem dos preços**. Compras novas ou reajustes posteriores não modificam o cálculo histórico.

## 5. Módulos e tipos de cadastro

- **Impressoras:** modelos oficiais globais, impressoras particulares como instâncias próprias, custo real de aquisição, horas/vida útil, manutenção e consumo em W editável. Não inventar preços oficiais nem medições energéticas.
- **Filamentos:** tipo, marca e cor como catálogos separados, rolos e compras com diferentes pesos e preços, lote/fornecedor, saldo, purga e custo histórico; preço do rolo difere de preço/kg.
- **Ferramentas/equipamentos reutilizáveis:** custo amortizável ou uso operacional; não lançar consumo de uma ferramenta inteira por produto.
- **Insumos comprados:** itens extras como argolas, ímãs, cola, embalagem, componentes não produzidos; preço, unidade, aquisição e consumo.
- **Produtos/componentes/kit:** SKU/identificação, composição com múltiplos componentes produzidos e comprados, montagem, variações e quantidades.
- **Produção:** execução/lote/mesa, impressora, tempo planejado e realizado, falhas/retrabalho, perdas, materiais consumidos e saída de produto acabado.
- **Estoque:** saldos reconstruíveis por movimentações, inventário e ajustes justificados; quantidade por local/lote, se necessário.
- **Comercial:** preço, canal de venda, taxas, impostos, frete, custo e lucro estimados; não estimar tributos como fatos.
- **Cadastros e administração:** listas dedicadas para impressoras, tipos, cores, marcas, filamentos, fornecedores, ferramentas, insumos, produtos e estoque; filtros, edição permitida, cópia e inativação.
- **Relatórios:** custos/snapshots por produção, preços históricos, consumo, margem, perdas, estoque e desempenho.

## 6. Regras de consistência e governança

- ID da origem e ID da cópia devem ser diferentes; cópia `source_id` opcional, `owner_id` obrigatório para cópia persistida; proibir atualizar entidade global através de formulário de cópia.
- Publicar no catálogo compartilhado exige escolha explícita (planos habilitados); por padrão as criações Full são privadas. Compartilhar sempre como **nova cópia**, jamais tornar público o objeto privado original.
- Não fazer alteração automática em registros de outro autor; o leitor deve copiar para personalizar.
- Cópias pessoais e publicações compartilhadas não recebem atualizações destrutivas do item de referência global; sugerir versão nova separadamente.
- Preços de aquisição e snapshots de custo são dados históricos; alterações em cadastro exibem valores atuais em cálculos novos, sem recalcular custeio antigo.
- Deduplicação de tipo/cor/marca por nome normalizado e chaves estáveis, com cuidado com variações legítimas. Contribuição global exige curadoria, e não criação pública automática.
- O estoque registra movimentos reversíveis por estorno/rastreabilidade, sem editar silenciosamente movimentações contabilizadas.
- Segurança obrigatória no serviço (RLS/políticas de dono/plano), não depender somente do botão oculto no frontend.

## 7. Mapa de telas proposto (não implementado)

| Tela | Simples | Avançado |
| --- | --- | --- |
| Calculadora | Uma página, quantidade/preço de filamento, impressora, tempo e preço final | composição detalhada e múltiplos itens |
| Impressoras | seletor + `+` modal Normal | listagem dedicada, detalhes da cópia, preço, potência, manutenção |
| Filamentos | total ou cor com catálogo | rolos, compras, marca/tipo/cor, histórico |
| Insumos/Ferramentas | custo adicional rápido | estoque, lotes e rateio |
| Produtos/Kits | custo por item | composição de componentes e versões |
| Estoque | consulta opcional | movimentações, inventário e ajustes |
| Conta/Planos | acesso e opção de assinatura | gestão de dados privados e compartilhamentos |

## 8. Caminho de implementação sem refazer módulos

- **Fase A — contratos e componentes:** tipos de entidade, adaptadores de armazenamento local e futuro remoto, modal genérico Normal/Avançado, campo com seletor e botão `+`, testes de imutabilidade/cópia. Nenhum banco real.
- **Fase B — catálogos e seleção:** impressoras primeiro e última usada persistida localmente; tipo/cor/marca e modelos globais; criação de cópias personalizadas; listagens dedicadas reutilizando mesmos componentes.
- **Fase C — composição e motor:** separar ferramenta/insumo/produto; integração com custos de peças/kit; histórico de preço e snapshot; testes de regressão.
- **Fase D — persistência aprovada:** autenticação, projeto Supabase, migrações, RLS, testes por plano, importação local com consentimento, observabilidade e backup. **Não executar sem autorização futura.**
- **Fase E — estoque e assinaturas:** movimentações auditáveis, reservas/consumo/estorno, cobrança de planos e direitos de acesso, testes de regressão.
- **Fase F — homologação e publicação:** um lote coerente em branch e CI, revisão visual e de segurança, deploy manual autorizado; nunca um deploy por commit como requisito.

## 9. Pendências de decisão — NÃO homologadas

- Política de curadoria administrativa de novos termos globais e versões das referências oficiais.
- Limites de armazenamento/consulta por plano; quem poderá publicar no compartilhado após cancelamento/inadimplência; retenção de dados e portabilidade.
- Se o Compartilhado pode criar itens privados individuais (a regra homologada define que itens **publicados** são compartilhados; não determina obrigação de publicar toda criação).
- Múltiplas oficinas/empresas por conta; localização e posse de estoque; trabalho colaborativo entre pessoas.
- Regra de custo de rolo (lote específico, último preço, média ponderada), valorização de estoque e estorno.
- Modelo de rateio de fabricação com produtos misturados, peças por kit, paradas e energia real estimada.
- Informações e atualizações de impressoras populares: proveniência, versionamento e fontes verificáveis.
- Estratégia de pagamento e impostos, armazenamento de arquivos 3D, backup/exportação, LGPD e retenção.

A homologação das cinco regras **não implica aprovação dessas opções técnicas pendentes**.

## 10. Critérios de aceite da arquitetura

1. Não existe atualização/deleção de original global por usuário comum; só `Copiar` e renomear cópia.
2. Autoria/visibilidade são testadas na API para visitante, gratuito, Compartilhado e Full, inclusive tentativa maliciosa de alterar dono.
3. Full mantém privado original e publica apenas uma cópia voluntária.
4. Autor controla próprio compartilhado; demais podem consultar e copiar, não editar.
5. Estoque não perde trilha de movimentação, e snapshot antigo não muda após nova compra.
6. Mudança entre modos de cálculo não duplica material, energia ou depreciação.
7. Usuário local pode calcular sem conta; seleção de última impressora sobrevive a recarga local quando implementada.
8. CI (tipagem/unitários/desktop/mobile) verde antes de solicitar homologação; sem deploy automático.


## 24/11/2026 — Consolidação de requisitos homologados
- Modelo 4 para ambiente autenticado: menu lateral, cabeçalho, abas por módulo, painel da oficina, ficha de produto e responsividade. Ambiente autenticado deve ter organização de sistema distinta da página pública.
- Ações contextuais do formulário ativo sempre acessíveis em barra fixa abaixo do cabeçalho ou no rodapé; nome do produto em destaque. Salvar produto diretamente da calculadora, reutilizando cadastros existentes; permitir salvar peça e produto a partir do cálculo.
- Peças individuais mantêm identidade mesmo quando impressas na mesma placa. Conjuntos selecionam peças cadastradas; ficha da peça conserva parâmetros necessários à calculadora. Seleção de peça/conjunto deve preencher dados reutilizáveis sem redigitação, preservando histórico e evitando duplicidade.
- Integração orgânica entre módulos: equipamentos, filamentos, perfis de configuração, peças, conjuntos, produtos, impressões, estoque e custos. Dicas contextuais curtas e até três sugestões similares em campos aplicáveis. P07 conecta tarifas da oficina, energia por fase e fontes de custo, sem confundir prévia com contabilização.
- Autorizado editar e commitar código e documentação na branch existente, sem nova homologação das decisões acima. Prioridade: SystemNavigation, WorkshopDashboard, ProductSavePanel e App; preservar cadastros. Sem merge, deploy, novas migrações operacionais ou gastos.
- CONTINUIDADE-01: ao encerrar com pendências, indicar ação do agente e ação necessária do usuário; quando depender apenas de retomada, escrever Sua ação: digite Continue. Nunca indicar nenhuma nesse estado. Regra registrada no AGENTS.md, commit 13e48ea479af53ecac766e76253da933d556c8aa.
- Evidência das 20 migrações: o proprietário informa execução anterior; a documentação versionada anterior registra plano de 20 scripts e CI #500 aprovado no SHA d51bb995a262cc3f32b3ccf94e8280445523409e em PostgreSQL efêmero. Aplicação operacional individual ainda não comprovada nesta sessão; recuperar recibos e catálogo antes de declarar confirmação. Não reaplicar scripts por presunção.
