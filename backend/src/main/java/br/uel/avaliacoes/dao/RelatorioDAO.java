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
        if (turmas == null || turmas.isEmpty()) {
            turmas = listarTurmas();
        }
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("inicio", inicio)
                .addValue("fim", fim)
                .addValue("turmas", turmas);
        return paraCamelCase(jdbc.queryForList(sql, params));
    }

    private List<String> listarTurmas() {
        return jdbc.getJdbcTemplate().queryForList(
                "SELECT DISTINCT turma FROM usuario WHERE turma IS NOT NULL", String.class);
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
