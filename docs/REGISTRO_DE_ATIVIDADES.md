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
