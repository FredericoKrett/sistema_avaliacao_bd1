import { useEffect, useState } from 'react'
import Login from './Login.jsx'
import Menu from './Menu.jsx'
import { telasDoUsuario } from './telas.js'
import Relatorios from './relatorios/Relatorios.jsx'

function lerUsuarioSalvo() {
  try {
    return JSON.parse(sessionStorage.getItem('usuario'))
  } catch {
    return null
  }
}

function App() {
  const [usuario, setUsuario] = useState(lerUsuarioSalvo)
  const [tela, setTela] = useState(() => (usuario ? telasDoUsuario(usuario)[0].id : null))
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
    setTela(telasDoUsuario(usuarioLogado)[0].id)
  }

  function sair() {
    sessionStorage.removeItem('usuario')
    setUsuario(null)
    setTela(null)
  }

  const telaAberta = usuario ? telasDoUsuario(usuario).find((t) => t.id === tela) : null

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
      {usuario && (
        <>
          <Menu usuario={usuario} telaAtual={tela} onTrocar={setTela} />
          {tela === 'relatorios' && <Relatorios />}
          {telaAberta && tela !== 'relatorios' && (
            <section>
              <h2>{telaAberta.titulo}</h2>
              <p>Tela ainda não implementada.</p>
            </section>
          )}
        </>
      )}

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
