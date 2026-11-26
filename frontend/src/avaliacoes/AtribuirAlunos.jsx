import { useEffect, useState } from 'react'
import { listarAlunos, salvarAlunosDaAvaliacao } from '../api.js'

function idsIniciais(avaliacao) {
  return new Set((avaliacao.usuarios || []).map((u) => (typeof u === 'number' ? u : u.idUsuario)))
}

function AtribuirAlunos({ avaliacao }) {
  const [alunos, setAlunos] = useState([])
  const [selecionados, setSelecionados] = useState(() => idsIniciais(avaliacao))
  const [erro, setErro] = useState(null)
  const [aviso, setAviso] = useState(null)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    listarAlunos()
      .then((dados) => setAlunos([...dados].sort((a, b) => a.nome.localeCompare(b.nome))))
      .catch((e) => setErro(e.message))
  }, [])

  const turmas = [...new Set(alunos.map((a) => a.turma || 'Sem turma'))].sort()

  function alternar(idUsuario) {
    setSelecionados((atual) => {
      const novo = new Set(atual)
      if (novo.has(idUsuario)) novo.delete(idUsuario)
      else novo.add(idUsuario)
      return novo
    })
    setAviso(null)
  }

  function marcarTurma(turma, marcar) {
    const daTurma = alunos.filter((a) => (a.turma || 'Sem turma') === turma).map((a) => a.idUsuario)
    setSelecionados((atual) => {
      const novo = new Set(atual)
      daTurma.forEach((id) => (marcar ? novo.add(id) : novo.delete(id)))
      return novo
    })
    setAviso(null)
  }

  async function salvar() {
    setErro(null)
    setSalvando(true)
    try {
      await salvarAlunosDaAvaliacao(avaliacao.idAvaliacao, [...selecionados].sort((a, b) => a - b))
      setAviso(`${selecionados.size} aluno(s) com acesso a esta avaliação.`)
    } catch (e) {
      setErro(e.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="cartao bloco">
      <h3>Quem faz esta avaliação</h3>
      <p className="descricao">{selecionados.size} aluno(s) marcados.</p>

      {turmas.map((turma) => {
        const daTurma = alunos.filter((a) => (a.turma || 'Sem turma') === turma)
        const todos = daTurma.every((a) => selecionados.has(a.idUsuario))
        return (
          <fieldset key={turma} className="turma">
            <legend>{turma}</legend>
            <button type="button" className="secundario" onClick={() => marcarTurma(turma, !todos)}>
              {todos ? 'Desmarcar turma' : 'Marcar turma inteira'}
            </button>
            <div className="lista-alunos">
              {daTurma.map((a) => (
                <label key={a.idUsuario} className="opcao">
                  <input
                    type="checkbox"
                    checked={selecionados.has(a.idUsuario)}
                    onChange={() => alternar(a.idUsuario)}
                  />
                  {a.nome}
                </label>
              ))}
            </div>
          </fieldset>
        )
      })}

      {erro && <p className="erro">{erro}</p>}
      {aviso && <p className="ok">{aviso}</p>}

      <button type="button" onClick={salvar} disabled={salvando}>
        {salvando ? 'Salvando...' : 'Salvar alunos'}
      </button>
    </div>
  )
}

export default AtribuirAlunos
