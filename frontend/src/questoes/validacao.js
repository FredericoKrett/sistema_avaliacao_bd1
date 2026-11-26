export const LETRAS = ['A', 'B', 'C', 'D', 'E']

export function montarQuestao(enunciado, tipo, alternativas) {
  return {
    enunciado: enunciado.trim(),
    tipo,
    alternativas:
      tipo === 'MULTIPLA_ESCOLHA'
        ? alternativas.map((a, i) => ({ letra: LETRAS[i], texto: a.texto.trim(), correta: a.correta }))
        : [],
  }
}

export function validarQuestao(questao) {
  if (!questao.enunciado) {
    return 'Escreva o enunciado da questão.'
  }
  if (questao.tipo === 'TEXTO_LIVRE') {
    return null
  }
  if (questao.alternativas.length < 2) {
    return 'Uma questão de múltipla escolha precisa de pelo menos 2 alternativas.'
  }
  if (questao.alternativas.length > LETRAS.length) {
    return `Uma questão pode ter no máximo ${LETRAS.length} alternativas.`
  }
  const vazia = questao.alternativas.find((a) => !a.texto)
  if (vazia) {
    return `Preencha o texto da alternativa ${vazia.letra}.`
  }
  const corretas = questao.alternativas.filter((a) => a.correta).length
  if (corretas !== 1) {
    return 'Marque qual alternativa é a correta.'
  }
  return null
}
