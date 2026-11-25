import { test, expect, type Page } from '@playwright/test';
async function openSystemMenuIfMobile(page:Page){const toggle=page.getByRole('button',{name:'Abrir menu do sistema'});if(await toggle.isVisible()&&await toggle.getAttribute('aria-expanded')!=='true')await toggle.click();}
function systemModule(page:Page,name:string){
 return page.getByRole('navigation',{name:'Módulos do MakerCusto'}).getByRole('button',{name,exact:true});
}
test.beforeEach(async({page})=>{
 await page.route('**/*.supabase.co/rest/v1/mc_catalog?**',route=>route.fulfill({json:[]}));
 await page.route('**/storage/v1/object/list/mc-product-photos',route=>route.fulfill({json:[]}));
});

test('resumo padrão compacto e valores do exemplo',async({page})=>{
 await page.goto('/');
 await expect(page.getByTestId('totalUsed')).toContainText('151,58 g');
 await expect(page.getByTestId('averagePrice')).toContainText('100,00');
 await expect(page.getByTestId('materialCost')).toContainText('15,16');
 await expect(page.getByTestId('unitCost')).toContainText('2,52');
 await expect(page.getByRole('button',{name:/Simples/})).toHaveAttribute('aria-pressed','true');
 await expect(page.getByRole('button',{name:/Detalhar por cor/})).toHaveCount(0);
 await expect(page.getByTestId('simpleQuantity')).toHaveValue('151.58');
 await expect(page.getByTestId('simplePrice')).toHaveValue('100');
 await expect(page.getByRole('table')).toBeHidden();
});
test('define o preço pela margem desejada e usa esse valor no orçamento',async({page})=>{
 await page.goto('/');
 await page.getByTestId('salePrice').fill('8');
 await page.getByRole('radio',{name:'Margem desejada',exact:true}).check();
 const margin=page.getByRole('spinbutton',{name:'Margem bruta desejada (%)',exact:true});
 await margin.fill('50');
 await expect(page.locator('.mc-calculated-sale-price')).toContainText('5,04');
 await page.getByText('Orçamento para cliente',{exact:true}).click();
 await expect(page.getByText(/10 un.*50,40/)).toBeVisible();
 await margin.fill('100');
 await expect(page.getByRole('alert')).toContainText('Informe uma margem desejada');
 await expect(page.locator('.mc-calculated-sale-price')).toHaveCount(0);
 await margin.fill('30');
 await expect(page.locator('.mc-calculated-sale-price')).toContainText('3,60');
 await page.getByRole('radio',{name:'Preço informado',exact:true}).check();
 await expect(page.getByTestId('salePrice')).toHaveValue('8');
});
test('planeja mesas completas e última mesa com somente as peças necessárias',async({page})=>{
 await page.goto('/');
 const pieces=page.getByTestId('quantity');
 await pieces.fill('2');
 await page.getByText('Planejamento do pedido',{exact:true}).click();
 const quantity=page.getByLabel('Quantidade do pedido (peças)');
 await quantity.fill('15');
 await expect(page.getByText('8 mesas no total · 7 completas + última mesa com 1 peça.')).toBeVisible();
 await expect(page.getByText('Faturamento do pedido').locator('..')).toContainText('118,50');
 await expect(page.getByText('Última mesa (rateio estimado)')).toBeVisible();
 const lastPlate=page.getByRole('spinbutton',{name:/Custo da última mesa/});
 await lastPlate.fill('6.20');
 await expect(page.getByText('Última mesa (valor informado)').locator('..')).toContainText('6,20');
 await pieces.fill('3');
 await quantity.fill('14');
 await expect(page.getByText('5 mesas no total · 4 completas + última mesa com 2 peças.')).toBeVisible();
 await expect(lastPlate).toHaveValue('');
 await quantity.fill('12');
 await expect(page.getByText('4 mesas no total · 4 completas.')).toBeVisible();
 await expect(lastPlate).toHaveCount(0);
 await pieces.fill('1');
 await expect(page.getByText('12 mesas no total · 12 completas.')).toBeVisible();
 await quantity.fill('0');
 await expect(page.getByText('Informe uma quantidade inteira de peças maior que zero.')).toBeVisible();
});
test('zera o rascunho nos dois modos sem trocar a impressora',async({page})=>{
 await page.goto('/');
 const clear=page.getByRole('button',{name:'Zerar cálculo',exact:true});
 const dialog=page.getByRole('dialog',{name:'Zerar cálculo'});
 await clear.click();
 await dialog.getByRole('button',{name:'Cancelar'}).click();
 await expect(page.getByTestId('simpleQuantity')).toHaveValue('151.58');
 await clear.click();
 await dialog.getByRole('button',{name:'Zerar cálculo',exact:true}).click();
 await expect(page.getByTestId('simpleQuantity')).toHaveValue('0');
 await expect(page.getByTestId('simplePrice')).toHaveValue('0');
 await page.getByRole('button',{name:/Avançado/}).click();
 const printer=page.getByRole('combobox',{name:'Selecionar impressora'});
 await printer.selectOption('reference:creality-k1c');
 await page.getByRole('button',{name:'Detalhar por cor'}).click();
 await page.getByLabel('Cor do filamento').fill('Vermelho');
 await page.getByTestId('packagePrice').fill('100');
 await page.getByTestId('gramsUsed').fill('14');
 await page.getByRole('button',{name:'Adicionar à tabela'}).click();
 await expect(page.getByTestId('row-extra-1')).toBeVisible();
 await clear.click();
 await dialog.getByRole('button',{name:'Zerar cálculo',exact:true}).click();
 await expect(printer).toHaveValue('reference:creality-k1c');
 await expect(page.getByRole('button',{name:/Avançado/})).toHaveAttribute('aria-pressed','true');
 await expect(page.getByTestId('salePrice')).toHaveValue('0');
 await page.getByRole('button',{name:'Detalhar por cor'}).click();
 await expect(page.getByTestId('row-extra-1')).toHaveCount(0);
});
test('detalhar por cor exibe tabela alinhada e total',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:/Avançado/}).click();
 await page.getByRole('button',{name:/Detalhar por cor/}).click();
 await expect(page.getByRole('table')).toBeVisible();
 await expect(page.getByTestId('row-blue')).toContainText('Azul');
 await expect(page.getByTestId('row-gold')).toContainText('Dourado');
 await expect(page.getByRole('row').last()).toContainText('151,58 g');
 await page.getByRole('button',{name:/Usar total de filamento/}).click();
 await expect(page.getByRole('table')).toBeHidden();
});
test('inclui rolo de 250g com preço total e consumo proporcional',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:/Avançado/}).click();
 await page.getByRole('button',{name:/Detalhar por cor/}).click();
 await page.getByLabel('Cor do filamento').fill('Turquesa');
 await page.getByLabel('Marca do filamento').fill('Masterprint');
 await page.getByTestId('packageQuantity').fill('250');
 await page.getByRole('combobox',{name:'Unidade da embalagem'}).selectOption('g');
 await page.getByTestId('packagePrice').fill('25');
 await page.getByTestId('gramsUsed').fill('50');
 await page.getByLabel('Purga (g)',{exact:true}).fill('5');
 await page.getByLabel('Torre (g)',{exact:true}).fill('2.5');
 await page.getByRole('button',{name:'Adicionar à tabela'}).click();
 await expect(page.getByTestId('row-extra-1')).toContainText('Turquesa');
 await expect(page.getByTestId('row-extra-1')).toContainText('57,5 g');
 await expect(page.getByTestId('row-extra-1')).toContainText('R$ 5,75');
 await expect(page.getByTestId('materialCost')).toContainText('20,91');
 await page.getByRole('button',{name:'Editar Turquesa'}).click();
 await expect(page.getByLabel('Purga (g)',{exact:true})).toHaveValue('5');
 await expect(page.getByLabel('Torre (g)',{exact:true})).toHaveValue('2.5');
});
test('registra Flushed negativo, descarte pesado e segundos do fatiador',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:/Avançado/}).click();
 await page.getByRole('button',{name:/Detalhar por cor/}).click();
 await page.getByLabel('Cor do filamento').fill('Vermelho');
 await page.getByTestId('packagePrice').fill('100');
 await page.getByTestId('gramsUsed').fill('1.31');
 await page.getByLabel('Purga (g)',{exact:true}).fill('-0.08');
 await page.getByText('Metragem do fatiador',{exact:true}).click();
 await page.getByLabel('Purga (m)',{exact:true}).fill('-0.03');
 await page.getByLabel('Total do fatiador (m)',{exact:true}).fill('0.42');
 await page.getByRole('button',{name:'Adicionar à tabela'}).click();
 const row=page.getByTestId('row-extra-1');
 await expect(row).toContainText('1,23 g');
 await expect(row).toContainText('0,42 m');
 await page.getByRole('button',{name:'Editar Vermelho'}).click();
 await page.getByLabel('Descarte pesado (g)',{exact:false}).fill('0.19');
 await page.getByRole('button',{name:'Salvar alteração',exact:true}).click();
 await page.getByRole('dialog',{name:'Salvar alterações do filamento'}).getByRole('button',{name:'Salvar alterações',exact:true}).click();
 await expect(row).toContainText('1,5 g');
 await expect(row).toContainText('Fatiador: 1,23 g');
 await page.getByText('Resumo do fatiador',{exact:true}).click();
 const preparation=page.getByRole('group',{name:'Tempo de preparação'});
 const printing=page.getByRole('group',{name:'Tempo do modelo'});
 await preparation.getByLabel('Segundos').fill('1');
 await printing.getByLabel('Minutos').fill('13');
 await printing.getByLabel('Segundos').fill('32');
 const total=page.getByRole('group',{name:'Tempo de impressão'});
 await expect(total.getByLabel('Minutos')).toHaveValue('13');
 await expect(total.getByLabel('Segundos')).toHaveValue('33');
});
test('compartilha resultado interno e prepara orçamento sem expor custos',async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(window,'print',{value:()=>document.body.dataset.printing='true'}));
 await page.goto('/');
 await page.getByText('Compartilhar resultado',{exact:true}).click();
 const email=await page.getByRole('link',{name:'E-mail',exact:true}).getAttribute('href');
 expect(decodeURIComponent(email!)).toContain('Lucro bruto do lote');
 await page.getByRole('button',{name:'Salvar PDF'}).click();
 await expect(page.locator('body')).toHaveAttribute('data-printing','true');
 await page.emulateMedia({media:'print'});
 await expect(page.locator('.mc-calculation-print')).toBeVisible();
 const pdf=await page.pdf({format:'A4'});
 expect(pdf.subarray(0,4).toString()).toBe('%PDF');
 await page.emulateMedia({media:'screen'});
 await page.getByText('Orçamento para cliente',{exact:true}).click();
 await page.getByLabel('Produto',{exact:true}).fill('Chaveiro');
 await page.getByLabel('Quantidades',{exact:true}).fill('1, 10, 50');
 const whatsapp=await page.getByRole('link',{name:'WhatsApp (texto)',exact:true}).getAttribute('href');
 const quote=new URL(whatsapp!).searchParams.get('text')!;
 expect(quote).toContain('Chaveiro');
 expect(quote).toContain('50 un.');
 expect(quote).toContain('395,00');
 expect(quote).not.toMatch(/custos?|lucro|margem/i);
 await page.getByRole('button',{name:'Preparar imagem'}).click();
 await expect(page.getByRole('button',{name:'Baixar imagem'})).toBeVisible();
});
test('edita uma linha, calcula embalagem 1,3 kg e remove',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:/Avançado/}).click();
 await page.getByRole('button',{name:/Detalhar por cor/}).click();
 await page.getByRole('button',{name:'Editar Azul'}).click();
 await expect(page.getByRole('button',{name:'Salvar alteração'})).toBeVisible();
 await page.getByTestId('packageQuantity').fill('1.3');
 await page.getByTestId('packagePrice').fill('130');
 const saveButton=page.getByRole('button',{name:'Salvar alteração',exact:true});
 await saveButton.click();
 const saveDialog=page.getByRole('dialog',{name:'Salvar alterações do filamento'});
 await expect(saveDialog).toContainText('Azul');
 await expect(saveDialog.getByRole('button',{name:'Cancelar'})).toBeFocused();
 await saveDialog.getByRole('button',{name:'Cancelar'}).click();
 await expect(saveDialog).toBeHidden();
 await expect(saveButton).toBeFocused();
 await expect(page.getByTestId('row-blue')).not.toContainText('1,3 kg');
 await expect(page.getByTestId('packageQuantity')).toHaveValue('1.3');
 await saveButton.click();
 await saveDialog.getByRole('button',{name:'Salvar alterações',exact:true}).click();
 await expect(page.getByTestId('row-blue')).toContainText('1,3 kg');
 await expect(page.getByTestId('materialCost')).toContainText('15,16');
 const removeButton=page.getByRole('button',{name:'Remover Dourado'});
 await removeButton.click();
 const removeDialog=page.getByRole('dialog',{name:'Remover filamento'});
 await expect(removeDialog).toContainText('Dourado');
 await page.keyboard.press('Escape');
 await expect(removeDialog).toBeHidden();
 await expect(page.getByTestId('row-gold')).toBeVisible();
 await removeButton.click();
 await removeDialog.getByRole('button',{name:'Remover filamento'}).click();
 await expect(page.getByTestId('row-gold')).toHaveCount(0);
});
test('valida o formulário sem criar linhas pendentes',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:/Avançado/}).click();
 await page.getByRole('button',{name:/Detalhar por cor/}).click();
 await page.getByRole('button',{name:'Adicionar à tabela'}).click();
 await expect(page.getByRole('group',{name:'Cadastro compacto de filamento'}).getByRole('alert')).toBeVisible();
 await expect(page.locator('tbody tr')).toHaveCount(3);
 await page.getByRole('button',{name:'Adicionar à tabela'}).click();
 await expect(page.locator('tbody tr')).toHaveCount(3);
});
test('memoriza cor personalizada sem duplicar opção padrão',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:/Avançado/}).click();
 await page.getByRole('button',{name:/Detalhar por cor/}).click();
 const c=page.getByLabel('Cor do filamento');
 await c.fill('Turquesa Especial');await c.blur();
 await page.getByLabel('Cor do filamento').click();
 await expect(page.getByRole('option',{name:'Turquesa Especial',exact:true})).toHaveCount(1);
 await page.reload();await page.getByRole('button',{name:/Avançado/}).click();await page.getByRole('button',{name:/Detalhar por cor/}).click();
 await page.getByLabel('Cor do filamento').click();
 await expect(page.getByRole('option',{name:'Turquesa Especial',exact:true})).toHaveCount(1);
 const c2=page.getByLabel('Cor do filamento');await c2.fill('aZuL');await c2.blur();
 await c2.click();
 await expect(page.getByRole('option',{name:'Azul',exact:true})).toHaveCount(1);
});
test('catálogo de filamento abre no clique com materiais, cores e marcas',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:/Avançado/}).click();
 await page.getByRole('button',{name:/Detalhar por cor/}).click();
 const type=page.getByRole('combobox',{name:'Tipo de filamento'});
 await expect(type).toHaveValue('PLA');
 await type.click();
 const options=page.getByRole('listbox',{name:'Sugestões disponíveis'});
 for(const label of ['PLA','PLA+','PETG','TPU','ABS','PEEK','PLA Silk Duo'])await expect(options.getByRole('option',{name:label,exact:true})).toHaveCount(1);
 await options.getByRole('option',{name:'PLA+',exact:true}).click();
 await expect(type).toHaveValue('PLA+');
 const color=page.getByRole('combobox',{name:'Cor do filamento'});
 await color.click();
 expect(await options.getByRole('option').count()).toBeGreaterThanOrEqual(200);
 expect(await options.evaluate(list=>list.scrollHeight>list.clientHeight)).toBe(true);
 for(const label of ['Madeira','Mármore','Verde e Azul','Vermelho e Marrom'])await expect(options.getByRole('option',{name:label,exact:true})).toHaveCount(1);
 await color.fill('água-mar');
 await options.getByRole('option',{name:'Água-Marinha',exact:true}).click();
 await expect(color).toHaveValue('Água-Marinha');
 await color.fill('');
 await expect(options.getByRole('option',{name:'Mármore',exact:true})).toHaveCount(1);
 const brand=page.getByRole('combobox',{name:'Marca do filamento'});
 await brand.click();
 for(const label of ['Masterprint','SUNLU','Comlab','3D Fila','Elegoo','Creality'])await expect(options.getByRole('option',{name:label,exact:true})).toHaveCount(1);
 await brand.press('Escape');
 await expect(options).toHaveCount(0);
});
test('alterações de preço afetam lucro e restauração preserva cenário inicial',async({page})=>{
 await page.goto('/');
 await page.getByTestId('salePrice').fill('1');
 await expect(page.getByTestId('grossProfit')).toHaveClass(/negative/);
 await page.getByRole('button',{name:'Restaurar exemplo'}).click();
 await expect(page.getByTestId('salePrice')).toHaveValue('7.9');
});

test('modo simples permite informar total e preço por kg sem somar cores',async({page})=>{
 await page.goto('/');
 await page.getByTestId('simpleQuantity').fill('200');
 await page.getByTestId('simplePrice').fill('68');
 await expect(page.getByTestId('materialCost')).toContainText('13,60');
 await expect(page.getByTestId('totalUsed')).toContainText('200 g');
 await page.getByRole('button',{name:/Avançado/}).click();
 await page.getByRole('button',{name:/Detalhar por cor/}).click();
 await expect(page.getByTestId('materialCost')).toContainText('15,16');
 await page.getByRole('button',{name:/Usar total de filamento/}).click();
 await expect(page.getByTestId('materialCost')).toContainText('13,60');
 await expect(page.getByTestId('simpleQuantity')).toHaveValue('200');
});
test('modo simples aceita gramas ou quilos tanto no total quanto no preço',async({page})=>{
 await page.goto('/');
 await page.getByTestId('simpleQuantity').fill('0.3');
 await page.getByRole('combobox',{name:'Unidade do total utilizado'}).selectOption('kg');
 await page.getByTestId('simplePrice').fill('0.073');
 await page.getByRole('combobox',{name:'Unidade do preço do filamento'}).selectOption('g');
 await expect(page.getByTestId('totalUsed')).toContainText('300 g');
 await expect(page.getByTestId('materialCost')).toContainText('21,90');
 await expect(page.getByTestId('averagePrice')).toContainText('73,00');
});
test('valor inválido do modo simples mostra erro sem resultado fictício',async({page})=>{
 await page.goto('/');
 await page.getByTestId('simpleQuantity').fill('-1');
 await expect(page.getByRole('alert')).toBeVisible();
 await page.getByTestId('simpleQuantity').fill('100');
 await expect(page.getByRole('alert')).toHaveCount(0);
});

test('seleciona, edita e reutiliza impressora na sessão sem alterar filamento',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:/Avançado/}).click();
 await expect(page.getByRole('heading',{name:'Impressora'})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Filamento'})).toBeVisible();
 await page.getByRole('button',{name:/Nova impressora/}).click();
 await expect(page.getByRole('dialog',{name:'Cadastrar impressora'})).toBeVisible();
 await page.getByRole('textbox',{name:'Nome da minha impressora'}).fill('Kobra X bancada');
 await page.getByRole('button',{name:/Avançado — custos/}).click();
 await page.getByRole('spinbutton',{name:'Valor pago (R$)'}).fill('5000');
 await page.getByRole('spinbutton',{name:/Potência média estimada/}).fill('100');
 await page.getByRole('button',{name:'Salvar impressora'}).click();
 await expect(page.getByRole('dialog')).toHaveCount(0);
 await expect(page.getByRole('combobox',{name:'Selecionar impressora'})).toContainText('Kobra X Bancada');
 await page.getByRole('combobox',{name:'Selecionar impressora'}).selectOption('example');
 await page.getByRole('combobox',{name:'Selecionar impressora'}).selectOption({label:'Kobra X Bancada'});
 await expect(page.locator('.printer-summary')).toContainText('100 W');
 await expect(page.getByTestId('simpleQuantity')).toHaveValue('151.58');
});

