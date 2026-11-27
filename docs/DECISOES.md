# Decisões

## Seção 1: página inicial e calculadora
- Projeto novo em branch separada (`feat/novo-makercusto`), a partir de `main`. O antigo continua em https://makercusto-preview.pages.dev/.
- Sem login, banco ou backend. Estado só em memória nesta seção.
- Falhas: `total = base ÷ (1 − taxa)` (as peças boas absorvem as perdas).
- Preço sugerido por margem (lucro ÷ preço), arredondado para cima ao centavo.

## Próximas seções (aprovadas)
- Seção 2: dashboard com 5 blocos: custo por peça e composição, margem bruta por trabalho, preço praticado vs sugerido, lucro por hora de máquina, últimos cálculos salvos (no navegador).

## Depois (fora do escopo atual)
- Utilização da máquina, clientes, estoque, login e banco, importação de G-code, várias mesas, rateio.
