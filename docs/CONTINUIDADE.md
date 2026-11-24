# MakerCusto — continuidade

## Situação — 20/11/2026
- Repositório: `jeffersonfukner-hue/makercusto`, privado, `main` reservada.
- Trabalho atual: `feat/fundacao-makercusto`, PR #1 (draft), **sem merge**.
- CI da fundação inicial: execução #44795814820, sucesso (tipos, 5 testes unitários, build, 4 E2E).
- Preview anterior: Cloudflare confirmou deploy do commit `d444af6` no endereço imutável `https://e8b60eff.makercusto-preview.pages.dev`. Isso NÃO valida aparência nem significa que commits posteriores foram publicados.
- Proprietário declarou que desativou deploys automáticos em Pages; configuração ainda não conferida diretamente por conector Cloudflare.
- **Novo acordo de publicação:** proprietário realiza deploys manualmente, somente após confirmação explícita de CI e indicação de commit pelo agente. Agente não chama deploy nem altera a configuração Cloudflare.
- Método: inspirado no OldArcade (AGENTS, documentação, PR/CI e homologação por fase).
- Cenário piloto com 20 chaveiros, 151,58 g de modelo, três cores (azul 83,26 g, branco 47,76 g, dourado 20,56 g), 11h14, material R$100/kg, hipótese 150W/R$1,03/kWh, máquina R$3500/3000h, argola R$0,35, montagem 2min/R$20h.
- Extensão em andamento: entradas de material por cor com preço específico e purga/perdas adicionais opcionais por cor, com somatório auditável. Não pressupor que o relatório do slicer exclui desperdício.
- Quantidade de peças douradas por chaveiro, composição/kit e importação do slicer permanecem não validadas.
- Sem conta, armazenamento persistente, backend ou coleta de informações dos cálculos.
- Testes desta extensão: consultar CI da revisão final do PR. Homologação visual desktop e mobile segue pendente.
- Próxima ação: checar último CI; se aprovado, informar SHA e solicitar ao proprietário o deploy manual do novo commit para homologação.

## Decisões do proprietário — 20/11/2026 (nova fila)
- Novo pedido: planejar conexão futura ao Supabase para salvar o custo de cada impressão; não implementar banco nesta entrega.
- Materiais: dois modos. Simples com tipo, peso em kg/g e preço; completo/Pro futuro com fabricante, data/valor da compra, lote opcional e etiqueta para bobina.
- Compras sucessivas do mesmo PLA azul (R$68 e R$73) precisam coexistir no histórico, sem sobrescrever o custo registrado de impressões anteriores. A política de precificação por lote será definida antes de implementar.
- Cadastro genérico de insumos do processo além de filamento.
- Foco imediato aprovado: simplicidade e edição multicor em acordeão: uma linha-resumo por material e apenas um formulário aberto por vez; trocar de cor preserva entradas.
- Respostas técnicas ao proprietário: somente Resultado, Pendências e Próxima ação; objetivas em pt-BR. Deploy manual exclusivo do proprietário; não fazer merge.
- CI e homologação da alteração no acordeão precisam ser consultados para o HEAD atual antes de indicar deploy.

## Ajuste UX solicitado — inclusão de cor no topo (20/11/2026)
- Ao clicar Adicionar cor, a nova entrada deve aparecer imediatamente no **topo** da lista e seu formulário deve abrir; demais materiais permanecem resumidos.
- Evitar a sensação de que o botão falhou e múltiplas adições por falta de visibilidade. Preservar as entradas anteriores e testar dois cliques consecutivos.
- Entrega depende do CI do HEAD e homologação visual; deploy continua exclusivamente manual pelo proprietário.

## Método de recebimento de ideias — 20/11/2026
- Proprietário enviará ideias em sequência durante a fase inicial. Organizar sem inflar a entrega ativa, evitando reabrir decisões e homologações.
- Regra: ideia simples e isolada → implementar com testes no PR atual quando coerente; dependente de banco, contas ou cadastros extensos → documentar para etapa própria.
- Sugestões conhecidas em campos catalogáveis, entrada personalizada e prevenção de duplicações. Primeiro piloto: cores com catálogo local. PLA/PETG, marcas e impressoras ficam no backlog.
- Alterações locais de sugestões NÃO constituem salvamento do custo de impressão; Supabase continua sem integração.
- CI da alteração e homologação visual ainda precisam ser verificados; deploy manual exclusivo do proprietário.

## Regra de cadastro pendente (20/11/2026)
- "Adicionar cor" só cria nova linha quando os cadastros adicionados anteriormente têm nome real, peso do modelo maior que zero e preço/kg positivo; purga deve ser não negativa.
- Havendo cadastro incompleto, abre esse cadastro existente, sem multiplicar formulários.
- Nova cor nasce com nome vazio; rótulo visual temporário "Material 1", sem cadastrar "Nova cor" como cor real.
- Teste E2E deve demonstrar cliques repetidos sem novas linhas, depois preenchimento e adição legítima.

## Redesenho aprovado como direção — 20/11/2026
- Substituir cards enormes por resumo padrão com três números: peso total consumido (modelo + perdas declaradas), preço médio ponderado de aquisição por kg, custo total de filamento.
- Botão discreto Detalhar por cor expõe formulário horizontal de aquisição/uso acima da tabela de linhas, em espaço único; tabela totaliza pesos e custos.
- Embalagens de diferentes pesos, com unidade g ou kg e preço TOTAL da embalagem, calculadas proporcionalmente. Marca opcional, tipo e cor sugeridos; valores livres sem duplicar sugestões.
- Somente ações Salvar/Adicionar à tabela criam ou alteram linhas; não criar registros vazios. Sem persistência de impressões e sem Supabase.
- PR #1 permanece draft. CI atualizado e homologação visual pendentes. O proprietário é o único responsável por deploy manual; nenhum merge autorizado.

## Testes do primeiro redesenho e correções — 20/11/2026
- CI #44817487995: tipagem, unitários e build verdes; E2E falhou (6 de 14 casos) por seletores que presumiam textbox em inputs com datalist e interação mobile de controles em área estreita.
- Corrigido E2E para localizar inputs por label; movidas ações Editar/Remover para a primeira coluna junto à cor e ampliada área de toque do botão Detalhar/Ocultar em mobile.
- Aguardando CI da revisão para liberar deploy manual; não fazer deploy antes de CI verde.

## Correção solicitada — modo total editável versus detalhamento por cor (20/11/2026)
- Padrão deve ser **Total de filamento** com dois campos realmente editáveis: consumo em g/kg e preço em R$/kg ou R$/g. O custo é recalculado imediatamente; resumo não substitui os campos.
- Alternativa **Detalhar por cor** abre o formulário e tabela compacta já planejados; ao voltar a "Usar total de filamento", restaurar os valores simples sem somar ambos.
- Cada modo conserva seus dados em memória enquanto a página está aberta; o motor de custo considera apenas o modo ativo.
- Não criar banco, não fazer deploy/merge. Verificação do CI e homologação visual precedem deploy manual.

## Nova decisão de produto — impressora primeiro; modos separados (20/11/2026)
- Apresentar **Impressora antes de Filamentos**. Usuário seleciona equipamento previamente configurado e pode editar valor de aquisição, potência média, vida útil e tarifa elétrica; os cálculos da impressão usam o selecionado.
- **Modo de cálculo** (Simples/Avançado) é dimensão diferente de **plano de dados** (gratuito, Compartilhado, Full). Não bloquear modo avançado apenas por não pagar sem nova decisão.
- **Gratuito:** cálculo rápido com dados manuais, sem conta nem histórico remoto garantido.
- **Compartilhado (pago, futuro):** cadastrar/salvar impressoras, filamentos e itens num catálogo de acesso comum; dados compartilhados podem ser consultados também por assinantes Full. Proprietário original e regras de alteração/exclusão/curadoria ainda serão especificados.
- **Full (pago, futuro):** itens particulares do usuário, inacessíveis aos demais, além de acesso opcional ao catálogo compartilhado. Nunca tornar item privado público por padrão.
- Definir Supabase/Auth/RLS, limites de acesso, consentimento para compartilhamento, custos, modelo de assinatura e histórico imutável antes da implementação real.
- Prioridade atual: seletor de impressoras **somente em memória na sessão** + edição de seus parâmetros e cálculo automático; sem banco nem cobrança. Não alegar persistência da impressora entre sessões.

## Decisões recebidas — lote de requisitos antes do próximo deploy (20/11/2026)
- Proprietário pediu para **não fazer deploy de cada commit**: acumular alterações coerentes em branch, executar testes e só então solicitar homologação/publicação manual.
- **Tipos, cores e marcas:** botão "+" pequeno adjacente ao próprio nome do campo, abrindo modal de cadastro; catálogos conhecidos disponíveis globalmente em todos os planos; permitir termos novos sem duplicatas. Definir governança de contribuições globais.
- **Impressora:** primeira seleção de um produto; ao iniciar outro, usar última selecionada. Botão "+" junto ao rótulo abre modal; modelos comuns pré-cadastrados. Edição particular não altera cadastro global. Visitantes persistem alterações e preferência em localStorage; autenticados persistem em seus dados quando banco for implementado.
- **Modais Normal/Avançado:** normal enxuto e avançado rico em detalhes, aplicáveis aos cadastros, independentes de plano gratuito/Compartilhado/Full e do modo de cálculo.
- Separar **ferramentas reutilizáveis**, **insumos extras comprados** e **produtos/componentes fabricados**; planejar estoque e movimentações; criar telas de listagem dedicadas.
- **Arquitetura de banco desde já:** contratos de dados, autoria, visibilidade, versões de preços e autorização. Não provisionar Supabase nem implementar cobrança sem nova autorização.
- Trabalho desta rodada: apenas planejamento e documentação, sem afirmar que funcionalidades já estão prontas.
- Restrições preservadas: sem merge, deploy, produção ou gasto de créditos; PR #1 continua draft.

## Homologação estrutural e plano-mestre — 20/11/2026
- **Cinco regras HOMOLOGADAS pelo proprietário:** (1) catálogos globais protegidos: usuário não altera original, personalização cria cópia independente renomeável; manutenção administrativa preserva versões, (2) plano Compartilhado publica registros legíveis para assinantes Compartilhado e Full, com edição pelo autor, (3) Full é privado por padrão e só publica voluntariamente **uma cópia**, (4) estoque cobre matérias-primas, itens comprados e produtos acabados com movimentações auditáveis, (5) produto/kit inclui múltiplas peças fabricadas, itens comprados, ferramentas e montagem.
- A homologação não resolve política de privacidade de rascunhos do Compartilhado, cancelamentos, curadoria, custos por lote, múltiplas oficinas e autorizações administrativas detalhadas; manter como pendências explícitas.
- Documento-mestre `docs/PLANO_MESTRE_MAKERCUSTO.md` e proposta técnica `docs/MODELO_DE_DADOS.md` consolidam requisitos, entidades, permissões e fases. **Propostas de modelagem não são homologação de banco físico**.
- Nesta etapa: somente documentação na branch de trabalho e PR draft; sem alterar aplicação, criar Supabase, credenciais, migrações, merge ou deploy.

## Revisão documental de permissões e fluxos — 20/11/2026
- Base auditada: commit `896877b88eaed6d347ba757405394aeb64914c35` (`PLANO_MESTRE_MAKERCUSTO.md` e `MODELO_DE_DADOS.md`).
- Relatório: `docs/REVISAO_PERMISSOES_E_CADASTROS.md`, com 12 riscos documentais, matriz por ator e classe de dados, seis fluxos e oito decisões adicionais propostas.
- **Cinco homologações preservadas**: global só com cópia renomeável, Compartilhado por autoria, Full privado e publicação de cópia, estoque auditável, kits multicomponentes.
- Atenção: separação entre ficha pública/compartilhada e dados operacionais privados, transição de planos, privacidade de rascunhos, snapshot de custo e ausência de FK em referências genéricas.
- Propostas não equivalem a homologação adicional. Nesta rodada somente documentação na branch; sem aplicação/banco/merge/deploy.

## Oito diretrizes de permissões HOMOLOGADAS — 20/11/2026
- Base expressamente aprovada: oito propostas de `docs/REVISAO_PERMISSOES_E_CADASTROS.md` no commit `3878be1807fac55d02b667816edbb76d7bf93fe4`.
- Fonte oficial da homologação com limites claros: `docs/HOMOLOGACAO_PERMISSOES_2026-11-20.md`. As cinco regras estruturais anteriores permanecem inalteradas.
- Diretrizes aprovadas: rascunhos Compartilhado privados até publicação confirmada; downgrade preserva titularidade/privacidade e restringe novas ações pagas; somente fichas descritivas publicáveis (sem compra/estoque/preço pessoal); cópias independentes com ID/origem/versão; gratuito sem leitura do Compartilhado inicialmente; `workspace_id` previsto; preço do lote real priorizado e snapshot imutável; catálogos oficiais somente administrados com versão e sugestões moderadas.
- **Abertos, não homologados por consequência:** retenção e limites de rascunhos; leitura/exportação/prazos após downgrade; lista por entidade de campos publicáveis; alertas de versões; vitrine futura; equipes/convites e políticas multi-oficina; custeios alternativos/fiscais; critérios de moderação.
- Novo refinamento lógico acrescentado a `docs/MODELO_DE_DADOS.md`: classes de domínio, IDs/cópias, proposta de oficina e estoque com FKs, snapshots e casos de teste RLS **não executados**.
- Exclusivamente documentação no GitHub, sem SQL/migração, código, deploy, merge nem produção.

## Contratos detalhados de catálogos e materiais — 20/11/2026
- Fonte: `docs/CONTRATOS_CADASTROS_E_FILAMENTOS.md`. Revisadas regras dos documentos atuais; as **13 homologações continuam inalteradas**.
- Novo contrato **proposto, não homologado** para entidades de tipo/cor/marca/modelo e especificação de filamento; fichas G/S/P e cópias independentes, instância física de impressora, tarifa de energia por oficina, compras e bobinas/lotes privados, snapshots e operações/validações.
- Riscos explicitados: `scope` não se aplica a compras/estoque; `workspace_id` deve restringir FKs; modelos globais não contêm preço pessoal; publicação depende de lista branca de campos; nenhuma interface ou política RLS foi implementada.
- Pendências: aprovar escolha de tabelas específicas vs catálogo unificado, fluxo de cópia/instância, regras de rascunho no Compartilhado, tarifa por período, preço sem lote e inventário.
- Nesta rodada, **somente documentos** na branch `feat/fundacao-makercusto`; sem alteração de aplicação, banco, merge ou deploy.

## Homologação de quatro decisões técnicas e modelagem de estoque — 20/11/2026
- Proprietário homologou expressamente quatro propostas do contrato `4bab9d0c`: tabelas específicas, impressora física diferente de modelo global, tarifa vinculada à oficina e separação de definição/compra/bobina. Registro oficial em `docs/HOMOLOGACAO_CADASTROS_2026-11-20.md`. **17 decisões/diretrizes homologadas no total (5+8+4)**.
- `docs/CONTRATO_ESTOQUE_PRODUTOS.md` apresenta **proposta não homologada** de inventário, compras, lotes, movimentos, ferramentas, serviços, produtos e revisões de kits, produção e snapshots. Preserva histórico, autoria da oficina, lote real e estoque auditável.
- Pendências críticas: esquema físico e FKs, saldo negativo, consumo sem lote, reserva, gatilho da baixa, rateio de mesa mista, regras de composição e precisão financeira. Sem código, SQL, banco, merge, deploy ou produção.

## Seis regras de estoque e produtos HOMOLOGADAS — 20/11/2026
- Proprietário aprovou expressamente seis propostas de `docs/CONTRATO_ESTOQUE_PRODUTOS.md` do commit `7d7507cc2cc79e623908e40b79e0bee8165726d1`.
- Registro normativo: `docs/HOMOLOGACAO_ESTOQUE_2026-11-20.md`: identidade estocável por oficina, bloqueio de saldo negativo por padrão, baixa somente na confirmação de produção, kits com composição versionada, rateio explícito em mesas mistas e estornos auditáveis. Total acumulado: **23 homologações (5+8+4+6)**.
- A `docs/REFINAMENTO_ESTOQUE_PRODUCAO.md` detalha PROPOSTAS de entidades, transações, conciliação, auditoria, RLS e testes não executados. Não impor fórmulas de rateio, exceções negativas, reservas, política de falhas ou SQL por inferência.
- Seguimos somente com documentação na branch; sem código, SQL, banco, merge ou deploy.

## Modelagem detalhada de produção real, reservas e rateio — 20/11/2026
- Base revisada: commit `ca53d01c2a987af06bdf26e76e39fe871d6fa83d`; relatório em `docs/MODELAGEM_PRODUCAO_REAL_E_RATEIO.md`.
- **23 homologações anteriores preservadas**. Novas hipóteses NÃO homologadas: reservas como compromisso separado do movimento físico, cálculo de disponível, confirmação incremental, tratamento de falha com consumo sem saída boa, retrabalho vinculado, pools de custo e bases de rateio.
- Propostas descrevem fluxos, entidades, invariantes de idempotência, conciliação de custos, estoque por oficina e casos de testes futuros. Fórmula específica de rateio **não foi homologada**; não definir automaticamente perda/falha como custo por peça boa.
- Antes de SQL: decidir política de reserva, baixa parcial, falhas, retrabalho, rateio, pausas e precisão monetária. Sem código, banco, migrações, merge ou deploy.

## Revisão das cinco decisões pendentes de produção — 20/11/2026
- Fonte revisada: commit `e479d08e02228dab4b2ae9cf16cf6450b263e438`; documento de proposta: `docs/PROPOSTAS_HOMOLOGACAO_PRODUCAO_2026-11-20.md`.
- **23 decisões homologadas preservadas, nenhuma nova aprovada nesta rodada.** Cinco recomendações para homologar: reservas opcionais e lógicas, confirmação parcial idempotente, registro de falha com consumo real mesmo sem saída boa, retrabalho como operação vinculada separada e rateio por categoria com medição direta prioritária/critério declarado e conciliação integral.
- Exemplos documentais de 1 kg com reserva 300 g, confirmação de 50 + 20 g, falha com 80 g consumidos, retrabalho de 15 min e mesa com corpos/suportes. Nenhum exemplo é valor observado ou fórmula automática aprovada.
- Permanecem pendentes expiração/sobra de reservas, UX das parciais, precificação de falhas/retrabalhos, rateios específicos por material/energia, pausas, arredondamento e esquema físico.
- Somente documentação em branch; sem código, banco, SQL, merge nem deploy.

## Cinco decisões RES/PAR/FAL/RET/RAT HOMOLOGADAS — 20/11/2026
- Aprovadas expressamente a partir do commit `6e6e3e3b`; registradas em `docs/HOMOLOGACAO_PRODUCAO_2026-11-20.md`. **28 decisões acumuladas** (5+8+4+6+5).
- Reserva opcional e não física; confirmações incrementais idempotentes; falha confirmada com consumo e zero peças boas; retrabalho separado com custos próprios; rateio por categoria com medição direta preferencial, base explícita e conciliação integral.
- **Pendências não homologadas:** expiração e sobras de reservas, detalhes de confirmação parcial, precificação de perda/retrabalho, fórmula de rateio por categoria, pausas e arredondamento, esquema SQL físico e permissões.
- Próxima conversa deve continuar pela revisão destas pendências e arquitetura documental, sem código, banco, merge ou deploy.

