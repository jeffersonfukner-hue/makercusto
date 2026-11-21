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
