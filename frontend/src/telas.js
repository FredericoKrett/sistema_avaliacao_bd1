export const telasProfessor = [
  { id: 'questoes', titulo: 'Questões' },
  { id: 'avaliacoes', titulo: 'Avaliações' },
  { id: 'correcao', titulo: 'Correção' },
  { id: 'relatorios', titulo: 'Relatórios' },
]

export const telasAluno = [
  { id: 'minhas-avaliacoes', titulo: 'Minhas avaliações' },
]

export function telasDoUsuario(usuario) {
  return usuario.papel === 'PROFESSOR' ? telasProfessor : telasAluno
}
