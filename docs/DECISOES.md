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
- Padrões de uso do cadastro (feitos, 27/11/2026, pedidos do dono):
  - Texto em "Título": nomes de filamento, cor, marca, fornecedor, item de estoque, impressora, cálculo e produto ficam sempre assim ("Preto Fosco"), no navegador e na nuvem. Descrições e observações não mudam. Regras em `src/domain/texto.ts`: siglas (PLA, PETG, TPU...) em maiúsculas; de, da, e, com, no... em minúscula; maiúscula no meio da palavra (eSun, GTMax3D) é respeitada; palavra toda em maiúscula com mais de 2 letras vira "Título" (PRETO vira Preto), e com até 2 letras fica (SE, V3). Limite conhecido: nome de 3 letras todo em maiúscula (ex.: "COR") vira "Cor".
  - Nome do filamento gerado: material + cor + marca + código ("PLA Preto Fosco Masterprint 001"). O código sobe por combinação igual, não por total, para o rolo novo de preço diferente ter nome próprio. Botão "Personalizar" libera a edição; "Voltar ao automático" desfaz.
  - Cada campo que aplica tem "+" na linha da etiqueta, com cadastro rápido só do nome (fornecedor, marca, cor; no Estoque, fornecedor). Se o nome já existe na lista, o "+" só escolhe. Detalhes ficam nas telas dedicadas do menu Cadastros: Marcas (site e temperaturas, que preenchem o filamento novo) e Cores.
  - Cor e marca com busca enquanto digita, sem acento e sem diferença de maiúscula. Listas de sugestão em `src/domain/catalogo.ts`: são nomes, sem ranking de uso (não achei fonte de popularidade; só a Voolt3D apareceu em páginas de varejo brasileiro consultadas, as outras vêm do conhecimento do agente). Cores: simples, com acabamento (fosco, silk, metálico, glitter, translúcido), especiais e dual color em versão comum e silk.
  - Preço pago puxa a última compra daquele fornecedor, da mais parecida (mesma marca, material e cor) para a menos parecida. Temperaturas puxam da última compra da mesma marca e material, ou da marca cadastrada. O que a pessoa digita não é sobrescrito.
  - Data da compra em três escolhas: ano, mês, dia (o dia se ajusta ao mês).
  - Nuvem: tabelas `marcas` e `cores` (migração `20261127200000`), RLS, nome único por pessoa sem diferença de maiúscula, limite de 100 de cada.
  - Pendente: nomes de partes, cores e itens comprados dentro do Produto ainda não passam pelo padrão de escrita.
- Pedidos do dono em 27/11/2026, 14:21 (aguardam a escolha do layout, nada disso foi implementado ainda):
  - O padrão "+" com cadastro rápido em janela vale para tudo no app (hoje só em filamentos e no fornecedor do estoque).
  - Ajuda em cada campo: "i" em um círculo logo depois da etiqueta, com explicação de como usar ou para que serve ao passar o mouse (no celular, ao tocar).
  - Campos grandes demais: peso total do lote e preço do filamento ocupam uma linha cada. Remodelar o sistema inteiro com campos lado a lado e menos rolagem. Três opções de layout foram desenhadas no quadro de design para escolha: A (cards em pares), B (painel denso com rótulo à esquerda) e C (em etapas).
  - Tipo do trabalho: nomear e escolher "Parte" ou "Produto final" ao começar o cálculo e de novo ao salvar. Parte salva pode ser usada depois para montar o produto final. Pergunta em aberto: a parte entra no produto pelo custo do cálculo salvo (sem margem), e esse custo já inclui as falhas daquela parte.
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

