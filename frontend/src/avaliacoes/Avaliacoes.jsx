import { useEffect, useState } from 'react'
import { listarAvaliacoes } from '../api.js'
import { formatarPeriodo } from '../formatos.js'
import DetalheAvaliacao from './DetalheAvaliacao.jsx'
import FormAvaliacao from './FormAvaliacao.jsx'

function Avaliacoes({ usuario }) {
  const [avaliacoes, setAvaliacoes] = useState([])
  const [erro, setErro] = useState(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [aberta, setAberta] = useState(null)

  useEffect(() => {
    listarAvaliacoes()
      .then((dados) => setAvaliacoes(dados))
      .catch((e) => setErro(e.message))
  }, [])

  function aoSalvar(nova) {
    setAvaliacoes((atual) => [...atual, nova])
    setMostrarForm(false)
    setAberta(nova.idAvaliacao)
  }

  if (aberta) {
    return <DetalheAvaliacao idAvaliacao={aberta} onVoltar={() => setAberta(null)} />
  }

  const ordenadas = [...avaliacoes].sort((a, b) => b.dataInicio.localeCompare(a.dataInicio))

  return (
    <section>
      <div className="titulo-acao">
        <h2>Avaliações</h2>
        {!mostrarForm && (
          <button type="button" onClick={() => setMostrarForm(true)}>
            Nova avaliação
          </button>
        )}
      </div>

      {mostrarForm && <FormAvaliacao usuario={usuario} onSalva={aoSalvar} onCancelar={() => setMostrarForm(false)} />}

      {erro && <p className="erro">{erro}</p>}
      {!erro && ordenadas.length === 0 && <p>Nenhuma avaliação cadastrada.</p>}

      {ordenadas.length > 0 && (
        <div className="tabela">
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Data e horário</th>
                <th>Criada por</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {ordenadas.map((a) => (
                <tr key={a.idAvaliacao}>
                  <td>{a.titulo}</td>
                  <td>{formatarPeriodo(a.dataInicio, a.dataFim)}</td>
                  <td>{a.nomeCriador}</td>
                  <td>
                    <button type="button" className="secundario" onClick={() => setAberta(a.idAvaliacao)}>
                      Montar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default Avaliacoes
