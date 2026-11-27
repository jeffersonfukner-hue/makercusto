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
- Bloco 2 (feito): cadastro de filamentos em #/filamentos. Cada rolo comprado é um registro (nome, fornecedor, material, cor, preço pago, peso do rolo, data). Preço por kg = preço do rolo ÷ peso. Regra de preço: vale o do rolo escolhido para o trabalho. Cálculos salvos guardam o preço da época. Na calculadora Avançado escolhe-se o rolo; o Básico segue com o preço digitado.
- Bloco 3 (feito): produto com partes em #/produto. Cada parte é uma impressão (placa do fatiador) com tempo, peças por impressão, peças por produto e várias cores; cada cor tem peça, purga e torre em gramas (como o fatiador mostra). Itens comprados entram só como custo, fora da taxa de falhas. Falhas e mão de obra seguem a regra da calculadora simples. Dado real que motivou o desenho (brasão, Anycubic Slicer Next): 7,71 g gastos, dos quais 3,94 g (51%) são purga e torre.
- Nuvem (feita): tabelas `filamentos`, `produtos` e `impressoras` no Supabase makercusto-novo, com RLS, 4 políticas e gatilho de limite por pessoa (100, 50 e 20). Migração `20261127150000_filamentos_produtos_impressoras.sql`, aplicada em 27/11/2026 com autorização do dono e testada antes em Postgres local. Quem entra na conta vê uma faixa para enviar à nuvem o que ficou só no navegador (cálculos, filamentos, produtos, impressoras).
- Bloco 5 (feito): catálogo de impressoras em #/impressoras. Só dados com fonte (volume e potência nominal do fabricante); campos sem fonte aparecem como "não consta na fonte". Consumo médio, preço e vida útil são do usuário. "Clonar para as minhas" copia o nome. A regra de plano pago para clonar ainda não existe: hoje é livre.
- Catálogo: modelos escolhidos por disponibilidade de dados, não por ranking de vendas (não achei fonte de vendas). Preços em reais não entraram por falta de fonte.
- Bloco 4 (aguarda arquivo): importar .3mf ou .gcode do fatiador, lido só no navegador. Formato a confirmar com arquivo real.

## Depois (fora do escopo atual)
- Biblioteca de arquivos 3D limpos (.3mf) para download por quem paga (ideia do dono, 27/11/2026). Exige armazenamento, controle de quem pagou e decidir quais modelos podem ser distribuídos. Só depois dos primeiros pagantes.
- Controle de quanto resta em cada rolo e baixa automática de estoque.
- Conector ao vivo com o fatiador (exige programa instalado no computador).
- Utilização da máquina, clientes, estoque, login e banco, importação de G-code, várias mesas, rateio.
