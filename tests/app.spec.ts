import { test, expect } from '@playwright/test';
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
 await page.getByRole('button',{name:'Adicionar à tabela'}).click();
 await expect(page.getByTestId('row-extra-1')).toContainText('Turquesa');
 await expect(page.getByTestId('row-extra-1')).toContainText('R$ 5,00');
 await expect(page.getByTestId('materialCost')).toContainText('20,16');
});
test('edita uma linha, calcula embalagem 1,3 kg e remove',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:/Avançado/}).click();
 await page.getByRole('button',{name:/Detalhar por cor/}).click();
 await page.getByRole('button',{name:'Editar Azul'}).click();
 await expect(page.getByRole('button',{name:'Salvar alteração'})).toBeVisible();
 await page.getByTestId('packageQuantity').fill('1.3');
 await page.getByTestId('packagePrice').fill('130');
 await page.getByRole('button',{name:'Salvar alteração'}).click();
 await expect(page.getByTestId('row-blue')).toContainText('1,3 kg');
 await expect(page.getByTestId('materialCost')).toContainText('15,16');
 await page.getByRole('button',{name:'Remover Dourado'}).click();
 await expect(page.getByTestId('row-gold')).toHaveCount(0);
});
test('valida o formulário sem criar linhas pendentes',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:/Avançado/}).click();
 await page.getByRole('button',{name:/Detalhar por cor/}).click();
 await page.getByRole('button',{name:'Adicionar à tabela'}).click();
 await expect(page.getByRole('alert')).toBeVisible();
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
 await expect(page.locator('#catalog-cor option[value="Turquesa Especial"]')).toHaveCount(1);
 await page.reload();await page.getByRole('button',{name:/Avançado/}).click();await page.getByRole('button',{name:/Detalhar por cor/}).click();
 await expect(page.locator('#catalog-cor option[value="Turquesa Especial"]')).toHaveCount(1);
 const c2=page.getByLabel('Cor do filamento');await c2.fill('aZuL');await c2.blur();
 await expect(page.locator('#catalog-cor option[value="Azul"]')).toHaveCount(1);
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
 await page.getByRole('button',{name:'+ Nova impressora'}).click();
 await page.getByRole('textbox',{name:'Nome da impressora'}).fill('Kobra X bancada');
 await page.getByTestId('printerPrice').fill('5000');
 await page.getByTestId('averageWatts').fill('100');
 await page.getByRole('button',{name:'Fechar edição'}).click();
 await expect(page.getByRole('combobox',{name:'Selecionar impressora'})).toContainText('Kobra X bancada');
 await page.getByRole('combobox',{name:'Selecionar impressora'}).selectOption('example');
 await page.getByRole('combobox',{name:'Selecionar impressora'}).selectOption('printer-2');
 await expect(page.locator('.printer-summary')).toContainText('100 W');
 await expect(page.getByTestId('simpleQuantity')).toHaveValue('151.58');
});

test('jornada progressiva apresenta essencial, avancado preserva dados e ao voltar restaura calculo simples',async({page})=>{
 await page.goto('/');
 await expect(page.getByRole('button',{name:/Simples/})).toHaveAttribute('aria-pressed','true');
 await expect(page.getByTestId('simpleQuantity')).toBeVisible();
 await expect(page.getByTestId('hours')).toBeVisible();
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