## P01 — reservas e sobras HOMOLOGADA — 20/11/2026
- Proprietário aprovou expressamente P01-A a P01-F como **uma política consolidada**. Registro normativo: `docs/HOMOLOGACAO_RESERVAS_P01_2026-11-20.md`, primeira formalização no commit `af0edb9d`.
- **29 homologações acumuladas:** 28 anteriores (5+8+4+6+5) + P01 (1). Nenhuma regra anterior foi revogada.
- P01-A: liberar sobra reservada ao encerramento/cancelamento definitivo, não durante parcial aberta; P01-B: prazo opcional com revisão, sem expiração liberadora automática; P01-C: excedente só com saldo/origem e conciliação explícita de inconsistências; P01-D: troca de bobina com consumos/custos por lote; P01-E: cancelamento parcial libera só excedente; P01-F: validação concorrente e transacional no servidor.
- **NÃO homologadas:** P02–P06; pausas/energia P07; consumo sem lote P08; estornos parciais P09; reservas de kits, locais, bobinas parciais e ordens abandonadas; permissões detalhadas; esquema físico/SQL.
- Próxima etapa: apresentar P02 para revisão individual. Apenas documentação na branch e PR draft; sem código, banco, SQL, merge ou deploy.


## P02 — confirmações parciais HOMOLOGADA — 20/11/2026
- Proprietário aprovou expressamente P02-A a P02-F como **uma política consolidada**, preservando as 29 homologações prévias, inclusive P01. Registro: `docs/HOMOLOGACAO_CONFIRMACOES_P02_2026-11-20.md` (commit `e77bd4b9`).
- **30 homologações acumuladas:** 5 estruturais + 8 permissões + 4 técnicas + 6 estoque + 5 produção + P01 + P02. Sub-regras não aumentam essa contagem individualmente.
- **P02-A:** confirmação parcial opcional; fluxo simples e avançado usam mecanismo único. **P02-B:** consumos e saídas exclusivamente novos por evento, com planejado/acumulado/pendente e proveniência. **P02-C:** IDs, idempotência, autoria, horário e transação atômica; reenvio divergente rejeitado. **P02-D:** conferência antes do encerramento definitivo e liberação de reserva só no encerramento conforme P01. **P02-E:** correções auditáveis por novo evento ou estorno, sem mutação do histórico. **P02-F:** excedente real exige origem/saldo e confirmação explícita, com conciliação de inconsistências sem apagar o ocorrido.
- **PENDENTES (não homologadas):** P03 falhas e perdas; P04 retrabalho e valor financeiro; P05 critérios específicos de rateio; P06 precisão monetária; P07 pausas/energia; P08 consumo sem lote; P09 estornos parciais; detalhes de medição incremental, permissões/RLS, esquema físico/SQL e outras exceções de P01.
- Próximo passo: revisão individual de P03, sem impor nova homologação. Somente documentação, nenhum código, SQL, banco, merge ou deploy.


## P03 — falhas e perdas HOMOLOGADA — 20/11/2026
- Proprietário aprovou expressamente P03-A a P03-F como **uma política consolidada**; documento normativo `docs/HOMOLOGACAO_FALHAS_P03_2026-11-20.md`, commit `f7b530a9`.
- **31 homologações acumuladas:** 28 anteriores + P01 + P02 + P03 (uma por política). Nenhuma das 30 anteriores foi revogada; sub-regras não são contadas individualmente.
- P03-A: classificação de falhas totais/parciais com causa desconhecida permitida; P03-B: consumo/peças/refugos e destino físico com identificação de lote e fonte medido/estimado, sem purga dupla; P03-C: custo da falha separado e conciliado, estimativas identificadas; P03-D: descarte, recuperação e retrabalho diferenciados, sem entrada duplicada; P03-E: indicadores físicos/financeiros separados e provisão comercial futura explícita, sem repasse automático ou mudança retroativa; P03-F: ocorrência distinta de confirmação, trilha auditável e conciliação de saldo sem negativo automático.
- **PENDÊNCIAS NÃO HOMOLOGADAS:** P04 valorização de retrabalho, P05 fórmulas específicas de rateio, P06 precisão decimal; P07 pausas e energia, P08 consumo sem lote, P09 estornos parciais; valor de material recuperado, tratamento fiscal, regras de equipes/RLS e SQL físico.
- Próximo passo: revisar P04 individualmente. Nesta etapa exclusivamente documentação na branch e PR draft; nenhum código, banco, SQL, merge ou deploy.


## P04 — retrabalho HOMOLOGADA — 20/11/2026
- Proprietário aprovou expressamente **P04-A a P04-F como uma política consolidada**, preservando todas as 31 homologações anteriores, inclusive P01/P02/P03. Documento normativo: `docs/HOMOLOGACAO_RETRABALHO_P04_2026-11-20.md`; commit `2e25553e`.
- **32 homologações acumuladas**: 28 iniciais + P01 + P02 + P03 + P04; seis sub-regras de P04 integram **uma** política, não seis.
- P04-A: retrabalho vinculado à execução/produtos ou lote identificável; P04-B: custos incrementais próprios, sem recobrar custos originais; P04-C: custo gerencial acumulado para peça recuperada, preservando snapshot original e vendas anteriores; P04-D: reimpressão como nova execução vinculada, custo da primeira descartada fica como perda separada; P04-E: recuperação frustrada registra custo acumulado de perda sem lançar novamente a despesa original e sem valor presumido de recicláveis; P04-F: confirmação explícita, estoque sem unidades duplicadas, idempotência e trilha de eventos.
- **Pendentes e não homologadas:** P05 (fórmulas por categoria, inclusive retrabalho múltiplo), P06 (precisão monetária), P07 (pausas/energia), P08 (consumo sem lote), P09 (estorno parcial), tratamento contábil/fiscal de estoque, garantia/pós-venda, valorização de recuperáveis, permissões detalhadas/RLS e esquema físico SQL.
- Próxima ação: revisar P05 individualmente antes do SQL. Apenas documentação na branch `feat/fundacao-makercusto`, PR #1 draft; sem código, banco, SQL, merge ou deploy.


## P05 — rateio por categoria HOMOLOGADA — 20/11/2026
- O proprietário aprovou expressamente P05-A a P05-F como **uma política consolidada**; registro normativo: `docs/HOMOLOGACAO_RATEIO_P05_2026-11-20.md`, commit `83168f07`.
- **33 homologações acumuladas:** 28 iniciais + P01 + P02 + P03 + P04 + P05. Preservadas integralmente as 32 anteriores; as seis sub-regras P05 não contam como seis políticas.
- **P05-A:** filamento por massa atribuível, cor e preço real de lote, sem inferir massa não medida. **P05-B:** purga separada sem dupla soma, atribuição direta preferencial e base alternativa explícita/compatível; sem base, conciliação pendente. **P05-C:** custo global único de energia e máquina, com rateio preferencial por medição/tempo atribuível, massa alternativa declarada; pausas aguardam P07. **P05-D:** trabalho e acessórios diretamente atribuídos quando identificados, serviços comuns por tempo e ferramentas reutilizáveis sem custo duplicado. **P05-E:** perdas isoladas e retrabalho com rateio explícito de seus novos custos, sem repasse automático. **P05-F:** rastreabilidade por categoria, base, fonte, usuário, fórmula proporcional quando justificada e conciliação integral; arredondamento aguarda P06.
- **PENDÊNCIAS NÃO HOMOLOGADAS:** P06 precisão monetária e centavos residuais; P07 energia de pausas, aquecimento e retomadas; P08 consumo sem lote; P09 estorno parcial; dados insuficientes do slicer, critérios fiscais/contábeis, valorização de recuperáveis, permissões/RLS e modelo SQL físico.
- Próxima ação: revisar P06 antes da estrutura física SQL. Somente documentação na branch, PR #1 draft, sem código, banco, SQL, merge ou deploy.


## P06 — precisão financeira HOMOLOGADA — 20/11/2026
- Aprovação expressa de **P06-A a P06-F como uma única política consolidada**, preservando todas as 33 homologações anteriores (28 iniciais + P01 a P05). Registro normativo: `docs/HOMOLOGACAO_PRECISAO_P06_2026-11-20.md`; commit `b8c779b8`.
- **34 homologações acumuladas:** 28 iniciais + P01 + P02 + P03 + P04 + P05 + P06. As seis sub-regras P06 compõem uma única homologação.
- P06-A: decimal exato, precisão intermediária ao menos oito casas quando aplicável, sem truncar divisões periódicas; massa até 0,001 g quando a medição sustentar, preservando unidade/resolução original. P06-B: custo proporcional à embalagem ou unidade-base do lote, sem arredondamento prematuro. P06-C: fechamento monetário positivo em centavos com half-up; estorno referencia valores históricos. P06-D: distribuir resíduos de centavos por maiores partes fracionárias e desempate estável por ID. P06-E: custo total conciliado distinto do valor unitário exibido; valores individuais lançados reconciliados. P06-F: snapshots de moeda, método, fórmulas, escala, fontes e conciliação, sem sobrescrever histórico.
- **Exceções em aberto, NÃO homologadas por consequência:** P07 (pausas/energia), P08 (consumo sem lote), P09 (estornos parciais), tributos, câmbio, requisitos fiscais/contábeis, custo de aquisição adicional/frete, escalas e tipos físicos SQL, direitos de operadores/equipes/RLS, migrações e testes.
- Próximo passo: revisão de P07 e das pendências restantes antes do SQL físico. Apenas documentação na branch e PR #1 draft; sem código, SQL, banco, merge ou deploy.


## P07 — pausas e energia HOMOLOGADA — 20/11/2026
- Aprovação expressa P07-A a P07-F como **uma política consolidada**; registro normativo: `docs/HOMOLOGACAO_ENERGIA_P07_2026-11-20.md`, commit `ccc543fa`.
- **35 homologações acumuladas**: 28 iniciais + P01 a P07 (uma homologação para cada política consolidada); todas as 34 anteriores permanecem vigentes.
- P07-A: intervalos distintos para aquecimento, impressão ativa, pausas e retomada, sem presumir atividade durante lacunas; P07-B: energia medida ou estimada por potência média de fase × duração, fonte e unidade identificadas; P07-C: pausa não é automaticamente consumo zero nem consumo de impressão ativa, permitir mudanças de condição; P07-D: retomada contabilizada separadamente, sem dupla contagem, nova reimpressão segue P04; P07-E: medição integral confiável prefere-se à estimativa sobreposta, parcial complementa intervalos sem sobreposição e tarifa da oficina é preservada no snapshot; P07-F: conciliar e registrar energia por execução uma vez, distribuir conforme P05 e P06.
- **PENDÊNCIAS NÃO HOMOLOGADAS:** P08 consumo sem lote; P09 estornos parciais; depreciação/manutenção durante pausas e períodos desligados; tarifas variáveis/horárias; custos fiscais/contábeis, lacunas e precisão de medidores, permissões/RLS e modelo SQL físico.
- Próxima revisão: P08. Exclusivamente documentação na branch e PR #1 draft; sem código, SQL, banco, merge ou deploy.


## P08 — consumo sem lote de compra HOMOLOGADA — 20/11/2026
- Proprietário aprovou expressamente **P08-A a P08-F como uma única política consolidada**, preservando as 35 anteriores. Documento normativo: `docs/HOMOLOGACAO_CONSUMO_SEM_LOTE_P08_2026-11-20.md`, commit `1bdff539`.
- **36 homologações acumuladas:** 28 iniciais + P01–P08 (uma política por conjunto A–F). Nenhuma regra prévia foi revogada.
- **P08-A:** cadastro de bobina existente por inventário físico auditável, sem compra, nota ou fornecedor fictício. **P08-B:** quantidade medida/estimada/informada diferenciada, tara do carretel descontada e saldo incerto pendente de validação. **P08-C:** custo estimado com origem e método; custo desconhecido não vira zero. **P08-D:** consumo ordinário somente de bobina operacionalmente identificada e inventariada, com saldo/confirmação P01/P02; ocorrência física de bobina desconhecida permanece pendente sem baixa arbitrária. **P08-E:** conciliação posterior com vínculo auditável, sem duplicar estoque ou reescrever snapshots/preços antigos. **P08-F:** indicadores de proveniência e pendência, alertas e rastreabilidade por oficina.
- **PENDÊNCIAS NÃO HOMOLOGADAS:** P09 estornos parciais; conciliação excepcional após consumo físico superior ao saldo ou sem lote identificável, autorização de ajustes, fechamento financeiro de custo desconhecido, fiscal/contábil, valorização posterior de inventário, permissões/RLS, depreciação em pausas, tarifas variáveis e SQL físico.
- Próxima ação: revisar P09, exclusivamente de forma documental antes de SQL físico. Nenhum código, SQL, banco, merge ou deploy.


## P09 — estornos parciais HOMOLOGADA — 20/11/2026
- Proprietário aprovou expressamente **P09-A a P09-F como uma única política consolidada**. Documento normativo: `docs/HOMOLOGACAO_ESTORNOS_P09_2026-11-20.md`, commit `43feb126`.
- **37 homologações acumuladas:** 28 iniciais + P01–P09 (uma política para cada conjunto A–F); preservadas integralmente as 36 homologações anteriores.
- **P09-A:** estorno parcial referenciado, limites reversíveis e auditáveis por linha. **P09-B:** consumo registrado erroneamente difere de filamento extrudado, que não retorna à bobina sem devolução física real. **P09-C:** reclassificação de bons/rejeitados sem duplicar peças nem material; dependências posteriores exigem validação. **P09-D:** compensação financeira vinculada ao snapshot/preços e centavos originais sem reprecificação. **P09-E:** idempotência, concorrência e transação atômica, sem saldo negativo automático. **P09-F:** original, compensações e resultado líquido auditáveis, sem reabrir ordem nem recriar reservas automaticamente.
- **EXCEÇÕES NÃO HOMOLOGADAS:** conciliação extraordinária quando consumo físico supera saldo ou não há origem identificada; ajustes especiais/autorização por papel, peças vendidas/devolvidas/garantias, fechamento financeiro com custo desconhecido, normas fiscais/contábeis e valorização de inventário, depreciação em pausas e tarifas variáveis, permissões/RLS e definição SQL física.
- Próxima ação: auditoria de integridade das **37 homologações** e análise das exceções antes da modelagem física, sempre sem SQL, banco, código, merge ou deploy sem autorização específica.


## GAP-01 — conciliação excepcional de estoque HOMOLOGADA — 20/11/2026
- Aprovação expressa de **GAP01-A a GAP01-F como uma única política consolidada**, mantendo intactas as 37 anteriores. Documento normativo: `docs/HOMOLOGACAO_CONCILIACAO_EXCEPCIONAL_GAP01_2026-11-20.md`; commit `e6548b2e`.
- **38 homologações acumuladas:** 28 iniciais + P01–P09 (9) + GAP-01 (1). Sub-regras GAP01-A a GAP01-F compõem uma única política.
- **GAP01-A:** fato físico/ocorrência pendente distinto de baixa confirmada, sem duplicidade. **GAP01-B:** investigar entrada esquecida, troca de bobina e erro de medição com evidência, sem inventar origem. **GAP01-C:** inventário corretivo excepcional fundamentado, vinculado a evidências e evento auditável, sem ajuste positivo automático. **GAP01-D:** reservas de todas as ordens protegidas, sem liberação ou consumo implícitos. **GAP01-E:** correções de eventos já confirmados seguem P09, com idempotência e sem devolver filamento extrudado. **GAP01-F:** acompanhamento registrada/em análise/regularizada/pendente de decisão, com custo desconhecido não encerrado automaticamente.
- **EXCEÇÕES AINDA ABERTAS / NÃO HOMOLOGADAS:** critérios de evidência mínima e confiança, quem pode autorizar/segregar ajustes e conciliação, procedimento definitivo sem lote/origem comprovada, fechamento financeiro de custo desconhecido, dependências de venda/devolução/garantia, regras fiscais e contábeis, RLS/permissões, depreciação durante pausas, tarifas variáveis, SQL físico/migrações e testes.
- Próxima revisão documental prioritária: **GAP-02 permissões e autorização de operações críticas**, sem homologação automática. Nenhum código, banco, SQL, merge ou deploy.


## GAP-02 — permissões e autorização de operações críticas HOMOLOGADA — 20/11/2026
- Proprietário aprovou expressamente **GAP02-A a GAP02-F e a matriz funcional de papéis como uma única política consolidada**; documento `docs/HOMOLOGACAO_PERMISSOES_GAP02_2026-11-20.md`, commit `6745c2e8`.
- **39 homologações acumuladas:** 28 iniciais + P01–P09 (9) + GAP-01 (1) + GAP-02 (1); todas as 38 anteriores preservadas.
- **GAP02-A:** identidade, vínculo e isolamento por oficina, sem confiar em IDs de navegador. **GAP02-B:** capacidades distintas de consultar, preparar, confirmar, solicitar, aprovar e executar, independentemente da assinatura. **GAP02-C:** confirmação ordinária condicionada a saldo, origem, reservas e autorização vigente. **GAP02-D:** separar solicitante/aprovador em equipes; maker sozinho pode utilizar fluxo próprio excepcional com justificativa reforçada, sujeito a limites ainda abertos. **GAP02-E:** estorno conforme P09 e dependências; **GAP02-F:** trilha de auditoria de pedido/aprovação/execução, oficina, versão e evidência.
- Matriz homologada de papéis **Proprietário, Gestor, Operador e Auditor/Consulta**: consultar produção P/P/P/L; preparar, confirmar produção ordinária, registrar falha, reservar e registrar divergência P/P/P/—; solicitar ajuste P/P/S/—; aprovar ajuste A/A*/—/—; executar estorno ordinário P/P/S/—; autorizar excepcional A/A*/—/—; consultar finanças P/P/—*/L*; administrar membros/assinatura P/—/—/—. Asteriscos dependem de autorização explícita ou alçadas futuras; nenhum papel altera direitos de plano ou permite acesso a outra oficina.
- **EXCEÇÕES NÃO HOMOLOGADAS:** equipes/convites/limites de participantes, alçadas e limites de aprovação, condições de autoaprovação, RLS e autenticação concretos, evidências mínimas, conciliação sem origem, custo financeiro desconhecido, fiscalidade, vendas/devoluções/garantias, SQL físico, migrações, retenção de logs, depreciação em pausas e tarifas variáveis.
- Próxima etapa recomendada: **consolidar as pendências restantes em um único pacote de decisões para encerrar a arquitetura documental e preparar MVP**, sem novas homologações automáticas. Não alterar código, SQL, banco, merge ou deploy.


## Implementação de UX progressiva — 20/11/2026
- Direção reafirmada pelo proprietário: **entrou → Simples; quer mais opções → Avançado**; primeira experiência sem burocracia. Não criar novas homologações para cada ajuste de interface. **39 homologações anteriores preservadas.**
- Implementado na branch `feat/fundacao-makercusto`, PR #1 draft: seletor de modo `Simples/Avançado`; modo Simples mostra peso/preço de filamento, tempo, unidades e preço de venda, com cálculo ao vivo; modo Avançado expõe impressora, custos complementares e detalhamento multicor. Ao alternar, entradas são preservadas e os dois mecanismos de filamento não são somados. Resultado prioritário exibe custo unitário, venda e lucro bruto por unidade; demais componentes ficam em seção expansível.
- Código: `src/App.tsx` commit `12f45df5`; estilos responsivos `src/styles.css` commit `e70b78e8`; cenários Playwright `tests/app.spec.ts` commits `637aa6a7` e `7d8d33ec`.
- Limites: valores de impressora/energia continuam **exemplos estimados** e devem ser conferidos; não há login, banco, salvamento remoto nem gestão implementada. Modelo de custos existente mantido. Esta fase não representa implantação nem homologação visual.
- Testes: execução de CI do PR #1 em andamento, run `44857663329` no momento do registro; resultado final deve ser conferido antes de indicar preview. Nenhum deploy/merge autorizado.
- Próxima etapa: conferir CI completo, corrigir eventuais falhas e solicitar validação visual somente sobre lote estável.


