# Decisões

## Seção 1: página inicial e calculadora
- Projeto novo em branch separada (`feat/novo-makercusto`), a partir de `main`. O antigo foi abandonado por decisao do dono (27/11/2026); a producao e o projeto novo.
- Sem login, banco ou backend. Estado só em memória nesta seção.
- Falhas: `total = base ÷ (1 − taxa)` (as peças boas absorvem as perdas).
- Preço sugerido por margem (lucro ÷ preço), arredondado para cima ao centavo.

## Seção 2: painel (feita)
- Rota #/painel com 5 blocos: custo por peça e composição, margem bruta por trabalho, preço praticado vs sugerido, lucro por hora de máquina, últimos cálculos salvos (no navegador).. Cálculos salvos em localStorage (até 50), sem login nem backend.

## Seção 3: modos e visual (feita)
- Modo básico (5 campos + "Ajustes da oficina" recolhido) e avançado (todos os campos, composição, preço praticado). O cálculo é o mesmo; no básico o preço praticado é ignorado. Modo lembrado no navegador.
- Visual: grafite, verde-bobina e âmbar; fonte Sora (Google Fonts, com fallback do sistema); resultado fixo no topo no celular.
- Próximo (depois do uso real): Supabase.

## Depois (fora do escopo atual)
- Utilização da máquina, clientes, estoque, login e banco, importação de G-code, várias mesas, rateio.
