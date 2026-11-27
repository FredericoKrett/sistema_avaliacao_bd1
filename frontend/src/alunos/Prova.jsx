import { useEffect, useState } from 'react'
import { buscarProva, enviarRespostas } from '../api.js'
import { formatarDataHora, formatarNumero } from '../formatos.js'
import { montarRespostas, questoesSemResposta } from './situacao.js'

function Prova({ idAvaliacao, usuario, onVoltar }) {
  const [prova, setProva] = useState(null)
  const [erro, setErro] = useState(null)
  const [escolhas, setEscolhas] = useState({})
  const [confirmando, setConfirmando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState(null)

  useEffect(() => {
    buscarProva(idAvaliacao, usuario.idUsuario)
      .then((dados) => setProva(dados))
      .catch((e) => setErro(e.message))
  }, [idAvaliacao, usuario.idUsuario])

  function escolher(idQuestao, valor) {
    setEscolhas((atual) => ({ ...atual, [idQuestao]: valor }))
    setConfirmando(false)
  }

  async function enviar() {
    setEnviando(true)
    setErro(null)
    try {
      const dados = await enviarRespostas(idAvaliacao, usuario.idUsuario, montarRespostas(prova.questoes, escolhas))
      setResultado(dados)
    } catch (e) {
      setErro(e.message)
      setConfirmando(false)
    } finally {
      setEnviando(false)
    }
  }

  if (resultado) {
    return (
      <section>
        <h2>{prova.titulo}</h2>
        <div className="cartao bloco">
          <p className="ok">Respostas enviadas.</p>
          <p>
            Nota nas questões de múltipla escolha: <strong>{formatarNumero(resultado.notaObjetivas)}</strong>
          </p>
          {resultado.pendentesCorrecao > 0 && (
            <p>{resultado.pendentesCorrecao} questão(ões) de texto livre aguardam a correção do professor.</p>
          )}
          <button type="button" onClick={onVoltar}>
            Voltar para minhas avaliações
          </button>
        </div>
      </section>
    )
  }

  const semResposta = prova ? questoesSemResposta(prova.questoes, escolhas) : []

  return (
    <section>
      <button type="button" className="secundario" onClick={onVoltar}>
        Voltar para minhas avaliações
      </button>

      {erro && <p className="erro">{erro}</p>}
      {!erro && !prova && <p>Carregando...</p>}

      {prova && (
        <>
          <h2>{prova.titulo}</h2>
          <p className="descricao">Pode responder até {formatarDataHora(prova.dataFim)}.</p>

          <ol className="prova">
            {prova.questoes.map((q) => (
              <li key={q.idQuestao} className="cartao">
                <div className="cabecalho-questao">
                  <strong>Questão {q.ordem}</strong>
                  <span className="etiqueta">vale {formatarNumero(q.valor)}</span>
                </div>
                <p>{q.enunciado}</p>
                {q.tipo === 'MULTIPLA_ESCOLHA' ? (
                  <div className="opcoes-prova">
                    {q.alternativas.map((a) => (
                      <label key={a.idAlternativa} className="opcao">
                        <input
                          type="radio"
                          name={`questao-${q.idQuestao}`}
                          value={a.idAlternativa}
                          checked={String(escolhas[q.idQuestao]) === String(a.idAlternativa)}
                          onChange={() => escolher(q.idQuestao, a.idAlternativa)}
                        />
                        {a.letra}) {a.texto}
                      </label>
                    ))}
                  </div>
                ) : (
                  <textarea
                    rows={4}
                    aria-label={`Resposta da questão ${q.ordem}`}
                    value={escolhas[q.idQuestao] || ''}
                    onChange={(e) => escolher(q.idQuestao, e.target.value)}
                  />
                )}
              </li>
            ))}
          </ol>

          {!confirmando && (
            <button type="button" onClick={() => setConfirmando(true)}>
              Enviar respostas
            </button>
          )}

          {confirmando && (
            <div className="cartao confirmacao">
              {semResposta.length > 0 ? (
                <p>
                  Você deixou {semResposta.length} questão(ões) sem resposta (
                  {semResposta.map((q) => q.ordem).join(', ')}). Elas vão valer zero.
                </p>
              ) : (
                <p>Todas as questões foram respondidas.</p>
              )}
              <p>Depois de enviar não dá para mudar as respostas.</p>
              <div className="acoes">
                <button type="button" onClick={enviar} disabled={enviando}>
                  {enviando ? 'Enviando...' : semResposta.length > 0 ? 'Enviar mesmo assim' : 'Confirmar envio'}
                </button>
                <button type="button" className="secundario" onClick={() => setConfirmando(false)}>
                  Continuar respondendo
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default Prova