### Verificação de CI da UX progressiva — 20/11/2026
- **PASSOU** para commit `ab67481cc259769d6acab47a8d38fd17cec16a52`: GitHub Actions run `44858012063`, job `136704638275`: verificação de tipos, testes unitários do motor de custos, build e **26 testes E2E desktop/mobile aprovados**. A rodada anterior `44857763701` identificou timeout em um teste mobile (25/26); o cenário foi corrigido no commit `ab67481c` e a execução seguinte concluiu com sucesso.
- **Ainda não houve deploy nem homologação visual do proprietário**. Fonte oficial de execução: https://github.com/jeffersonfukner-hue/makercusto/actions/runs/44858012063

## Supabase MakerCusto provisionado e banco aplicado — 21/11/2026
- **Projeto Supabase exclusivo:** MakerCusto, id `bxtbfdddcxbyaomydgxn`, organização Flipzie Desenvolvimento de Sistemas (plano Free), região `sa-east-1`. Custo de criação confirmado pela API: **0/mês**. Projeto `ACTIVE_HEALTHY`.
- **Migração aplicada:** `makercusto_foundation_v1`, sucesso confirmado na API e histórico de migrações; SQL versionado em `supabase/migrations/20261121015442_makercusto_foundation_v1.sql`, commit `13a7c897` na branch `feat/fundacao-makercusto`.
- **Verificado por SQL somente leitura:** 33 tabelas de domínio `mc_*` com RLS habilitado; 34 objetos do tipo tabela/visão com prefixo `mc_`; 68 políticas, 89 chaves estrangeiras, 19 entradas de catálogo global, 1 modelo Anycubic Kobra X, zero oficinas e zero movimentações. Migração registrada (1 entrada).
- **Limite efetivo:** banco é estrutura e catálogos, **não é aplicativo integrado**. Cadastro automático de oficina requer usuário autenticado e chamada `mc_create_workspace`; confirmação de produção, estorno, rateio final e estoque precisam de RPC transacional e testes antes de uso financeiro. Não prometer que 39 políticas estão integralmente operacionalizadas apenas por criar tabelas.
- **Próxima entrega:** conectar frontend, login, seleção/instanciação de impressoras, botão + e modais completos para cadastros reais, com testes. Sem merge e sem deploy.


## Integração inicial Supabase no frontend — 21/11/2026
- O código na branch foi integrado ao projeto Supabase MakerCusto `bxtbfdddcxbyaomydgxn` via API pública e chave publishable. Sem chave de serviço no frontend.
- Fluxos implementados: autenticação e-mail/senha (login, cadastro, encerramento de sessão e refresh); criação de oficina pelo RPC já instalado; leitura do catálogo de modelos (incluindo Kobra X), impressoras da oficina, cadastro/edição via modal Normal/Avançado; botões + para tipo/cor/marca com cadastro particular via `mc_catalog`. Cálculo Simples permanece aberto sem login.
- Cadastros como visitante permanecem explicitamente locais e transitórios; após login, novas impressoras/catálogos privados usam o Supabase com RLS. Valores de equipamento/energia ausentes são estimativas de UI e não são inventados no banco.
- Arquivos: `src/data/supabase.ts`, `src/components/Modals.tsx`, `src/App.tsx`, `src/styles.css`, `tests/app.spec.ts`. Evidências: PR #1 em draft, commits desta branch posteriores a `f9929ce4`.
- Limites: ainda falta testar fluxo real com conta autenticada e homologar visual; cenários Playwright usam simulação de API (não confirmam operação de usuário real). Serviços de estoque/produção continuam sem integração operacional. Nenhum deploy nem merge.

## Validação final do lote de integração — 21/11/2026
- **CI aprovado para o código:** run `44864163612`, job `136723999519`, commit `c5dcc1eb`: tipos, unitários, build e E2E desktop/mobile `success`. Problema de toque do botão + no mobile foi identificado com Playwright e resolvido por barra de cadastros rápida mobile.
- **Escopo validado:** interface de login, cadastro de impressoras e catálogo por modal, APIs simuladas em E2E, regressão do cálculo. Não é ensaio de operação real autenticada: credenciais reais e isolamento RLS precisam de QA de integração antes de uso público.
- **Publicação:** nenhum merge/deploy. O proprietário valida apenas pelo Cloudflare Preview em etapa expressamente autorizada.

## 21/11/2026 — Pré-homologação: modelos de impressora e ações de cadastro
- Solicitação: pré-popular impressoras de marcas populares; ampliar o cadastro avançado e harmonizar os botões de adição com o design existente.
- Implementado em branch: referências FDM locais de Bambu Lab, Anycubic, Creality, Elegoo, Prusa, Flashforge, Sovol e QIDI; seleção disponível mesmo sem resposta do Supabase; cadastro personalizado não grava IDs falsos em chaves estrangeiras; nome do modelo é preenchido automaticamente.
- Parâmetros de compra/potência/vida útil continuam editáveis e são hipóteses individuais, não especificações certificadas; custo de aquisição não informado não deve herdar R$3.500 de outra máquina.
- Modal avançado inclui conferência de consumo por hora e depreciação, sem alterar o motor de cálculos; ações de inclusão ganharam estilo premium responsivo.
- Pendência: conferir CI do HEAD e homologar visualmente após deploy manual do proprietário. Nenhum merge ou deploy automático autorizado.

## 21/11/2026 — Esclarecimento homologado: facilidade acima de formulários vazios
- O proprietário esclareceu que a prioridade do MakerCusto é **FACILITAR** a vida de quem imprime. Diferentemente da leitura anterior, **é desejado apresentar estimativas iniciais já preenchidas** nos cadastros; cabe ao usuário ajustar para sua realidade quando quiser, sem precisar calcular potência, energia ou custos do zero.
- Fluxo desejado: selecionar **fabricante**, depois **modelo** (popularidade primeiro); receber ficha de referência com especificações do fabricante verificadas e parâmetros operacionais estimados, diferenciados e editáveis. O aplicativo deve estar utilizável imediatamente.
- Caso exemplar: partir de **Anycubic Kobra X** global, copiar todos os parâmetros para uma impressora pessoal chamada **"Aninha"** (ou "Ana Clara") e editar somente particularidades, sem reintroduzir a configuração inteira. O original permanece imutável, com vínculo de cópia e histórico isolado. Reafirma a regra global/cópia já homologada.
- **Plus futuro:** dicas/perfis de impressão otimizados por impressora, tipo de peça, material e objetivo. Registrar somente no backlog; não implementar nem habilitar cobrança agora.
- Estado real: este registro é documental; a ficha técnica integral, estimativas em todos os campos, seletor dependente e botão de cópia completa **ainda não foram implementados** nesta rodada. Não alegar homologação visual, integração completa nem testes funcionais.

## 21/11/2026 — Alegoria Aninha vale para TODOS os cadastros
- A história de clonar a Kobra X e renomear Aninha é uma regra geral, não exceção. O usuário deve encontrar conteúdo global pronto, usar e consultar imediatamente e só clonar quando quiser personalizar, recebendo todos os campos sem redigitação. Originais globais, inclusive nomes, são protegidos.
- O mesmo princípio aplica-se a filamentos e perfis de slicer. Ex.: perfil de Masterprint PETG ou SUNLU PLA no próprio cadastro para consultar temperaturas, ventilação e demais configurações, diferenciando fonte oficial de sugestão validada. Dicas avançadas específicas permanecem como ideia de plano Plus futuro.
- Normalizar nomes novos: entrada vermelho fosco vira Vermelho Fosco, sem prejudicar siglas e marcas; impedir duplicatas equivalentes. Exemplo textual vermelhor fosco contém provável erro ortográfico, não corrigido só com capitalização: oferecer sugestão, sem autocorreção silenciosa.
- Alteração desta rodada exclusivamente documental. Código, banco, merge e deploy não alterados; implementar/testar posteriormente.

## 21/11/2026 — Ajuda contextual e sugestões rápidas
- Nova diretriz do proprietário: onde fizer sentido, inserir **letrinhas pequenas abaixo do campo** com explicação curta que muda conforme o contexto, inclusive ao preencher incorretamente.
- Autocomplete de **até três opções clicáveis** para reduzir digitação, como ao digitar Kobra oferecer modelos do catálogo, respeitando fabricante e ordenação útil. A mesma regra vale transversalmente para demais entidades relevantes; decidir tecnicamente os campos com benefício real.
- Princípio: facilitar sem poluição visual; não obrigar explicações extensas, não inventar opções; preservar acessibilidade, mobile e originais globais protegidos.
- Escopo desta rodada: registro documental somente, sem implementação, alterações de banco, merge ou deploy.

## 21/11/2026 — Lote de implementação: campos inteligentes e impressoras
- Modais de impressora separam fabricante/modelo com filtro dependente; nome pessoal é editável e cadastros de referência têm ficha técnica somente quando fonte verificável, iniciando Kobra X (Anycubic). Custos pré-populados como hipóteses, sem igualá-los a ficha oficial.
- Campos de cor, tipo e marca passam a utilizar sugestões locais limitadas a três resultados e mensagens curtas; catálogos de cores/marcas ampliados, preservando normalização e origem.
- Regressões E2E propostas para filtro do fabricante, cópia com valores iniciais e formato Vermelho Fosco; exigir CI do HEAD antes do Preview. Sem alteração de Supabase, merge ou deploy.

## 21/11/2026 — Lote de perfis básicos de filamento
- Interface passou a consultar perfis por material/marca sem alterar motor de custo; SUNLU PLA usa referência pública da fabricante; Masterprint PETG e tipos genéricos são estimativas expressamente rotuladas.
- Adicionado fluxo local de cópia de perfil de slicer com nome e parâmetros próprios; original permanece protegido. Persistência localStorage, não Supabase, nesta versão. Recomendações não são garantia de qualidade em impressoras diferentes.
- Teste E2E de consulta, cópia e retorno ao original adicionado. Requer CI e homologação, sem merge/deploy.

## 21/11/2026 — Fechamento técnico do lote de campos inteligentes e perfis
- Código consolidado no commit `dff2fb8d20e5b751bc01a6b5fa5fb49d1104b7b9`. CI #44912210018 **aprovado**: tipagem, 11 testes unitários, build estático e **38 testes E2E desktop/mobile**.
- Mudanças: fabricante/modelo dependente, 25 referências de impressoras, ficha técnica Kobra X com fonte fabricante, custos padrão marcados como estimativas, marcas/cores ampliadas, autocomplete com limite de três sugestões, normalização, perfis básicos de slicer e clonagem local dos perfis.
- Corrigida ampliação horizontal indevida de grid no mobile, que impedia tocar no botão de clonagem do perfil. Teste de acesso do botão na largura da viewport passou.
- Limites explícitos: apenas Kobra X teve dados técnicos específicos de fabricante verificados; SUNLU PLA utiliza fonte oficial para parte dos parâmetros; Masterprint PETG e genéricos usam estimativas informadas na UI; clones de perfil ainda ficam neste navegador, sem sincronização em nuvem. Clone universal com IDs históricos e RLS e fichas completas para demais marcas/modelos continuam pendentes.
- Nenhum merge, deploy ou alteração de esquema/dados do banco nesta rodada; validação visual real do proprietário segue pendente e não deve ser confundida com CI verde.

## 21/11/2026 — Consolidação complementar do lote de cadastros
- Busca por modelo: ao digitar/clicar nome correspondente, a referência é selecionada automaticamente, preenchendo o nome pessoal; remove etapa redundante do fluxo.
- Perfis de filamento pessoais: impedir nomes equivalentes duplicados dentro da mesma referência, preservando cópia anterior sem sobrescrita.
- Referências oficiais incrementais: adicionados volumes de impressão Bambu Lab A1 mini (180³ mm), A1 (256³ mm) e Prusa MK4S (250×210×220 mm; bico 0,4 mm), com links de fabricante. Campos sem evidência seguem ausentes na ficha em vez de inventados; estimativas de custos mantidas separadamente.
- Evidências técnicas: https://blog.bambulab.com/best-3d-printer-for-beginners/ ; https://www.prusa3d.com/product/original-prusa-mk4s-3d-printer/ . CI do novo HEAD será conferido. Sem alterações no banco, merge ou deploy.

## 21/11/2026 — Acessibilidade do componente transversal de sugestões
- Campos inteligentes passam a expor combobox/listbox com descrições ARIA, até três sugestões, navegação por setas, Enter para selecionar, Escape para fechar, feedback de foco/seleção e preservação do valor digitado ao fechar. Regra reaproveitada automaticamente onde SmartField já é utilizado.
- Foram adicionados testes Playwright para teclado/limite de sugestões; verificar CI do HEAD antes de homologação. Sem banco, merge ou deploy.

## 21/11/2026 — Diagnóstico e correção do CI do autocomplete
- CI #44918924933 falhou com 8 casos (4 cenários nos dois projetos desktop/mobile), enquanto tipagem, motor e build passaram. Logs: colisão do nome acessível da listbox com entrada Cor do filamento; testes antigos ainda buscavam role=button para sugestões agora role=option; pesquisa de modelo é combobox, não textbox; seleção de opções sem restringir a listbox incluía elementos select do formulário.
- Ajustados nomes ARIA e seletores Playwright para o contrato real do componente. Sem alteração de banco, merge ou deploy; exigir CI verde posterior.

## 21/11/2026 — Referências globais diretamente selecionáveis na calculadora
- 25 modelos do catálogo local passam a aparecer no seletor de impressora da calculadora sem que o usuário precise cadastrá-los primeiro; separados visualmente de impressoras pessoais.
- Modelos globais usam **estimativas financeiras genéricas rotuladas**, não consumo/preço oficial específico. Botão em referência é Clonar e personalizar; edição de uma impressora pessoal continua ação distinta. Cópia preserva padrão na lista.
- Acrescentadas 6 fichas técnicas parciais com referências de fabricantes: Bambu P1S, Anycubic Kobra 3, Creality Ender-3 V3 SE/V3/V3 KE, Elegoo Neptune 4 Pro. Ausência de campo não implica valor zero; sem inferir potência operacional de fonte com potência nominal.
- Persistência do perfil pessoal de impressora permanece nas colunas já existentes; especificações estendidas e RLS de clones completos requerem modelagem futura. Sem alteração de SQL, banco, merge ou deploy.

## 21/11/2026 — Correção da regressão de seleção de clonagem
- CI #44924935524: tipagem, testes unitários e build aprovados; E2E 48 passaram e quatro falharam porque os testes procuravam botão Clonar e personalizar globalmente quando agora o fluxo de impressora e o de filamento oferecem legitimamente o mesmo rótulo. Ajustado o escopo dos seletores Playwright à região de perfil de filamento, sem mudar a interface.
- Exigir novo CI completo. Não ocorreu alteração de banco, merge ou deploy.

## 21/11/2026 — CI verde após seleção direta dos padrões
- **Aprovado:** GitHub Actions #44925197270, código em `bf554134777a60e5a5ac8a8eff72e36cc0cfdb76`: tipagem, motor de custos, build e E2E desktop/mobile concluídos com sucesso. Corrigido apenas o escopo dos testes dos dois botões de clonagem; 25 referências de impressora selecionáveis imediatamente, cópia pessoal sem mutação do padrão, seis fichas técnicas parciais adicionais com fontes.
- **Não comprova:** operação com conta real/Supabase, persistência de fichas técnicas avançadas nem homologação visual do proprietário. Nenhum merge/deploy/banco.
- Evidência: https://github.com/jeffersonfukner-hue/makercusto/actions/runs/44925197270

## 21/11/2026 — Fluxo de edição e cobertura de filamentos (novo lote)
- Perfil de slicer pessoal agora pode ser reaberto com **Editar meu perfil**, alterar campos e salvar no mesmo ID local, sem gerar clone extra nem modificar a referência global. Nomes duplicados de cópias continuam bloqueados; cópias neste navegador/localStorage, não sincronizadas com Supabase.
- Catálogo de pontos de partida genéricos ampliado para PLA+, ABS, ASA, PA, PC e PVA. São **estimativas MakerCusto**, jamais perfis oficiais das marcas; avisos de compatibilidade, temperatura e ventilação para materiais mais exigentes.
- Ajuda pequena contextual em peso e preço por unidade, equivalente por kg da embalagem, purga, duração/quantidade e outros custos. Cálculo matemático existente não foi alterado.
- Novos testes Playwright para editar/voltar ao padrão/recarregar, pontos de partida por material e equivalência de preço por kg. CI e homologação visual pendentes nesta rodada. Sem SQL, banco, merge ou deploy.

## 21/11/2026 — Validação do lote de perfis e ajuda financeira
- **CI aprovado:** #44926757179 para commit `1034a2c421355f7680dc0b4ee1c775e17310cd98`. Job concluiu `success`: verificação de tipos, testes unitários, build e interface desktop/mobile.
- Funcionalidades verificadas pelo CI: cópias de perfil de filamento editáveis sem alterar origem, retorno ao perfil padrão, reabertura após recarregar, catálogo genérico de PLA+, ABS, ASA, PA, PC e PVA, microdicas e conversão de embalagem para R$/kg.
- **Limites:** perfis pessoais de slicer armazenados apenas no navegador; faixas genéricas são estimativas de partida, não configurações oficiais; integração real com conta/Supabase não validada. Sem merge, deploy nem alterações no banco. Evidência: https://github.com/jeffersonfukner-hue/makercusto/actions/runs/44926757179


## 21/11/2026 — Continuidade das impressoras de visitantes, sem banco
- Implementado armazenamento local de impressoras pessoais sem login com validação dos registros, limite de 100 e ID local isolado, sem misturar com referências imutáveis nem oficina autenticada.
- Última impressora selecionada preservada por visitante ou conta neste dispositivo; a seleção só é restaurada se o modelo/instância realmente existe. As configurações pessoais do visitante continuam sendo dados deste navegador; não há migração/sincronização automática para Supabase.
- Restaurar exemplo não exclui cópias pessoais; logout restaura dados locais do visitante, sem trazer impressoras do usuário autenticado. O banco, as tabelas e o motor financeiro não foram alterados.
- Acrescentados três testes E2E (persistência após reload, preservar cópia ao restaurar, última referência selecionada). CI do commit ainda precisa ser conferido. Sem merge/deploy.

## 21/11/2026 — Correção de teste da persistência visitante
- CI #44927149461: 62/64 E2E aprovados, duas falhas (mesmo cenário desktop/mobile) por teste que esperava somente um rótulo contendo "Anycubic Kobra X" embora a lista inclua corretamente o exemplo ilustrativo e o modelo global. Alterado teste para validar por ID inequívoco de referência; nenhum comportamento de produção alterado. Necessário reconfirmar CI do HEAD.

## 21/11/2026 — Correção de seletor CSS no teste de seleção lembrada
- CI #44927374533 terminou com 62/64 testes Playwright aprovados; duas falhas no mesmo cenário desktop/mobile por expressão inválida de teste `option:selected` (CSS usa `option:checked`). Ajustado o seletor sem alterar código funcional. Reexecutar CI completo antes de considerar entrega validada.

