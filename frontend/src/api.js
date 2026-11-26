import { avaliacoesMock, questoesMock, usuariosMock } from './mock.js'

function loginMock(email, senha) {
  const usuario = usuariosMock.find((u) => u.email === email && u.senha === senha)
  if (!usuario) {
    throw new Error('E-mail ou senha incorretos.')
  }
  const { senha: _, ...semSenha } = usuario
  return semSenha
}

export async function login(email, senha) {
  let resposta
  try {
    resposta = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    })
  } catch {
    throw new Error('Não foi possível falar com o backend.')
  }

  if (resposta.status === 404) {
    return loginMock(email, senha)
  }

  const dados = await resposta.json().catch(() => ({}))
  if (resposta.status === 401) {
    throw new Error(dados.erro || 'E-mail ou senha incorretos.')
  }
  if (!resposta.ok) {
    throw new Error(dados.erro || 'Não foi possível falar com o backend.')
  }
  return dados
}

async function buscar(url, mock) {
  let resposta
  try {
    resposta = await fetch(url)
  } catch {
    throw new Error('Não foi possível falar com o backend.')
  }
  if (resposta.status === 404 && mock) {
    return mock()
  }
  const dados = await resposta.json().catch(() => ({}))
  if (!resposta.ok) {
    throw new Error(dados.erro || 'Erro ao carregar os dados.')
  }
  return dados
}

async function enviar(url, metodo, corpo, mock) {
  let resposta
  try {
    resposta = await fetch(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
    })
  } catch {
    throw new Error('Não foi possível falar com o backend.')
  }
  if (resposta.status === 404 && mock) {
    return mock()
  }
  const dados = await resposta.json().catch(() => ({}))
  if (!resposta.ok) {
    throw new Error(dados.erro || 'Não foi possível salvar.')
  }
  return dados
}

export function listarQuestoes() {
  return buscar('/api/questoes', () => structuredClone(questoesMock))
}

export function cadastrarQuestao(questao) {
  return enviar('/api/questoes', 'POST', questao, () => {
    const idQuestao = Math.max(0, ...questoesMock.map((q) => q.idQuestao)) + 1
    const ultimaAlternativa = Math.max(0, ...questoesMock.flatMap((q) => q.alternativas.map((a) => a.idAlternativa)))
    const nova = {
      idQuestao,
      enunciado: questao.enunciado,
      tipo: questao.tipo,
      alternativas: questao.alternativas.map((a, i) => ({ ...a, idAlternativa: ultimaAlternativa + i + 1, idQuestao })),
    }
    questoesMock.push(nova)
    return structuredClone(nova)
  })
}

function avaliacaoMock(idAvaliacao) {
  const avaliacao = avaliacoesMock.find((a) => a.idAvaliacao === Number(idAvaliacao))
  if (!avaliacao) {
    throw new Error('Avaliação não encontrada.')
  }
  return avaliacao
}

function detalheMock(avaliacao) {
  return structuredClone({
    ...avaliacao,
    questoes: avaliacao.questoes.map((item) => ({
      ...item,
      questao: questoesMock.find((q) => q.idQuestao === item.idQuestao),
    })),
  })
}

export function listarAvaliacoes() {
  return buscar('/api/avaliacoes', () =>
    avaliacoesMock.map((a) => {
      const { questoes: _, usuarios: __, ...resumo } = a
      return structuredClone(resumo)
    }),
  )
}

export function buscarAvaliacao(idAvaliacao) {
  return buscar(`/api/avaliacoes/${idAvaliacao}`, () => detalheMock(avaliacaoMock(idAvaliacao)))
}

export function cadastrarAvaliacao(avaliacao) {
  return enviar('/api/avaliacoes', 'POST', avaliacao, () => {
    const criador = usuariosMock.find((u) => u.idUsuario === avaliacao.idCriador)
    const nova = {
      ...avaliacao,
      idAvaliacao: Math.max(0, ...avaliacoesMock.map((a) => a.idAvaliacao)) + 1,
      nomeCriador: criador ? criador.nome : '',
      questoes: [],
      usuarios: [],
    }
    avaliacoesMock.push(nova)
    return detalheMock(nova)
  })
}

export function salvarQuestoesDaAvaliacao(idAvaliacao, itens) {
  return enviar(`/api/avaliacoes/${idAvaliacao}/questoes`, 'PUT', itens, () => {
    const avaliacao = avaliacaoMock(idAvaliacao)
    avaliacao.questoes = structuredClone(itens)
    return detalheMock(avaliacao)
  })
}

export function salvarAlunosDaAvaliacao(idAvaliacao, idsUsuarios) {
  return enviar(`/api/avaliacoes/${idAvaliacao}/usuarios`, 'PUT', idsUsuarios, () => {
    const avaliacao = avaliacaoMock(idAvaliacao)
    avaliacao.usuarios = [...idsUsuarios]
    return [...avaliacao.usuarios]
  })
}

export function listarAlunos() {
  return buscar('/api/usuarios?papel=ALUNO', () =>
    usuariosMock
      .filter((u) => u.papel === 'ALUNO')
      .map((u) => {
        const { senha: _, ...semSenha } = u
        return semSenha
      }),
  )
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
