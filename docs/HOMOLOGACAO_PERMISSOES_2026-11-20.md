# MakerCusto — HOMOLOGAÇÃO DAS OITO DIRETRIZES DE PERMISSÕES

**Data:** 20/11/2026 (Brasília). **Origem:** aprovação expressa do proprietário das oito propostas da revisão no commit `3878be1807fac55d02b667816edbb76d7bf93fe4`. **Status:** decisões de comportamento HOMOLOGADAS; detalhes indicados abaixo ainda dependem de definição. As cinco regras estruturais anteriormente homologadas permanecem integralmente vigentes.

## Diretrizes aprovadas

1. **Plano Compartilhado — rascunhos:** ficam privados enquanto estão em elaboração. Publicação somente com comando e confirmação explícitos. **Em aberto:** se rascunhos podem permanecer privados indefinidamente, limites do plano e prazos de retenção.
2. **Cancelamento ou downgrade:** propriedade e privacidade dos dados são preservadas; novas operações que exijam assinatura ativa ficam bloqueadas. Nunca converter privado em compartilhado automaticamente. **Em aberto:** leitura dos dados antigos, exportação, prazo de retenção, reativação e disponibilidade de compartilhamentos já publicados.
3. **Campos publicáveis:** somente dados descritivos de fichas de catálogo. Não compartilhar custos/preços de aquisição particulares, fornecedores particulares, compras, lotes operacionais, estoque, saldos ou histórico financeiro. **Em aberto:** lista de campos permitidos por tipo de ficha.
4. **Cópia e versão:** copiar cria novo ID, mantém referência e versão da origem, permite renomear e editar de forma independente. O original global não é alterado. **Em aberto:** aviso opcional de atualizações da origem.
5. **Leitura do catálogo Compartilhado no gratuito:** inicialmente não permitida; catálogos globais oficiais continuam disponíveis a todos. **Em aberto:** eventual vitrine pública futura, que não faz parte desta aprovação.
6. **Múltiplas oficinas:** reservar `workspace_id` desde o desenho inicial do banco, mesmo que o MVP tenha apenas uma oficina por conta. **Em aberto:** equipes, convites, titularidade, unidades adicionais e limites por plano.
7. **Custo do material:** priorizar preço real do lote usado e congelar o custo de cada impressão em snapshot imutável. **Em aberto:** FIFO/média ponderada, custeio alternativo, regras fiscais e rateio de materiais sem lote identificado.
8. **Governança global:** somente administradores autorizados mantêm/versam fichas oficiais; usuários podem sugerir novos registros, sujeitos à curadoria. **Em aberto:** critérios de moderação, aprovação, recursos e autoria das sugestões.

## Cinco homologações anteriores preservadas

- Catálogo global imutável para usuários; edição somente por cópia independente, renomeável.
- Registros publicados no Compartilhado são consultáveis por Compartilhado e Full; terceiros não editam, somente copiam; autor/admin autorizado mantém publicação.
- Full mantém privados por padrão e pode voluntariamente publicar **cópia** separada, preservando o original.
- Estoque de matérias-primas, itens comprados e produtos acabados com histórico auditável de movimentos.
- Produtos e kits podem ter peças fabricadas, componentes comprados, ferramentas e montagem.

## Fronteiras do dado

**Referências oficiais globais** são somente leitura por usuários. **Fichas descritivas particulares** podem ser rascunho privado ou cópia publicada conforme o plano. **Dados operacionais e financeiros** (equipamento físico, preço pago, fornecedor próprio, compra, lote, saldo, produção, snapshot) permanecem particulares da oficina/conta; publicar ficha descritiva nunca dá acesso a essas informações.

## Próximas definições — NÃO homologadas

- Retenção/acesso/exportação de dados e publicações após downgrade; períodos e limites.
- Limite temporal de rascunhos Compartilhados e direito a rascunhos permanentemente privados.
- Lista técnica de campos publicáveis por entidade e forma de aprovação de contribuições globais.
- Estrutura multi-oficina, associação de equipes, permissões e propriedade.
- Complementos do custeio de lotes, movimentações de estoque e requisitos fiscais.
- Modelo relacional físico e SQL, testes RLS, cobrança e infraestrutura.

**Nenhuma homologação acima autoriza execução de SQL, criação de projeto Supabase, alteração de código, merge, deploy ou gasto de créditos.**
