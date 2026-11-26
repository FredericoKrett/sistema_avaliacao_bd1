import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { relatorioPendentes } from '../api.js'
import { cores, tituloCurto } from '../formatos.js'

function RelatorioPendentes() {
  const [idAvaliacao, setIdAvaliacao] = useState('')
  const [pendentes, setPendentes] = useState([])
  const [resumo, setResumo] = useState([])
  const [erro, setErro] = useState(null)

  useEffect(() => {
    relatorioPendentes(idAvaliacao)
      .then((dados) => {
        setPendentes(dados.pendentes)
        setResumo(dados.resumo)
        setErro(null)
      })
      .catch((e) => setErro(e.message))
  }, [idAvaliacao])

  const grafico = resumo.map((r) => ({
    nome: tituloCurto(r.titulo),
    entregues: r.totalEntregues,
    pendentes: r.totalPendentes,
  }))

  return (
    <div>
      <p className="descricao">
        Quantos alunos atribuídos já entregaram cada avaliação e quem ainda não respondeu.
      </p>

      {erro && <p className="erro">{erro}</p>}

      {resumo.length > 0 && (
        <div className="grafico">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={grafico}>
              <CartesianGrid stroke={cores.grade} vertical={false} />
              <XAxis dataKey="nome" tick={{ fill: cores.eixo, fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fill: cores.eixo, fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="entregues" name="Entregaram" stackId="total" fill={cores.serie1} stroke="#fff" strokeWidth={2} />
              <Bar
                dataKey="pendentes"
                name="Pendentes"
                stackId="total"
                fill={cores.serie2}
                stroke="#fff"
                strokeWidth={2}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="filtros">
        <label>
          Pendentes da avaliação{' '}
          <select value={idAvaliacao} onChange={(e) => setIdAvaliacao(e.target.value)}>
            <option value="">Todas</option>
            {resumo.map((r) => (
              <option key={r.idAvaliacao} value={r.idAvaliacao}>
                {r.titulo}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!erro && pendentes.length === 0 && <p>Ninguém pendente.</p>}

      {pendentes.length > 0 && (
        <div className="tabela">
          <table>
            <thead>
              <tr>
                <th>Avaliação</th>
                <th>Aluno</th>
                <th>Turma</th>
                <th className="num">Questões respondidas</th>
              </tr>
            </thead>
            <tbody>
              {pendentes.map((p) => (
                <tr key={`${p.idAvaliacao}-${p.idUsuario}`}>
                  <td>{tituloCurto(p.titulo)}</td>
                  <td>{p.aluno}</td>
                  <td>{p.turma}</td>
                  <td className="num">{p.questoesRespondidas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default RelatorioPendentes
