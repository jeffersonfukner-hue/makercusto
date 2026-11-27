import { describe, expect, it } from 'vitest'
import { colorName, nameFromFile, namesFromFile, parseDuration, parseGcode } from './gcode'

// Gcode mínimo com 2 cores: T0 preto (peça), troca para T1 vermelho com purga em macro e torre.
const sample = [
  '; filament_density: 1.24,1.24', '; filament_diameter: 1.75,1.75',
  '; paint_info = [{"material_type":"PLA","paint_color":[0,0,0],"paint_index":0},{"material_type":"PLA","paint_color":[255,0,0],"paint_index":1}]',
  'M83', 'T0', ';TYPE:Outer wall', 'G1 X1 Y1 E100', 'G1 E-2', 'G1 E2',
  ';TYPE:Prime tower', 'G1 X2 Y2 E10',
  '; FLUSH_START', 'T1', ';;; G1 E50', ';;; G1 E-5', '; FLUSH_END',
  ';TYPE:Inner wall', 'G1 X3 Y3 E50',
  '; used_filament = 0.3', '; print_time = 1h 2m 3s',
].join('\n')

describe('gcode', () => {
  it('lê tempo, cores, peça e torre por cor, e a purga pela diferença do total', () => {
    const r = parseGcode(sample, 'escudo_plate_04__PLA_0.2_25m47s.gcode')!
    expect(r.hours).toBeCloseTo(1 + 2 / 60 + 3 / 3600, 5)
    expect(r.tools.map((t) => t.name)).toEqual(['Preto', 'Vermelho'])
    const k = (Math.PI * 0.875 ** 2) / 1000 * 1.24 // g por mm de filamento
    expect(r.tools[0].modelG).toBeCloseTo(100 * k, 1)
    expect(r.tools[0].towerG).toBeCloseTo(10 * k, 1)
    expect(r.tools[1].modelG).toBeCloseTo(50 * k, 1)
    expect(r.totalG).toBeCloseTo(300 * k, 1)
    expect(r.tools[0].purgeG + r.tools[1].purgeG).toBeCloseTo(140 * k, 1) // 300 - 160 de extrusão normal
    expect(r.tools[0].purgeG).toBe(0) // a purga vai toda para a cor que entrou
    expect(r.purgeIsEstimate).toBe(true)
    expect(r.name).toBe('Escudo')
  })
  it('arquivo sem extrusão não é gcode fatiado', () => {
    expect(parseGcode('; nada\nG28\n')).toBeNull()
  })
  it('detalhes: duração, nome do arquivo, nome da cor', () => {
    expect(parseDuration('4h 24m 22s')).toBeCloseTo(4.4061, 3)
    expect(parseDuration('25m 47s')).toBeCloseTo(0.4297, 3)
    expect(nameFromFile('45d42da0-1127-1553-base_plate01_PLA_0.2_4h24m22s.gcode')).toBe('Base')
    expect(namesFromFile('1127-1613-Caneca Flamengo - Base(01) PLA 0.2 4H24m22s.gcode')).toEqual({ product: 'Caneca Flamengo', part: 'Base' })
    expect(namesFromFile('1127-1614-Caneca Flamengo - Aro(03) PLA 0.2 46M47s.gcode').part).toBe('Aro')
    expect(colorName('#FF0000')).toBe('Vermelho')
    expect(colorName('#FEFEFE')).toBe('Branco')
  })
})
