import { useEffect, useState } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { listarAlunos, relatorioEvolucaoAluno } from '../api.js'
import { cores, formatarData, formatarNumero, tituloCurto } from '../formatos.js'

function RelatorioEvolucao() {
  const [alunos, setAlunos] = useState([])
  const [idUsuario, setIdUsuario] = useState('')
  const [linhas, setLinhas] = useState([])
  const [erro, setErro] = useState(null)

  useEffect(() => {
    listarAlunos()
      .then((lista) => {
        const ordenados = [...lista].sort((a, b) => a.nome.localeCompare(b.nome))
        setAlunos(ordenados)
        if (ordenados.length > 0) setIdUsuario(String(ordenados[0].idUsuario))
      })
      .catch((e) => setErro(e.message))
  }, [])

  useEffect(() => {
    if (!idUsuario) return
    relatorioEvolucaoAluno(idUsuario)
      .then((dados) => {
        setLinhas(dados)
        setErro(null)
      })
      .catch((e) => setErro(e.message))
  }, [idUsuario])

  const grafico = linhas.map((l) => ({
    nome: tituloCurto(l.titulo),
    aluno: Number(l.notaAluno),
    turma: Number(l.mediaTurma),
  }))

  return (
    <div>
      <p className="descricao">
        Nota total do aluno em cada avaliação que ele respondeu, comparada com a média da turma dele na mesma avaliação.
        Respostas de texto livre ainda não corrigidas contam como zero.
      </p>
      <div className="filtros">
        <label>
          Aluno{' '}
          <select value={idUsuario} onChange={(e) => setIdUsuario(e.target.value)}>
            {alunos.map((a) => (
              <option key={a.idUsuario} value={a.idUsuario}>
                {a.nome} ({a.turma})
              </option>
            ))}
          </select>
        </label>
      </div>

      {erro && <p className="erro">{erro}</p>}
      {!erro && idUsuario && linhas.length === 0 && <p>Esse aluno ainda não respondeu nenhuma avaliação.</p>}

      {linhas.length > 0 && (
        <>
          <div className="grafico">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={grafico} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={cores.grade} vertical={false} />
                <XAxis dataKey="nome" tick={{ fill: cores.eixo, fontSize: 12 }} />
                <YAxis tick={{ fill: cores.eixo, fontSize: 12 }} tickFormatter={(v) => formatarNumero(v, 0)} />
                <Tooltip formatter={(v) => formatarNumero(v)} />
                <Legend />
                <Line type="monotone" dataKey="aluno" name="Nota do aluno" stroke={cores.serie1} strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="turma" name="Média da turma" stroke={cores.serie2} strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="tabela">
            <table>
              <thead>
                <tr>
                  <th>Avaliação</th>
                  <th>Data</th>
                  <th className="num">Nota do aluno</th>
                  <th className="num">Média da turma</th>
                  <th className="num">Diferença</th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((l) => {
                  const diferenca = Number(l.notaAluno) - Number(l.mediaTurma)
                  return (
                    <tr key={l.idAvaliacao}>
                      <td>{l.titulo}</td>
                      <td>{formatarData(l.dataInicio)}</td>
                      <td className="num">{formatarNumero(l.notaAluno)}</td>
                      <td className="num">{formatarNumero(l.mediaTurma)}</td>
                      <td className="num">
                        {diferenca > 0 ? '+' : ''}
                        {formatarNumero(diferenca)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export default RelatorioEvolucao
