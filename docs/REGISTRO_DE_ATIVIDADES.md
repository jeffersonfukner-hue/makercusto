# REGISTRO DE ATIVIDADES — MakerCusto

Documento oficial de atividades efetivamente executadas neste projeto. Horários no fuso America/Sao_Paulo (Brasília, UTC−3). A duração efetiva só é informada quando mensurada; não inferir esforço a partir do intervalo entre mensagens.

## 20/11/2026 — Modo de filamento total e detalhamento por cor

- **Cliente/projeto:** MakerCusto (desenvolvimento próprio).
- **Horário de início observado:** 18:45 (consulta de relógio durante início da execução).
- **Horário de término observado da edição:** 18:46 (consulta de relógio após commit).
- **Duração efetiva trabalhada:** não aferida; o intervalo de relógio não é prova de tempo integral dedicado.
- **Atividades realizadas:** leitura de README.md, AGENTS.md, CONTINUIDADE.md, ARQUITETURA.md e PADROES.md; inspeção do código e CI anterior; implementação do modo simples com campos editáveis de quantidade e preço (g/kg, R$/g, R$/kg); alternância para detalhamento por cor sem dupla contagem; testes de regressão e atualização da documentação.
- **Resultado comprovado:** commit `504343471f26a1603bdf97dcc8cea2da7d09268b` na branch `feat/fundacao-makercusto`, PR #1; sem merge nem deploy.
- **Pendências:** CI do commit mais recente e homologação visual desktop/mobile. A publicação do Preview é exclusivamente manual pelo proprietário.
- **Evidências:** https://github.com/jeffersonfukner-hue/makercusto/commit/504343471f26a1603bdf97dcc8cea2da7d09268b ; https://github.com/jeffersonfukner-hue/makercusto/pull/1 ; execução CI inicial da revisão: https://github.com/jeffersonfukner-hue/makercusto/actions/runs/44823230686

## 20/11/2026 — Impressora selecionável e planejamento de assinatura

- **Cliente/projeto:** MakerCusto (desenvolvimento próprio).
- **Horário de início e término:** não aferidos para esta atividade; referência de mensagem do usuário: 19:43 de Brasília (não representa início comprovado da execução).
- **Duração efetiva:** não aferida; sem inferência pelo intervalo entre mensagens.
- **Atividades:** leitura do contrato e da documentação do repositório; alteração do formulário para selecionar/editar impressora antes dos filamentos, parâmetros de valor/potência/vida útil/tarifa; teste de interface acrescentado; documentação de cálculo Simples/Avançado independente de planos pago Compartilhado/Full e privacidade.
- **Resultado/evidência:** commit `1bcadcf403c84d209e8cac99ebf15b62092aac26` na branch `feat/fundacao-makercusto`; PR #1 https://github.com/jeffersonfukner-hue/makercusto/pull/1.
- **Pendências:** CI do HEAD atualizado, homologação visual; perfis locais não persistem entre sessões; planos pagos e Supabase não implementados. Nenhum merge ou deploy.

## 20/11/2026 — Consolidação de requisitos de cadastros e banco

- **Projeto/cliente:** MakerCusto — desenvolvimento próprio.
- **Data e referência de horário:** 20/11/2026, 19:58 (consulta do relógio durante esta atividade; não prova início ou término do trabalho).
- **Início e término efetivos:** não aferidos.
- **Tempo efetivo:** não aferido; nenhuma duração presumida.
- **Atividade realizada:** estudo dos documentos existentes e registro de requisitos de catálogos globais, modais Normal/Avançado, preferência de impressora, cadastros próprios, ferramentas, insumos comprados, estoque, listagens e arquitetura de persistência futura.
- **Resultado:** planejamento e documentação em branch; sem implementação de banco, cobranças ou novas telas nesta rodada.
- **Pendências:** decisões de compartilhamento/curadoria, contratos persistentes, custo e regras de Supabase; CI do commit documental.
- **Evidências:** PR #1 https://github.com/jeffersonfukner-hue/makercusto/pull/1 ; histórico Git da branch `feat/fundacao-makercusto`.

## 20/11/2026 — Homologação e plano-mestre de arquitetura
- **Projeto:** MakerCusto (desenvolvimento próprio).
- **Referência de horário:** 21:02 de Brasília, consulta realizada durante a tarefa; horário de início/término efetivos e duração produtiva não aferidos.
- **Atividades comprovadas:** leitura do contrato/documentos existentes, documentação das cinco regras homologadas, criação de plano-mestre e modelo lógico proposto, atualização de continuidade, arquitetura, padrões e backlog.
- **Resultado:** arquivos documentais na branch `feat/fundacao-makercusto`; sem código, banco, merge ou deploy.
- **Pendências:** homologar detalhes de regra de compartilhamento, custeio, downgrade e modelo físico; nenhum teste funcional executado, somente verificação GitHub de documentação.
- **Evidência:** PR #1 https://github.com/jeffersonfukner-hue/makercusto/pull/1 ; commit documental desta atualização registrado no histórico Git.

## 20/11/2026 — Revisão de permissões e fluxos de cadastro
- **Projeto:** MakerCusto (desenvolvimento próprio).
- **Horário de referência observado:** 21:07 de Brasília, durante a continuação do trabalho; horários efetivos de início e término e duração produtiva não aferidos.
- **Atividades realizadas:** leitura do plano-mestre e modelo de dados na revisão `896877b8`, comparação de direitos por plano e classe de entidade, análise de 12 riscos documentais e descrição de seis fluxos e oito propostas para futura homologação.
- **Resultado:** `docs/REVISAO_PERMISSOES_E_CADASTROS.md` e atualizações de continuidade/backlog; sem alteração de código, banco ou produção.
- **Pendências:** aprovação das políticas adicionais e definição de detalhes antes de criar SQL.
- **Evidência:** commit documental desta alteração na branch `feat/fundacao-makercusto` e PR #1 (https://github.com/jeffersonfukner-hue/makercusto/pull/1).

## 20/11/2026 — Homologação das oito diretrizes e evolução do modelo lógico
- **Projeto/cliente:** MakerCusto — desenvolvimento próprio.
- **Referência de horário observada:** 21:12 de Brasília, durante a execução. **Início, término e duração efetiva:** não aferidos; o intervalo entre mensagens não comprova trabalho contínuo.
- **Atividades comprovadas:** leitura da revisão de permissões no commit `3878be18`; formalização da homologação expressa do proprietário em documento próprio; complementação do modelo lógico com classes de dados, proposta de oficina, FKs, fluxo de rascunhos, publicação e mudanças de plano; atualização dos estados de homologação na revisão e continuidade.
- **Resultados verificáveis:** `docs/HOMOLOGACAO_PERMISSOES_2026-11-20.md`, `docs/MODELO_DE_DADOS.md`, `docs/REVISAO_PERMISSOES_E_CADASTROS.md` e `docs/CONTINUIDADE.md` na branch `feat/fundacao-makercusto`; commits respectivos consultáveis no histórico do PR #1.
- **Pendências:** políticas detalhadas ainda não homologadas, esquema SQL físico, testes RLS e homologação visual; nenhum teste de código executado nesta atividade.
- **Restrições:** sem código, banco, migração, merge, deploy ou produção.

## 20/11/2026 — Especificação de contratos de catálogos, impressoras e filamentos
- **Projeto/cliente:** MakerCusto — desenvolvimento próprio.
- **Horário de referência observado:** 21:19 de Brasília, consulta durante a atividade; início/término efetivos e duração produtiva não aferidos.
- **Atividades efetivamente executadas:** releitura dos documentos da branch; análise das 13 regras homologadas; definição de proposta de campos, relacionamentos, privacidade, validações e fluxos de cópia, impressora física, lote de filamento e histórico de custo; documentação de testes futuros e pendências.
- **Resultado:** contrato técnico documental e atualizações de continuidade/backlog, sem alterar código ou banco.
- **Evidências:** PR #1 `https://github.com/jeffersonfukner-hue/makercusto/pull/1`; histórico de commits da branch `feat/fundacao-makercusto`.
- **Pendências:** homologação das novas propostas, escolha da modelagem física e execução futura de testes (não realizados nesta etapa). **Tempo efetivo:** não aferido, sem estimar o intervalo entre mensagens.

## 20/11/2026 — Homologação de cadastros e desenho lógico de estoque/produtos
- **Projeto:** MakerCusto (desenvolvimento próprio).
- **Horário de referência observado:** 21:25 de Brasília, durante a execução. **Horários de início/término e duração efetiva:** não aferidos; não inferir tempo trabalhado pelo intervalo entre mensagens.
- **Atividades realizadas:** leitura do contrato e documentos do commit `4bab9d0c`; formalização das quatro escolhas técnicas aprovadas; especificação documental de estoque, fornecedores, compras, bobinas, movimentos auditáveis, ferramentas, serviços, produtos/kit, produção, históricos e regressões propostas.
- **Resultados:** `docs/HOMOLOGACAO_CADASTROS_2026-11-20.md` e `docs/CONTRATO_ESTOQUE_PRODUTOS.md` criados na branch de trabalho; atualizados continuidade e backlog. **Nenhum código, banco, merge ou deploy**.
- **Pendências:** homologação de contratos específicos do estoque e produção, modelo SQL físico e testes funcionais/RLS não executados.
- **Evidências:** PR #1 https://github.com/jeffersonfukner-hue/makercusto/pull/1 ; commits verificáveis na branch `feat/fundacao-makercusto`.

## 20/11/2026 — Homologação de estoque e refinamento lógico de produção
- **Projeto:** MakerCusto (desenvolvimento próprio).
- **Referência de horário:** 21:32 de Brasília (relógio consultado durante a execução); **início/término efetivos e duração trabalhada:** não aferidos.
- **Atividades efetivamente executadas:** releitura dos documentos do commit `7d7507cc`; registro das seis regras expressamente homologadas; especificação proposta de eventos e movimentos de estoque, máquina de estados de produção, validação de saldo, composição de kits, rateio explícito e estornos auditáveis; atualização de continuidade/backlog.
- **Resultados:** arquivos documentais versionados no PR #1 da branch `feat/fundacao-makercusto`. Nenhuma alteração funcional de aplicação, banco, SQL, merge ou deploy.
- **Pendências:** homologação de detalhes operacionais e critérios de rateio, esquema físico e futuros testes de RLS/regressão (não realizados nesta tarefa).
- **Evidência:** `docs/HOMOLOGACAO_ESTOQUE_2026-11-20.md`; `docs/REFINAMENTO_ESTOQUE_PRODUCAO.md`; https://github.com/jeffersonfukner-hue/makercusto/pull/1 .

## 20/11/2026 — Planejamento de produção real, falhas e rateio
- **Projeto/cliente:** MakerCusto — desenvolvimento próprio.
- **Data e horário observado de referência:** 20/11/2026, 21:39 (Brasília), consulta durante a execução; **início, término e duração efetiva não aferidos**. Não inferir horas do intervalo entre mensagens.
- **Atividade comprovada:** leitura da documentação de origem no commit `ca53d01c`; elaboração de contrato proposto de reserva, disponibilidade, confirmação parcial, falhas de impressão, retrabalho, mesa mista, pools de custo, rateio conciliado, eventos e critérios de teste futuro.
- **Resultado:** criação de `docs/MODELAGEM_PRODUCAO_REAL_E_RATEIO.md` e atualização de continuidade e backlog, preservando as 23 homologações; nenhuma regra nova aprovada nesta etapa.
- **Pendências:** homologação das decisões operacionais, desenho SQL físico, RLS e testes reais (não executados).
- **Evidências:** PR #1 https://github.com/jeffersonfukner-hue/makercusto/pull/1 ; commit do arquivo de modelagem `8d44aa87eee6fbbabc67310c7beced6cbd19b203`; commits de atualização da branch.

## 20/11/2026 — Revisão crítica de propostas de produção e exemplos 3D
- **Projeto/cliente:** MakerCusto, desenvolvimento próprio.
- **Horário de referência:** 21:42 de Brasília, consulta realizada durante esta tarefa; **início e término efetivos:** não aferidos; **duração efetiva:** não aferida (intervalo entre mensagens não contabilizado).
- **Atividades comprovadas:** leitura do contrato `e479d08e` e homologações existentes; comparação das cinco decisões pendentes (reserva, confirmação parcial, falha, retrabalho e rateio); elaboração de recomendações com exemplos numéricos hipotéticos, condições de teste e limites ainda abertos.
- **Resultado/evidência:** `docs/PROPOSTAS_HOMOLOGACAO_PRODUCAO_2026-11-20.md` na branch `feat/fundacao-makercusto`, commit `78867d47b74da6f5d4715066093b819a8b3ff63b`, PR #1 https://github.com/jeffersonfukner-hue/makercusto/pull/1 .
- **Pendências:** homologação expressa pelo proprietário, especificação física e execução de testes; nada aplicado em código, banco, SQL ou deploy.

## 20/11/2026 — Homologação de cinco decisões de produção
- **Projeto:** MakerCusto — desenvolvimento próprio.
- **Referência de horário:** 21:55 (Brasília), consultada durante esta sessão; início e término efetivos e duração produtiva não aferidos; não inferir tempo entre mensagens.
- **Atividades executadas:** leitura dos documentos de proposta/homologações da branch; registro formal da aprovação expressa de RES, PAR, FAL, RET e RAT, distinção entre 28 diretrizes homologadas e detalhes ainda pendentes; atualização de continuidade e backlog para migração segura de conversa.
- **Resultado/evidência:** `docs/HOMOLOGACAO_PRODUCAO_2026-11-20.md`, commit `683847ffc35abe1b586a6559efcbfa6cb6e04d1f`, PR #1 https://github.com/jeffersonfukner-hue/makercusto/pull/1 .
- **Pendências:** políticas detalhadas de reservas, parciais, falhas/retrabalho, rateio e financeiro; nenhum teste funcional/RLS executado; sem código, banco, merge ou deploy.

## 20/11/2026 — Homologação documental P01 (reservas e sobras)
- **Projeto/cliente:** MakerCusto — desenvolvimento próprio.
- **Início e término (Brasília):** não aferidos. **Duração efetiva:** não mensurada; não calcular tempo produtivo pelo intervalo entre mensagens.
- **Atividades efetivamente executadas:** leitura de `docs/CONTINUIDADE.md`, `docs/REGISTRO_DE_ATIVIDADES.md` e homologação de produção da branch; formalização da aprovação expressa P01-A a P01-F como política única; atualização de continuidade; registro cronológico desta atividade.
- **Resultados:** documento `docs/HOMOLOGACAO_RESERVAS_P01_2026-11-20.md` criado, 28 regras anteriores preservadas e novo total documental de 29; P02–P06 mantidas pendentes. Nenhum código, SQL, banco, merge ou deploy.
- **Pendências:** revisão individual de P02, P03, P04, P05 e P06; demais exceções e modelo SQL físico ainda sem homologação. Testes funcionais/RLS não realizados (atividade exclusivamente documental).
- **Evidências verificáveis:** commits `af0edb9d` (homologação P01), `c70996f7` (continuidade), branch `feat/fundacao-makercusto`, PR #1 https://github.com/jeffersonfukner-hue/makercusto/pull/1. O commit deste próprio registro consta no histórico da branch.


## 20/11/2026 — Homologação documental P02 (confirmações parciais)
- **Projeto/cliente:** MakerCusto — desenvolvimento próprio.
- **Horários de início e término (Brasília):** não aferidos. **Duração efetiva:** não mensurada. Não presumir trabalho contínuo entre mensagens.
- **Atividades efetivamente realizadas:** leitura de `CONTINUIDADE.md`, `HOMOLOGACAO_PRODUCAO_2026-11-20.md`, `HOMOLOGACAO_RESERVAS_P01_2026-11-20.md` e `MODELAGEM_PRODUCAO_REAL_E_RATEIO.md`; formalização da aprovação expressa de P02-A a P02-F como uma única política; atualização de continuidade e do presente registro.
- **Resultados:** P02 homologada na documentação, 29 diretrizes anteriores mantidas e total **30**; P03–P06 ainda pendentes. Sem código, banco, SQL, migração, merge ou deploy.
- **Pendências:** revisão de P03–P06, P07–P09 e limites operacionais detalhados, modelo físico e permissões/RLS; **testes de software não executados**, pois a atividade foi documental.
- **Evidências verificáveis:** commit `e77bd4b9` (documento P02); `0385d053` (continuidade); branch `feat/fundacao-makercusto`; PR #1 https://github.com/jeffersonfukner-hue/makercusto/pull/1. O commit do próprio registro é verificável no histórico GitHub.


