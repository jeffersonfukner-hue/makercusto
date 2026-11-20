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
