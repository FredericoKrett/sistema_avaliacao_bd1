async function chamar(url, opcoes, mensagemPadrao) {
  let resposta
  try {
    resposta = await fetch(url, opcoes)
  } catch {
    throw new Error('Não foi possível falar com o backend.')
  }
  const dados = await resposta.json().catch(() => ({}))
  if (!resposta.ok) {
    throw new Error(dados.erro || mensagemPadrao)
  }
  return dados
}

function buscar(url) {
  return chamar(url, undefined, 'Erro ao carregar os dados.')
}

function enviar(url, metodo, corpo) {
  return chamar(
    url,
    { method: metodo, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) },
    'Não foi possível salvar.',
  )
}

export function login(email, senha) {
  return enviar('/api/login', 'POST', { email, senha })
}

export function listarAlunos() {
  return buscar('/api/usuarios?papel=ALUNO')
}

export function listarQuestoes() {
  return buscar('/api/questoes')
}

export function cadastrarQuestao(questao) {
  return enviar('/api/questoes', 'POST', questao)
}

export function listarAvaliacoes() {
  return buscar('/api/avaliacoes')
}

export function buscarAvaliacao(idAvaliacao) {
  return buscar(`/api/avaliacoes/${idAvaliacao}`)
}

export function cadastrarAvaliacao(avaliacao) {
  return enviar('/api/avaliacoes', 'POST', avaliacao)
}

export function salvarQuestoesDaAvaliacao(idAvaliacao, itens) {
  return enviar(`/api/avaliacoes/${idAvaliacao}/questoes`, 'PUT', itens)
}

export function salvarAlunosDaAvaliacao(idAvaliacao, idsUsuarios) {
  return enviar(`/api/avaliacoes/${idAvaliacao}/usuarios`, 'PUT', idsUsuarios)
}

export function listarAvaliacoesDoAluno(idUsuario) {
  return buscar(`/api/alunos/${idUsuario}/avaliacoes`)
}

export async function buscarProva(idAvaliacao, idAluno) {
  const prova = await buscar(`/api/avaliacoes/${idAvaliacao}/prova?idAluno=${encodeURIComponent(idAluno)}`)
  return {
    ...prova,
    questoes: prova.questoes.map((item) => ({
      idQuestao: item.idQuestao,
      ordem: item.ordem,
      valor: item.valor,
      enunciado: item.questao.enunciado,
      tipo: item.questao.tipo,
      alternativas: item.questao.alternativas,
    })),
  }
}

export function enviarRespostas(idAvaliacao, idUsuario, respostas) {
  return enviar(`/api/avaliacoes/${idAvaliacao}/respostas`, 'POST', { idUsuario, respostas })
}

export function listarCorrecao(idAvaliacao) {
  return buscar(`/api/avaliacoes/${idAvaliacao}/correcao`)
}

export function salvarNota(idResposta, notaObtida) {
  return enviar(`/api/respostas/${idResposta}/nota`, 'PUT', { notaObtida })
}

export function relatorioMediaPorAvaliacao({ inicio, fim, turmas }) {
  const params = new URLSearchParams()
  if (inicio) params.set('inicio', inicio)
  if (fim) params.set('fim', fim)
  if (turmas.length > 0) params.set('turmas', turmas.join(','))
  return buscar(`/api/relatorios/1?${params}`)
}

export function relatorioEvolucaoAluno(idUsuario) {
  return buscar(`/api/relatorios/2?idUsuario=${encodeURIComponent(idUsuario)}`)
}

export function relatorioQuestoesMaisErradas(busca) {
  const params = new URLSearchParams()
  if (busca) params.set('busca', busca)
  return buscar(`/api/relatorios/3?${params}`)
}

export function relatorioPendentes(idAvaliacao) {
  const params = new URLSearchParams()
  if (idAvaliacao) params.set('idAvaliacao', idAvaliacao)
  return buscar(`/api/relatorios/4?${params}`)
}