## 20/11/2026 — Homologação documental P03 (falhas e perdas)
- **Projeto/cliente:** MakerCusto — desenvolvimento próprio.
- **Horários de início/término (Brasília):** não aferidos. **Duração efetiva:** não mensurada; não inferida pelo intervalo entre mensagens.
- **Atividades efetivamente executadas:** leitura das homologações FAL, P01 e P02 e de `docs/CONTINUIDADE.md`, conferência do estado da branch, formalização da aprovação expressa de P03-A a P03-F como uma política única e atualização da continuidade/registro de atividades.
- **Resultados:** `docs/HOMOLOGACAO_FALHAS_P03_2026-11-20.md` criado; total de **31 homologações**, preservando as 30 anteriores. Nenhum código, SQL, banco, merge ou deploy.
- **Pendências:** P04 a P06 e P07 a P09, valorização de recuperáveis, regras fiscais, permissões, RLS e modelo SQL físico. Testes funcionais/RLS não executados nesta etapa documental.
- **Evidências verificáveis:** commits `f7b530a9` (homologação P03) e `e48a1b8d` (continuidade); branch `feat/fundacao-makercusto`; PR #1 https://github.com/jeffersonfukner-hue/makercusto/pull/1. O commit da atualização deste próprio registro está disponível no histórico do GitHub.


## 20/11/2026 — Homologação documental P04 (retrabalho e recuperação)
- **Projeto/cliente:** MakerCusto — desenvolvimento próprio.
- **Horários de início e término (Brasília):** não aferidos. **Duração efetiva:** não mensurada; intervalo entre mensagens não corresponde a tempo comprovado.
- **Atividades efetivamente realizadas:** leitura de continuidade, homologações de produção, P01/P02/P03 e contrato lógico de retrabalho, inspeção da branch, criação do registro normativo P04-A a P04-F, atualização da continuidade e do registro cronológico.
- **Resultados:** `docs/HOMOLOGACAO_RETRABALHO_P04_2026-11-20.md` criado e P04 homologada como uma única política; **32 homologações** acumuladas, preservando 31 anteriores; sem código, SQL, banco, merge ou deploy.
- **Pendências:** P05 a P09, critérios fiscal/contábil, garantia/pós-venda, valorização de materiais recuperáveis, permissões/RLS, SQL físico; testes funcionais não executados por ser atividade exclusivamente documental.
- **Evidências verificáveis:** commits `2e25553e` (homologação P04) e `b82d5935` (continuidade); branch `feat/fundacao-makercusto`, PR #1 https://github.com/jeffersonfukner-hue/makercusto/pull/1. Commit próprio deste registro consta no histórico Git.


## 20/11/2026 — Homologação documental P05 (rateio por categoria)
- **Projeto/cliente:** MakerCusto — desenvolvimento próprio.
- **Início e término (Brasília):** não aferidos; **duração efetiva:** não mensurada. Não contabilizar tempo entre mensagens como atividade.
- **Atividades executadas:** conferência somente leitura de continuidade, regras RAT, P04, P03 e contratos de estoque/produção; formalização da aprovação expressa P05-A a P05-F em uma política consolidada, com categorias, métodos de atribuição, exceções, casos aritméticos hipotéticos e limitações; atualização da continuidade e deste registro.
- **Resultados:** criado `docs/HOMOLOGACAO_RATEIO_P05_2026-11-20.md`, registradas **33 homologações** com 32 anteriores intactas, P06–P09 pendentes; somente documentos da branch, sem código, SQL, banco, merge ou deploy.
- **Pendências:** P06 precisão/arredondamento; P07 pausas/energia; P08 consumo sem lote; P09 estorno parcial; RLS/permissões, fiscalidade, dados do slicer e modelo físico SQL. **Testes funcionais/RLS não executados** (somente documentação).
- **Evidências verificáveis:** commit `83168f07` (homologação P05), `9df8031d` (continuidade), branch `feat/fundacao-makercusto`, PR #1 https://github.com/jeffersonfukner-hue/makercusto/pull/1. Commit deste registro encontra-se no histórico da branch.


## 20/11/2026 — Homologação documental P06 (precisão financeira)
- **Projeto/cliente:** MakerCusto — desenvolvimento próprio.
- **Horários de início e término (Brasília):** não aferidos. **Duração efetiva trabalhada:** não mensurada. Não presumir tempo ativo pelo intervalo entre mensagens.
- **Atividades efetivamente executadas:** consulta dos documentos atuais de continuidade, P05 e contratos de estoque/custeio; formalização da aprovação expressa P06-A a P06-F como política consolidada; documentação das regras de cálculo decimal, preço por grama/lote, arredondamento half-up, resíduos de centavos, custo unitário e auditoria; atualização de continuidade e do registro oficial.
- **Resultado:** documento `docs/HOMOLOGACAO_PRECISAO_P06_2026-11-20.md` criado; **34 homologações** acumuladas, preservando 33 anteriores; P07–P09 e fiscal/SQL permaneceram em aberto. Somente arquivos documentais; sem código, banco, SQL, merge ou deploy.
- **Pendências:** P07 pausas/energia, P08 consumo sem lote, P09 estorno parcial; fiscal/contábil, autorização de equipe/RLS, esquema físico SQL e testes futuros. **Testes funcionais/RLS não executados** nesta atividade.
- **Evidências verificáveis:** commit `b8c779b8` (homologação P06), `5841d92e` (continuidade); branch `feat/fundacao-makercusto`, PR #1 https://github.com/jeffersonfukner-hue/makercusto/pull/1. O commit deste registro pode ser conferido no histórico GitHub.


## 20/11/2026 — Homologação documental P07 (pausas e energia)
- **Projeto/cliente:** MakerCusto — desenvolvimento próprio.
- **Início e término (Brasília):** não aferidos. **Duração efetiva:** não mensurada; não inferir horas produtivas do intervalo entre mensagens.
- **Atividades efetivamente realizadas:** verificação de continuidade, homologações P05/P06 e contratos de energia/impressoras; criação de documento normativo de P07-A a P07-F; atualização de continuidade e deste registro; verificação documental posterior.
- **Resultado:** `docs/HOMOLOGACAO_ENERGIA_P07_2026-11-20.md` criado e P07 homologada como uma única política. **35 homologações acumuladas**, com 34 anteriores preservadas. P08/P09, depreciação em pausas, tarifas variáveis e temas fiscais/SQL não aprovados. Somente alterações em documentação, sem código, SQL, banco, merge ou deploy.
- **Pendências:** P08 e P09; regras de depreciação/manutenção e tarifas horárias; fiscais/contábeis, permissões, RLS e esquema SQL. Testes funcionais/RLS não realizados nesta etapa exclusivamente documental.
- **Evidências verificáveis:** commits `ccc543fa` (P07) e `e1cfd353` (continuidade), branch `feat/fundacao-makercusto`, PR #1 https://github.com/jeffersonfukner-hue/makercusto/pull/1. Commit deste registro permanece verificável no histórico da branch.


## 20/11/2026 — Homologação documental P08 (consumo sem lote)
- **Projeto/cliente:** MakerCusto — desenvolvimento próprio.
- **Horários de início e término (Brasília):** não aferidos. **Duração efetiva:** não mensurada; não inferir trabalho contínuo de mensagens.
- **Atividades efetivamente realizadas:** consulta em modo leitura de continuidade, homologações P01/P02/P06/P07 e contratos de estoque/cadastros; criação do documento normativo P08-A a P08-F; atualização de continuidade e registro cronológico; verificação posterior dos arquivos documentais.
- **Resultados:** criado `docs/HOMOLOGACAO_CONSUMO_SEM_LOTE_P08_2026-11-20.md`, preservadas as 35 homologações anteriores e registrado total **36**; compra fictícia vedada, inventário de bobina operacional documentado, custo estimado diferenciado, conciliação não destrutiva. Sem código, SQL, banco, merge ou deploy.
- **Pendências:** P09 estornos parciais; conciliação de consumo físico sem saldo/origem comprovável, confirmação financeira com custo desconhecido, permissões/RLS, normas fiscais/contábeis, depreciação em pausa, tarifas variáveis e estrutura SQL física. Testes funcionais/RLS não realizados nesta etapa documental.
- **Evidências verificáveis:** `1bdff539` (homologação P08) e `4bfab1f9` (continuidade), branch `feat/fundacao-makercusto`, PR #1 https://github.com/jeffersonfukner-hue/makercusto/pull/1. Commit do próprio registro consta no histórico GitHub.


## 20/11/2026 — Homologação documental P09 (estornos parciais)
- **Projeto/cliente:** MakerCusto — desenvolvimento próprio.
- **Horários de início e término (Brasília):** não aferidos. **Duração efetiva:** não mensurada, sem inferir trabalho entre mensagens.
- **Atividades efetivamente executadas:** leitura de continuidade e das regras P01–P08 pertinentes a reservas, confirmações, perdas, retrabalho, custos e inventário; formalização de P09-A a P09-F como única política aprovada; criação do documento normativo e atualização da continuidade e deste registro.
- **Resultados:** criado `docs/HOMOLOGACAO_ESTORNOS_P09_2026-11-20.md`; registrados **37 conjuntos homologados**, com 36 anteriores preservados. Estorno parcial referenciado, distinção entre compensação documental e retorno físico, reclassificação de resultados, compensação de custos originais, idempotência e auditabilidade.
- **Pendências:** conciliação excepcional de estoque/quantidade efetiva sem saldo ou origem, regras de autorização/permissões/RLS, peças vendidas/devolvidas, fiscalidade, custo desconhecido, depreciação em pausas, tarifas variáveis e esquema SQL físico. Testes funcionais/RLS não realizados; nenhuma alteração em código, SQL, banco, merge ou deploy.
- **Evidências verificáveis:** commit `43feb126` (homologação P09), `92806f9d` (continuidade); branch `feat/fundacao-makercusto`, PR #1 https://github.com/jeffersonfukner-hue/makercusto/pull/1. Commit deste registro verificável no histórico da branch.


## 20/11/2026 — Homologação documental GAP-01 (conciliação excepcional de estoque)
- **Projeto/cliente:** MakerCusto — desenvolvimento próprio.
- **Início e término (horário de Brasília):** não aferidos para esta atividade. **Duração efetiva:** não mensurada; não contabilizar intervalo entre mensagens como tempo trabalhado.
- **Atividades efetivamente executadas:** consulta em leitura de `docs/CONTINUIDADE.md`, homologações P01/P02/P03/P08/P09 e refinamento de estoque; formalização da aprovação expressa GAP01-A a GAP01-F como política consolidada; criação de documento normativo, atualização de continuidade e deste registro; conferência documental posterior.
- **Resultados:** criação de `docs/HOMOLOGACAO_CONCILIACAO_EXCEPCIONAL_GAP01_2026-11-20.md`, total de **38 homologações** com preservação de 37 anteriores, incluindo distinção ocorrência física/baixa, investigação, inventário corretivo auditável, proteção das reservas, estornos e estados de conciliação. Nenhum código, SQL, banco, merge ou deploy alterado.
- **Pendências:** autorizações e papéis, evidências mínimas, conciliação sem origem comprovada, custo desconhecido, fiscalidade/contabilidade, operações posteriores, RLS e modelo SQL físico. Nenhum teste funcional/RLS executado nesta etapa.
- **Evidências verificáveis:** commits `e6548b2e` (documento GAP-01) e `ae1b4689` (continuidade); branch `feat/fundacao-makercusto`, PR draft #1 https://github.com/jeffersonfukner-hue/makercusto/pull/1. Commit deste registro verificável no histórico Git.


## 20/11/2026 — Homologação documental GAP-02 (permissões e autorização)
- **Projeto/cliente:** MakerCusto — desenvolvimento próprio.
- **Horários de início e término (Brasília):** não aferidos para a execução. **Duração efetiva:** não mensurada, sem contar intervalo entre mensagens como trabalho.
- **Atividades efetivamente realizadas:** consulta dos documentos homologados e de continuidade, matriz de papéis e regras de autorização; formalização da aprovação expressa GAP02-A a GAP02-F com a matriz funcional; criação de `docs/HOMOLOGACAO_PERMISSOES_GAP02_2026-11-20.md`; atualização de `docs/CONTINUIDADE.md` e deste registro.
- **Resultado:** **39 homologações acumuladas**, com as 38 anteriores preservadas. Contrato funcional de papéis por oficina separado de planos e administração global, confirmação ordinária, segregação de exceções e auditoria documentados. Nenhuma implementação ou teste funcional/RLS nesta atividade.
- **Pendências:** equipes/convites, alçadas/limites de aprovação, RLS físico, evidências mínimas, conciliação sem origem comprovada, fechamento financeiro com custo desconhecido, fiscalidade, SQL físico, fluxo de vendas/devoluções/garantias, depreciação em pausas e tarifas variáveis. Consolidar pendências em pacote final antes da implementação.
- **Evidências verificáveis:** `6745c2e8` (documento GAP-02), `9961ef62` (continuidade), branch `feat/fundacao-makercusto`, PR #1 https://github.com/jeffersonfukner-hue/makercusto/pull/1. Commit próprio deste registro identificável no histórico GitHub.
- **Restrições observadas:** sem código, SQL, banco, merge ou deploy.


## 20/11/2026 — Primeira entrega de UX progressiva (Simples → Avançado)
- **Projeto/cliente:** MakerCusto — desenvolvimento próprio.
- **Horários de início e término (Brasília):** não aferidos. **Duração efetiva:** não mensurada; intervalo entre mensagens não é tempo comprovado.
- **Atividades efetivamente realizadas:** leitura de AGENTS, README, arquitetura e padrões; inspeção do código React, motor de custos e cenários Playwright; implementação de navegação Simples/Avançado, campos essenciais no modo inicial, controles extras e multicor no Avançado, resumo de preço/custo/lucro e estilos responsivos; adaptação e ampliação dos testes; atualização de continuidade e deste registro.
- **Resultados:** alterações no PR #1 draft, branch `feat/fundacao-makercusto`, sem modificar lógica matemática do motor; modo simples independente do detalhado, valores preservados entre modos. Nenhum merge/deploy. Testes Playwright adicionados, **não afirmar aprovação até conferir o CI correspondente**.
- **Pendências:** CI de tipagem/unitários/build/E2E em andamento (run inicial `44857663329`), eventuais ajustes e validação visual do proprietário. Valores exemplo não são medição; gestão/contas/banco não implementados.
- **Evidências verificáveis:** commits `12f45df5` (UI), `e70b78e8` (CSS), `637aa6a7` / `7d8d33ec` (E2E), `2ce6f92b` (continuidade), PR https://github.com/jeffersonfukner-hue/makercusto/pull/1. Este registro tem commit verificável no histórico.


## 20/11/2026 — Verificação final do CI da UX Simples/Avançado
- **Projeto/cliente:** MakerCusto — desenvolvimento próprio. **Início/término (Brasília):** não aferidos; **duração efetiva:** não mensurada.
- **Atividades executadas:** leitura dos resultados de execução CI, investigação de erro TS e timeout Playwright mobile, correção do componente (`3aa98612`) e ajuste do cenário de restauração (`ab67481c`), reexecução e conferência do resultado final.
- **Resultado comprovado:** GitHub Actions run **44858012063** (job **136704638275**) concluído **success** no commit de código/testes **ab67481cc259769d6acab47a8d38fd17cec16a52**: tipos, testes do motor de custos, build e **26 testes E2E desktop/mobile passaram**. Rodada anterior `44857763701` falhou com 25/26 E2E e foi corrigida.
- **Pendências:** homologação visual pelo proprietário e deploy manual apenas com autorização; funções de banco/gestão continuam futuras. Não realizar merge ou deploy.
- **Evidências:** https://github.com/jeffersonfukner-hue/makercusto/actions/runs/44858012063 e commits `3aa98612`/`ab67481c`, PR #1 draft.

## 21/11/2026 — Preparação da fundação Supabase MakerCusto
- **Atividade executada:** verificação da conta Supabase (organização `Flipzie Desenvolvimento de Sistemas`, plano Free), leitura da arquitetura homologada, criação local do arquivo `001_fundacao.sql` com modelo inicial de 33 tabelas, RLS, catálogo com Kobra X e entidades de cadastro, estoque, produtos, produção, custos e auditoria.
- **Resultado:** SQL gerado como artefato para instalação exclusiva em projeto MakerCusto novo. **Não executado no Supabase; banco ainda não criado**. Nenhum dado do Kit Casa Pré LAB foi alterado. Fluxos de confirmação/estorno e integração visual continuam pendentes de desenvolvimento e testes.
- **Horário/duração:** início e término não aferidos, tempo efetivo não comprovado.
- **Pendência:** criar projeto Supabase específico, confirmar custo zero, aplicar SQL, validar esquema e integrar frontend com modais. Sem merge/deploy.