## Layout A, "i" de ajuda e "+" na calculadora (27/11)
- Calculadora em cartões de 2 colunas, campos em pares, coluna de resultado de 320 px. Menos rolagem.
- "i" depois da etiqueta com tooltip (hover, foco, toque fixa, Esc fecha). Textos em `src/ajuda.ts`.
- "+" com cadastro rápido em Filamento cadastrado e Minha impressora (`QuickForm`); o item novo já fica escolhido.
- Regra da Parte dentro do Produto: Opção 1 confirmada (custo do cálculo salvo, sem margem, falhas não contadas duas vezes, botão Atualizar).
- Depois: aplicar o mesmo layout em Produto e telas de cadastro; tipo Parte/Produto final ao iniciar e ao salvar.
- Layout A aplicado em Produto, Filamentos, Estoque, Fornecedores, Marcas, Cores e Impressoras. "+" rápido em Produto: filamento, impressora e item de estoque (`src/Rapido.tsx`).
- Ainda falta: tipo Parte/Produto final (nome e tipo ao iniciar e ao salvar) e uso da Parte salva dentro do Produto (Opção 1).
- Tipo Parte / Produto final: nome e tipo no topo da calculadora e ao salvar (mesmos valores). O tipo vai dentro do JSON `entrada` (chave `tipo`), sem migração. Cálculo antigo sem tipo vale como produto final.
- Parte salva entra no Produto como item pronto (Opção 1): custo por peça do cálculo salvo, sem margem, sem falhas em dobro, com "Atualizar".

## Importar do fatiador: o que o flamengo.3mf traz (27/11)
- Arquivo do Anycubic Slicer Next, 4 placas, 3 filamentos (PLA preto, vermelho, branco; densidade 1,24), impressora Kobra X 0.4, camada 0,2, preenchimento 15%, torre de limpeza ligada.
- Está fatiado? Não: `slice_info.config` vem vazio. Não há tempo por placa nem gramas por cor, só modelos e configurações.
- Para importar tempo e gramas, o arquivo precisa ser exportado já fatiado (gcode.3mf) ou os números lidos na tela do fatiador. Estimar gramas só pelo volume da malha erra por causa de preenchimento, paredes, purga e torre.
- Depois: importador de .3mf fatiado (leitura no navegador, sem enviar o arquivo a servidor).
- Teste com `escudo_plate_04 ... 25m47s.gcode` (Anycubic Slicer Next): o cabeçalho traz `print_time = 25m 47s` e `used_filament = 3.64` (metros, total com purga). Diâmetro 1,75 mm e densidade 1,24 vêm no cabeçalho. Por cor dá para somar a extrusão por ferramenta (T0, T1, T2) e separar peça de torre (`;TYPE:Prime tower`). A purga das trocas fica em macros comentadas: só aparece como diferença entre o total do cabeçalho e o que foi somado.
- Resultado desse arquivo: peça 5,03 g preto, 2,69 g vermelho, 0,80 g branco; torre 0,52 / 0,12 / 0,12 g; purga cerca de 1,6 g; total cerca de 10,9 g.

## Importador de gcode (27/11)
- Corrige a conta anterior: o total do cabeçalho (`used_filament`) é a extrusão líquida (soma de E com retrações) mais a purga das trocas. Em arquivo de uma cor só, os dois batem (24,65 m e 5,94 m). Purga = total do cabeçalho menos a extrusão líquida; dividida entre as cores pelo que cada uma puxou nos macros de troca. É estimativa.
- Escudo (placa 4): 25 min 47 s, 10,86 g no total. Base: 4 h 24 min, 119,6 g. Superior: 3 h 51 min, 73,5 g. Montagem: 46 min 47 s, 17,7 g.
- `src/domain/gcode.ts` (função pura, testada) e botão "Importar do fatiador" no Produto (vários arquivos, uma parte por arquivo) e na Calculadora (um arquivo). O arquivo é lido no navegador, nada é enviado.
- Rolo cadastrado da mesma cor entra com o preço; sem rolo, o preço fica vazio para a pessoa preencher.
- Depois: ler também .gcode.3mf (Bambu/Orca) e .3mf fatiado.
- Produto: barra de resumo fixa no rodapé (custo, preço sugerido, nome e Salvar). A coluna da direita com os cálculos e o botão Salvar continuam. Nome sugerido: o do arquivo .3mf se for escolhido junto (só o nome é lido, o .3mf não traz fatiamento); sem ele, o produto que está no nome dos .gcode ("Caneca Flamengo - Base" vira produto "Caneca Flamengo", parte "Base").

## Campos em laranja, barra escura e nome repetido
- Campos obrigatórios vazios no Produto ficam em laranja; "Ver o que falta" leva ao primeiro e já o deixa selecionado para digitar.
- Barra inferior escura, igual ao cartão de resultado (números brancos, preço sugerido em âmbar).
- Salvar com nome já existente avisa e, no segundo clique, substitui o antigo (evita duplicar). Vale para Produto e para Parte/Produto final da Calculadora (mesmo nome e mesmo tipo).

