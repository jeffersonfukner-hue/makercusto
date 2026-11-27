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
