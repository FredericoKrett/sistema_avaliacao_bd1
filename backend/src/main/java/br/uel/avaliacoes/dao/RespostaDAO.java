package br.uel.avaliacoes.dao;

import br.uel.avaliacoes.model.Resposta;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Repository
public class RespostaDAO {

    private final JdbcTemplate jdbcTemplate;

    public RespostaDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // grava as respostas e ja calcula a nota das objetivas
    @Transactional
    public Map<String, Object> registrarRespostasAvaliacao(int idUsuario, int idAvaliacao, List<Resposta> respostas) {
        String sqlInsert = """
                INSERT INTO resposta (id_usuario, id_avaliacao, id_questao, id_alternativa, texto_resposta, nota_obtida)
                VALUES (?, ?, ?, ?, ?, ?)
                """;

        String sqlTipoQuestao = "SELECT tipo FROM questao WHERE id_questao = ?";
        String sqlValorQuestao = "SELECT valor FROM avaliacao_questao WHERE id_avaliacao = ? AND id_questao = ?";
        String sqlAlternativaCorreta = "SELECT correta FROM alternativa WHERE id_alternativa = ? AND id_questao = ?";

        BigDecimal notaObjetivas = BigDecimal.ZERO;
        int pendentesCorrecao = 0;

        if (respostas != null) {
            for (Resposta r : respostas) {
                String tipo = jdbcTemplate.queryForObject(sqlTipoQuestao, String.class, r.getIdQuestao());
                BigDecimal valorQuestao = jdbcTemplate.queryForObject(sqlValorQuestao, BigDecimal.class, idAvaliacao, r.getIdQuestao());

                Integer idAlternativa = null;
                String textoResposta = null;
                BigDecimal notaObtida = null;

                if ("MULTIPLA_ESCOLHA".equals(tipo)) {
                    idAlternativa = r.getIdAlternativa();
                    if (idAlternativa != null) {
                        Boolean correta = jdbcTemplate.queryForObject(
                                sqlAlternativaCorreta,
                                Boolean.class,
                                idAlternativa,
                                r.getIdQuestao()
                        );
                        notaObtida = Boolean.TRUE.equals(correta) ? valorQuestao : BigDecimal.ZERO;
                    } else {
                        notaObtida = BigDecimal.ZERO;
                    }
                    notaObjetivas = notaObjetivas.add(notaObtida);
                } else {
                    textoResposta = r.getTextoResposta();
                    notaObtida = null;
                    pendentesCorrecao++;
                }

                jdbcTemplate.update(sqlInsert, idUsuario, idAvaliacao, r.getIdQuestao(), idAlternativa, textoResposta, notaObtida);
            }
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
        String sql = "UPDATE resposta SET nota_obtida = ? WHERE id_resposta = ?";
        return jdbcTemplate.update(sql, notaObtida, idResposta);
    }
}
