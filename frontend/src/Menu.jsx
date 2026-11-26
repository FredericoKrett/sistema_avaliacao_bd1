import { telasDoUsuario } from './telas.js'

function Menu({ usuario, telaAtual, onTrocar }) {
  return (
    <nav className="menu">
      {telasDoUsuario(usuario).map((tela) => (
        <button
          key={tela.id}
          type="button"
          className={tela.id === telaAtual ? 'ativo' : ''}
          onClick={() => onTrocar(tela.id)}
        >
          {tela.titulo}
        </button>
      ))}
    </nav>
  )
}

export default Menu
