import { describe, expect, it } from 'vitest'
import { fromHMS, toHMS } from './time'

describe('tempo h/min/s', () => {
  it('converte para horas decimais', () => {
    expect(fromHMS('0', '36', '34')).toBeCloseTo(36.5667 / 60, 4)
    expect(fromHMS('2', '30', '0')).toBe(2.5)
  })
  it('campo vazio vale zero', () => {
    expect(fromHMS('', '', '')).toBe(0)
    expect(fromHMS('1', '', '')).toBe(1)
  })
  it('texto inválido, negativo ou decimal vira NaN', () => {
    expect(fromHMS('a', '0', '0')).toBeNaN()
    expect(fromHMS('-1', '0', '0')).toBeNaN()
    expect(fromHMS('1,5', '0', '0')).toBeNaN()
  })
  it('minutos e segundos acima de 59 são somados', () => {
    expect(fromHMS('0', '90', '0')).toBe(1.5)
  })
  it('divide horas decimais em h/min/s', () => {
    expect(toHMS(2.5)).toEqual({ h: 2, m: 30, s: 0 })
    expect(toHMS(0)).toEqual({ h: 0, m: 0, s: 0 })
    expect(toHMS(NaN)).toEqual({ h: 0, m: 0, s: 0 })
  })
  it('ida e volta mantém os segundos', () => {
    const { h, m, s } = toHMS(fromHMS('1', '23', '45'))
    expect([h, m, s]).toEqual([1, 23, 45])
  })
})
