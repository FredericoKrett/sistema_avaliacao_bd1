import { useState } from 'react'
import { cadastrarAvaliacao } from '../api.js'
import CampoData from '../CampoData.jsx'
import CampoHora from '../CampoHora.jsx'
import { montarAvaliacao, validarAvaliacao } from './validacao.js'

function hojeIso() {
  const agora = new Date()
  const mes = String(agora.getMonth() + 1).padStart(2, '0')
  const dia = String(agora.getDate()).padStart(2, '0')
  return `${agora.getFullYear()}-${mes}-${dia}`
}

function horaAtual() {
  const agora = new Date()
  return `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`
}

function FormAvaliacao({ usuario, onSalva, onCancelar }) {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [data, setData] = useState(hojeIso)
  const [horaInicio, setHoraInicio] = useState(horaAtual)
  const [horaFim, setHoraFim] = useState('23:59')
  const [erro, setErro] = useState(null)
  const [salvando, setSalvando] = useState(false)

  async function salvar(evento) {
    evento.preventDefault()
    const campos = { titulo, descricao, data, horaInicio, horaFim, idCriador: usuario.idUsuario }
    const problema = validarAvaliacao(campos)
    if (problema) {
      setErro(problema)
      return
    }
    const avaliacao = montarAvaliacao(campos)
    setErro(null)
    setSalvando(true)
    try {
      const salva = await cadastrarAvaliacao(avaliacao)
      onSalva(salva)
    } catch (e) {
      setErro(e.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form className="cartao formulario" onSubmit={salvar}>
      <h3>Nova avaliação</h3>

      <label htmlFor="titulo">Título</label>
      <input id="titulo" type="text" maxLength={150} value={titulo} onChange={(e) => setTitulo(e.target.value)} />

      <label htmlFor="descricao">Descrição</label>
      <textarea id="descricao" rows={2} value={descricao} onChange={(e) => setDescricao(e.target.value)} />

      <div className="linha-campos">
        <label htmlFor="data">Data</label>
        <CampoData id="data" valor={data} onChange={setData} />
      </div>
      <div className="linha-campos">
        <label htmlFor="hora-inicio">Horário</label>
        <CampoHora id="hora-inicio" valor={horaInicio} onChange={setHoraInicio} />
        <label htmlFor="hora-fim" className="ate">
          até
        </label>
        <CampoHora id="hora-fim" valor={horaFim} onChange={setHoraFim} />
      </div>
      <p className="descricao">Os alunos só conseguem responder nesse dia, dentro desse horário.</p>

      {erro && <p className="erro">{erro}</p>}

      <div className="acoes">
        <button type="submit" disabled={salvando}>
          {salvando ? 'Salvando...' : 'Criar avaliação'}
        </button>
        <button type="button" className="secundario" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default FormAvaliacao
