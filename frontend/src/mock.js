export const usuariosMock = [
  { idUsuario: 1, nome: 'Carlos Eduardo Mendes', email: 'carlos.mendes@email.com', senha: 'prof123', papel: 'PROFESSOR', turma: null },
  { idUsuario: 2, nome: 'Mariana Alves Costa', email: 'mariana.costa@email.com', senha: 'prof123', papel: 'PROFESSOR', turma: null },
  { idUsuario: 3, nome: 'Lucas Gabriel Almeida', email: 'lucas.almeida@email.com', senha: 'aluno123', papel: 'ALUNO', turma: 'TURMA-A' },
  { idUsuario: 4, nome: 'Beatriz Oliveira', email: 'beatriz.oliveira@email.com', senha: 'aluno123', papel: 'ALUNO', turma: 'TURMA-A' },
  { idUsuario: 17, nome: 'Bruno Nascimento', email: 'bruno.nascimento@email.com', senha: 'aluno123', papel: 'ALUNO', turma: 'TURMA-B' },
]

function alternativas(idQuestao, primeiroId, textos, letraCorreta) {
  return textos.map((texto, i) => ({
    idAlternativa: primeiroId + i,
    idQuestao,
    letra: 'ABCDE'[i],
    texto,
    correta: 'ABCDE'[i] === letraCorreta,
  }))
}

export const questoesMock = [
  {
    idQuestao: 1,
    enunciado: 'Qual e o resultado da expressao matematica 15 + (8 * 2)?',
    tipo: 'MULTIPLA_ESCOLHA',
    alternativas: alternativas(1, 1, ['31', '46', '25', '30'], 'A'),
  },
  {
    idQuestao: 8,
    enunciado: 'Qual e a capital da Australia?',
    tipo: 'MULTIPLA_ESCOLHA',
    alternativas: alternativas(8, 29, ['Sydney', 'Melbourne', 'Auckland', 'Camberra'], 'D'),
  },
  {
    idQuestao: 11,
    enunciado: 'Qual e o simbolo quimico do elemento Oxigenio?',
    tipo: 'MULTIPLA_ESCOLHA',
    alternativas: alternativas(11, 41, ['Ox', 'Og', 'O', 'Oi'], 'C'),
  },
  {
    idQuestao: 17,
    enunciado: 'Quem escreveu a obra literaria Dom Casmurro?',
    tipo: 'MULTIPLA_ESCOLHA',
    alternativas: alternativas(17, 65, ['Machado de Assis', 'Jose de Alencar', 'Jorge Amado', 'Carlos Drummond de Andrade'], 'A'),
  },
  {
    idQuestao: 25,
    enunciado: 'Explique com suas palavras como calcular a media aritmetica de tres notas.',
    tipo: 'TEXTO_LIVRE',
    alternativas: [],
  },
  {
    idQuestao: 29,
    enunciado: 'Explique a diferenca entre hardware e software, dando um exemplo de cada.',
    tipo: 'TEXTO_LIVRE',
    alternativas: [],
  },
]
