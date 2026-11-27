import { useEffect, useState } from 'react'
import { listarAvaliacoes, listarCorrecao, salvarNota } from '../api.js'
import { formatarNumero, formatarPeriodo } from '../formatos.js'
import { lerNota } from './validacao.js'

function Correcao() {
  const [avaliacoes, setAvaliacoes] = useState([])
  const [idAvaliacao, setIdAvaliacao] = useState('')
  const [respostas, setRespostas] = useState([])
  const [notas, setNotas] = useState({})
  const [erros, setErros] = useState({})
  const [erro, setErro] = useState(null)
  const [aviso, setAviso] = useState(null)
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    listarAvaliacoes()
      .then((dados) => setAvaliacoes([...dados].sort((a, b) => b.dataInicio.localeCompare(a.dataInicio))))
      .catch((e) => setErro(e.message))
  }, [])

  async function escolherAvaliacao(id) {
    setIdAvaliacao(id)
    setRespostas([])
    setNotas({})
    setErros({})
    setAviso(null)
    setErro(null)
    if (!id) return
    setCarregando(true)
    try {
      setRespostas(await listarCorrecao(id))
    } catch (e) {
      setErro(e.message)
    } finally {
      setCarregando(false)
    }
  }

  async function salvar(resposta) {
    const nota = lerNota(notas[resposta.idResposta] ?? '', resposta.valorQuestao)
    if (nota === null) {
      setErros((atual) => ({
        ...atual,
        [resposta.idResposta]: `A nota precisa ser um número de 0 a ${formatarNumero(resposta.valorQuestao)}.`,
      }))
      return
    }
    setErros((atual) => ({ ...atual, [resposta.idResposta]: null }))
    try {
      await salvarNota(resposta.idResposta, nota)
      setRespostas((atual) => atual.filter((r) => r.idResposta !== resposta.idResposta))
      setAviso(`Nota ${formatarNumero(nota)} salva para ${resposta.nomeUsuario}.`)
    } catch (e) {
      setErros((atual) => ({ ...atual, [resposta.idResposta]: e.message }))
    }
  }

  return (
    <section>
      <h2>Correção</h2>
      <p className="descricao">
        Respostas de texto livre que ainda estão sem nota. A nota vai de zero até o valor da questão na avaliação.
      </p>

      <div className="filtros">
        <label>
          Avaliação{' '}
          <select value={idAvaliacao} onChange={(e) => escolherAvaliacao(e.target.value)}>
            <option value="">Escolha...</option>
            {avaliacoes.map((a) => (
              <option key={a.idAvaliacao} value={a.idAvaliacao}>
                {a.titulo} ({formatarPeriodo(a.dataInicio, a.dataFim)})
              </option>
            ))}
          </select>
        </label>
      </div>

      {erro && <p className="erro">{erro}</p>}
      {aviso && <p className="ok">{aviso}</p>}
      {carregando && <p>Carregando...</p>}
      {idAvaliacao && !carregando && !erro && respostas.length === 0 && (
        <p>Nenhuma resposta de texto livre esperando correção nesta avaliação.</p>
      )}

      <ul className="lista-questoes">
        {respostas.map((r) => (
          <li key={r.idResposta} className="cartao">
            <div className="cabecalho-questao">
              <strong>{r.nomeUsuario}</strong>
              <span className="etiqueta">vale {formatarNumero(r.valorQuestao)}</span>
            </div>
            <p className="descricao">{r.enunciadoQuestao}</p>
            <blockquote className="resposta-aluno">{r.textoResposta}</blockquote>
            <div className="filtros">
              <label>
                Nota{' '}
                <input
                  type="text"
                  inputMode="decimal"
                  className="campo-valor"
                  value={notas[r.idResposta] ?? ''}
                  onChange={(e) => setNotas((atual) => ({ ...atual, [r.idResposta]: e.target.value }))}
                />
              </label>
              <button type="button" onClick={() => salvar(r)}>
                Salvar nota
              </button>
            </div>
            {erros[r.idResposta] && <p className="erro">{erros[r.idResposta]}</p>}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Correcao
