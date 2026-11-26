# MakerCusto — Proposta de homologação: aprovações excepcionais GAP01 / P09

**Data da elaboração:** 23/11/2026 (Brasília).  
**Situação:** **PROPOSTA — NÃO HOMOLOGADA**. Não altera nenhuma das 39 políticas já aprovadas.  
**Escopo:** critérios de evidência, risco, alçadas e segregação antes de qualquer ajuste físico/financeiro excepcional. **Este documento não autoriza migrar banco, implementar execução, publicar, aplicar SQL, efetuar baixa, compensar custo ou fazer merge.**

## 1. Base já homologada — não reabrir

- **GAP01-A–F:** preservar fato observado mesmo quando diverge do cadastrado; distinguir ocorrência, saldo e custo; investigar e registrar evidências; ajuste apenas para causa verificada; proteger reservas próprias e alheias; usar evento compensatório vinculado para fatos já confirmados; não inventar saldo, compra, origem ou preço.
- **P01/P02/P08:** reserva é lógica; saldo disponível = físico menos reservas; baixa física ordinária somente por confirmação idempotente e origem operacional identificada; uma bobina sem comprovante comercial pode ser inventariada legitimamente, mas uma bobina desconhecida não é escolhida arbitrariamente; custo desconhecido não vira zero.
- **P09-A–F:** estorno é evento novo referenciado, não exclusão/regravação do original; nunca devolver material realmente extrudado ao estoque utilizável; não duplicar saídas nem alterar snapshots de preço; verificar saldo reversível, reservas e dependências posteriores, atomicidade e idempotência.
- **GAP02-A–F:** plano de assinatura não dá permissão; identidade, oficina e capacidade devem ser conferidas no servidor; operador pode solicitar mas não aprovar; proprietário pode aprovar excepcionalmente mediante alçada; gestor apenas dentro de alçada futura; em equipe separar solicitante/aprovador; oficina individual poderá ter procedimento próprio reforçado com ausência de revisão independente declarada. Gestão de membros é privativa do proprietário.

**Estado técnico atual:** ocorrência, investigação, proposta de inventário e dossiê GAP01 já foram desenvolvidos/testados na branch; dossiê é leitura de estado atual e NÃO comprova causa, disponibilidade futura, elegibilidade para estorno nem suficiência das evidências. Migrações P01/GAP01 complementares ainda não foram aplicadas no Supabase operacional.

## 2. Classes de decisão propostas — ainda não autorizadas

| Classe | Situação | Tratamento proposto |
| --- | --- | --- |
| **O — Ordinária** | Correção P09 com origem, linha confirmada, valor e quantidade reversível identificados; material comprovadamente não consumido; sem conflito com reservas/dependências | Seguir autorização ordinária P09/GAP02, com confirmação explícita e evento referenciado. Não transformar todas as pequenas correções em burocracia excepcional. Implementação de P09 ainda pendente. |
| **E1 — Exceção documental** | Entrada física omitida comprovada ou erro de contagem demonstrado em lote conhecido; evidências coerentes, saldo e reservas conciliáveis, sem dependências posteriores conflitantes | Solicitação → verificação → aprovação excepcional → execução transacional separada. Não executar diretamente na criação da proposta. |
| **E2 — Exceção de alto risco** | Valores/quantidades acima de alçada, evidências contraditórias, impacto em saídas posteriores, reserva de terceiros, devolução discutível, custo desconhecido ou múltiplos lotes | Bloquear a execução automática, manter pendência, exigir análise especial e decisão adicional ainda não definida; aprovar o pedido não deve contornar invariantes. |
| **B — Bloqueada** | Bobina/origem não identificada, material comprovadamente extrudado que se pretende devolver como filamento, saldo negativo, reserva alheia violada, compra/preço inventado, retroedição de snapshots, peça já vendida sem cadeia de correção segura | Não executar via GAP01/P09, mesmo com aceite superficial do responsável. Manter ocorrência para resolver a causa ou definir política específica. |

O valor observado, o delta proposto e a quantidade comprovadamente reversível são dimensões distintas. **Nenhuma quantidade reversível pode ser presumida a partir do saldo visualizado no dossiê.**

## 3. Evidências mínimas propostas

**Para qualquer pedido E1/E2:** identificação da oficina e ocorrência, momento e autor da observação, foto/registro de pesagem ou contagem **ou** documento equivalente verificável, lote físico operacional identificado, quantidade e unidade, método de medição, descrição da causa investigada, justificativa e referência rastreável. Registrar separadamente **fato observado, hipótese e conclusão**. Referência textual sem verificação não comprova o fato.

**Por causa:**

