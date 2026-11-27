import { parseSaved, type SavedCalc } from './domain/saved'

const KEY = 'makercusto:calculos'
export function readSaved(): SavedCalc[] {
  try { return parseSaved(localStorage.getItem(KEY)) } catch { return [] }
}
export function writeSaved(list: SavedCalc[]): boolean {
  try { localStorage.setItem(KEY, JSON.stringify(list)); return true } catch { return false }
}

import type { Mode } from './modes'
export function readMode(): Mode {
  try { return localStorage.getItem('makercusto:modo') === 'avancado' ? 'avancado' : 'basico' } catch { return 'basico' }
}
export function writeMode(m: Mode) {
  try { localStorage.setItem('makercusto:modo', m) } catch { /* sem armazenamento: o modo vale só nesta sessão */ }
}

import { parseFilaments, type Filament } from './domain/filament'
const FKEY = 'makercusto:filamentos'
export function readFilaments(): Filament[] {
  try { return parseFilaments(localStorage.getItem(FKEY)) } catch { return [] }
}
export function writeFilaments(list: Filament[]): boolean {
  try { localStorage.setItem(FKEY, JSON.stringify(list)); return true } catch { return false }
}

import { parseProducts, type SavedProduct } from './domain/product'
import { parsePrinters, type UserPrinter } from './domain/printers'
const rd = <T,>(k: string, parse: (r: string | null) => T[]): T[] => { try { return parse(localStorage.getItem(k)) } catch { return [] } }
const wr = (k: string, v: unknown): boolean => { try { localStorage.setItem(k, JSON.stringify(v)); return true } catch { return false } }
export const readProducts = () => rd<SavedProduct>('makercusto:produtos', parseProducts)
export const writeProducts = (l: SavedProduct[]) => wr('makercusto:produtos', l)
export const readPrinters = () => rd<UserPrinter>('makercusto:impressoras', parsePrinters)
export const writePrinters = (l: UserPrinter[]) => wr('makercusto:impressoras', l)
export const readDraft = (): unknown => { try { return JSON.parse(localStorage.getItem('makercusto:rascunho-produto') ?? 'null') } catch { return null } }
export const writeDraft = (v: unknown) => wr('makercusto:rascunho-produto', v)

import { parseSuppliers, type Supplier } from './domain/supplier'
import { parseSupplies, type Supply } from './domain/supply'
export const readSuppliers = () => rd<Supplier>('makercusto:fornecedores', parseSuppliers)
export const writeSuppliers = (l: Supplier[]) => wr('makercusto:fornecedores', l)
export const readSupplies = () => rd<Supply>('makercusto:insumos', parseSupplies)
export const writeSupplies = (l: Supply[]) => wr('makercusto:insumos', l)
export function readStartPage(): 'calculadora' | 'inicio' { try { return localStorage.getItem('makercusto:abrir') === 'inicio' ? 'inicio' : 'calculadora' } catch { return 'calculadora' } }
export function writeStartPage(v: 'calculadora' | 'inicio') { try { localStorage.setItem('makercusto:abrir', v) } catch { /* vale só nesta sessão */ } }
