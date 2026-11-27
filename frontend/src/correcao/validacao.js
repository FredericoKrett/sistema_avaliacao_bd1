export function lerNota(texto, valorMaximo) {
  const limpo = String(texto).trim().replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(limpo)) return null
  const nota = Number(limpo)
  if (nota > Number(valorMaximo)) return null
  return nota
}
