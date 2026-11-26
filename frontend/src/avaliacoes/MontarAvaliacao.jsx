import { useEffect, useState } from 'react'
import { listarQuestoes, salvarQuestoesDaAvaliacao } from '../api.js'
import { formatarNumero } from '../formatos.js'
import { lerValor, montarItens, validarMontagem } from './validacao.js'

function itensIniciais(avaliacao) {
  return [...avaliacao.questoes]
    .sort((a, b) => a.ordem - b.ordem)
    .map((item) => ({
      idQuestao: item.idQuestao,
      valor: formatarNumero(item.valor).replace('.', ''),
      questao: item.questao,
    }))
}

function MontarAvaliacao({ avaliacao, onSalva }) {
  const [itens, setItens] = useState(() => itensIniciais(avaliacao))
  const [banco, setBanco] = useState([])
  const [escolhida, setEscolhida] = useState('')
  const [valorNovo, setValorNovo] = useState('1,0')
  const [erro, setErro] = useState(null)
  const [aviso, setAviso] = useState(null)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    listarQuestoes()
      .then((dados) => setBanco(dados))
      .catch((e) => setErro(e.message))
  }, [])

  const usadas = new Set(itens.map((i) => i.idQuestao))
  const disponiveis = banco.filter((q) => !usadas.has(q.idQuestao)).sort((a, b) => a.idQuestao - b.idQuestao)
  const total = itens.reduce((soma, i) => soma + (lerValor(i.valor) ?? 0), 0)

  function adicionar() {
    const questao = banco.find((q) => q.idQuestao === Number(escolhida))
    if (!questao) {
      setErro('Escolha uma questão para adicionar.')
      return
    }
    if (lerValor(valorNovo) === null) {
      setErro('O valor precisa ser um número maior que zero, com até 2 casas (ex.: 1,5).')
      return
    }
    setItens((atual) => [...atual, { idQuestao: questao.idQuestao, valor: valorNovo, questao }])
    setEscolhida('')
    setErro(null)
    setAviso(null)
  }

  function mover(indice, direcao) {
    setItens((atual) => {
      const novo = [...atual]
      const destino = indice + direcao
      ;[novo[indice], novo[destino]] = [novo[destino], novo[indice]]
      return novo
    })
    setAviso(null)
  }

  function remover(indice) {
    setItens((atual) => atual.filter((_, i) => i !== indice))
    setAviso(null)
  }

  function alterarValor(indice, valor) {
    setItens((atual) => atual.map((item, i) => (i === indice ? { ...item, valor } : item)))
    setAviso(null)
  }

  async function salvar() {
    const problema = validarMontagem(itens)
    if (problema) {
      setErro(problema)
      return
    }
    setErro(null)
    setSalvando(true)
    try {
      const atualizada = await salvarQuestoesDaAvaliacao(avaliacao.idAvaliacao, montarItens(itens))
      onSalva(atualizada)
      setAviso('Questões da avaliação salvas.')
    } catch (e) {
      setErro(e.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="cartao bloco">
      <h3>Questões da avaliação</h3>

      {itens.length === 0 && <p className="descricao">Nenhuma questão ainda. Escolha abaixo as questões do banco.</p>}

      {itens.length > 0 && (
        <div className="tabela">
          <table>
            <thead>
              <tr>
                <th className="num">Ordem</th>
                <th>Questão</th>
                <th className="num">Valor</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {itens.map((item, i) => (
                <tr key={item.idQuestao}>
                  <td className="num">{i + 1}</td>
                  <td>
                    <strong>Q{item.idQuestao}</strong> {item.questao ? item.questao.enunciado : ''}
                  </td>
                  <td className="num">
                    <input
                      type="text"
                      inputMode="decimal"
                      className="campo-valor"
                      value={item.valor}
                      onChange={(e) => alterarValor(i, e.target.value)}
                      aria-label={`Valor da questão ${i + 1}`}
                    />
                  </td>
                  <td className="botoes-linha">
                    <button type="button" className="secundario" onClick={() => mover(i, -1)} disabled={i === 0}>
                      Subir
                    </button>
                    <button
                      type="button"
                      className="secundario"
                      onClick={() => mover(i, 1)}
                      disabled={i === itens.length - 1}
                    >
                      Descer
                    </button>
                    <button type="button" className="secundario" onClick={() => remover(i)}>
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td></td>
                <td>
                  <strong>Total</strong>
                </td>
                <td className="num">
                  <strong>{formatarNumero(total)}</strong>
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <div className="filtros">
        <label>
          Questão{' '}
          <select value={escolhida} onChange={(e) => setEscolhida(e.target.value)}>
            <option value="">Escolha...</option>
            {disponiveis.map((q) => (
              <option key={q.idQuestao} value={q.idQuestao}>
                Q{q.idQuestao} - {q.enunciado.length > 70 ? `${q.enunciado.slice(0, 70)}...` : q.enunciado}
              </option>
            ))}
          </select>
        </label>
        <label>
          Valor{' '}
          <input
            type="text"
            inputMode="decimal"
            className="campo-valor"
            value={valorNovo}
            onChange={(e) => setValorNovo(e.target.value)}
          />
        </label>
        <button type="button" className="secundario" onClick={adicionar}>
          Adicionar
        </button>
      </div>

      {erro && <p className="erro">{erro}</p>}
      {aviso && <p className="ok">{aviso}</p>}

      <button type="button" onClick={salvar} disabled={salvando}>
        {salvando ? 'Salvando...' : 'Salvar questões'}
      </button>
    </div>
  )
}

export default MontarAvaliacao
