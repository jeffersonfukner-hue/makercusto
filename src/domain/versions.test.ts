import { describe, expect, it } from 'vitest'
import { groupVersions } from './versions'

describe('groupVersions', () => {
  it('junta o mesmo nome em um produto, versão mais nova primeiro', () => {
    const g = groupVersions([
      { id: 'a', name: 'Caneca Flamengo', savedAt: '2026-11-01T10:00:00Z' },
      { id: 'b', name: 'caneca flamengo ', savedAt: '2026-11-20T10:00:00Z' },
      { id: 'c', name: 'Chaveiro', savedAt: '2026-11-10T10:00:00Z' },
    ])
    expect(g.map((x) => x.name)).toEqual(['caneca flamengo ', 'Chaveiro'])
    expect(g[0].history.map((x) => x.id)).toEqual(['b', 'a'])
  })
  it('não mistura Parte com Produto final de mesmo nome', () => {
    const g = groupVersions([
      { name: 'Base', kind: 'parte', savedAt: '2026-11-01T10:00:00Z' },
      { name: 'Base', kind: 'produto', savedAt: '2026-11-02T10:00:00Z' },
    ])
    expect(g).toHaveLength(2)
  })
})
