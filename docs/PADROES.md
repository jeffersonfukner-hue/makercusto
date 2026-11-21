# Padrões e qualidade

- Idioma inicial pt-BR; moeda R$; unidades explícitas (g, W, kWh, h).
- Campos não negativos, quantidades inteiras >= 1; erros visíveis.
- Tarifas, consumo e vida útil são hipóteses editáveis, nunca valores oficiais sem fonte.
- Materiais multicor: o peso do modelo é por material. Purga/perdas entra adicionalmente apenas se não estiver incluída no peso informado.
- Não somar entrada de filamento único e entrada de filamentos múltiplos simultaneamente.
- Mostrar material, energia, máquina, acessórios, montagem, custo/lote e unidade, lucro bruto, margem e markup.
- Margem = (preço - custo) / preço; markup = (preço - custo) / custo.
- Impressão compartilhada é rateada por lote, acessórios/montagem multiplicam por unidades acabadas.
- Não considerar frete, impostos, embalagens e taxas de marketplace sem parametrização explícita.
- Interface acessível e responsiva, incluindo mobile 320px/390px; foco visível e entradas com legenda.
- Cálculo usa números JS e arredonda somente na apresentação. Antes de persistência financeira, definir precisão decimal/centavos e rateio.
- Não incrementar versão por commit; CI não equivale a publicação ou homologação.
- Deploy de Preview exclusivamente manual pelo proprietário, após CI verde.

- Resumo padrão dos filamentos: soma de gramas consumidas, preço médio ponderado por kg (custo total dividido pelo peso total), custo total; tabela avançada apenas após Detalhar por cor.
- Entrada de compra: quantidade e unidade (g/kg) + preço total da embalagem. Custo consumido = (gramas usadas + perdas adicionais) × preço total / gramas da embalagem; nunca confundir preço de compra com preço/kg.
- Salvar item explicitamente; não gerar linhas em branco. Visão mobile tem rolagem horizontal apenas para a tabela, não para o aplicativo inteiro.

- **Modo padrão editável:** entrada de filamento total em g ou kg e preço em R$/kg ou R$/g; resumo é saída calculada, não substitui os campos.
- **Modo detalhado:** botão Detalhar por cor alterna para formulário e tabela; ao voltar, conservar dados de ambos os modos em memória sem somar custos. Somente modo ativo alimenta o motor de cálculos.

- Impressora deve preceder filamento. Seleção de equipamento preenche potência, custo do equipamento, vida útil e tarifa; usuário pode editar. Não chamar exemplos de especificações oficiais.
- Modo de cálculo Simples/Avançado não se confunde com modelo comercial gratuito/Compartilhado/Full. Compartilhamento deve ser opt-in, perfis Full privados por padrão.

## Cadastros e acesso — requisitos documentados, implementação pendente
- Botões "+" de cadastro junto aos rótulos Tipo, Cor, Marca e Impressora; modais Normal e Avançado. Evitar formulários excessivos no fluxo rápido.
- Catálogo global é referência reutilizável, não propriedade editável indiscriminadamente por todos. Itens pessoais são cópias/sobreposições isoladas, preservando o original global.
- Última impressora selecionada por usuário/dispositivo. Visitante: localStorage sujeito à limpeza do navegador; autenticado: dado da conta quando a persistência for autorizada.
- Estoque de insumos comprados não confundir com ferramentas reutilizáveis ou itens produzidos; exigir movimentações rastreáveis.
- Planejar proteção de dados Full privados antes de expor API. Jamais inferir permissão apenas de estar autenticado; revisão de RLS é obrigatória.

## Cinco regras homologadas — 20/11/2026
- Cadastro oficial global é imutável para usuários, com cópia editável/renomeável como único caminho de personalização. Edição administrativa deve preservar versões e histórico.
- Compartilhado: publicado consultável por Compartilhado e Full; edição apenas do autor ou administração com atribuição explícita; copiar para modificar registro de terceiro.
- Full: itens próprios privados por padrão, publicação opcional **de cópia separada**; nunca expor o original privado.
- Estoque de matérias-primas, acessórios e acabados exige histórico de entradas/saídas/ajustes/perdas.
- Produto/kit pode conter várias peças impressas, insumos comprados, ferramentas e montagem. Criar snapshots de custo imutáveis antes do uso financeiro real.

## Regra de produto homologada — experiência pronta para usar (21/11/2026)
- **Facilitar antes de configurar:** o usuário escolhe fabricante e modelo; a ficha global vem preenchida, sempre que houver dados, com especificações **do fabricante** identificadas por fonte/versão, e com **estimativas operacionais iniciais** prontas para cálculo (inclusive consumo médio de impressão, custo/vida útil ilustrativos quando não se conheça o valor individual). Não exigir cálculos manuais para começar a imprimir.
- Distinguir, **campo a campo**, valor oficial comprovado, estimativa do MakerCusto, valor informado pelo usuário e medição real. Não deixar campo útil vazio por padrão apenas porque é estimado; rotular a estimativa e tornar o ajuste opcional e simples. Ausência de fonte não autoriza atribuir um dado como oficial.
- **Fabricante → modelos dependentes**, mais populares primeiro; cadastro rápido usa padrões já carregados, sem exigir configuração técnica extensa.
- **Original global protegido → cópia pessoal completa:** um clique deve duplicar todos os parâmetros disponíveis, vincular ao original, permitir renomear (ex.: Anycubic Kobra X → Aninha) e alterar apenas os poucos valores desejados. Não exigir redigitar nem editar o registro global. Cópia não deve receber atualizações destrutivas do original.
- Padrão universal para cadastros (impressoras, filamentos, cores, marcas e futuros itens): sugerir valores existentes, ordenar por uso, oferecer pesquisa e cadastro livre normalizado; edição avançada opcional, sem transferir cálculos complexos ao usuário.
- **Dicas e perfis de impressão otimizados:** recurso futuro candidato ao plano pago (Plus), com recomendações por fabricante/modelo, material, tipo de peça e prioridade (qualidade/rapidez/resistência). Apenas backlog; não implementar nem prometer configurações universais sem validação, procedência e avisos de segurança.
