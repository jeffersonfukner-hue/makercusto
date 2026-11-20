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