| Causa | Evidência adicional recomendada | Bloqueio se faltar |
| --- | --- | --- |
| Entrada física omitida | Registro datado de recebimento/inventário físico + segunda evidência coerente (pesagem, foto com identificação da bobina, anotação operacional verificada). Não exigir nota fiscal inexistente nem inventar compra. | Sem prova de existência/quantidade física, manter pendente; não lançar entrada fictícia. |
| Erro de contagem | Nova pesagem/contagem, tara e método quando pertinente, comparação com a medição anterior e identificação do responsável. | Sem resultado reconciliável, manter pendente. |
| Troca de bobina | Identificação física de cada bobina, massa utilizada por lote e vínculo com eventos e reservas da ordem. | Sem origem por lote comprovada, não redistribuir consumo por suposição. |
| Erro de lançamento já confirmado | ID de confirmação e linha original, evidência de quantidade errada, destino do material, saldo residual reversível, snapshot original e inspeção de dependências posteriores. | Não devolver ao estoque o que foi extrudado; não estornar acima do reversível. |
| Custo original desconhecido | Proveniência do custo ou estimativa identificada segundo P08, com incerteza expressa. | Nunca registrar preço zero como real ou reprecificar confirmação antiga automaticamente. Fechamento financeiro continua condicionado a política própria. |

**Confiança proposta:** *documentada*, *parcial* ou *insuficiente*. Somente *documentada* pode candidatar-se a E1; *parcial* vai a E2 e não concede execução; *insuficiente* permanece bloqueada. A conclusão deve referenciar quais evidências sustentaram cada quantidade e lote. Fotos não são obrigatórias universalmente se houver documentação equivalente verificável, evitando inviabilizar oficinas pequenas.

## 4. Alçadas propostas para homologação expressa

Critério recomendado para **E1 de baixo impacto** (todos os limites devem ser atendidos simultaneamente, sobre o delta absoluto):

- **Até 50 g**, **até 5%** do saldo físico confirmado antes do ajuste e **impacto financeiro histórico calculável até R$ 50,00**, sem dependências posteriores, sem reservas conflitantes, com origem verificada.
- Os valores **50 g / 5% / R$ 50,00 são apenas propostas**, não limites vigentes. O requisito de *todos* os limites impede usar um limite isolado para contornar os demais.
- Se o custo não for conhecido, o percentual não puder ser calculado com confiança, a origem estiver incerta ou qualquer limite for ultrapassado, **não qualificar como E1**; manter E2 em análise, sem execução automática.
- **E2 não recebe aprovação automática por ser proprietário**. Um limite ampliado, segundo aprovador e exceções específicas precisam de decisão posterior; a ausência de critério explícito equivale a bloquear execução.
- Não fracionar um ajuste em vários pedidos para ficar abaixo da alçada: considerar mesmo lote/ocorrência/causa e outras solicitações relacionadas de forma acumulada. Nenhuma exceção a saldo negativo, proteção de reserva ou evidência física pode ser concedida por teto monetário.

A adoção desses três números pode ser inadequada para oficinas de escalas diferentes; **homologar, ajustar ou rejeitar explicitamente**, sem parametrizar como regra de servidor antes da decisão.

## 5. Papéis e segregação — proposta que respeita GAP02

| Ação | Proprietário | Gestor | Operador | Auditor |
| --- | --- | --- | --- | --- |
| Registrar ocorrência, evidência ou solicitação | Sim | Sim | Sim, conforme GAP02 | Somente leitura autorizada |
| Investigar e propor E1/E2 | Sim | Sim | Solicitar / complementar evidência, sem aprovação | Consulta autorizada |
| Aprovar E1 | **Proposto: sim**, sujeito a evidências, limites e prevenção de autoaprovação inadequada | **Proposto: apenas alçada delegada explicitamente pelo proprietário** | Não | Não |
| Aprovar E2 | **Não habilitar até regra específica** | Não habilitar | Não | Não |
| Executar evento excepcional após aprovação | **Proposto: função operacional autorizada distinta da aprovação**; revalidar tudo na transação | Somente se capacidade expressamente definida | Não | Não |
| Consultar evidências, decisões, trilha de auditoria | Sim | Sim conforme oficina | Apenas o necessário para sua solicitação | Conforme autorização de leitura, sem custos implícitos |

