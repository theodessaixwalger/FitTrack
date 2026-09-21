// Partagé entre le front et la fonction serveur /api/foods/barcode/:code :
// la même normalisation doit produire la même clé en base des deux côtés.

// Chiffres uniquement, complété à 13 avec des zéros à gauche (UPC-A 12 → EAN-13).
// La clé de contrôle n'est volontairement pas vérifiée : certains fabricants
// impriment des codes invalides qui existent quand même sur Open Food Facts.
// Retourne null si le code est inexploitable (vide, que des zéros, > 14 chiffres).
export function normalizeBarcode(input) {
  const digits = String(input ?? '').replace(/\D/g, '')
  if (!digits || /^0+$/.test(digits) || digits.length > 14) return null
  return digits.padStart(13, '0')
}

export const offProductUrl = (code) => `https://world.openfoodfacts.org/product/${code}`

export const NUTRISCORE_GRADES = ['a', 'b', 'c', 'd', 'e']
export const NOVA_GROUPS = [1, 2, 3, 4]
