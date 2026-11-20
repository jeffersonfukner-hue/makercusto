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
