import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { listarAlunos, relatorioMediaPorAvaliacao } from '../api.js'
import CampoData from '../CampoData.jsx'
import { cores, formatarData, formatarNumero, tituloCurto } from '../formatos.js'

function RelatorioMedia() {
  const [inicio, setInicio] = useState('2026-09-01')
  const [fim, setFim] = useState('2026-12-31')
  const [turmasDisponiveis, setTurmasDisponiveis] = useState([])
  const [turmas, setTurmas] = useState([])
  const [linhas, setLinhas] = useState([])
  const [erro, setErro] = useState(null)

  useEffect(() => {
    listarAlunos()
      .then((alunos) => {
        const lista = [...new Set(alunos.map((a) => a.turma).filter(Boolean))].sort()
        setTurmasDisponiveis(lista)
        setTurmas(lista)
      })
      .catch((e) => setErro(e.message))
  }, [])

  useEffect(() => {
    if (!inicio || !fim || inicio > fim || turmas.length === 0) return
    relatorioMediaPorAvaliacao({ inicio, fim, turmas })
      .then((dados) => {
        setLinhas(dados)
        setErro(null)
      })
      .catch((e) => setErro(e.message))
  }, [inicio, fim, turmas])

  function alternarTurma(turma) {
    setTurmas((atual) =>
      atual.includes(turma) ? atual.filter((t) => t !== turma) : [...atual, turma].sort(),
    )
  }

  let problema = null
  if (!inicio || !fim) {
    problema = 'Preencha as duas datas no formato dia/mês/ano.'
  } else if (inicio > fim) {
    problema = 'A data inicial precisa ser antes da data final.'
  } else if (turmasDisponiveis.length > 0 && turmas.length === 0) {
    problema = 'Marque pelo menos uma turma.'
  }

  const visiveis = problema ? [] : linhas

  const grafico = visiveis.map((l) => ({
    nome: tituloCurto(l.titulo),
    menor: Number(l.menorNota),
    media: Number(l.mediaNotas),
    maior: Number(l.maiorNota),
  }))

  return (
    <div>
      <p className="descricao">
        Média, menor e maior nota total dos alunos que entregaram cada avaliação no período, considerando só as turmas
        marcadas. Respostas de texto livre ainda não corrigidas contam como zero.
      </p>
      <div className="filtros">
        <label htmlFor="inicio">De</label>
        <CampoData id="inicio" valor={inicio} onChange={setInicio} />
        <label htmlFor="fim">Até</label>
        <CampoData id="fim" valor={fim} onChange={setFim} />
        {turmasDisponiveis.map((turma) => (
          <label key={turma} className="opcao">
            <input type="checkbox" checked={turmas.includes(turma)} onChange={() => alternarTurma(turma)} />
            {turma}
          </label>
        ))}
      </div>

      {problema && <p className="erro">{problema}</p>}
      {!problema && erro && <p className="erro">{erro}</p>}
      {!problema && !erro && visiveis.length === 0 && <p>Nenhuma avaliação entregue nesse período e turmas.</p>}

      {visiveis.length > 0 && (
        <>
          <div className="grafico">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={grafico} barGap={2}>
                <CartesianGrid stroke={cores.grade} vertical={false} />
                <XAxis dataKey="nome" tick={{ fill: cores.eixo, fontSize: 12 }} />
                <YAxis tick={{ fill: cores.eixo, fontSize: 12 }} tickFormatter={(v) => formatarNumero(v, 0)} />
                <Tooltip formatter={(v) => formatarNumero(v)} />
                <Legend />
                <Bar dataKey="menor" name="Menor nota" fill={cores.serie2} radius={[4, 4, 0, 0]} />
                <Bar dataKey="media" name="Média" fill={cores.serie1} radius={[4, 4, 0, 0]} />
                <Bar dataKey="maior" name="Maior nota" fill={cores.serie3} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="tabela">
            <table>
              <thead>
                <tr>
                  <th>Avaliação</th>
                  <th>Data</th>
                  <th className="num">Entregaram</th>
                  <th className="num">Média</th>
                  <th className="num">Menor</th>
                  <th className="num">Maior</th>
                </tr>
              </thead>
              <tbody>
                {visiveis.map((l) => (
                  <tr key={l.idAvaliacao}>
                    <td>{l.titulo}</td>
                    <td>{formatarData(l.dataInicio)}</td>
                    <td className="num">{l.totalRespondentes}</td>
                    <td className="num">{formatarNumero(l.mediaNotas)}</td>
                    <td className="num">{formatarNumero(l.menorNota)}</td>
                    <td className="num">{formatarNumero(l.maiorNota)}</td>
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

export default RelatorioMedia
