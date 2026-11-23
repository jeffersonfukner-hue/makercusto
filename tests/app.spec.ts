import { test, expect, type Page } from '@playwright/test';
async function openSystemMenuIfMobile(page:Page){const toggle=page.getByRole('button',{name:'Abrir menu do sistema'});if(await toggle.isVisible())await toggle.click();}
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

test('botões mais abrem modal de cadastro reutilizável',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:/Avançado/}).click();
 await page.getByRole('button',{name:/Detalhar por cor/}).click();
 await page.getByRole('button',{name:'Cadastrar cor'}).click();
 await expect(page.getByRole('dialog',{name:'Cadastrar cor'})).toBeVisible();
 await page.getByRole('textbox',{name:'Nome de cor'}).fill('Turquesa Única');
 await page.getByRole('button',{name:'Salvar cadastro'}).click();
 await expect(page.locator('#catalog-cor option[value="Turquesa Única"]')).toHaveCount(1);
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
 await page.getByRole('button',{name:'Entrar / Salvar'}).click();
 await page.getByRole('textbox',{name:'E-mail'}).fill(user.email);
 await page.getByLabel('Senha').fill('senha-teste');
 await page.getByRole('button',{name:'Entrar',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Visão geral da oficina'})).toBeVisible();
 await openSystemMenuIfMobile(page);
 await page.getByRole('button',{name:'Custos',exact:true}).click();
 await page.getByRole('button',{name:/Avançado/}).click();
 await expect(page.getByText('Oficina conectada ao Supabase.')).toBeVisible();
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
 await expect(page.locator('.smart-suggestions').getByRole('option')).toHaveCount(2);
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
 await expect(page.getByRole('alert')).toContainText('Já existe um perfil com esse nome');
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
});
test('preço da embalagem explica custo por quilo e preserva cálculo',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:/Avançado/}).click();await page.getByRole('button',{name:/Detalhar por cor/}).click();
 await page.getByTestId('packagePrice').fill('120');
 await expect(page.getByText(/Custo equivalente:/)).toContainText('R$ 120,00/kg');
 await page.getByTestId('packageQuantity').fill('0.5');
 await expect(page.getByText(/Custo equivalente:/)).toContainText('R$ 240,00/kg');
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