## 21/11/2026 — Projeto Supabase e fundação SQL instalada
- **Projeto/cliente:** MakerCusto, desenvolvimento próprio; organização Supabase Flipzie Desenvolvimento de Sistemas.
- **Horários e duração efetiva:** início/término não aferidos; duração não mensurada. Não se considera o intervalo de mensagens como trabalho comprovado.
- **Atividades executadas:** inspeção do SQL de fundação; consulta de custo de criação (0/mês); confirmação de custo zero; criação do projeto isolado MakerCusto (`bxtbfdddcxbyaomydgxn`, região São Paulo); espera/conferência de status `ACTIVE_HEALTHY`; aplicação da migração `makercusto_foundation_v1`; consultas SQL de validação de objetos, RLS, integridade e catálogo; versionamento da migração e atualização da documentação.
- **Resultados comprovados:** migração aplicada, 33 tabelas RLS, 68 políticas, 89 FKs, 19 registros descritivos globais, modelo Kobra X cadastrado, sem oficinas e sem movimentos. Sem merge/deploy. Nenhuma alteração no Kit Casa Pré LAB.
- **Pendências:** integração com autenticação e interface, modais de cadastros, funcionalidades operacionais transacionais, testes E2E por usuário, e homologação visual em Cloudflare Preview somente em etapa autorizada.
- **Evidências:** projeto `bxtbfdddcxbyaomydgxn`, migração `makercusto_foundation_v1` confirmada via `supabase_migrations.schema_migrations`, SQL `supabase/migrations/20261121015442_makercusto_foundation_v1.sql` commit `13a7c897`, continuidade commit `02e920f9`.


## 21/11/2026 — Integração front-end e cadastros Supabase
- **Atividades executadas:** leitura das regras de arquitetura e SQL aplicado; consulta de chave publishable; implementação dos serviços Auth/Data API em `src/data/supabase.ts`, modais reutilizáveis de login/impressora/catálogo, integração à calculadora e estilos responsivos; adaptação dos testes Playwright incluindo cenário autenticado com API simulada.
- **Resultado:** código versionado na branch `feat/fundacao-makercusto`, sem merge/deploy. Cadastros reais são enviados ao Supabase somente após login; visitantes continuam usando a calculadora sem conta. Esta integração ainda depende dos testes completos de CI e de validação real em navegador.
- **Evidências:** commits `f9929ce4`, `655bd888`, `991dd531`, `c5c85351`, `402c4e8e`, `c977e59e`, `33a7ce3f`, `69487519`, `7e0bfa88`, `81f7fc2c`; PR #1 e verificações CI vinculadas.
- **Horários e duração:** início/término não aferidos, duração efetiva não mensurada; não inferir tempo entre mensagens.
- **Pendências:** verificar CI, corrigir falhas detectadas, testar conta real e confirmar permissões RLS; avançar integração de filamentos/estoque/produtos/produção em lote futuro, sem publicação sem autorização.

## 21/11/2026 — Diagnóstico e correção do toque mobile
- **Atividades reais:** execução do CI GitHub, leitura de logs de falha e do rastreamento de clique Playwright; diagnóstico de sobreposição de seções impedindo o botão `Cadastrar cor` no mobile; criação da barra de ações de cadastro para telas pequenas; nova rodada de CI.
- **Resultado comprovado:** última versão de código em `c5dcc1eb` aprovada no workflow `44864163612` job `136723999519`: tipagem, testes unitários, build, E2E desktop/mobile. Nenhum merge ou deploy.
- **Pendências:** verificação funcional com conta real Supabase e validação visual em Preview Cloudflare; integração operacional de materiais/estoque/produtos permanece não entregue. Ainda não é sistema apto a venda.
- **Horários/duração efetiva (Brasília):** não aferidos; duração não mensurada. Não contabilizar automaticamente tempo entre mensagens.

## 21/11/2026 — Melhorias de seleção de impressoras e UX
- **Projeto:** MakerCusto (desenvolvimento próprio).
- **Início/término e duração efetiva (Brasília):** não aferidos; nenhuma duração inventada.
- **Atividades:** leitura dos padrões e da implementação; consulta de referências de modelos comerciais; preparação de catálogo local de impressoras FDM, informações complementares de custo/hora e revisão de botões de cadastro.
- **Resultado:** mudanças versionadas na branch de trabalho; condicionadas a CI e homologação visual. Sem alteração de banco, merge ou deploy.
- **Pendências:** confirmação do CI e revisão do Preview pelo proprietário.
- **Evidência:** histórico da PR #1 https://github.com/jeffersonfukner-hue/makercusto/pull/1 e execução GitHub Actions associada ao commit.

## 21/11/2026 — Registro de regra de experiência e ideia Plus
- **Projeto:** MakerCusto, desenvolvimento próprio.
- **Início e término (Brasília):** não aferidos. **Duração efetiva:** não mensurada; não inferida do intervalo entre mensagens.
- **Atividade efetiva:** leitura de padrões, arquitetura, plano-mestre e continuidade; formalização da decisão do proprietário sobre valores de partida, ficha oficial + estimativas, cópia pessoal da impressora original e backlog de perfis otimizados pagos.
- **Resultado:** documentação alterada na branch de trabalho, sem alteração funcional, migração, banco, cobrança, merge ou deploy.
- **Pendências:** implementação e testes da seleção fabricante/modelo, defaults completos e fluxo Copiar e personalizar; homologação do Preview.
- **Evidências:** commit documental correspondente e PR #1 https://github.com/jeffersonfukner-hue/makercusto/pull/1.

## 21/11/2026 — Universalização da regra dos cadastros
- **Projeto:** MakerCusto, desenvolvimento próprio.
- **Início/término (Brasília):** não aferidos. **Duração efetiva:** não mensurada; nenhum intervalo entre mensagens presumido trabalhado.
- **Atividade executada:** releitura documental e registro do padrão geral de fichas globais completas, clonagem pessoal com herança e nome editável, presets básicos de slicer nos filamentos, e normalização dos nomes.
- **Resultado:** documentação na branch/PR #1; nenhuma mudança funcional, migração, banco, merge ou deploy.
- **Pendências:** desenvolver e testar componentes reutilizáveis, perfis e controles de imutabilidade.
- **Evidência:** commit deste registro no histórico da PR https://github.com/jeffersonfukner-hue/makercusto/pull/1.

## 21/11/2026 — Requisito de ajuda contextual e autocomplete
- **Projeto:** MakerCusto, desenvolvimento próprio.
- **Início e término (Brasília):** não aferidos. **Duração efetiva:** não mensurada; não contabilizar intervalos de conversa.
- **Atividade realizada:** leitura do contrato/documentos e formalização transversal de microdicas reativas, sugestões clicáveis limitadas a três resultados e seleção criteriosa dos campos importantes.
- **Resultado:** documentação atualizada na branch do PR #1; código da aplicação, banco e produção não alterados.
- **Pendências:** desenvolver componente reutilizável, testes de teclado/mobile/acessibilidade e homologação visual.
- **Evidência:** commit documental desta atualização e PR #1 https://github.com/jeffersonfukner-hue/makercusto/pull/1.

## 21/11/2026 — Lote de código de cadastros e sugestões
- **Início/término e duração:** não aferidos; tempo comprovado não mensurado.
- **Atividade:** leitura do código e padrões; implementação de componente de sugestões, seleção de fabricantes/modelos, ficha Kobra X e defaults ilustrativos; acréscimo de testes E2E e documentação.
- **Resultado:** alterações versionadas na branch MakerCusto, sujeitas ao CI. Sem merge/deploy/banco.
- **Evidência:** commit desta atualização no PR #1 https://github.com/jeffersonfukner-hue/makercusto/pull/1.

## 21/11/2026 — Perfis técnicos consultáveis de filamento
- **Início/término e duração:** não aferidos; nenhuma duração de trabalho inferida.
- **Atividade:** implementação de referências básicas de filamento, painel no cadastro com fonte/estimativa, clonagem local editável, estilos e testes E2E.
- **Resultado:** código na branch do PR #1, sem alteração do banco ou publicação.
- **Pendências:** conferir CI, ajustar falhas e homologar UI; eventual persistência remota exigirá contrato e testes RLS.
- **Evidência:** commit deste lote e PR #1 https://github.com/jeffersonfukner-hue/makercusto/pull/1.

## 21/11/2026 — Encerramento verificável do lote de cadastros inteligentes
- **Projeto/cliente:** MakerCusto, desenvolvimento próprio.
- **Início e término (Brasília):** não aferidos. **Duração efetiva comprovada:** não mensurada; nenhuma hora contabilizada pela diferença entre mensagens.
- **Atividades:** implementação e refinamento de seleção de impressoras, catálogo de filamentos, dicas e sugestões, normalização, perfis consultáveis/clonáveis e regressões; diagnóstico e correção de falhas de toque no mobile com testes Playwright.
- **Resultado comprovado:** CI para código `dff2fb8d20e5b751bc01a6b5fa5fb49d1104b7b9` concluído com sucesso: tipagem, 11 testes unitários, build e 38 testes E2E desktop/mobile.
- **Evidências:** https://github.com/jeffersonfukner-hue/makercusto/actions/runs/44912210018 ; branch `feat/fundacao-makercusto` ; PR #1 https://github.com/jeffersonfukner-hue/makercusto/pull/1.
- **Pendências:** homologação visual no Preview; preenchimento de referências técnicas adicionais; persistência remota de cópias e arquitetura completa de catálogo protegido.
- **Restrições cumpridas:** nenhum merge, deploy, alteração em produção ou operação sobre o banco nesta rodada.

## 21/11/2026 — Fechamento adicional do lote de cadastros
- **Projeto:** MakerCusto, próprio.
- **Início, término e duração efetiva (Brasília):** não aferidos; sem atribuir horas pelo intervalo de mensagens.
- **Atividades realizadas:** revisão de componentes existentes, ajuste de escolha de modelo pela pesquisa, proteção de nome duplicado em clones de filamento, ampliação de fichas de 3 impressoras com referências de fabricantes e inclusão de cenários Playwright.
- **Resultados:** mudanças na branch em PR #1, pendentes de CI/homologação visual; nenhuma alteração de banco, merge ou deploy.
- **Evidências:** commits e Actions vinculados à PR #1; fontes oficiais documentadas na continuidade.

## 21/11/2026 — Autocomplete acessível e testes de teclado
- **Projeto:** MakerCusto (próprio).
- **Início/término e duração efetiva:** não aferidos; não inferir horas do intervalo entre mensagens.
- **Atividades:** revisão do SmartField, implementação de navegação por teclado/ARIA, estilo de opção selecionada e dois testes E2E.
- **Resultado:** alteração versionada em branch, dependente da execução de CI correspondente.
- **Pendências:** confirmar CI e validação visual móvel.
- **Evidências:** PR #1 https://github.com/jeffersonfukner-hue/makercusto/pull/1 e commit associado.

## 21/11/2026 — Correção de regressões do autocomplete
- **Projeto:** MakerCusto (próprio). **Início/término e duração:** não aferidos.
- **Atividades:** consulta do workflow #44918924933 e seus logs; identificação de quatro inconsistências de acessibilidade/testes repetidas em desktop e mobile; correção da lista de sugestões e seletores E2E.
- **Resultado:** mudança em branch, CI ainda a verificar; sem banco, merge, deploy.
- **Evidência:** https://github.com/jeffersonfukner-hue/makercusto/actions/runs/44918924933 e commit desta correção.

## 21/11/2026 — Modelos globais selecionáveis e fichas técnicas adicionais
- **Projeto/cliente:** MakerCusto, próprio. **Horário inicial/final e duração efetiva:** não aferidos, sem inventar duração.
- **Trabalho executado:** inspeção da seleção de impressoras, atualização de presets para escolha direta sem cadastro, separação de itens globais/pessoais, proteção da referência ao copiar; documentação de novas fichas técnicas de fabricantes e testes desktop/mobile.
- **Resultados:** alterações versionadas na branch/PR #1; dependem da execução CI. Nenhum banco, merge ou deploy.
- **Evidências:** commit correspondente, PR #1 e fontes de fabricante especificadas em src/data/printerPresets.ts.

## 21/11/2026 — Correção de seletores de testes de clonagem
- **Projeto:** MakerCusto, próprio. **Horários e duração:** não aferidos; não estimar tempo de trabalho pelo intervalo de mensagens.
- **Atividade:** análise dos logs da execução #44924935524; identificação de colisão em nome de botões de clonagem de cadastros diferentes; especificação de região nos quatro caminhos de teste afetados.
- **Resultado:** teste ajustado em branch, aguardando confirmação CI. Sem merge, deploy ou banco.
- **Evidência:** https://github.com/jeffersonfukner-hue/makercusto/actions/runs/44924935524.

## 21/11/2026 — Verificação final do CI das referências globais
- **Projeto:** MakerCusto. **Início/término/duração (Brasília):** não aferidos; tempo efetivo não quantificado.
- **Atividade:** conferência do job CI #44925197270 e dos estágios tipagem, testes unitários, build e interface desktop/mobile.
- **Resultado comprovado:** CI `success` para o commit `bf554134`; nenhuma publicação, migração ou merge.
- **Pendências:** homologação visual e implementação posterior de perfis técnicos/persistência integral.
- **Evidência:** https://github.com/jeffersonfukner-hue/makercusto/actions/runs/44925197270

## 21/11/2026 — Edição de perfis pessoais e ajuda financeira contextual
- **Projeto:** MakerCusto (próprio).
- **Início/término (Brasília):** não aferidos. **Duração efetiva comprovada:** não mensurada; nenhum período entre mensagens considerado automaticamente trabalhado.
- **Atividades:** leitura da arquitetura/regras e componentes; edição posterior de cópias de perfis de filamento; ampliação de referências genéricas não oficiais; microdicas de quantidades e custos; três cenários de teste de interface.
- **Resultado:** frontend/documentação versionados na branch da PR #1, sem mudanças em engine financeira ou banco; CI a conferir.
- **Pendências:** CI, validação visual, persistência remota dos perfis sob contrato de RLS futuramente aprovado.
- **Evidências:** commit desta atualização e PR #1 https://github.com/jeffersonfukner-hue/makercusto/pull/1.

## 21/11/2026 — Verificação do CI de edição dos perfis de filamento
- **Projeto:** MakerCusto, próprio. **Início/término (Brasília):** não aferidos. **Tempo efetivo:** não mensurado.
- **Atividades reais:** consulta de job do GitHub Actions #44926757179 e conferência de tipo, unitários, build e testes desktop/mobile.
- **Resultados:** todos os estágios `success` para commit `1034a2c4`. Nenhuma publicação/alteração de banco/merge.
- **Pendências:** persistência remota dos perfis pessoais, referências por fabricante/linha e homologação visual.
- **Evidência:** https://github.com/jeffersonfukner-hue/makercusto/actions/runs/44926757179


## 21/11/2026 — Continuidade de impressoras pessoais no navegador
- **Projeto:** MakerCusto, desenvolvimento próprio.
- **Início/término (Brasília):** não aferidos; **duração efetiva:** não mensurada, não inferida de mensagens.
- **Atividades efetivas:** análise dos padrões e do estado da branch; implementação de armazenamento local validado para impressoras de visitantes, preferência de seleção por conta/dispositivo, preservação de cadastros ao restaurar exemplo e três cenários Playwright.
- **Resultados:** código e documentação preparados na PR #1; testes de CI a verificar. Sem SQL, dados de produção, merge ou deploy.
- **Evidências:** commits e GitHub Actions associados à PR #1 https://github.com/jeffersonfukner-hue/makercusto/pull/1.

## 21/11/2026 — Diagnóstico do teste de impressora visitante
- **Projeto:** MakerCusto. **Horários/duração:** não aferidos; sem inferência de tempo entre mensagens.
- **Atividade:** verificação dos logs de #44927149461 (62 sucessos, 2 falhas), identificação de seletor E2E não exclusivo e ajuste para ID real do modelo global.
- **Resultado:** testes versionados na branch; CI seguinte pendente. Sem banco, deploy ou merge.
- **Evidência:** https://github.com/jeffersonfukner-hue/makercusto/actions/runs/44927149461.

## 21/11/2026 — Ajuste de seletor Playwright para option selecionada
- **Projeto:** MakerCusto; **início, término e duração efetiva:** não aferidos.
- **Atividade:** diagnóstico do CI #44927374533, leitura de logs e substituição de seletor CSS inválido no teste de persistência local.
- **Resultado:** alteração em branch; nenhum deploy, merge ou banco; CI pendente.
- **Evidência:** https://github.com/jeffersonfukner-hue/makercusto/actions/runs/44927374533.

## 21/11/2026 — Conferência final do CI da persistência local
- **Projeto/cliente:** MakerCusto, desenvolvimento próprio. **Início/término e duração comprovada (Brasília):** não aferidos; não inferir horas.
- **Atividades efetivas:** acompanhamento de CI #44927634558; validação de resultado final e estados de tipagem, motor, build e interface desktop/mobile.
- **Resultados comprovados:** execução `success` do commit `b112c461`; persistência de clones locais e seleção validada por automação. Nenhum banco, merge ou deploy.
- **Pendências:** persistência integral de cópias técnicas e perfis no Supabase com RLS e homologação visual do proprietário.
- **Evidências:** https://github.com/jeffersonfukner-hue/makercusto/actions/runs/44927634558