## 21/11/2026 — CI verde para persistência local de impressoras
- **Aprovado:** GitHub Actions #44927634558, commit `b112c4619f3a3e2f10dcb0cc6d44758b61962b06`; tipagem, testes unitários, build e testes E2E desktop/mobile passaram.
- Escopo testado: clone de impressora local preservado após atualizar página, seleção anterior restaurada, referência global intacta, restaurar exemplo sem apagar cadastros pessoais.
- Os dois CI anteriores falharam por testes com seletores CSS imprecisos/inválidos, não por perda de cadastros; correções de testes versionadas. A persistência segue **exclusivamente local** sem login, e a última seleção por conta é uma preferência deste dispositivo, não sincronização Supabase.
- Nenhum merge, deploy ou alteração de dados/banco. Evidência https://github.com/jeffersonfukner-hue/makercusto/actions/runs/44927634558

## 21/11/2026 — Produto com persistência transacional no Supabase
- Autorização expressa para ativar o uso do banco e código, sem deploy (exclusivo do proprietário), sem merge.
- Banco MakerCusto: função `mc_save_calculated_product` criada para salvar produto, revisão inicial e snapshot do cálculo na mesma transação, com validação de usuário, oficina e parâmetros. A migração também removeu EXECUTE de anon em `mc_create_workspace`, `mc_finance`, `mc_member`, `mc_role`. Permissões verificadas por SQL em leitura.
- Frontend: painel Meus produtos com cadastro, lista e feedback visual; visitante precisa autenticar; snapshot estimado captura entrada e resultado, não movimenta estoque e não equivale a confirmação de produção. Teste automatizado com Supabase REST simulado adicionado; CI pendente.
- Segurança: teste end-to-end contra conta real/RLS e relatório de advisors seguem pendentes. Produto salvo tem apenas revisão inicial; editar produto/kit multicomponente e gerir estoque são frentes posteriores, não alegar concluídas.


## 21/11/2026 — Produto real composto por peças impressas
- Usuário solicitou uso real imediato, usando brinquedo lançado hoje: lançador, haste de conexão e hélice. Ambiente em desenvolvimento: perda de dados de testes é aceitável, mas não apagar dados sem necessidade.
- Implementado no Supabase: RPC autenticada `mc_create_assembly` para criar conjunto, revisão, três ou mais componentes fabricados, vínculo de composição e snapshots com custo `unknown` quando não calculado; RPC `mc_list_assemblies` consulta isolada por oficina. Permissões de execução somente para authenticated.
- Implementado na branch: formulário de conjunto com peças personalizáveis, quantidade por kit, peso opcional e observações, preço opcional, listagem e consulta da composição, mensagens de progresso/erro. Sem inventar custos nem baixar estoque.
- Teste SQL com transação `ROLLBACK` confirmou cadastro e retorno da consulta, seguido de zero dados de teste persistentes. E2E simulado adicionado e CI do HEAD pendente.
- Escopo ainda pendente: edição/versionamento do kit já salvo, custo real por peça vinculado à impressão/filamento, estoque/produção, montagem e geração de preços por composição. Não afirmar que a composição completa de custos está pronta.

## 21/11/2026 — CI aprovado para montagem de peças
- GitHub Actions #44933944246 aprovado para commit funcional `5723a7e4f259b1ceb65f4d86a8cf8bb0f475f508`: TypeScript, 11 unitários, build e 74 E2E desktop/mobile; https://github.com/jeffersonfukner-hue/makercusto/actions/runs/44933944246 .
- Atualizações seguintes foram somente de documentação. No banco, criação e consulta de conjunto de três componentes validadas em transação revertida. Não houve deploy/merge.
- Próxima etapa prática: proprietário publica manualmente o commit/branch validado; cadastra Lançador de hélices com Lançador, Haste, Hélice e informa dados reais; verificar persistência ao recarregar, composição e autorização no navegador. Implementar edição de composição e custeio real por componente após observar os primeiros dados.

## 22/11/2026 — Primeira peça composta real persistida; publicação Cloudflare antiga
- Browser conectado confirmou usuário logado no MakerCusto e publicação `cdb4b74a.makercusto-preview.pages.dev` sem os painéis recentes. O Cloudflare aponta publicação ativa para commit `e54e132`, embora o código da montagem tenha CI verde no commit `5723a7e`; deploys mais recentes aparecem como `No deployment available` e o painel informa `Automatic deployments paused`. Assim, o usuário ainda não consegue usar a interface de composição no site publicado; jamais dizer que esta versão está homologada visualmente.
- Solicitação explícita de cadastrar de verdade: criado no Supabase MakerCusto, na única oficina existente (`Minha oficina`), o kit `Lançador de hélices`, ID `0a687413-fe87-4f80-a655-e6b914aceea6` com 1 Lançador, 1 Haste e 1 Hélice. Nenhum valor presumido para gramas/custos/preço. Confirmadas revisão, 3 componentes e consulta autenticada da composição.
- Atividades registradas em `docs/REGISTRO_DE_ATIVIDADES.md`. Ação pendente do proprietário: efetuar o deploy manual do código aprovado (branch `feat/fundacao-makercusto`, commit funcional `5723a7e` ou HEAD documental derivado) e conferir a presença dos painéis e a recuperação do produto pré-existente. Sem merge/deploy do assistente.


## 22/11/2026 — Homologação e implementação do Modelo 4, CI aprovado
- **Homologado pelo proprietário:** ao entrar, usuário vê um sistema de oficina separado da calculadora pública, com cabeçalho, menu lateral (recolhível no desktop; gaveta no mobile), abas internas, painel da oficina, produtos/conjuntos e ficha do produto.
- **Código implementado na branch `feat/fundacao-makercusto`:** `src/components/SystemNavigation.tsx`, integração em `src/App.tsx`, indicadores reais com `WorkshopDashboard.tsx`, filtro `Peças` em `ProductSavePanel.tsx`, ficha detalhada com composição no `AssemblyPanel.tsx`, estilos em `src/styles.css`, testes de interface. Calculadora de visitantes permanece. Módulos ainda não implementados são claramente desabilitados, sem simular dados.
- **Verificado:** CI #45079957503 `success`, commit funcional `917ed2ff735921b8c255c763bac541bb063a9fa1`: TypeScript, 11 testes de motor, build e 78 E2E desktop/mobile. Evidência https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45079957503 . Os testes de interface usam respostas simuladas do Supabase.
- **Dados reais preservados:** kit `Lançador de hélices` id `0a687413-fe87-4f80-a655-e6b914aceea6`, 3 componentes; nenhum SQL nem dado empresarial modificado nesta etapa.
- **Pendente:** proprietário publica manualmente versão validada (não fazer deploy ou merge pelo assistente); homologar menu/abas/ficha em navegador com login real e conjunto existente; implementar etapas operacionais reais no backlog. Documentos antigos README/ARQUITETURA permanecem desatualizados em alguns trechos e devem ser reconciliados sem apagar histórico.


## 22/11/2026 — Produtos como sistema, não formulário: implementação validada
- **Decisão já aprovada:** no modo autenticado, o módulo Produtos abre no catálogo; cadastro apenas ao clicar Novo produto/Conjunto/Peça. Cada item tem ficha dedicada, ações Editar e Duplicar, composição das peças, peso/custo informado opcional, custo total apenas se todas as peças tiverem custo. Nunca criar lançador pré-preenchido automaticamente; exemplo real já existe no Supabase.
- **Branch:** `feat/fundacao-makercusto`, commit funcional com CI verde `52d83b129d7a48a3ae960554a2355c5e40e3a225`. GitHub Actions #45084244776 `success`: TypeScript, 11 unitários, build e 78 E2E. Evidência: https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45084244776 .
- **Frontend:** novo `src/components/ProductWorkspace.tsx`; `src/App.tsx` usa ProductWorkspace no modo autenticado, preservando experiências públicas de convidado; CSS responsivo em `src/styles.css`; API em `src/data/supabase.ts`. `ProductSavePanel` e `AssemblyPanel` originais permanecem apenas na calculadora pública para não quebrar o acesso visitante; futuramente revisar necessidade dessas formas.
- **Supabase:** aplicada e testada função transacional para revisão do conjunto `mc_update_assembly`, leitura de revisão mais recente em `mc_list_assemblies`, `mc_save_product_record` para produtos sem custo, suporte a custo inicial opcional na `mc_create_assembly`. GRANT para `authenticated` e REVOKE para `anon`. Não houve alterações nos registros reais além das migrações de schema/funções.
- **Dados reais preservados:** produto Lançador de hélices `0a687413-fe87-4f80-a655-e6b914aceea6`, 3 componentes, sem pesos nem custos inventados; leitura comprovou 4 registros e uma revisão do kit real.
- **Limites:** custo manual equivale a estimativa informada; não representa impressão/estoque real. UI de histórico integral das revisões, vinculação a impressão/filamentos/estoque e biblioteca STL permanecem pendentes. Testes E2E usam API simulada. Sem merge/deploy.
- **Próximo passo:** usuário publica manualmente branch/commit funcional após revisão; realizar homologação visual e operação real sobre o produto existente, exercitando edição com pesos e custos reais.


## 22/11/2026 — Abas do Início previstas no Modelo 4
- Usuário apontou divergência com o protótipo homologado: o Início mostrava apenas `Visão geral`, faltando `Atividades` e `Pendências`.
- Corrigido na branch `feat/fundacao-makercusto`: três abas selecionáveis com estado preservado ao navegar entre módulos. `Visão geral` mantém indicadores; `Atividades` consulta cadastros recentes de produtos, com data de criação; `Pendências` apresenta produtos sem preço e kits sem custo/sem preço. Sem dados inventados, sem declarar que cadastros são logs de produção.
- Arquivos: `src/components/SystemNavigation.tsx`, `WorkshopDashboard.tsx`, `src/App.tsx`, `src/styles.css`, `tests/app.spec.ts`.
- CI iniciado para commit funcional `1854af63bfc0fc4840e0034690f05dc57d99e7e6`; verificar resultado ao concluir. Sem merge/deploy.

- **CI final desta correção:** #45085517877 `success`, commit `68258aed5bb1ead0b2fa82be72dcc9b29dfb2a22`: 11 unitários, 78 E2E desktop/mobile, build e TypeScript aprovados. https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45085517877 . Faltam apenas deploy manual do usuário e homologação visual das três abas.


## 22/11/2026 — Auditoria de 39 homologações e início da implementação operacional
- **Solicitação:** proprietário identificou que muito do planejamento de oito horas não estava implementado; autorizou seguir com auditoria do contrato integral e implementação por lotes, sem merge/deploy.
- **Fonte oficial:** criada `docs/MATRIZ_ADERENCIA_39_HOMOLOGACOES.md`, com uma linha por política (39 = 5+8+4+6+5+9+2) e evidência/lacuna, sem contar subitens como homologações separadas. Classificação após L1: **17 parciais, 22 sem fluxo demonstrado, zero completas**. Políticas P01–P09 e GAP preservadas, não reabrir decisões.
- **Primeiro lote funcional L1:** `mc_register_existing_spool` registra bobina física inventariada, sem compra/fornecedor fictício, com massa em gramas, origem e custo opcional; evento + movimento + lote em transação única, sem criar saldo fictício. `mc_list_existing_spools` lista saldo; frontend `MaterialsWorkspace.tsx` habilitado no menu Materiais e usa as RPCs. Usuário precisa informar massa física real para cadastrar a própria bobina.
- **Segurança:** bloqueadas operações diretas de escrita/truncamento dos clientes sobre eventos/movimentos/lotes, exigida identidade e papel proprietário/gestor; replay idempotente e divergente testados em transações com rollback; preservados os 4 registros reais de produto, nenhum filamento/evento/lote de teste persistido.
- **Evidências:** migrações `supabase/migrations/20261122210500_initial_spool_inventory.sql` e `20261122211000_spool_inventory_hardening.sql`, documentos e testes E2E, branch `feat/fundacao-makercusto`. CI ainda deve ser conferido ao concluir.
- **Próximos lotes:** L2 cadastro da impressão do lançador/hastes/hélices, L3 confirmação segura e idempotente, L4 custeio por lote/categoria conforme P05/P06. Proibido tratar P08 como completa pelo inventário inicial; não inventar pesagens, tempos, quantidades, compras ou preços.


### Fechamento do Lote L1 — 22/11/2026
- GitHub Actions #45086849957 `success`, commit validado `1713872b871783a681b5b9b03d82687546e04c67`, 11 testes unitários + 80 E2E desktop/mobile; TypeScript/build aprovados. https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45086849957
- Dados reais do Lançador de hélices preservados; `mc_filaments` e `mc_stock_events` continuam sem dados reais. O usuário precisa cadastrar a bobina física com o peso observado, sem criar exemplos falsos.
- Supabase Security Advisor identificou advertências (11 SECURITY DEFINER chamáveis por authenticated, proteção de senhas vazadas desabilitada); não afirmar auditoria de segurança concluída. Nenhuma mudança na configuração Auth.
- Próxima etapa é L2/L3 de impressão real e confirmação idempotente; não ativar baixa sem validação transacional e segurança de papéis. Sem merge/deploy.


## 22/11/2026 — L2/L3, implementação na branch (ainda não aplicada ao banco)
- Base: L1 confirmado pelo CI #45086849957. Consultados AGENTS, padrões, arquitetura, continuidade, matriz de 39 e homologações RES/PAR/P01/P02.
- Foram versionados `supabase/migrations/20261122212500_print_execution_l2_l3.sql`, `src/components/PrintsWorkspace.tsx`, cliente REST e integração com navegação autenticada. Teste Playwright de L2 com REST simulado adicionado.
- L2: rascunho vincula impressora física e peças diferentes com quantidades e tempo/fonte opcionais, sem baixa.
- L3 (implementação inicial restrita): incrementos idempotentes por chave/payload, eventos por saída, lotes individualizados, autenticação por proprietário/gestor, lock transacional por oficina, rejeição de saldo físico menos reservas insuficiente, trilha e snapshots de custo unitário de lote conhecido. A tela exige identificação de saída, bobina e origem da massa. Sem lançamento financeiro conciliado.
- Bloqueios deliberados: encerramento definitivo até rateio e snapshot conciliado de L4; confirmações quando há reserva ativa da mesma execução (a conciliação de reserva de P01 não está concluída); sem alegar suporte integral a falhas/retrabalho/estornos. Isto não converte P01/P02/G02 em comprovadas.
- **Estado dos testes:** CI da nova branch em andamento ao registrar esta nota; SQL ainda não aplicado nem validado em Supabase. Operações reais L3 indisponíveis até aplicação controlada da migração, testes transacionais de replay/concorrência/isolamento e validação manual.
- **Sem merge, deploy, aplicação de SQL no banco ou operações pagas.**
- Evidências: commits da branch a partir de `658e0875de3f47a8bc7cb5350fcd8cb1d1b73e7c`; PR #1 e arquivo de migração citado.


## 22/11/2026 — Pré-validação de banco para L2/L3, sem aplicação de migração
- Autorização: continuidade para validação isolada com rollback; sem merge/deploy/gastos. Ferramenta Supabase conectada a somente dois projetos: MakerCusto e Kit Casa Pré LAB. O LAB pertence a outro projeto e não foi utilizado.
- Leitura real no banco MakerCusto `bxtbfdddcxbyaomydgxn`: Postgres 17.12; zero execuções, zero confirmações e zero movimentos de estoque; RPCs `mc_create_print` e `mc_confirm_print` não instaladas. As migrações L1 constam na lista aplicada.
- Verificada a estrutura de oito tabelas operacionais com RLS habilitado; esquema compatível com a migração versionada, sem comprovação de execução da DDL.
- Revisão do L3: validação adicional exige lotes vinculados a item `filament` de unidade `g` e identidade não nula da saída.
- Roteiro `supabase/tests/l2_l3_rollback.sql` criado para **executar somente após instalar a migração em ambiente apropriado**, dentro de transação `BEGIN/ROLLBACK`. Verifica L2 sem baixa, delta L3, replay, payload divergente, saldo insuficiente e usuário sem vínculo. O roteiro foi versionado, **não executado**; não prova concorrência entre sessões nem autenticação por token real.
- Bloqueio explícito: nenhum ambiente de teste isolado MakerCusto disponível entre projetos conectados. Sem aplicação de SQL, transação de teste real ou modificação de dados neste lote.


## 22/11/2026 — Regressão L3, resultado de CI
- O CI anterior #45090668995 foi concluído com `success`.
- Ajustes de segurança no formulário `PrintsWorkspace.tsx`: peças boas/rejeitadas devem ser números inteiros individuais; quantidade incremental não pode exceder o saldo de produção planejado; massas de modelo, purga e perdas limitadas a três casas decimais.
- Em `tests/app.spec.ts`, cenários de retry preservando chave de idempotência e de bloqueio local de deltas inválidos foram adicionados, com REST simulado.
- **CI final funcional:** #45094382511 `success`, commit `9645a86e71314cfeac049fb5a065c4b84964742f`, TypeScript, unitários, build e 86/86 E2E desktop/mobile aprovados: https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45094382511 .
- Não há PostgreSQL local instalado no ambiente de execução; não houve validação SQL de banco. Ainda não aplicar L2/L3 no Supabase operacional, nem tratar P01/P02/G02 como homologadas na implementação.
- Manter branch de trabalho, sem merge, deploy ou alteração de banco.

## 22/11/2026 — L2/L3: PostgreSQL descartável integrado ao CI, SQL testado
- A etapa SQL foi incorporada ao GitHub Actions da branch `feat/fundacao-makercusto`: container PostgreSQL 17 descartável, bootstrap mínimo de `auth` exclusivo do CI, migrações de fundação/L1/L2/L3, oficina/impressora/peça fictícias, execução de `supabase/tests/l2_l3_rollback.sql` e verificação final de ausência de produção persistida.
- **Resultado comprovado:** GitHub Actions #45095409926, `success` para commit `cd1f58729587c279e822d5b972ab9f998ab2bc03`; migração aplicada apenas no banco efêmero do CI; ensaios de criação L2 sem baixa, confirmação incremental L3, replay idempotente, payload divergente, saldo insuficiente, bloqueio de usuário desconhecido e permissão de `anon`; 86/86 Playwright desktop/mobile, tipagem, unitários e build aprovados. https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45095409926
- Os dados usados são **inteiramente sintéticos**; ambiente descartado após CI. Banco Supabase MakerCusto não foi alterado.
- **Limites:** `auth.uid()` foi simulado no banco de testes para chamadas SQL sob administrador; não houve teste E2E com JWT real, matriz RLS entre duas oficinas reais, corrida multi-sessão, confirmação com reserva ativa, produção de estoque acabado ou fechamento/rateio financeiro. L3 permanece implementação parcial, não homologação integral.
- Matriz: S02, R02 e P02 agora classificados **P** por evidência efetiva do fluxo inicial (20 P, 19 A, 0 C), sem alterar as decisões homologadas.