test('produto exige login para salvar e oferece entrada no modal',async({page})=>{
 await page.goto('/');
 await expect(page.getByRole('heading',{name:'Meus produtos'})).toBeVisible();
 await page.getByRole('button',{name:'Entrar para salvar produto'}).click();
 await expect(page.getByRole('dialog')).toBeVisible();
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
 await page.getByRole('button',{name:'Produtos',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Produtos da oficina'})).toBeVisible();
 await expect(page.getByRole('textbox',{name:'Nome do produto'})).toHaveCount(0);
 await page.getByRole('button',{name:'+ Novo produto'}).click();
 await page.getByRole('textbox',{name:'Nome do produto'}).fill('Chaveiro Galo');
 await page.getByRole('textbox',{name:'SKU do produto'}).fill('GAL-01');
 await page.getByRole('button',{name:'Salvar produto',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Ficha do produto'})).toBeVisible();
 await expect(page.getByText('Chaveiro Galo')).toBeVisible();
 expect(posted?.p_workspace_id).toBe(workspace);
 expect(posted?.p_kind).toBe('product');
 expect(posted?.p_product_id).toBeNull();
});
test('visitante vê fluxo de montagem e pode abrir login',async({page})=>{
 await page.goto('/');
 await expect(page.getByRole('heading',{name:'Produtos com várias peças'})).toBeVisible();
 await page.getByRole('button',{name:'Entrar para montar produto'}).click();
 await expect(page.getByRole('dialog')).toBeVisible();
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
 await page.getByRole('button',{name:'Produtos',exact:true}).click();
 await page.getByRole('button',{name:'Conjuntos',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Conjuntos'})).toBeVisible();
 await page.getByRole('button',{name:'+ Novo conjunto'}).click();
 await expect(page.getByRole('textbox',{name:'Nome do produto'})).toBeEmpty();
 await page.getByRole('textbox',{name:'Nome do produto'}).fill('Brinquedo lançador de hélices');
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
 await expect(page.getByText('Brinquedo lançador de hélices')).toBeVisible();
 await expect(page.getByText('R$ 4,50 (informado)')).toBeVisible();
 expect((payload?.p_parts as unknown[])).toHaveLength(3);
 await page.getByRole('button',{name:'Editar',exact:true}).click();
 await page.getByRole('spinbutton',{name:'Custo da peça 2'}).fill('1.10');
 await page.getByRole('button',{name:'Salvar nova revisão'}).click();
 await expect(page.getByText('R$ 4,80 (informado)')).toBeVisible();
 expect(revisions).toBe(1);
 await page.getByRole('button',{name:'Duplicar'}).click();
 await expect(page.getByRole('textbox',{name:'Nome do produto'})).toHaveValue('Brinquedo lançador de hélices — cópia');
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
 await page.getByRole('button',{name:'Produtos',exact:true}).click();
 await page.getByRole('button',{name:'Conjuntos',exact:true}).click();
 await page.getByRole('button',{name:'+ Novo conjunto'}).click();
 await page.getByRole('textbox',{name:'Nome do produto'}).fill('Kit de teste');
 await page.getByRole('button',{name:'Salvar produto',exact:true}).click();
 await expect(page.getByRole('alert')).toContainText('Informe pelo menos duas peças válidas');
});
test('acesso público preserva calculadora sem apresentar sistema privado',async({page})=>{
 await page.goto('/');
 await expect(page.getByRole('heading',{name:'Descubra seu custo. Venda com confiança.'})).toBeVisible();
 await expect(page.getByRole('navigation',{name:'Módulos do MakerCusto'})).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Entrar / Salvar'})).toBeVisible();
});
test('login transforma a página em sistema com menu lateral e painel de oficina',async({page},testInfo)=>{
 const workspace='11111111-1111-4111-8111-111111111111',user='22222222-2222-4222-8222-222222222222';
 await page.addInitScript(({user})=>localStorage.setItem('makercusto:session:v1',JSON.stringify({
  access_token:'mock-token',refresh_token:'mock-refresh',expires_at:Date.now()+3600000,user:{id:user,email:'maker@example.test'}
 })),{user});
 await page.route('**/rest/v1/**',async route=>{
  const url=route.request().url();
  if(url.includes('/mc_workspaces?'))return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([{id:workspace,name:'Oficina de Testes',owner_id:user}])});
  if(url.includes('/mc_printers?')||url.includes('/mc_catalog?')||url.includes('/mc_products?'))return route.fulfill({status:200,contentType:'application/json',body:'[]'});
  if(url.includes('/rpc/mc_list_assemblies'))return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([{id:'44444444-4444-4444-8444-444444444444',name:'Lançador de hélices',sku:null,description:null,sale_price:null,created_at:'2026-11-22T00:00:00Z',total_cost:null,cost_status:'unknown',revision:1,parts:[{id:'1',name:'Lançador',quantity:1,notes:null,grams:null},{id:'2',name:'Haste',quantity:1,notes:null,grams:null},{id:'3',name:'Hélice',quantity:1,notes:null,grams:null}]}])});
  return route.fulfill({status:200,contentType:'application/json',body:'[]'});
 });
 await page.goto('/');
 await expect(page.getByRole('navigation',{name:'Módulos do MakerCusto'})).toBeAttached();
 await expect(page.getByRole('heading',{name:'Visão geral da oficina'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Visão geral',exact:true})).toHaveAttribute('aria-current','page');
 await page.getByRole('button',{name:'Atividades',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Cadastros recentes'})).toBeVisible();
 await expect(page.getByText('Esta lista não é um log de alterações ou impressões.')).toBeVisible();
 await page.getByRole('button',{name:'Pendências',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Informações a completar'})).toBeVisible();
 await expect(page.getByText('Custo não apurado')).toBeVisible();
 await page.getByRole('button',{name:'Visão geral',exact:true}).click();
 await expect(page.getByText('Lançador de hélices')).toBeVisible();
 await expect(page.getByRole('heading',{name:'Oficina de Testes'})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Descubra seu custo. Venda com confiança.'})).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Impressões',exact:false})).toBeDisabled();
 await openSystemMenuIfMobile(page);
 await page.getByRole('button',{name:'Produtos',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Produtos da oficina'})).toBeVisible();
 await page.getByRole('button',{name:'Peças',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Peças'})).toBeVisible();
 await page.getByRole('button',{name:'Conjuntos',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Conjuntos'})).toBeVisible();
 await openSystemMenuIfMobile(page);
 await page.getByRole('button',{name:'Custos',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Calculadora de produção'})).toBeVisible();
 await openSystemMenuIfMobile(page);
 await page.getByRole('button',{name:'Início',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Visão geral da oficina'})).toBeVisible();
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
 await page.getByRole('button',{name:'Materiais',exact:true}).click();
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
   status:'draft',printer_id:printer,printer_name:'Impressora 1',planned_hours:null,actual_hours:null,notes:null,
   created_at:new Date().toISOString(),outputs:[{id:'66666666-6666-4666-8666-666666666666',
   product_id:product,name:'Hélice',planned:3,good:0,failed:0}]}]:[]);
  if(u.includes('rpc/mc_create_print')){saved=route.request().postDataJSON() as Record<string,unknown>;return respond('55555555-5555-4555-8555-555555555555');}
  if(u.includes('rpc/mc_list_existing_spools')||u.includes('rpc/mc_list_assemblies')||u.includes('mc_catalog?'))return respond([]);
  return respond([]);
 });
 await page.goto('/');
 await openSystemMenuIfMobile(page);
 await page.getByRole('button',{name:'Impressões',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Impressões da oficina'})).toBeVisible();
 await page.getByRole('combobox',{name:'Impressora física'}).selectOption(printer);
 await page.getByRole('combobox',{name:'Peça a imprimir'}).selectOption(product);
 await page.getByRole('spinbutton',{name:'Quantidade planejada'}).fill('3');
 await page.getByRole('button',{name:'+ Adicionar peça à mesa'}).click();
 await page.getByRole('button',{name:'Registrar impressão sem baixa'}).click();
 await expect(page.getByText('Impressão registrada como rascunho.')).toBeVisible();
 expect(saved).not.toBeNull();
 const payload=saved as unknown as Record<string,unknown>;
 expect(payload.p_outputs).toEqual([{product_id:product,quantity:3}]);
 expect(payload.p_planned_hours).toBeNull();
 await expect(page.getByText('Hélice: planejadas 3, boas 0, rejeitadas 0')).toBeVisible();
});
