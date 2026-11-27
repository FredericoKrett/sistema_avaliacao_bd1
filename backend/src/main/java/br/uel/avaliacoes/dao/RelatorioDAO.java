package br.uel.avaliacoes.dao;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class RelatorioDAO {

    private final NamedParameterJdbcTemplate jdbc;

    public RelatorioDAO(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Map<String, Object>> mediaPorAvaliacao(LocalDateTime inicio, LocalDateTime fim, List<String> turmas) {
        String sql = """
                SELECT
                    a.id_avaliacao,
                    a.titulo,
                    a.data_inicio,
                    COUNT(DISTINCT ua.id_usuario) AS total_respondentes,
                    ROUND(AVG(notas_aluno.nota_total), 2) AS media_notas,
                    ROUND(MIN(notas_aluno.nota_total), 2) AS menor_nota,
                    ROUND(MAX(notas_aluno.nota_total), 2) AS maior_nota
                FROM avaliacao a
                INNER JOIN usuario_avaliacao ua ON ua.id_avaliacao = a.id_avaliacao
                INNER JOIN usuario u ON u.id_usuario = ua.id_usuario
                INNER JOIN (
                    SELECT r.id_usuario, r.id_avaliacao, SUM(COALESCE(r.nota_obtida, 0)) AS nota_total
                    FROM resposta r
                    GROUP BY r.id_usuario, r.id_avaliacao
                ) notas_aluno ON notas_aluno.id_usuario = ua.id_usuario
                             AND notas_aluno.id_avaliacao = ua.id_avaliacao
                WHERE ua.data_entrega IS NOT NULL
                  AND a.data_inicio BETWEEN :inicio AND :fim
                  AND u.turma IN (:turmas)
                GROUP BY a.id_avaliacao, a.titulo, a.data_inicio
                HAVING COUNT(DISTINCT ua.id_usuario) >= 1
                ORDER BY a.data_inicio ASC
                """;
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("inicio", inicio)
                .addValue("fim", fim)
                .addValue("turmas", turmas);
        return paraCamelCase(jdbc.queryForList(sql, params));
    }

    public List<Map<String, Object>> evolucaoAluno(int idUsuario) {
        String sql = """
                SELECT
                    a.id_avaliacao,
                    a.titulo,
                    a.data_inicio,
                    u.nome AS aluno,
                    u.turma,
                    ROUND(SUM(COALESCE(r.nota_obtida, 0)), 2) AS nota_aluno,
                    ROUND((
                        SELECT AVG(sub.nota_total)
                        FROM (
                            SELECT r2.id_usuario, SUM(COALESCE(r2.nota_obtida, 0)) AS nota_total
                            FROM resposta r2
                            INNER JOIN usuario u2 ON u2.id_usuario = r2.id_usuario
                            WHERE r2.id_avaliacao = a.id_avaliacao
                              AND u2.turma = u.turma
                            GROUP BY r2.id_usuario
                        ) sub
                    ), 2) AS media_turma
                FROM resposta r
                INNER JOIN avaliacao a ON a.id_avaliacao = r.id_avaliacao
                INNER JOIN usuario u ON u.id_usuario = r.id_usuario
                WHERE u.id_usuario = :idUsuario
                GROUP BY a.id_avaliacao, a.titulo, a.data_inicio, u.nome, u.turma
                ORDER BY a.data_inicio ASC
                """;
        return paraCamelCase(jdbc.queryForList(sql, new MapSqlParameterSource("idUsuario", idUsuario)));
    }

    public List<Map<String, Object>> questoesMaisErradas(String busca) {
        String sql = """
                SELECT
                    RANK() OVER (ORDER BY
                        ROUND(100.0 * SUM(CASE WHEN COALESCE(r.nota_obtida, 0) < aq.valor THEN 1 ELSE 0 END) / COUNT(*), 2) DESC,
                        COUNT(*) DESC
                    ) AS posicao,
                    q.id_questao,
                    q.enunciado,
                    q.tipo,
                    COUNT(*) AS total_respostas,
                    SUM(CASE WHEN COALESCE(r.nota_obtida, 0) < aq.valor THEN 1 ELSE 0 END) AS total_erros_ou_parciais,
                    ROUND(100.0 * SUM(CASE WHEN COALESCE(r.nota_obtida, 0) < aq.valor THEN 1 ELSE 0 END) / COUNT(*), 2) AS percentual_erro
                FROM questao q
                INNER JOIN avaliacao_questao aq ON aq.id_questao = q.id_questao
                INNER JOIN resposta r ON r.id_avaliacao = aq.id_avaliacao AND r.id_questao = aq.id_questao
                WHERE LOWER(q.enunciado) LIKE :busca
                GROUP BY q.id_questao, q.enunciado, q.tipo
                HAVING COUNT(*) >= 1
                ORDER BY percentual_erro DESC, total_respostas DESC
                FETCH FIRST 10 ROWS ONLY
                """;
        String filtro = busca == null ? "%" : "%" + busca.toLowerCase() + "%";
        return paraCamelCase(jdbc.queryForList(sql, new MapSqlParameterSource("busca", filtro)));
    }

    public List<Map<String, Object>> alunosPendentes(Integer idAvaliacao) {
        String sql = """
                SELECT
                    a.id_avaliacao,
                    a.titulo,
                    u.id_usuario,
                    u.nome AS aluno,
                    u.turma,
                    CASE
                        WHEN ua.data_entrega IS NULL THEN 'PENDENTE'
                        ELSE 'ENTREGUE'
                    END AS status_entrega,
                    COUNT(r.id_resposta) AS questoes_respondidas
                FROM usuario_avaliacao ua
                INNER JOIN avaliacao a ON a.id_avaliacao = ua.id_avaliacao
                INNER JOIN usuario u ON u.id_usuario = ua.id_usuario
                LEFT JOIN resposta r ON r.id_usuario = ua.id_usuario AND r.id_avaliacao = ua.id_avaliacao
                WHERE ua.data_entrega IS NULL
                  AND (CAST(:idAvaliacao AS INTEGER) IS NULL OR a.id_avaliacao = :idAvaliacao)
                GROUP BY a.id_avaliacao, a.titulo, u.id_usuario, u.nome, u.turma, ua.data_entrega
                ORDER BY a.id_avaliacao ASC, u.turma ASC, u.nome ASC
                """;
        return paraCamelCase(jdbc.queryForList(sql, new MapSqlParameterSource("idAvaliacao", idAvaliacao)));
    }

    public List<Map<String, Object>> resumoEntregas() {
        String sql = """
                SELECT
                    a.id_avaliacao,
                    a.titulo,
                    COUNT(ua.id_usuario) AS total_atribuidos,
                    COUNT(ua.data_entrega) AS total_entregues,
                    COUNT(ua.id_usuario) - COUNT(ua.data_entrega) AS total_pendentes
                FROM avaliacao a
                LEFT JOIN usuario_avaliacao ua ON ua.id_avaliacao = a.id_avaliacao
                GROUP BY a.id_avaliacao, a.titulo
                ORDER BY a.data_inicio ASC
                """;
        return paraCamelCase(jdbc.getJdbcTemplate().queryForList(sql));
    }

    private List<Map<String, Object>> paraCamelCase(List<Map<String, Object>> linhas) {
        List<Map<String, Object>> resultado = new ArrayList<>();
        for (Map<String, Object> linha : linhas) {
            Map<String, Object> nova = new LinkedHashMap<>();
            for (Map.Entry<String, Object> coluna : linha.entrySet()) {
                Object valor = coluna.getValue();
                if (valor instanceof Timestamp t) {
                    valor = t.toLocalDateTime();
                }
                nova.put(camelCase(coluna.getKey()), valor);
            }
            resultado.add(nova);
        }
        return resultado;
    }

    private String camelCase(String coluna) {
        StringBuilder sb = new StringBuilder();
        boolean proximaMaiuscula = false;
        for (char c : coluna.toCharArray()) {
            if (c == '_') {
                proximaMaiuscula = true;
            } else if (proximaMaiuscula) {
                sb.append(Character.toUpperCase(c));
                proximaMaiuscula = false;
            } else {
                sb.append(c);
            }
        }
        return sb.toString();
    }
}