## 22/11/2026 — Regressão de concorrência L3 e isolamento no CI
- Incluído `supabase/tests/l2_l3_concurrency.sh` no CI existente (PostgreSQL 17 descartável), sem acesso ao Supabase operacional.
- **Resultado real:** CI #45095841121 `success` para commit `20dac01db2c3b7889f8586da237bf8f6357d8dac`. Duas sessões confirmaram concorrentemente 7 g cada contra saldo físico de 10 g: **uma confirmou, a outra foi recusada, saldo final 3 g, apenas uma confirmação persistida**.
- Sob identidade sintética diferente, leitura de execuções e de movimentos foi bloqueada (RLS/autorização na simulação PostgreSQL), assim como tentativa de confirmação RPC. O teste SQL reversível anterior continuou aprovado; TypeScript, unitários, build e **86/86 Playwright desktop/mobile** aprovados.
- Evidência: https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45095841121 ; script `supabase/tests/l2_l3_concurrency.sh`.
- **Limites remanescentes:** Supabase real sem migração L2/L3 aplicada; testes não equivalem a login/token JWT reais, nem resolvem reservas ativas, snapshots monetários, estoque de acabados ou encerramento da produção. A classificação continua 20 P, 19 A, 0 C; 39 decisões preservadas.

## 22/11/2026 — Preparação de aplicação controlada L2/L3, SEM ALTERAR O BANCO
- Consulta somente leitura ao Supabase **exclusivamente MakerCusto** `bxtbfdddcxbyaomydgxn`: PostgreSQL 17.12, zero produções, zero confirmações, zero lotes e zero movimentos. Nenhuma RPC L2/L3 nem tabela de eventos instalada. Políticas `SELECT` de produção e estoque restringem a `authenticated` e `mc_member(workspace_id)`.
- Supabase Security Advisor apontou 11 avisos preexistentes de funções `SECURITY DEFINER` acessíveis a `authenticated`. Isso exige revisão contextual, não implica por si só vulnerabilidade comprovada. Documentado no procedimento sem alterar funções existentes.
- Arquivos novos: `supabase/tests/l2_l3_preflight_readonly.sql`, `supabase/tests/l2_l3_postflight_readonly.sql`, `docs/PLANO_APLICACAO_CONTROLADA_L2_L3.md`. O preflight foi **executado em leitura no MakerCusto operacional sem erros** (consulta retorna `[]` sem avisos expostos; não afirmar aviso NOTICE observado). Postflight não foi executado no operacional porque a migração permanece pendente.
- **Validação real em PostgreSQL 17 descartável:** CI #45099111748 `success` (commit `6ab26e701889f152c44c0800e84ee125ace1ac20`). Logs registraram `PREFLIGHT L2/L3 APROVADO`, `POSTFLIGHT L2/L3 APROVADO`, regressão SQL com rollback, duas sessões concorrentes (1 confirmação, 1 rejeição, saldo 3 g), isolamento de identidade sintética, TypeScript, testes unitários, build e **86/86 E2E desktop/mobile**.
- **Decisão operacional:** preparado para eventual autorização específica da aplicação apenas no Supabase MakerCusto; **não aplicado**, sem deploy, merge, dados reais de produção, instalação paga ou custos autorizados. Teste com JWT real e conciliação de reservas/snapshots permanecem pendentes; nenhuma das 39 homologações vira status C.


## 22/11/2026 — L2/L3 instalado no Supabase MakerCusto, após autorização explícita
- O usuário autorizou modificar o banco MakerCusto na mensagem “pode alterar”. Escopo: **exclusivamente** aplicar a migração L2/L3 já versionada, sem merge/deploy.
- Supabase: projeto **MakerCusto** `bxtbfdddcxbyaomydgxn`. Confirmada inexistência da migração; preflight SQL em transação somente leitura passou sem erro.
- **Execução real:** Supabase `apply_migration` respondeu `success: true` para `print_execution_l2_l3`. Registro no histórico do projeto: versão **`20261123022622`**, nome **`print_execution_l2_l3`**. Fonte: `supabase/migrations/20261122212500_print_execution_l2_l3.sql`, blob `914ee07a10bcf41638f623eec576a334837ae968`.
- **Pós-validação real:** `supabase/tests/l2_l3_postflight_readonly.sql` executado sem erros; tabela `mc_production_output_events` e RPCs `mc_create_print`, `mc_confirm_print`, `mc_list_prints` presentes; tabela de deltas com RLS ativo, leitura negada a anon e INSERT direto negado a authenticated. Contagem: **0 produções, 0 confirmações, 0 movimentos de estoque** depois da aplicação.
- **Advisor após mudança:** 14 avisos `authenticated_security_definer_function_executable` (11 anteriores + 3 RPCs novas, aviso genérico a ser analisado considerando verificações internas de autorização); 1 aviso `auth_leaked_password_protection`. Não alterados neste lote. Referência: https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable
- **Limites:** nenhum fluxo operacional com JWT real foi testado, não houve publicação do frontend. L3 é parcial (sem conciliação de reservas ativas, estoque acabado, snapshots financeiros completos e encerramento). Próxima etapa técnica: testes reais de autenticação e autorização sem afetar dados financeiros; habilitação do frontend exige autorização separada.
- **Sem:** merge, deploy, lançamento de bobinas/produções, movimentos reais ou custo pago.

## 22/11/2026 — Verificação incremental de segurança do L2/L3 instalado
- **Supabase MakerCusto em somente leitura:** 1 oficina e 1 membro ativo, com 0 produções, 0 confirmações, 0 movimentos e 0 eventos de saída. Checagem de catálogo/grants: `anon` não executa `mc_create_print`, `mc_confirm_print`, `mc_list_prints`; `authenticated` pode executar as RPCs (a autorização interna verifica vínculo/role); `authenticated` não possui INSERT direto em `mc_production_output_events` e RLS da tabela está ativo.
- Uma consulta com papel `authenticated` e identidade UUID inexistente, em transação somente leitura, não exibiu movimentos. **A base operacional vazia não valida isolamento completo com dados reais; o teste simulou uma identidade, não usou JWT real.**
- **Novo teste CI** `supabase/tests/l2_l3_cross_workspace.sh`: cria segunda oficina, proprietário e produção fictícios no PostgreSQL efêmero; cada membro autenticado sintético vê sua oficina e não pode ler execuções da outra, tanto por RPC quanto por RLS direto na tabela.
- Primeiro CI #45101027589 **falhou devido ao script de teste Bash** (variável `my_ws` não inicializada por sintaxe de declaração); corrigido em `00e79a1c1612cab8eaba0fb6da1102776a99604e`. CI final **#45101156582 success**: SQL rollback, concorrência, isolamento entre duas oficinas, tipagem, testes unitários, build e **86/86 Playwright desktop/mobile**.
- **Sem novas alterações no esquema/dados operacionais**; nenhum merge ou deploy. JWT real, confirmação end-to-end de owner/manager, reservas e custeio continuam pendentes. Estado da matriz permanece 20 parciais, 19 ausentes, 0 completas.

## 22/11/2026 — Incrementos L3: tempo físico e falhas, sem publicação
- A verificação de JWT real contra o Supabase Auth MakerCusto continua pendente: as ferramentas disponíveis não disponibilizam uma sessão do usuário autenticado; não foram criadas credenciais ou contas de teste no banco operacional.
- **L3 UI implementado:** formulário `PrintsWorkspace` agora coleta tempo real **incremental** da confirmação (horas opcionais, precisão até 4 casas, nunca presume duração), adiciona-o ao payload `p_actual_hours`, limpa campo apenas quando o servidor confirma e mantém chave de idempotência em falhas. É possível registrar zero peças boas e peças rejeitadas sem criar unidades boas fictícias.
- **Testes expandidos:** Playwright exercita transmissão e retry do tempo incremental, validação de precisão e confirmação de falha; roteiro SQL reversível testa uma confirmação com uma peça rejeitada, zero boas, 1 g de consumo e 0,5 h de tempo físico acumulado, com saldo por lote correto.
- **CI funcional:** #45101704098 `success`, commit `6ee2ba011bd366fa9202a1000a86a1f9b845323c`: tipos, unitários, build, SQL transacional com rollback, concorrência, isolamento entre duas oficinas e **86/86 Playwright desktop/mobile** aprovados. https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45101704098
- **Sem** migração adicional no Supabase, merge, deploy, produção/estoque reais ou custo pago. L3 continua parcial e sem fechamento/custeio/reservas ativos; preservar as 39 políticas homologadas.

## 22/11/2026 — P01 parcial: reservas lógicas opcionais por bobina
- **Escopo somente branch**: migração complementar `supabase/migrations/20261122235000_print_reservation_p01_partial.sql` preparada e exercitada em PostgreSQL 17 descartável no GitHub Actions. **NÃO APLICADA** ao Supabase MakerCusto operacional; a migração L2/L3 anterior continua instalada.
- `mc_reserve_print_lot`: operação autenticada para owner/manager, bloqueia reserva acima de disponível = saldo físico − reservas ativas, restringe a lote de filamento da própria oficina, serializa por oficina e controla reenvio pela chave idempotente; não altera movimentos físicos; registra auditoria.
- `mc_confirm_print` complementar: a própria ordem pode gastar sua reserva; protege a reserva de outras ordens; reduz apenas o consumo real da reserva própria na mesma transação, mantém a sobra durante confirmações parciais, marca reserva esgotada como `fulfilled`, audita excedentes com origem por lote e preserva replay sem nova baixa. Cancelamento, encerramento definitivo, liberação automática de sobras, ajustes excepcionais e rateio continuam deliberadamente bloqueados.
- `mc_list_print_reservations` retorna reservas da oficina somente ao gestor autorizado. Frontend permite criar reserva opcional em gramas, mostra físico menos reservas e lista reservas ativas; testes Playwright cobrem saldo e retry sem duplicar.
- **Evidência confirmada:** CI #45102955980 `success` para commit funcional `728fa31b0df4b1f7ff41e3fab98c89a92c970b10`: 88/88 Playwright desktop/mobile, TypeScript, unitários e build, SQL regressivo P01 em `ROLLBACK`, concorrência de confirmações, isolamento de oficinas e **P01-F: duas reservas de 60 g simultâneas sobre 100 g, apenas uma aceita; 60 g reservados, 100 g físicos**.
- Na auditoria de aderência, R01 e P01 evoluem de ausente para parcial **apenas na branch e no CI**. Situação corrente **22 parciais, 17 ausentes, 0 completas**; decisões homologadas não foram modificadas.
- **Próxima etapa:** revisar regras faltantes P01 (liberação no encerramento/cancelamento, expiração sinalizada, troca de lote, exceções GAP01) e só depois planejar aplicação separada/expressamente autorizada no Supabase. Sem merge, deploy, dados operacionais ou gastos pagos.


## 23/11/2026 — P01-A/B: cancelamento auditado e prazo opcional de revisão (branch apenas)
- Respeitadas as homologações `docs/HOMOLOGACAO_RESERVAS_P01_2026-11-20.md` e GAP01. O cancelamento definitivo de uma ordem **aberta** libera somente as reservas lógicas ainda não consumidas, preserva confirmacões, peças boas/rejeitadas, tempo físico, movimentos de estoque e custo histórico; **não** devolve ao estoque massa já extrudada.
- Nova migração complementar **não aplicada** ao Supabase MakerCusto: `supabase/migrations/20261123001000_print_reservation_p01_lifecycle.sql`; RPC `mc_cancel_print` exige owner/manager, motivo 10–1000 caracteres, chave idempotente, lock por oficina, auditoria por reserva com `released_g` e auditoria por cancelamento; o replay do mesmo payload não duplica liberação. RPC `mc_set_print_reservation_due` aceita prazo opcional, gera auditoria de alterações e nunca libera reserva por vencimento. RPC de listagem expõe `due_at` e `review_overdue` para alerta.
- UI Impressões: marca revisão vencida como **reserva mantida**; permite configurar ou retirar prazo; cancelamento exige confirmação explícita, resumo dos efeitos e justificativa, com retry idempotente após erro. Nenhuma data, massa ou tempo assumido automaticamente.
- **CI funcional #45104085956 = success**, commit `53a3456c4893bfbee8d64c73b8deb5826f4eec74`, **90/90 Playwright desktop/mobile**, TypeScript, unitários, build, migrações SQL em PostgreSQL 17 efêmero, scripts L2/L3 e P01 com rollback, duas reservas concorrentes, isolamento entre oficinas e **corrida cancelar vs confirmar** (consumo real preservado se confirmado, reserva remanescente liberada).
- Histórico de horas: duração humana **não aferida**; usar apenas timestamps verificáveis se existirem, nunca runtime do CI como tempo trabalhado.
- **Limites:** P01-A concluída **apenas quanto ao cancelamento integral de uma ordem aberta**, sem fechamento definitivo/rateio; P01-B prazo opcional apenas para revisão manual. P01-E (cancelamento parcial), troca de bobina com ajuste explícito, tratamento GAP01 de ocorrências físicas divergentes, fechamento financeiro, JWT real e homologação visual seguem pendentes. Aderência da matriz permanece **22 P, 17 A, 0 C**.
- Sem merge, deploy, aplicação das duas migrações P01 no Supabase real, estoque real ou gastos pagos.


## 23/11/2026 — P01-E cancelamento parcial com saldo por lote explicitado
- **Branch somente:** migração adicional `supabase/migrations/20261123002000_print_reservation_p01_partial_cancel.sql` com RPC `mc_reduce_print_plan`; nenhuma mudança aplicada no Supabase MakerCusto real, sem merge ou deploy.
- Redução explícita de `planned_quantity` somente até o mínimo já confirmado (boas + rejeitadas); não modifica histórico, tempo efetivo ou saídas confirmadas. O operador informa `release_g` por reserva específica e motivo auditável; não existe conversão inventada de peças em gramas. A operação transacional usa lock por oficina e chave idempotente para evitar reenvio duplicado. Impede acesso de não membros, reserva de outra ordem, excesso de liberação, precisão inválida e redução abaixo das peças confirmadas.
- API tipada e formulário de redução parcial incluídos em `PrintsWorkspace` com validações, campos explicativos e retry idempotente; nome acessível do campo novo ajustado para não conflitar com quantidade planejada original.
- **Falha intermediária:** CI #45104928376 falhou em 2 testes Playwright por ambiguidade de seletores entre "Quantidade planejada" e "Nova quantidade planejada". Corrigido em `ab080f0274716c553a1fa150349d9abf8dca025a` e `92e310ed365cae2b25a7ac963da1ca30c4498420`.
- **CI final aprovado:** #45105318775, commit funcional `92e310ed365cae2b25a7ac963da1ca30c4498420`: **92/92 Playwright desktop/mobile**, TypeScript, unitários, build, migração PostgreSQL 17 efêmera, testes P01-E de rollback, idempotência, auditoria, autorização, corrida cancelar/confirmar, concorrência de reservas e isolamento multi-oficina. https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45105318775
- **Limites ainda abertos:** troca de bobina P01-D com gerenciamento explícito das reservas, GAP01 ocorrências físicas discrepantes e conciliação excepcional, cancelamento parcial de múltiplas saídas em uma só operação UI, encerramento definitivo com custeio, JWT real e homologação visual. **Matriz inalterada: 22 P, 17 A, 0 C.**


## 23/11/2026 — P01-D: troca atômica de bobina com custo histórico por lote (somente branch)
- **Política homologada preservada:** `docs/HOMOLOGACAO_RESERVAS_P01_2026-11-20.md` (P01-D), além de RES, P01-F e GAP01. Implementação **parcial**, sem aplicar no Supabase operacional. Banco real mantém L2/L3 anterior, mas ainda NÃO tem as migrações complementares P01 (incluindo troca).
- Nova migração preparada: `supabase/migrations/20261123003500_print_reservation_p01_lot_swap.sql`. RPC `mc_swap_print_reserved_lot` somente owner/manager, lock transacional por oficina, idempotência com auditoria e payload, valida saldo físico menos reservas da bobina nova, não permite tomar reserva de outra ordem, aceita liberação parcial explícita de origem e nova reserva em gramas explicitados. **Não altera movimentos físicos nem preços históricos**; preços são snapshots por `lot_id` nas confirmações `mc_confirm_print` existentes.
- UI `PrintsWorkspace`: formulário de troca de bobina reservada, com reserva de origem, bobina substituta, gramas a liberar e a reservar separadamente, justificativa e texto explicativo; API tipada em `src/data/supabase.ts`. Reenvios após falha conservam a chave idempotente.
- Testes `supabase/tests/p01_lot_swap_rollback.sql` e `supabase/tests/p01_lot_swap_concurrency.sh` no PostgreSQL 17 efêmero: lote A 180 g com snapshot **R$0,068/g**, lote B 120 g com **R$0,073/g**; registros separados, valor histórico total do material **R$21,00** apenas no cenário sintético, sem mudar snapshots antigos. Troca não baixa fisicamente, auditoria não duplica, reenvio com payload divergente é recusado; duas trocas concorrentes tentando a mesma reserva dão **uma aprovada e uma negada**, sem baixa.
- **CI final #45107132919 `success`**, commit `01ec36ecfa8698e985fe1cd8a8303a144589aeee`: **94/94 Playwright desktop/mobile**, TypeScript, unitários, build, regressão SQL, concorrência em reservas e confirmacões e isolamento multi-oficina. https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45107132919
- **Falhas intermediárias corrigidas:** CI #45106352786 e #45106702737 falharam em dois testes Playwright antigos porque a nova caixa de seleção tem nome parcialmente semelhante ao campo preexistente. Restringidas duas consultas de teste ao nome exato em `455d933fbf84f2085a1b5b740597362a9d1c88e5` e `01ec36ecfa8698e985fe1cd8a8303a144589aeee`. Sem falha de esquema ou transação demonstrada.
- **Pendências:** P01 ainda parcial; migrações P01 não aplicadas no Supabase operacional; autenticação JWT real, GAP01 de ocorrência física divergente, aprovação de regularização, fechamento/rateio monetário L4 e homologação visual. A matriz continua **22 P, 17 A, 0 C**.
- Sem merge, deploy ou alteração/produção/estoque real.


## 23/11/2026 — GAP01-A: registro de ocorrência física independente de baixa (somente branch)
- Base homologada: `docs/HOMOLOGACAO_CONCILIACAO_EXCEPCIONAL_GAP01_2026-11-20.md` e políticas P01/P02/P08/P09; preservadas as 39 decisões. GAP01 segue **parcial**, ainda sem regras homologadas de aprovação extraordinária.
- Migração criada **somente na branch**: `supabase/migrations/20261123005500_gap01_physical_occurrences.sql`. Tabela `mc_physical_consumption_occurrences` registra oficina, impressão, material, massa observada (g até 3 decimais), fonte, data/hora física informada, possível bobina (opcional), referência de evidência, possível origem (não comprovada), autor, estado `registered` e chave idempotente. **Não cria item/lote, não baixa estoque, não aprova ajuste nem insere snapshot financeiro**. A tabela usa RLS por oficina e INSERT/UPDATE/DELETE diretos revogados; RPCs de registro e listagem verificam owner/manager e identidade ativa.
- Interface `PrintsWorkspace`: formulário GAP01 com seleção de impressão, nome do material, quantidade física, data e hora obrigatórias, fonte, possível bobina, evidência e origem, mais lista de ocorrências pendentes. O formulário não supõe horário, origem ou custo e não faz movimentações. API tipada em `src/data/supabase.ts`.
- Teste SQL reversível `supabase/tests/gap01_occurrence_rollback.sql` cobre o cenário **100 g observados e 80 g contabilizados**, com registro aceito e saldo preservado, custo desconhecido sem estimativa, origem sem lote, auditoria única, replay idempotente, payload divergente recusado, quantidade/precisão/futuro inválidos, outro usuário/oficina bloqueado e permissões restritas.
- **CI funcional #45108226913 SUCCESS** (commit `d94edd1a4deba1dc4f90c0d9aaa649c6fb15b7fa`), `96/96` Playwright desktop/mobile e todos os testes SQL, segurança, concorrência, tipagem, unitários e build: https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45108226913 .
- **Falha intermediária corrigida:** #45107869160 falhou em dois testes Playwright por expectativa textual com capitalização/frase diferente da mensagem real; corrigido em `d94edd1a4deba1dc4f90c0d9aaa649c6fb15b7fa`. Banco e regressões SQL já estavam aprovados.
- **Pendências GAP01:** investigar causas com evidências verificáveis (B), proposta de inventário corretivo sem execução automática (C), proteção transacional do processo de regularização (D), estornos vinculados (E), acompanhamento de estados sem aprovação automática (F), papéis/aprovadores e critérios de evidências ainda não homologados. CI isolado NÃO equivale a JWT real ou homologação visual; migrações P01 e GAP01 ainda não aplicadas no Supabase operacional. **Matriz 22 P, 17 A, 0 C**.
- Sem merge, deploy, qualquer alteração no banco operacional ou consumo físico/financeiro reais.