test('jornada progressiva apresenta essencial, avancado preserva dados e ao voltar restaura calculo simples',async({page})=>{
 await page.goto('/');
 await expect(page.getByRole('button',{name:/Simples/})).toHaveAttribute('aria-pressed','true');
 await expect(page.getByTestId('simpleQuantity')).toBeVisible();
 await expect(page.getByRole('group',{name:'Tempo de impressão'})).toBeVisible();
 await expect(page.getByTestId('quantity')).toBeVisible();
 await expect(page.getByTestId('salePrice')).toBeVisible();
 await expect(page.getByRole('heading',{name:'Impressora'})).toHaveCount(0);
 await expect(page.getByTestId('accessoryPerUnit')).toHaveCount(0);
 await expect(page.getByTestId('unitProfit')).toBeVisible();
 await page.getByTestId('simpleQuantity').fill('200');
 await page.getByTestId('simplePrice').fill('68');
 await expect(page.getByTestId('materialCost')).toContainText('13,60');
 await page.getByRole('button',{name:/Avançado/}).click();
 await expect(page.getByRole('heading',{name:'Impressora'})).toBeVisible();
 await expect(page.getByTestId('accessoryPerUnit')).toBeVisible();
 await page.getByRole('button',{name:/Detalhar por cor/}).click();
 await expect(page.getByTestId('materialCost')).toContainText('15,16');
 await page.getByRole('button',{name:/Simples/}).click();
 await expect(page.getByTestId('materialCost')).toContainText('13,60');
 await expect(page.getByTestId('simpleQuantity')).toHaveValue('200');
 await expect(page.getByRole('heading',{name:'Impressora'})).toHaveCount(0);
});
test('retorno ao exemplo recupera a entrada simples',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:/Avançado/}).click();
 await page.getByRole('button',{name:/Detalhar por cor/}).click();
 await page.getByRole('button',{name:/Simples/}).click();
 await page.getByRole('button',{name:'Restaurar exemplo'}).click();
 await expect(page.getByRole('button',{name:/Simples/})).toHaveAttribute('aria-pressed','true');
 await expect(page.getByTestId('simpleQuantity')).toHaveValue('151.58');
 await expect(page.getByRole('button',{name:/Detalhar por cor/})).toHaveCount(0);
});

test('botões mais abrem modal de cadastro reutilizável',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:/Avançado/}).click();
 await page.getByRole('button',{name:/Detalhar por cor/}).click();
 await page.getByRole('button',{name:'Cadastrar cor'}).click();
 await expect(page.getByRole('dialog',{name:'Cadastrar cor'})).toBeVisible();
 await page.getByRole('textbox',{name:'Nome de cor'}).fill('azul clrao');
 await expect(page.getByRole('status').filter({hasText:'Já existe uma opção parecida'})).toContainText('Azul Claro');
 await page.getByRole('textbox',{name:'Nome de cor'}).fill('turquesa única');
 await page.getByRole('button',{name:'Salvar cadastro'}).click();
 await page.getByLabel('Cor do filamento').click();
 await expect(page.getByRole('option',{name:'Turquesa Única',exact:true})).toHaveCount(1);
 await expect(page.getByRole('button',{name:'Cadastrar tipo'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Cadastrar marca'})).toBeVisible();
});
test('login, oficina e cadastro persistente consomem API autenticada',async({page})=>{
 const base='https://bxtbfdddcxbyaomydgxn.supabase.co';
 const user={id:'a93d1121-6fdd-4577-a696-ab4fe8fb73de',email:'teste@makercusto.local'};
 const workshop='ac4ea594-d465-4b0b-9c0c-589dadb8624f';
 const model='00ab1bb6-8b6f-4f10-b2a4-2a91d57d2268';
 const printer='6d0f9788-bc84-4532-8a34-a923cab1546a';
 let persisted=false;
 await page.route(base+'/**',async(route)=>{
  const req=route.request(),u=new URL(req.url()),path=u.pathname,method=req.method();
  const json=(obj:unknown)=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(obj)});
  if(path==='/auth/v1/token'){await json({access_token:'test-token',refresh_token:'refresh-token',expires_in:3600,user});return;}
  if(path==='/rest/v1/mc_catalog'){await json([{id:model,kind:'printer_model',name:'Kobra X',manufacturer:'Anycubic',scope:'global'}]);return;}
  if(path==='/rest/v1/mc_workspaces'){await json([{id:workshop,name:'Minha oficina',owner_id:user.id}]);return;}
  if(path==='/rest/v1/mc_printers'&&method==='POST'){
   const body=JSON.parse(req.postData()||'{}');
   expect(body.workspace_id).toBe(workshop);
   expect(req.headers().authorization).toBe('Bearer test-token');
   persisted=true;await json([{id:printer,...body,active:true}]);return;
  }
  if(path==='/rest/v1/mc_printers'){await json([]);return;}
  await json([]);
 });
 await page.goto('/');
 await page.getByRole('button',{name:'Entrar',exact:true}).click();
 await page.getByRole('textbox',{name:'E-mail'}).fill(user.email);
 await page.getByLabel('Senha').fill('senha-teste');
 await page.getByRole('dialog',{name:'Entrar no MakerCusto'}).getByRole('button',{name:'Entrar',exact:true}).click();
 await expect(page.getByRole('region',{name:'Painel da oficina'})).toBeVisible();
 await openSystemMenuIfMobile(page);
 await systemModule(page,'Calculadora de custos').click();
 await page.getByRole('button',{name:/Avançado/}).click();
 await page.getByRole('button',{name:/Nova impressora/}).click();
 await page.getByRole('combobox',{name:'Fabricante da impressora'}).selectOption('Anycubic');
 await page.getByRole('combobox',{name:'Modelo da impressora'}).selectOption('preset:anycubic-kobra-x');
 await page.getByRole('button',{name:'Salvar impressora'}).click();
 await expect(page.getByRole('combobox',{name:'Selecionar impressora'})).toContainText('Anycubic Kobra X');
 expect(persisted).toBe(true);
});

test('modelos populares estão disponíveis sem retorno do catálogo remoto e custos não herdam preço fictício',async({page})=>{
 await page.route('https://bxtbfdddcxbyaomydgxn.supabase.co/rest/v1/mc_catalog?**',route=>route.fulfill({status:200,contentType:'application/json',body:'[]'}));
 await page.goto('/');await page.getByRole('button',{name:/Avançado/}).click();
 await page.getByRole('button',{name:/Nova impressora/}).click();
 await page.getByRole('combobox',{name:'Fabricante da impressora'}).selectOption('Bambu Lab');
 const models=page.getByRole('combobox',{name:'Modelo da impressora'});
 await expect(models.locator('option',{hasText:'Bambu Lab A1 mini'})).toHaveCount(1);
 await page.getByRole('combobox',{name:'Fabricante da impressora'}).selectOption('Anycubic');
 await expect(models.locator('option',{hasText:'Anycubic Kobra X'})).toHaveCount(1);
 await models.selectOption('preset:anycubic-kobra-x');
 await expect(page.getByRole('textbox',{name:'Nome da minha impressora'})).toHaveValue('Anycubic Kobra X');
 await page.getByRole('button',{name:/Avançado — custos/}).click();
 await expect(page.getByText('Custo por hora (estimado)')).toBeVisible();
 await page.getByRole('button',{name:'Salvar impressora'}).click();
 await expect(page.locator('.printer-summary')).toContainText('R$ 3.500,00');
});

test('fabricante filtra modelos e cópia herda estimativas',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:/Avançado/}).click();
 await page.getByRole('button',{name:/Nova impressora/}).click();
 await page.getByRole('combobox',{name:'Fabricante da impressora'}).selectOption('Anycubic');
 const m=page.getByRole('combobox',{name:'Modelo da impressora'});
 await expect(m.locator('option',{hasText:'Bambu Lab A1'})).toHaveCount(0);
 await m.selectOption('preset:anycubic-kobra-x');
 await expect(page.getByText('260 × 260 × 260 mm')).toBeVisible();
 await expect(page.getByRole('textbox',{name:'Nome da minha impressora'})).toHaveValue('Anycubic Kobra X');
 await page.getByRole('textbox',{name:'Nome da minha impressora'}).fill('Aninha');
 await page.getByRole('button',{name:/Avançado — custos/}).click();
 await expect(page.getByRole('spinbutton',{name:'Valor pago (R$)'})).toHaveValue('3500');
 await page.getByRole('button',{name:'Salvar impressora'}).click();
 await expect(page.getByRole('combobox',{name:'Selecionar impressora'})).toContainText('Aninha');
});
test('nome de cor é normalizado e sugestões são limitadas',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:/Avançado/}).click();await page.getByRole('button',{name:/Detalhar por cor/}).click();
 await page.getByLabel('Cor do filamento').fill('verm');
 await expect(page.locator('.smart-suggestions').getByRole('option')).toHaveCount(3);
 await page.getByLabel('Cor do filamento').fill('vermelho fosco');
 await page.getByTestId('packagePrice').fill('100');await page.getByTestId('gramsUsed').fill('10');
 await page.getByRole('button',{name:'Adicionar à tabela'}).click();
 await expect(page.getByTestId('row-extra-1')).toContainText('Vermelho Fosco');
});

test('perfil básico de filamento pode ser consultado e clonado sem modificar padrão',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:/Avançado/}).click();await page.getByRole('button',{name:/Detalhar por cor/}).click();
 await page.getByLabel('Tipo de filamento').fill('PLA');await page.getByLabel('Marca do filamento').fill('SUNLU');
 await expect(page.getByRole('region',{name:'Configuração de filamento para slicer'})).toContainText('200–230 °C');
 const cloneButton=page.getByRole('region',{name:'Configuração de filamento para slicer'}).getByRole('button',{name:'Clonar e personalizar'});
 const box=await cloneButton.boundingBox();
 const viewport=page.viewportSize();
 expect(box).not.toBeNull();
 expect(box!.x+box!.width/2).toBeLessThan(viewport!.width);
 await cloneButton.click();
 await page.getByRole('textbox',{name:'Nome da configuração'}).fill('pla sunlu aninha');
 await page.getByRole('textbox',{name:'Bico do perfil'}).fill('210 °C');
 await page.getByRole('button',{name:'Salvar meu perfil'}).click();
 await expect(page.getByRole('combobox',{name:'Perfil do filamento'})).toContainText('PLA SUNLU Aninha');
 await page.getByRole('combobox',{name:'Perfil do filamento'}).selectOption('');
 await expect(page.getByRole('region',{name:'Configuração de filamento para slicer'})).toContainText('200–230 °C');
});

test('busca de modelo escolhe referência e preenche o nome sem segunda seleção',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:/Avançado/}).click();
 await page.getByRole('button',{name:/Nova impressora/}).click();
 await page.getByRole('combobox',{name:'Fabricante da impressora'}).selectOption('Anycubic');
 await page.getByRole('combobox',{name:'Pesquisar modelo'}).fill('Kobra X');
 await expect(page.getByRole('combobox',{name:'Modelo da impressora'})).toHaveValue('preset:anycubic-kobra-x');
 await expect(page.getByRole('textbox',{name:'Nome da minha impressora'})).toHaveValue('Anycubic Kobra X');
});
test('fichas técnicas adicionais exibem referências verificadas do fabricante',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:/Avançado/}).click();
 await page.getByRole('button',{name:/Nova impressora/}).click();
 await page.getByRole('combobox',{name:'Fabricante da impressora'}).selectOption('Bambu Lab');
 await page.getByRole('combobox',{name:'Modelo da impressora'}).selectOption('preset:bambu-a1-mini');
 await expect(page.getByText('180 × 180 × 180 mm')).toBeVisible();
 await page.getByRole('combobox',{name:'Fabricante da impressora'}).selectOption('Prusa');
 await page.getByRole('combobox',{name:'Modelo da impressora'}).selectOption('preset:prusa-mk4s');
 await expect(page.getByText('250 × 210 × 220 mm')).toBeVisible();
});
test('cópias de perfil não sobrescrevem perfis pessoais com nomes iguais',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:/Avançado/}).click();
 await page.getByRole('button',{name:/Detalhar por cor/}).click();
 await page.getByLabel('Tipo de filamento').fill('PLA');
 await page.getByLabel('Marca do filamento').fill('SUNLU');
 await page.getByRole('region',{name:'Configuração de filamento para slicer'}).getByRole('button',{name:'Clonar e personalizar'}).click();
 await page.getByRole('textbox',{name:'Nome da configuração'}).fill('Meu PLA');
 await page.getByRole('button',{name:'Salvar meu perfil'}).click();
 await page.getByRole('region',{name:'Configuração de filamento para slicer'}).getByRole('button',{name:'Clonar e personalizar'}).click();
 await page.getByRole('textbox',{name:'Nome da configuração'}).fill('meu pla');
 await page.getByRole('button',{name:'Salvar meu perfil'}).click();
 await expect(page.getByRole('alert').filter({hasText:'Já existe um perfil com esse nome'})).toBeVisible();
});

test('autocomplete aceita teclado e mantém no máximo três sugestões',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:/Avançado/}).click();await page.getByRole('button',{name:/Detalhar por cor/}).click();
 const input=page.getByRole('combobox',{name:'Cor do filamento'});
 await input.fill('ver');
 await expect(page.getByRole('listbox',{name:'Sugestões disponíveis'}).getByRole('option')).toHaveCount(3);
 await input.press('ArrowDown');
 await expect(page.getByRole('listbox',{name:'Sugestões disponíveis'}).getByRole('option',{selected:true})).toHaveCount(1);
 await input.press('Enter');
 await expect(input).toHaveValue(/Verde|Vermelho/);
 await expect(page.getByRole('listbox',{name:'Sugestões disponíveis'})).toHaveCount(0);
});
test('Escape fecha sugestões sem substituir o que usuário digitou',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:/Avançado/}).click();await page.getByRole('button',{name:/Detalhar por cor/}).click();
 const input=page.getByRole('combobox',{name:'Cor do filamento'});
 await input.fill('ver');
 await expect(page.getByRole('listbox',{name:'Sugestões disponíveis'})).toBeVisible();
 await input.press('Escape');
 await expect(input).toHaveValue('ver');
 await expect(page.getByRole('listbox',{name:'Sugestões disponíveis'})).toHaveCount(0);
});

test('modelos globais estão disponíveis na calculadora sem criar impressora',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:/Avançado/}).click();
 const dropdown=page.getByRole('combobox',{name:'Selecionar impressora'});
 await expect(dropdown.locator('option[value="reference:bambu-a1-mini"]')).toHaveCount(1);
 await dropdown.selectOption('reference:bambu-a1-mini');
 await expect(dropdown).toHaveValue('reference:bambu-a1-mini');
 await expect(page.locator('.printer-summary')).toContainText('150 W');
 await page.getByRole('button',{name:'Clonar e personalizar'}).click();
 await expect(page.getByRole('textbox',{name:'Nome da minha impressora'})).toHaveValue('Bambu Lab A1 mini');
 await page.getByRole('textbox',{name:'Nome da minha impressora'}).fill('Minha A1 Mini');
 await page.getByRole('button',{name:'Salvar personalização'}).click();
 await expect(dropdown).toContainText('Minha A1 Mini');
 await dropdown.selectOption('reference:bambu-a1-mini');
 await expect(dropdown).toHaveValue('reference:bambu-a1-mini');
});
test('troca entre padrões mantém fichas globais intactas',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:/Avançado/}).click();
 const dropdown=page.getByRole('combobox',{name:'Selecionar impressora'});
 await dropdown.selectOption('reference:anycubic-kobra-3');
 await page.getByRole('button',{name:'Clonar e personalizar'}).click();
 await expect(page.getByText('250 × 250 × 260 mm')).toBeVisible();
 await page.getByRole('button',{name:'Cancelar'}).click();
 await dropdown.selectOption('reference:creality-ender-3-v3-se');
 await page.getByRole('button',{name:'Clonar e personalizar'}).click();
 await expect(page.getByText('220 × 220 × 250 mm')).toBeVisible();
});

test('perfil de filamento personalizado pode ser editado e persiste após recarregar',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:/Avançado/}).click();await page.getByRole('button',{name:/Detalhar por cor/}).click();
 await page.getByLabel('Tipo de filamento').fill('PETG');await page.getByLabel('Marca do filamento').fill('Masterprint');
 const region=page.getByRole('region',{name:'Configuração de filamento para slicer'});
 await region.getByRole('button',{name:'Clonar e personalizar'}).click();
 await region.getByRole('textbox',{name:'Nome da configuração'}).fill('Minha regulagem PETG');
 await region.getByRole('button',{name:'Salvar meu perfil'}).click();
 await region.getByRole('button',{name:'Editar meu perfil'}).click();
 await region.getByRole('textbox',{name:'Bico do perfil'}).fill('238 °C');
 await region.getByRole('button',{name:'Salvar alterações'}).click();
 await region.getByRole('dialog',{name:'Salvar alterações do perfil'}).getByRole('button',{name:'Salvar alterações'}).click();
 await expect(region).toContainText('238 °C');
 await region.getByRole('combobox',{name:'Perfil do filamento'}).selectOption('');
 await expect(region).toContainText('230–245 °C');
 await page.reload();await page.getByRole('button',{name:/Avançado/}).click();await page.getByRole('button',{name:/Detalhar por cor/}).click();
 await page.getByLabel('Tipo de filamento').fill('PETG');await page.getByLabel('Marca do filamento').fill('Masterprint');
 await region.getByRole('combobox',{name:'Perfil do filamento'}).selectOption({label:'Minha Regulagem PETG'});
 await expect(region).toContainText('238 °C');
});
test('outros materiais de catálogo têm pontos de partida visíveis no slicer',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:/Avançado/}).click();await page.getByRole('button',{name:/Detalhar por cor/}).click();
 const region=page.getByRole('region',{name:'Configuração de filamento para slicer'});
 for(const material of ['PLA+','ABS','ASA','PA','PC','PVA']){
  await page.getByLabel('Marca do filamento').fill('');
  await page.getByLabel('Tipo de filamento').fill(material);
  await expect(region).toContainText('Estimativa MakerCusto');
 }
 await page.getByLabel('Tipo de filamento').fill('PEEK');
 await page.getByLabel('Tipo de filamento').blur();
 await expect(page.getByRole('region',{name:'Configuração de filamento para slicer'})).toHaveCount(0);
 await page.getByRole('button',{name:'Ajuda: Filamento',exact:true}).focus();
 await expect(page.getByRole('tooltip')).toContainText('perfil técnico ainda não está disponível');
});
test('preço da embalagem explica custo por quilo e preserva cálculo',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:/Avançado/}).click();await page.getByRole('button',{name:/Detalhar por cor/}).click();
 await page.getByTestId('packagePrice').fill('120');
 await page.getByRole('button',{name:'Ajuda: Preço total (R$)'}).focus();
 await expect(page.getByRole('tooltip')).toContainText('R$ 120,00/kg');
 await page.getByTestId('packageQuantity').fill('0.5');
 await page.getByRole('button',{name:'Ajuda: Preço total (R$)'}).focus();
 await expect(page.getByRole('tooltip')).toContainText('R$ 240,00/kg');
});

