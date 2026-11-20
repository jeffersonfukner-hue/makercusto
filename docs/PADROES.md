# Padrões e qualidade

- Idioma inicial pt-BR; unidade monetária R$; unidades explícitas (g, W, kWh, h).
- Campos numéricos não negativos, quantidades inteiras >= 1; erros visíveis em vez de resultados fictícios.
- Valores de referência devem ser identificados como hipóteses editáveis, não tarifa confirmada.
- Mostrar separadamente: material, energia, máquina, acessórios, montagem, custo unitário, lucro bruto, margem bruta.
- Margem bruta = (preço - custo) / preço; markup = (preço - custo) / custo. Valores não incluem tributos, taxas e frete salvo cadastrados explicitamente.
- Produção em lote compartilha custo da impressão; montagem e acessórios multiplicam por unidades.
- Componentes acessíveis e layout mobile 320px/390px.
- Regra de versão: não alterar versão por cada commit; CI verde não implica publicação.
- Testes e inspeção visual precedem homologação.