## 21/11/2026 — Habilitação de salvamento de produtos no Supabase
- **Projeto/cliente:** MakerCusto (próprio).
- **Horário de início observado:** 14:52 (Brasília); **término efetivo e duração produtiva:** não aferidos. O horário de referência não equivale à duração trabalhada.
- **Autorização:** proprietário autorizou integração de código e banco, preservando deploy manual e sem merge.
- **Atividades realizadas:** inspeção do esquema e RLS; migração SQL com função transacional que cria produto, revisão inicial e snapshot de custo estimado; retirada da permissão EXECUTE de anon nas quatro funções SECURITY DEFINER existentes; painel de cadastro/listagem com estados de carregamento, sucesso/erro e validação; testes Playwright com REST simulado; SQL versionado.
- **Resultado comprovado:** migração executada com sucesso no Supabase MakerCusto e consulta posterior confirmou execução das cinco funções permitida somente a authenticated, não a anon. Alterações de aplicação commitadas na branch de trabalho; não publicadas.
- **Limites:** teste de integração real de usuário e RLS ainda precisa ser executado; CI do HEAD precisa confirmar tipos/build/E2E. O snapshot é declarado como estimado e não movimenta estoque. Nenhum deploy nem merge.
- **Evidência:** GitHub PR #1 https://github.com/jeffersonfukner-hue/makercusto/pull/1 ; migração versionada `supabase/migrations/20261121145200_enable_product_save_rpc.sql`; consulta de permissões ao banco realizada nesta sessão.

## 21/11/2026 — Teste transacional de criação de produto
- **Horários efetivos e duração:** não aferidos; execução nesta sessão, sem tempo estimado como comprovado.
- **Atividade:** chamada de `mc_save_calculated_product` sob papel `authenticated` e contexto de membro proprietário, dentro de transação explícita finalizada com `ROLLBACK`.
- **Resultado comprovado:** RPC retornou UUID do produto de teste; consulta posterior confirmou **zero produtos** com SKU `TESTE-ROLLBACK` e **zero snapshots** com marcador `transaction_rollback`. Não houve inclusão persistente de dados de teste.
- **Limite:** teste controlado de banco, com contexto JWT simulado pelo administrador; não substitui login real nem validação visual.


## 21/11/2026 — Primeiro fluxo de uso real: conjunto lançador de hélices
- **Projeto:** MakerCusto, desenvolvimento próprio.
- **Horários de início/término e duração efetiva (Brasília):** não aferidos; nenhuma hora inferida a partir de mensagens.
- **Autorização:** implementar código e banco para teste real; deploy manual pelo proprietário, sem merge.
- **Execução:** inspeção de contratos e banco, nova migração RPC para conjunto e componentes, cliente REST, formulário responsivo para peças, composição, pesos opcionais, listagem e feedback, adição de testes Playwright.
- **Teste verificado:** criação de conjunto com lançador, haste e hélice usando contexto autenticado controlado; leitura por RPC e rollback; consulta posterior confirmou ausência de registros de teste.
- **Evidências:** PR #1 https://github.com/jeffersonfukner-hue/makercusto/pull/1 e migração `supabase/migrations/20261121152000_assemblies.sql`, commits da branch.
- **Pendências:** CI, validação de conta real no Preview, edição de composições, custos e estoque reais. Sem merge/deploy.


## 21/11/2026 — Validação final do conjunto de peças
- **Horários efetivos e duração:** não aferidos; sem inferência pelo intervalo da sessão.
- **Atividade:** diagnóstico de dois ciclos de CI com falhas de seletor ambíguo nos testes preexistentes, ajustes de escopo de listagem e feedback, reexecução completa do pipeline.
- **Evidência final:** GitHub Actions #44933944246 `success`, commit `5723a7e4f259b1ceb65f4d86a8cf8bb0f475f508`; 11 testes do motor, build e TypeScript aprovados, 74 E2E desktop/mobile aprovados. https://github.com/jeffersonfukner-hue/makercusto/actions/runs/44933944246
- **Limite:** testes de interface usam REST simulado; banco foi testado por transação autenticada controlada com rollback, não por sessão real no navegador. Não houve deploy nem merge.


## 22/11/2026 — Verificação do Cloudflare e cadastro REAL do lançador de hélices
- **Projeto/cliente:** MakerCusto (projeto próprio).
- **Início (Brasília):** 01:12, horário de observação obtido do relógio local. **Término e duração efetiva comprovada:** não aferidos; não atribuir horas automaticamente.
- **Autorização:** usuário declarou ter publicado manualmente e solicitou cadastrar o produto real, verificar publicação e persistência.
- **Atividades executadas:** leitura dos estados do navegador e da página Cloudflare `makercusto-preview`; constatação de que a publicação ativa corresponde ao commit `e54e132` enquanto a versão com montagem aprovada pelo CI é `5723a7e` (74 E2E e 11 unitários); consulta em modo leitura da oficina no Supabase MakerCusto; cadastro persistente mediante RPC `mc_create_assembly` na oficina existente e confirmação pela RPC de listagem.
- **Produto persistido:** ID `0a687413-fe87-4f80-a655-e6b914aceea6`, nome `Lançador de hélices`, tipo kit; Lançador (1), Haste (1), Hélice (1), três componentes próprios vinculados por uma revisão; 4 registros de produto totais na oficina após a gravação. Custos, pesos, tempo e preço não informados, sem suposições; custo `unknown`.
- **Verificações:** 1 revisão e 3 vínculos confirmados por SQL após COMMIT; RPC `mc_list_assemblies` como papel `authenticated` e contexto do proprietário recuperou o produto persistido e seus três componentes.
- **Evidências verificáveis:** GitHub https://github.com/jeffersonfukner-hue/makercusto/actions/runs/44933944246 ; projeto Cloudflare `makercusto-preview`, publicado `e54e132` em `https://cdb4b74a.makercusto-preview.pages.dev/`; projeto Supabase `bxtbfdddcxbyaomydgxn` e identificador de produto acima.
- **Pendências:** o usuário precisa publicar manualmente o commit funcional `5723a7e` (ou versão posterior idêntica em código) para mostrar Meus produtos e Produtos com várias peças; conferir no navegador o componente após publicação. Não houve merge nem deploy do assistente.


## 22/11/2026 — MakerCusto autenticado: Modelo 4 (layout híbrido)
- **Projeto:** MakerCusto (próprio). **Autorização:** usuário homologou menu lateral, cabeçalho, abas por módulo, painel da oficina, ficha de produtos e responsividade, autorizando codificação e testes, **sem merge nem deploy**.
- **Horários de observação (Brasília):** início observado às 19:40, término da verificação às 19:53. **Duração efetiva trabalhada:** não medida; o intervalo entre esses marcos não é contabilizado automaticamente como trabalho.
- **Atividades realizadas:** leitura prévia do contrato `AGENTS.md`, README e documentação; criação do componente `SystemNavigation` com topbar, menu lateral recolhível, navegação mobile e abas; separação visual entre visitante (calculadora pública) e conta autenticada (painel da oficina); integração do painel de indicadores consultados no Supabase; aba de peças filtrada por tipo; módulos ainda indisponíveis desabilitados; ficha do conjunto com composição obrigatória, preço informado e custo não apurado; CSS responsivo com acessibilidade e foco; testes Playwright para navegação desktop/mobile, modo visitante, login, cadastros e ficha.
- **Resultados verificados:** GitHub Actions `#45079957503` em `success` no commit funcional `917ed2ff735921b8c255c763bac541bb063a9fa1`: tipagem, 11 testes unitários, build e **78/78 E2E** aprovados. As duas execuções anteriores falharam por testes que pressupunham acesso direto à calculadora pós-login e por seletores ambíguos de status/visibilidade mobile; testes ajustados ao fluxo homologado.
- **Evidência:** https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45079957503 ; branch `feat/fundacao-makercusto`; PR https://github.com/jeffersonfukner-hue/makercusto/pull/1 .
- **Pendências:** homologação visual manual após publicação pelo proprietário; configuração de módulos Impressões/Materiais/Estoque/Relatórios ainda indisponíveis; histórico de custos e biblioteca STL; ampliar ficha/edição completa e custeio de componentes. O CI usa mocks do Supabase para interface, não atesta navegação com conta real no site publicado. **Sem alterações em Supabase, merge ou deploy nesta atividade.**


## 22/11/2026 — Produtos: catálogo primeiro, ficha, revisão e custos de peças
- **Projeto/cliente:** MakerCusto / desenvolvimento próprio.
- **Horário de início de referência:** 20:30 (Brasília, horário informado pelo ambiente). **Término de referência:** 20:39 (Brasília, relógio consultado ao final). **Duração efetiva comprovada:** não aferida; não converter automaticamente o intervalo em horas trabalhadas.
- **Autorização:** o proprietário confirmou com `ok` a proposta de corrigir Produtos priorizando catálogo, ficha, ações Visualizar/Editar/Duplicar, custos por componente e controles visuais. Deploy manual reservado ao proprietário; merge não autorizado.
- **Atividades realizadas:** estudo do contrato/documentação e do código/banco existentes; criação do formulário de produtos sem exigir custo estimado; RPC `mc_save_product_record` para cadastro/edição com revisão; RPC `mc_update_assembly` para criar revisão da composição e preservar snapshots anteriores; atualização da RPC `mc_list_assemblies` para consultar a revisão vigente e custos por peça; suporte ao custo inicial informado em `mc_create_assembly`; criação do catálogo `ProductWorkspace`, ficha individual e edição/duplicação; interface sem formulário pré-preenchido de exemplo, com tabela de composição e sem rolagem vertical aninhada; CSS de botões e layouts responsivos; revisão dos testes de interface.
- **Resultados comprovados:** chamadas de criação de produto, edição de conjunto e criação de conjunto com custos decimais executadas sob contexto autenticado em transações com `ROLLBACK`; total de custo das peças de teste somado corretamente (R$ 4,20 para 1 lançador a R$ 1,55, 2 hastes a R$ 0,65 e 1 hélice a R$ 1,35). Confirmação por consulta: 4 produtos reais no total, 1 revisão do kit real, 3 vínculos de composição, nenhum produto de teste persistido; `anon` sem `EXECUTE` na função de edição. O primeiro CI desta etapa falhou por dois erros TypeScript de união produto/conjunto, corrigidos. GitHub Actions #45084244776 executado com **success** no commit funcional `52d83b129d7a48a3ae960554a2355c5e40e3a225`: tipos, 11 testes do motor, build e **78/78 E2E** desktop/mobile aprovados.
- **Evidências verificáveis:** https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45084244776 ; branch `feat/fundacao-makercusto`; migrações `supabase/migrations/20261122203000_assembly_revisions_costs.sql`, `20261122204000_product_form_records.sql`, `20261122204500_initial_assembly_costs.sql`; projeto Supabase MakerCusto `bxtbfdddcxbyaomydgxn`.
- **Pendências e limites:** UI testada com API Supabase simulada; navegação real no navegador do usuário será homologada após o deploy manual. Custos por peça são informados/estimados, não medidos ou baixados do estoque; faltam vínculo direto com impressões, filamentos e arquivos STL, histórico detalhado na UI. Duplicação não herda custos históricos, intencionalmente. Sem merge, deploy ou alterações adicionais nos quatro produtos reais.


## 22/11/2026 — Corrigir divergência das abas do Início (Modelo 4)
- **Projeto:** MakerCusto, desenvolvimento próprio.
- **Início/término/duração efetiva:** horários exatos de execução não registrados. Referência observada nesta sessão: 20:51 (Brasília), não usar como duração nem presumir horas entre mensagens.
- **Solicitação:** proprietário identificou que no Início havia apenas "Visão geral", embora o layout homologado também previsse "Atividades" e "Pendências".
- **Atividades realizadas:** consulta à implementação vigente (`SystemNavigation.tsx`, `WorkshopDashboard.tsx`, `App.tsx`, `supabase.ts`) e aos testes; implementação de estado para as 3 abas no menu Início; seção Atividades com dados de criação de produtos obtidos da oficina, identificados como cadastros recentes (sem apresentá-los como log de alterações/produção); seção Pendências com custos e preços não informados dos produtos/conjuntos; CSS responsivo; cobertura Playwright de troca de abas e pendência de custos. Outras funcionalidades preservadas; sem SQL, merge ou deploy.
- **Resultado:** código commitado na branch `feat/fundacao-makercusto`. Validação automatizada do commit `1854af63bfc0fc4840e0034690f05dc57d99e7e6` iniciada; conferir status final do CI antes de homologação.
- **Pendências:** conferir CI concluído e homologar visualmente após deploy manual do proprietário. Atividades ainda mostram somente cadastros, não eventos auditáveis; não afirmar histórico de movimentações.

- **Validação posterior concluída:** GitHub Actions #45085517877 `success` para HEAD `68258aed5bb1ead0b2fa82be72dcc9b29dfb2a22`, com TypeScript, build, 11 testes unitários e **78/78 testes Playwright desktop/mobile** aprovados. Evidência: https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45085517877 . Nenhum merge/deploy.


## 22/11/2026 — Auditoria das 39 homologações e L1 de bobina física existente
- **Projeto:** MakerCusto, desenvolvimento próprio. **Autorização:** proprietário respondeu `ok` à proposta de auditar integralmente as 39 políticas e começar implementação por lotes, mantendo merge/deploy reservados.
- **Horário de início observado (Brasília):** 20:59. **Horário final observado:** 21:06. **Duração efetiva:** não aferida; os minutos entre observações não são contabilizados como tempo trabalhado.
- **Fontes normativas consultadas:** `PLANO_MESTRE_MAKERCUSTO.md`, `CONTINUIDADE.md`, `PADROES.md`, `BACKLOG.md`, `MODELO_DE_DADOS.md`, `HOMOLOGACAO_PERMISSOES_2026-11-20.md`, `HOMOLOGACAO_CADASTROS_2026-11-20.md`, `HOMOLOGACAO_ESTOQUE_2026-11-20.md`, `HOMOLOGACAO_PRODUCAO_2026-11-20.md`, `HOMOLOGACAO_*_P01..P09_2026-11-20.md`, `HOMOLOGACAO_*_GAP01/GAP02_2026-11-20.md`.
- **Auditoria:** matriz individual em `docs/MATRIZ_ADERENCIA_39_HOMOLOGACOES.md`, conferidas as 39 políticas (5 estruturais, 8 diretrizes, 4 técnicas, 6 estoque, 5 produção, P01–P09 e GAP01/GAP02). Após L1: **17 parcialmente cobertas, 22 sem fluxo correspondente demonstrado, nenhuma integralmente comprovada**. Verificados `src/domain/cost.ts`, `src/data/supabase.ts`, painéis e testes; `list_tables` do Supabase retornou 33 tabelas públicas com RLS ligado, mas sem eventos de estoque/produção existentes antes desta etapa.
- **L1 código e banco:** migração `20261122210500_initial_spool_inventory.sql` criou RPC transacional de inventário de bobina física pré-existente e listagem com saldo, proveniência de quantidade, custo desconhecido/estimado e idempotência; `20261122211000_spool_inventory_hardening.sql` fortaleceu comparação de reenvio e revogou escrita direta de lotes/movimentos/eventos dos papéis do cliente. API e interface `MaterialsWorkspace.tsx` incorporadas ao módulo Materiais do login, com testes Playwright desktop/mobile.
- **Resultados efetivamente comprovados no banco:** criação de bobina teste (325,125 g, custo desconhecido), leitura de saldo, reenvio idêntico sem duplicação, recusa da mesma chave com origem de quantidade diferente, recusa de oficina não autorizada; execução em transação com `ROLLBACK`, consulta posterior comprovou 0 bobinas/lotes/eventos de teste persistentes e 4 produtos reais preservados. Consultas `has_table_privilege` comprovaram `authenticated` sem INSERT/UPDATE no lote e sem DELETE/TRUNCATE nos movimentos; EXECUTE da RPC concedido somente a autenticados.
- **Evidências GitHub:** `docs/MATRIZ_ADERENCIA_39_HOMOLOGACOES.md`; migrações e componentes na branch `feat/fundacao-makercusto`; commits `8d2faecad1ff8d8458543a8ab408a84ce2e8f7ab`, `fe32ab5171e1125db8305114a60d00cf0bc88c09`, `3386f3907cbbd9b4653cca32877db6d029aa1838`, `de1ea9d560d85bb7dc3b8f454971faa6f5a18237`.
- **Pendências:** CI e validação de interface com sessão real; cadastrar bobina real **somente quando o usuário informar sua quantidade física**; L2 execução de impressão e L3 confirmação idempotente de consumo/estoque permanecem pendentes. Nenhum deploy/merge; nenhuma quantidade ou compra reais inventadas.


### Complemento de validação — 22/11/2026
- **CI concluído:** GitHub Actions #45086849957, `success`, para o HEAD `1713872b871783a681b5b9b03d82687546e04c67`. TypeScript, build, 11 testes unitários e **80 E2E desktop/mobile** aprovados. Evidência: https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45086849957 .
- **Security Advisor (leitura):** o Supabase reporta 11 avisos de funções `SECURITY DEFINER` executáveis por `authenticated`, incluindo RPCs intencionalmente expostas e helpers de RLS; é necessário revisar função a função antes de declarar segurança completa. Reporta também proteção contra senhas vazadas desativada, sem alteração feita nesta sessão. Remediação Supabase: https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable e https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection .
- **Limite:** CI usa API simulada; autenticação real, telas publicadas, usuários cruzados e operação física ainda não homologados. Merge/deploy não realizados. Atualização documental apenas, sem alteração adicional em código/SQL.