## 23/11/2026 — GAP01-B/F: investigação não destrutiva e acompanhamento por eventos
- **Somente branch**, sem instalação no Supabase operacional. Migração `supabase/migrations/20261123014500_gap01_investigation_tracking.sql` adiciona `mc_physical_occurrence_reviews`: eventos apensados por ocorrência e oficina, cada um com hipótese (`unrecorded_input`, `lot_change`, `quantity_error`, `other`, `unknown`), relato, evidência opcional, bobina sob investigação opcional, autor, status anterior/novo e chave idempotente. A evidência original da ocorrência GAP01-A permanece intacta.
- Estados de acompanhamento transacionais: `registered → under_review → pending_decision → under_review` (reabertura para análise). **Não existe** estado de regularização nem caminho de aprovação nesta etapa; causas são hipóteses até apuração, sem aceitar evidências como automaticamente suficientes. Controle de acesso por `mc_members` ativo com papéis owner/manager; tabela read-only com RLS, RPCs de gravação/listagem restritas e auditoria por evento. Nenhum movimento físico, reserva, custo ou confirmação é modificado.
- UI `PrintsWorkspace` e API tipada `src/data/supabase.ts`: selecionar ocorrência, registrar hipótese/relato/evidência/possível lote, controlar transição, visualizar histórico cronológico. Retry com mesma chave, sem duplicar investigação.
- **CI #45113967113 `success`** no commit funcional `926ef0f9eb6da8a246867b7a28f968af18f76d15`: **98/98 Playwright desktop/mobile**, tipos, testes unitários, build, SQL transacional com ROLLBACK, concorrência, isolamento multi-oficina. O roteiro `supabase/tests/gap01_investigation_rollback.sql` comprovou 3 transições auditadas, origem original preservada, nenhum movimento/custo, replay idempotente e recusa de usuário estranho, hipótese de lote inexistente, status inválido, chave divergente. https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45113967113
- **Pendências:** GAP01-C proposta de inventário corretivo com causas verificáveis e sem ajuste, GAP01-D/E efetiva conciliação e eventos compensatórios vinculados, critérios de evidência/autorizações extraordinárias (não homologados), encerramento financeiro/custo desconhecido, JWT real, homologação visual e migrações P01/GAP01 ainda não aplicadas no Supabase. GAP01 continua parcial; **22 P, 17 A, 0 C**. Nenhum merge/deploy.


## 23/11/2026 — GAP01-C: propostas verificáveis sem execução financeira ou física
- **Escopo na branch somente**, sem merge/deploy ou aplicação no Supabase operacional. Política documental GAP01-C e demais decisões homologadas preservadas; critérios de evidência suficiente e aprovadores extraordinários ainda **não homologados**, portanto nenhuma aprovação/execução foi implementada.
- Migração `supabase/migrations/20261123110500_gap01_inventory_adjustment_proposals.sql`: tabela `mc_inventory_adjustment_proposals` e RPCs `mc_propose_inventory_adjustment` e `mc_list_inventory_adjustment_proposals`. Proposta vinculada a ocorrência **já investigada**, bobina real da oficina, delta explícito em g com sinal, origem, motivo, evidência, autor, chave idempotente e estado fixo `pending_decision`. RLS SELECT por oficina, escrita apenas via RPC verificada para membro ativo owner/manager; DELETE/UPDATE/INSERT diretos revogados. Sem RPC de aprovação, execução, inventário, movimentação física ou custeio.
- UI `PrintsWorkspace`: formulário de proposta, mensagem que nenhum ajuste é executado, validação de material e evidências e lista de propostas pendentes; API tipada `src/data/supabase.ts`. Retry mantém chave idempotente.
- **CI funcional #45190758841 `success`** para commit `edc9bd898422d476d152298c8654aa4e022b5110`: **100/100 Playwright desktop/mobile**, tipos, unitários, build, SQL transacional em PostgreSQL 17 descartável, regressões e concorrência/reservas/isolamento. Teste `supabase/tests/gap01_inventory_proposal_rollback.sql` comprovou hipótese de **50 g propostos para bobina com 80 g**, permanecendo **80 g físicos**, sem custo, movimentação, alteração de ocorrência ou aprovação, mais auditoria única, replay, payload divergente recusado e permissões restritas. https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45190758841
- **Pendências:** análise/validade de evidências, papéis e critério de aprovação excepcional (ainda exigem homologação separada); GAP01-D/E conciliação transacional e estornos vinculados, custeio/fechamento, JWT real e validação visual. Migrações P01/GAP01 ainda não aplicadas no Supabase real. Matriz **22 P, 17 A, 0 C**.


## 23/11/2026 — GAP01-D/E: dossiê de análise não destrutiva, sem ação de estorno
- **Escopo:** migração somente na branch `supabase/migrations/20261123112000_gap01_reconciliation_dossier.sql`, sem aplicação ao Supabase real, merge ou deploy. Regras homologadas GAP01/P01/P09 preservadas. Critérios de aprovação extraordinária, evidências suficientes e autorização continuam pendentes.
- RPC `mc_get_physical_occurrence_dossier(workspace_id,occurrence_id)` é consulta `STABLE`, somente gestor ativo da própria oficina, com `SECURITY DEFINER` e verificação explícita de membro. Apresenta: ocorrência, bobina possivelmente utilizada (**não verificada**), saldo atual do lote, reservas próprias e alheias, disponível físico menos reservas, linhas históricas de consumo da impressão com IDs da confirmação e consumo, massas e `unit_cost_snapshot` original; histórico de investigação e propostas não aprovadas. Restringe EXECUTE de anon. Sem lote conhecido, devolve saldos `null`, sem inventar origem/valor.
- A apresentação informa `read_only_current_state`: saldos são **fotografia atual, não promessa de disponibilidade futura**; a mera coincidência de lote e impressão não prova causalidade. A consulta não verifica devolução física, dependências posteriores nem residual reversível: campos de quantidade reversível e ajuste monetário `null`; aprovação `not_available`; nenhum ajuste automático, compensação, baixa física, mudança de reservas ou evento financeiro.
- UI `src/components/PrintsWorkspace.tsx` adicionou seleção e visualização exclusiva do dossiê, reservas de outras ordens, preços históricos por linha, propostas pendentes e mensagens impeditivas. Tipo/API em `src/data/supabase.ts`; Playwright com RPC simulada verifica leitura e ausência de ações mutáveis.
- **CI #45194048555 `success`** para commit funcional `f030c58467ccbc2189f94555b142ee77474c6fb3`: **102/102 Playwright desktop/mobile**, TypeScript, unitários, build, regressão SQL `supabase/tests/gap01_dossier_rollback.sql` em PostgreSQL 17 descartável, concorrência e isolamento. Cenário sintético: 80 g originais, 15 g consumidos e 65 g físicos, reservas 5 g próprias e 10 g de outra ordem (15 g totais, 50 g não reservados); histórico de custo de 0,064 unidade monetária/g, proposta +20 g ainda pendente. Nenhuma movimentação ou auditoria gerada pela leitura. Evidência: https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45194048555
- **Próximo passo:** desenhar e homologar separadamente critérios de evidência, papéis e limites para eventual correção/estorno P09 e GAP01; não habilitar tais operações sem autorização explícita. GAP01 ainda parcial; matriz **22 P, 17 A, 0 C**.


## 23/11/2026 — proposta de homologação de aprovações excepcionais GAP01/P09 (NÃO HOMOLOGADA)
- Documento criado em branch: `docs/PROPOSTA_HOMOLOGACAO_APROVACOES_EXCEPCIONAIS_GAP01_P09.md`, commit `29b5f0d8cf6c2fe302b8a94e7b8c83fe652836eb`.
- Foram confrontadas as normas existentes GAP01-A–F, GAP02-A–F, P01/P02/P08/P09, o dossiê consultivo e a matriz oficial. **Nenhuma decisão original foi alterada e as 39 homologações permanecem as mesmas.**
- A proposta distingue operação ordinária, exceção documental E1, exceção de alto risco E2 e hipóteses bloqueadas. Define critérios documentais por causa, confiança em três níveis, segregação entre solicitação/aprovação/execução, limites exemplificativos E1 **50 g E 5% E R$50** (todos **não aprovados**), gestor somente com alçada delegada, operação individual com dupla confirmação e auditoria reforçada, e transação/segurança obrigatórias antes de qualquer futura execução.
- **Pontos que exigem homologação expressa:** provas mínimas e confiança, valores/limites de E1, tratamento de E2, alçadas de proprietário/gestor, exceção para oficina individual, fluxo separado de aprovação/execução e proibições não contornáveis.
- Revisão documental confirmada por releitura do arquivo (seções 1–8); **nenhum teste de código ou SQL foi realizado neste lote**, pois nenhum código foi alterado. CI anterior de GAP01-D/E #45194048555 permanece a última evidência funcional, **não** valida esta proposta.
- **Pendência:** homologação documental do proprietário; não implementar ações de aprovação/estorno extraordinário antes disso. Sem merge, deploy, alteração no Supabase operacional ou consumo de créditos.


## 23/11/2026 — UX orgânica e divulgação progressiva
- Direção do usuário preservada em `docs/PADRAO_UX_SIMPLES_DETALHES_AVANCADO.md`: padrão **Escolher/Cadastrar/Detalhes/Avançado**, com opções extras por campo, simplicidade inicial e recursos técnicos completos por demanda. Aplicar transversalmente a filamentos, impressoras, peças, conjuntos, calculadora e produção; dados cadastrados devem transitar sem redigitação. **Padrão documentado não equivale a implementação completa.**
- Correção verificada: `ProductSavePanel` estava escondido para usuário logado; salvar cálculo agora aparece no módulo Custos, com navegação para catálogo/conjuntos. Recuperação de cálculo previamente salvo usa parâmetros originais, sem reescrever snapshot.
- Migrações **somente na branch**: `20261123123500_component_linked_assemblies.sql` (conjunto vincula peças ou produtos existentes por ID e congela nomes/custos por revisão, sem duplicar) e `20261123125000_reuse_saved_calculations.sql` (recuperação de parâmetros). Não presumir rateio da mesma placa com peças diferentes.
- CI #45208428395 `success` no commit `963081a6571eb6a518827f65b255aa3bc8a943de`: **108/108 Playwright**, SQL reversível de guirlanda + estrela grande + pequena com 3 IDs e histórico preservado, tipo, unitários, build, concorrência e isolamento. https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45208428395
- Pendências: implementar componente UX progressivo real para filamento e campos de outros módulos; integração completa de perfis e custo de placas mistas; autenticação e homologação visual; migrações ainda não aplicadas no Supabase operacional. Sem merge ou deploy. Matriz não reclassificada (última: 22 P, 17 A, 0 C).


## 23/11/2026 — Integração orgânica entre módulos (diagnóstico)

- Auditoria estática atual da branch: `docs/AUDITORIA_INTEGRACAO_MODULOS_2026-11-23.md`.
- HEAD examinado: `8598a6cd4fbda4ab1fcd78fb64be74fd31e26bd7`; CI #347 aprovado (workflow 45209805896). Após os commits documentais, consultar CI novamente.
- Código já implementa `saveCalculatedProduct`, seletor de peça cadastrada em `ProductWorkspace` e saídas múltiplas em `PrintsWorkspace`. A ausência percebida no Preview **não demonstra ausência no HEAD**; verificar implantação e workspace.
- Lacunas confirmadas: ficha de peça sem edição integrada de parâmetros produtivos; retorno contextual da ficha para a calculadora; fluxo guiado para custos e outputs de uma placa mista.
- Prioridade: validar discrepância Preview/HEAD; integrar ficha ↔ calculadora ↔ conjunto preservando snapshots, sem baixa de estoque; depois melhorar mesa mista sob regras L2/L3.
- Nenhuma mudança funcional ou no banco nesta rodada documental. Preservadas homologações e proibições de merge/deploy sem autorização.


## 23/11/2026 — Primeiro vínculo funcional Ficha → Calculadora

- Código atualizado: `src/components/ProductWorkspace.tsx` permite abrir na calculadora o snapshot mais recente do cadastro selecionado, usando `listSavedCalculations`, filtragem por `product_id` e ordenação por `saved_at`. Registro sem snapshot não inventa dados nem cria vínculos fictícios.
- `src/App.tsx` reutiliza `applySavedCalculation` e somente muda para o módulo Calculadora quando os parâmetros passam pela validação. O histórico permanece inalterado; o fluxo é **reutilização para novo cálculo**, não edição/atualização do produto existente.
- Commits funcionais: `7c3f1e6`, `43c74a7`, `986ec69`. Sem migração, banco, merge ou deploy.
- Pendências: CI do HEAD funcional, E2E do fluxo autenticado, pré-preenchimento da ficha ao gerar novo snapshot e vínculo de atualização com confirmação; integração de conjunto e placa mista. Nenhuma dessas pendências deve ser apresentada como concluída.


## 23/11/2026 — Revisão de cálculo vinculada ao cadastro (fase estrutural)

- Implementação em branch: calculadora mantém vínculo explícito com a ficha selecionada e exibe opção para criar revisão no mesmo cadastro ou salvar como novo. Ação de reiniciar cálculo e salvamento bem-sucedido removem o vínculo para evitar associação acidental.
- Nova migração **preparada mas NÃO aplicada ao Supabase operacional**: `supabase/migrations/20261123152000_append_product_calculation.sql`, RPC `mc_append_product_calculation` com verificação de membro autorizado, bloqueio de registro, chave de idempotência, nova revisão e snapshot imutável, sem duplicar `mc_products`. Atualiza preço de venda explicitamente submetido; conserva identidade, nome e SKU.
- Teste SQL `supabase/tests/product_calculation_revision_rollback.sql`, incluído no workflow de PostgreSQL efêmero. Cobre cadastro único, histórico, tentativa duplicada, permissões, dados inválidos e seleção da revisão mais recente.
- Atenção: o **Preview existente não tem a nova RPC**; NÃO publicar frontend enquanto migração ainda não aplicada e validação não autorizada. Executar CI e homologar antes de definir aplicação ao banco de teste e deploy manual.
- Ainda pendentes: CI do novo HEAD, E2E autenticado em navegador, rateio de peças distintas na mesma placa e conexão completa ao conjunto; nenhuma mudança física de banco ou deploy nesta etapa.


## 23/11/2026 — Padrão de ação fixa e destaque do nome do produto (UX)

- Requisito do proprietário: em cada área do sistema, ações vinculadas ao formulário ativo devem permanecer visíveis mesmo com rolagem. Preferência definida para **rodapé contextual fixo**, com comportamento responsivo, sem repetir botões dispersos.
- Implementado componente reutilizável `src/components/FormActionDock.tsx`. Primeira aplicação nos formulários `ProductWorkspace` (ficha, criação, edição) e `ProductSavePanel` (calculadora autenticada).
- Nome do produto/peça/conjunto aparece em destaque grande na ficha em edição, com atualização durante digitação; na calculadora autenticada, campo Nome do produto foi movido à barra fixa para permitir nomear e salvar sem procurar formulário distante.
- Barra considera menu lateral expandido/recolhido, mobile, safe-area e reserva espaço inferior. Modal continua sobre a barra. Não foi adotado `position:fixed` diretamente para botões de linha de composição ou ações secundárias internas (adicionar/remover peça), que permanecem contextualizados na linha.
- Testes E2E existentes ampliados para presença da barra fixa e nome destacado; **CI do HEAD precisa ser confirmado**. Homologação visual desktop/mobile pelo proprietário pendente.
- Próxima aplicação do padrão: fluxos de Impressões, Materiais e outros formulários operacionais, sem mudar automaticamente ações de linha/lista nem publicar sem validação. Sem merge/deploy ou banco.

## 23/11/2026 — Continuidade da padronização de ações

- CI #373 do HEAD anterior falhou exclusivamente em E2E por ambiguidade de seletor: o texto “Chaveiro Galo” passou a aparecer na ficha e no dock, conforme UX solicitado. O seletor do teste foi corrigido para o título da ficha (commit `91082fea`); não é evidência de falha funcional.
- `src/components/MaterialsWorkspace.tsx`: ações Inventariar/Cancelar transferidas para `FormActionDock` somente quando o formulário está aberto; mantidos validação e idempotência da gravação.
- `src/components/PrintsWorkspace.tsx`: ações principais Registrar impressão, Registrar reserva e Confirmar consumo incremental usam dock contextual ligado à seção ativa por foco/clique. Sem alterar chamadas RPC ou regras de estoque. Em operações avançadas da mesma tela o dock das três ações principais é ocultado ao receber foco/clique, evitando executar ação de outro formulário.
- Limite conhecido: ações avançadas (GAP01, troca de bobina, redução, cancelamento, dossiê e revisão de prazo) ainda usam botões próximos aos próprios formulários. **Padronização global completa ainda pendente**; requer um controlador de ações por formulário e testes específicos de operações críticas.
- CI posterior e verificação visual responsiva pendentes nesta edição. Sem merge, deploy ou alterações de banco.


## 23/11/2026 — Barra de ações avançadas em Impressões

- Verificação inicial: CI #378 (GitHub Actions run `45263293703`) concluída com **sucesso**; o conjunto anterior de componentes e testes E2E passou.
- Implementação em `src/components/PrintsWorkspace.tsx`: a mesma barra reutilizável `FormActionDock` agora atende os formulários avançados de **prazo de revisão da reserva, ocorrência física GAP01, investigação de ocorrência, proposta de inventário, dossiê de conciliação, troca de bobina reservada, redução parcial e confirmação de cancelamento de impressão**, além das três operações já existentes.
- Contexto ativado pelo foco/clique no formulário correspondente; seções compostas (reserva + prazo, ocorrência + investigação) distinguem ações do subformulário. Ao selecionar “Cancelar impressão”, contexto do rodapé passa explicitamente para confirmação de cancelamento, com opção de voltar sem cancelar.
- Preservadas as condições de desabilitar cada ação, chamadas já existentes, chaves de idempotência, regras de estoque e impossibilidade de aprovação ou ajuste no dossiê. Sem refatoração de SQL/backend.
- E2E reforçado em `tests/app.spec.ts` para presença do dock correto e ausência de ação alheia em fluxos de revisão de prazo, cancelamento, registro de ocorrência, investigação, proposta, dossiê, troca de bobina e redução.
- **Pendente:** CI do HEAD atualizado e homologação visual nos tamanhos desktop/mobile; publicação/migração operacional continuam proibidas sem autorização específica.