- **Oficina com duas ou mais pessoas aptas:** solicitante e aprovador devem ser pessoas diferentes em E1/E2. Propriedade da conta ou plano pago não substitui aprovação.
- **Oficina individual comprovada:** propor aprovação própria **apenas do E1**, com dupla confirmação consciente, motivo adicional, aviso explícito *“sem revisor independente”*, versão congelada das evidências, e registro de que a mesma identidade solicitou/aprovou/executou funções distintas. **Não** usar isso para liberar E2 ou dispensar invariantes.
- **Gestor:** não recebe alçada E1 por simples papel; delegação deve ter escopo, validade e revogação auditáveis. Até esse mecanismo estar autorizado/testado, somente pode preparar e encaminhar.
- **Operador/auditor:** não recebem acesso automático a valores de compra, custo financeiro, saldos de outras oficinas ou aprovação. A matriz GAP02 homologada prevalece.

## 6. Estados e fluxo de segurança propostos

1. **Ocorrência registrada** — dado físico preservado, sem baixa.
2. **Em análise** — hipóteses e evidências em histórico apensado.
3. **Pendente de decisão** — proposta imutável com versão, quantidades e evidências.
4. **Devolvida para complementar** ou **rejeitada** — novo evento de decisão, nunca apagar pedido.
5. **Aprovada para execução** — decisão auditada do revisor habilitado, vinculada à versão exata. **Ainda não implementada/autorizada**.
6. **Executada** — somente após nova conferência transacional de saldo, reservas, dependências, preço histórico e elegibilidade; evento único, idempotente e referenciado. **Ainda não implementada/autorizada**.
7. **Regularizada fisicamente, pendente de custo** — estado separado se custo permanece desconhecido; não fechar financeiramente só pela regularização física. **Ainda não implementado**.

Qualquer alteração de evidência, lote, delta ou causa **depois de uma aprovação hipotética** invalida a aprovação anterior e exige nova decisão. Solicitação, aprovação e execução têm IDs, autores e horários distintos, mesmo em oficina individual. Operações concorrentes verificam saldo novamente no banco; se o estado mudou, interromper e devolver à análise.

## 7. Condições mínimas para futura implementação (não autorizada neste documento)

- Autorizações reais baseadas em JWT, vínculo ativo e capacidades por `workspace_id` no servidor/RLS; testes com dois usuários reais e duas oficinas.
- Tabelas de decisão/evento append-only, registro de `requested_by`, `reviewed_by`, `executed_by`, versões/hashes de evidências, justificativas e timestamps verificáveis.
- Transação única ao executar: lock por oficina/lote/origem, saldo e reservas íntegros, idempotência por payload, evento de compensação vinculado, custo histórico preservado, reversível residual descontado, sem efeitos parciais.
- Testes de replay, duas aprovações concorrentes, alteração de evidência pós-aprovação, perda de permissão, tentativa de fracionamento, auditoria e ausência de acesso entre oficinas.
- UI explicita *Solicitar*, *Aprovar* e *Executar* como atos diferentes, e mostra riscos e resumo de efeitos antes do aceite. Nunca permitir “registrar ocorrência” gerar baixa silenciosa.
- Sem alterações de produção, lote, fornecedor, reserva ou custos para simular dados que faltem. Sem preço histórico conhecido, impedir atribuição de custo definitivo.
- O mecanismo de autenticação atual com owner/manager para formulários GAP01 é **mais restritivo** que a matriz funcional futura, que permite registrar ocorrências e solicitar ajustes por operador; adequação depende de implementação e testes de papéis e não é silenciosamente resolvida por esta proposta.

## 8. Decisão solicitada para homologação

**Nenhuma das escolhas abaixo está aprovada por este arquivo.** A homologação pode ser dada para o pacote ou com alterações pontuais expressas:

1. **Evidências:** adotar matriz por causa, confiança em três níveis e exigência de comprovação antes da operação extraordinária?
2. **Alçadas:** adotar 50 g **E** 5% **E** R$ 50,00 para E1, ou definir outros números? E2 permanece bloqueada até política adicional?
3. **Papéis:** proprietário aprova E1; gestor somente com delegação explícita; operador solicita; auditor consulta conforme permissão?
4. **Oficina individual:** permitir autoaprovação E1 com dupla confirmação, aviso e auditoria reforçada; proibir autoaprovação E2?
5. **Execução:** tornar obrigatória separação entre *propor*, *aprovar* e *executar*, com revalidação transacional, eventos vinculados e bloqueio se houver alteração no estado?
6. **Limites inegociáveis:** origem desconhecida, material extrudado, reserva alheia, saldo negativo, dependência de venda/kit e custo inventado permanecem fora de aprovação excepcional simplificada?

**Próxima ação depois da homologação expressa:** registrar adendo de decisão sem alterar as 39 homologações anteriores; preparar plano técnico e testes. **Nenhuma permissão para aplicar SQL ao Supabase operacional, merge ou deploy decorre da homologação documental.**
