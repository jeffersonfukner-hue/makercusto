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