## 23/11/2026 — Contrato explícito de responsabilidades na entrega

- O usuário pediu remover ambiguidades de “próxima ação”: tarefas de implementação, CI, diagnóstico, correção, testes, documentação e conferência do repositório pertencem ao agente; o usuário **somente executa deploy manual e homologação visual**, quando o agente indicar expressamente que a versão está pronta.
- Toda resposta técnica termina com instrução inequívoca **“NÃO FAÇA O DEPLOY AINDA”** (pendências técnicas) ou **“PODE FAZER O DEPLOY MANUAL”** (CI completo aprovado, commit exato indicado e lista objetiva do que verificar). Nunca transferir a verificação do CI ao usuário.
- Diagnóstico do CI #382: E2E falhou em seis cenários duplicados desktop/mobile porque seleção programática nos campos não disparava foco/clique capturado; o dock não era ativado. A causa e o erro foram identificados pelos logs; não foi um erro de SQL ou build.
- Correção: acionar o formulário ativo também via `onChange` nos seletores principais de Impressões e operações avançadas, mantendo foco/clique como alternativa de interação.
- Referência da correção: commit `79817b0cfe64f79a09742430691ca054edd2f767`; CI correspondente #383 em andamento no momento deste registro. A aplicação de SQL no Supabase operacional e publicação permanecem não autorizadas.

## 23/11/2026 — Contrato permanente inserido no AGENTS.md

- Por solicitação expressa do proprietário, a divisão de responsabilidades e os dois comandos de deploy foram promovidos a **regra obrigatória de leitura em novos chats** em `AGENTS.md`, seção “Regra obrigatória de comunicação e responsabilidades”. Isto complementa o registro cronológico anterior e evita depender da memória da conversa.
- Padrão de próxima ação: **“Minha ação (agente)”** e **“Sua ação (usuário)”**, sendo explícito **“Sua ação: nenhuma”** quando não houver intervenção requerida. Conferir CI, analisar logs, corrigir código e testar pertencem ao agente. Somente indicar deploy manual ao proprietário após CI integral aprovado no mesmo SHA, com link e itens de homologação.
- Nenhuma autorização para deploy, merge, produção ou alteração de banco foi inferida desta solicitação documental.


## 23/11/2026 — L4 fase inicial: motor P05/P06 e prévia local conectada a Impressões

- **Fonte normativa:** `docs/HOMOLOGACAO_RATEIO_P05_2026-11-20.md` e `docs/HOMOLOGACAO_PRECISAO_P06_2026-11-20.md`. Nenhuma nova fórmula automática foi homologada ou presumida.
- Criado `src/domain/print-allocation.ts`: motor puro sem efeitos colaterais que recebe explicitamente custo, categoria, origem/versão, método direto ou compartilhado, base por destino e justificativa. Decimal exato em `BigInt`, fechamento positivo half-up por categoria, maior resto de centavos e desempate por ID; soma por destino = soma das categorias. Purga/perda separadas exigem indicação para evitar dupla soma; destino rejeitado/retrabalho não é transferido automaticamente a peças boas.
- Criado `src/domain/print-allocation.test.ts`: casos de guirlanda e duas estrelas na mesma mesa, categorias diretas e compartilhadas, empate em centavos, meia unidade de centavo, rejeitos, validações e conservação de valores.
- Criado `src/components/PrintAllocationPreview.tsx` e integrado em `PrintsWorkspace.tsx`: selecionar impressão existente, listar separadamente saídas boas e rejeitadas confirmadas, declarar custo total, fonte e base por categoria, testar rateio local e consultar conciliação de centavos. Sem persistência, sem snapshot financeiro confirmado e sem alteração de estoque. A interface informa claramente **SIMULAÇÃO NÃO SALVA** e que categorias não fornecidas permanecem pendentes.
- Criado teste Playwright para selecionar impressão com guirlanda + estrela grande + estrela pequena, distribuir R$10,00 por três bases declaradas e exigir ausência de RPC transacional.
- **Limites deliberados:** não há leitura automática de custos reais de lotes e energia para L4, não há snapshot imutável financeiro persistido, custo de tempo/máquina ainda depende de dados de origem. Não considerar L4 fechada nem permitir encerramento definitivo da execução. O mecanismo puro é base para ligação posterior com snapshots/consumos reconciliados.
- **Pendências:** CI do HEAD, demais fluxos integrados, testes JWT reais, política operacional de snapshots e homologação visual. Sem merge, deploy ou aplicação de SQL em banco operacional.

- **CI após implementação L4:** run #396 (`45273610045`) **concluído com sucesso** no commit `a15ce4c6d9c08c0b1744be0a8a009bc818ffce3e`: tipagem, Vitest, build, regressões SQL isoladas, concorrência/RLS e Playwright desktop/mobile. Link: https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45273610045 . Esta verificação não é homologação visual nem autoriza fechamento financeiro L4.


## 23/11/2026 — L4-R01: fontes de custo reais sem conclusão financeira

- **Investigação do código e banco:** `mc_confirm_print` registra `mc_production_consumption` por bobina, com massas separadas de modelo, purga e perda, e preço unitário histórico `unit_cost_snapshot` com **6 casas decimais**. A informação é rastreável, mas não satisfaz sozinha o fechamento monetário exato P06 nem a atribuição de consumo total às peças da mesma mesa.
- **Implementado na branch:** migração `supabase/migrations/20261123190000_l4_consumption_sources_readonly.sql`, função autorizada `mc_get_print_consumption_sources(workspace,execution)` de **consulta somente leitura**. Exige membro ativo `owner/manager`, verifica execução na oficina, retorna lotes, confirmação, custo conhecido/estimado/desconhecido, quantidades e valores indicativos de modelo/purga/perda, preservando `null` quando o custo de origem é desconhecido.
- **Interface:** `PrintAllocationPreview` consulta as fontes ao selecionar a impressão e permite reutilizar valor indicativo por categoria sem alterar o valor importado; o operador ainda deve declarar destinos e bases P05. É proibido somar novamente a mesma origem histórica/categoria. Fonte unknown permanece pendente; valor '0' não substitui desconhecido. A prévia não tem gravação de custos, alterações de estoque ou encerramento.
- **Qualidade:** `supabase/tests/l4_consumption_sources_rollback.sql` confirma cálculo, ausência de custo desconhecido, isolamento de oficinas e nenhuma escrita na consulta; workflow CI atualizado para carregar migração e teste após fixture. E2E de mesa com guirlanda + duas estrelas ampliado com leitura histórica e importação em prévia sem RPC transacional.
- **Impedimento conhecido:** a origem `unit_cost_snapshot` é truncada/arredondada a 6 casas no registro L3; a UI marca custo como *indicativo* e não conclusivo. Para L4 final é necessário snapshot financeiro P06 de origem exata e reconciliação de todos os custos e destinos (sem novos totais fictícios). A migração está **somente no GitHub** e não foi aplicada ao Supabase operacional.
- **Estado desta anotação:** CI da implementação em verificação; sem merge, deploy, migração operacional ou créditos.

- **Verificação concluída:** CI #406 (`45276261898`) do commit `576dd4bede1b3f46966efde1da2889ecf2aec9d1` **aprovado integralmente**, incluindo migração read-only, regressão SQL L4, Vitest, build, concorrência/RLS e Playwright desktop/mobile. Evidência: https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45276261898 . **Não** equivale a deploy nem a homologação de custos L4 final.

## 23/11/2026 — L4-F: distinção entre rateio matemático e snapshot financeiro

- CI #408 da entrega L4-R01 foi confirmado aprovado; a branch de integração atual continua sem deploy/migração operacional.
- Criado `src/domain/print-financial-draft.ts` com `preparePrintFinancialDraft`: sobre o motor P05/P06 existente, produz **somente** `l4-financial-draft-v1`, sempre `pending_financial_close` e `financialSnapshot=null`, mesmo quando a soma das categorias bate em centavos. Não cria snapshot definitivo.
- Diagnósticos: histórico indisponível, custo de bobina desconhecido/estimado, preço de confirmação L3 limitado a seis decimais, consumo de modelo/purga/perda sem linha atribuída, fonte duplicada ou desconhecida, origem manual não comprovada e categoria relevante declarada mas não informada. Nenhuma regra usa zero para substituir custo desconhecido nem distribui perda automaticamente a peças boas.
- `src/components/PrintAllocationPreview.tsx` usa o diagnóstico no cálculo e mostra **Fechamento financeiro: PENDENTE**, contagem de categorias históricas atribuídas e motivos verificáveis. Continua sem persistir o rascunho.
- Criados testes unitários `src/domain/print-financial-draft.test.ts` e reforço E2E em `tests/app.spec.ts` para cobertura, precisão histórica e custo desconhecido.
- Contrato futuro documentado em `docs/L4_CONTRATO_SNAPSHOT_FINANCEIRO.md`: origem congelada exata, categorias, bases e resíduos conciliados, imutabilidade, trilha P09, autorização/concorrência e impeditivos antes de qualquer fechamento; documento **não** autoriza SQL físico nem migrações de produção.
- **Pendências reais:** fonte original imutável com precisão P06, dados P07 completos, categorias de custo auditáveis, transação de fechamento, RLS/idempotência e testes de estorno/concorrência, além de homologação visual. Não aplicar o SQL existente ao banco operacional nem publicar enquanto houver pendências.

## 23/11/2026 — L4-P06: origem financeira exata congelada na confirmação (branch, sem migração operacional)

- Revisados `AGENTS.md`, README, arquitetura, padrões, homologações P05/P06/P09 e os esquemas físicos existentes. CI anterior #414 aprovado para `ea9494412d17dd2ff069ccea5f328e003538adb1`.
- **Nova migração somente no GitHub:** `supabase/migrations/20261123200000_l4_exact_origin_capture.sql` cria `mc_l4_exact_consumption_origins` e um trigger `AFTER INSERT` em `mc_production_consumption`. Cada nova confirmação conserva **identificadores, estado de custo, quantidade-base do lote, custo total original, massas por categoria, origem e instante**, sem calcular preço unitário arredondado antes do consumo. A razão original de preço é mantida como numerador/denominador decimal.
- Registros antigos não são retroativamente preenchidos com o preço atual; RPC somente leitura `mc_get_l4_exact_origins` identifica `historical_rows_without_capture` e impede pressupor proveniência histórica.
- Proteções: origem append-only com trigger que bloqueia UPDATE/DELETE, nenhuma permissão direta para anônimo/autenticado, RPC limitada a owner/manager ativos da oficina e validação da execução. Nenhum movimento de estoque, snapshot financeiro final ou fechamento é criado pelo mecanismo de consulta.
- **Motor reutilizável:** `src/domain/decimal-exact.ts` compartilha aritmética decimal/racional sem Number com o rateio, e `src/domain/l4-exact-origin.ts` calcula custos por modelo/purga/perda a partir da razão original, sem arredondar precocemente. Resultado é **indicativo**; bobinas sem valor permanecem `null`, estimadas ficam marcadas como estimadas.
- **Testes:** `supabase/tests/l4_exact_origin_rollback.sql` cobre confirmação idempotente, custo de origem congelado, sem preço, isolamento por oficina, imutabilidade e permissões; `src/domain/l4-exact-origin.test.ts` cobre razões periódicas, subcentavos, null e entradas inválidas. Workflow CI inclui migração/teste em PostgreSQL efêmero.
- **Limites ainda ativos:** a API de prévia L4 mantém a leitura L3 indicativa; a nova proveniência exata precisa ser vinculada à conciliação final por categoria e às demais fontes P07. Não existe fechamento financeiro transacional validado nem autorização para publicar custos definitivos. L4 permanece pendente, banco operacional intocado, sem merge/deploy.

- **CI #424 integralmente aprovado:** GitHub Actions `45285101720` em `3bc75c41b4feb2c8d3be71543a1d347542d888d4`, abrangendo tipagem, Vitest (inclusive razões decimais exatas), build, novas regressões PostgreSQL L4, concorrência/RLS e Playwright desktop/mobile. Evidência: https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45285101720 . Não significa fechamento financeiro transacional concluído, publicação ou homologação visual.

## 23/11/2026 — L4-G01: revisão de fechamento transacional pendente (sem contabilização)

- Conferidos `AGENTS.md`, `docs/CONTINUIDADE.md`, homologações P05/P06/P09, tabela histórica `mc_l4_exact_consumption_origins`, esquema financeiro e CI #425 (aprovado).
- Criada migração **somente no repositório** `supabase/migrations/20261123212000_l4_close_review_pending.sql`: tabela append-only `mc_l4_close_reviews` para pedidos de revisão, com chave idempotente por oficina, autor, execução, checklist explícito de seis categorias (energia, máquina, mão de obra, acessórios, ferramentas, outros), payload congelado e relatório gerado no servidor. O checklist pode ter `supported`, `not_applicable` com justificativa, ou `pending` — ausência de custo **não** é inferida como zero.
- RPC `mc_submit_l4_close_review`: apenas owner/manager ativo, verifica saída confirmada, bloqueia a execução na transação, serializa por advisory lock, rejeita chave reutilizada com payload divergente, verifica cobertura de origens exatas, desconhecidos, estimativas, reservas ativas e categorias pendentes; replay idêntico retorna a mesma revisão e não duplica auditoria. Grava **somente revisão pendente + evento de auditoria**. Não grava `mc_cost_snapshots`, `mc_cost_allocations`, não efetua movimentação financeira ou estoque, não muda status da execução e não libera fechamento.
- Testes SQL `supabase/tests/l4_close_review_rollback.sql` (rollback, idempotência, autoria/permissões, checklist, imutabilidade e ausência de escrita financeira). Teste Bash `supabase/tests/l4_close_review_concurrency.sh`: duas sessões para replay simultâneo e para payload divergente. Workflow CI ampliado.
- **Limite de segurança intencional:** estrutura de revisão transacional **não** é fechamento definitivo. Ainda faltam integração de todos os custos comprovados no servidor, fonte P07, autorização de postagem de snapshots finais imutáveis, critérios de estorno P09 e seus testes. Não afirmar que L4 está liberada ou homologada.
- Sem merge, deploy, migração operacional ou gasto de créditos.

- **CI integral aprovado para o L4-G01:** #433 / run `45287099185` no commit `98f55e814e3bf032540ba5a6f7d337defb9dce28`: tipos, Vitest, build, regressão SQL e rollback da revisão financeira, concorrência em duas sessões, RLS/isolamento e Playwright desktop/mobile. Evidência: https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45287099185 . O CI comprova a **revisão pendente auditável**, NÃO fechamento financeiro final.

## 23/11/2026 — L4-G02: dossiê dinâmico de impedimentos financeiros, sem postagem

- Relidos os contratos de trabalho, P05/P06/P09 e as migrações de origem exata e de revisão L4 já aprovadas em CI #434. A revisão anterior é uma fotografia histórica **pendente**; não pode ser tratada como autorização atual para fechar custos.
- Nova migração no **GitHub somente**: `supabase/migrations/20261123223000_l4_readiness_dossier.sql`, função `mc_get_l4_close_readiness(workspace,execution,review?)`, exclusivamente **consulta**. O dossiê calcula na hora e retorna origem exata ausente, custo desconhecido/estimado, fonte dita conhecida mas sem referência de compra, saídas/consumos confirmados, reservas ativas, confirmações estornadas e estado do checklist de categorias. Retorna fontes/justificativas e bloqueios nomeados para auditoria do usuário.
- **Não há autorização implícita para lançar custos:** `status=pending`, `posting_allowed=false`, `financially_final=false` são invariáveis, inclusive quando todas as categorias declaradas são consideradas atendidas. Sem conciliação P05/P06 final e mecanismo P09 de compensação, o dossiê bloqueia contabilização.
- Segurança: RPC `SECURITY DEFINER` com `search_path` restrito, autenticação e papel ativo `owner/manager`, verificação da execução e da revisão na mesma oficina, revogação de EXECUTE para anon/public. Nenhum movimento, snapshot, alteração de produção ou evento de auditoria é escrito pela consulta.
- Regressão de banco `supabase/tests/l4_readiness_dossier_rollback.sql`, rodada após a migração em PostgreSQL **descartável** no workflow: execução ainda sem produção, duas bobinas (estimada e desconhecida), revisão pendente, bloqueios, RLS, seleção explícita de revisão e comparação de contadores de tabelas antes/depois da consulta.
- **Ainda pendente:** conciliação exata de categorias e destinos no servidor, fontes P07 de energia/máquina, P09 de compensações e confirmação financeira imutável. **NÃO FAZER DEPLOY** nem aplicar migração operacional.


## 23/11/2026 — L4-G03: dossiê de impedimentos integrado à interface de Impressões

- **Implementado em branch:** `src/data/supabase.ts` expõe `getL4CloseReadiness`, com tipo estrito do contrato RPC `mc_get_l4_close_readiness` (migração G02 ainda **não aplicada** ao Supabase operacional). `src/components/PrintReadinessPanel.tsx` apresenta consulta explícita por impressão, lista motivos do bloqueio traduzidos, quantidade de origens ausentes, custo desconhecido/estimado, categorias pendentes, reservas e estornos. O componente verifica na resposta `posting_allowed=false`, `financially_final=false` e `computed_live=true`, além de IDs da oficina/execução. Respostas defasadas são ignoradas; falhas aparecem ao operador sem preencher valores fictícios.
- `PrintAllocationPreview.tsx`: dossiê vinculado à impressão selecionada, com estado isolado por `key` da execução. A simulação de rateio permanece independente da consulta, sem novas chamadas que lancem ou alterem custos.
- `tests/app.spec.ts`: teste Playwright da mesa com guirlanda + estrela grande + estrela pequena ampliado para consultar explicitamente o dossiê, verificar motivos P05/P06/P09 e confirmar ausência de escritas financeiras.
- **Dependência conhecida:** a tela só obtém dados reais após implantação **separadamente autorizada** das migrações G02 e anteriores. Sem autorização, retorna erro visível; não considera ausência de dossiê como prontidão.
- **Sem liberação de fechamento:** consulta apenas, operação `posting_allowed=false`, snapshots definitivos P07/P09 pendentes. Nenhum merge, deploy, crédito ou migração operacional realizada.


## 23/11/2026 — L4-G04: conciliação exata por categoria e destino, sem fechamento

