package br.uel.avaliacoes.dao;

import br.uel.avaliacoes.model.Resposta;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Repository
public class RespostaDAO {

    private final JdbcTemplate jdbcTemplate;

    public RespostaDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // grava as respostas de todas as questoes da avaliacao e calcula a nota das objetivas
    @Transactional
    public Map<String, Object> registrarRespostasAvaliacao(int idUsuario, int idAvaliacao, List<Resposta> respostas) {
        String sqlQuestoesAvaliacao = """
                SELECT aq.id_questao, aq.valor, q.tipo
                FROM avaliacao_questao aq
                INNER JOIN questao q ON q.id_questao = aq.id_questao
                WHERE aq.id_avaliacao = ?
                ORDER BY aq.ordem ASC
                """;
        String sqlInsert = """
                INSERT INTO resposta (id_usuario, id_avaliacao, id_questao, id_alternativa, texto_resposta, nota_obtida)
                VALUES (?, ?, ?, ?, ?, ?)
                """;
        String sqlAlternativaCorreta = "SELECT correta FROM alternativa WHERE id_alternativa = ? AND id_questao = ?";

        record QuestaoAvaliacao(int idQuestao, BigDecimal valor, String tipo) {}
        List<QuestaoAvaliacao> questoes = jdbcTemplate.query(sqlQuestoesAvaliacao, (rs, rowNum) ->
                new QuestaoAvaliacao(
                        rs.getInt("id_questao"),
                        rs.getBigDecimal("valor"),
                        rs.getString("tipo")
                ), idAvaliacao);

        Map<Integer, QuestaoAvaliacao> mapaQuestoes = new HashMap<>();
        for (QuestaoAvaliacao qa : questoes) {
            mapaQuestoes.put(qa.idQuestao(), qa);
        }

        Map<Integer, Resposta> enviadas = new HashMap<>();
        if (respostas != null) {
            for (Resposta r : respostas) {
                if (r.getIdQuestao() == null || !mapaQuestoes.containsKey(r.getIdQuestao())) {
                    throw new IllegalArgumentException("Questao invalida para esta avaliacao.");
                }
                if (enviadas.put(r.getIdQuestao(), r) != null) {
                    throw new IllegalArgumentException("Questao repetida no envio.");
                }
            }
        }

        BigDecimal notaObjetivas = BigDecimal.ZERO;
        int pendentesCorrecao = 0;

        for (QuestaoAvaliacao qa : questoes) {
            Resposta r = enviadas.get(qa.idQuestao());
            Integer idAlternativa = null;
            String textoResposta = null;
            BigDecimal notaObtida;

            if ("MULTIPLA_ESCOLHA".equals(qa.tipo())) {
                if (r != null && r.getIdAlternativa() != null) {
                    idAlternativa = r.getIdAlternativa();
                    Boolean correta = jdbcTemplate.queryForObject(
                            sqlAlternativaCorreta,
                            Boolean.class,
                            idAlternativa,
                            qa.idQuestao()
                    );
                    notaObtida = Boolean.TRUE.equals(correta) ? qa.valor() : BigDecimal.ZERO;
                } else {
                    notaObtida = BigDecimal.ZERO;
                }
                notaObjetivas = notaObjetivas.add(notaObtida);
            } else {
                String texto = (r != null && r.getTextoResposta() != null) ? r.getTextoResposta().trim() : "";
                if (!texto.isEmpty()) {
                    textoResposta = texto;
                    notaObtida = null;
                    pendentesCorrecao++;
                } else {
                    notaObtida = BigDecimal.ZERO;
                }
            }

            jdbcTemplate.update(sqlInsert, idUsuario, idAvaliacao, qa.idQuestao(), idAlternativa, textoResposta, notaObtida);
        }

        String sqlEntrega = "UPDATE usuario_avaliacao SET data_entrega = CURRENT_TIMESTAMP WHERE id_usuario = ? AND id_avaliacao = ?";
        jdbcTemplate.update(sqlEntrega, idUsuario, idAvaliacao);

        Map<String, Object> resumo = new LinkedHashMap<>();
        resumo.put("notaObjetivas", notaObjetivas);
        resumo.put("pendentesCorrecao", pendentesCorrecao);
        return resumo;
    }

    // respostas de texto livre que ainda estao sem nota
    public List<Map<String, Object>> listarPendentesCorrecaoPorAvaliacao(int idAvaliacao) {
        String sql = """
                SELECT r.id_resposta,
                       u.nome AS nome_usuario,
                       q.enunciado AS enunciado_questao,
                       r.texto_resposta,
                       aq.valor AS valor_questao,
                       r.nota_obtida
                FROM resposta r
                INNER JOIN usuario u ON u.id_usuario = r.id_usuario
                INNER JOIN questao q ON q.id_questao = r.id_questao
                INNER JOIN avaliacao_questao aq ON aq.id_avaliacao = r.id_avaliacao AND aq.id_questao = r.id_questao
                WHERE r.id_avaliacao = ?
                  AND q.tipo = 'TEXTO_LIVRE'
                  AND r.nota_obtida IS NULL
                ORDER BY u.nome ASC, aq.ordem ASC
                """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("idResposta", rs.getInt("id_resposta"));
            item.put("nomeUsuario", rs.getString("nome_usuario"));
            item.put("enunciadoQuestao", rs.getString("enunciado_questao"));
            item.put("textoResposta", rs.getString("texto_resposta"));
            item.put("valorQuestao", rs.getBigDecimal("valor_questao"));
            item.put("notaObtida", rs.getBigDecimal("nota_obtida"));
            return item;
        }, idAvaliacao);
    }

    public int atribuirNotaDiscursiva(int idResposta, BigDecimal notaObtida) {
        String sql = """
                UPDATE resposta r
                SET nota_obtida = ?
                FROM questao q
                WHERE r.id_resposta = ?
                  AND q.id_questao = r.id_questao
                  AND q.tipo = 'TEXTO_LIVRE'
                """;
        return jdbcTemplate.update(sql, notaObtida, idResposta);
    }
}
