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
