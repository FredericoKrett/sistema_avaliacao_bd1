package br.uel.avaliacoes.dao;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class HealthDAO {

    private final JdbcTemplate jdbc;

    public HealthDAO(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public boolean bancoConecta() {
        Integer resultado = jdbc.queryForObject("SELECT 1", Integer.class);
        return resultado != null && resultado == 1;
    }
}
