export const cores = {
  serie1: '#257de0',
  serie2: '#f47230',
  serie3: '#00b894',
  grade: '#e3e6e8',
  eixo: '#666666',
}

export function formatarNumero(valor, casas = 2) {
  if (valor === null || valor === undefined) return '-'
  return Number(valor).toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  })
}

export function isoParaBr(iso) {
  if (!iso) return ''
  const [data] = iso.split('T')
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

export function formatarData(iso) {
  return iso ? isoParaBr(iso) : '-'
}

export function tituloCurto(titulo) {
  return titulo.split(' - ')[0]
}

export function brParaIso(texto) {
  const partes = texto.split('/')
  if (partes.length !== 3 || partes[2].length !== 4) return null
  const [dia, mes, ano] = partes.map(Number)
  const data = new Date(ano, mes - 1, dia)
  if (data.getFullYear() !== ano || data.getMonth() !== mes - 1 || data.getDate() !== dia) return null
  return `${partes[2]}-${partes[1]}-${partes[0]}`
}

export function mascararData(texto) {
  const digitos = texto.replace(/\D/g, '').slice(0, 8)
  if (digitos.length <= 2) return digitos
  if (digitos.length <= 4) return `${digitos.slice(0, 2)}/${digitos.slice(2)}`
  return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`
}

export function mascararHora(texto) {
  const digitos = texto.replace(/\D/g, '').slice(0, 4)
  if (digitos.length <= 2) return digitos
  return `${digitos.slice(0, 2)}:${digitos.slice(2)}`
}

export function horaValida(texto) {
  const partes = /^(\d{2}):(\d{2})$/.exec(texto)
  if (!partes) return null
  const hora = Number(partes[1])
  const minuto = Number(partes[2])
  if (hora > 23 || minuto > 59) return null
  return texto
}

export function formatarDataHora(iso) {
  if (!iso) return '-'
  const [, hora] = iso.split('T')
  return `${isoParaBr(iso)} ${hora.slice(0, 5)}`
}

export function formatarPeriodo(inicio, fim) {
  if (!inicio || !fim) return '-'
  if (inicio.slice(0, 10) === fim.slice(0, 10)) {
    return `${isoParaBr(inicio)}, das ${inicio.slice(11, 16)} às ${fim.slice(11, 16)}`
  }
  return `${formatarDataHora(inicio)} até ${formatarDataHora(fim)}`
}