test('visitante preserva impressora pessoal e seleção após recarregar',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:/Avançado/}).click();
 const dropdown=page.getByRole('combobox',{name:'Selecionar impressora'});
 await dropdown.selectOption('reference:anycubic-kobra-x');
 await page.getByRole('button',{name:'Clonar e personalizar'}).click();
 await page.getByRole('textbox',{name:'Nome da minha impressora'}).fill('Aninha');
 await page.getByRole('button',{name:'Salvar personalização'}).click();
 await expect(dropdown.locator('option',{hasText:'Aninha'})).toHaveCount(1);
 await expect(dropdown.locator('option[value="reference:anycubic-kobra-x"]')).toHaveCount(1);
 await page.reload();await page.getByRole('button',{name:/Avançado/}).click();
 const restored=page.getByRole('combobox',{name:'Selecionar impressora'});
 await expect(restored.locator('option',{hasText:'Aninha'})).toHaveCount(1);
 await expect(restored.locator('option:checked')).toHaveText('Aninha');
 await expect(page.locator('.printer-summary')).toContainText('150 W');
 await page.getByRole('button',{name:'Editar minha impressora'}).click();
 await page.getByRole('textbox',{name:'Nome da minha impressora'}).fill('Aninha Revisada');
 await page.getByRole('button',{name:'Salvar personalização'}).click();
 const confirmation=page.getByRole('dialog',{name:'Salvar alterações da impressora'});
 await expect(confirmation).toContainText('Aninha');
 await page.keyboard.press('Escape');
 await expect(confirmation).toBeHidden();
 await expect(page.getByRole('textbox',{name:'Nome da minha impressora'})).toHaveValue('Aninha Revisada');
 await page.getByRole('button',{name:'Salvar personalização'}).click();
 await confirmation.getByRole('button',{name:'Salvar alterações'}).click();
 await expect(restored.locator('option:checked')).toHaveText('Aninha Revisada');
});
test('restaurar exemplo não exclui impressoras pessoais do visitante',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:/Avançado/}).click();
 await page.getByRole('combobox',{name:'Selecionar impressora'}).selectOption('reference:bambu-a1');
 await page.getByRole('button',{name:'Clonar e personalizar'}).click();
 await page.getByRole('textbox',{name:'Nome da minha impressora'}).fill('Minha Bambu');
 await page.getByRole('button',{name:'Salvar personalização'}).click();
 await page.getByRole('button',{name:'Restaurar exemplo'}).click();
 await page.getByRole('button',{name:/Avançado/}).click();
 const dropdown=page.getByRole('combobox',{name:'Selecionar impressora'});
 await expect(dropdown).toHaveValue('example');
 await expect(dropdown.locator('option',{hasText:'Minha Bambu'})).toHaveCount(1);
 await page.reload();await page.getByRole('button',{name:/Avançado/}).click();
 await expect(page.getByRole('combobox',{name:'Selecionar impressora'}).locator('option',{hasText:'Minha Bambu'})).toHaveCount(1);
});
test('visitante preserva última referência selecionada sem criar cópia',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:/Avançado/}).click();
 await page.getByRole('combobox',{name:'Selecionar impressora'}).selectOption('reference:creality-k1c');
 await page.reload();await page.getByRole('button',{name:/Avançado/}).click();
 await expect(page.getByRole('combobox',{name:'Selecionar impressora'})).toHaveValue('reference:creality-k1c');
});

