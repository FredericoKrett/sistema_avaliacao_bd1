import { useEffect, useState } from 'react'

function App() {
  const [health, setHealth] = useState(null)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    fetch('/api/health')
      .then((resposta) => resposta.json())
      .then((dados) => setHealth(dados))
      .catch(() => setErro('Não foi possível falar com o backend. Ele está rodando na porta 8080?'))
  }, [])

  return (
    <main>
      <h1>Sistema de Avaliações</h1>
      {erro && <p className="erro">{erro}</p>}
      {!erro && !health && <p>Verificando conexão...</p>}
      {health && (
        <p className={health.status === 'ok' ? 'ok' : 'erro'}>
          Backend: {health.status} | Banco: {health.banco}
        </p>
      )}
    </main>
  )
}

export default App