- **Diagnóstico estrutural:** o motor inicial `reconcilePrintAllocation` fecha cada linha informada separadamente. Quando uma mesma categoria recebe custos de dois lotes com frações de centavo, fechar cada origem antes de somar pode produzir diferença em relação ao fechamento P06 da categoria. A lógica inicial permanece para a prévia legada e não é autorizada como contabilização final.
- Criado `src/domain/l4-category-reconciliation.ts` como domínio puro: recebe preço total original, quantidade-base imutável e massa confirmada por lote e categoria; converte para razões exatas `BigInt` P06; agrega fontes de **modelo, purga e perda** da mesma categoria, fecha **uma única vez** em centavos por categoria e distribui centavos pelo maior resto com desempate estável por ID do destino. Conserva identificadores de lote/consumo, valor exato antes do fechamento, bases/justificativas e percentuais implícitos por destino. Exige atribuição explícita do consumo por categoria e bloqueia perda direcionada a peças boas. Nunca arredonda preço unitário antes da multiplicação.
- **Segurança do resultado:** `status=pending_financial_close`, `financialSnapshot=null` obrigatórios. Massa sem destino, custo desconhecido, origem estimada e custo conhecido sem comprovante são pendências explícitas. Se qualquer massa está sem atribuição ou custa `null`, o **total financeiro de material é `null`**, não zero nem subtotal disfarçado de custo final.
- Criado `src/domain/l4-category-reconciliation.test.ts`: frações de centavo entre lotes (R$0,004 + R$0,004 = categoria R$0,01), três peças na mesma mesa (R$3,34/R$3,33/R$3,33 no exemplo), preço racional periódico, multicor, fonte desconhecida, perda isolada, ID duplicado, base inválida, categoria ausente e custo estimado/sem compra.
- `src/components/PrintExactMaterialDraft.tsx` + `PrintAllocationPreview.tsx`: consulta explícita por impressão à RPC read-only de origens P06 existente; agrega somente material de modelo/purga/perda e exige pesos/destinos informados pelo usuário, exibindo motivos de pendência e valores fechados por categoria. Confirmações históricas anteriores à captura exata são identificadas e nunca reprecificadas com lote atual. Não gera snapshots, baixa ou lançamentos. Teste Playwright estendido para consultar origem exata e mostrar pendência quando bobina não possui custo.
- **Limitações:** categorias de energia, máquina, trabalho, acessórios e ferramentas continuam dependentes de fontes P07/composição e verificação da oficina; não existe fechamento financeiro integral, transação de postagem, nem compensação P09 implementada. A fonte P06 e os dossiês dependem de migrações que **não foram aplicadas ao banco operacional**. Sem merge/deploy.


## 23/11/2026 — L4-G05: motor de energia P07

- Implementado domínio puro `src/domain/l4-energy-draft.ts` com intervalos em milissegundos, cobertura não sobreposta, fontes medidas/estimadas/desconhecidas, condição de pausa, tarifa vigente e aritmética racional P06. Medição integral substitui estimativas sem somá-las. Lacunas sem cobertura energética mantêm custo nulo; lacunas de classificação permanecem diagnosticadas. Não infere depreciação durante pausas.
- Cinco testes em `src/domain/l4-energy-draft.test.ts`, incluindo exemplos homologados de 0,84 kWh/R$0,87 e 0,91 kWh medidos, sem dupla contagem.
- Commits: `524e720407fa5eb6e8efca7cb2f28bd4602417e9`, `77986504db93c8d1dc3ef12bcae743a0626052af`. CI ainda a verificar. Motor local, sem integração persistente de fases/tarifas nem interface; próximo lote deve conectar fontes existentes e rateio P05 sem inferir dados ausentes. Sem merge/deploy/migração operacional.


## 23/11/2026 — L4-G06: evidências de energia P07 vinculadas a Impressões

- CI #455 anterior aprovado no commit `0f4db8ad56c09e0ee29a8a899d695e1ad00a2553`, https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45293012698.
- Reutilizada tabela existente `mc_energy_tariffs`: vigência final exclusiva e referência da conta, sem preencher evidências históricas inexistentes. RPC de registro restrita a owner/manager, bloqueio por oficina contra sobreposição, sem edição direta pelo cliente autenticado.
- Migração `20261123233000_p07_energy_evidence.sql`: registros de fases por impressão com referência, autor, condição de pausa, consumo medido ou potência estimada explícita, sem sobreposições, RLS e RPCs autorizadas. Consulta retorna tarifa vigente e potência atual apenas como referência, não histórico. Nenhuma migração aplicada ao operacional.
- `PrintEnergyPanel` integrado a Impressões; `p07-recorded-energy.ts` conecta dados à aritmética exata existente. Tarifa deve abranger toda execução; datas de vigência em horário de Brasília UTC-03:00, fim exclusivo. Período total vem de início/fim existentes ou explicitamente informado na prévia. Não deduz início pelo horário de cadastro, nem preenche lacunas com potência atual.
- Testes: `p07_energy_evidence_rollback.sql` no PostgreSQL efêmero e `p07-recorded-energy.test.ts`. CI novo pendente de confirmação. Ainda faltam medição integral independente das fases, persistência do período observado quando inexistente, revisão/compensação de evidências incorretas, rateio exato P05 de energia e fechamento P09. Não confundir prévia com contabilização. Sem merge/deploy/migração operacional.


## 23/11/2026 — L4-G07: selecionar fonte energética P07 na prévia P05 (sem fechamento)
- Integrado `PrintEnergyPanel` a `PrintAllocationPreview`: a energia calculada por fases e tarifa da oficina pode preencher a categoria `energy` mediante ação explícita do operador, sem inserção automática de linha nem snapshot/baixa.
- `src/domain/p07-energy-allocation.ts` converte centavos já fechados P06 para texto monetário P05, preserva referência e identificação de fonte e bloqueia custo nulo, zero, tarifa ausente, lacunas energéticas, pausas desconhecidas e outros diagnósticos P07; estimativas são rotuladas.
- A interface impede duas linhas de energia na mesma prévia, exige base/destino e justificação do rateio compartilhado e conserva caráter **SIMULAÇÃO NÃO SALVA**. Categoria antiga precisa ser removida antes de recalcular e importar; fonte histórica não pode ser editada silenciosamente.
- Adicionadas regressões em `src/domain/p07-energy-allocation.test.ts`. **Execução dos testes e CI deste HEAD ainda não confirmadas**; não classificar como módulo completo, liberar deploy ou aplicar migrações operacionais.
- Limites: tarifa deve cobrir todo o período; medição integral independente, correção/compensação de evidências, rateio final servidor, contabilização imutável e P09 continuam pendentes. CI-ECONOMY-01 permanece ativo; sem merge/deploy/gastos.


## 23/11/2026 — L4-G08A: medição integral P07 em prévia local
- `prepareRecordedEnergy` aceita medição real integral opcional com período e referência explícitos, reaproveitando o motor P07 já existente. A medição integral substitui a soma das fases, sem duplicidade; os intervalos e lacunas de classificação continuam visíveis.
- `PrintEnergyPanel` oferece confirmação de cobertura de todo o período e campos kWh/referência do medidor. Alterar dados invalida o cálculo anterior. O formulário declara expressamente que a medição integral ainda não é persistida.
- `p07-energy-allocation.ts` conserva referência e valor da medição na identificação da fonte do rateio; o bloqueio de postagem é mantido. Três testes unitários adicionados para substituição, período/referência inválidos e preservação de lacunas.
- CI #466 anterior cancelado; CI do código atual não confirmado. **Não liberar deploy**. Próxima etapa: persistência auditável da medição integral e período observado, com idempotência e isolamento por oficina, antes de qualquer fechamento. Sem migração operacional, merge, deploy ou acionamento manual de CI.

 
## 23/11/2026 — L4-G08B/G09A: persistência e revisão de medição integral P07
- Horários efetivos de início/término e duração: não aferidos.
- G08B: migração em repositório para medição integral única por impressão/oficina, replay idempotente e rejeição de sobrescrita, API e painel com consulta/registro. CI inclui a migração no PostgreSQL descartável. Commits: `4fc4bce7a76958de966fadef8f85e6f9d45206e7`, `951ee935d04229709241923d49961191d8f62a73`, `1fd7c6c9760e3e5695c233387fef3e7087a4fc0d`, `cd49a7b0d72548ec05bd09d2ce971dd315c18b88`, `6e4a985e0443c6106d277d70c1c52bfa80099956`.
- G09A: tabela de revisões append-only por API, autor e justificativa obrigatórios, cadeia de versão anterior, replay com chave e payload, advisory lock e rejeição de versão obsoleta. Consulta retorna original, revisões e valor vigente, sem alterar o período. Interface exibe histórico e registra correção; identificação da revisão integra a origem do rateio. Testes SQL ampliados para replay, versão obsoleta, preservação original e acesso externo. Commits: `54086e530cd7fdb7edcc5c66629677aae60366f2`, `e7dc80ff981e3f38c10c5dbbf81772d77d561028`, `d476ef03862447d6b73bd23dc7097e8a25a603b6`, `4e41e639a7d3beaf12302f62f393b67653b7e02a`.
- Limites: revisão corrige somente kWh e referência da medição integral, não corrige períodos, fases ou tarifas. Não há contabilização financeira, estorno P09 ou migração operacional. CI não confirmado para o lote; não publicar. Próxima etapa: impedir fases fora do período integral, revisar invalidação de prévias obsoletas e verificar regressões.
- Evidência: PR #1, https://github.com/jeffersonfukner-hue/makercusto/pull/1 . Sem merge, deploy ou acionamento manual de CI.


## 23/11/2026 — L4-G09B: integridade de evidências e invalidação de prévias
- Início/término e duração efetiva: não aferidos; referência de horário da solicitação: 23:09 (Brasília).
- Trigger de inclusão de fases usa o mesmo advisory lock da medição integral e rejeita intervalos fora dos limites conhecidos. Triggers impedem UPDATE/DELETE direto em medição, revisão e fase. Não há alteração de estoque ou contabilização. Commit `a6857ea60f5987d7d278b8e201c62f97e638aa5e`.
- Painel P07 invalida prévia dependente ao consultar/alterar/recalcular fontes; falha de consulta não preserva dados anteriores como atuais. Rateio descarta somente linhas importadas P07 obsoletas e exige nova importação; outras categorias são mantidas. Commits `c6d1e2162154826b3b0c9a2f84ebf98750b56b6d`, `2faa33b3f3595ad72bcfd17c22b84418a5b1d21c`.
- Regressões SQL adicionais para fase fora do período e tentativas de modificação/exclusão de evidências. Commit `8c77c733dffba8509de36b8c9fde9d9190d64904`. Testes ainda não confirmados; nenhuma migração operacional, merge ou deploy.
- Pendências: CI acumulado; revisão auditável de fases e tarifas, integração das demais fontes de custos, fechamento e compensação P09. Não há liberação de deploy. PR #1: https://github.com/jeffersonfukner-hue/makercusto/pull/1 .


## 23/11/2026 — L4-G10A: diagnóstico de integridade das origens de rateio
- O diagnóstico local de fechamento passa a sinalizar origem histórica com categoria trocada, versões P07 em categorias distintas de energia e múltiplas linhas energéticas na mesma execução.
- Fontes P07 permanecem prévias não verificadas, ainda que possuam referência; nenhuma dessas verificações transforma simulação em fechamento financeiro.
- Acrescentados três testes unitários de regressão. Execução local e CI deste commit não confirmados; sem snapshot, migração operacional, merge ou deploy.
- Próximas etapas: validar pipeline de forma econômica e ampliar comprovação das outras fontes financeiras, revisões de evidências e P09.


## L4-G10B — revisão explícita de categorias financeiras
- CI do G10A (SHA 11cb3ff35a4a5c8fe86c27007639acb3186ae311), execução #487, conclusão success: https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45315304809 .
- Implementadas declarações locais de categoria desconhecida, não aplicável e zero com referência; divergência entre declaração e linha de custo fica explícita. Interface exige revisão das categorias adicionais e não presume ausência como zero. Origem histórica incompatível não conta como cobertura válida.
- Três regressões acrescentadas; CI deste lote ainda não verificado. Declarações não persistidas nem verificadas pelo servidor. Nenhum fechamento, migração operacional, merge ou deploy.


## 24/11/2026 — L4-G11A: estimativa de utilização da máquina
- Conectada ficha atual da impressora física vinculada à execução e horas registradas ao rateio L4. Motor puro P06 calcula estimativa, sem substituir tempo ausente pelo planejado. Dados atuais não comprovam origem histórica; bloqueio financeiro mantido.
- Importação explícita, prevenção de dupla apropriação integral e invalidação quando parâmetros mudam. Quatro regressões adicionadas. CI G10B #488 observado em execução; CI G11A não confirmado.
- Sem migração operacional, merge ou deploy. Pendentes: origem congelada da máquina, demais custos, P09 e validação integral.


## 24/11/2026 — L4-G11B: origem histórica da máquina (banco versionado)
- Migração captura parâmetros da impressora na criação de novas execuções, sem reconstruir as antigas. Preserva preço, vida útil, manutenção, identificação, autor e instante; não presume comprovação de compra. UPDATE/DELETE bloqueados. Consulta financeira isolada por oficina retorna horas registradas, indicador de vínculo e bloqueio de postagem.
- Teste SQL de imutabilidade, alteração posterior da ficha, autorização e tempo ausente integrado ao CI efêmero. CI G11A #489 observado em execução; novos testes não confirmados. Próxima etapa: cliente e interface da origem congelada, cálculo exato e revisão de manutenção sem dupla contagem. Sem aplicação operacional, merge ou deploy.


## 24/11/2026 — L4-G11C: origem congelada da máquina na prévia
- RPC versionada conectada ao cliente; cálculo racional de depreciação e manutenção parametrizada somados antes do arredondamento da categoria. Exibição separada, importação explícita e descarte de fontes obsoletas. Não reconstruir impressões antigas nem tratar manutenção parametrizada como despesa comprovada. Prevenção de dupla apropriação no formulário e diagnóstico.
- Quatro regressões unitárias adicionadas. CI G11B #490 observado em execução; novos testes não confirmados. Sem migração operacional, merge, deploy ou fechamento.


## 24/11/2026 — L4-G12A: mão de obra na prévia de impressão
- Consulta serviços por oficina (tarifas horárias atuais), entrada manual alternativa, atividades com minutos humanos, tarifa, origem e base medida/estimada. Soma racional por categoria antes do arredondamento. Importação explícita e invalidação em alteração; bloqueio de duplicidade. Dados locais, sem comprovação histórica ou persistência de atividades.
- Quatro regressões adicionadas; CI G11C #491 observado em execução: https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45318426525 . Novos testes não confirmados. Próxima etapa: evidências persistidas e revisão auditável. Sem merge, deploy ou migração operacional.


## 24/11/2026 — L4-G12B: evidências históricas de mão de obra
- Migração append-only com autoria, referência única por impressão, replay idempotente, tarifa congelada e distinção entre tarifa manual e catálogo vigente. Consulta financeira isolada por oficina; UPDATE/DELETE bloqueados. Painel registra explicitamente e consulta histórico; importação separada de rascunhos e evidências, sem somar ambos. Não há comprovação financeira definitiva.
- Teste SQL rollback incluído no CI. CI anterior #492 observado em execução; novos testes não confirmados. Pendências: revisão/compensação auditável de evidências, integração de ferramentas e acessórios, fechamento P09. Sem migração operacional, merge ou deploy.


## 24/11/2026 — L4-G12C: revisão auditável da mão de obra
- Leitura prévia de AGENTS.md (incluindo CI-ECONOMY-01), README.md, ARQUITETURA.md, PADROES.md e continuidade; HEAD anterior G12B `cc2d6af17133cf066a98715ea2e42e7d647d7461`, CI #493 aprovado: https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45319086048 .
- Nova migração `20261124003000_l4_labor_revisions.sql`: histórico append-only de revisões de minutos, tarifa e base medida/estimada, autor, motivo, idempotência, trava de concorrência, rejeição de versão obsoleta e acesso por oficina. Preserva atividade/referência originais e tarifa da evidência inicial; a consulta expõe versão vigente e histórico, sempre com `posting_allowed=false`.
- Regressão `l4_labor_revisions_rollback.sql` criada e incluída no pipeline PostgreSQL descartável; verifica replay, divergência de chave, revisão obsoleta, valor vigente, histórico original, imutabilidade, autorização externa e privilégios anônimos.
- Commits criados: `f413484b60977f12abda03a6ed9d1ec76cab51cd`, `4257367978d21b0f302bb01f7d6ab6023a647586`, `6f8d10780cc6a1ce0779eaa0c34387ba70fe4f51`. CI do lote G12C ainda pendente de confirmação após atualizações; não declarar testes aprovados até consulta à execução efetiva.
- Limites: revisão não renomeia atividade/referência, não altera período histórico, não gera pagamento, estoque ou lançamento financeiro e não oferece UI de revisão nesta etapa; revisão feita por RPC, ainda sem integração visual. Pendem integração de ferramentas/acessórios, P09 e evidências para fechamento.
- Sem merge, deploy, migração operacional ou gastos autorizados. **NÃO FAÇA O DEPLOY AINDA.**


## 24/11/2026 — L4-G12D: cliente e interface de revisão da mão de obra
- RPC G12C integrada ao painel de Impressões; revisão explícita com motivo, versão consultada, chave idempotente, histórico original e versões. Prévia invalidada ao editar/revisar; bloqueio de importação enquanto revisão aberta. Sem lançamento financeiro. Quatro regressões unitárias acrescentadas. CI #497 anterior observado em execução; CI deste lote ainda não confirmado. Sem merge, deploy ou migração operacional.


## 24/11/2026 — Diagnóstico de cálculo salvo e barra contextual
- Evidência visual do Preview: ficha “Porta Vinho – Urso Deitado” indica cadastro salvo, mas mostra erro de schema cache ao chamar `public.mc_list_saved_calculations(p_workspace_id)`. A função consta na migração versionada `supabase/migrations/20261123125000_reuse_saved_calculations.sql`; disponibilidade no Supabase operacional não foi verificada diretamente. Não executar SQL nem supor perda de histórico.
- CI #382 https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45264494581 falhou em 12 E2E de ações contextuais em Impressões (desktop/mobile). Corrigida ativação do formulário por eventos de alteração em elementos select/input, preservando evento de clique, commit `f13a7ff3065f64664060730e1d3083b5d657cee7`.
- CI #499 https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45441294720 em execução na consulta. Sem homologação ou liberação para deploy; não foi aplicado SQL, merge ou deploy.


## 24/11/2026 — Verificação somente leitura do Supabase e CI #500
- Projeto Supabase MakerCusto conferido por consultas SQL exclusivamente de catálogo: `public.mc_list_saved_calculations(uuid)` e `public.mc_append_product_calculation(...)` inexistentes; schema `supabase_migrations.schema_migrations` disponível, com última versão registrada `20261123022622` (`print_execution_l2_l3`). Há migrações posteriores versionadas no GitHub, portanto aplicar isoladamente a função de cálculo não foi autorizado nem considerado seguro sem conferir dependências.
- CI #500 **aprovado integralmente** para commit `d51bb995a262cc3f32b3ccf94e8280445523409e`: https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45441395716 . Inclui tipagem, build, testes de motor, SQL e E2E desktop/mobile. CI #499 foi cancelado por commits posteriores.
- Pendem homologação visual, planejamento/aprovação explícita de aplicação ordenada de migrações ao banco MakerCusto e continuidade das demais funcionalidades. Não houve escrita no banco, merge ou deploy.


## 24/11/2026 — Plano de migrações pendentes, sem execução operacional
- Inventário read-only: GitHub contém 20 migrações após `print_execution_l2_l3`; Supabase MakerCusto registra dez migrations até `20261123022622`, com timestamps/nomenclatura distintos dos scripts versionados no repositório. Confirmadas tabelas-base `mc_energy_tariffs`, `mc_services`, `mc_production_reservations`, `mc_cost_snapshots` e `mc_printers`. RPCs de cálculos ausentes.
- Criado `docs/PLANO_MIGRACOES_PENDENTES_2026-11-24.md`, com quatro lotes ordenados: P01 (4), GAP01 (4), ficha/calculadora (3), L4/P07/mão de obra (9), riscos, pré-condições, cenários de validação e restrição de autorização. Nenhum SQL operacional aplicado.
- CI #500 do código anterior aprovado; novos commits são exclusivamente documentais. Permanecem testes de replay sobre cópia estrutural fiel, backup verificável, revisão de dependências e autorização explícita separada para banco. **NÃO FAÇA O DEPLOY AINDA.**
