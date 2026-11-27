export function situacao(avaliacao, agora) {
  if (avaliacao.dataEntrega) return 'ENTREGUE'
  if (agora < avaliacao.dataInicio) return 'FUTURA'
  if (agora > avaliacao.dataFim) return 'ENCERRADA'
  return 'ABERTA'
}

export function montarRespostas(questoes, escolhas) {
  const respostas = []
  for (const q of questoes) {
    const escolha = escolhas[q.idQuestao]
    if (q.tipo === 'MULTIPLA_ESCOLHA' && escolha) {
      respostas.push({ idQuestao: q.idQuestao, idAlternativa: Number(escolha) })
    } else if (q.tipo === 'TEXTO_LIVRE' && escolha && escolha.trim()) {
      respostas.push({ idQuestao: q.idQuestao, textoResposta: escolha.trim() })
    }
  }
  return respostas
}

export function questoesSemResposta(questoes, escolhas) {
  const respondidas = new Set(montarRespostas(questoes, escolhas).map((r) => r.idQuestao))
  return questoes.filter((q) => !respondidas.has(q.idQuestao))
}
