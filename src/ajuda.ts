// Textos do "i" de ajuda ao lado de cada etiqueta: para que serve o campo e como usar.
// Linguagem simples, sem jargão. Cada texto cabe em poucas linhas.
export const AJUDA = {
  // Calculadora
  grams: 'Peso de tudo que sai nessa impressão, em gramas. Copie do fatiador. Se a peça tem purga e torre, some tudo.',
  pricePerKg: 'Quanto você paga no quilo do filamento. Se já cadastrou o rolo, escolha em Filamento cadastrado e o preço vem sozinho.',
  hours: 'Tempo que o fatiador mostra para a impressão: horas, minutos e segundos.',
  watts: 'Quanta energia a impressora usa em média, em watts. É uma estimativa. Se puder, meça com um wattímetro.',
  tariff: 'Preço do kWh na sua conta de luz.',
  printerPrice: 'Quanto você pagou na impressora. Entra no custo como desgaste: preço dividido pela vida útil, vezes as horas da impressão.',
  lifetimeHours: 'Quantas horas você espera imprimir com ela antes de trocar. Quanto maior, menor o desgaste cobrado por hora.',
  laborMinutes: 'Seu tempo no lote: preparar, tirar da mesa e dar acabamento.',
  laborRate: 'Quanto vale a sua hora de trabalho.',
  failurePct: 'Parte das impressões que dá errado. Entre 5 e 15% é comum. As peças boas pagam as que falharam.',
  quantity: 'Quantas peças saem nesse lote. O custo por peça é o total dividido por esse número.',
  marginPct: 'Margem é o lucro dividido pelo preço de venda. Não é o mesmo que markup, que é o lucro dividido pelo custo.',
  soldPrice: 'Preencha para ver o lucro real. Deixe vazio para ver só o preço sugerido.',
  filamentoCadastrado: 'Escolha um rolo que você cadastrou e o preço por quilo vem preenchido. Use o + para cadastrar um novo sem sair daqui.',
  impressoraCadastrada: 'Escolha a sua impressora e consumo, preço e vida útil vêm preenchidos. Use o + para cadastrar uma nova.',

  nomeTrabalho: 'Dê um nome ao que está calculando. Ex.: Brasão do Flamengo. O nome fica em Título automaticamente.',
  tipoTrabalho: 'Parte entra depois em um produto, como o brasão ou a base. Produto final é a peça pronta para vender.',

  importar: 'Escolha um ou vários arquivos .gcode fatiados. Cada arquivo vira uma parte, com tempo e gramas por cor. O arquivo é lido aqui no seu navegador, nada é enviado.',

  // Filamentos
  material: 'Tipo do plástico do rolo. Cada material tem preço e temperatura próprios.',
  cor: 'Digite para buscar na lista, que tem acabamentos (fosco, silk) e dual color. Se a sua cor não existe, use o + para cadastrar.',
  marca: 'Fabricante do filamento, que pode ser diferente de quem vendeu para você. Use o + para cadastrar uma marca que não está na lista.',
  fornecedor: 'Onde você comprou. Ao escolher, o último preço pago nesse fornecedor é preenchido.',
  nomeFilamento: 'Montado com material, cor, marca e um código que sobe a cada rolo novo da mesma combinação. Clique em Personalizar para escrever o seu.',
  precoRolo: 'Quanto você pagou neste rolo. Cada compra é um registro: um preço novo não muda os cálculos que você já salvou.',
  pesoRolo: 'Peso do filamento do rolo, em gramas. Rolo comum: 1000 g (1 kg).',
  tempBico: 'Temperatura do bico que o fabricante recomenda. Na próxima vez que você escolher essa marca e material, ela vem preenchida.',
  tempMesa: 'Temperatura da mesa que o fabricante recomenda. Na próxima vez que você escolher essa marca e material, ela vem preenchida.',
  dataCompra: 'Dia em que você comprou o rolo. Escolha o ano, o mês e o dia.',

  // Estoque de insumos
  nomeItem: 'Nome do item que você compra pronto, como copo de alumínio ou LED.',
  categoria: 'Serve para agrupar itens parecidos. Ex.: Canecas, Iluminação.',
  custoUnidade: 'Quanto você paga em cada unidade.',
  qtdAgora: 'Quantas unidades você tem agora.',
  minimo: 'Quando a quantidade chegar a esse número, o app avisa que o estoque está baixo.',

  // Fornecedores, marcas, cores, impressoras
  nomeFornecedor: 'Nome da loja ou pessoa de quem você compra.',
  contato: 'WhatsApp, e-mail ou telefone, para achar rápido na hora de comprar.',
  site: 'Endereço do site. Pode escrever sem o https.',
  obs: 'Prazo, frete e condições de pagamento.',
  nomeMarca: 'Nome da marca como está na etiqueta do rolo.',
  nomeCor: 'Escreva como quiser: o nome fica sempre em "Título" (Preto Fosco).',
  nomeImpressora: 'Como você chama a impressora. Ex.: Kobra X da oficina.',
  wattsImpressora: 'Consumo médio, não o máximo da etiqueta. É uma estimativa. Se puder, meça com um wattímetro.',
  precoImpressora: 'Quanto você pagou nela. Pode ser zero se você ganhou ou prefere não contar.',
  vidaImpressora: 'Quantas horas você espera imprimir com ela.',

  // Produto com partes
  nomeParte: 'Uma parte é uma impressão, ou seja, uma placa do fatiador. Ex.: brasão, base, aro.',
  tempoParte: 'Tempo que o fatiador mostra para esta placa: horas, minutos e segundos.',
  pecasPorImpressao: 'Quantas peças saem da mesma placa.',
  pecasPorProduto: 'Quantas dessas peças o produto usa.',
  corLinha: 'Nome da cor, como aparece no fatiador.',
  pecaG: 'Gramas da peça nessa cor, como o fatiador mostra.',
  purgaG: 'Filamento jogado fora quando a impressora troca de cor.',
  torreG: 'Filamento gasto na torre de limpeza que o fatiador cria para trocar de cor.',
  itemComprado: 'O que você compra pronto e entra no produto, como o copo de alumínio. Não passa pela taxa de falhas.',
  doEstoque: 'Escolha um item do estoque e nome e preço vêm preenchidos.',
  precoCada: 'Quanto você paga em cada unidade.',
  quantidade: 'Quantas unidades o produto usa.',
  laborProduto: 'Seu tempo por produto: montagem, colagem e acabamento.',
  nomeProduto: 'Nome do produto pronto. Ex.: caneca Flamengo.',
} as const

export type AjudaKey = keyof typeof AJUDA
