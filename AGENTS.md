# MakerCusto (novo) – regras de trabalho

1. Começar simples e evoluir uma seção por vez. Cada seção termina com algo que o proprietário consegue usar. Escopo novo entra só depois da seção atual em uso.
2. O agente barra ideias fora do escopo atual e registra em docs/DECISOES.md como "depois".
3. Sem merge, deploy, domínio, banco, migração ou gasto sem autorização específica. O deploy é manual, feito pelo proprietário.
4. Cálculos são funções puras em `src/domain`, com testes. Dinheiro em centavos inteiros. Margem (lucro ÷ preço) não é markup (lucro ÷ custo).
5. Consumo, tarifa, vida útil e perdas são hipóteses editáveis, nunca valores presumidos como oficiais.
6. Qualquer pessoa precisa conseguir usar: linguagem simples, telas pequenas (320px), foco visível.
7. Documentação curta: README e docs/DECISOES.md. Registrar só o que foi comprovado.
8. Verificar gatilhos de CI antes de push. CI não é homologação visual.
