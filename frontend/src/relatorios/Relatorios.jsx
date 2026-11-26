import { useState } from 'react'
import RelatorioEvolucao from './RelatorioEvolucao.jsx'
import RelatorioMedia from './RelatorioMedia.jsx'
import RelatorioPendentes from './RelatorioPendentes.jsx'
import RelatorioQuestoes from './RelatorioQuestoes.jsx'

const relatorios = [
  { id: 1, titulo: 'Média por avaliação', componente: RelatorioMedia },
  { id: 2, titulo: 'Evolução do aluno', componente: RelatorioEvolucao },
  { id: 3, titulo: 'Questões mais erradas', componente: RelatorioQuestoes },
  { id: 4, titulo: 'Alunos pendentes', componente: RelatorioPendentes },
]

function Relatorios() {
  const [aberto, setAberto] = useState(1)
  const Relatorio = relatorios.find((r) => r.id === aberto).componente

  return (
    <section>
      <h2>Relatórios</h2>
      <nav className="abas">
        {relatorios.map((r) => (
          <button
            key={r.id}
            type="button"
            className={r.id === aberto ? 'ativo' : ''}
            onClick={() => setAberto(r.id)}
          >
            {r.titulo}
          </button>
        ))}
      </nav>
      <Relatorio />
    </section>
  )
}

export default Relatorios
