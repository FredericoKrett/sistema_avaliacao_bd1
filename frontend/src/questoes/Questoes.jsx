import { useEffect, useState } from 'react'
import { listarQuestoes } from '../api.js'
import FormQuestao from './FormQuestao.jsx'

function Questoes() {
  const [questoes, setQuestoes] = useState([])
  const [erro, setErro] = useState(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [aviso, setAviso] = useState(null)
  const [filtroTipo, setFiltroTipo] = useState('')
  const [busca, setBusca] = useState('')

  useEffect(() => {
    listarQuestoes()
      .then((dados) => setQuestoes(dados))
      .catch((e) => setErro(e.message))
  }, [])

  function aoSalvar(nova) {
    setQuestoes((atual) => [...atual, nova])
    setMostrarForm(false)
    setAviso(`Questão Q${nova.idQuestao} cadastrada.`)
  }

  function abrirForm() {
    setAviso(null)
    setMostrarForm(true)
  }

  const termo = busca.trim().toLowerCase()
  const visiveis = questoes
    .filter((q) => !filtroTipo || q.tipo === filtroTipo)
    .filter((q) => !termo || q.enunciado.toLowerCase().includes(termo))
    .sort((a, b) => b.idQuestao - a.idQuestao)

  return (
    <section>
      <div className="titulo-acao">
        <h2>Questões</h2>
        {!mostrarForm && (
          <button type="button" onClick={abrirForm}>
            Nova questão
          </button>
        )}
      </div>

      {mostrarForm && <FormQuestao onSalva={aoSalvar} onCancelar={() => setMostrarForm(false)} />}
      {aviso && <p className="ok">{aviso}</p>}

      <div className="filtros">
        <label>
          Tipo{' '}
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
            <option value="">Todos</option>
            <option value="MULTIPLA_ESCOLHA">Múltipla escolha</option>
            <option value="TEXTO_LIVRE">Texto livre</option>
          </select>
        </label>
        <label>
          Enunciado contém{' '}
          <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </label>
        <span className="descricao">
          {visiveis.length} de {questoes.length} questões
        </span>
      </div>

      {erro && <p className="erro">{erro}</p>}
      {!erro && visiveis.length === 0 && <p>Nenhuma questão encontrada.</p>}

      <ul className="lista-questoes">
        {visiveis.map((q) => (
          <li key={q.idQuestao} className="cartao">
            <div className="cabecalho-questao">
              <strong>Q{q.idQuestao}</strong>
              <span className="etiqueta">{q.tipo === 'TEXTO_LIVRE' ? 'Texto livre' : 'Múltipla escolha'}</span>
            </div>
            <p>{q.enunciado}</p>
            {q.alternativas.length > 0 && (
              <ol className="alternativas-lista">
                {q.alternativas.map((a) => (
                  <li key={a.idAlternativa} className={a.correta ? 'correta' : ''}>
                    {a.letra}) {a.texto}
                    {a.correta && <span className="etiqueta-correta">correta</span>}
                  </li>
                ))}
              </ol>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Questoes
