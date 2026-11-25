import {describe,expect,it} from 'vitest';
import {formatCatalogName,similarCatalogName,matchKey} from './catalogName';

describe('nomes de cadastro',()=>{
 it('capitaliza palavras principais e mantém conectores internos em minúsculas',()=>{
  expect(formatCatalogName('  castelo   DE areia  ')).toBe('Castelo de Areia');
  expect(formatCatalogName('verde E azul')).toBe('Verde e Azul');
  expect(formatCatalogName('azul claro')).toBe('Azul Claro');
  expect(formatCatalogName('guirlanda — cópia 2')).toBe('Guirlanda — cópia 2');
  expect(formatCatalogName('pá com asa')).toBe('Pá com Asa');
 });
 it('reaproveita grafia, acento e siglas oficiais',()=>{
  expect(formatCatalogName('azul ceu',['Azul Céu'])).toBe('Azul Céu');
  expect(formatCatalogName('petg com sunlu')).toBe('PETG com SUNLU');
  expect(formatCatalogName('bambu lab a1 mini',['Bambu Lab A1 mini'])).toBe('Bambu Lab A1 mini');
  expect(matchKey('PLA+')).not.toBe(matchKey('PLA'));
 });
 it('sugere uma grafia próxima sem transformar um nome novo',()=>{
  expect(similarCatalogName('azul clrao',['Azul Claro','Azul Marinho'])).toBe('Azul Claro');
  expect(similarCatalogName('azul ceu',['Azul Céu'])).toBeUndefined();
  expect(similarCatalogName('Cor Nova',['Azul Claro'])).toBeUndefined();
 });
});