## 22/11/2026 — L2/L3, primeira entrega versionada
- **Projeto/cliente:** MakerCusto, desenvolvimento próprio.
- **Horário de referência (Brasília):** início observado em 21:13; término e duração efetivamente trabalhada não aferidos. Não contabilizar intervalo de relógio como horas efetivas.
- **Atividades realizadas:** leitura dos quatro documentos exigidos e das homologações de estoque, produção, reservas e confirmações; inspeção de migrações e contratos; implementação de RPCs de impressão e confirmação incremental na migração `20261122212500_print_execution_l2_l3.sql`; UI autenticada Impressões; integração REST/navegação; teste de fluxo L2 com mock de API; reforço de validações de payload e tempo desconhecido.
- **Resultado:** arquivos gravados na branch `feat/fundacao-makercusto` em commits de `658e0875de3f47a8bc7cb5350fcd8cb1d1b73e7c` até os commits desta etapa. Nenhum dado de produção real foi gravado; sem merge ou deploy.
- **Pendências:** conferir CI do HEAD, testar migração em ambiente isolado com rollback (idempotência, estoque, concorrência, acesso cruzado); aplicar SQL apenas após validação e autorização apropriadas; homologação visual; rateio e encerramento L4. Sem testes SQL executados até este registro.
- **Evidências:** https://github.com/jeffersonfukner-hue/makercusto/pull/1 ; migração `supabase/migrations/20261122212500_print_execution_l2_l3.sql`; teste `tests/app.spec.ts`; GitHub Actions da branch.


### Resultado do CI do L2/L3 — 22/11/2026
- **Observação final (Brasília):** 21:23. **Duração efetiva comprovada:** não aferida; não converter intervalo de observação em horas.
- **Primeira execução:** #45087914358 falhou em quatro testes de interface (seletores/expectativa de Impressões ainda desabilitada), mantendo 78 testes aprovados; comportamento corrigido pelo commit `ca7ef53028f99795b4fc71d43f2d5af76b2dfbb6`.
- **Execução final funcional:** #45088224296 **success**, commit `ca7ef53028f99795b4fc71d43f2d5af76b2dfbb6`, TypeScript, 11 testes unitários, build e **82/82 testes Playwright desktop/mobile** aprovados.
- **Evidência:** https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45088224296
- **Limites:** frontend testado com REST simulado; migração L2/L3 não aplicada nem testada transacionalmente no Supabase; sem confirmação de estoque real, merge ou deploy. Nenhuma política das 39 pode ser reclassificada como integralmente comprovada por esse CI.


## 22/11/2026 — Inspeção segura e preparação dos testes L2/L3
- **Projeto/cliente:** MakerCusto / próprio. **Início/término efetivos, duração:** não medidos; referência local da conversa não é hora trabalhada.
- **Atividades:** consulta de changelog/instruções atuais do Supabase; listagem de projetos disponíveis; leitura de migrações aplicadas e esquema das tabelas no banco MakerCusto, sem escrita; comparação com RPCs versionadas; reforço da validação de saída e lotes de filamento; criação do roteiro SQL reversível `supabase/tests/l2_l3_rollback.sql`.
- **Resultados observados:** banco MakerCusto tem Postgres 17.12, 0 produções, 0 confirmações e 0 movimentos. RPCs L2/L3 não instaladas. Testes automatizados de lógica SQL **ainda não executados**, pois nenhum ambiente MakerCusto isolado foi identificado. Kit Casa Pré LAB não foi alterado.
- **Evidências:** migração `supabase/migrations/20261122212500_print_execution_l2_l3.sql`, roteiro `supabase/tests/l2_l3_rollback.sql`, commits `c49cb6e26f67dedac7956d12daeab8cf61d79d7d` e `bf22c505fe7c6d394bd72beb7df5d1ffa69a13db`, consultas somente leitura ao Supabase.
- **Pendências:** ambiente isolado para instalar migração, execução real com rollback, teste de concorrência multi-sessão e usuários reais, snapshots/concilição P01/P02, homologação de produção.
- **Sem:** merge, deploy, SQL aplicado, manipulação de estoque ou consumo de créditos pagos.


## 22/11/2026 — Fortalecimento da confirmação L3 e CI
- **Projeto/cliente:** MakerCusto / próprio.
- **Início/término e duração efetiva (Brasília):** não aferidos; não computar tempo de conversa ou de execução do GitHub Actions como horas trabalhadas.
- **Atividades efetivas:** consulta do resultado anterior #45090668995 (success); verificação de que não há PostgreSQL local utilizável neste ambiente; leitura do código L3 e teste SQL isolado ainda não executado; validação preventiva da interface para rejeitar unidades fracionárias, unidades adicionais além do restante previsto e massas com mais de três casas decimais; testes Playwright de reenvio após erro com a mesma chave de idempotência e de impedimento de requisições com deltas inválidos.
- **Resultados comprovados:** CI #45094382511 `success` no commit `9645a86e71314cfeac049fb5a065c4b84964742f`; TypeScript, motor unitário, build e **86/86 testes de interface desktop/mobile aprovados**.
- **Evidências:** https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45094382511 ; commits `3ba56cd6110567ae3b9714e56ff1eb2b2d6cb03a`, `9645a86e71314cfeac049fb5a065c4b84964742f`.
- **Limites:** o CI usa REST simulado para o fluxo L3. A migração SQL `20261122212500_print_execution_l2_l3.sql` permanece sem execução transacional em PostgreSQL de teste e sem aplicação no Supabase MakerCusto. Conformidade de concorrência, saldo, RLS e autoria no banco ainda **não comprovada**.
- **Sem merge, deploy, mudança no banco, dados reais de produção ou gastos pagos autorizados.**

## 22/11/2026 — CI PostgreSQL isolado para regressão L2/L3
- **Projeto/cliente:** MakerCusto / desenvolvimento próprio.
- **Início/término e duração efetiva (Brasília):** não aferidos, não contabilizar intervalo entre mensagens ou duração do CI como horas de trabalho humano.
- **Atividades executadas:** verificação de infraestrutura local (sem servidor PostgreSQL instalado); leitura do contrato de CI; criação de `supabase/tests/bootstrap_ci_auth.sql` e `supabase/tests/fixture_ci_l2_l3.sql`; adaptação do `.github/workflows/ci.yml` com serviço PostgreSQL 17 efêmero, aplicação das migrações em DB descartável e execução automática do roteiro reversível já versionado.
- **Resultados comprovados:** #45095409926, `success`, SHA funcional `cd1f58729587c279e822d5b972ab9f998ab2bc03`; SQL de L1/L2/L3 executou sem erro em PostgreSQL 17, verificou replay, rejeição de conteúdo divergente, saldo disponível insuficiente, bloqueio de usuário estranho e rollback; verificação final de 0 produções registradas após rollback. Tipagem, testes unitários, build e **86/86 Playwright desktop/mobile** aprovados.
- **Evidências:** https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45095409926 ; commits `933abd48e40d904247fb2859c8a46607309dba4e`, `72549f7038b62ede716491fbfde97c7774db68d0`, `cd1f58729587c279e822d5b972ab9f998ab2bc03`.
- **Pendências/limites:** concorrência simultânea, JWT real/RLS, cenários multioficina e reservas; custos financeiros e movimentação de produto acabado permanecem pendentes. Teste SQL usa identidade simulada em banco descartável, não garante segurança operacional integral.
- **Sem alterações no Supabase real, merge, deploy ou contratação de serviço externo pago.**

## 22/11/2026 — Concorrência L3 e isolamento RLS, execução no CI
- **Projeto/cliente:** MakerCusto (desenvolvimento próprio).
- **Início/término/duração efetiva em Brasília:** não aferidos; não calcular tempo efetivo a partir das mensagens nem do runtime de CI.
- **Atividades executadas:** criação do script `supabase/tests/l2_l3_concurrency.sh`, configuração do CI para iniciar duas sessões PostgreSQL concorrentes contra a mesma bobina sintética e verificar resultado, saldo e isolamento de identidade por RPC e SELECT sob papel `authenticated`.
- **Resultados comprovados:** GitHub Actions #45095841121 `success`, commit `20dac01db2c3b7889f8586da237bf8f6357d8dac`; uma confirmação de 7 g aprovada e a segunda de 7 g rejeitada contra saldo de 10 g, saldo final 3 g; uma confirmação registrada; outra identidade sem leitura de execuções/movimentos e sem permissão para confirmar. Regressão SQL anterior e 86/86 E2E desktop/mobile aprovados, tipagem, unitários e build aprovados.
- **Evidências:** https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45095841121 ; commits `1ee8c318b96349e4108ad76ad3adc2aa23a45222` e `20dac01db2c3b7889f8586da237bf8f6357d8dac`.
- **Pendências:** autenticação JWT real, RLS no Supabase remoto, reserva ativa e reconciliação P01, lançamento de estoque acabado e snapshots conciliados, fechamento seguro L3/L4. Sem merge, deploy ou alteração de dados no Supabase MakerCusto.

## 22/11/2026 — Preflight/postflight L2/L3 e plano de implantação controlada
- **Projeto/cliente:** MakerCusto / próprio.
- **Horários observados (Brasília):** primeira consulta de relógio 23:13, verificação posterior 23:17. Estes pontos não comprovam início e término exatos da execução. **Duração efetiva: não aferida.** Sem converter o intervalo entre observações em horas de trabalho.
- **Atividades efetivas:** leitura de AGENTS/README/CONTINUIDADE/ARQUITETURA/PADROES/matriz/migração; consulta somente leitura ao banco MakerCusto para versão PostgreSQL, contagens, objetos SQL, constraints e políticas; consulta de security advisor e documentação oficial; criação do preflight e postflight SQL, integração ao CI descartável e elaboração do plano de aplicação/recuperação.
- **Resultados verificados:** banco real sem L2/L3 instalado e com contagens operacionais zeradas; preflight de leitura executado sem erro no banco real; CI #45099111748 **success**, commit `6ab26e701889f152c44c0800e84ee125ace1ac20`: PostgreSQL 17 preflight, DDL L2/L3, postflight de grants/RLS/RPCs, rollback, teste concorrente e 86/86 Playwright desktop/mobile aprovados, além de tipo/unitários/build.
- **Evidências:** https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45099111748 ; `supabase/tests/l2_l3_preflight_readonly.sql`; `supabase/tests/l2_l3_postflight_readonly.sql`; `docs/PLANO_APLICACAO_CONTROLADA_L2_L3.md`; commits `141ffe6a797f589af43063b74cec90171b31e416`, `19aa5d9dd848b1c753a9863222996e33119bfa82`, `5a39ad9afe10993b5e2001108537d9fc63c4c4ad` e `6ab26e701889f152c44c0800e84ee125ace1ac20`.
- **Pendências:** autorização específica para migração do esquema operacional MakerCusto, avaliação de backup/janela e teste de autenticação real; reservas, snapshots financeiros e produção acabada ainda não estão homologados.
- **Sem merge, deploy, DDL no banco operacional ou contratação de serviço pago.**


## 22/11/2026 — Aplicação autorizada da migração L2/L3 no Supabase MakerCusto
- **Projeto/cliente:** MakerCusto / próprio.
- **Autorização:** proprietário escreveu “pode alterar”, em continuidade à etapa específica de aplicação da migração L2/L3, sem autorização de merge/deploy.
- **Horários de início/término/duração efetiva (Brasília):** não aferidos com precisão; referência de conversa em torno de 23:25; **não converter essa referência em horas trabalhadas**.
- **Atividades efetivamente executadas:** leitura da skill Supabase; confirmação do projeto-alvo e das migrações existentes; execução de `l2_l3_preflight_readonly.sql` no Supabase; aplicação exclusiva da migração SQL versionada `20261122212500_print_execution_l2_l3.sql`; pós-verificação de migrations, schema, RPCs, RLS/grants e contagem de registros; consulta ao Security Advisor.
- **Resultados comprovados:** `apply_migration` retornou `success: true`; migração no histórico: **`20261123022622_print_execution_l2_l3`**; postflight em somente leitura passou sem erros; RPCs e tabela L2/L3 instaladas; **0 produções, 0 confirmações e 0 movimentos** depois da implantação. RLS da nova tabela ativo, `anon` sem SELECT, `authenticated` sem INSERT direto.
- **Evidências:** migração `supabase/migrations/20261122212500_print_execution_l2_l3.sql` (blob `914ee07a10bcf41638f623eec576a334837ae968`); scripts `supabase/tests/l2_l3_preflight_readonly.sql`, `supabase/tests/l2_l3_postflight_readonly.sql`; histórico de migrações Supabase MakerCusto `20261123022622`; último CI isolado de revisão `https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45099111748`.
- **Pendências:** validar RLS e RPCs com usuários Supabase Auth reais, conciliação de reservas, fechamento, rateio financeiro e produto acabado; Security Advisor mantém 14 avisos sobre acesso autenticado a SECURITY DEFINER (inclui os três novos) e um aviso sobre proteção contra senhas vazadas.
- **Sem:** merge, deploy, criação de produção/bobinas fictícias no banco operacional, movimento de estoque ou operação paga autorizada.

## 22/11/2026 — Auditoria de grants e regressão multi-oficina L2/L3
- **Projeto/cliente:** MakerCusto, desenvolvimento próprio.
- **Início/término e duração efetiva (Brasília):** não aferidos; não inferir horas trabalhadas de intervalos entre mensagens, pesquisas e execuções CI.
- **Atividades executadas:** consulta somente leitura ao Supabase MakerCusto de contagem de oficinas, membros e eventos; inspeção dos grants das três RPCs e RLS da tabela de eventos; teste de leitura com identidade não membro simulada; inclusão no CI de cenário com duas oficinas e duas produções sintéticas, correção de falha de declaração Bash e repetição completa do pipeline.
- **Resultados comprovados:** `anon` sem EXECUTE em três RPCs, `authenticated` sem INSERT direto na tabela de eventos, RLS ativo e nenhuma produção/confirmacão/movimento operacional criado. Primeiro CI #45101027589 falhou por erro do script de teste; CI **#45101156582 success**, SHA `00e79a1c1612cab8eaba0fb6da1102776a99604e`, isolamento de duas oficinas com dados fictícios aprovado, regressão SQL e concorrência aprovadas, **86/86 Playwright** desktop/mobile aprovados, tipagem, unitários e build aprovados.
- **Evidências:** https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45101156582 ; https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45101027589 ; arquivo `supabase/tests/l2_l3_cross_workspace.sh`; commits `c13bdd469d50e7b7fe9cb6b4ee218329acf0de92`, `af00e637e1863508fb2ec4ea558f24d59f6e4886`, `00e79a1c1612cab8eaba0fb6da1102776a99604e`.
- **Pendências:** autenticação real com JWT/Supabase Auth, operação autorizada por perfil no sistema conectado, reservas/reconciliação, snapshots financeiros, estoque de produtos acabados e fechamento L3. Nenhum merge, deploy, alteração de estoque ou custo pago.

## 22/11/2026 — Tempo incremental e falhas de impressão L3
- **Projeto/cliente:** MakerCusto / próprio.
- **Horários de início/término e duração efetiva (Brasília):** não aferidos; não contar execução remota do CI nem intervalo entre mensagens como tempo dedicado.
- **Atividades executadas:** revisão de regras RES/PAR/FAL/RET/RAT da homologação de produção; revisão de `supabase.ts`, `PrintsWorkspace.tsx` e regressões; consulta de ferramenta Supabase para viabilidade de teste JWT real (sem sessão/credenciais disponíveis, nenhum usuário criado); implementação do campo de tempo real incremental em L3, precisão máxima de quatro casas, suporte a falha com zero peças boas, envio do tempo para a RPC; ampliação dos testes E2E e do ensaio SQL reversível de falha e consumo.
- **Resultados comprovados:** CI #45101704098 `success` no commit funcional `6ee2ba011bd366fa9202a1000a86a1f9b845323c`, **86 Playwright** aprovados (desktop/mobile), tipos, unitários, build, SQL regressivo, concorrência e isolamento. Teste SQL demonstrou uma peça rejeitada e zero boas, consumo de 1 g e tempo registrado de 0,5 h em banco PostgreSQL descartável.
- **Evidências:** https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45101704098 ; commits `751ace53ea197c747b203898ad43b0f08f96d63a`, `1885e072434fbec73c7a37f2cae9d12d3369219d`, `015695c0bbcda57c026b306d56c8350dde654eb0`, `6ee2ba011bd366fa9202a1000a86a1f9b845323c`.
- **Pendências:** autenticação real por JWT, restauração/concilição de reservas, custos, estoque acabado e encerramento. O CI simula REST para a interface e identidade para SQL, não equivale à homologação real.
- **Sem:** merge, deploy, alteração do banco operacional ou utilização de créditos pagos.

