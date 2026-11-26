import { useState } from 'react'
import { cadastrarQuestao } from '../api.js'
import { LETRAS, montarQuestao, validarQuestao } from './validacao.js'

function alternativasVazias() {
  return [0, 1, 2, 3].map(() => ({ texto: '', correta: false }))
}

function FormQuestao({ onSalva, onCancelar }) {
  const [enunciado, setEnunciado] = useState('')
  const [tipo, setTipo] = useState('MULTIPLA_ESCOLHA')
  const [alternativas, setAlternativas] = useState(alternativasVazias)
  const [erro, setErro] = useState(null)
  const [salvando, setSalvando] = useState(false)

  function alterarTexto(indice, texto) {
    setAlternativas((atual) => atual.map((a, i) => (i === indice ? { ...a, texto } : a)))
  }

  function marcarCorreta(indice) {
    setAlternativas((atual) => atual.map((a, i) => ({ ...a, correta: i === indice })))
  }

  function adicionar() {
    setAlternativas((atual) => [...atual, { texto: '', correta: false }])
  }

  function remover(indice) {
    setAlternativas((atual) => atual.filter((_, i) => i !== indice))
  }

  async function salvar(evento) {
    evento.preventDefault()
    const questao = montarQuestao(enunciado, tipo, alternativas)
    const problema = validarQuestao(questao)
    if (problema) {
      setErro(problema)
      return
    }
    setErro(null)
    setSalvando(true)
    try {
      const salva = await cadastrarQuestao(questao)
      onSalva(salva)
    } catch (e) {
      setErro(e.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form className="cartao formulario" onSubmit={salvar}>
      <h3>Nova questão</h3>

      <label htmlFor="enunciado">Enunciado</label>
      <textarea id="enunciado" rows={3} value={enunciado} onChange={(e) => setEnunciado(e.target.value)} />

      <label htmlFor="tipo">Tipo</label>
      <select id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
        <option value="MULTIPLA_ESCOLHA">Múltipla escolha</option>
        <option value="TEXTO_LIVRE">Texto livre</option>
      </select>

      {tipo === 'MULTIPLA_ESCOLHA' && (
        <fieldset className="alternativas">
          <legend>Alternativas (marque a correta)</legend>
          {alternativas.map((a, i) => (
            <div key={i} className="alternativa">
              <input
                type="radio"
                name="correta"
                id={`correta-${i}`}
                checked={a.correta}
                onChange={() => marcarCorreta(i)}
                aria-label={`Alternativa ${LETRAS[i]} é a correta`}
              />
              <label htmlFor={`texto-${i}`} className="letra">
                {LETRAS[i]})
              </label>
              <input id={`texto-${i}`} type="text" value={a.texto} onChange={(e) => alterarTexto(i, e.target.value)} />
              <button
                type="button"
                className="secundario"
                onClick={() => remover(i)}
                disabled={alternativas.length <= 2}
                aria-label={`Remover alternativa ${LETRAS[i]}`}
              >
                Remover
              </button>
            </div>
          ))}
          {alternativas.length < LETRAS.length && (
            <button type="button" className="secundario" onClick={adicionar}>
              Adicionar alternativa
            </button>
          )}
        </fieldset>
      )}

      {tipo === 'TEXTO_LIVRE' && (
        <p className="descricao">Questões de texto livre não têm alternativas. A nota é dada pelo professor na correção.</p>
      )}

      {erro && <p className="erro">{erro}</p>}

      <div className="acoes">
        <button type="submit" disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar questão'}
        </button>
        <button type="button" className="secundario" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default FormQuestao
