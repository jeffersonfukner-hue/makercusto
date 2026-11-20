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
  await expect(page.getByText('Modelo: 151.58 g', { exact: false })).toHaveCount(0);
  await expect(page.getByTestId('unitCost')).toContainText('2,52');
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
  await page.getByRole('button', { name: 'Remover material 4' }).click();
  await expect(page.getByTestId('material-extra-1-grams')).toHaveCount(0);
});