## 22/11/2026 — P01: reserva lógica de filamento e conciliação incremental
- **Projeto/cliente:** MakerCusto / desenvolvimento próprio.
- **Início/término e duração efetiva (Brasília):** não aferidos, não calcular horas de trabalho pelo intervalo entre mensagens nem tempo do CI.
- **Atividades efetivamente executadas:** revisão de `AGENTS.md`, documentação P01/RES/GAP01 e tabelas de produção e estoque; criação da migração P01 parcial com RPC idempotente de reservas, conciliação transacional de consumo e auditoria de excedentes; criação de RPC restrita para listar reservas; implementação do formulário de reservas com saldo físico menos reserva, lista de pendências e reenvio seguro; ampliação das regressões SQL e Playwright; teste concorrente em duas sessões.
- **Primeiro resultado de CI com falha:** #45102367111 falhou no script de teste por referência a `created_at` inexistente em `mc_audit_events` (o campo real é `occurred_at`). O roteiro foi corrigido e tornada determinística a seleção de auditoria, sem alteração no Supabase real.
- **Resultados comprovados:** #45102625594 `success` com **88/88 Playwright**, tipos, unitários, build e testes transacionais P01; #45102955980 `success` (commit `728fa31b0df4b1f7ff41e3fab98c89a92c970b10`), incluindo reserva concorrente de 60 g + 60 g sobre 100 g: uma aprovada, uma rejeitada, saldo físico mantido em 100 g e somente 60 g logicamente comprometidos.
- **Evidências:** https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45102955980 ; https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45102625594 ; arquivos `supabase/migrations/20261122235000_print_reservation_p01_partial.sql`, `supabase/tests/p01_reservations_rollback.sql`, `supabase/tests/p01_reservation_concurrency.sh`; commits `d781fe5a8ac24d1732912cb447878ecf1800450b`, `6727b195587c00a19694bf3af8e97e79e2e8c648`, `728fa31b0df4b1f7ff41e3fab98c89a92c970b10`.
- **Pendências:** **migração P01 complementar ainda não aplicada** ao Supabase real; testes JWT/Auth reais, liberação de sobras no fechamento/cancelamento, troca de lote, prazo opcional, ajustes excepcionais GAP01, conciliação financeira, estoque de acabados e homologação visual permanecem.
- **Sem merge, deploy, alteração operacional de banco/estoque ou custo pago.**


## 23/11/2026 — P01-A/B e regressão de cancelamento concorrente
- **Projeto/cliente:** MakerCusto / desenvolvimento próprio.
- **Horários de Brasília:** relógio consultado no início da atividade indicava **00:02** e durante a verificação **00:10**, em 23/11/2026. Esses horários são pontos de observação, **não aferição de início/término de trabalho**. Início efetivo, término efetivo e duração efetiva: **não aferidos**; não converter intervalo nem execução do GitHub Actions em horas trabalhadas.
- **Atividades efetivamente executadas:** revisão de AGENTS/README/ARQUITETURA/PADROES/CONTINUIDADE, P01/GAP01 e SQL; criação da migração `20261123001000_print_reservation_p01_lifecycle.sql` com data opcional de revisão e cancelamento da ordem com liberação das sobras, idempotência e auditoria; criação de teste SQL reversível P01-A/B; adição de RPCs tipadas no frontend e UX com revisão vencida sem liberação automática e confirmação de cancelamento com motivo; novo teste de interface; criação de teste de concorrência cancelamento versus confirmação e inclusão de ambos no CI.
- **Resultados comprovados:** CI #45104085956 `success` no commit funcional `53a3456c4893bfbee8d64c73b8deb5826f4eec74`; **90 testes Playwright aprovados**, tipagem, unitários, build, regressões SQL com rollback, RLS multi-oficina e testes P01-F. SQL comprovou liberação da reserva restante (exemplo sintético: 40 g reservados, 15 g consumidos, 25 g liberados), preservação da baixa de 15 g e do tempo efetivo de 0,75 h, auditoria e replay sem duplicações; duas sessões concorrentes de cancelamento/confirmação aprovadas.
- **Evidências:** https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45104085956 ; `supabase/tests/p01_lifecycle_rollback.sql`, `supabase/tests/p01_cancel_confirmation_race.sh`, `tests/app.spec.ts`; commits `96eac6d5f1cd5dbd51601b5a8a45fa2d9167fb31`, `60568a8d74e217e0ece57fac5206b5222a1b851b`, `a54d0ec16d3d9fa23b7c29442edbea3f9f2fcf95`, `7e23ffa00aa62e066a2f249f5ca34703c27acdfe`, `d7acb7a1e7f01dfdc77917bea2256b41bd59f3ad`, `53a3456c4893bfbee8d64c73b8deb5826f4eec74`.
- **Pendências:** P01-E cancelamento parcial, ajustes de troca de lote, GAP01, encerramento definitivo/rateio, integração autenticada via JWT real e validação visual. Migrações P01 preparadas e testadas **somente em PostgreSQL descartável**, sem aplicação no Supabase real.
- **Sem:** merge, deploy, alteração operacional de banco, movimentos reais de estoque ou consumo de crédito pago.


## 23/11/2026 — Implementação e regressão P01-E de cancelamento parcial
- **Projeto/cliente:** MakerCusto / desenvolvimento próprio.
- **Horários (Brasília):** referência de relógio de 00:13 e 00:22 em 23/11/2026, sem comprovação de início e término efetivos de trabalho. **Duração efetiva não aferida; não contabilizar o intervalo entre observações nem a execução CI como tempo trabalhado.**
- **Atividades efetivamente executadas:** conferência de documentação P01/GAP01, esquema de produções/saídas/reservas, criação da migração parcial `20261123002000_print_reservation_p01_partial_cancel.sql`; RPC idempotente e auditável de redução de peças não produzidas e liberação manual por reserva em gramas; regressão SQL com rollback; integração de API tipada, formulário P01-E e Playwright; correção de conflito entre nomes acessíveis identificado no primeiro CI; nova verificação de todos os testes.
- **Resultados comprovados:** CI #45105318775 `success` (SHA `92e310ed365cae2b25a7ac963da1ca30c4498420`), **92/92 Playwright desktop/mobile**, tipos, unitários, build, SQL e proteção transacional. Teste com dados sintéticos: 5 peças planejadas, 3 confirmadas, novo planejamento 3; reserva inicial 50 g, consumo físico 30 g, liberação explícita 12 g e restante 8 g; auditoria, replay, bloqueio de reduzir abaixo do confirmado, acesso não autorizado e tentativa de liberar reserva alheia. **Sem alteração de dados reais**.
- **Falha e correção documentadas:** CI #45104928376 com 2 Playwright falhos devido à ambiguidade do nome do novo campo com o campo anterior; corrigido nos commits `ab080f0274716c553a1fa150349d9abf8dca025a` e `92e310ed365cae2b25a7ac963da1ca30c4498420`.
- **Evidências:** https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45105318775 ; https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45104928376 ; `supabase/tests/p01_partial_cancel_rollback.sql`, `tests/app.spec.ts`; commits `80fe7d204fc96cf435507cdeb5087a097ac2746f`, `fcafc06c66e6c02624a9c5b14f5e7f9ae840c046`, `e20e52145b19fe19dfd3060620c7d48405796865`, `307aeee5899b5f011f91f078780be131a327fa36`, `62f0d073ae71e0ec1b51756c57a1a0356092f4dd`, `5ee38fe085ff89096f7f64104c21c8183af9e7f9`, `92e310ed365cae2b25a7ac963da1ca30c4498420`.
- **Pendências:** P01-D troca de bobinas, GAP01, encerramento/rateio, testes JWT/Auth reais e validação visual. Migrações P01 continuam somente na branch.
- **Sem:** merge, deploy, aplicação de SQL no Supabase operacional, movimentações de estoque real ou gastos pagos.


## 23/11/2026 — P01-D: troca de bobina, histórico de lote e testes de concorrência
- **Projeto/cliente:** MakerCusto / desenvolvimento próprio.
- **Horários de Brasília observados:** 00:26 (recebimento da autorização de continuidade e início do lote na conversa) e 00:41 (consulta de relógio após CI). **Não representam medição de início e término efetivos**. **Duração efetiva não aferida**; não contabilizar o intervalo entre mensagens ou duração do CI como trabalho.
- **Atividades efetivamente executadas:** leitura de AGENTS, README, ARQUITETURA, PADROES, CONTINUIDADE, políticas P01/GAP01 e migrações anteriores; criação da migração complementar de troca de reserva por bobina com locks, auditoria, idempotência e segurança de saldo; regressão SQL de custos distintos por `lot_id`, preservação de snapshots e tentativas não autorizadas; teste de duas trocas simultâneas; integração de API tipada e formulário da oficina com valores de gramas independentes, justificativa e mensagens; ampliação de teste Playwright e correção de colisões de seletores da interface.
- **Resultados comprovados:** GitHub Actions **#45107132919 `success`**, SHA `01ec36ecfa8698e985fe1cd8a8303a144589aeee`; TypeScript, testes unitários, build e **94/94 Playwright desktop/mobile** aprovados. PostgreSQL 17 efêmero aprovou troca lógica com liberação parcial e consumo com snapshots de 0,068 e 0,073 R$/g preservados em lotes distintos, total sintético R$21,00; uma de duas transferências concorrentes aprovada, outra bloqueada, nenhum movimento físico adicional, trilha auditável.
- **Falhas/correções com evidência:** #45106352786 e #45106702737 falharam no Playwright por caixa de seleção antiga de bobina com nome não específico após inclusão do novo formulário; corrigidos commits `455d933fbf84f2085a1b5b740597362a9d1c88e5` e `01ec36ecfa8698e985fe1cd8a8303a144589aeee`.
- **Evidências:** https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45107132919 ; https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45106352786 ; https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45106702737 ; `supabase/migrations/20261123003500_print_reservation_p01_lot_swap.sql`, `supabase/tests/p01_lot_swap_rollback.sql`, `supabase/tests/p01_lot_swap_concurrency.sh`, `src/components/PrintsWorkspace.tsx`, `tests/app.spec.ts`. Commits de criação `f27e28d8735d2a1d17dd471ef95bb6607320a3d3`, `0f90470b8f12339e62b65b6acb39e45476186e69`, `a70aa558de33ddc6ee3be85818d669f365a8d2bc`, funcional aprovado `01ec36ecfa8698e985fe1cd8a8303a144589aeee`.
- **Pendências:** migrações P01 não aplicadas no banco real; JWT/Auth real, GAP01, fechamento definitivo/custeio e validação visual. **Sem merge, deploy, dados reais ou contratação de serviços pagos.**


## 23/11/2026 — GAP01-A: ocorrência física pendente sem baixa de estoque
- **Projeto/cliente:** MakerCusto / desenvolvimento próprio.
- **Horários Brasília observados:** 00:46 e 00:52 em 23/11/2026 (consultas pontuais). **Início e término efetivos não aferidos; duração efetiva não medida.** Não converter intervalo entre observações nem execução do CI em horas de trabalho.
- **Atividades efetivamente executadas:** revisão da política homologada GAP01-A–F, schema PostgreSQL e padrões Supabase de RLS/grants; criação da migração `20261123005500_gap01_physical_occurrences.sql` com registro pendente por impressão, massa, fonte, data/hora, autor, evidência e possível lote; restrição de acesso; RPC de listagem sem aprovação. Criação de `gap01_occurrence_rollback.sql` para caso de saldo cadastrado insuficiente, replay, histórico/auditoria, origem sem lote e negação de acesso. Integração de API tipada, formulário e lista GAP01 em Impressões; testes Playwright desktop/mobile, correção da expectativa textual de erro e rerun de CI.
- **Resultados comprovados:** CI `#45108226913` **success**, commit funcional `d94edd1a4deba1dc4f90c0d9aaa649c6fb15b7fa`, **96/96 Playwright** mais tipagem, testes unitários, build, transações SQL com rollback, concorrência e isolamento de oficinas. Em cenário sintético, 100 g fisicamente observados com bobina cadastrada em 80 g geraram ocorrência pendente, **nenhuma baixa nem entrada de estoque ou custo imputado**, auditoria apenas uma vez, acesso restrito e chave idempotente.
- **Evidências:** https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45108226913 ; https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45107869160 ; migração `supabase/migrations/20261123005500_gap01_physical_occurrences.sql`; teste `supabase/tests/gap01_occurrence_rollback.sql`; arquivos `src/components/PrintsWorkspace.tsx`, `src/data/supabase.ts`, `tests/app.spec.ts`; commits `1c701e46ba81af61079f3f2e794c7676d2190ef2`, `dea40176d6d94c7cc8492eafbf1b9b1bbb4fa0a7`, `acbca9a2e52f37c6501396f79b0daf02653a118d`, `95a7f720ac0c58d7678bda7f702fd1bae28a53be`, `56aad75140623af1882d865f4e87446fb7ba9577`, `fbbdd5cd9a34768f62e212579efb264633af8b03`, `d94edd1a4deba1dc4f90c0d9aaa649c6fb15b7fa`.
- **Falha corrigida:** CI #45107869160 teve dois E2E falhos por texto esperado com redação distinta da mensagem correta na tela; corrigido e aprovado no CI #45108226913.
- **Pendências:** estados e fluxos de investigação GAP01-B/F, proposta de ajuste GAP01-C sem aprovação/execução, eventos compensatórios GAP01-E, critérios e papéis para regularização extraordinária ainda pendentes de homologação; testes com JWT real e validação visual. Migração GAP01 e todas as P01 continuam somente na branch.
- **Sem merge, deploy, alterações no Supabase operacional, movimento físico de estoque ou custo pago.**


## 23/11/2026 — GAP01-B/F: histórico de investigação e acompanhamento sem regularização
- **Projeto/cliente:** MakerCusto / próprio.
- **Início e término efetivos (Brasília):** não aferidos por instrumento de tempo de trabalho; duração efetiva **não aferida**. Mensagens e CI não são prova de horas trabalhadas. Referência do recebimento da autorização: 23/11/2026 às 01:45 Brasília, **não** presumir início efetivo nesse instante.
- **Atividades executadas:** revisão de AGENTS.md, README, arquitetura, padrões, homologação GAP01 e migração GAP01-A; consulta de regras atuais de Supabase RLS/grants; criação da migração `20261123014500_gap01_investigation_tracking.sql` com tabela append-only de investigações, controle de status não financeiro, autorização por oficina, chave idempotente e auditoria; criação do teste SQL `gap01_investigation_rollback.sql`; inclusão no CI com PostgreSQL descartável; API tipada e formulário/lista de histórico; teste E2E desktop e mobile com falha de comunicação simulada e replay.
- **Resultado comprovado:** CI `#45113967113` `success` para commit funcional `926ef0f9eb6da8a246867b7a28f968af18f76d15`; 98/98 Playwright, tipagem, testes unitários, build, SQL rollback, concorrência, isolamento. Teste GAP01-B/F conferiu três eventos de investigação, transição registrada→análise→pendente de decisão→análise, original preservado, auditoria de autor, RLS e saldo físico inalterado. **Nenhum ajuste/custo/aprovação simulados como reais.**
- **Evidências:** https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45113967113 ; commits `08995160b62e29150af409e1950163d6cde5b9f7`, `ccc025264b0dc9f6e859581deaa8068c83595a7a`, `bbe2c6f70c3d7844289756d67603927476ca6503`, `396adb6e5214be03141fbb1cefe97bb01a3a6e42`, `78bc2097da301efd86cac64bdee36377bcbb4fa9`, `926ef0f9eb6da8a246867b7a28f968af18f76d15`; arquivos `supabase/migrations/20261123014500_gap01_investigation_tracking.sql`, `supabase/tests/gap01_investigation_rollback.sql`, `src/components/PrintsWorkspace.tsx`, `src/data/supabase.ts` e `tests/app.spec.ts`.
- **Pendências:** proposta GAP01-C (somente revisão humana sem execução), conciliação extraordinária e estorno GAP01-D/E com critérios e papéis ainda não homologados, autenticação com JWT real e validação visual. Migração não aplicada no Supabase operacional.
- **Sem merge, deploy, movimentação de estoque/custo real ou consumo de créditos pagos.**


