import { parseSaved, type SavedCalc } from './domain/saved'

const KEY = 'makercusto:calculos'
export function readSaved(): SavedCalc[] {
  try { return parseSaved(localStorage.getItem(KEY)) } catch { return [] }
}
export function writeSaved(list: SavedCalc[]): boolean {
  try { localStorage.setItem(KEY, JSON.stringify(list)); return true } catch { return false }
}
