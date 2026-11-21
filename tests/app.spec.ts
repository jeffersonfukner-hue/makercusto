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
test('salva produto, custo e lista na oficina com feedback sem recarregar',async({page})=>{
 const workspace='11111111-1111-4111-8111-111111111111';
 const user='22222222-2222-4222-8222-222222222222';
 const saved:{name:string;id:string;sku:string|null;kind:string;sale_price:number;workspace_id:string;description:string|null;active:boolean;created_at:string}[]=[];
 let posted:Record<string,unknown>|undefined;
 await page.addInitScript(({user})=>{
  localStorage.setItem('makercusto:session:v1',JSON.stringify({
   access_token:'mock-token',refresh_token:'mock-refresh',expires_at:Date.now()+3600000,user:{id:user,email:'teste@example.test'}
  }));
 },{user});
 await page.route('**/rest/v1/**',async route=>{
  const url=route.request().url();
  if(url.includes('/mc_workspaces?'))return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([{id:workspace,name:'Minha oficina',owner_id:user}])});
  if(url.includes('/mc_printers?'))return route.fulfill({status:200,contentType:'application/json',body:'[]'});
  if(url.includes('/mc_catalog?'))return route.fulfill({status:200,contentType:'application/json',body:'[]'});
  if(url.includes('/mc_products?'))return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(saved)});
  if(url.includes('/rpc/mc_save_calculated_product')){
   posted=route.request().postDataJSON() as Record<string,unknown>;
   saved.push({id:'33333333-3333-4333-8333-333333333333',workspace_id:workspace,name:String(posted.p_name),sku:String(posted.p_sku),kind:String(posted.p_kind),sale_price:Number(posted.p_sale_price),description:null,active:true,created_at:new Date().toISOString()});
   return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(saved[0].id)});
  }
  return route.fulfill({status:404,contentType:'application/json',body:'{}'});
 });
 await page.goto('/');
 await page.getByRole('textbox',{name:'Nome do produto'}).fill('Chaveiro Galo');
 await page.getByRole('textbox',{name:'SKU do produto'}).fill('GAL-01');
 await page.getByRole('button',{name:'Salvar produto e custo'}).click();
 await expect(page.getByRole('status')).toContainText('Produto, versão inicial e custo estimado salvos');
 await expect(page.locator('.product-save-panel .product-list')).toContainText('Chaveiro Galo');
 expect(posted?.p_workspace_id).toBe(workspace);
 expect(posted?.p_kind).toBe('product');
 expect(Number(posted?.p_total_cost)).toBeGreaterThan(0);
 expect((posted?.p_parameters as Record<string,unknown>)?.saved_input).toBeTruthy();
});

test('visitante vê fluxo de montagem e pode abrir login',async({page})=>{
 await page.goto('/');
 await expect(page.getByRole('heading',{name:'Produtos com várias peças'})).toBeVisible();
 await page.getByRole('button',{name:'Entrar para montar produto'}).click();
 await expect(page.getByRole('dialog')).toBeVisible();
});
test('conjunto de três peças é salvo e consultado na mesma oficina',async({page})=>{
 const workspace='11111111-1111-4111-8111-111111111111';
 const user='22222222-2222-4222-8222-222222222222';
 type Assembly={id:string;name:string;sku:string|null;description:string|null;sale_price:number|null;created_at:string;parts:{id:string;name:string;quantity:number;grams:string|null;notes:string|null}[]};
 const kits:Assembly[]=[];
 let payload:Record<string,unknown>|undefined;
 await page.addInitScript(({user})=>localStorage.setItem('makercusto:session:v1',JSON.stringify({
  access_token:'mock-token',refresh_token:'mock-refresh',expires_at:Date.now()+3600000,
  user:{id:user,email:'teste@example.test'}
 })),{user});
 await page.route('**/rest/v1/**',async route=>{
  const url=route.request().url();
  if(url.includes('/mc_workspaces?'))return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([{id:workspace,name:'Minha oficina',owner_id:user}])});
  if(url.includes('/mc_printers?')||url.includes('/mc_catalog?')||url.includes('/mc_products?'))
   return route.fulfill({status:200,contentType:'application/json',body:'[]'});
  if(url.includes('/rpc/mc_list_assemblies'))return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(kits)});
  if(url.includes('/rpc/mc_create_assembly')){
   payload=route.request().postDataJSON() as Record<string,unknown>;
   const parts=payload.p_parts as {name:string;quantity:number;grams:number|null;notes:string}[];
   kits.push({id:'33333333-3333-4333-8333-333333333333',name:String(payload.p_name),sku:String(payload.p_sku)||null,
    description:String(payload.p_description)||null,sale_price:payload.p_sale_price===null?null:Number(payload.p_sale_price),
    created_at:new Date().toISOString(),
    parts:parts.map((p,i)=>({id:String(i+1),name:p.name,quantity:p.quantity,grams:p.grams===null?null:String(p.grams),notes:p.notes}))});
   return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(kits[0].id)});
  }
  return route.fulfill({status:404,contentType:'application/json',body:'{}'});
 });
 await page.goto('/');
 const kit=page.locator('.assembly-panel');
 await kit.getByRole('textbox',{name:'Nome do conjunto'}).fill('Brinquedo lançador de hélices');
 await kit.getByRole('spinbutton',{name:'Peso da peça 1'}).fill('35.5');
 await kit.getByRole('spinbutton',{name:'Peso da peça 3'}).fill('12.5');
 await kit.getByRole('button',{name:'Salvar conjunto e peças'}).click();
 await expect(kit.getByRole('status')).toContainText('Conjunto e 3 peças salvos');
 await expect(kit.locator('.product-list')).toContainText('Brinquedo lançador de hélices');
 await kit.getByRole('button',{name:/Brinquedo lançador de hélices/}).click();
 await expect(kit.locator('.assembly-details')).toContainText('Lançador');
 await expect(kit.locator('.assembly-details')).toContainText('Haste');
 await expect(kit.locator('.assembly-details')).toContainText('Hélice');
 expect((payload?.p_parts as unknown[])).toHaveLength(3);
 expect(payload?.p_workspace_id).toBe(workspace);
});
test('validação impede cadastro incompleto e exige duas peças',async({page})=>{
 const user='22222222-2222-4222-8222-222222222222',workspace='11111111-1111-4111-8111-111111111111';
 await page.addInitScript(({user})=>localStorage.setItem('makercusto:session:v1',JSON.stringify({
  access_token:'mock-token',refresh_token:'mock-refresh',expires_at:Date.now()+3600000,user:{id:user}
 })),{user});
 await page.route('**/rest/v1/**',async route=>{
  const url=route.request().url();
  if(url.includes('/mc_workspaces?'))return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([{id:workspace,name:'Oficina',owner_id:user}])});
  return route.fulfill({status:200,contentType:'application/json',body:'[]'});
 });
 await page.goto('/');
 const kit=page.locator('.assembly-panel');
 await kit.getByRole('textbox',{name:'Nome da peça 1'}).fill('');
 await kit.getByRole('button',{name:'Salvar conjunto e peças'}).click();
 await expect(kit.getByRole('alert')).toContainText('Informe pelo menos duas peças válidas');
});
