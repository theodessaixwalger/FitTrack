import { describe, expect, it } from 'vitest'
import { normalizeBarcode } from './barcode.js'

describe('normalizeBarcode', () => {
  it('garde un EAN-13 tel quel', () => {
    expect(normalizeBarcode('3274080005003')).toBe('3274080005003')
  })

  it('complète à 13 chiffres avec des zéros à gauche', () => {
    expect(normalizeBarcode('96385074')).toBe('0000096385074') // EAN-8
    expect(normalizeBarcode('036000291452')).toBe('0036000291452') // UPC-A
  })

  it('ne garde que les chiffres', () => {
    expect(normalizeBarcode(' 3 274080-005003\n')).toBe('3274080005003')
  })

  it("n'invalide pas un code dont la clé de contrôle est fausse", () => {
    expect(normalizeBarcode('3274080005004')).toBe('3274080005004')
  })

  it('accepte un GTIN-14', () => {
    expect(normalizeBarcode('13274080005000')).toBe('13274080005000')
  })

  it('rejette les codes inexploitables', () => {
    expect(normalizeBarcode('')).toBeNull()
    expect(normalizeBarcode(null)).toBeNull()
    expect(normalizeBarcode('abc')).toBeNull()
    expect(normalizeBarcode('0000')).toBeNull()
    expect(normalizeBarcode('123456789012345')).toBeNull()
  })
})
