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
