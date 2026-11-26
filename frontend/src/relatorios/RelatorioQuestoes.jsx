import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { relatorioQuestoesMaisErradas } from '../api.js'
import { cores, formatarNumero } from '../formatos.js'

function RelatorioQuestoes() {
  const [texto, setTexto] = useState('')
  const [busca, setBusca] = useState('')
  const [linhas, setLinhas] = useState([])
  const [erro, setErro] = useState(null)

  useEffect(() => {
    relatorioQuestoesMaisErradas(busca)
      .then((dados) => {
        setLinhas(dados)
        setErro(null)
      })
      .catch((e) => setErro(e.message))
  }, [busca])

  function buscar(evento) {
    evento.preventDefault()
    setBusca(texto.trim())
  }

  const grafico = linhas.map((l) => ({
    nome: `Q${l.idQuestao}`,
    enunciado: l.enunciado,
    percentual: Number(l.percentualErro),
  }))

  return (
    <div>
      <p className="descricao">
        As 10 questões com maior percentual de respostas erradas ou com nota parcial. Dá para filtrar por um trecho do
        enunciado.
      </p>
      <form className="filtros" onSubmit={buscar}>
        <label>
          Enunciado contém{' '}
          <input type="search" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="ex.: Brasil" />
        </label>
        <button type="submit">Buscar</button>
      </form>

      {erro && <p className="erro">{erro}</p>}
      {!erro && linhas.length === 0 && <p>Nenhuma questão respondida com esse trecho no enunciado.</p>}

      {linhas.length > 0 && (
        <>
          <div className="grafico">
            <ResponsiveContainer width="100%" height={Math.max(160, linhas.length * 34 + 40)}>
              <BarChart data={grafico} layout="vertical" margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={cores.grade} horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fill: cores.eixo, fontSize: 12 }}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis type="category" dataKey="nome" width={48} tick={{ fill: cores.eixo, fontSize: 12 }} />
                <Tooltip
                  formatter={(v) => [`${formatarNumero(v)}%`, 'Erro']}
                  labelFormatter={(_, itens) => itens?.[0]?.payload.enunciado ?? ''}
                />
                <Bar dataKey="percentual" name="Erro" fill={cores.serie1} radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="tabela">
            <table>
              <thead>
                <tr>
                  <th className="num">Posição</th>
                  <th>Questão</th>
                  <th>Tipo</th>
                  <th className="num">Respostas</th>
                  <th className="num">Erradas ou parciais</th>
                  <th className="num">Erro</th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((l) => (
                  <tr key={l.idQuestao}>
                    <td className="num">{l.posicao}º</td>
                    <td>
                      <strong>Q{l.idQuestao}</strong> {l.enunciado}
                    </td>
                    <td>{l.tipo === 'TEXTO_LIVRE' ? 'Texto livre' : 'Múltipla escolha'}</td>
                    <td className="num">{l.totalRespostas}</td>
                    <td className="num">{l.totalErrosOuParciais}</td>
                    <td className="num">{formatarNumero(l.percentualErro)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export default RelatorioQuestoes
