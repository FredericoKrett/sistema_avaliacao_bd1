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

export const avaliacoesMock = [
  {
    idAvaliacao: 1,
    titulo: 'Avaliacao 1 - Matematica e Raciocinio Logico',
    descricao: 'Prova basica de aritmetica, porcentagem, sequencias e geometria.',
    dataInicio: '2026-09-15T19:15:00',
    dataFim: '2026-09-15T21:00:00',
    idCriador: 1,
    nomeCriador: 'Carlos Eduardo Mendes',
    questoes: [
      { idQuestao: 1, ordem: 1, valor: 1.5 },
      { idQuestao: 25, ordem: 2, valor: 2.5 },
    ],
    usuarios: [3, 4],
  },
  {
    idAvaliacao: 2,
    titulo: 'Simulado - Geografia e Conhecimentos Gerais',
    descricao: 'Questoes gerais sobre continentes, capitais, oceanos e astronomia.',
    dataInicio: '2026-10-02T19:15:00',
    dataFim: '2026-10-02T20:45:00',
    idCriador: 1,
    nomeCriador: 'Carlos Eduardo Mendes',
    questoes: [{ idQuestao: 8, ordem: 1, valor: 1.5 }],
    usuarios: [3, 4, 17],
  },
  {
    idAvaliacao: 3,
    titulo: 'Avaliacao 2 - Ciencias da Natureza',
    descricao: 'Avaliacao sobre elementos quimicos, estados fisicos, biologia e corpo humano.',
    dataInicio: '2026-10-20T19:15:00',
    dataFim: '2026-10-20T21:15:00',
    idCriador: 1,
    nomeCriador: 'Carlos Eduardo Mendes',
    questoes: [{ idQuestao: 11, ordem: 1, valor: 1.5 }],
    usuarios: [3, 4, 17],
  },
  {
    idAvaliacao: 4,
    titulo: 'Quiz - Historia e Literatura',
    descricao: 'Avaliacao sobre historia geral, historia do Brasil e literatura.',
    dataInicio: '2026-11-05T14:00:00',
    dataFim: '2026-11-05T15:30:00',
    idCriador: 2,
    nomeCriador: 'Mariana Alves Costa',
    questoes: [{ idQuestao: 17, ordem: 1, valor: 1.5 }],
    usuarios: [3, 4],
  },
  {
    idAvaliacao: 5,
    titulo: 'Avaliacao Final - Informatica e Revisao Geral',
    descricao: 'Prova integradora cobrindo conceitos de informatica e revisao de temas anteriores.',
    dataInicio: '2026-11-18T19:15:00',
    dataFim: '2026-11-18T21:15:00',
    idCriador: 2,
    nomeCriador: 'Mariana Alves Costa',
    questoes: [
      { idQuestao: 1, ordem: 1, valor: 1.5 },
      { idQuestao: 29, ordem: 2, valor: 2.5 },
    ],
    usuarios: [3, 4],
  },
]
