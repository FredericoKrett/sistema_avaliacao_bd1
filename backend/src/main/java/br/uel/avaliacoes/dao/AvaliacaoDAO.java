package br.uel.avaliacoes.dao;

import br.uel.avaliacoes.model.Avaliacao;
import br.uel.avaliacoes.model.AvaliacaoQuestao;
import br.uel.avaliacoes.model.Questao;
import br.uel.avaliacoes.model.UsuarioAvaliacao;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class AvaliacaoDAO {

    private final JdbcTemplate jdbcTemplate;
    private final QuestaoDAO questaoDAO;

    public AvaliacaoDAO(JdbcTemplate jdbcTemplate, QuestaoDAO questaoDAO) {
        this.jdbcTemplate = jdbcTemplate;
        this.questaoDAO = questaoDAO;
    }

    @Transactional
    public Avaliacao inserir(Avaliacao avaliacao) {
        String sql = """
                INSERT INTO avaliacao (titulo, descricao, data_inicio, data_fim, id_criador)
                VALUES (?, ?, ?, ?, ?)
                RETURNING id_avaliacao
                """;
        Integer id = jdbcTemplate.queryForObject(
                sql,
                Integer.class,
                avaliacao.getTitulo(),
                avaliacao.getDescricao(),
                Timestamp.valueOf(avaliacao.getDataInicio()),
                Timestamp.valueOf(avaliacao.getDataFim()),
                avaliacao.getIdCriador()
        );
        avaliacao.setIdAvaliacao(id);

        if (avaliacao.getQuestoes() != null && !avaliacao.getQuestoes().isEmpty()) {
            String sqlAq = "INSERT INTO avaliacao_questao (id_avaliacao, id_questao, ordem, valor) VALUES (?, ?, ?, ?)";
            for (AvaliacaoQuestao aq : avaliacao.getQuestoes()) {
                jdbcTemplate.update(sqlAq, id, aq.getIdQuestao(), aq.getOrdem(), aq.getValor());
            }
        }
        return avaliacao;
    }

    public List<Avaliacao> listarTodas() {
        String sql = """
                SELECT a.id_avaliacao, a.titulo, a.descricao, a.data_inicio, a.data_fim,
                       a.id_criador, u.nome AS nome_criador
                FROM avaliacao a
                INNER JOIN usuario u ON u.id_usuario = a.id_criador
                ORDER BY a.data_inicio DESC
                """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> mapAvaliacao(rs));
    }

    public Optional<Avaliacao> buscarPorId(int idAvaliacao) {
        String sql = """
                SELECT a.id_avaliacao, a.titulo, a.descricao, a.data_inicio, a.data_fim,
                       a.id_criador, u.nome AS nome_criador
                FROM avaliacao a
                INNER JOIN usuario u ON u.id_usuario = a.id_criador
                WHERE a.id_avaliacao = ?
                """;
        List<Avaliacao> lista = jdbcTemplate.query(sql, (rs, rowNum) -> mapAvaliacao(rs), idAvaliacao);
        if (lista.isEmpty()) {
            return Optional.empty();
        }
        Avaliacao avaliacao = lista.get(0);
        avaliacao.setQuestoes(listarQuestoesDaAvaliacao(idAvaliacao));
        avaliacao.setUsuarios(listarIdsUsuariosAtribuidos(idAvaliacao));
        return Optional.of(avaliacao);
    }

    @Transactional
    public void adicionarQuestao(int idAvaliacao, int idQuestao, int ordem, BigDecimal valor) {
        Integer respostas = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM resposta WHERE id_avaliacao = ?", Integer.class, idAvaliacao);
        if (respostas != null && respostas > 0) {
            throw new IllegalStateException("Nao da para mudar as questoes de uma avaliacao que ja tem respostas.");
        }
        String sql = """
                INSERT INTO avaliacao_questao (id_avaliacao, id_questao, ordem, valor)
                VALUES (?, ?, ?, ?)
                ON CONFLICT (id_avaliacao, id_questao)
                DO UPDATE SET ordem = EXCLUDED.ordem, valor = EXCLUDED.valor
                """;
        jdbcTemplate.update(sql, idAvaliacao, idQuestao, ordem, valor);
    }

    @Transactional
    public void substituirQuestoes(int idAvaliacao, List<AvaliacaoQuestao> questoes) {
        if (questoes == null || questoes.isEmpty()) {
            throw new IllegalArgumentException("Adicione pelo menos uma questao.");
        }
        Integer respostas = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM resposta WHERE id_avaliacao = ?", Integer.class, idAvaliacao);
        if (respostas != null && respostas > 0) {
            throw new IllegalStateException("Nao da para mudar as questoes de uma avaliacao que ja tem respostas.");
        }
        jdbcTemplate.update("DELETE FROM avaliacao_questao WHERE id_avaliacao = ?", idAvaliacao);
        String sql = "INSERT INTO avaliacao_questao (id_avaliacao, id_questao, ordem, valor) VALUES (?, ?, ?, ?)";
        int ordemPadrao = 1;
        for (AvaliacaoQuestao aq : questoes) {
            int ordem = aq.getOrdem() != null ? aq.getOrdem() : ordemPadrao;
            jdbcTemplate.update(sql, idAvaliacao, aq.getIdQuestao(), ordem, aq.getValor());
            ordemPadrao++;
        }
    }

    public List<AvaliacaoQuestao> listarQuestoesDaAvaliacao(int idAvaliacao) {
        String sql = """
                SELECT aq.id_avaliacao, aq.id_questao, aq.ordem, aq.valor,
                       q.enunciado, q.tipo
                FROM avaliacao_questao aq
                INNER JOIN questao q ON q.id_questao = aq.id_questao
                WHERE aq.id_avaliacao = ?
                ORDER BY aq.ordem ASC
                """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            AvaliacaoQuestao aq = new AvaliacaoQuestao();
            aq.setIdAvaliacao(rs.getInt("id_avaliacao"));
            aq.setIdQuestao(rs.getInt("id_questao"));
            aq.setOrdem(rs.getInt("ordem"));
            aq.setValor(rs.getBigDecimal("valor"));

            Questao q = new Questao(
                    rs.getInt("id_questao"),
                    rs.getString("enunciado"),
                    rs.getString("tipo")
            );
            if ("MULTIPLA_ESCOLHA".equals(q.getTipo())) {
                q.setAlternativas(questaoDAO.listarAlternativasPorQuestao(q.getIdQuestao()));
            }
            aq.setQuestao(q);
            return aq;
        }, idAvaliacao);
    }

    public List<Integer> listarIdsUsuariosAtribuidos(int idAvaliacao) {
        String sql = "SELECT id_usuario FROM usuario_avaliacao WHERE id_avaliacao = ? ORDER BY id_usuario ASC";
        return jdbcTemplate.queryForList(sql, Integer.class, idAvaliacao);
    }

    @Transactional
    public void substituirUsuarios(int idAvaliacao, List<Integer> idsUsuarios) {
        if (idsUsuarios == null || idsUsuarios.isEmpty()) {
            Integer entregues = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM usuario_avaliacao WHERE id_avaliacao = ? AND data_entrega IS NOT NULL",
                    Integer.class, idAvaliacao);
            if (entregues != null && entregues > 0) {
                throw new IllegalStateException("Nao da para tirar da avaliacao um aluno que ja entregou.");
            }
            jdbcTemplate.update("DELETE FROM usuario_avaliacao WHERE id_avaliacao = ?", idAvaliacao);
            return;
        }

        String placeholders = String.join(",", idsUsuarios.stream().map(id -> "?").toList());
        List<Object> paramsDelete = new ArrayList<>();
        paramsDelete.add(idAvaliacao);
        paramsDelete.addAll(idsUsuarios);
        Integer entregues = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM usuario_avaliacao WHERE id_avaliacao = ? AND data_entrega IS NOT NULL AND id_usuario NOT IN (" + placeholders + ")",
                Integer.class, paramsDelete.toArray());
        if (entregues != null && entregues > 0) {
            throw new IllegalStateException("Nao da para tirar da avaliacao um aluno que ja entregou.");
        }
        jdbcTemplate.update(
                "DELETE FROM usuario_avaliacao WHERE id_avaliacao = ? AND id_usuario NOT IN (" + placeholders + ")",
                paramsDelete.toArray()
        );

        String sqlInsert = """
                INSERT INTO usuario_avaliacao (id_usuario, id_avaliacao, data_entrega)
                VALUES (?, ?, NULL)
                ON CONFLICT (id_usuario, id_avaliacao) DO NOTHING
                """;
        for (Integer idUsuario : idsUsuarios) {
            jdbcTemplate.update(sqlInsert, idUsuario, idAvaliacao);
        }
    }

    @Transactional
    public void atribuirTurma(int idAvaliacao, String turma) {
        String sql = """
                INSERT INTO usuario_avaliacao (id_usuario, id_avaliacao, data_entrega)
                SELECT id_usuario, ?, NULL
                FROM usuario
                WHERE papel = 'ALUNO' AND turma = ?
                ON CONFLICT (id_usuario, id_avaliacao) DO NOTHING
                """;
        jdbcTemplate.update(sql, idAvaliacao, turma);
    }

    public Optional<UsuarioAvaliacao> buscarAtribuicao(int idUsuario, int idAvaliacao) {
        String sql = """
                SELECT ua.id_usuario, ua.id_avaliacao, ua.data_entrega,
                       a.data_inicio, a.data_fim, a.titulo AS titulo_avaliacao,
                       u.nome AS nome_usuario, u.turma,
                       CASE
                           WHEN ua.data_entrega IS NULL THEN NULL
                           ELSE (SELECT COALESCE(SUM(r.nota_obtida), 0)
                                 FROM resposta r
                                 WHERE r.id_usuario = ua.id_usuario AND r.id_avaliacao = ua.id_avaliacao)
                       END AS nota_total
                FROM usuario_avaliacao ua
                INNER JOIN usuario u ON u.id_usuario = ua.id_usuario
                INNER JOIN avaliacao a ON a.id_avaliacao = ua.id_avaliacao
                WHERE ua.id_usuario = ? AND ua.id_avaliacao = ?
                """;
        List<UsuarioAvaliacao> lista = jdbcTemplate.query(sql, (rs, rowNum) -> mapUsuarioAvaliacao(rs), idUsuario, idAvaliacao);
        return lista.stream().findFirst();
    }

    public List<UsuarioAvaliacao> listarAtribuicoesPorAvaliacao(int idAvaliacao) {
        String sql = """
                SELECT ua.id_usuario, ua.id_avaliacao, ua.data_entrega,
                       a.data_inicio, a.data_fim, a.titulo AS titulo_avaliacao,
                       u.nome AS nome_usuario, u.turma,
                       CASE
                           WHEN ua.data_entrega IS NULL THEN NULL
                           ELSE (SELECT COALESCE(SUM(r.nota_obtida), 0)
                                 FROM resposta r
                                 WHERE r.id_usuario = ua.id_usuario AND r.id_avaliacao = ua.id_avaliacao)
                       END AS nota_total
                FROM usuario_avaliacao ua
                INNER JOIN usuario u ON u.id_usuario = ua.id_usuario
                INNER JOIN avaliacao a ON a.id_avaliacao = ua.id_avaliacao
                WHERE ua.id_avaliacao = ?
                ORDER BY u.turma ASC, u.nome ASC
                """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> mapUsuarioAvaliacao(rs), idAvaliacao);
    }

    public List<UsuarioAvaliacao> listarAvaliacoesDoAluno(int idUsuario) {
        String sql = """
                SELECT ua.id_usuario, ua.id_avaliacao, ua.data_entrega,
                       a.data_inicio, a.data_fim, a.titulo AS titulo_avaliacao,
                       u.nome AS nome_usuario, u.turma,
                       CASE
                           WHEN ua.data_entrega IS NULL THEN NULL
                           ELSE (SELECT COALESCE(SUM(r.nota_obtida), 0)
                                 FROM resposta r
                                 WHERE r.id_usuario = ua.id_usuario AND r.id_avaliacao = ua.id_avaliacao)
                       END AS nota_total
                FROM usuario_avaliacao ua
                INNER JOIN usuario u ON u.id_usuario = ua.id_usuario
                INNER JOIN avaliacao a ON a.id_avaliacao = ua.id_avaliacao
                WHERE ua.id_usuario = ?
                ORDER BY a.data_inicio DESC
                """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> mapUsuarioAvaliacao(rs), idUsuario);
    }

    private Avaliacao mapAvaliacao(java.sql.ResultSet rs) throws java.sql.SQLException {
        Avaliacao a = new Avaliacao();
        a.setIdAvaliacao(rs.getInt("id_avaliacao"));
        a.setTitulo(rs.getString("titulo"));
        a.setDescricao(rs.getString("descricao"));
        a.setDataInicio(rs.getTimestamp("data_inicio").toLocalDateTime());
        a.setDataFim(rs.getTimestamp("data_fim").toLocalDateTime());
        a.setIdCriador(rs.getInt("id_criador"));
        a.setNomeCriador(rs.getString("nome_criador"));
        return a;
    }

    private UsuarioAvaliacao mapUsuarioAvaliacao(java.sql.ResultSet rs) throws java.sql.SQLException {
        UsuarioAvaliacao ua = new UsuarioAvaliacao();
        ua.setIdUsuario(rs.getInt("id_usuario"));
        ua.setIdAvaliacao(rs.getInt("id_avaliacao"));
        ua.setDataInicio(rs.getTimestamp("data_inicio").toLocalDateTime());
        ua.setDataFim(rs.getTimestamp("data_fim").toLocalDateTime());
        Timestamp entrega = rs.getTimestamp("data_entrega");
        ua.setDataEntrega(entrega != null ? entrega.toLocalDateTime() : null);
        ua.setNomeUsuario(rs.getString("nome_usuario"));
        ua.setTurma(rs.getString("turma"));
        ua.setTituloAvaliacao(rs.getString("titulo_avaliacao"));
        ua.setNotaTotal(rs.getBigDecimal("nota_total"));
        return ua;
    }
}
