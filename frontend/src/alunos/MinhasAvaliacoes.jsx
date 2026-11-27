import { useEffect, useState } from 'react'
import { listarAvaliacoesDoAluno } from '../api.js'
import { agoraIso, formatarDataHora, formatarNumero, formatarPeriodo } from '../formatos.js'
import Prova from './Prova.jsx'
import { situacao } from './situacao.js'

const textoSituacao = {
  ABERTA: 'Aberta',
  FUTURA: 'Ainda não começou',
  ENCERRADA: 'Encerrada sem entrega',
  ENTREGUE: 'Entregue',
}

function MinhasAvaliacoes({ usuario }) {
  const [avaliacoes, setAvaliacoes] = useState([])
  const [erro, setErro] = useState(null)
  const [aberta, setAberta] = useState(null)
  const [versao, setVersao] = useState(0)

  useEffect(() => {
    listarAvaliacoesDoAluno(usuario.idUsuario)
      .then((dados) => setAvaliacoes(dados))
      .catch((e) => setErro(e.message))
  }, [usuario.idUsuario, versao])

  function voltar() {
    setAberta(null)
    setVersao((v) => v + 1)
  }

  if (aberta) {
    return <Prova idAvaliacao={aberta} usuario={usuario} onVoltar={voltar} />
  }

  const agora = agoraIso()
  const ordenadas = [...avaliacoes].sort((a, b) => b.dataInicio.localeCompare(a.dataInicio))

  return (
    <section>
      <h2>Minhas avaliações</h2>

      {erro && <p className="erro">{erro}</p>}
      {!erro && ordenadas.length === 0 && <p>Você ainda não tem avaliações.</p>}

      {ordenadas.length > 0 && (
        <div className="tabela">
          <table>
            <thead>
              <tr>
                <th>Avaliação</th>
                <th>Data e horário</th>
                <th>Situação</th>
                <th className="num">Nota</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {ordenadas.map((a) => {
                const estado = situacao(a, agora)
                return (
                  <tr key={a.idAvaliacao}>
                    <td>{a.tituloAvaliacao}</td>
                    <td>{formatarPeriodo(a.dataInicio, a.dataFim)}</td>
                    <td>
                      <span className={`situacao situacao-${estado.toLowerCase()}`}>{textoSituacao[estado]}</span>
                      {estado === 'ENTREGUE' && <div className="descricao">em {formatarDataHora(a.dataEntrega)}</div>}
                    </td>
                    <td className="num">{estado === 'ENTREGUE' ? formatarNumero(a.notaTotal) : '-'}</td>
                    <td>
                      {estado === 'ABERTA' && (
                        <button type="button" onClick={() => setAberta(a.idAvaliacao)}>
                          Responder
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="descricao">
        A nota mostra o que já foi corrigido. Questões de texto livre entram na nota depois da correção do professor.
      </p>
    </section>
  )
}

export default MinhasAvaliacoes
