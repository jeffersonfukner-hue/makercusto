// Mesmo nome = mesmo produto. Cada salvamento vira uma versão do histórico, da mais nova para a mais antiga.
export interface Versioned { name: string; savedAt: string; kind?: string }
export interface Group<T> { key: string; name: string; latest: T; history: T[] }

const keyOf = (x: Versioned) => `${x.kind ?? ''}|${x.name.trim().toLowerCase()}`

export function groupVersions<T extends Versioned>(items: T[]): Group<T>[] {
  const map = new Map<string, T[]>()
  for (const x of items) map.set(keyOf(x), [...(map.get(keyOf(x)) ?? []), x])
  const groups = [...map.entries()].map(([key, list]) => {
    const sorted = [...list].sort((a, b) => Date.parse(b.savedAt) - Date.parse(a.savedAt))
    return { key, name: sorted[0].name, latest: sorted[0], history: sorted }
  })
  return groups.sort((a, b) => Date.parse(b.latest.savedAt) - Date.parse(a.latest.savedAt))
}
