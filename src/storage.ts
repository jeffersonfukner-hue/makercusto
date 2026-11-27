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