## 23/11/2026 — GAP01-C: proposta de ajuste de inventário, sem lançamento
- **Projeto/cliente:** MakerCusto / próprio.
- **Horário de referência Brasília:** 11:03 em 23/11/2026 (início da interação); início efetivo e término efetivo de trabalho **não aferidos**; duração efetiva **não aferida**. Não contabilizar intervalo entre mensagens ou runtime do CI.
- **Atividades realizadas:** leitura de AGENTS, documentação homologada GAP01, continuidade e migrações; implementação de migração complementar `20261123110500_gap01_inventory_adjustment_proposals.sql` para propostas imutáveis com lote, origem, justificativa, evidência e idempotência, sem transação financeira/física; regressão SQL com ROLLBACK; integração no CI descartável; API tipada e formulário de proposta com lista de pendências e teste Playwright desktop/mobile.
- **Resultados comprovados:** CI #45190758841 `success`, SHA funcional `edc9bd898422d476d152298c8654aa4e022b5110`, **100/100 Playwright**, TypeScript, unitários, build, SQL e regressões de concorrência, permissões e isolamento. No cenário de teste, proposta de +50 g em bobina com estoque físico 80 g deixa o saldo em 80 g e preserva custo desconhecido; replay não duplica registro, proposta segue pendente de decisão.
- **Evidências:** https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45190758841 ; commits `0cfdb4dfe561e9ad724b28ca529a2d9e4c29b3a6`, `50df517966f32edae2eca0599d02246de8d225aa`, `dca6ca4fa1c265da254ec859a368aeadfbc4db96`, `477a27fe45d06392812676d287c1c70c731133e7`, `ded8061b3366a2a2936cc75b6f225ca48099fa54`, `edc9bd898422d476d152298c8654aa4e022b5110`; arquivos `supabase/tests/gap01_inventory_proposal_rollback.sql`, `src/components/PrintsWorkspace.tsx`, `src/data/supabase.ts` e `tests/app.spec.ts`.
- **Pendências:** autorização/evidência extraordinária ainda não homologadas, GAP01-D/E, JWT real, fechamento/custeio e homologação visual. Nenhuma migração GAP01-C no banco operacional.
- **Não houve:** merge, deploy, alteração no Supabase real, movimento físico real ou consumo de créditos pagos.


## 23/11/2026 — GAP01-D/E: análise de reservas e consumos históricos, somente leitura
- **Projeto/cliente:** MakerCusto / desenvolvimento próprio.
- **Horários de referência (Brasília):** 11:03 e 11:28 observados em 23/11/2026. **Início, término e duração efetivos não aferidos**, não atribuir automaticamente o intervalo entre mensagens, chamadas ou execução do CI a horas trabalhadas.
- **Atividades efetivamente executadas:** revisão de AGENTS/README/ARQUITETURA/PADROES/CONTINUIDADE, homologações GAP01/P01/P09 e migrações de produção; consulta de orientações de segurança RLS/Supabase; criação da migração `20261123112000_gap01_reconciliation_dossier.sql` com RPC consultiva por oficina, bobina potencial, saldo, reservas próprias/alheias, linhas de consumo com snapshots históricos e propostas; criação de `gap01_dossier_rollback.sql` com caso multiordem/sem lote, permissão, e afirmação de ausência de efeitos colaterais; inclusão no CI PostgreSQL descartável; integração de API tipada e painel consultivo no frontend, teste Playwright e ajustes preventivos de precisão do valor de exemplo e seletor E2E.
- **Resultados comprovados:** CI #45194048555 `success`, SHA funcional `f030c58467ccbc2189f94555b142ee77474c6fb3`; **102/102 Playwright**, SQL com rollback, concorrência, isolamento, tipagem, unitários e build. No cenário sintético, saldo físico 65 g após 15 g de consumo real confirmado, reserva própria restante de 5 g e reserva alheia de 10 g, sem liberação/compensação, eventuais propostas pendentes e sem alteração de saldo ou auditoria pela consulta. Sem custo imaginado ou cálculo automático do reversível.
- **Evidências:** https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45194048555 ; `supabase/migrations/20261123112000_gap01_reconciliation_dossier.sql`, `supabase/tests/gap01_dossier_rollback.sql`, `src/components/PrintsWorkspace.tsx`, `src/data/supabase.ts`, `tests/app.spec.ts`. Commits `8bf746636bca05e770c197f62e4132c2901de43c` (migração), `da9b3fe031549bade632a53301e3743fcb7d8893` (teste), `adc569cfcc0204fa195389d90936b20b9d27b56a` (CI), `a2fad6a69cff29c3ffd8f39b818039391d2dff8c` (API), `ce4093f3daa92ad79982a9fbf271de853fda0d84` (UI), `80c328382348b7e8abaa58d0492eedaee3a7c3ee` (E2E), `0857f017d9e184287508d675903aac42174859cf` e `f030c58467ccbc2189f94555b142ee77474c6fb3` (estabilização de teste).
- **Pendências:** critérios e aprovadores de regularização extraordinária não homologados, P09 real com movimentos referenciados e dependências, testes com JWT de usuário real, homologação visual, migrações P01/GAP01 não aplicadas ao Supabase operacional.
- **Não houve:** merge, deploy, alteração de produção, baixa de estoque real, custo financeiro ou uso pago.


## 23/11/2026 — proposta documental de autorização excepcional GAP01/P09
- **Projeto/cliente:** MakerCusto / projeto próprio.
- **Horários Brasília:** observações pontuais do relógio em **11:45** e **11:48** de 23/11/2026. **Início e término efetivos não aferidos; duração efetiva não medida.** Não tratar diferença entre consultas ou entre mensagens como horas comprovadas.
- **Atividades realmente executadas:** leitura de AGENTS.md, README.md, docs/ARQUITETURA.md, docs/PADROES.md, normas homologadas GAP01, GAP02, P09, P08 e Estoque, continuidade e matriz de 39 decisões; redação de `docs/PROPOSTA_HOMOLOGACAO_APROVACOES_EXCEPCIONAIS_GAP01_P09.md` com classes de risco, evidências por causa, alçadas numéricas explicitamente propostas e não vigentes, segregação de papéis, oficina individual, invariantes, estados e roteiro de homologação; releitura para verificar as 8 seções e avisos de não homologação.
- **Resultado:** proposta gravada somente na branch `feat/fundacao-makercusto`, commit `29b5f0d8cf6c2fe302b8a94e7b8c83fe652836eb`. O documento **não representa aprovação** nem alteração das 39 políticas; matriz mantida em **22 parciais, 17 ausentes, 0 completas**, como última contagem existente, não reavaliada nesta etapa.
- **Evidência verificável:** https://github.com/jeffersonfukner-hue/makercusto/commit/29b5f0d8cf6c2fe302b8a94e7b8c83fe652836eb ; caminho `docs/PROPOSTA_HOMOLOGACAO_APROVACOES_EXCEPCIONAIS_GAP01_P09.md`. Não houve testes SQL/Playwright nesta etapa, pois só houve edição documental.
- **Pendências:** homologação expressa dos seis grupos de decisão no novo documento; sem ela não habilitar aprovação/execução de ajuste excepcional ou estorno extraordinário.
- **Sem:** código, SQL, migração, merge, deploy, alteração do Supabase operacional, estoque real ou créditos pagos.


## 23/11/2026 — Calculadora/peças/conjuntos e padrão de UX
- **Projeto/cliente:** MakerCusto / projeto próprio.
- **Horários Brasília observados:** 12:46 e 12:48 em 23/11/2026; **horários reais de início/término e duração efetiva não aferidos**. Não contabilizar intervalo entre mensagens ou CI como tempo trabalhado.
- **Ações executadas:** inspeção de documentação, cadastro de produtos e migrações; descoberta e correção do painel de salvamento de cálculo oculto para logados; APIs e frontend de seleção de peças existentes para conjuntos, snapshots por revisão, recuperação de cálculos, navegação entre módulos; testes SQL e Playwright da guirlanda com três peças distintas; elaboração de `docs/PADRAO_UX_SIMPLES_DETALHES_AVANCADO.md` com padrão escolher/cadastrar/detalhes/avançado e complexidade opcional por campo.
- **Resultados comprovados:** CI #45208428395 `success`, funcional `963081a6571eb6a518827f65b255aa3bc8a943de`, **108/108 Playwright**, PostgreSQL efêmero com rollback, concorrência, isolamento, tipagem, unitários e build. Guirlanda e duas estrelas vinculadas por ID, sem duplicação e com histórico de custo preservado. Documento UX commit `e45bd1deef723e787fe436c17d2f3d7a374399f5`.
- **Evidências:** https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45208428395 ; `supabase/tests/component_linked_assemblies_rollback.sql`, `tests/app.spec.ts`, `src/App.tsx`, `src/components/ProductWorkspace.tsx`, `src/components/ProductSavePanel.tsx`.
- **Pendências:** implementação real e homologação visual do padrão UX por campo e Filamento, rateio de placa mista, autenticação real e migrações somente na branch. **Sem merge, deploy, SQL operacional ou créditos pagos.**


## 23/11/2026 — Auditoria de integração Calculadora, Peças, Conjuntos e Impressões

- **Projeto/cliente:** MakerCusto — desenvolvimento próprio.
- **Horários de início e término:** não aferidos. **Duração efetiva:** não mensurada; intervalo entre mensagens não computado como trabalho.
- **Atividades executadas:** leitura de AGENTS.md, README.md, ARQUITETURA.md, PADROES.md, PLANO_MESTRE_MAKERCUSTO.md, CONTRATO_ESTOQUE_PRODUTOS.md e inspeção de src/App.tsx, ProductSavePanel.tsx, ProductWorkspace.tsx, AssemblyPanel.tsx, PrintsWorkspace.tsx e data/supabase.ts; consulta ao PR e CI do HEAD.
- **Resultados:** diagnóstico de conectividade em docs/AUDITORIA_INTEGRACAO_MODULOS_2026-11-23.md; confirmados código de salvar cálculo, selector de peças e múltiplas saídas; lacunas de ficha detalhada, reentrada na calculadora e rateio guiado. Nenhuma hipótese de erro no banco declarada como fato.
- **Pendências:** confirmar versão implantada e registros de peças no mesmo workspace; implementar/testar integração de ficha, cálculo e conjunto; rateio de placas mistas; CI após futuras alterações.
- **Evidências:** commit documental 304d4f9c7d84329596c3625c58c3421c376782b2; PR https://github.com/jeffersonfukner-hue/makercusto/pull/1 ; CI aprovado do HEAD inicial https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45209805896.
- **Restrições:** sem alteração de aplicativo, migração, banco, merge ou deploy nesta auditoria.


## 23/11/2026 — Integração de navegação Ficha → Calculadora

- **Cliente/projeto:** MakerCusto — desenvolvimento próprio.
- **Início/término (Brasília):** não aferidos individualmente; **duração efetiva:** não mensurada, sem inferir pelo intervalo entre mensagens.
- **Atividades executadas:** edição de `src/components/ProductWorkspace.tsx` para consultar o último snapshot da peça/produto selecionado e oferecer ação contextual; edição de `src/App.tsx` para restaurar dados existentes via `applySavedCalculation` e navegar à calculadora após validação; preservados registro sem snapshot e histórico original.
- **Resultado comprovado:** commits `7c3f1e6cd5fe992d8242e5ffdd9a95f52c924379`, `43c74a7ec8392f3b59cb6ff1d6810d3eac931360`, `986ec69f1f621d64dc8c0eef6e6ba5d63730ca7f` na branch de trabalho.
- **Pendências:** CI do HEAD, testes E2E autenticados e homologação visual; salvar novo cálculo em cadastro existente ainda não implementado; sem integração de rateio para mesa mista nesta entrega.
- **Evidência:** https://github.com/jeffersonfukner-hue/makercusto/pull/1 . Nenhum merge, deploy ou alteração de banco.


## 23/11/2026 — Revisão de cálculo no mesmo cadastro, sem duplicação

- **Projeto/cliente:** MakerCusto — desenvolvimento próprio.
- **Horários efetivos de início e término (Brasília):** não aferidos. **Duração efetiva:** não mensurada; o intervalo entre mensagens não foi contabilizado.
- **Atividades executadas:** verificação da CI #354 (sucesso); auditoria SQL de `mc_save_calculated_product` e `mc_save_product_record`; implementação da RPC de revisão com idempotência/isolamento; integração de `App.tsx`, `ProductSavePanel.tsx`, `data/supabase.ts`; preparação de regressão SQL com rollback; atualização do workflow para PostgreSQL efêmero.
- **Resultado:** nova revisão permanece no mesmo `product_id`, sem alterar snapshots antigos conforme contrato implementado; código e testes versionados na branch, não executados no banco operacional. **A aprovação da lógica depende de CI**; nenhum resultado de teste foi presumido.
- **Evidências:** PR https://github.com/jeffersonfukner-hue/makercusto/pull/1 ; migração `supabase/migrations/20261123152000_append_product_calculation.sql` e teste `supabase/tests/product_calculation_revision_rollback.sql`; CI #354 previamente aprovado https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45212942492.
- **Pendências:** conclusão da CI do HEAD, aplicação futura da RPC apenas mediante autorização específica, E2E visual/autenticado e integração das placas mistas.
- **Restrições cumpridas:** sem alteração direta do Supabase, merge ou deploy; tempo trabalhado não estimado.


## 23/11/2026 — Barra de ações fixa e nome de produto em destaque

- **Projeto/cliente:** MakerCusto — desenvolvimento próprio.
- **Horários de início/término (Brasília):** não aferidos. **Duração efetiva:** não mensurada; não inferir trabalho pelo intervalo entre mensagens.
- **Atividades executadas:** inspeção dos componentes `ProductWorkspace`, `ProductSavePanel`, `SystemNavigation`, CSS responsivo e testes Playwright; criação do `FormActionDock`; substituição das ações principais dispersas nas fichas por rodapé fixo; nome exibido em destaque e campo Nome do produto acessível no rodapé da calculadora; ajustes mobile/sidebar e asserções E2E.
- **Resultados versionados:** `src/components/FormActionDock.tsx`, `src/components/ProductWorkspace.tsx`, `src/components/ProductSavePanel.tsx`, `src/styles.css` e `tests/app.spec.ts`. Commits da implementação: `df665ac`, `594153f`, `390b08e`, `aa44e2f`, `e4482b9`, `f042cf5`, `bd628d2`.
- **Pendências:** confirmação da CI do HEAD, homologação visual nos dois tamanhos, aplicar padrão a outros formulários em etapas apropriadas. Não declarar revisão visual aprovada.
- **Evidências:** PR https://github.com/jeffersonfukner-hue/makercusto/pull/1 ; histórico dos commits na branch `feat/fundacao-makercusto`.
- **Restrições cumpridas:** sem SQL aplicado, merge ou deploy; nenhum tempo de execução presumido.

## 23/11/2026 — Correção E2E e extensão do dock de ações

- **Projeto:** MakerCusto; **início/término (Brasília):** não aferidos; **duração efetiva:** não mensurada; intervalo entre mensagens não usado.
- **Trabalho executado:** consulta ao workflow #373; diagnóstico de seletor E2E ambíguo e correção; aplicação do componente `FormActionDock` no inventário de bobinas e em três operações principais de Impressões, com diferenciação de formulário ativo. Código documentado no relatório de continuidade.
- **Resultados verificáveis:** commits `91082fea`, `6c161955`, `d87bb8f`, `7cb6ffc`; PR https://github.com/jeffersonfukner-hue/makercusto/pull/1.
- **Pendências:** CI do HEAD, testes visuais, dock nas demais operações avançadas; migração SQL anterior ainda não aplicada ao banco operacional.
- **Restrições:** nenhuma alteração em Supabase, merge ou deploy.


## 23/11/2026 — Padronização avançada do rodapé de ações em Impressões

- **Projeto/cliente:** MakerCusto — desenvolvimento próprio.
- **Horários início/término (Brasília):** não aferidos; **duração efetiva:** não mensurada. Nenhum intervalo entre mensagens foi usado como jornada.
- **Atividades executadas:** consulta de CI #378 concluído com sucesso; inspeção do módulo `PrintsWorkspace`, padrões e testes; integração do rodapé fixo em oito operações adicionais com acionamento por formulário ativo e salvaguardas contextuais; extensão de testes Playwright sobre os principais fluxos e ausência de botões de outros formulários.
- **Resultados versionados:** commits `63e36e4edcaf02e3b5d51797e17fdf3f6c38783c`, `24fd5f71c09ef667ff5db3cb2b112da1a444d5fe`, `cf94c4ed7de757c2c0ea1f27ded5928498ecc36c`. Verificação anterior: https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45263293703
- **Pendências e evidências:** CI novo ainda não confirmado; homologação visual pelo proprietário pendente. PR https://github.com/jeffersonfukner-hue/makercusto/pull/1. Não foi feita alteração no banco, merge nem deploy.

## 23/11/2026 — Diagnóstico da CI e definição de responsabilidades

- **Projeto/cliente:** MakerCusto — desenvolvimento próprio.
- **Horário efetivo de início e término (Brasília):** não aferidos; **duração efetiva:** não mensurada. Não houve inferência de jornada pelo intervalo das mensagens.
- **Ações verificadas:** CI #378 `45263293703` aprovado; CI #382 `45264494581` concluído com falha E2E (testes de dock não ativado por seleção automatizada de campos, desktop e mobile). Logs e passos do CI consultados.
- **Execução:** correção de eventos `onChange` na seleção de formulários do módulo Impressões, com preservação da ação correspondente à seção ativa. Commit `79817b0cfe64f79a09742430691ca054edd2f767`. Documentado contrato: CI/testes/correções são responsabilidades do agente, deploy manual e homologação visual são responsabilidades do proprietário.
- **Evidência:** https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45264494581 ; https://github.com/jeffersonfukner-hue/makercusto/pull/1.
- **Pendências:** resultado final do CI sobre correção; revisão visual após aprovação. Sem merge, deploy, SQL em ambiente operacional ou outros gastos autorizados.

