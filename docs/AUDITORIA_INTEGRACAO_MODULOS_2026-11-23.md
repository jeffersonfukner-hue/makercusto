# MakerCusto — Auditoria de integração dos módulos (23/11/2026)

**Escopo:** leitura da branch `feat/fundacao-makercusto`, HEAD inicial `8598a6cd4fbda4ab1fcd78fb64be74fd31e26bd7`. Diagnóstico do cenário guirlanda + estrela grande + estrela pequena, sem alterar banco ou dados operacionais.

## Achados comprovados no código

1. **Calculadora → cadastro (já implementado):** `src/components/ProductSavePanel.tsx` chama `saveCalculatedProduct` e salva `saved_input` e `calculated_result`. O componente também oferece carregar cálculos existentes. Não tratar isso como funcionalidade ausente no HEAD; falta verificar sua presença no Preview instalado.
2. **Peça cadastrada → conjunto (já implementado em código):** `src/components/ProductWorkspace.tsx` lista produtos/peças por `listProducts` e apresenta `Selecionar peça cadastrada` nas linhas do conjunto. `chooseComponent` copia dados de `listComponentLibrary`, e `saveAssemblyWithComponents` persiste vínculos. Se o usuário não viu o seletor, conferir versão implantada, oficina ativa, carregamento e existência de registros de tipo `component` no mesmo workspace, antes de mudar SQL.
3. **Ficha incompleta (lacuna real):** edição normal de peça/produto em `ProductWorkspace` contém nome, SKU, descrição e preço de venda, mas não edita diretamente peso, impressora, filamento, tempo e custo de produção. No cálculo, a escolha de snapshot ocorre em painel separado e não há escolha direta da peça a recalcular a partir da ficha.
4. **Placa mista (parte implementada):** `src/components/PrintsWorkspace.tsx` permite adicionar vários outputs em uma execução, com tipo `product` ou `component`; `src/data/supabase.ts` tem `mc_create_print` e `mc_confirm_print`. Falta um fluxo único guiado para distribuir peso/tempo/energia/purga por saída, gerar snapshots individualizados e propor cadastro das peças sem inventar custos.
5. **Duplicidade de experiência:** `AssemblyPanel` mantém formulário legado com componentes de texto livres; `ProductWorkspace` tem editor com referências. Para usuário autenticado, `App.tsx` usa `ProductWorkspace`; preservar a lógica de vínculos como referência e não criar outro editor paralelo.

## Contrato de fluxo integrado — sem alterar homologações

- **A partir da calculadora:** calcular → salvar como peça/produto ou atualizar ficha escolhida mediante confirmação, preservando snapshots anteriores; oferecer montar conjunto depois do salvamento.
- **A partir da peça/produto:** abrir ficha → ver dados do último cálculo e histórico, editar parâmetros autorizados e recalcular na calculadora sem redigitação; nunca sobrescrever custo anterior.
- **A partir do conjunto:** selecionar peças existentes da mesma oficina, preencher quantidade e usar custos identificados; permitir criar peça nova por fluxo de cadastro separado e retornar mantendo o rascunho do conjunto.
- **A partir da impressão de placa mista:** cadastrar uma execução com saídas distintas (guirlanda, estrela grande, estrela pequena); registrar pesos por saída, consumo compartilhado e regra de rateio identificada; validar fechamento e então congelar custos.
- **Estoque:** simulação e salvamento de ficha não geram baixa; somente confirmação transacional de produção movimenta estoque, sob regras L2/L3/P01 homologadas.
- **Permissões:** acesso delimitado por workspace/RLS, clones privados por padrão, catálogos globais protegidos.

## Ordem proposta de implementação

1. **Diagnóstico do Preview:** comparar versão implantada com HEAD `8598a6c`; validar mesma oficina, `kind=component`, visibilidade do seletor e erros de carregamento. Não atribuir a falha ao banco sem evidência.
2. **Fluxo da ficha ao cálculo:** associar snapshot existente ao cadastro, ação `Calcular/recalcular` e passagem explícita de parâmetros; persistir novo snapshot sem sobrescrever histórico. Testes de ida/volta e não alteração do custo antigo.
3. **Conjunto sem redigitação:** seletor pesquisável, custos/gramas conhecidos, criação de nova peça com retorno ao rascunho; testes de mesmo workspace, referência e custo desconhecido.
4. **Mesa mista:** distinção peça física × conjunto e material por saída, rateio justificado e preservação das reservas/baixas de L2/L3; testes determinísticos e SQL em rollback.
5. **CI completo e homologação visual:** tipos, unitários, build, E2E desktop/mobile e transações SQL. Nenhum deploy ou merge automático.

## Evidências e limites

- PR draft: https://github.com/jeffersonfukner-hue/makercusto/pull/1
- CI do HEAD lido: https://github.com/jeffersonfukner-hue/makercusto/actions/runs/45209805896 (sucesso na consulta).
- Esta auditoria é **estática** do código. Nenhum teste visual do Preview, consulta ao banco do usuário ou E2E adicional foi executado nesta sessão.
- Os documentos mais antigos descrevem estados de 20/11, anteriores à implementação atual. Prevalece o HEAD consultado para afirmar presença ou ausência de código.
