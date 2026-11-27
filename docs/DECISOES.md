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

## Seção 4: necessidades de maker (em andamento, um bloco por vez)
- Bloco 1 (feito): tempo de impressão em campos separados de horas, minutos e segundos (`src/domain/time.ts`). O cálculo continua em horas decimais.
- Bloco 2: produto com partes. Cada parte impressa tem tempo, cores e peso por cor; itens comprados (ex.: copo de alumínio) entram só como custo. Dado real do fatiador (Anycubic Slicer Next, caneca Flamengo, brasão): o peso total do filamento é modelo + purga (flushed) + torre, e a purga mais a torre foram mais da metade do total. Por isso o desperdício de troca de cor precisa ser um campo próprio por cor.
- Bloco 3: importar .3mf ou .gcode do fatiador, lido só no navegador. Formato a confirmar com arquivo real.
- Bloco 4: catálogo de impressoras mais usadas no Brasil com perfis pesquisados; clonar e personalizar é recurso do plano pago.

## Depois (fora do escopo atual)
- Conector ao vivo com o fatiador (exige programa instalado no computador).
- Utilização da máquina, clientes, estoque, login e banco, importação de G-code, várias mesas, rateio.
