import { useEffect, useState } from 'react'
import { buscarAvaliacao } from '../api.js'
import { formatarPeriodo } from '../formatos.js'
import AtribuirAlunos from './AtribuirAlunos.jsx'
import MontarAvaliacao from './MontarAvaliacao.jsx'

function DetalheAvaliacao({ idAvaliacao, onVoltar }) {
  const [avaliacao, setAvaliacao] = useState(null)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    buscarAvaliacao(idAvaliacao)
      .then((dados) => setAvaliacao(dados))
      .catch((e) => setErro(e.message))
  }, [idAvaliacao])

  return (
    <section>
      <button type="button" className="secundario" onClick={onVoltar}>
        Voltar para avaliações
      </button>

      {erro && <p className="erro">{erro}</p>}
      {!erro && !avaliacao && <p>Carregando...</p>}

      {avaliacao && (
        <>
          <h2>{avaliacao.titulo}</h2>
          {avaliacao.descricao && <p className="descricao">{avaliacao.descricao}</p>}
          <p>{formatarPeriodo(avaliacao.dataInicio, avaliacao.dataFim)}</p>

          <MontarAvaliacao avaliacao={avaliacao} onSalva={setAvaliacao} />
          <AtribuirAlunos avaliacao={avaliacao} />
        </>
      )}
    </section>
  )
}

export default DetalheAvaliacao
