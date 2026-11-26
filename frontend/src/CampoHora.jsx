import { useState } from 'react'
import { horaValida, mascararHora } from './formatos.js'

function CampoHora({ id, valor, onChange }) {
  const [texto, setTexto] = useState(valor || '')

  function alterar(evento) {
    const novo = mascararHora(evento.target.value)
    setTexto(novo)
    onChange(horaValida(novo))
  }

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      placeholder="hh:mm"
      className="campo-hora"
      value={texto}
      onChange={alterar}
    />
  )
}

export default CampoHora
