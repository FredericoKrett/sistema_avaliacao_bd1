import { useState } from 'react'
import { brParaIso, isoParaBr, mascararData } from './formatos.js'

function CampoData({ id, valor, onChange }) {
  const [texto, setTexto] = useState(() => isoParaBr(valor))

  function alterar(evento) {
    const novo = mascararData(evento.target.value)
    setTexto(novo)
    onChange(brParaIso(novo))
  }

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      placeholder="dd/mm/aaaa"
      className="campo-data"
      value={texto}
      onChange={alterar}
    />
  )
}

export default CampoData
