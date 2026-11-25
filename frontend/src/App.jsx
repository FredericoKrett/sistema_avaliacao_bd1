import { useEffect, useState } from 'react'
import Login from './Login.jsx'

function lerUsuarioSalvo() {
  try {
    return JSON.parse(sessionStorage.getItem('usuario'))
  } catch {
    return null
  }
}

function App() {
  const [usuario, setUsuario] = useState(lerUsuarioSalvo)
  const [health, setHealth] = useState(null)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    fetch('/api/health')
      .then((resposta) => resposta.json())
      .then((dados) => setHealth(dados))
      .catch(() => setErro('Não foi possível falar com o backend. Ele está rodando na porta 8080?'))
  }, [])

  function entrar(usuarioLogado) {
    sessionStorage.setItem('usuario', JSON.stringify(usuarioLogado))
    setUsuario(usuarioLogado)
  }

  function sair() {
    sessionStorage.removeItem('usuario')
    setUsuario(null)
  }

  return (
    <main>
      <header className="topo">
        <h1>Sistema de Avaliações</h1>
        {usuario && (
          <div className="usuario">
            <span>
              {usuario.nome} ({usuario.papel === 'PROFESSOR' ? 'professor' : 'aluno'})
            </span>
            <button type="button" onClick={sair}>Sair</button>
          </div>
        )}
      </header>

      {!usuario && <Login onEntrar={entrar} />}
      {usuario && <p>Bem-vindo, {usuario.nome.split(' ')[0]}.</p>}

      <footer className="status">
        {erro && <span className="erro">{erro}</span>}
        {!erro && !health && <span>Verificando conexão...</span>}
        {health && (
          <span className={health.status === 'ok' ? 'ok' : 'erro'}>
            Backend: {health.status} | Banco: {health.banco}
          </span>
        )}
      </footer>
    </main>
  )
}

export default App
