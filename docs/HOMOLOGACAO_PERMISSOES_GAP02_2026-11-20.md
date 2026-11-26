# MakerCusto — GAP-02: homologação de permissões e operações críticas

**Data:** 20/11/2026 (Brasília).
**Situação:** HOMOLOGADA EXPRESSAMENTE pelo proprietário: GAP02-A a GAP02-F e a matriz funcional de permissões como **uma única política consolidada**.
**Contagem:** 38 homologações anteriores preservadas (28 iniciais, P01 a P09, GAP-01). Com GAP-02: **39 homologações acumuladas**.
**Escopo:** contrato funcional de arquitetura. Não autoriza equipes/convites efetivos, autenticação, SQL, RLS, banco, código, merge nem deploy.
**Referências:** `docs/CONTINUIDADE.md`, `docs/HOMOLOGACAO_PERMISSOES_2026-11-20.md`, `docs/HOMOLOGACAO_CONCILIACAO_EXCEPCIONAL_GAP01_2026-11-20.md`, `docs/HOMOLOGACAO_ESTORNOS_P09_2026-11-20.md`, `docs/HOMOLOGACAO_CONFIRMACOES_P02_2026-11-20.md`.

## Fronteiras homologadas
- Plano de assinatura (Gratuito, Compartilhado, Full), papel dentro de oficina e administrador global da plataforma são dimensões independentes.
- Plano não muda fórmulas, não concede acesso a estoque de terceiros e não substitui papel operacional.
- `workspace_id` delimita dados particulares; catálogo global/compartilhado só disponibiliza fichas descritivas permitidas. Administrador global não acessa automaticamente compras, saldos ou custos de makers.

## GAP02-A a GAP02-F homologadas
1. **GAP02-A — Identidade e isolamento:** conferir identidade, vínculo ativo à oficina, função e direito para toda operação particular. `workspace_id` ou IDs enviados pelo navegador não provam autorização; validação obrigatória no serviço/banco. Estrutura concreta de equipe e RLS continua em aberto.
2. **GAP02-B — Capacidades por operação:** distinguir leitura, preparação, confirmação, solicitação, aprovação e execução de compensações. Botões ocultos não são autorização; registrar falha não concede poder de inventário excepcional.
3. **GAP02-C — Confirmação ordinária:** papel habilitado pode confirmar produção comum quando origem, saldo, reserva e quantidades respeitam P01/P02 e demais regras. Validar novamente na transação. Divergência GAP-01 não se torna operação ordinária por causa do papel.
4. **GAP02-D — Segregação:** em equipes com pessoas distintas, separar solicitante de aprovador em ações de maior risco. Oficina individual pode ter fluxo de aprovação própria excepcional com justificativa reforçada e registro de ausência de revisão independente, **sem** dispensar invariantes. Limites, alçadas, condições e efetividade dessa aprovação ficam pendentes; não se concede poder irrestrito automaticamente.
5. **GAP02-E — Estornos:** estorno comum segue P09 conforme capacidade do usuário; estornos extraordinários e dependências de venda, reserva, kit ou divergência exigem tratamento adicional, sem burocratizar correções triviais.
6. **GAP02-F — Auditoria:** registrar solicitante, aprovador, executor, oficina, momento, objeto e versão aprovada, justificativa, evidências e eventos vinculados. Distinguir papéis mesmo quando exercidos legitimamente pela mesma pessoa; impedir edição livre de logs. Retenção/exportação ficam abertas.

## Matriz funcional homologada

**Papéis propostos para o futuro sistema:** Proprietário da oficina, Gestor, Operador e Auditor/Consulta. Não confundir o proprietário da oficina com o administrador global da plataforma.

**Legenda:** P = permitido sob regras; A = autorização especial condicionada; S = somente solicitação; L = leitura; — = negado. * = condição pendente, não permissão irrestrita.

| Operação | Proprietário | Gestor | Operador | Auditor |
| --- | :---: | :---: | :---: | :---: |
| Consultar produção | P | P | P | L |
| Preparar impressão | P | P | P | — |
| Confirmar produção ordinária | P | P | P | — |
| Registrar falha | P | P | P | — |
| Reservar materiais disponíveis | P | P | P | — |
| Registrar divergência física | P | P | P | — |
| Solicitar ajuste excepcional | P | P | S | — |
| Aprovar ajuste excepcional | A | A* | — | — |
| Executar estorno ordinário | P | P | S | — |
| Autorizar estorno excepcional | A | A* | — | — |
| Consultar custos financeiros privados | P | P | —* | L* |
| Administrar membros | P | — | — | — |
| Administrar assinatura | P | — | — | — |

O gestor só aprova dentro de alçada futura. Operador não tem leitura financeira implícita; auditor lê custos somente se autorizado. Nem assinatura Full nem função global permitem consultar estoque privado de outras oficinas.

## Casos de referência
- Maker sozinho: fluxo próprio excepcional com justificativa e indicação de ausência de segundo revisor, sujeito a limites ainda não definidos.
- Operador registra 150 g consumidos após lançar 120 g: gestor deve conferir evidência, origem e saldo antes de eventual correção.
- Membro da oficina A não pode usar lote, movimento ou custo da oficina B.
- Administrador global mantém catálogos oficiais sem acesso automático a dados particulares.

## Exceções não homologadas
- Equipes e convites, múltiplas oficinas por usuário, atribuição/revogação de papéis e transferência de propriedade.
- Limites de aprovação, regras de segregação/autoaprovação e evidências mínimas de inventário.
- RLS físico, autenticação, permissões SQL, migrações, estrutura transacional e testes.
- Conciliação sem origem comprovada, fechamento financeiro com custo desconhecido, vendas/devoluções/garantias e dependências posteriores.
- Normas fiscais/contábeis, retenção/exportação de logs/LGPD, downgrade de planos, depreciação durante pausas e tarifas variáveis.

**Nenhum código, banco, SQL, merge ou deploy decorrente desta homologação.**
