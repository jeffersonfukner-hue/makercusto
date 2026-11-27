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
- Fornecedores e estoque de insumos (feitos, 27/11/2026): #/fornecedores e #/estoque, local e na nuvem (tabelas `fornecedores` e `insumos`, migração `20261127180000`). Filamentos ganharam marca e temperaturas de bico e mesa. No produto com partes, o item comprado pode ser escolhido do estoque. Entrada e saída de estoque são manuais; a baixa por pedido vem com os pedidos. Estoque de produtos prontos, clientes e pedidos: depois.
- Primeira tela (feita): abre a calculadora com chamada e seções de landing para quem não está logado (o que faz, planos), cabeçalho fixo e menu "Cadastros". A tela de atalhos agora é #/inicio, com a preferência "ao entrar, abrir a calculadora ou esta tela" (guardada no navegador por enquanto, não na conta).
- Lista de espera: tabela `lista_espera` aceita e-mail de qualquer visitante e não deixa ninguém ler pelo app. O plano com conta ainda não cobra nada; o texto da landing diz "em breve". Cobrança (provedor e preço) segue como decisão do dono.
- Bloco 4 (aguarda arquivo): importar .3mf ou .gcode do fatiador, lido só no navegador. Formato a confirmar com arquivo real.

## Direção de produto (ideias do dono, 27/11/2026, ainda sem decisão de ordem)
- Primeira tela: abre direto a calculadora, sem painel. Mistura de calculadora e landing page, pensada para converter visitante em cliente.
- Plano gratuito: calculadora no modo avançado simples, com até 3 impressoras prontas (Bambu Lab A1, Kobra X e uma Creality), configuração personalizada baseada em uma delas, salva no navegador. Plano pago: login e salvar na nuvem, com tudo o mais.
- Depois do login: pesquisar o que abrir primeiro. Pesquisa feita: em SaaS o editor/ferramenta aparece mais que o dashboard como tela principal (56 contra 32 telas em 258 analisadas, com ressalva de amostra pequena e de medir telas, não comportamento pós-login); o plano gratuito deve ser útil mas ter um gatilho claro de upgrade, como limitar salvamentos. Recomendação: abrir a calculadora, com preferência "ao entrar abrir: Calculadora ou Início com atalhos grandes", guardada na conta. Rever quando existirem pedidos e estoque.
- Fornecedores de filamento: marcas diferentes têm preços e configurações diferentes; controlar fornecedores.
- Clientes e pedidos, e tudo que envolve.
- Estoque de insumos (chaveiros, copos de alumínio, LEDs, velas artificiais, ímãs etc.) e estoque de produtos prontos (ex.: 40 chaveiros de Nossa Senhora).
- Dependências: pedidos precisam de clientes, produtos e estoque; os itens comprados do produto com partes ligam com o estoque de insumos.
- Cobrança (provedor, preço, liberar acesso por pagamento) ainda não definida; é gasto e conta externa, só com decisão do dono.

## Depois (fora do escopo atual)
- Biblioteca de arquivos 3D limpos (.3mf) para download por quem paga (ideia do dono, 27/11/2026). Exige armazenamento, controle de quem pagou e decidir quais modelos podem ser distribuídos. Só depois dos primeiros pagantes.
- Controle de quanto resta em cada rolo e baixa automática de estoque.
- Conector ao vivo com o fatiador (exige programa instalado no computador).
- Utilização da máquina, clientes, estoque, login e banco, importação de G-code, várias mesas, rateio.