## Mesmo nome = mesmo produto, com histórico (substitui a regra de nome repetido)
- Salvar com nome já existente não cria outro produto nem substitui: entra como nova versão. A lista mostra um item por nome (versão mais nova em cima) e um "Histórico" com data, hora e custo de cada versão, cada uma com Abrir e Excluir.
- Vale em Produto e na Calculadora/Painel (nome + tipo). Parte e Produto final com o mesmo nome ficam separados.
- Sem mudança no banco: o agrupamento é feito na tela por nome (`src/domain/versions.ts`). Painel e tabelas de margem usam só a versão mais nova.

## Produto em abas por categoria (modelo do fatiador)
- Abas: Partes (placas, tempo, gramas por cor), Filamentos (um preço por cor, vale para todas as partes), Impressora, Itens comprados, Venda (tempo, falhas, margem, preço) e Meus produtos. Não há uma aba por parte.
- Aba com campo faltando mostra um ponto laranja. "Ver o que falta" abre a aba certa e seleciona o campo.
- Preço do filamento saiu de dentro de cada cor da parte e foi para a aba Filamentos (ex.: 7 preços viraram 3 cores). Painel lateral e barra inferior continuam.
- Aviso grande do topo removido (tirava o ar premium): só a barra inferior avisa, com o primeiro item que falta e o botão Ver o que falta.
- Depois: abas parecidas na Calculadora simples? Guardar presets de filamento/impressora por produto como no fatiador.

## O que falta (lista clicável), preço único para várias cores e busca de campo
- "Ver o que falta" na barra abre uma lista dos campos pendentes; cada linha leva direto ao campo (abre a aba, rola, pisca em laranja e seleciona).
- Quando faltam 2 ou mais preços de filamento, a lista oferece "mesmo preço para as N cores" (digitando o preço ou escolhendo um filamento cadastrado). Depois dá para ajustar cor por cor.
- Busca de campo como no fatiador: botão Buscar na barra das abas ou Ctrl/Cmd+K; digita parte do nome (sem acento), Enter vai ao primeiro resultado.
- Depois: o mesmo na Calculadora e nos cadastros; preço por rolo com validade (acabou o rolo, vale o próximo preço).

## Temas visuais
- Todas as cores saíram das regras e viraram variáveis (`--panel`, `--field`, `--hero-bg`, `--on-dark`, `--on-main`...). Tema Normal ficou igual ao anterior.
- Tema Neon (gradientes, brilho, fundo escuro) só redefine variáveis, então vale para todas as telas. Seletor "Tema" no menu; escolha guardada neste navegador.
- Depois: guardar o tema na conta (nuvem); temas extras (ex.: claro suave, alto contraste).

## Menu com ícones discretos e temas Minimalista e Corporativo (modelos para aprovar)
- Tema e conta viraram ícones sem contorno no canto do menu (`Icones.tsx`); o tema abre uma lista, a conta mostra o e-mail e "Sair". Vale para todos os temas.
- Corporativo aprovado (azul-marinho, serifa nos títulos, faixa dourada). Minimalista foi descartado por ser quase igual ao Normal e removido.

- Temas finais: Minimalista (o antigo Normal, id `normal`), Neon e Corporativo. Padrão para quem não escolheu: Corporativo (`PADRAO` em `Temas.tsx`).

## Rolo mais recente por cor (primeiro passo do preço por rolo)
- Ao importar do fatiador, cada cor pega o preço do rolo cadastrado mais recente daquela cor (antes pegava o mais antigo). Na aba Filamentos, cor sem rolo escolhido mostra "Rolo mais recente desta cor" com botão "Usar este".
- Compra nova de rolo com preço novo passa a valer nos próximos produtos; produtos já salvos mantêm o preço da época.
- Depois (passo 2): status do rolo (em uso, reserva, acabou) e desconto do consumo ao salvar produtos. Exige coluna nova em `filamentos` e tela de rolos.
- Janela e confirmação únicas (`Janela.tsx`): QuickForm, QuickAdd, o que falta e Excluir usam o mesmo `Modal`. Excluir produto apaga todas as versões de uma vez.
- Busca de campo (Ctrl+K e lupa) também na Calculadora; vale em blocos recolhidos.
- Falta unificar: lista Abrir/Excluir (`ListaItens`) e tabela que vira cartão (`Tabela`).
