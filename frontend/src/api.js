import { usuariosMock } from './mock.js'

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
