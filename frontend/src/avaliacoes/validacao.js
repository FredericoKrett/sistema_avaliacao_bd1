export function montarAvaliacao({ titulo, descricao, data, horaInicio, horaFim, idCriador }) {
  return {
    titulo: titulo.trim(),
    descricao: descricao.trim(),
    dataInicio: `${data}T${horaInicio}:00`,
    dataFim: `${data}T${horaFim}:00`,
    idCriador,
  }
}

export function validarAvaliacao({ titulo, data, horaInicio, horaFim }) {
  if (!titulo.trim()) {
    return 'Escreva o título da avaliação.'
  }
  if (titulo.trim().length > 150) {
    return 'O título pode ter no máximo 150 caracteres.'
  }
  if (!data) {
    return 'Preencha a data no formato dd/mm/aaaa.'
  }
  if (!horaInicio) {
    return 'Preencha o horário de início no formato hh:mm.'
  }
  if (!horaFim) {
    return 'Preencha o horário de término no formato hh:mm.'
  }
  if (horaFim <= horaInicio) {
    return 'O horário de término precisa ser depois do início.'
  }
  return null
}

export function lerValor(texto) {
  const limpo = String(texto).trim().replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(limpo)) return null
  const valor = Number(limpo)
  if (valor <= 0 || valor > 999.99) return null
  return valor
}

export function validarMontagem(itens) {
  if (itens.length === 0) {
    return 'Adicione pelo menos uma questão.'
  }
  const invalido = itens.findIndex((item) => lerValor(item.valor) === null)
  if (invalido >= 0) {
    return `O valor da questão ${invalido + 1} precisa ser um número maior que zero, com até 2 casas (ex.: 1,5).`
  }
  return null
}

export function montarItens(itens) {
  return itens.map((item, i) => ({ idQuestao: item.idQuestao, ordem: i + 1, valor: lerValor(item.valor) }))
}