## 23/11/2026 — Persistência do contrato de responsabilidades

- **Projeto/cliente:** MakerCusto — desenvolvimento próprio.
- **Início, término e duração efetiva (Brasília):** não mensurados; não houve inferência de horas pelo intervalo de mensagens.
- **Atividade executada:** conferência do contrato já existente em `docs/CONTINUIDADE.md` e promoção para o arquivo normativo `AGENTS.md`, lido em novos chats. Formalizados os responsáveis por CI, correções, deploy manual e homologação, além de linguagem explícita para “NÃO FAÇA O DEPLOY AINDA” e “PODE FAZER O DEPLOY MANUAL”.
- **Evidência:** commit `d78a8dd5faf391d65314eeffa2e31751819e176a`; PR https://github.com/jeffersonfukner-hue/makercusto/pull/1.
- **Pendência:** CI do HEAD e homologação visual somente quando a versão estiver pronta. Sem merge/deploy/SQL operacional.


## 23/11/2026 — Motor P05/P06 para mesa compartilhada e prévia em Impressões

- **Projeto/cliente:** MakerCusto — desenvolvimento próprio.
- **Início/término (Brasília):** não aferidos; **duração efetiva:** não mensurada, sem inferir jornada por mensagens.
- **Atividades realizadas:** leitura de `AGENTS.md`, `docs/PADROES.md`, `docs/ARQUITETURA.md`, documentos homologados P05/P06; implementação de motor de rateio exato por categoria/destino, com regras de rastreabilidade, centavos residuais e bloqueio de bases inválidas; testes Vitest; interface para prévia manual e não persistida conectada à lista real de Impressões; teste Playwright de mesa com três produtos e ausência de escrita financeira.
- **Evidências:** commits `00ba7694c77f25e23c9206d18acdf67c3d9457f8`, `fe0355f422870fc896a5c2c2571262c66f25fdfe`, `74d19837be05f7c22ce7e6d7407e182dd9a984a8`, `66b7f6e57a744343f4b4b2dc1646908b4dbe7fc5`, `d6752e55c333611fa6b1fd8848e51bbf6a30122f`, `6eadfbab7f838b3be1b85d66ecd030bc9e5ec4ba`, `bba8e1f388157adbd459ce28095126e71bc09250`, `875e86a70661081bb2fe4f1c5e229b33ec1b2c89`; PR https://github.com/jeffersonfukner-hue/makercusto/pull/1.
- **Resultados/pendências:** código e testes commitados, CI final ainda não homologado neste registro. Integração persistente L4 e homologação visual pendentes. Sem merge/deploy/SQL operacional.

- **Verificação complementar da entrega L4:** CI #396 (`45273610045`), commit testado `a15ce4c6d9c08c0b1744be0a8a009bc818ffce3e`, **sucesso integral**: tipos, testes unitários, build, PostgreSQL temporário, concorrência/RLS e interface desktop/mobile. Evidência: https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45273610045 . Este CI não executa homologação humana nem deploy.


## 23/11/2026 — L4-R01, fonte histórica de consumo na prévia

- **Projeto:** MakerCusto; **início/término/duração efetiva (Brasília):** não aferidos, não estimados a partir das mensagens.
- **Atividades executadas:** revisão da migração L2/L3, `mc_production_consumption`, `mc_stock_lots` e funções de dossiê; nova RPC read-only com bloqueio por oficina; tipos no cliente; consulta de fontes na prévia L4, importação de valores por categoria com base manual e sem escritas; teste SQL de permissões, custo desconhecido e ausência de movimentações; ampliação E2E; workflow do PostgreSQL efêmero atualizado.
- **Commits verificáveis:** `dacf6b4f9b8d5b0b281490614c2ab3eeafadfd28`, `682b3da5e2bb27be39d4e284e178c026e00992d8`, `3bb1748c18a4fe15a26b1338399583ff63502a5f`, `73b7588e47f623570c202ee8e01f126d1c16bd32`, `2c2710bd3885d8d6e1b4ce98eeced9b2b00f84be`, `5f93b3815a08c59d1114917a9ccd7ca63fe3a2bb`, `1981e1f84eadf1c011621255f857385829e7e378`, `a466e90e596c61186d7af1dd18f3b3c103dd2ee5`; PR https://github.com/jeffersonfukner-hue/makercusto/pull/1.
- **Resultado:** mudança na branch, CI correspondente ainda em execução no momento do registro. Fonte de preço L3 tem apenas seis decimais; nenhum valor final L4 foi homologado.
- **Pendências:** CI completo, vínculo financeiro exato e snapshots finais, migração separadamente autorizada e homologação visual. Nenhum merge/deploy ou alteração no Supabase operacional.

- **CI confirmado após implementação:** GitHub Actions #406, run `45276261898`, commit `576dd4bede1b3f46966efde1da2889ecf2aec9d1` — **sucesso integral**, com testes SQL read-only, tipos, Vitest, build, concorrência/RLS e Playwright desktop/mobile. https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45276261898 . Nenhum merge/deploy ou aplicação operacional de migração foi executado.

## 23/11/2026 — L4-F, preparação de snapshot pendente e diagnóstico de origem

- **Projeto/cliente:** MakerCusto — produto próprio.
- **Data:** 23/11/2026 (Brasília). **Início/término:** não aferidos. **Duração efetiva:** não medida; não calculada pelo intervalo entre mensagens.
- **Atividades efetivamente executadas:** consulta de AGENTS.md, README, arquitetura, padrões, homologações P05/P06/P09 e continuidade; confirmação do CI #408 anterior; implementação de preparação financeira read-only com status necessariamente pendente, checagens por confirmação/categoria, origem duplicada, preço desconhecido/estimado e falta de precisão; testes unitários e ampliação da prova Playwright; diagnóstico exibido na prévia L4; contrato de snapshot futuro documentado.
- **Evidências:** commits `8926ce4e1259f92df81ba337dc4f6a0e2937ba4e`, `e96d015a1002c84c7ca3eb32033843d6f592d20c`, `424af42780e6ec80fe64d6477e0b1a0741365b56`, `5f0708bca71526212fbd5d3f533d5ffffa00cf26`, `d4af4a12ffb8baf93477b519e935be70edcf1301`; PR https://github.com/jeffersonfukner-hue/makercusto/pull/1.
- **Resultados:** código/documento/testes registrados em branch; novo CI deve ser conferido no HEAD antes de liberar qualquer etapa. Nenhum backend financeiro foi ativado, nenhum banco operacional alterado, nenhum merge/deploy realizado.
- **Pendências:** origem financeira exata P06, fechamento transacional auditável, autorização/RLS, estorno e homologação visual.

## 23/11/2026 — Origem financeira exata P06, domínio racional e testes L4

- **Projeto/cliente:** MakerCusto — produto próprio.
- **Início/término (Brasília):** não medidos; **duração efetiva:** não registrada. Não inferir jornada por troca de mensagens.
- **Atividades comprovadas:** leitura dos contratos técnicos e políticas P05/P06/P09, inspeção das colunas L3/estoque; implementação de tabela de origem financeira congelada por confirmação, trigger append-only, RPC segura read-only, cálculo racional compartilhado e custo por categorias; criação de testes SQL com rollback e unitários; atualização do CI em PostgreSQL efêmero.
- **Evidências (commits):** `7281b64e7e6f32dc0b1c17e10c12c27dac39e505`, `2c266b90288b0a505e86dce31457b1d4197d046d`, `89e287a1f2efd8d75cf60e13f1e1fec02afa6965`, `7eb3df03707526be07e02df0e31a5d7eff2ee8e7`, `dd868e1cf675078e2ef53203599b3dde5a0ce294`, `eab6c059236624c541c0edef483691857eaea37f`, `ade6abf7674f459ffee65e8195de32b177b109d1`, `ddfcd58c0844e62060f8658144a12367c67add29`, `c81e84953e54143dc0b5dbc419793efdb45a233b`; PR https://github.com/jeffersonfukner-hue/makercusto/pull/1.
- **Resultado:** alterações no GitHub na branch de desenvolvimento, sem migração operacional/merge/deploy. Novos registros são preservados com precisão original. CI completo do HEAD não estava concluído no momento deste registro.
- **Pendências:** verificação final de CI, agregação em snapshots financeiros imutáveis e fechamento transacional seguro com fontes P07, validação de autorização e homologação visual.

- **Evidência complementar:** CI #424 (`45285101720`) do commit `3bc75c41b4feb2c8d3be71543a1d347542d888d4` aprovado integralmente. Testados os novos contratos de captura de origem imutável, idempotência, proteção por oficina, origem desconhecida, aritmética racional P06, build e interface desktop/mobile. https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45285101720 . Nenhuma atuação no banco operacional ou deploy.

## 23/11/2026 — L4-G01: protocolo de revisão auditável e testes concorrentes

- **Projeto/cliente:** MakerCusto, desenvolvimento próprio.
- **Início/término/duração efetiva:** não mensurados; não inferidos pelo intervalo entre mensagens.
- **Atividades realizadas:** revisão de documentação e esquema financeiro; criação da migração de revisão L4 com chave idempotente, lock, RLS restritiva, checklist de evidências, relatório de origens e auditoria append-only; criação de teste SQL rollback, teste de concorrência por duas sessões e atualização de GitHub Actions. Nenhum snapshot financeiro final ou alteração de estoque incluídos.
- **Evidências:** commits `61bbbcc7c67e399f88de3177a72a0b1b0bafdf23`, `9358b7af44e495b40d7140023642fba46101fa04`, `939892a1d89baa0ac4eded5efa701ed756f11597`, `7f95d006c2de849967a134c6133c9d14af18ba10`, `6c9403a964ef26b17ff791c10136c86565c458b2`, `301d3623488ca56fc7726b8c25a7e7bbd88d42b1`, `b337b1705644d3359365018f55359bcecd03a441`; PR https://github.com/jeffersonfukner-hue/makercusto/pull/1.
- **Resultados:** código e testes submetidos à branch de desenvolvimento; CI do HEAD a verificar após este registro. Revisão permanece pendente; nenhuma função publica custo final, nenhum banco operacional foi modificado.
- **Pendências:** CI final, fontes P07 e demais categorias verificadas, snapshots finais e testes P09 antes de fechar custos, homologação visual do usuário.

- **Teste efetivamente concluído:** CI #433 (run `45287099185`), commit `98f55e814e3bf032540ba5a6f7d337defb9dce28` — aprovação integral de SQL transacional/rollback, duas sessões concorrentes, idempotência, permissões, testes unitários, build e interface desktop/mobile. https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45287099185 . Não executar deploy ou migração operacional com base neste resultado isoladamente.

## 23/11/2026 — L4-G02: dossiê de prontidão sem efeitos financeiros

- **Projeto:** MakerCusto. **Início/término (Brasília):** não registrados. **Duração efetiva:** não mensurada, sem inferir horas da conversa.
- **Atividades efetivamente realizadas:** releitura das homologações e esquema financeiro; implementação de RPC read-only para conferir prontidão real de execução e revisão histórica, com bloqueios explícitos e papéis de acesso; criação de teste SQL transacional com rollback de dados efêmeros e proibição de mutações; inclusão da nova migração e teste no CI.
- **Evidências:** commits `d663789140d0a630ea1c55d93c0f3db3f1696fa8`, `acc511902ad5781d57f58eca03a83ba23e3a1fe6`, `9d421e9130c4b713d6a2df7ce8c62a1ea6c65556`; PR #1 https://github.com/jeffersonfukner-hue/makercusto/pull/1. CI do lote em apuração.
- **Resultado:** dossiê implementado exclusivamente na branch, ainda com contabilização final proibida. Nenhum merge, deploy ou alteração de banco operacional.
- **Pendências:** resultado integral do CI; integração da conciliação exata P05/P06/P07 e estorno P09; homologação visual futura.


## 23/11/2026 — L4-G03: consulta de prontidão na interface de Impressões

- **Projeto:** MakerCusto. **Horários de início/fim:** não aferidos; **duração efetiva:** não registrada, sem estimativa pelo intervalo de mensagens.
- **Atividades efetivamente executadas:** leitura de `AGENTS.md`, continuidade, arquitetura/padrões, componentes existentes e contrato G02; adição de tipos/client RPC; componente read-only de dossiê com erros visíveis e prevenção de respostas atrasadas; integração por impressão; extensão do teste Playwright para bloquear interpretação de custos pendentes como fechados e verificar ausência de escrita.
- **Evidências:** commits `691fb40d9488cad231bc827d120b14a9f26707f2`, `60ce53ddf6bc237e508932622d76952eac25ea5e`, `ad06a274a9da875e1a669528d3d4778fa29a9bfc`, `72290216ce05826407f60a8e279dac3fd841c9c3`; PR https://github.com/jeffersonfukner-hue/makercusto/pull/1. CI no momento de edição: aguardando verificação do commit final.
- **Resultados:** integração adicionada à branch; nenhum merge, deploy ou alteração no Supabase operacional.
- **Pendências:** aprovação integral CI no HEAD, migrações operacionais somente após autorização explícita, e fechamento imutável P05/P06/P07/P09 ainda não implementado.


## 23/11/2026 — L4-G04: agrupamento exato de custos por categoria e peça

- **Projeto:** MakerCusto. **Data:** 23/11/2026 (Brasília). **Horários de início/término:** não aferidos. **Duração efetiva:** não medida nem inferida pela conversa.
- **Atividades executadas:** leitura de AGENTS.md, README, arquitetura, padrões, continuidade, contratos P05/P06/P09 e motores existentes; identificação do fechamento por linha como incompatível com fechamento agregado por categoria; implementação de conciliador puro por origem racional imutável, destino explicitamente atribuível e maior resto de centavos; teste unitário de subcentavos/multicor/perdas/custo desconhecido; conexão da consulta exata read-only com a tela de Impressões e teste de interface.
- **Evidências:** commits `9bc331403b5b8432d5b3b47b0829870a1289234e`, `95e515476a79032ec0bdc0879454d217a65c705a`, `595080d8ef735b648313613197e8a7f375130cff`, `b74761278c0aa17ba89796077411f7e285ea474b`, `edcfd77d361dad300f5445f0b88f6a7613a57b13`, `7d76d663e80fc7d120a2a0440f778c55169c1005`; PR https://github.com/jeffersonfukner-hue/makercusto/pull/1. O CI final será verificado no HEAD após este registro.
- **Resultados:** código, testes e integração em branch sem merge; não se gerou snapshot final nem migração nova. Nenhuma alteração de dados operacionais ou deploy.
- **Pendências:** CI final, conciliação das demais categorias com fontes comprovadas, autorização/imutabilidade do fechamento e compensações P09, migrações separadamente autorizadas, homologação visual.


## 23/11/2026 — L4-G05: domínio de energia P07

- Projeto: MakerCusto. Início/término e duração efetiva não aferidos; intervalo entre mensagens não contabilizado.
- Atividades: leitura de AGENTS, README, arquitetura, padrões, continuidade e homologação P07; implementação do motor racional de energia e cinco testes Vitest.
- Evidências: commits `524e720407fa5eb6e8efca7cb2f28bd4602417e9`, `77986504db93c8d1dc3ef12bcae743a0626052af`; PR https://github.com/jeffersonfukner-hue/makercusto/pull/1.
- Resultado: código e testes registrados na branch. CI ainda não confirmado; integração com fontes persistidas, interface, rateio e fechamento pendentes. Sem merge, deploy ou alteração operacional.


## 23/11/2026 — L4-G06: integração de tarifas e fases P07

- Projeto: MakerCusto. Início, término e duração efetiva não aferidos; intervalo entre mensagens não contabilizado.
- Atividades: revisão da estrutura existente de tarifas, impressão e autenticação; migração versionada de evidências; cliente tipado, adaptador de domínio, painel de tarifas/intervalos e integração à impressão selecionada; testes de regressão SQL rollback e Vitest; workflow atualizado.
- Evidências: commits `553afc68bca26a3006254c890efdc6c79910d08a`, `45ae8e35d3fae7220c668dee8703fced5d5d5dba`, `ffa936a16e146b2ec66738f359d9286b9b3b8a10`, `c9f6a3baf849cd89ee11e4d930ba922b80a4d3ca`, `12d89e048d68a04341fc7303941092c7f5a62eb8`, `68ec125cac7be712fe0f7c123e915932cd03377b`, `974134127c936de797e850c18dcfd83c3395bf88`, `a5643f55c434dbf0a7a86d81796dfac408b04e2f`. PR https://github.com/jeffersonfukner-hue/makercusto/pull/1.
- Resultado: implementação no GitHub, CI novo ainda não confirmado; CI anterior #455 aprovado. Pendências: regressão integral, homologação visual, medição integral independente, correção auditável, rateio P05 e fechamento P09. Sem merge, deploy ou migração operacional.
