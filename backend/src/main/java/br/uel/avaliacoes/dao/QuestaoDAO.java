package br.uel.avaliacoes.dao;

import br.uel.avaliacoes.model.Alternativa;
import br.uel.avaliacoes.model.Questao;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public class QuestaoDAO {

    private final JdbcTemplate jdbcTemplate;

    public QuestaoDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional
    public Questao inserir(Questao questao) {
        String sqlQuestao = "INSERT INTO questao (enunciado, tipo) VALUES (?, ?) RETURNING id_questao";
        Integer idQuestao = jdbcTemplate.queryForObject(
                sqlQuestao,
                Integer.class,
                questao.getEnunciado(),
                questao.getTipo()
        );
        questao.setIdQuestao(idQuestao);

        if ("MULTIPLA_ESCOLHA".equals(questao.getTipo()) && questao.getAlternativas() != null) {
            String sqlAlt = "INSERT INTO alternativa (id_questao, letra, texto, correta) VALUES (?, ?, ?, ?) RETURNING id_alternativa";
            for (Alternativa alt : questao.getAlternativas()) {
                Integer idAlt = jdbcTemplate.queryForObject(
                        sqlAlt,
                        Integer.class,
                        idQuestao,
                        alt.getLetra(),
                        alt.getTexto(),
                        alt.isCorreta()
                );
                alt.setIdAlternativa(idAlt);
                alt.setIdQuestao(idQuestao);
            }
        }
        return questao;
    }

    public List<Questao> listarTodas() {
        String sql = "SELECT id_questao, enunciado, tipo FROM questao ORDER BY id_questao ASC";
        List<Questao> questoes = jdbcTemplate.query(sql, (rs, rowNum) ->
                new Questao(rs.getInt("id_questao"), rs.getString("enunciado"), rs.getString("tipo"))
        );

        for (Questao q : questoes) {
            if ("MULTIPLA_ESCOLHA".equals(q.getTipo())) {
                q.setAlternativas(listarAlternativasPorQuestao(q.getIdQuestao()));
            }
        }
        return questoes;
    }

    public Optional<Questao> buscarPorId(int idQuestao) {
        String sql = "SELECT id_questao, enunciado, tipo FROM questao WHERE id_questao = ?";
        List<Questao> lista = jdbcTemplate.query(sql, (rs, rowNum) ->
                new Questao(rs.getInt("id_questao"), rs.getString("enunciado"), rs.getString("tipo")),
                idQuestao
        );
        if (lista.isEmpty()) {
            return Optional.empty();
        }
        Questao q = lista.get(0);
        if ("MULTIPLA_ESCOLHA".equals(q.getTipo())) {
            q.setAlternativas(listarAlternativasPorQuestao(q.getIdQuestao()));
        }
        return Optional.of(q);
    }

    public List<Alternativa> listarAlternativasPorQuestao(int idQuestao) {
        String sql = "SELECT id_alternativa, id_questao, letra, texto, correta FROM alternativa WHERE id_questao = ? ORDER BY letra ASC";
        return jdbcTemplate.query(sql, (rs, rowNum) -> new Alternativa(
                rs.getInt("id_alternativa"),
                rs.getInt("id_questao"),
                rs.getString("letra").trim(),
                rs.getString("texto"),
                rs.getBoolean("correta")
        ), idQuestao);
    }
}
