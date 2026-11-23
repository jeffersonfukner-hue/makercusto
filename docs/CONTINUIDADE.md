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
