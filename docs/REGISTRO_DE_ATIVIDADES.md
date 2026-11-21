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
