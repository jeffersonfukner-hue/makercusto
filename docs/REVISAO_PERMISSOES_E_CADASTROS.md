# MakerCusto — Revisão detalhada de permissões e fluxos de cadastro

**Base documental auditada:** commit `896877b88eaed6d347ba757405394aeb64914c35` (`PLANO_MESTRE_MAKERCUSTO.md` e `MODELO_DE_DADOS.md`). **Data:** 20/11/2026. **Escopo:** somente documentação; nenhum código, banco ou política RLS foi implementado ou testado.

## Homologações preservadas, inalteradas

1. Cadastros globais são imutáveis para usuários; personalização gera **cópia independente, renomeável e ligada ao original**, sem sobrescrever a referência oficial. Manutenção administrativa deve preservar versões.
2. Fichas **publicadas** no catálogo Compartilhado são legíveis pelos planos Compartilhado e Full. Apenas o autor ou administrador com função específica altera a ficha; outros usuários criam cópia.
3. Full mantém registros privados por padrão e compartilha somente **cópias voluntárias separadas**, preservando o registro privado.
4. Estoque abrange matéria-prima, itens comprados e produtos acabados com movimentações rastreáveis de entrada, saída, perda, ajuste e inventário.
5. Produtos/kits podem conter várias peças fabricadas, componentes comprados, ferramentas e etapas de montagem.

## Achados e riscos documentais

| ID | Gravidade | Lacuna ou conflito | Risco | Encaminhamento proposto |
| --- | --- | --- | --- | --- |
| PER-01 | Crítica | `scope` genérico pode ser aplicado incorretamente a compras, lotes, saldos e custos | Exposição de dados financeiros ao compartilhar uma ficha | Separar **referências copiáveis** de **dados operacionais sempre particulares**; autorização por entidade |
| PER-02 | Alta | O Compartilhado não define privacidade de fichas antes de publicar | Publicação acidental ou perda de rascunho | Rascunho privado até confirmação explícita; retenção de fichas nunca publicadas ainda pendente |
| PER-03 | Alta | Não há regra para downgrade, cancelamento, expiração e exclusão | Bloqueio de dados próprios ou publicação involuntária | Preservar propriedade e privacidade; suspender novas ações pagas, definir leitura/exportação e retenção |
| PER-04 | Alta | Modelo global e impressora física podem confundir seus valores | Preço, potência ou vida útil da conta serem sobrescritos pela referência | Instância pessoal própria e `source_model_id` informativo, sem atualização automática |
| PER-05 | Alta | Catálogo de filamento relacionado ao lote de compra/estoque | Exposição de preços pagos, quantidade e fornecedores privados | Publicar somente ficha descritiva; compras, lotes, fornecedores e saldos são privados |
| PER-06 | Alta | Falta definir transições de `scope`/`owner_id` e vínculo `source_id` | Escalada por API, alteração de autoria ou publicação de privado | Criar/copiar/publicar por operações específicas; nunca permitir UPDATE genérico de identidade, propriedade ou visibilidade |
| PER-07 | Média | Múltiplas oficinas por conta ainda indecisas | Migrações profundas de estoque e titularidade | Decidir `workspace_id` antes do banco físico; suportar 1 oficina inicialmente pode preservar expansão |
| PER-08 | Média | O botão Salvar não distingue destino local/nuvem | Usuário pressupor histórico salvo sem conta | Rotular claramente armazenamento local, rascunho, cópia e publicação |
| PER-09 | Alta | `item_ref` e `component_ref` são referências polimórficas sem FK | Inconsistência de relações e kits cíclicos | Definir referências relacionais verificáveis e prevenção de recursão na composição |
| PER-10 | Alta | Estoque sem regra transacional/estorno final | Baixa dupla, saldo incoerente ou alteração sem rastreio | Ledger com idempotência por evento, movimentos de correção e operações atômicas |
| PER-11 | Média | Deduplicação dos termos globais ainda não está formalizada | Cor/tipo/marca duplicada ou falsa equivalência | Normalizar por namespace, preservar nomes legítimos e fazer curadoria |
| PER-12 | Alta | Snapshot financeiro sem política de correção | Alterar custo antigo quando preço da compra mudar | Snapshot imutável, retificação por revisão vinculada; nunca recalcular implicitamente histórico |

São **riscos potenciais identificados nos documentos**, não vulnerabilidades observadas em Supabase: o banco MakerCusto ainda não existe.

## Matriz de permissões (parcela homologada e proposta)

Abreviações: **G** catálogo global oficial; **S** ficha compartilhada publicada; **P** ficha pessoal privada; **O** dados operacionais (compra, estoque, fornecedor, custo, produção).

| Ator | Ler G | Alterar G | Copiar G | Ler S | Criar S | Alterar S alheio | Criar P | Ler/alterar O de terceiros |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Visitante | Sim | Nunca | Local | Não* | Não | Nunca | Local | Nunca |
| Gratuito autenticado | Sim | Nunca | Local | Não* | Não | Nunca | Local | Nunca |
| Compartilhado ativo | Sim | Nunca | Sim | Sim | Sim, publicação explícita* | Nunca | Rascunho próprio* | Nunca |
| Full ativo | Sim | Nunca | Sim | Sim | Sim, somente cópia publicada | Nunca | Sim, privado por padrão | Nunca |
| Administrador de catálogo | Sim | Só operação administrativa auditada/versionada | Sim | Conforme função | Conforme função | Só intervenção administrativa com trilha | Sem acesso automático ao privado | Sem acesso automático |