test('calculadora pública mostra resultado e chamada de cadastro',async({page})=>{
 await page.goto('/');
 await expect(page.getByRole('button',{name:'Salvar produto e custo'})).toHaveCount(0);
 await page.getByRole('button',{name:'Ajuda: Indicadores do resultado'}).focus();
 await expect(page.getByRole('tooltip')).toContainText('Markup é essa diferença em relação ao custo');
 await page.getByTestId('salePrice').fill('1');
 await expect(page.getByTestId('unitProfit')).toHaveClass(/negative/);
 await expect(page.getByTestId('margin')).toHaveClass(/negative/);
 await page.getByRole('button',{name:'Criar conta',exact:true}).click();
 await expect(page.getByRole('dialog',{name:'Criar minha conta'})).toBeVisible();
});
test('catálogo abre antes do formulário e salva novo produto na oficina',async({page})=>{
 const workspace='11111111-1111-4111-8111-111111111111';
 const user='22222222-2222-4222-8222-222222222222';
 const saved:{name:string;id:string;sku:string|null;kind:'product'|'component'|'kit';sale_price:number|null;workspace_id:string;description:string|null;active:boolean;created_at:string}[]=[];
 let posted:Record<string,unknown>|undefined;
 await page.addInitScript(({user})=>localStorage.setItem('makercusto:session:v1',JSON.stringify({
  access_token:'mock-token',refresh_token:'mock-refresh',expires_at:Date.now()+3600000,user:{id:user,email:'teste@example.test'}
 })),{user});
 await page.route('**/rest/v1/**',async route=>{
  const url=route.request().url();
  if(url.includes('/mc_workspaces?'))return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([{id:workspace,name:'Minha oficina',owner_id:user}])});
  if(url.includes('/mc_printers?')||url.includes('/mc_catalog?'))return route.fulfill({status:200,contentType:'application/json',body:'[]'});
  if(url.includes('/mc_products?'))return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(saved)});
  if(url.includes('/rpc/mc_list_assemblies'))return route.fulfill({status:200,contentType:'application/json',body:'[]'});
  if(url.includes('/rpc/mc_save_product_record')){
   posted=route.request().postDataJSON() as Record<string,unknown>;
   saved.push({id:'33333333-3333-4333-8333-333333333333',workspace_id:workspace,name:String(posted.p_name),sku:String(posted.p_sku),kind:'product',sale_price:null,description:null,active:true,created_at:new Date().toISOString()});
   return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(saved[0].id)});
  }
  return route.fulfill({status:404,contentType:'application/json',body:'{}'});
 });
 await page.goto('/');
 await openSystemMenuIfMobile(page);
 await systemModule(page,'Produtos').click();
 await expect(page.getByRole('heading',{name:'Produtos da oficina'})).toBeVisible();
 await expect(page.getByRole('textbox',{name:'Nome do produto'})).toHaveCount(0);
 await page.getByRole('button',{name:'+ Novo produto'}).click();
 await page.getByRole('textbox',{name:'Nome do produto'}).fill('Chaveiro Galo');
 await page.getByRole('textbox',{name:'SKU do produto'}).fill('GAL-01');
 await page.getByRole('button',{name:'Salvar produto',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Ficha do produto'})).toBeVisible();
 await expect(page.locator('.product-detail-head h3')).toHaveText('Chaveiro Galo');
 expect(posted?.p_workspace_id).toBe(workspace);
 expect(posted?.p_kind).toBe('product');
 expect(posted?.p_product_id).toBeNull();
});
test('conjunto de três peças: catálogo, criação, custos, edição e duplicação',async({page})=>{
 const workspace='11111111-1111-4111-8111-111111111111';
 const user='22222222-2222-4222-8222-222222222222';
 type Kit={id:string;name:string;sku:string|null;description:string|null;sale_price:number|null;created_at:string;revision:number;total_cost:number|null;cost_status:string;parts:{id:string;name:string;quantity:number;grams:string|null;unit_cost:number|null;notes:string|null}[]};
 const kits:Kit[]=[];
 const products:{id:string;workspace_id:string;name:string;sku:string|null;kind:string;sale_price:number|null;description:string|null;active:boolean;created_at:string}[]=[];
 let payload:Record<string,unknown>|undefined;
 let revisions=0;
 await page.addInitScript(({user})=>localStorage.setItem('makercusto:session:v1',JSON.stringify({
  access_token:'mock-token',refresh_token:'mock-refresh',expires_at:Date.now()+3600000,user:{id:user,email:'teste@example.test'}
 })),{user});
 await page.route('**/rest/v1/**',async route=>{
  const url=route.request().url();
  const respond=(v:unknown)=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(v)});
  if(url.includes('/mc_workspaces?'))return respond([{id:workspace,name:'Minha oficina',owner_id:user}]);
  if(url.includes('/mc_printers?')||url.includes('/mc_catalog?'))return respond([]);
  if(url.includes('/mc_products?'))return respond(products);
  if(url.includes('/rpc/mc_list_assemblies'))return respond(kits);
  if(url.includes('/rpc/mc_create_assembly')){
   payload=route.request().postDataJSON() as Record<string,unknown>;
   const parts=payload.p_parts as {name:string;quantity:number;grams:number|null;unit_cost:number|null;notes:string}[];
   const id='33333333-3333-4333-8333-'+String(kits.length+1).padStart(12,'0');
   const name=String(payload.p_name);
   kits.push({id,name,sku:null,description:null,sale_price:null,created_at:new Date().toISOString(),revision:1,cost_status:'estimated',
    total_cost:parts.every(p=>p.unit_cost!==null)?parts.reduce((n,p)=>n+p.unit_cost!*p.quantity,0):null,
    parts:parts.map((p,i)=>({id:'part'+i,name:p.name,quantity:p.quantity,grams:p.grams===null?null:String(p.grams),unit_cost:p.unit_cost,notes:p.notes}))});
   products.push({id,name,workspace_id:workspace,sku:null,kind:'kit',sale_price:null,description:null,active:true,created_at:new Date().toISOString()});
   return respond(id);
  }
  if(url.includes('/rpc/mc_update_assembly')){
   revisions++;payload=route.request().postDataJSON() as Record<string,unknown>;
   const item=kits.find(p=>p.id===payload?.p_product_id)!;
   item.name=String(payload.p_name);item.revision++;
   const parts=payload.p_parts as {id:string;name:string;quantity:number;unit_cost:number|null;grams:number|null;notes:string}[];
   item.parts=parts.map(p=>({...p,grams:p.grams===null?null:String(p.grams)}));
   item.total_cost=parts.every(p=>p.unit_cost!==null)?parts.reduce((n,p)=>n+(p.unit_cost??0)*p.quantity,0):null;
   return respond(item.revision);
  }
  return route.fulfill({status:404,contentType:'application/json',body:'{}'});
 });
 await page.goto('/');
 await openSystemMenuIfMobile(page);
 await systemModule(page,'Produtos').click();
 await page.getByRole('navigation',{name:'Abas de Produtos e componentes'}).getByRole('button',{name:'Conjuntos',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Conjuntos'})).toBeVisible();
 await page.getByRole('button',{name:'+ Novo conjunto'}).click();
 await expect(page.getByRole('textbox',{name:'Nome do produto'})).toBeEmpty();
 await page.getByRole('textbox',{name:'Nome do produto'}).fill('Brinquedo lançador de hélices');
 await expect(page.locator('.product-name-feature strong')).toHaveText('Brinquedo lançador de hélices');
 await expect(page.locator('.form-action-dock')).toHaveCSS('position','fixed');
 await page.getByRole('textbox',{name:'Nome da peça 1'}).fill('Lançador');
 await page.getByRole('textbox',{name:'Nome da peça 2'}).fill('Haste');
 await page.getByRole('button',{name:'+ Adicionar peça'}).click();
 await page.getByRole('textbox',{name:'Nome da peça 3'}).fill('Hélice');
 await page.getByRole('spinbutton',{name:'Custo da peça 1'}).fill('2.50');
 await page.getByRole('spinbutton',{name:'Custo da peça 2'}).fill('0.80');
 await page.getByRole('spinbutton',{name:'Custo da peça 3'}).fill('1.20');
 await expect(page.getByText('R$ 4,50 (informado)')).toBeVisible();
 await page.getByRole('button',{name:'Salvar produto',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Ficha do produto'})).toBeVisible();
 await expect(page.locator('.product-detail-head h3')).toHaveText('Brinquedo Lançador de Hélices');
 await expect(page.locator('.form-action-dock')).toBeVisible();
 await expect(page.locator('.form-action-dock')).toHaveCSS('position','fixed');
 await expect(page.getByText('R$ 4,50 (informado)')).toBeVisible();
 expect((payload?.p_parts as unknown[])).toHaveLength(3);
 await page.getByRole('button',{name:'Editar',exact:true}).click();
 await page.getByRole('spinbutton',{name:'Custo da peça 2'}).fill('1.10');
 await page.getByRole('button',{name:'Salvar nova revisão'}).click();
 const editConfirmation=page.getByRole('dialog',{name:'Salvar nova revisão'});
 await expect(editConfirmation).toContainText('Brinquedo Lançador de Hélices');
 await editConfirmation.getByRole('button',{name:'Cancelar'}).click();
 expect(revisions).toBe(0);
 await expect(page.getByRole('spinbutton',{name:'Custo da peça 2'})).toHaveValue('1.10');
 await page.getByRole('button',{name:'Salvar nova revisão'}).click();
 await editConfirmation.getByRole('button',{name:'Salvar alterações'}).click();
 await expect(page.getByText('R$ 4,80 (informado)')).toBeVisible();
 expect(revisions).toBe(1);
 await page.getByRole('button',{name:'Duplicar'}).click();
 await expect(page.getByRole('textbox',{name:'Nome do produto'})).toHaveValue('Brinquedo Lançador de Hélices — cópia');
 await expect(page.getByRole('spinbutton',{name:'Custo da peça 1'})).toBeEmpty();
});
test('validação impede cadastrar conjunto sem nome das peças',async({page})=>{
 const user='22222222-2222-4222-8222-222222222222',workspace='11111111-1111-4111-8111-111111111111';
 await page.addInitScript(({user})=>localStorage.setItem('makercusto:session:v1',JSON.stringify({access_token:'mock-token',refresh_token:'mock-refresh',expires_at:Date.now()+3600000,user:{id:user}})),{user});
 await page.route('**/rest/v1/**',async route=>{
  const url=route.request().url();
  if(url.includes('/mc_workspaces?'))return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([{id:workspace,name:'Oficina',owner_id:user}])});
  return route.fulfill({status:200,contentType:'application/json',body:'[]'});
 });
 await page.goto('/');
 await openSystemMenuIfMobile(page);
 await systemModule(page,'Produtos').click();
 await page.getByRole('navigation',{name:'Abas de Produtos e componentes'}).getByRole('button',{name:'Conjuntos',exact:true}).click();
 await page.getByRole('button',{name:'+ Novo conjunto'}).click();
 await page.getByRole('textbox',{name:'Nome do produto'}).fill('Kit de teste');
 await page.getByRole('button',{name:'Salvar produto',exact:true}).click();
 await expect(page.getByRole('alert')).toContainText('Informe pelo menos duas peças válidas');
});
test('acesso público preserva calculadora sem apresentar sistema privado',async({page})=>{
 await page.goto('/');
 await expect(page.getByRole('heading',{name:'Descubra seu custo. Venda com confiança.'})).toBeVisible();
 await expect(page.getByRole('navigation',{name:'Módulos do MakerCusto'})).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Entrar',exact:true})).toBeVisible();
});
test('login apresenta navegação superior e painel de oficina',async({page},testInfo)=>{
 const workspace='11111111-1111-4111-8111-111111111111',user='22222222-2222-4222-8222-222222222222';
 await page.addInitScript(({user})=>localStorage.setItem('makercusto:session:v1',JSON.stringify({
  access_token:'mock-token',refresh_token:'mock-refresh',expires_at:Date.now()+3600000,user:{id:user,email:'maker@example.test'}
 })),{user});
 await page.route('**/rest/v1/**',async route=>{
  const url=route.request().url();
  if(url.includes('/mc_workspaces?'))return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([{id:workspace,name:'Oficina de Testes',owner_id:user}])});
  if(url.includes('/mc_products?'))return route.fulfill({json:Array.from({length:12},(_,index)=>({
   id:String(index),kind:'product',name:'Cadastro '+index+' — '+(index===0?'NomeSemEspaços'.repeat(8):'Componente com descrição'),
   description:'Dados para testar a adaptação do catálogo à largura disponível.',sku:null,sale_price:15,created_at:'2026-11-25T10:00:00Z'
  }))});
  if(url.includes('/mc_customer_orders?'))return route.fulfill({json:[
   {status:'planned',quantity:2,sale_price:10},{status:'sold',quantity:15,sale_price:8}
  ]});
  if(url.includes('/mc_printers?')||url.includes('/mc_catalog?'))return route.fulfill({status:200,contentType:'application/json',body:'[]'});
  if(url.includes('/rpc/mc_list_assemblies'))return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([{id:'44444444-4444-4444-8444-444444444444',name:'Lançador de hélices',sku:null,description:null,sale_price:null,created_at:'2026-11-22T00:00:00Z',total_cost:null,cost_status:'unknown',revision:1,parts:[{id:'1',name:'Lançador',quantity:1,notes:null,grams:null},{id:'2',name:'Haste',quantity:1,notes:null,grams:null},{id:'3',name:'Hélice',quantity:1,notes:null,grams:null}]}])});
  if(url.includes('/rpc/mc_list_prints'))return route.fulfill({json:[
   {id:'1',status:'partial',outputs:[{good:3,failed:1,planned:5}]},
   {id:'2',status:'completed',outputs:[{good:2,failed:0,planned:2}]}
  ]});
  return route.fulfill({status:200,contentType:'application/json',body:'[]'});
 });
 await page.goto('/');
 await expect(page.getByRole('region',{name:'Painel da oficina'})).toBeVisible();
 await openSystemMenuIfMobile(page);
 await expect(systemModule(page,'Visão geral')).toHaveAttribute('aria-current','page');
 const menuToggle=page.getByRole('button',{name:'Abrir menu do sistema'});
 if(await menuToggle.isVisible())await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Atividades',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Cadastros recentes'})).toBeVisible();
 await expect(page.getByText('Esta lista não é um log de alterações ou impressões.')).toBeVisible();
 await page.getByRole('button',{name:'Pendências',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Informações a completar'})).toBeVisible();
 await expect(page.getByText('Custo não apurado')).toBeVisible();
 await page.getByRole('navigation',{name:'Abas de Visão geral'}).getByRole('button',{name:'Visão geral',exact:true}).click();
 await expect(page.getByRole('region',{name:'Impressões por etapa'})).toContainText('Em andamento1');
 await expect(page.getByRole('region',{name:'Impressões por etapa'})).toContainText('Concluídas1');
 await expect(page.getByRole('region',{name:'Peças confirmadas'})).toContainText('Boas5');
 await expect(page.getByRole('region',{name:'Peças confirmadas'})).toContainText('Rejeitadas1');
 const shortcuts=page.getByRole('navigation',{name:'Acesso rápido'});
 await expect(shortcuts.getByRole('button')).toHaveText(['◷Calculadora de custos','▤Pedidos','▥Biblioteca STL','◇Dicas de impressão']);
 const orders=page.getByRole('region',{name:'Pedidos por situação'});
 await expect(orders).toContainText('Planejados1');
 await expect(orders).toContainText('Vendidos1');
 await expect(page.getByText('Faturamento',{exact:true}).locator('..')).toContainText('120,00');
 const originalViewport=page.viewportSize()!;
 for(const [width,expectedRows] of [[320,[2,2]],[768,[2,2]],[882,[2,2]],[1180,[2,2]],[1201,[4]],[1280,[4]]] as const){
  await page.setViewportSize({width,height:originalViewport.height});
  const layout=await shortcuts.evaluate(nav=>{
   const buttons=Array.from(nav.querySelectorAll('button'),button=>button.getBoundingClientRect());
   const rows=new Map<number,number>();
   for(const button of buttons)rows.set(button.top,(rows.get(button.top)??0)+1);
   const header=nav.parentElement!.getBoundingClientRect();
   return {rows:[...rows.values()],insideHeader:buttons.every(button=>button.left>=header.left&&button.right<=header.right&&button.height>=58)};
  });
  expect(layout,`Atalhos da Visão geral em ${width}px`).toEqual({rows:expectedRows,insideHeader:true});
 }
 await page.setViewportSize(originalViewport);
 await shortcuts.getByRole('button',{name:'Calculadora de custos',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Calculadora de Produto'})).toBeVisible();
 await openSystemMenuIfMobile(page);
 await systemModule(page,'Visão geral').click();
 await expect(page.getByRole('heading',{name:'Oficina de Testes'})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Descubra seu custo. Venda com confiança.'})).toHaveCount(0);
 await openSystemMenuIfMobile(page);
 await expect(systemModule(page,'Impressões')).toBeEnabled();
 await systemModule(page,'Produtos').click();
 await expect(page.getByRole('heading',{name:'Produtos da oficina'})).toBeVisible();
 await expect(page.locator('.product-catalog-card')).toHaveCount(12);
 for(const width of [320,768,882,1024,1180,1250,1251,1366]){
  await page.setViewportSize({width,height:720});
  await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
  const layout=await page.locator('.system-sticky-header').evaluate(header=>({
   top:Math.round(header.getBoundingClientRect().top),
   overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,
   desktopMenuRows:new Set([...header.querySelectorAll('nav button')].map(button=>button.getBoundingClientRect().top)).size,
   menuFits:[...header.querySelectorAll('nav button')].every(button=>button.getBoundingClientRect().right<=header.getBoundingClientRect().right)
  }));
  expect(layout,`Cabeçalho e catálogo em ${width}px`).toEqual({top:0,overflow:false,desktopMenuRows:1,menuFits:true});
  if(width<=1250){
   await menuToggle.click();
   await expect(systemModule(page,'Pedidos')).toBeVisible();
   await page.keyboard.press('Escape');
   await expect(menuToggle).toBeFocused();
  }
 }
 await page.setViewportSize(originalViewport);
 await page.evaluate(()=>window.scrollTo(0,0));
 await page.getByRole('button',{name:'Peças',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Peças'})).toBeVisible();
 await page.getByRole('navigation',{name:'Abas de Produtos e componentes'}).getByRole('button',{name:'Conjuntos',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Conjuntos'})).toBeVisible();
 await openSystemMenuIfMobile(page);
 await systemModule(page,'Calculadora de custos').click();
 await expect(page.getByRole('heading',{name:'Calculadora de Produto'})).toBeVisible();
 await openSystemMenuIfMobile(page);
 await systemModule(page,'Visão geral').click();
 await expect(page.getByRole('region',{name:'Painel da oficina'})).toBeVisible();
 if(testInfo.project.name==='mobile'){
  const button=page.getByRole('button',{name:'Abrir menu do sistema'});
  await expect(button).toBeVisible();
 }
});

test('bobina física: inventário na oficina sem criar compra fictícia',async({page})=>{
 const workspace='11111111-1111-4111-8111-111111111111';
 const user='22222222-2222-4222-8222-222222222222';
 const spools:{id:string;name:string;label:string;initial_grams:number;remaining_grams:number;remaining_cost_estimate:number|null;cost_status:string;notes:string|null;created_at:string}[]=[];
 let registered:Record<string,unknown>|null=null;
 await page.addInitScript(({user})=>localStorage.setItem('makercusto:session:v1',JSON.stringify({
  access_token:'mock-token',refresh_token:'mock-refresh',expires_at:Date.now()+3600000,user:{id:user,email:'maker@example.test'}
 })),{user});
 await page.route('**/rest/v1/**',async route=>{
  const url=route.request().url();
  const respond=(data:unknown)=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
  if(url.includes('/mc_workspaces?'))return respond([{id:workspace,name:'Oficina de testes',owner_id:user}]);
  if(url.includes('/mc_catalog?')||url.includes('/mc_printers?')||url.includes('/mc_products?'))return respond([]);
  if(url.includes('/rpc/mc_list_assemblies'))return respond([]);
  if(url.includes('/rpc/mc_list_existing_spools'))return respond(spools);
  if(url.includes('/rpc/mc_register_existing_spool')){
   registered=route.request().postDataJSON() as Record<string,unknown>;
   spools.push({id:'33333333-3333-4333-8333-333333333333',name:String(registered.p_filament_name),
    label:String(registered.p_label),initial_grams:Number(registered.p_grams),
    remaining_grams:Number(registered.p_grams),remaining_cost_estimate:null,cost_status:'unknown',
    notes:'Origem da quantidade: measured',created_at:new Date().toISOString()});
   return respond(spools[0].id);
  }
  return respond([]);
 });
 await page.goto('/');
 await openSystemMenuIfMobile(page);
 await systemModule(page,'Filamentos').click();
 await expect(page.getByRole('heading',{name:'Filamentos e bobinas'})).toBeVisible();
 await expect(page.getByText('Nenhuma bobina inventariada nesta oficina.')).toBeVisible();
 await page.getByRole('button',{name:'+ Inventariar bobina'}).click();
 await page.getByRole('textbox',{name:'Nome do filamento'}).fill('PETG Masterprint Branco');
 await page.getByRole('textbox',{name:'Identificação da bobina'}).fill('Bobina PETG-01');
 await page.getByRole('spinbutton',{name:'Saldo físico atual'}).fill('325.125');
 await page.getByRole('combobox',{name:'Origem da quantidade'}).selectOption('measured');
 await expect(page.getByRole('spinbutton',{name:'Valor estimado do saldo'})).toBeEmpty();
 await page.getByRole('button',{name:'Registrar bobina existente'}).click();
 await expect(page.locator('.materials-workspace .product-success')).toContainText('Bobina inventariada');
 await expect(page.getByRole('heading',{name:'Bobina PETG-01'})).toBeVisible();
 await expect(page.getByText('325,125 g').first()).toBeVisible();
 expect(registered).not.toBeNull();
 const sent=registered as unknown as Record<string,unknown>;
 expect(sent.p_workspace_id).toBe(workspace);
 expect(sent.p_remaining_cost).toBeNull();
 expect(sent.p_quantity_basis).toBe('measured');
 expect(String(sent.p_idempotency_key).length).toBeGreaterThanOrEqual(10);
});


test('Impressões: registra L2 sem consumo e mostra a execução na oficina', async ({page})=>{
 const user='22222222-2222-4222-8222-222222222222';
 const ws='11111111-1111-4111-8111-111111111111';
 const printer='33333333-3333-4333-8333-333333333333';
 const product='44444444-4444-4444-8444-444444444444';
 let saved:Record<string,unknown>|null=null;
 await page.addInitScript(({user})=>localStorage.setItem('makercusto:session:v1',JSON.stringify({
  access_token:'mock',refresh_token:'mock',expires_at:Date.now()+3600000,user:{id:user,email:'maker@teste.local'}
 })),{user});
 await page.route('**/rest/v1/**',async route=>{
  const u=route.request().url();
  const respond=(value:unknown)=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(value)});
  if(u.includes('mc_workspaces?'))return respond([{id:ws,name:'Oficina L2',owner_id:user}]);
  if(u.includes('mc_printers?'))return respond([{id:printer,workspace_id:ws,name:'Impressora 1',model_id:null,purchase_price:null,average_watts:null,lifetime_hours:null,active:true}]);
  if(u.includes('mc_products?'))return respond([{id:product,workspace_id:ws,name:'Hélice',sku:null,kind:'component',description:null,sale_price:null,active:true,created_at:new Date().toISOString()}]);
  if(u.includes('rpc/mc_list_prints'))return respond(saved?[{id:'55555555-5555-4555-8555-555555555555',
   status:'draft',printer_id:printer,printer_name:'Impressora 1',planned_hours:saved.p_planned_hours,actual_hours:null,notes:null,
   created_at:new Date().toISOString(),outputs:[{id:'66666666-6666-4666-8666-666666666666',
   product_id:product,name:'Hélice',planned:3,good:0,failed:0}]}]:[]);
  if(u.includes('rpc/mc_create_print')){saved=route.request().postDataJSON() as Record<string,unknown>;return respond('55555555-5555-4555-8555-555555555555');}
  if(u.includes('rpc/mc_list_existing_spools')||u.includes('rpc/mc_list_assemblies')||u.includes('mc_catalog?'))return respond([]);
  return respond([]);
 });
 await page.goto('/');
 await openSystemMenuIfMobile(page);
 await page.getByRole('button',{name:'Impressões',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Impressões da oficina',level:1})).toBeVisible();
 await page.getByRole('combobox',{name:'Impressora física'}).selectOption(printer);
 await page.getByRole('combobox',{name:'Peça a imprimir'}).selectOption(product);
 await page.getByRole('spinbutton',{name:'Quantidade planejada'}).fill('3');
 await page.getByRole('button',{name:'+ Adicionar peça à mesa'}).click();
 const plannedDuration=page.getByRole('group',{name:'Tempo previsto (opcional)'});
 await plannedDuration.getByRole('spinbutton',{name:'Horas'}).fill('6');
 await plannedDuration.getByRole('spinbutton',{name:'Minutos'}).fill('5');
 await page.getByRole('button',{name:'Registrar impressão sem baixa'}).click();
 await expect(page.getByText('Impressão registrada como rascunho.')).toBeVisible();
 expect(saved).not.toBeNull();
 const payload=saved as unknown as Record<string,unknown>;
 expect(payload.p_outputs).toEqual([{product_id:product,quantity:3}]);
 expect(payload.p_planned_hours).toBe(6.0833);
 await expect(page.getByText(/Tempo previsto: 6 h 5 min/)).toBeVisible();
 await expect(page.getByText('Hélice: planejadas 3, boas 0, rejeitadas 0')).toBeVisible();
});


test('Impressões L3: confirmação incremental mantém chave no retry e respeita deltas informados',async ({page})=>{
 const user='22222222-2222-4222-8222-222222222222',ws='11111111-1111-4111-8111-111111111111';
 const printer='33333333-3333-4333-8333-333333333333',product='44444444-4444-4444-8444-444444444444';
 const output='55555555-5555-4555-8555-555555555555',production='66666666-6666-4666-8666-666666666666';
 const lot='77777777-7777-4777-8777-777777777777';
 let attempts:Record<string,unknown>[]=[];
 await page.addInitScript(({user})=>localStorage.setItem('makercusto:session:v1',JSON.stringify({
  access_token:'mock',refresh_token:'mock',expires_at:Date.now()+3600000,user:{id:user,email:'maker@teste.local'}
 })),{user});
 await page.route('**/rest/v1/**',async route=>{
  const u=route.request().url();
  const respond=(value:unknown,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(value)});
  if(u.includes('mc_workspaces?'))return respond([{id:ws,name:'Oficina L3',owner_id:user}]);
  if(u.includes('mc_printers?'))return respond([{id:printer,workspace_id:ws,name:'Impressora L3',model_id:null,purchase_price:null,average_watts:null,lifetime_hours:null,active:true}]);
  if(u.includes('mc_products?'))return respond([{id:product,workspace_id:ws,name:'Hélice',sku:null,kind:'component',description:null,sale_price:null,active:true,created_at:new Date().toISOString()}]);
  if(u.includes('rpc/mc_list_prints'))return respond([{id:production,status:'draft',printer_id:printer,printer_name:'Impressora L3',
   planned_hours:null,actual_hours:null,notes:null,created_at:new Date().toISOString(),outputs:[{id:output,product_id:product,name:'Hélice',planned:3,good:0,failed:0}]}]);
  if(u.includes('rpc/mc_list_existing_spools'))return respond([{id:lot,label:'Bobina L3',name:'PETG',
   initial_grams:100,remaining_grams:100,remaining_cost_estimate:null,cost_status:'unknown',notes:null,created_at:new Date().toISOString()}]);
  if(u.includes('rpc/mc_confirm_print')){
   attempts.push(route.request().postDataJSON() as Record<string,unknown>);
   if(attempts.length===1)return respond({message:'Falha de rede simulada'},503);
   return respond('88888888-8888-4888-8888-888888888888');
  }
  if(u.includes('rpc/mc_list_assemblies')||u.includes('mc_catalog?'))return respond([]);
  return respond([]);
 });
 await page.goto('/');await openSystemMenuIfMobile(page);
 await page.getByRole('button',{name:'Impressões',exact:true}).click();
 await page.getByRole('combobox',{name:'Impressão para confirmar'}).selectOption(production);
 await page.getByRole('combobox',{name:'Peça confirmada'}).selectOption(output);
 await page.getByRole('combobox',{name:'Bobina consumida'}).selectOption(lot);
 await page.getByRole('spinbutton',{name:'Consumo adicional'}).fill('5.125');
 await page.getByRole('spinbutton',{name:'Purga adicional'}).fill('0.25');
 await page.getByRole('spinbutton',{name:'Perda adicional'}).fill('0');
 await page.getByRole('spinbutton',{name:'Peças boas adicionais'}).fill('1');
 await page.getByRole('spinbutton',{name:'Peças rejeitadas adicionais'}).fill('0');
 const actualDuration=page.getByRole('group',{name:'Tempo real adicional (opcional)'});
 await actualDuration.getByRole('spinbutton',{name:'Horas',exact:true}).fill('1');
 await actualDuration.getByRole('spinbutton',{name:'Minutos',exact:true}).fill('15');
 await page.getByRole('button',{name:'Confirmar consumo incremental'}).click();
 await expect(page.getByRole('alert').last()).toContainText('Falha de rede simulada');
 await page.getByRole('button',{name:'Confirmar consumo incremental'}).click();
 await expect(page.getByText('Confirmação incremental registrada; consumo da bobina baixado somente uma vez.')).toBeVisible();
 expect(attempts).toHaveLength(2);
 expect(attempts[0].p_idempotency_key).toBe(attempts[1].p_idempotency_key);
 expect(attempts[0].p_consumptions).toEqual([{lot_id:lot,model_g:5.125,purge_g:0.25,loss_g:0,basis:'slicer'}]);
 expect(attempts[0].p_outputs).toEqual([{output_id:output,good:1,failed:0}]);
 expect(attempts[0].p_actual_hours).toBe(1.25);
});

test('Impressões L3: bloqueia deltas fracionários e quantidade superior ao planejado',async ({page})=>{
 const user='22222222-2222-4222-8222-222222222222',ws='11111111-1111-4111-8111-111111111111';
 const output='55555555-5555-4555-8555-555555555555',production='66666666-6666-4666-8666-666666666666';
 const lot='77777777-7777-4777-8777-777777777777';
 let called=false;
 await page.addInitScript(({user})=>localStorage.setItem('makercusto:session:v1',JSON.stringify({
  access_token:'mock',refresh_token:'mock',expires_at:Date.now()+3600000,user:{id:user,email:'maker@teste.local'}
 })),{user});
 await page.route('**/rest/v1/**',async route=>{
  const u=route.request().url(),respond=(value:unknown)=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(value)});
  if(u.includes('mc_workspaces?'))return respond([{id:ws,name:'Oficina L3',owner_id:user}]);
  if(u.includes('rpc/mc_list_prints'))return respond([{id:production,status:'draft',printer_id:null,printer_name:'Impressora',planned_hours:null,
   actual_hours:null,notes:null,created_at:new Date().toISOString(),outputs:[{id:output,product_id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',name:'Hélice',planned:3,good:1,failed:0}]}]);
  if(u.includes('rpc/mc_list_existing_spools'))return respond([{id:lot,label:'Bobina L3',name:'PETG',initial_grams:100,
   remaining_grams:100,remaining_cost_estimate:null,cost_status:'unknown',notes:null,created_at:new Date().toISOString()}]);
  if(u.includes('rpc/mc_confirm_print')){called=true;return respond('unexpected');}
  return respond([]);
 });
 await page.goto('/');await openSystemMenuIfMobile(page);
 await page.getByRole('button',{name:'Impressões',exact:true}).click();
 await page.getByRole('combobox',{name:'Impressão para confirmar'}).selectOption(production);
 await page.getByRole('combobox',{name:'Peça confirmada'}).selectOption(output);
 await page.getByRole('combobox',{name:'Bobina consumida'}).selectOption(lot);
 await page.getByRole('spinbutton',{name:'Consumo adicional'}).fill('1');
 await page.getByRole('spinbutton',{name:'Purga adicional'}).fill('0');
 await page.getByRole('spinbutton',{name:'Perda adicional'}).fill('0');
 await page.getByRole('spinbutton',{name:'Peças boas adicionais'}).fill('2.5');
 await page.getByRole('button',{name:'Confirmar consumo incremental'}).click();
 await expect(page.getByRole('alert').last()).toContainText('números inteiros');
 await page.getByRole('spinbutton',{name:'Peças boas adicionais'}).fill('3');
 await page.getByRole('button',{name:'Confirmar consumo incremental'}).click();
 await expect(page.getByRole('alert').last()).toContainText('excede as peças ainda pendentes');
 await page.getByRole('spinbutton',{name:'Peças boas adicionais'}).fill('0');
 await page.getByRole('spinbutton',{name:'Peças rejeitadas adicionais'}).fill('1');
 const minutes=page.getByRole('group',{name:'Tempo real adicional (opcional)'}).getByRole('spinbutton',{name:'Minutos',exact:true});
 await minutes.fill('60');
 await page.getByRole('button',{name:'Confirmar consumo incremental'}).click();
 await expect(page.getByRole('alert').last()).toContainText('minutos de 0 a 59');
 expect(called).toBe(false);
 await minutes.fill('30');
 await page.getByRole('button',{name:'Confirmar consumo incremental'}).click();
 await expect(page.getByText('Confirmação incremental registrada; consumo da bobina baixado somente uma vez.')).toBeVisible();
 expect(called).toBe(true);
});


test('Reserva P01: disponibilidade desconta reservas, valida saldo e reenvia a mesma chave',async ({page})=>{
 const user='22222222-2222-4222-8222-222222222222',ws='11111111-1111-4111-8111-111111111111';
 const lot='77777777-7777-4777-8777-777777777777',production='66666666-6666-4666-8666-666666666666';
 const other='99999999-9999-4999-8999-999999999999';
 const output='55555555-5555-4555-8555-555555555555';
 const attempts:Record<string,unknown>[]=[];
 await page.addInitScript(({user})=>localStorage.setItem('makercusto:session:v1',JSON.stringify({
  access_token:'mock',refresh_token:'mock',expires_at:Date.now()+3600000,user:{id:user,email:'maker@teste.local'}
 })),{user});
 await page.route('**/rest/v1/**',async route=>{
  const u=route.request().url(),send=(data:unknown,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
  if(u.includes('mc_workspaces?'))return send([{id:ws,name:'Oficina QA',owner_id:user}]);
  if(u.includes('rpc/mc_list_prints'))return send([{id:production,status:'draft',printer_id:null,
    printer_name:'Impressora de testes',planned_hours:null,actual_hours:null,notes:null,
    created_at:new Date().toISOString(),outputs:[{id:output,product_id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',name:'Hélice',planned:2,good:0,failed:0}]}]);
  if(u.includes('rpc/mc_list_existing_spools'))return send([{id:lot,label:'Bobina PETG',name:'PETG',
    initial_grams:100,remaining_grams:100,remaining_cost_estimate:null,cost_status:'unknown',notes:null,
    created_at:new Date().toISOString()}]);
  if(u.includes('rpc/mc_list_print_reservations'))return send([{id:'88888888-8888-4888-8888-888888888888',
   production_id:other,lot_id:lot,lot_label:'Bobina PETG',quantity:60,remaining:60,status:'active',
   created_at:new Date().toISOString()}]);
  if(u.includes('rpc/mc_reserve_print_lot')){
   attempts.push(route.request().postDataJSON() as Record<string,unknown>);
   if(attempts.length===1)return send({message:'Erro transitório simulado'},503);
   return send('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
  }
  return send([]);
 });
 await page.goto('/');await openSystemMenuIfMobile(page);
 await page.getByRole('button',{name:'Impressões',exact:true}).click();
 await expect(page.getByRole('combobox',{name:'Bobina para reservar',exact:true}).getByRole('option',{name:/Bobina PETG — disponíveis 40.000 g/})).toHaveCount(1);
 await page.getByRole('combobox',{name:'Impressão para reservar'}).selectOption(production);
 await page.getByRole('combobox',{name:'Bobina para reservar',exact:true}).selectOption(lot);
 await page.getByRole('spinbutton',{name:'Quantidade a reservar'}).fill('41');
 await page.getByRole('button',{name:'Registrar reserva sem baixa'}).click();
 await expect(page.getByRole('alert').last()).toContainText('excede a disponibilidade');
 expect(attempts).toHaveLength(0);
 await page.getByRole('spinbutton',{name:'Quantidade a reservar'}).fill('40');
 await page.getByRole('button',{name:'Registrar reserva sem baixa'}).click();
 await expect(page.getByRole('alert').last()).toContainText('Erro transitório simulado');
 await page.getByRole('button',{name:'Registrar reserva sem baixa'}).click();
 await expect(page.getByText('Reserva lógica registrada sem movimentar o estoque físico.')).toBeVisible();
 expect(attempts).toHaveLength(2);
 expect(attempts[0].p_request_key).toBe(attempts[1].p_request_key);
 expect(attempts[0].p_quantity_g).toBe(40);
 expect(attempts[0].p_lot_id).toBe(lot);
});


test('P01-A/B: prazo vencido não libera reserva; cancelamento exige justificativa e preserva chave no retry',async ({page})=>{
 const user='22222222-2222-4222-8222-222222222222',ws='11111111-1111-4111-8111-111111111111';
 const production='66666666-6666-4666-8666-666666666666',lot='77777777-7777-4777-8777-777777777777';
 const reservation='88888888-8888-4888-8888-888888888888',output='55555555-5555-4555-8555-555555555555';
 const cancelAttempts:Record<string,unknown>[]=[];const dueAttempts:Record<string,unknown>[]=[];
 await page.addInitScript(({user})=>localStorage.setItem('makercusto:session:v1',JSON.stringify({
  access_token:'mock',refresh_token:'mock',expires_at:Date.now()+3600000,user:{id:user,email:'maker@teste.local'}
 })),{user});
 await page.route('**/rest/v1/**',async route=>{
  const u=route.request().url(),send=(data:unknown,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
  if(u.includes('mc_workspaces?'))return send([{id:ws,name:'Oficina P01',owner_id:user}]);
  if(u.includes('rpc/mc_list_prints'))return send([{id:production,status:'partial',printer_id:null,
   printer_name:'Impressora P01',planned_hours:2,actual_hours:0.5,notes:null,
   created_at:new Date().toISOString(),outputs:[{id:output,product_id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
   name:'Hélice',planned:2,good:1,failed:0}]}]);
  if(u.includes('rpc/mc_list_existing_spools'))return send([{id:lot,label:'Bobina P01',name:'PETG',
   initial_grams:100,remaining_grams:90,remaining_cost_estimate:null,cost_status:'unknown',notes:null,
   created_at:new Date().toISOString()}]);
  if(u.includes('rpc/mc_list_print_reservations'))return send([{id:reservation,production_id:production,
   lot_id:lot,lot_label:'Bobina P01',quantity:40,remaining:30,status:'active',due_at:'2020-01-01T00:00:00Z',
   review_overdue:true,created_at:new Date().toISOString()}]);
  if(u.includes('rpc/mc_set_print_reservation_due')){
   dueAttempts.push(route.request().postDataJSON() as Record<string,unknown>);
   return send(reservation);
  }
  if(u.includes('rpc/mc_cancel_print')){
   cancelAttempts.push(route.request().postDataJSON() as Record<string,unknown>);
   if(cancelAttempts.length===1)return send({message:'Conexão indisponível'},503);
   return send(production);
  }
  return send([]);
 });
 await page.goto('/');await openSystemMenuIfMobile(page);
 await page.getByRole('button',{name:'Impressões',exact:true}).click();
 await expect(page.getByText(/Revisão vencida \(reserva mantida\)/)).toBeVisible();
 await page.getByRole('combobox',{name:'Reserva para revisar'}).selectOption(reservation);
 await expect(page.getByRole('group',{name:'Ações de Prazo da reserva'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Registrar reserva sem baixa'})).toHaveCount(0);
 await page.getByRole('button',{name:'Salvar prazo de revisão'}).click();
 await expect(page.getByText('Prazo de revisão atualizado; nenhuma reserva foi liberada.')).toBeVisible();
 expect(dueAttempts).toHaveLength(1);
 expect(dueAttempts[0].p_due_at).toBe(null);
 await page.getByRole('button',{name:'Cancelar impressão Hélice'}).click();
 await expect(page.getByRole('group',{name:'Ações de Cancelar impressão'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Registrar reserva sem baixa'})).toHaveCount(0);
 await page.getByRole('button',{name:'Confirmar cancelamento e liberar reservas'}).click();
 await expect(page.getByRole('alert').last()).toContainText('10 a 1000 caracteres');
 expect(cancelAttempts).toHaveLength(0);
 await page.getByRole('textbox',{name:'Justificativa do cancelamento'}).fill('Pedido cancelado após produção parcial');
 await page.getByRole('button',{name:'Confirmar cancelamento e liberar reservas'}).click();
 await expect(page.getByRole('alert').last()).toContainText('Conexão indisponível');
 await page.getByRole('button',{name:'Confirmar cancelamento e liberar reservas'}).click();
 await expect(page.getByText('Impressão cancelada. Reservas não utilizadas liberadas; consumos e peças anteriores preservados.')).toBeVisible();
 expect(cancelAttempts).toHaveLength(2);
 expect(cancelAttempts[0].p_request_key).toBe(cancelAttempts[1].p_request_key);
 expect(cancelAttempts[0].p_reason).toBe('Pedido cancelado após produção parcial');
 expect(cancelAttempts[0].p_production_id).toBe(production);
});


test('P01-E: redução parcial preserva peças confirmadas e exige liberação em gramas explícitos',async ({page})=>{
 const user='22222222-2222-4222-8222-222222222222',ws='11111111-1111-4111-8111-111111111111';
 const production='66666666-6666-4666-8666-666666666666';
 const lot='77777777-7777-4777-8777-777777777777',reservation='88888888-8888-4888-8888-888888888888';
 const output='55555555-5555-4555-8555-555555555555';
 const attempts:Record<string,unknown>[]=[];
 await page.addInitScript(({user})=>localStorage.setItem('makercusto:session:v1',JSON.stringify({
  access_token:'mock',refresh_token:'mock',expires_at:Date.now()+3600000,user:{id:user,email:'maker@teste.local'}
 })),{user});
 await page.route('**/rest/v1/**',async route=>{
  const u=route.request().url(),send=(data:unknown,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
  if(u.includes('mc_workspaces?'))return send([{id:ws,name:'Oficina P01',owner_id:user}]);
  if(u.includes('rpc/mc_list_prints'))return send([{id:production,status:'partial',printer_id:null,
   printer_name:'Impressora P01',planned_hours:2,actual_hours:0.5,notes:null,
   created_at:new Date().toISOString(),outputs:[{id:output,product_id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
   name:'Hélice',planned:5,good:2,failed:1}]}]);
  if(u.includes('rpc/mc_list_existing_spools'))return send([{id:lot,label:'Bobina P01',name:'PETG',
   initial_grams:100,remaining_grams:70,remaining_cost_estimate:null,cost_status:'unknown',notes:null,
   created_at:new Date().toISOString()}]);
  if(u.includes('rpc/mc_list_print_reservations'))return send([{id:reservation,production_id:production,
   lot_id:lot,lot_label:'Bobina P01',quantity:50,remaining:20,status:'active',due_at:null,
   review_overdue:false,created_at:new Date().toISOString()}]);
  if(u.includes('rpc/mc_reduce_print_plan')){
   attempts.push(route.request().postDataJSON() as Record<string,unknown>);
   if(attempts.length===1)return send({message:'Falha de comunicação simulada'},503);
   return send(production);
  }
  return send([]);
 });
 await page.goto('/');await openSystemMenuIfMobile(page);
 await page.getByRole('button',{name:'Impressões',exact:true}).click();
 await page.getByRole('combobox',{name:'Impressão para redução parcial'}).selectOption(production);
 await page.getByRole('combobox',{name:'Peça a reduzir'}).selectOption(output);
 await expect(page.getByRole('group',{name:'Ações de Redução parcial'})).toBeVisible();
 await page.getByRole('spinbutton',{name:'Novo total após redução parcial'}).fill('2');
 await page.getByRole('button',{name:'Confirmar redução parcial'}).click();
 await expect(page.getByRole('alert').last()).toContainText('nunca inferior às peças já confirmadas');
 expect(attempts).toHaveLength(0);
 await page.getByRole('spinbutton',{name:'Novo total após redução parcial'}).fill('3');
 await page.getByRole('combobox',{name:'Reserva para liberação parcial'}).selectOption(reservation);
 await page.getByRole('spinbutton',{name:'Gramas a liberar da reserva'}).fill('21');
 await page.getByRole('textbox',{name:'Motivo da redução parcial'}).fill('Redução de quantidade solicitada pelo cliente');
 await page.getByRole('button',{name:'Confirmar redução parcial'}).click();
 await expect(page.getByRole('alert').last()).toContainText('até o saldo reservado');
 expect(attempts).toHaveLength(0);
 await page.getByRole('spinbutton',{name:'Gramas a liberar da reserva'}).fill('12');
 await page.getByRole('button',{name:'Confirmar redução parcial'}).click();
 await expect(page.getByRole('alert').last()).toContainText('Falha de comunicação simulada');
 await page.getByRole('button',{name:'Confirmar redução parcial'}).click();
 await expect(page.getByText(/Planejamento parcialmente reduzido/)).toBeVisible();
 expect(attempts).toHaveLength(2);
 expect(attempts[0].p_request_key).toBe(attempts[1].p_request_key);
 expect(attempts[0].p_output_changes).toEqual([{output_id:output,new_planned:3}]);
 expect(attempts[0].p_reservation_releases).toEqual([{reservation_id:reservation,release_g:12}]);
 expect(attempts[0].p_reason).toBe('Redução de quantidade solicitada pelo cliente');
});


test('P01-D: troca de bobina preserva preços antigos e reenvia mesma chave sem baixa',async ({page})=>{
 const user='22222222-2222-4222-8222-222222222222',ws='11111111-1111-4111-8111-111111111111';
 const production='66666666-6666-4666-8666-666666666666';
 const lotA='77777777-7777-4777-8777-777777777777',lotB='99999999-9999-4999-8999-999999999999';
 const reservation='88888888-8888-4888-8888-888888888888',output='55555555-5555-4555-8555-555555555555';
 const attempts:Record<string,unknown>[]=[];
 await page.addInitScript(({user})=>localStorage.setItem('makercusto:session:v1',JSON.stringify({
  access_token:'mock',refresh_token:'mock',expires_at:Date.now()+3600000,user:{id:user,email:'maker@teste.local'}
 })),{user});
 await page.route('**/rest/v1/**',async route=>{
  const u=route.request().url(),send=(data:unknown,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
  if(u.includes('mc_workspaces?'))return send([{id:ws,name:'Oficina P01',owner_id:user}]);
  if(u.includes('rpc/mc_list_prints'))return send([{id:production,status:'partial',printer_id:null,
   printer_name:'Impressora 3D',planned_hours:2,actual_hours:0.5,notes:null,
   created_at:new Date().toISOString(),outputs:[{id:output,product_id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
   name:'Hélice',planned:5,good:1,failed:0}]}]);
  if(u.includes('rpc/mc_list_existing_spools'))return send([
   {id:lotA,label:'Bobina A',name:'PETG A',initial_grams:1000,remaining_grams:820,remaining_cost_estimate:55.76,cost_status:'estimated',notes:null,created_at:new Date().toISOString()},
   {id:lotB,label:'Bobina B',name:'PETG B',initial_grams:1000,remaining_grams:1000,remaining_cost_estimate:73,cost_status:'estimated',notes:null,created_at:new Date().toISOString()}]);
  if(u.includes('rpc/mc_list_print_reservations'))return send([{id:reservation,production_id:production,lot_id:lotA,lot_label:'Bobina A',
   quantity:300,remaining:120,status:'active',due_at:null,review_overdue:false,created_at:new Date().toISOString()}]);
  if(u.includes('rpc/mc_swap_print_reserved_lot')){
   attempts.push(route.request().postDataJSON() as Record<string,unknown>);
   if(attempts.length===1)return send({message:'Conexão temporariamente indisponível'},503);
   return send('cccccccc-cccc-4ccc-8ccc-cccccccccccc');
  }
  return send([]);
 });
 await page.goto('/');await openSystemMenuIfMobile(page);
 await page.getByRole('button',{name:'Impressões',exact:true}).click();
 await page.getByRole('combobox',{name:'Reserva de origem para troca'}).selectOption(reservation);
 await page.getByRole('combobox',{name:'Nova bobina para reservar'}).selectOption(lotB);
 await expect(page.getByRole('group',{name:'Ações de Trocar bobina reservada'})).toBeVisible();
 await page.getByRole('spinbutton',{name:'Gramas a liberar na troca'}).fill('121');
 await page.getByRole('spinbutton',{name:'Gramas a reservar na nova bobina'}).fill('120');
 await page.getByRole('textbox',{name:'Motivo da troca de bobina'}).fill('Fim da bobina original, origem verificada');
 await page.getByRole('button',{name:'Confirmar troca de reserva'}).click();
 await expect(page.getByRole('alert').last()).toContainText('sem exceder a reserva de origem');
 expect(attempts).toHaveLength(0);
 await page.getByRole('spinbutton',{name:'Gramas a liberar na troca'}).fill('120');
 await page.getByRole('button',{name:'Confirmar troca de reserva'}).click();
 await expect(page.getByRole('alert').last()).toContainText('Conexão temporariamente indisponível');
 await page.getByRole('button',{name:'Confirmar troca de reserva'}).click();
 await expect(page.getByText('Troca de reserva registrada. Nenhum filamento foi baixado nem houve alteração dos custos históricos.')).toBeVisible();
 expect(attempts).toHaveLength(2);
 expect(attempts[0].p_request_key).toBe(attempts[1].p_request_key);
 expect(attempts[0].p_old_reservation_id).toBe(reservation);
 expect(attempts[0].p_new_lot_id).toBe(lotB);
 expect(attempts[0].p_release_g).toBe(120);
 expect(attempts[0].p_new_reserve_g).toBe(120);
});


test('GAP01: ocorrência acima do saldo não cria baixa e retry mantém idempotência',async ({page})=>{
 const user='22222222-2222-4222-8222-222222222222',ws='11111111-1111-4111-8111-111111111111';
 const production='66666666-6666-4666-8666-666666666666';
 const lot='77777777-7777-4777-8777-777777777777',output='55555555-5555-4555-8555-555555555555';
 const attempts:Record<string,unknown>[]=[];
 await page.addInitScript(({user})=>localStorage.setItem('makercusto:session:v1',JSON.stringify({
  access_token:'mock',refresh_token:'mock',expires_at:Date.now()+3600000,user:{id:user,email:'maker@teste.local'}
 })),{user});
 await page.route('**/rest/v1/**',async route=>{
  const u=route.request().url(),send=(data:unknown,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
  if(u.includes('mc_workspaces?'))return send([{id:ws,name:'Oficina GAP01',owner_id:user}]);
  if(u.includes('rpc/mc_list_prints'))return send([{id:production,status:'partial',printer_id:null,
   printer_name:'Impressora GAP01',planned_hours:null,actual_hours:null,notes:null,
   created_at:new Date().toISOString(),outputs:[{id:output,product_id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
   name:'Peça observada',planned:2,good:0,failed:0}]}]);
  if(u.includes('rpc/mc_list_existing_spools'))return send([{id:lot,label:'Bobina 80g',name:'PETG',
   initial_grams:80,remaining_grams:80,remaining_cost_estimate:null,cost_status:'unknown',notes:null,
   created_at:new Date().toISOString()}]);
  if(u.includes('rpc/mc_list_physical_occurrences'))return send([{id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
   production_id:production,material_name:'PETG',quantity_g:99.5,
   quantity_basis:'weighed',observed_at:'2026-11-21T10:00:00Z',source_note:'Massa observada em balança.',
   possible_lot_id:null,possible_lot_label:null,evidence_reference:null,possible_origin_note:null,
   status:'registered',reported_by:user,created_at:new Date().toISOString()}]);
  if(u.includes('rpc/mc_record_physical_occurrence')){
   attempts.push(route.request().postDataJSON() as Record<string,unknown>);
   if(attempts.length===1)return send({message:'Falha temporária simulada'},503);
   return send('99999999-9999-4999-8999-999999999999');
  }
  if(u.includes('rpc/mc_confirm_print'))throw new Error('Confirmação física não deve ser solicitada no GAP01');
  return send([]);
 });
 await page.goto('/');await openSystemMenuIfMobile(page);
 await page.getByRole('button',{name:'Impressões',exact:true}).click();
 await expect(page.getByText('Registrada, aguardando análise')).toBeVisible();
 await page.getByRole('combobox',{name:'Impressão da ocorrência'}).selectOption(production);
 await page.getByRole('textbox',{name:'Material observado'}).fill('PETG branco');
 await expect(page.getByRole('group',{name:'Ações de Ocorrência física'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Confirmar consumo incremental'})).toHaveCount(0);
 await page.getByRole('spinbutton',{name:'Massa física observada'}).fill('100');
 await page.getByRole('textbox',{name:'Como foi constatado'}).fill('Pesagem física feita pelo operador e relatada na oficina.');
 await page.getByRole('button',{name:'Registrar ocorrência sem baixa'}).click();
 await expect(page.getByRole('alert').last()).toContainText('data e a hora efetivas');
 expect(attempts).toHaveLength(0);
 await page.getByRole('textbox',{name:'Data e hora da ocorrência'}).fill('2026-11-21T10:00');
 await page.getByRole('combobox',{name:'Bobina possivelmente utilizada'}).selectOption(lot);
 await page.getByRole('textbox',{name:'Referência da evidência'}).fill('Pesagem em caderno da oficina');
 await page.getByRole('button',{name:'Registrar ocorrência sem baixa'}).click();
 await expect(page.getByRole('alert').last()).toContainText('Falha temporária simulada');
 await page.getByRole('button',{name:'Registrar ocorrência sem baixa'}).click();
 await expect(page.getByText('Ocorrência física registrada como pendente. Nenhuma baixa, entrada ou custo foi lançado.')).toBeVisible();
 expect(attempts).toHaveLength(2);
 expect(attempts[0].p_idempotency_key).toBe(attempts[1].p_idempotency_key);
 expect(attempts[0].p_quantity_g).toBe(100);
 expect(attempts[0].p_possible_lot_id).toBe(lot);
 expect(attempts[0].p_evidence_reference).toBe('Pesagem em caderno da oficina');
 expect(attempts[0].p_quantity_basis).toBe('weighed');
});


test('GAP01-B/F: investigação mantém observação original, histórico e retry sem ajuste',async ({page})=>{
 const user='22222222-2222-4222-8222-222222222222',ws='11111111-1111-4111-8111-111111111111';
 const production='66666666-6666-4666-8666-666666666666',lot='77777777-7777-4777-8777-777777777777';
 const occurrence='99999999-9999-4999-8999-999999999999';
 const requests:Record<string,unknown>[]=[];
 await page.addInitScript(({user})=>localStorage.setItem('makercusto:session:v1',JSON.stringify({
  access_token:'mock',refresh_token:'mock',expires_at:Date.now()+3600000,user:{id:user,email:'maker@teste.local'}
 })),{user});
 await page.route('**/rest/v1/**',async route=>{
  const u=route.request().url(),send=(data:unknown,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
  if(u.includes('mc_workspaces?'))return send([{id:ws,name:'Oficina GAP01',owner_id:user}]);
  if(u.includes('rpc/mc_list_prints'))return send([{id:production,status:'partial',printer_id:null,
   printer_name:'Impressora GAP01',planned_hours:null,actual_hours:null,notes:null,
   created_at:'2026-11-22T20:00:00Z',outputs:[{id:'55555555-5555-4555-8555-555555555555',
   product_id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',name:'Peça teste',planned:2,good:0,failed:0}]}]);
  if(u.includes('rpc/mc_list_existing_spools'))return send([{id:lot,label:'Bobina de teste',name:'PETG',
   initial_grams:80,remaining_grams:80,remaining_cost_estimate:null,cost_status:'unknown',notes:null,
   created_at:'2026-11-22T20:00:00Z'}]);
  if(u.includes('rpc/mc_list_physical_occurrence_reviews'))return send([{id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
   occurrence_id:occurrence,prior_status:'registered',next_status:'under_review',cause_hypothesis:'unknown',
   finding_note:'Ainda não há evidência de origem, aguardando inspeção.',evidence_reference:null,
   possible_lot_id:null,possible_lot_label:null,author_id:user,created_at:'2026-11-22T21:00:00Z'}]);
  if(u.includes('rpc/mc_list_physical_occurrences'))return send([{id:occurrence,production_id:production,
   material_name:'PETG físico observado',quantity_g:100,quantity_basis:'weighed',
   observed_at:'2026-11-21T10:00:00Z',source_note:'Pesagem física observada em oficina.',
   possible_lot_id:lot,possible_lot_label:'Bobina de teste',evidence_reference:'Anotação original',
   possible_origin_note:null,status:'under_review',reported_by:user,created_at:'2026-11-21T10:01:00Z'}]);
  if(u.includes('rpc/mc_review_physical_occurrence')){
   requests.push(route.request().postDataJSON() as Record<string,unknown>);
   if(requests.length===1)return send({message:'Falha de comunicação simulada'},503);
   return send('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
  }
  if(u.includes('rpc/mc_confirm_print')||u.includes('rpc/mc_register_existing_spool'))
   throw new Error('Investigação não pode provocar movimentação ou confirmação');
  return send([]);
 });
 await page.goto('/');await openSystemMenuIfMobile(page);
 await page.getByRole('button',{name:'Impressões',exact:true}).click();
 await expect(page.getByText('Ainda não há evidência de origem, aguardando inspeção.')).toBeVisible();
 await page.getByRole('combobox',{name:'Ocorrência para investigar'}).selectOption(occurrence);
 await expect(page.getByRole('group',{name:'Ações de Investigação da ocorrência'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Registrar ocorrência sem baixa'})).toHaveCount(0);
 await expect(page.getByRole('combobox',{name:'Etapa de acompanhamento'})).toHaveValue('pending_decision');
 await page.getByRole('button',{name:'Registrar investigação sem ajuste'}).click();
 await expect(page.getByRole('alert').last()).toContainText('10 a 2000 caracteres');
 expect(requests).toHaveLength(0);
 await page.getByRole('combobox',{name:'Hipótese da divergência'}).selectOption('lot_change');
 await page.getByRole('textbox',{name:'Relato da investigação'}).fill('Possível troca de bobina em análise; não existe prova suficiente.');
 await page.getByRole('textbox',{name:'Evidência da investigação'}).fill('Anotação de pesagem da oficina');
 await page.getByRole('combobox',{name:'Bobina sob investigação'}).selectOption(lot);
 await page.getByRole('button',{name:'Registrar investigação sem ajuste'}).click();
 await expect(page.getByRole('alert').last()).toContainText('Falha de comunicação simulada');
 await page.getByRole('button',{name:'Registrar investigação sem ajuste'}).click();
 await expect(page.getByText('Investigação registrada no histórico. Nenhum ajuste de estoque, aprovação ou custo foi realizado.')).toBeVisible();
 expect(requests).toHaveLength(2);
 expect(requests[0].p_request_key).toBe(requests[1].p_request_key);
 expect(requests[0].p_next_status).toBe('pending_decision');
 expect(requests[0].p_cause_hypothesis).toBe('lot_change');
 expect(requests[0].p_possible_lot_id).toBe(lot);
});


test('GAP01-C: proposta de 50 g não baixa estoque e reenvio usa chave idempotente',async ({page})=>{
 const user='22222222-2222-4222-8222-222222222222',ws='11111111-1111-4111-8111-111111111111';
 const production='66666666-6666-4666-8666-666666666666';
 const lot='77777777-7777-4777-8777-777777777777',occurrence='99999999-9999-4999-8999-999999999999';
 const requests:Record<string,unknown>[]=[];
 await page.addInitScript(({user})=>localStorage.setItem('makercusto:session:v1',JSON.stringify({
  access_token:'mock',refresh_token:'mock',expires_at:Date.now()+3600000,user:{id:user,email:'maker@teste.local'}
 })),{user});
 await page.route('**/rest/v1/**',async route=>{
  const u=route.request().url(),send=(data:unknown,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
  if(u.includes('mc_workspaces?'))return send([{id:ws,name:'Oficina GAP01',owner_id:user}]);
  if(u.includes('rpc/mc_list_prints'))return send([{id:production,status:'partial',printer_id:null,
   printer_name:'Impressora GAP01',planned_hours:null,actual_hours:null,notes:null,
   created_at:'2026-11-22T20:00:00Z',outputs:[{id:'55555555-5555-4555-8555-555555555555',
   product_id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',name:'Peça teste',planned:2,good:0,failed:0}]}]);
  if(u.includes('rpc/mc_list_existing_spools'))return send([{id:lot,label:'Bobina 80 g',name:'PETG',
   initial_grams:80,remaining_grams:80,remaining_cost_estimate:null,cost_status:'unknown',notes:null,
   created_at:'2026-11-22T20:00:00Z'}]);
  if(u.includes('rpc/mc_list_inventory_adjustment_proposals'))return send([{
   id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',occurrence_id:occurrence,lot_id:lot,
   lot_label:'Bobina 80 g',proposed_delta_g:20,cause:'verified_count_error',
   origin_note:'Pesagem física ainda sob análise',justification:'Proposta anterior não aprovada',
   evidence_reference:'Caderno de inventário',status:'pending_decision',
   proposed_by:user,created_at:'2026-11-22T21:00:00Z'
  }]);
  if(u.includes('rpc/mc_list_physical_occurrences'))return send([{
   id:occurrence,production_id:production,material_name:'PETG observado',quantity_g:100,
   quantity_basis:'weighed',observed_at:'2026-11-21T10:00:00Z',
   source_note:'Pesagem física relatada pela oficina',possible_lot_id:lot,
   possible_lot_label:'Bobina 80 g',evidence_reference:'Caderno',possible_origin_note:null,
   status:'under_review',reported_by:user,created_at:'2026-11-21T10:01:00Z'
  }]);
  if(u.includes('rpc/mc_propose_inventory_adjustment')){
   requests.push(route.request().postDataJSON() as Record<string,unknown>);
   if(requests.length===1)return send({message:'Falha temporária de conexão'},503);
   return send('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
  }
  if(u.includes('rpc/mc_confirm_print')||u.includes('rpc/mc_register_existing_spool'))
   throw new Error('Proposta não deve movimentar estoque ou confirmar consumo');
  return send([]);
 });
 await page.goto('/');await openSystemMenuIfMobile(page);
 await page.getByRole('button',{name:'Impressões',exact:true}).click();
 await expect(page.getByRole('list',{name:'Propostas de inventário pendentes'})).toContainText('Pendente de decisão');
 await page.getByRole('combobox',{name:'Ocorrência para proposta de inventário'}).selectOption(occurrence);
 await page.getByRole('combobox',{name:'Bobina da proposta de ajuste'}).selectOption(lot);
 await expect(page.getByRole('group',{name:'Ações de Proposta de inventário'})).toBeVisible();
 await page.getByRole('spinbutton',{name:'Diferença proposta em gramas'}).fill('0');
 await page.getByRole('button',{name:'Registrar proposta sem alterar estoque'}).click();
 await expect(page.getByRole('alert').last()).toContainText('diferente de zero');
 expect(requests).toHaveLength(0);
 await page.getByRole('spinbutton',{name:'Diferença proposta em gramas'}).fill('50');
 await page.getByRole('combobox',{name:'Causa da proposta de inventário'}).selectOption('unrecorded_physical_input');
 await page.getByRole('textbox',{name:'Origem material a conferir'}).fill('Entrada de material físico ainda não contabilizada');
 await page.getByRole('textbox',{name:'Justificativa da proposta'}).fill('Proposta de cinquenta gramas para conferência humana');
 await page.getByRole('textbox',{name:'Evidência da proposta'}).fill('Registro de pesagem e caderno da oficina');
 await page.getByRole('button',{name:'Registrar proposta sem alterar estoque'}).click();
 await expect(page.getByRole('alert').last()).toContainText('Falha temporária de conexão');
 await page.getByRole('button',{name:'Registrar proposta sem alterar estoque'}).click();
 await expect(page.getByText('Proposta registrada como pendente de decisão. Nenhum ajuste de estoque, custo ou aprovação foi executado.')).toBeVisible();
 expect(requests).toHaveLength(2);
 expect(requests[0].p_request_key).toBe(requests[1].p_request_key);
 expect(requests[0].p_delta_g).toBe(50);
 expect(requests[0].p_lot_id).toBe(lot);
 expect(requests[0].p_occurrence_id).toBe(occurrence);
});


test('GAP01-D/E: dossiê mostra reservas alheias e consumo histórico sem acionar ajustes',async ({page})=>{
 const user='22222222-2222-4222-8222-222222222222',ws='11111111-1111-4111-8111-111111111111';
 const production='66666666-6666-4666-8666-666666666666';
 const lot='77777777-7777-4777-8777-777777777777',occurrence='99999999-9999-4999-8999-999999999999';
 const requests:string[]=[];
 await page.addInitScript(({user})=>localStorage.setItem('makercusto:session:v1',JSON.stringify({
  access_token:'mock',refresh_token:'mock',expires_at:Date.now()+3600000,user:{id:user,email:'maker@teste.local'}
 })),{user});
 await page.route('**/rest/v1/**',async route=>{
  const u=route.request().url(),send=(data:unknown,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
  if(u.includes('mc_workspaces?'))return send([{id:ws,name:'Oficina GAP01',owner_id:user}]);
  if(u.includes('rpc/mc_list_prints'))return send([{id:production,status:'partial',printer_id:null,
   printer_name:'Impressora',planned_hours:null,actual_hours:null,notes:null,
   created_at:'2026-11-22T20:00:00Z',outputs:[{id:'55555555-5555-4555-8555-555555555555',
   product_id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',name:'Peça',planned:2,good:0,failed:0}]}]);
  if(u.includes('rpc/mc_list_physical_occurrences'))return send([{id:occurrence,
   production_id:production,material_name:'PETG observado',quantity_g:100,
   quantity_basis:'weighed',observed_at:'2026-11-21T10:00:00Z',
   source_note:'Pesagem da produção na oficina.',possible_lot_id:lot,
   possible_lot_label:'Bobina PETG',evidence_reference:null,possible_origin_note:null,
   status:'under_review',reported_by:user,created_at:'2026-11-21T10:01:00Z'}]);
  if(u.includes('rpc/mc_get_physical_occurrence_dossier')){
   requests.push('dossier');
   return send({occurrence_id:occurrence,production_id:production,status:'under_review',
    observed_quantity_g:100,possible_lot_id:lot,possible_lot_label:'Bobina PETG',
    lot_verification:'unverified',snapshot_type:'read_only_current_state',
    physical_g:65,reserved_g:15,own_reserved_g:5,other_reserved_g:10,unreserved_g:50,
    reservations:[],confirmed_consumption_lines:[{consumption_id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
     confirmation_id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',lot_id:lot,lot_label:'Bobina PETG',
     model_g:15,purge_g:0,loss_g:0,total_g:15,unit_cost_snapshot:0.064,
     confirmed_at:'2026-11-21T10:00:00Z',confirmation_status:'confirmed',author_id:user}],
    investigation_history:[],pending_adjustment_proposals:[{proposal_id:'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
     lot_id:lot,proposed_delta_g:20,status:'pending_decision',evidence_reference:'Anotação',
     created_at:'2026-11-22T10:00:00Z'}],
    possible_compensation_review:'manual_review_only',reversible_quantity_g:null,
    financial_adjustment:null,inventory_effect:'none',approval:'not_available',warning:'sem aprovação'});
  }
  if(/mc_(confirm_print|reserve_print_lot|propose_inventory_adjustment|reduce_print_plan|cancel_print)/.test(u))
   throw new Error('Consulta não deve executar transações');
  return send([]);
 });
 await page.goto('/');await openSystemMenuIfMobile(page);
 await page.getByRole('button',{name:'Impressões',exact:true}).click();
 await page.getByRole('combobox',{name:'Ocorrência para dossiê'}).selectOption(occurrence);
 await expect(page.getByRole('group',{name:'Ações de Dossiê de conciliação'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Registrar proposta sem alterar estoque'})).toHaveCount(0);
 await page.getByRole('button',{name:'Consultar dossiê (somente leitura)'}).click();
 const result=page.locator('[aria-label="Resultado do dossiê GAP01"]');
 await expect(result).toContainText('Reservas de outras ordens: 10 g');
 await expect(result).toContainText('Saldo físico cadastrado atual: 65 g');
 await expect(result.getByRole('list',{name:'Consumos históricos vinculados'})).toContainText('15 g');
 await expect(result.getByRole('list',{name:'Propostas vinculadas ao dossiê'})).toContainText('pendente de decisão');
 await expect(result).toContainText('Nenhuma quantidade reversível ou ajuste financeiro foi calculado');
 expect(requests).toEqual(['dossier']);
});


test('calculadora logada oferece salvar cálculo como peça com snapshot',async ({page})=>{
 const workspace='11111111-1111-4111-8111-111111111111',user='22222222-2222-4222-8222-222222222222';
 let saved:Record<string,unknown>|null=null;
 await page.addInitScript(({user})=>localStorage.setItem('makercusto:session:v1',JSON.stringify({
  access_token:'mock',refresh_token:'mock',expires_at:Date.now()+3600000,user:{id:user,email:'maker@teste.local'}
 })),{user});
 await page.route('**/rest/v1/**',async route=>{
  const u=route.request().url();
  const send=(data:unknown)=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
  if(u.includes('/mc_workspaces?'))return send([{id:workspace,name:'Oficina teste',owner_id:user}]);
  if(u.includes('/mc_printers?')||u.includes('/mc_catalog?')||u.includes('/mc_products?'))return send([]);
  if(u.includes('/rpc/mc_save_calculated_product')){
   saved=route.request().postDataJSON() as Record<string,unknown>;
   return send('55555555-5555-4555-8555-555555555555');
  }
  return send([]);
 });
 await page.goto('/');
 await openSystemMenuIfMobile(page);
 await systemModule(page,'Calculadora de custos').click();
 await expect(page.getByRole('heading',{name:'Identificação do produto'})).toBeVisible();
 await page.getByRole('textbox',{name:'Nome do produto'}).fill('Estrela grande');
 await expect(page.locator('.form-action-dock-context strong')).toHaveText('Estrela grande');
 await page.getByRole('button',{name:'Composição / Peças',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Montar conjunto'})).toBeVisible();
 await expect(page.locator('.form-action-dock:visible')).toHaveCount(1);
 await page.getByRole('button',{name:'Cálculo',exact:true}).click();
 await expect(page.getByRole('textbox',{name:'Nome do produto'})).toHaveValue('Estrela grande');
 await page.getByRole('button',{name:'Observações',exact:true}).click();
 await page.getByRole('textbox',{name:'Descrição do produto'}).fill('Revisar o acabamento');
 await page.getByRole('button',{name:'Cálculo',exact:true}).click();
 const printHours=page.getByRole('spinbutton',{name:'Horas',exact:true});
 const printMinutes=page.getByRole('spinbutton',{name:'Minutos',exact:true});
 await printHours.fill('6');
 await printMinutes.fill('60');
 await expect(page.getByText('Informe horas inteiras e minutos e segundos de 0 a 59.')).toBeVisible();
 await expect(page.getByRole('button',{name:'Salvar produto e custo'})).toBeDisabled();
 await printMinutes.fill('5');
 await page.getByTestId('quantity').fill('3');
 await page.getByTestId('salePrice').fill('20');
 await page.getByRole('button',{name:'Novo cálculo',exact:true}).click();
 await page.getByRole('dialog',{name:'Iniciar novo cálculo'}).getByRole('button',{name:'Cancelar'}).click();
 await expect(page.getByRole('textbox',{name:'Nome do produto'})).toHaveValue('Estrela grande');
 await expect(page.getByTestId('quantity')).toHaveValue('3');
 await expect(page.locator('.form-action-dock')).toHaveCSS('position','fixed');
 await page.getByRole('combobox',{name:'Tipo de produto'}).selectOption('component');
 await page.getByRole('button',{name:'Salvar peça e custo'}).click();
 await expect(page.getByText('Peça, versão inicial e custo estimado salvos na sua oficina.')).toBeVisible();
 expect(saved).not.toBeNull();
 expect((saved as unknown as Record<string,unknown>).p_kind).toBe('component');
 expect((saved as unknown as Record<string,unknown>).p_name).toBe('Estrela Grande');
 expect((saved as unknown as Record<string,unknown>).p_workspace_id).toBe(workspace);
 const params=(saved as unknown as Record<string,unknown>).p_parameters as Record<string,unknown>;
 expect(params.origin).toBe('calculator');
 expect(params.saved_input).toMatchObject({quantity:3,salePrice:20,hours:6+5/60});
 expect((saved as unknown as Record<string,unknown>).p_description).toBe('Revisar o acabamento');
 expect(params.calculated_result).toBeTruthy();
});

test('conjunto vincula guirlanda, estrela grande e pequena sem duplicar cadastros',async ({page})=>{
 const workspace='11111111-1111-4111-8111-111111111111',user='22222222-2222-4222-8222-222222222222';
 const componentIds=[
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
 ];
 const names=['Guirlanda','Estrela grande','Estrela pequena'];
 const costs=[7.4,2.5,1.1],grams=[74,25,11];
 const products=componentIds.map((id,i)=>({id,workspace_id:workspace,name:names[i],sku:'PEC-'+i,
  kind:'component',description:'Peça cadastrada',sale_price:null,active:true,created_at:'2026-11-23T10:00:00Z'}));
 const kits:unknown[]=[];let payload:Record<string,unknown>|null=null;
 await page.addInitScript(({user})=>localStorage.setItem('makercusto:session:v1',JSON.stringify({
  access_token:'mock',refresh_token:'mock',expires_at:Date.now()+3600000,user:{id:user,email:'maker@teste.local'}
 })),{user});
 await page.route('**/rest/v1/**',async route=>{
  const u=route.request().url(),send=(data:unknown)=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
  if(u.includes('/mc_workspaces?'))return send([{id:workspace,name:'Oficina teste',owner_id:user}]);
  if(u.includes('/mc_printers?')||u.includes('/mc_catalog?'))return send([]);
  if(u.includes('/mc_products?'))return send(products);
  if(u.includes('/rpc/mc_list_assemblies'))return send(kits);
  if(u.includes('/rpc/mc_list_component_library'))return send(componentIds.map((id,i)=>({
   id,name:names[i],sku:'PEC-'+i,grams:grams[i],unit_cost:costs[i],cost_source:'snapshot'
  })));
  if(u.includes('/rpc/mc_save_assembly_linked')){
   payload=route.request().postDataJSON() as Record<string,unknown>;
   const id='dddddddd-dddd-4ddd-8ddd-dddddddddddd';
   const parts=(payload.p_parts as {product_id:string;quantity:number;notes:string}[]).map((p,i)=>({
    id:p.product_id,product_id:p.product_id,name:names[i],quantity:p.quantity,
    notes:p.notes,grams:String(grams[i]),unit_cost:costs[i],cost_source:'linked'
   }));
   kits.push({id,name:'Guirlanda de Natal',sku:null,description:null,sale_price:null,
    created_at:'2026-11-23T10:00:00Z',revision:1,total_cost:11,cost_status:'estimated',parts});
   products.push({id,workspace_id:workspace,name:'Guirlanda de Natal',sku:'NATAL-001',
    kind:'kit',description:'Conjunto',sale_price:59,active:true,created_at:'2026-11-23T10:00:00Z'});
   return send(id);
  }
  return send([]);
 });
 await page.goto('/');await openSystemMenuIfMobile(page);
 await systemModule(page,'Produtos').click();
 await page.getByRole('navigation',{name:'Abas de Produtos e componentes'}).getByRole('button',{name:'Conjuntos',exact:true}).click();
 await page.getByRole('button',{name:'+ Novo conjunto'}).click();
 await page.getByRole('textbox',{name:'Nome do produto'}).fill('Guirlanda de Natal');
 await page.getByRole('combobox',{name:'Selecionar peça cadastrada 1'}).selectOption(componentIds[0]);
 await page.getByRole('combobox',{name:'Selecionar peça cadastrada 2'}).selectOption(componentIds[1]);
 await page.getByRole('button',{name:'+ Adicionar peça'}).click();
 await page.getByRole('combobox',{name:'Selecionar peça cadastrada 3'}).selectOption(componentIds[2]);
 await expect(page.getByRole('textbox',{name:'Nome da peça 2'})).toHaveValue('Estrela grande');
 await expect(page.getByRole('textbox',{name:'Nome da peça 2'})).toBeDisabled();
 await expect(page.getByText('R$ 11,00 (informado)')).toBeVisible();
 await page.getByRole('button',{name:'Salvar produto',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Ficha do produto'})).toBeVisible();
 expect(payload).not.toBeNull();
 expect((payload as unknown as Record<string,unknown>).p_parts).toEqual(
  componentIds.map((id,i)=>({product_id:id,name:names[i],quantity:1,notes:'',grams:grams[i],unit_cost:costs[i]}))
 );
 expect(products.filter(p=>p.kind==='component')).toHaveLength(3);
});


test('calculadora reutiliza cálculo salvo sem modificar snapshot histórico',async ({page})=>{
 const user='22222222-2222-4222-8222-222222222222',ws='11111111-1111-4111-8111-111111111111';
 const savedInput={...{
  hours:5.225,quantity:1,grams:90,pricePerKg:120,printerPrice:1000,
  averageWatts:120,lifetimeHours:1000,pricePerKwh:0.9,salePrice:40,
  accessoryPerUnit:0,assemblyMinutesPerUnit:0,laborPerHour:0
 }};
 const readCalls:string[]=[];
 const created:Record<string,unknown>[]=[];
 await page.addInitScript(({user})=>localStorage.setItem('makercusto:session:v1',JSON.stringify({
  access_token:'mock',refresh_token:'mock',expires_at:Date.now()+3600000,user:{id:user,email:'maker@teste.local'}
 })),{user});
 await page.route('**/rest/v1/**',async route=>{
  const url=route.request().url(),send=(data:unknown)=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
  if(url.includes('mc_workspaces?'))return send([{id:ws,name:'Oficina Maker',owner_id:user}]);
  if(url.includes('mc_printers?')||url.includes('mc_catalog?'))return send([]);
  if(url.includes('mc_products?'))return send([{id:'cccccccc-cccc-4ccc-8ccc-cccccccccccc',name:'Guirlanda — cópia',kind:'component',sku:null,sale_price:null}]);
  if(url.includes('rpc/mc_save_calculated_product')){
   created.push(route.request().postDataJSON() as Record<string,unknown>);
   return send('dddddddd-dddd-4ddd-8ddd-dddddddddddd');
  }
  if(url.includes('rpc/mc_list_saved_calculations')){
   readCalls.push('read');
   return send([{product_id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    snapshot_id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',name:'Guirlanda',
    kind:'component',sku:'GRD-01',unit_cost:16.7,saved_at:'2026-11-23T12:00:00Z',
    saved_input:savedInput}]);
  }
  return send([]);
 });
 await page.goto('/');await openSystemMenuIfMobile(page);
 await systemModule(page,'Calculadora de custos').click();
 await expect(page.getByRole('combobox',{name:'Cálculo salvo para reutilizar'})).toBeVisible();
 await page.getByRole('combobox',{name:'Cálculo salvo para reutilizar'}).selectOption('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');

 await expect(page.getByRole('status').filter({hasText:'Dados de "Guirlanda" carregados'})).toBeVisible();
 await expect(page.getByTestId('simpleQuantity')).toHaveValue('90');
 await expect(page.getByTestId('simplePrice')).toHaveValue('120');
 await expect(page.getByRole('spinbutton',{name:'Horas',exact:true})).toHaveValue('5');
 await expect(page.getByRole('spinbutton',{name:'Minutos',exact:true})).toHaveValue('13');
 await expect(page.getByRole('spinbutton',{name:'Segundos',exact:true})).toHaveValue('30');
 await expect(page.getByTestId('salePrice')).toHaveValue('40');
 expect(readCalls).toContain('read');
 const copyButtons=page.getByRole('button',{name:'Salvar como novo',exact:true});
 await expect(copyButtons).toHaveCount(2);
 await page.locator('.mc-current-product').getByRole('button',{name:'Salvar como novo',exact:true}).click();
 const productName=page.getByRole('textbox',{name:'Nome do produto'});
 await expect(productName).toBeFocused();
 await expect(productName).toHaveValue('Guirlanda — cópia 2');
 await expect(page.getByRole('textbox',{name:'SKU do produto'})).toBeEmpty();
 await productName.fill('Guirlanda');
 await page.getByRole('button',{name:'Salvar peça e custo'}).click();
 await expect(page.getByRole('alert')).toContainText('Já existe um cadastro com esse nome');
 expect(created).toHaveLength(0);
 await productName.fill('Guirlanda — cópia 2');
 await page.getByRole('button',{name:'Salvar peça e custo'}).click();
 await expect(page.getByRole('status').filter({hasText:'versão inicial e custo estimado salvos'})).toBeVisible();
 expect(created).toHaveLength(1);
 expect(created[0]).toMatchObject({p_name:'Guirlanda — cópia 2',p_parameters:{saved_input:{hours:5.225}}});
 await page.getByRole('combobox',{name:'Cálculo salvo para reutilizar'}).selectOption('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
 await page.getByRole('button',{name:'Novo cálculo',exact:true}).click();
 await page.getByRole('dialog',{name:'Iniciar novo cálculo'}).getByRole('button',{name:'Iniciar novo cálculo'}).click();
 await expect(page.getByRole('textbox',{name:'Nome do produto'})).toBeEmpty();
 await expect(page.getByRole('combobox',{name:'Cálculo salvo para reutilizar'})).toHaveValue('');
 await expect(page.getByTestId('simpleQuantity')).toHaveValue('151.58');
});


test('L4: prévia de rateio de mesa mista concilia centavos sem RPC financeira',async ({page})=>{
 const user='22222222-2222-4222-8222-222222222222',ws='11111111-1111-4111-8111-111111111111';
 const execution='66666666-6666-4666-8666-666666666666';
 const writes:string[]=[];const reads:string[]=[];
 const ids=['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','cccccccc-cccc-4ccc-8ccc-cccccccccccc'];
 await page.addInitScript(({user})=>localStorage.setItem('makercusto:session:v1',JSON.stringify({
  access_token:'mock',refresh_token:'mock',expires_at:Date.now()+3600000,user:{id:user,email:'maker@teste.local'}
 })),{user});
 await page.route('**/rest/v1/**',async route=>{
  const u=route.request().url(),send=(data:unknown)=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
  if(u.includes('mc_workspaces?'))return send([{id:ws,name:'Oficina L4',owner_id:user}]);
  if(u.includes('rpc/mc_list_prints'))return send([{id:execution,status:'partial',printer_id:null,
   printer_name:'Impressora L4',planned_hours:2,actual_hours:1,notes:null,
   created_at:'2026-11-23T10:00:00Z',outputs:[
    {id:ids[0],product_id:ids[0],name:'Guirlanda',planned:1,good:1,failed:0},
    {id:ids[1],product_id:ids[1],name:'Estrela grande',planned:1,good:1,failed:0},
    {id:ids[2],product_id:ids[2],name:'Estrela pequena',planned:1,good:1,failed:0}
   ]}]);
  if(u.includes('rpc/mc_get_l4_exact_origins')){
   reads.push(u);
   return send({execution_id:execution,read_only:true,financially_final:false,
    exact_source_version:'l4-exact-origin-v1',historical_rows_without_capture:0,
    origins:[
     {consumption_id:'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      confirmation_id:'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',lot_id:'ffffffff-ffff-4fff-8fff-ffffffffffff',
      status:'estimated',original_quantity_g:'1000.0000',original_total_cost_brl:'64.0000',
      model_g:'15.0000',purge_g:'0',loss_g:'0',
      quantity_basis:'weighed',purchase_line_id:null,source_version:'l4-exact-origin-v1',captured_at:'2026-11-23T10:00:00Z'},
     {consumption_id:'99999999-9999-4999-8999-999999999999',
      confirmation_id:'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',lot_id:'abababab-abab-4aba-8aba-abababababab',
      status:'unknown',original_quantity_g:'1000.0000',original_total_cost_brl:null,
      model_g:'3.0000',purge_g:'0',loss_g:'0',
      quantity_basis:'estimated',purchase_line_id:null,source_version:'l4-exact-origin-v1',captured_at:'2026-11-23T10:00:00Z'}
    ]});
  }
  if(u.includes('rpc/mc_get_l4_close_readiness')){
   reads.push(u);
   return send({
    schema_version:'l4-readiness-v1',workspace_id:ws,execution_id:execution,
    review_id:null,production_status:'partial',
    confirmed_output_groups:3,consumption_rows:2,exact_origin_missing:1,
    cost_unknown:1,cost_estimated:1,cost_known_without_purchase_reference:0,
    active_reservations:0,reversed_confirmations:0,
    categories_pending:6,categories_supported_claimed:0,categories_not_applicable_declared:0,
    pending_categories:[],sources:[],
    blockers:['NO_REVIEW','MISSING_EXACT_ORIGINS','UNKNOWN_SOURCE_COST','ESTIMATED_SOURCE_COST',
      'UNREVIEWED_COST_CATEGORIES','FINAL_ALLOCATION_NOT_IMPLEMENTED','P09_REVERSAL_NOT_IMPLEMENTED'],
    status:'pending',posting_allowed:false,financially_final:false,computed_live:true
   });
  }
  if(u.includes('rpc/mc_get_print_consumption_sources')){
   reads.push(u);
   return send({execution_id:execution,read_only:true,financially_final:false,
    snapshot_precision:'unit_cost_snapshot:6dp',lines:[
    {consumption_id:'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
     confirmation_id:'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',lot_id:'ffffffff-ffff-4fff-8fff-ffffffffffff',
     lot_label:'PETG branco',cost_status:'estimated',quantity_basis:'weighed',
     model_g:'15',purge_g:'0',loss_g:'0',unit_cost_snapshot:'0.064000',
     model_cost_brl:'0.960000',purge_cost_brl:'0',loss_cost_brl:'0',
     author_id:user,confirmed_at:'2026-11-23T10:00:00Z',
     precision_note:'Preço unitário histórico limitado a 6 casas decimais'},
    {consumption_id:'99999999-9999-4999-8999-999999999999',
     confirmation_id:'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',lot_id:'abababab-abab-4aba-8aba-abababababab',
     lot_label:'PETG sem preço',cost_status:'unknown',quantity_basis:'estimated',
     model_g:'3',purge_g:'0',loss_g:'0',unit_cost_snapshot:null,
     model_cost_brl:null,purge_cost_brl:null,loss_cost_brl:null,
     author_id:user,confirmed_at:'2026-11-23T10:00:00Z',
     precision_note:'Sem preço conhecido'}
    ]});
  }
  if(route.request().method()==='POST'&&!u.includes('mc_list'))writes.push(u);
  return send([]);
 });
 await page.goto('/');await openSystemMenuIfMobile(page);
 await page.getByRole('button',{name:'Impressões',exact:true}).click();
 const panel=page.getByRole('region',{name:'Prévia L4 de rateio'});
 await expect(panel.getByText('SIMULAÇÃO NÃO SALVA.')).toBeVisible();
 await panel.getByRole('combobox',{name:'Impressão para prévia de rateio'}).selectOption(execution);
 await expect(page.getByRole('group',{name:'Ações de Prévia L4'})).toBeVisible();
 await panel.getByRole('combobox',{name:'Categoria de custo L4'}).selectOption('energy');
 await panel.getByRole('textbox',{name:'Valor da categoria L4'}).fill('10.00');
 await panel.getByRole('textbox',{name:'Fonte do custo L4'}).fill('Medição total de energia na execução');
 await panel.getByRole('combobox',{name:'Método de rateio L4'}).selectOption('shared');
 await panel.getByRole('textbox',{name:'Justificativa do rateio L4'}).fill('Massa como base substituta declarada, sem medição individual');
 for(const name of ['Guirlanda — boas','Estrela grande — boas','Estrela pequena — boas']){
  await panel.getByRole('textbox',{name:'Base de rateio '+name}).fill('1');
 }
 await panel.getByRole('button',{name:'+ Incluir categoria na prévia'}).click();
 await page.getByRole('button',{name:'Calcular prévia de rateio'}).click();
 const result=page.getByRole('status',{name:'Resultado da prévia de rateio'});
 await expect(result).toContainText('R$ 10,00');
 await expect(result).toContainText('R$ 3,34');
 await expect(result).toContainText('R$ 3,33');
 await expect(panel.getByRole('list',{name:'Fontes de consumo L4'})).toContainText('PETG branco');
 await expect(panel.getByRole('list',{name:'Fontes de consumo L4'})).toContainText('custo desconhecido');
 await panel.getByRole('button',{name:'Usar modelo no rateio'}).click();
 await expect(panel.getByRole('textbox',{name:'Valor da categoria L4'})).toHaveValue('0.960000');
 await expect(panel.getByRole('textbox',{name:'Valor da categoria L4'})).toHaveAttribute('readonly','');
 await panel.getByRole('combobox',{name:'Método de rateio L4'}).selectOption('direct');
 await panel.getByRole('textbox',{name:'Base de rateio Guirlanda — boas'}).fill('1');
 await panel.getByRole('button',{name:'+ Incluir categoria na prévia'}).click();
 await page.getByRole('button',{name:'Calcular prévia de rateio'}).click();
 await expect(result).toContainText('R$ 10,96');
 const pending=result.getByRole('region',{name:'Pendências de fechamento financeiro L4'});
 await expect(pending).toContainText('Fechamento financeiro: PENDENTE');
 await expect(pending).toContainText('Fontes históricas associadas: 1 de 2');
 await expect(pending).toContainText('custo histórico desconhecido');
 await expect(pending).toContainText('seis casas decimais');
 await expect(pending).toContainText('Massa confirmada sem categoria correspondente');
 expect(reads).toHaveLength(1);
 const dossier=panel.getByRole('region',{name:'Dossiê de prontidão financeira L4'});
 await dossier.getByRole('button',{name:'Consultar impedimentos'}).click();
 const current=dossier.getByRole('status',{name:'Resultado do dossiê financeiro L4'});
 await expect(current).toContainText('Fechamento financeiro: PENDENTE');
 await expect(current).toContainText('Origens exatas ausentes: 1');
 await expect(current).toContainText('Custos desconhecidos: 1');
 await expect(current).toContainText('Categorias pendentes: 6');
 await expect(current).toContainText('A conciliação financeira integral ainda não foi implementada.');
 await expect(current).toContainText('A compensação financeira histórica P09 ainda não foi implementada.');
 expect(reads).toHaveLength(2);
 expect(reads.filter(u=>u.includes('mc_get_l4_close_readiness'))).toHaveLength(1);
 const exactPanel=panel.getByRole('region',{name:'Conciliação exata de material L4'});
 await exactPanel.getByRole('button',{name:'Conferir valores exatos do material'}).click();
 const exact=exactPanel.getByRole('status',{name:'Diagnóstico de material exato L4'});
 await expect(exact).toContainText('Fontes congeladas: 2');
 await expect(exact).toContainText('Atribuições verificadas: 1 de 2');
 await expect(exact).toContainText('Modelo: R$ 0,96');
 await expect(exact).toContainText('Custo de origem desconhecido.');
 await expect(exact).toContainText('Material ainda não integralmente conciliado.');
 await expect(exact).toContainText('Fechamento financeiro: PENDENTE.');
 expect(reads.filter(u=>u.includes('mc_get_l4_exact_origins'))).toHaveLength(1);
 expect(writes).toEqual([]);
});

test('galeria privada permite anexar fotos, definir principal e consultar em outras telas',async({page})=>{
 const workspace='11111111-1111-4111-8111-111111111111';
 const user='22222222-2222-4222-8222-222222222222';
 const product='33333333-3333-4333-8333-333333333333';
 const productWithoutPhoto='55555555-5555-4555-8555-555555555555';
 const snapshot='44444444-4444-4444-8444-444444444444';
 const folder=workspace+'/'+product+'/';
 const filenames:string[]=[];
 let primary:string|undefined;
 let finishFirstUpload!:()=>void;
 const firstUpload=new Promise<void>(resolve=>{finishFirstUpload=resolve;});
 const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC','base64');
 await page.addInitScript(({user})=>localStorage.setItem('makercusto:session:v1',JSON.stringify({
  access_token:'mock',refresh_token:'mock',expires_at:Date.now()+3600000,user:{id:user,email:'maker@test.local'}
 })),{user});
 await page.route('**/rest/v1/**',async route=>{
  const url=new URL(route.request().url());
  if(url.pathname.endsWith('/mc_workspaces'))return route.fulfill({json:[{id:workspace,name:'Oficina teste',owner_id:user}]});
  if(url.pathname.endsWith('/mc_products'))return route.fulfill({json:[{id:product,workspace_id:workspace,name:'Urso',sku:null,kind:'product',description:null,sale_price:null,active:true,created_at:'2026-11-25T00:00:00Z'},
   {id:productWithoutPhoto,workspace_id:workspace,name:'Produto sem foto',sku:null,kind:'product',description:null,sale_price:null,active:true,created_at:'2026-11-25T00:00:00Z'}]});
  if(url.pathname.endsWith('/mc_list_saved_calculations'))return route.fulfill({json:[{
   product_id:product,snapshot_id:snapshot,name:'Urso',kind:'product',sku:null,saved_input:{hours:2},saved_at:'2026-11-25T00:00:00Z'
  }]});
  if(url.pathname.endsWith('/mc_product_photo_preferences')){
   if(route.request().method()==='POST'){
    primary=route.request().postDataJSON().primary_path;
    return route.fulfill({status:204});
   }
   return route.fulfill({json:primary?[{primary_path:primary}]:[]});
  }
  return route.fulfill({json:[]});
 });
 await page.route('**/storage/v1/object/**',async route=>{
  const path=new URL(route.request().url()).pathname;
  if(route.request().method()==='GET')return route.fulfill({body:png,contentType:'image/png'});
  expect(route.request().headers().authorization).toBe('Bearer mock');
  if(path.includes('/list/')){
   const {prefix,limit,offset}=route.request().postDataJSON();
   if(prefix.endsWith('/'+productWithoutPhoto))return route.fulfill({json:[]});
   expect(prefix+'/').toBe(folder);
   return route.fulfill({json:filenames.slice(offset,offset+limit).map(name=>({name,id:name}))});
  }
  if(path.includes('/sign/'))return route.fulfill({json:{signedURL:path.replace('/storage/v1','')+'?token=fake'}});
  expect(path).toContain('/mc-product-photos/'+folder);
  if(filenames.length===0)await firstUpload;
  filenames.push(path.split('/').at(-1)!);
  return route.fulfill({json:{Key:path}});
 });
 await page.goto('/');
 await openSystemMenuIfMobile(page);
 await systemModule(page,'Produtos').click();
 await page.getByRole('article').filter({has:page.getByRole('heading',{name:'Urso',exact:true})}).getByRole('button',{name:'Ver ficha'}).click();
 const gallery=page.getByRole('region',{name:'Fotos do produto'});
 await gallery.getByLabel('Adicionar fotos').setInputFiles([
  {name:'urso-frente.png',mimeType:'image/png',buffer:png},
  {name:'urso-lado.png',mimeType:'image/png',buffer:png}
 ]);
 try{
  await expect(gallery.getByRole('progressbar',{name:'Fotos enviadas'})).toHaveAttribute('max','2');
  await expect(gallery.getByText('0 de 2 fotos enviadas. Enviando urso-frente.png…')).toBeVisible();
 }finally{finishFirstUpload();}
 await expect(gallery.getByRole('img')).toHaveCount(2);
 await gallery.getByRole('button',{name:'Definir como principal'}).click();
 const photoConfirmation=page.getByRole('dialog',{name:'Alterar foto principal'});
 await photoConfirmation.getByRole('button',{name:'Cancelar'}).click();
 expect(primary).toBeUndefined();
 await gallery.getByRole('button',{name:'Definir como principal'}).click();
 await photoConfirmation.getByRole('button',{name:'Definir foto principal'}).click();
 await expect(gallery.getByRole('img',{name:'Foto principal de Urso'})).toHaveAttribute('src',new RegExp(filenames[1]));
 expect(primary).toBe(folder+filenames[1]);
 await openSystemMenuIfMobile(page);
 await systemModule(page,'Biblioteca STL').click();
 await page.getByLabel('Produto da oficina').selectOption(product);
 await expect(gallery.getByRole('img')).toHaveCount(2);
 await expect(gallery.getByLabel('Adicionar fotos')).toHaveCount(0);
 await openSystemMenuIfMobile(page);
 await systemModule(page,'Produtos').click();
 const bearCard=page.getByRole('article').filter({has:page.getByRole('heading',{name:'Urso',exact:true})});
 await expect(bearCard.getByRole('img',{name:'Foto principal de Urso'})).toHaveAttribute('src',new RegExp(filenames[1]));
 await expect(page.getByRole('article').filter({hasText:'Produto sem foto'}).getByRole('img')).toHaveCount(0);
 await openSystemMenuIfMobile(page);
 await systemModule(page,'Calculadora de custos').click();
 await page.getByRole('combobox',{name:'Cálculo salvo para reutilizar'}).selectOption(snapshot);

 await expect(page.getByRole('img',{name:'Foto principal de Urso'})).toHaveAttribute('src',new RegExp(filenames[1]));
 await page.getByText('Orçamento para cliente',{exact:true}).click();
 await page.getByRole('button',{name:'Preparar imagem'}).click();
 await expect(page.getByText('Orçamento pronto com a foto principal.')).toBeVisible();
 await expect(page.getByRole('button',{name:'Baixar imagem'})).toBeVisible();
});

test('monta base e mão com microfone na calculadora usando custos e filamentos salvos',async({page})=>{
 const workspace='11111111-1111-4111-8111-111111111111';
 const user='22222222-2222-4222-8222-222222222222';
 const base='33333333-3333-4333-8333-333333333333';
 const mic='44444444-4444-4444-8444-444444444444';
 let saved:unknown;
 let converted:unknown;
 let order:unknown;
 const trophy='77777777-7777-4777-8777-777777777777';
 const oldSnapshot='88888888-8888-4888-8888-888888888888';
 await page.addInitScript(({user})=>localStorage.setItem('makercusto:session:v1',JSON.stringify({
  access_token:'mock',refresh_token:'mock',expires_at:Date.now()+3600000,user:{id:user}
 })),{user});
 await page.route('**/rest/v1/**',async route=>{
  const url=new URL(route.request().url());
  if(url.pathname.endsWith('/mc_workspaces'))return route.fulfill({json:[{id:workspace,name:'Oficina teste',owner_id:user}]});
  if(url.pathname.endsWith('/mc_products'))return route.fulfill({json:[
   {id:base,workspace_id:workspace,name:'Base',kind:'component',sku:'TR-BASE',description:'Base do troféu',sale_price:null,active:true},
   {id:mic,workspace_id:workspace,name:'Mão com Microfone',kind:'component',sku:null,description:null,sale_price:null,active:true},
   {id:trophy,workspace_id:workspace,name:'Troféu já cadastrado',kind:'product',sku:null,description:null,sale_price:null,active:true}
  ]});
  if(url.pathname.endsWith('/mc_list_saved_calculations'))return route.fulfill({json:[
   {product_id:trophy,snapshot_id:oldSnapshot,name:'Troféu já cadastrado',kind:'product',sku:'TR-01',saved_input:{quantity:1,salePrice:0},saved_at:'2026-11-25T12:00:00Z'}
  ]});
  if(url.pathname.endsWith('/mc_list_component_library'))return route.fulfill({json:[
   {id:base,name:'Base',sku:null,unit_cost:4,cost_source:'snapshot'},
   {id:mic,name:'Mão com Microfone',sku:null,unit_cost:8,cost_source:'snapshot'}
  ]});
  if(url.pathname.endsWith('/mc_cost_snapshots')){
   const isBase=url.searchParams.get('product_id')==='eq.'+base;
   const grams=isBase?11:15;
   return route.fulfill({json:[{quantity:isBase?2:1,total_cost:8,parameters:{calculated_result:{
    modelGrams:grams-1,wasteGrams:1,material:2,energy:1,depreciation:5,assembly:0,accessories:0,
    materialBreakdown:[{id:'one',name:'Preto',totalGrams:grams}]
   }}}]});
  }
  if(url.pathname.endsWith('/mc_customer_orders')&&route.request().method()==='POST'){
   order=route.request().postDataJSON();
   return route.fulfill({status:204});
  }
  if(url.pathname.endsWith('/mc_save_assembly_linked')||url.pathname.endsWith('/mc_create_composed_product')){
   const payload=route.request().postDataJSON();
   if(payload.p_product_id){converted=payload;return route.fulfill({json:trophy});}
   saved=payload;
   return route.fulfill({json:'55555555-5555-4555-8555-555555555555'});
  }
  return route.fulfill({json:[]});
 });
 await page.goto('/');
 await openSystemMenuIfMobile(page);
 await systemModule(page,'Calculadora de custos').click();
 const compositionTab=page.getByRole('button',{name:'Composição / Peças',exact:true});
 const kind=page.getByRole('combobox',{name:'Tipo de produto'});
 await kind.selectOption('component');
 await expect(compositionTab).toHaveCount(0);
 await kind.selectOption('product');
 await page.getByRole('textbox',{name:'Nome do produto'}).fill('Microfone com base');
 await compositionTab.click();
 await expect(page.getByRole('textbox',{name:'Nome do produto'})).toHaveValue('Microfone com base');
 await expect(page.getByLabel('Nome do conjunto')).toHaveCount(0);
 await expect(page.getByTestId('quantity')).toHaveCount(0);
 await expect(page.getByRole('combobox',{name:'Cálculo salvo para reutilizar'})).toHaveCount(0);
 const pieces=page.getByRole('list',{name:'Peças salvas'});
 await expect(pieces.getByRole('listitem')).toHaveCount(2);
 const baseCard=pieces.getByRole('listitem').filter({hasText:'Base'});
 await baseCard.getByRole('button',{name:'Ver ficha',exact:true}).click();
 const sheet=page.getByRole('dialog',{name:'Base'});
 await expect(sheet).toContainText('Base do troféu');
 await sheet.getByRole('button',{name:'Adicionar à composição'}).click();
 await expect(baseCard.getByRole('button',{name:'Na composição'})).toBeDisabled();
 await page.getByLabel('Buscar peça salva').fill('Microfone');
 await expect(pieces.getByRole('listitem')).toHaveCount(1);
 await pieces.getByRole('button',{name:'Adicionar à composição'}).click();
 await page.getByLabel('Quantidade de Base').fill('2');
 const result=page.getByRole('region',{name:'Resultado do conjunto'});
 await expect(result.getByText('16,00',{exact:false})).toBeVisible();
 await expect(result.getByText('Filamento consumido',{exact:true}).locator('..')).toContainText('26 g');
 await result.getByText('Composição dos custos e filamentos').click();
 await expect(result.getByText('Preto')).toBeVisible();
 await expect(page.getByTestId('simpleQuantity')).toBeHidden();
 await expect(result.getByText('Compartilhar resultado',{exact:true})).toBeVisible();
 await expect(result.getByText('Orçamento para cliente',{exact:true})).toBeVisible();
 await result.getByText('Planejamento do pedido',{exact:true}).click();
 await result.getByLabel('Quantidade do pedido (conjuntos)').fill('15');
 await expect(result.getByText('15 conjuntos no pedido',{exact:true})).toBeVisible();
 await expect(result.getByText('Custo do pedido').locator('..')).toContainText('240,00');
 await result.getByRole('button',{name:'Registrar pedido',exact:true}).click();
 await expect(result.getByText('Pedido registrado no histórico da oficina.')).toBeVisible();
 expect(order).toMatchObject({production_method:'assembly',quantity:15,pieces_per_plate:1,plate_cost:16,partial_plate_cost:0});
 await page.getByRole('button',{name:'Cálculo',exact:true}).click();
 await expect(result.getByTestId('unitCost')).toContainText('16,00');
 await expect(page.getByTestId('simpleQuantity')).toBeHidden();
 await expect(page.getByRole('region',{name:'Montagem por partes'})).toBeVisible();
 const originalViewport=page.viewportSize()!;
 const tabs=page.getByRole('navigation',{name:'Áreas da calculadora'});
 for(const width of [320,768,820,882,1024,1180]){
  await page.setViewportSize({width,height:originalViewport.height});
  expect(await tabs.evaluate(nav=>[...nav.querySelectorAll('button')].every(button=>
   button.getBoundingClientRect().right<=nav.getBoundingClientRect().right+1&&button.scrollWidth<=button.clientWidth+1
  )),`Abas completas em ${width}px`).toBe(true);
 }
 await page.setViewportSize(originalViewport);
 await page.getByRole('button',{name:'Configurações',exact:true}).click();
 await expect(result.getByTestId('unitCost')).toContainText('16,00');
 await page.getByRole('button',{name:'Cálculo',exact:true}).click();
 await page.getByRole('button',{name:'Editar impressão direta',exact:true}).click();
 await expect(page.getByRole('region',{name:'Resultado do cálculo'})).toBeVisible();
 await expect(page.getByTestId('simpleQuantity')).toBeVisible();
 await page.getByRole('button',{name:'Composição / Peças',exact:true}).click();
 await expect(page.getByLabel('Quantidade de Base')).toHaveValue('2');
 await expect(result.getByTestId('unitCost')).toContainText('16,00');
 await page.getByRole('button',{name:'Salvar conjunto',exact:true}).click();
 await expect(page.getByText('Conjunto “Microfone com Base” salvo na oficina.')).toBeVisible();
 expect(saved).toMatchObject({p_workspace_id:workspace,p_name:'Microfone com Base',p_parts:{parts:[
  {product_id:base,quantity:2},{product_id:mic,quantity:1}
 ]}});
 await page.getByRole('button',{name:'Ver conjuntos'}).click();
 await page.getByRole('button',{name:'Montar com peças salvas'}).click();
 await expect(page.getByRole('heading',{name:'Montar conjunto'})).toBeVisible();
 await page.getByRole('button',{name:'Ver conjuntos'}).click();
 await openSystemMenuIfMobile(page);
 await systemModule(page,'Calculadora de custos').click();
 await page.getByRole('button',{name:'Cálculo',exact:true}).click();
 await page.getByRole('combobox',{name:'Cálculo salvo para reutilizar'}).selectOption(oldSnapshot);
 await compositionTab.click();
 await expect(page.getByRole('textbox',{name:'Nome do produto'})).toHaveValue('Troféu já cadastrado');
 await expect(page.getByRole('textbox',{name:'SKU do produto'})).toHaveValue('TR-01');
 const add=page.getByRole('list',{name:'Peças salvas'}).getByRole('button',{name:'Adicionar à composição'});
 await add.first().click();
 await add.first().click();
 const convert=page.getByRole('button',{name:'Salvar composição',exact:true});
 await convert.click();
 const confirmation=page.getByRole('dialog',{name:'Salvar composição neste produto'});
 await expect(confirmation).toContainText('Troféu já cadastrado');
 await confirmation.getByRole('button',{name:'Cancelar'}).click();
 expect(converted).toBeUndefined();
 await convert.click();
 await confirmation.getByRole('button',{name:'Salvar composição',exact:true}).click();
 await expect(page.getByText('Composição de “Troféu já cadastrado” salva na mesma ficha.')).toBeVisible();
 expect(converted).toMatchObject({p_product_id:trophy,p_parts:{parts:[{product_id:base,quantity:1},{product_id:mic,quantity:1}]}});
});

test('recupera revisão antiga e registra pedido vendido no histórico da oficina',async({page})=>{
 const workspace='11111111-1111-4111-8111-111111111111';
 const user='22222222-2222-4222-8222-222222222222';
 const product='33333333-3333-4333-8333-333333333333';
 const recent='44444444-4444-4444-8444-444444444444';
 const earlier='55555555-5555-4555-8555-555555555555';
 const requests:Array<Record<string,unknown>>=[];
 await page.addInitScript(({user})=>localStorage.setItem('makercusto:session:v1',JSON.stringify({
  access_token:'mock',refresh_token:'mock',expires_at:Date.now()+3600000,user:{id:user}
 })),{user});
 await page.route('**/rest/v1/**',async route=>{
  const path=new URL(route.request().url()).pathname;
  if(path.endsWith('/mc_workspaces'))return route.fulfill({json:[{id:workspace,name:'Oficina teste',owner_id:user}]});
  if(path.endsWith('/mc_list_saved_calculations'))return route.fulfill({json:[
   {product_id:product,snapshot_id:recent,name:'Chaveiro',kind:'product',sku:null,saved_input:{quantity:2,salePrice:9},saved_at:'2026-11-25T11:00:00Z'}
  ]});
  if(path.endsWith('/mc_cost_snapshots'))return route.fulfill({json:[
   {id:recent,confirmed_at:'2026-11-25T11:00:00Z',quantity:2,total_cost:8,parameters:{saved_input:{quantity:2,salePrice:9}}},
   {id:earlier,confirmed_at:'2026-11-24T11:00:00Z',quantity:2,total_cost:10,parameters:{saved_input:{quantity:2,salePrice:8}}}
  ]});
  if(path.endsWith('/mc_customer_orders')){
   if(route.request().method()==='POST'){
    requests.push(route.request().postDataJSON());
    if(requests.length===1)return route.fulfill({status:500,json:{message:'Falha temporária'}});
    return route.fulfill({status:204});
   }
   return route.fulfill({json:[{...requests.at(-1),created_at:'2026-11-25T11:30:00Z'}]});
  }
  return route.fulfill({json:[]});
 });
 await page.goto('/');
 await openSystemMenuIfMobile(page);
 await systemModule(page,'Calculadora de custos').click();
 await page.getByText('Histórico de custos',{exact:true}).click();
 await page.getByLabel('Produto do histórico').selectOption(product);
 await expect(page.getByRole('button',{name:'Reutilizar parâmetros'})).toHaveCount(2);
 await page.getByText(/5,00\/un\./).locator('..').getByRole('button',{name:'Reutilizar parâmetros'}).click();
 await expect(page.getByTestId('salePrice')).toHaveValue('8');
 await expect(page.getByRole('combobox',{name:'Cálculo salvo para reutilizar'})).toHaveValue(earlier);
 await expect(page.getByRole('combobox',{name:'Cálculo salvo para reutilizar'}).locator('option:checked')).toContainText('revisão carregada');
 await page.getByText('Planejamento do pedido',{exact:true}).click();
 await page.getByLabel('Quantidade do pedido (peças)').fill('15');
 await expect(page.getByLabel('Item do pedido')).toHaveValue('Chaveiro');
 await page.getByLabel('Situação').selectOption('sold');
 await page.getByRole('button',{name:'Registrar pedido'}).click();
 await expect(page.getByText(/Falha temporária/)).toBeVisible();
 await page.getByRole('button',{name:'Registrar pedido'}).click();
 await expect(page.getByText('Pedido registrado no histórico da oficina.')).toBeVisible();
 expect(requests[1]).toMatchObject({id:requests[0].id,workspace_id:workspace,snapshot_id:earlier,status:'sold',quantity:15,pieces_per_plate:2,sale_price:8});
 await page.getByRole('button',{name:'Ver pedidos'}).click();
 const order=page.getByRole('article').filter({hasText:'Chaveiro'});
 await expect(order).toContainText('Vendido');
 await expect(order).toContainText('15 peças · 8 mesas · última mesa: 1 un.');
 await expect(order.getByText('Faturamento do pedido').locator('..')).toContainText('120,00');
});

test('recupera margem da composição e mantém o preço da peça única independente',async({page})=>{
 const workspace='11111111-1111-4111-8111-111111111111';
 const user='22222222-2222-4222-8222-222222222222';
 const product='33333333-3333-4333-8333-333333333333';
 const latest='44444444-4444-4444-8444-444444444444';
 const earlier='55555555-5555-4555-8555-555555555555';
 const direct='66666666-6666-4666-8666-666666666666';
 const base='77777777-7777-4777-8777-777777777777';
 const hand='88888888-8888-4888-8888-888888888888';
 const priceRevision=(id:string,margin:number,price:number,savedAt:string)=>({
  id:product,product_kind:'product',name:'Troféu',sku:null,description:null,snapshot_id:id,
  saved_at:savedAt,total_cost:16,sale_price:price,price_from_snapshot:true,
  pricing:{mode:'margin',targetMarginPercent:margin,orderQuantity:12},
  parts:[{product_id:base,name:'Base',quantity:1,unit_cost:7},{product_id:hand,name:'Mão',quantity:1,unit_cost:9}]
 });
 const old=priceRevision(earlier,60,40,'2026-11-25T12:05:00Z');
 const current=priceRevision(latest,80,80,'2026-11-25T13:00:00Z');
 await page.addInitScript(({user})=>localStorage.setItem('makercusto:session:v1',JSON.stringify({
  access_token:'mock',refresh_token:'mock',expires_at:Date.now()+3600000,user:{id:user}
 })),{user});
 await page.route('**/rest/v1/**',async route=>{
  const path=new URL(route.request().url()).pathname;
  if(path.endsWith('/mc_workspaces'))return route.fulfill({json:[{id:workspace,name:'Oficina teste',owner_id:user}]});
  if(path.endsWith('/mc_products'))return route.fulfill({json:[[product,'Troféu','product'],[base,'Base','component'],[hand,'Mão','component']].map(([id,name,kind])=>
   ({id,name,kind,workspace_id:workspace,sku:null,description:null,sale_price:80,created_at:'2026-11-25T12:00:00Z'}))});
  if(path.endsWith('/mc_list_saved_calculations'))return route.fulfill({json:[
   {product_id:product,snapshot_id:direct,name:'Troféu',kind:'product',sku:null,saved_input:{quantity:2,salePrice:8},saved_at:'2026-11-25T12:00:00Z'}
  ]});
  if(path.endsWith('/mc_list_assemblies'))return route.fulfill({json:[current]});
  if(path.endsWith('/mc_list_component_library'))return route.fulfill({json:[{id:base,name:'Base',unit_cost:70},{id:hand,name:'Mão',unit_cost:90}]});
  if(path.endsWith('/mc_cost_snapshots'))return route.fulfill({json:[
   {id:earlier,confirmed_at:old.saved_at,quantity:1,total_cost:16,parameters:{origin:'assembly-revision'}}
  ]});
  if(path.endsWith('/mc_get_assembly_snapshot')){
   expect(route.request().postDataJSON().p_snapshot_id).toBe(earlier);
   return route.fulfill({json:old});
  }
  return route.fulfill({json:[]});
 });
 await page.goto('/');
 await openSystemMenuIfMobile(page);
 await systemModule(page,'Calculadora de custos').click();
 const picker=page.getByRole('combobox',{name:'Cálculo salvo para reutilizar'});
 await picker.selectOption(latest);
 const composition=page.getByRole('region',{name:'Resultado do conjunto'});
 await expect(composition.getByTestId('unitCost')).toContainText('16,00');
 await expect(composition.getByRole('spinbutton',{name:'Margem bruta desejada (%)'})).toHaveValue('80');
 await expect(composition.locator('.mc-calculated-sale-price')).toContainText('80,00');
 await expect(composition.getByLabel('Quantidade do pedido (conjuntos)')).toHaveValue('12');
 await expect(page.getByRole('region',{name:'Montar conjunto com peças salvas'}).getByLabel('Quantidade de Base')).toBeVisible();
 await composition.getByRole('button',{name:'Impressão em peça única'}).click();
 await expect(page.getByTestId('salePrice')).toHaveValue('8');
 await page.getByText('Histórico de custos',{exact:true}).click();
 await page.getByLabel('Produto do histórico').selectOption(product);
 await page.getByRole('button',{name:'Carregar composição'}).click();
 await expect(picker).toHaveValue(earlier);
 await expect(composition.getByRole('spinbutton',{name:'Margem bruta desejada (%)'})).toHaveValue('60');
 await expect(composition.locator('.mc-calculated-sale-price')).toContainText('40,00');
});
