import { test, expect } from '@playwright/test';

test('mostra cálculo padrão e atualiza preço', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Quanto custa produzir/ })).toBeVisible();
  await expect(page.getByTestId('unitCost')).toContainText('R$');
  await page.getByTestId('salePrice').fill('1');
  await expect(page.getByTestId('grossProfit')).toHaveClass(/negative/);
  await page.getByTestId('salePrice').fill('9.9');
  await expect(page.getByTestId('grossProfit')).toHaveClass(/positive/);
});
test('impede quantidade inválida e permite restaurar', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('quantity').fill('0');
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByRole('button', { name: 'Restaurar exemplo' }).click();
  await expect(page.getByTestId('quantity')).toHaveValue('20');
  await expect(page.getByRole('alert')).toHaveCount(0);
});
test('atualiza custo ao alterar preço e desperdício da cor', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('unitCost')).toContainText('2,52');
  await page.getByRole('button', { name: /Dourado/ }).click();
  await page.getByTestId('material-gold-pricePerKg').fill('200');
  await expect(page.getByTestId('unitCost')).toContainText('2,62');
  await page.getByTestId('material-gold-wasteGrams').fill('10');
  await expect(page.getByTestId('unitCost')).toContainText('2,72');
});
test('adiciona e remove material e valida entrada', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Adicionar cor/ }).click();
  await expect(page.getByTestId('material-extra-1-grams')).toBeVisible();
  await page.getByTestId('material-extra-1-grams').fill('-1');
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByTestId('material-extra-1-grams').fill('0');
  await page.getByRole('button', { name: 'Remover material 1' }).click();
  await expect(page.getByRole('button', { name: /Nova cor/ })).toHaveCount(0);
});

test('edita uma cor de cada vez, resume as demais e preserva seus valores', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: /Azul/ })).toHaveAttribute('aria-expanded', 'true');
  await page.getByTestId('material-blue-grams').fill('84');
  await page.getByRole('button', { name: /Branco/ }).click();
  await expect(page.getByRole('button', { name: /Azul/ })).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByTestId('material-blue-grams')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Branco/ })).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('button', { name: /Azul/ }).click();
  await expect(page.getByTestId('material-blue-grams')).toHaveValue('84');
  await page.getByRole('button', { name: /Adicionar cor/ }).click();
  await expect(page.getByTestId('material-extra-1-grams')).toBeVisible();
  await expect(page.getByRole('button', { name: /Azul/ })).toHaveAttribute('aria-expanded', 'false');
});

test('insere nova cor no topo e a expande imediatamente, inclusive em cliques sucessivos', async ({ page }) => {
  await page.goto('/');
  const rows = page.locator('.material-row');
  await page.getByRole('button', { name: /Adicionar cor/ }).click();
  await expect(rows.first()).toContainText('Nova cor');
  await expect(page.getByTestId('material-extra-1-grams')).toBeVisible();
  await expect(page.getByRole('button', { name: /Azul/ })).toHaveAttribute('aria-expanded', 'false');
  await page.getByRole('button', { name: /Adicionar cor/ }).click();
  await expect(rows.first()).toContainText('Nova cor');
  await expect(page.getByTestId('material-extra-2-grams')).toBeVisible();
  await expect(page.getByTestId('material-extra-1-grams')).toHaveCount(0);
  await expect(rows).toHaveCount(5);
});

test('sugere cores conhecidas e memoriza personalizadas sem duplicar', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Adicionar cor/ }).click();
  const input = page.getByRole('textbox', { name: 'Nome do material 1' });
  await expect(page.locator('#makercusto-cores option[value="Azul"]')).toHaveCount(1);
  await input.fill('Turquesa Especial');
  await input.blur();
  await expect(page.locator('#makercusto-cores option[value="Turquesa Especial"]')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('#makercusto-cores option[value="Turquesa Especial"]')).toHaveCount(1);
  await page.getByRole('button', { name: /Adicionar cor/ }).click();
  const added = page.getByRole('textbox', { name: 'Nome do material 1' });
  await added.fill('aZuL');
  await added.blur();
  await expect(page.locator('#makercusto-cores option').filter({ hasText: /^Azul$/ })).toHaveCount(1);
});