**Regra homologada para S:** Compartilhado e Full podem ler registros publicados, e somente autor/administrador designado altera. **Asteriscos = propostas pendentes**, não permissões homologadas: leitura S no gratuito, privacidade/tempo de retenção de rascunhos e necessidade de consentimento/confirmar publicação no Compartilhado.

**Regra de segurança recomendada:** O pertence ao dono, nunca se torna público por associação a um catálogo G/S. O usuário não pode forjar `owner_id`, editar `scope` por API ou atualizar origem global. Assinatura ativa deve ser checada no servidor. Administrador de catálogo não recebe acesso irrestrito a custos privados.

## Fluxos e transições propostos

### F-01 — Impressora primeiro
Abrir novo cálculo/produto → recuperar última impressora **válida** do armazenamento do dispositivo (visitante) ou conta (quando habilitada) → selecionar modelo global ou instância particular → `+` abre modal Normal/Avançado → ao customizar modelo global, **Copiar** cria novo ID com `source_id` → usuário renomeia e altera somente sua instância → novo cálculo usa seus dados, sem afetar resultados antigos.

### F-02 — Tipo, cor e marca
Clique no `+` adjacente ao nome → modal do catálogo específico, busca e opções globais → selecionar usa referência oficial → personalizar usa **Copiar e renomear** → cadastrar termo inédito cria ficha própria, nunca item global automaticamente → Salvar retorna ao ponto do cálculo sem perder o rascunho. Validação de duplicidades deve preservar variações legítimas.

### F-03 — Full publica cópia
Criar ficha privada → ação explícita `Publicar cópia` → prévia mostra somente campos que serão publicados, excluindo **preço pago privado, saldo, compras, fornecedor, custos e histórico** → confirmar cria registro S de novo ID, ligado à origem; registro P permanece privado → assinantes S/Full leem/copiam, mas não editam cópia do autor.

### F-04 — Compartilhado cria e reutiliza
Consultar G/S → copiar para editar quando necessário → preparar nova ficha própria em rascunho → **publicação depende de política pendente**: proposta de confirmação explícita sem publicação involuntária → somente autor elegível ou administrador com função específica edita S → dados de compras/estoque próprios nunca são compartilhados com a ficha.

### F-05 — Compra, estoque, impressão e custo
Referência descritiva de filamento/insumo → compra privada com preço histórico, unidade e lote → entrada movimenta estoque → produção dá baixa identificada e registra perdas → correção exige estorno/movimento novo → confirmar fabricação gera snapshot imutável de fórmulas, preços, materiais e equipamento → mudanças posteriores não alteram snapshot antigo.

### F-06 — Alteração de plano
Status de assinatura muda no servidor → revisar direitos para novas ações sem alterar propriedade/visibilidade de itens existentes → privado nunca vira compartilhado → definir acesso de leitura/exportação e destino de publicações antigas após cancelamento antes de lançar pagamento.

## Oito decisões adicionais — PROPOSTAS, NÃO HOMOLOGADAS

| Ordem | Tema | Recomendação | Falta decidir |
| --- | --- | --- | --- |
| 1 | Rascunhos no Compartilhado | Privados enquanto em edição, publicação apenas explícita | Pode manter privados indefinidamente no plano? |
| 2 | Cancelamento/downgrade | Preservar propriedade e privacidade; bloquear novas ações pagas | Retenção, leitura, exportação, reativação |
| 3 | Campos publicáveis | Apenas dados descritivos; custos/estoque privados sempre excluídos | Lista de campos por entidade |
| 4 | Cópia e versão | ID novo, origem e versão registrada, alteração independente | Receber sugestões de atualização? |
| 5 | Gratuito pode ler S? | Não inicialmente, para manter distinção comercial | Deseja catálogo comunitário visível como vitrine? |
| 6 | Múltiplas oficinas | Reservar `workspace_id` na arquitetura | Conta pessoal, empresa, equipes e estoque por local |
| 7 | Custo de material | Preço do lote efetivamente usado; snapshot imutável | Média ponderada, FIFO, rateio, regra fiscal |
| 8 | Governança global | Apenas administrador mantém G com versionamento; usuários sugerem | Moderação e critérios de aprovação |

## Casos de teste para a futura RLS e UI (não executados)

- Usuário de qualquer plano tenta UPDATE/DELETE de G → negado; Copiar cria ID novo com `source_id` e nome editável.
- Compartilhado tenta alterar S alheio ou publicar em nome de outro → negado.
- Full tenta ler P de outro Full → negado; publicar cria novo S e preserva P original.
- Compra/estoque/snapshot privado jamais são liberados por publicação da referência G/S.
- Plano expirado não consegue executar ações pagas; não ocorre conversão de visibilidade.
- Preferência da última impressora não referencia máquina de outro proprietário.
- Kits não admitem ciclos; saldos de estoque podem ser recalculados por movimentos; correções são auditadas.
- Snapshot financeiro não muda após nova compra/preço.

## Próxima etapa

Validar as oito decisões pendentes, congelar contratos de entidade, escolher modelagem referencial de estoque/componentes, então desenhar migrações/RLS e testes sem provisionar banco até autorização específica. Não realizar deploy por commit.

**Integridade:** as cinco regras homologadas estão preservadas; nenhum novo item desta revisão deve ser tratado como aprovado automaticamente.
