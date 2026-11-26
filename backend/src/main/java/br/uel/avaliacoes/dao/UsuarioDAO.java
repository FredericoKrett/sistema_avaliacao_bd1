package br.uel.avaliacoes.dao;

import br.uel.avaliacoes.model.Usuario;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class UsuarioDAO {

    private final JdbcTemplate jdbcTemplate;

    public UsuarioDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Usuario> rowMapper = (rs, rowNum) -> new Usuario(
            rs.getInt("id_usuario"),
            rs.getString("nome"),
            rs.getString("email"),
            rs.getString("senha"),
            rs.getString("papel"),
            rs.getString("turma")
    );

    public List<Usuario> listarTodos() {
        String sql = "SELECT id_usuario, nome, email, senha, papel, turma FROM usuario ORDER BY papel DESC, nome ASC";
        return jdbcTemplate.query(sql, rowMapper);
    }

    public List<Usuario> listarPorPapel(String papel) {
        String sql = "SELECT id_usuario, nome, email, senha, papel, turma FROM usuario WHERE papel = ? ORDER BY turma ASC, nome ASC";
        return jdbcTemplate.query(sql, rowMapper, papel.toUpperCase());
    }

    public List<String> listarTurmas() {
        String sql = "SELECT DISTINCT turma FROM usuario WHERE turma IS NOT NULL ORDER BY turma ASC";
        return jdbcTemplate.queryForList(sql, String.class);
    }

    public Optional<Usuario> buscarPorId(int idUsuario) {
        String sql = "SELECT id_usuario, nome, email, senha, papel, turma FROM usuario WHERE id_usuario = ?";
        List<Usuario> lista = jdbcTemplate.query(sql, rowMapper, idUsuario);
        return lista.stream().findFirst();
    }

    public Optional<Usuario> autenticar(String email, String senha) {
        String sql = "SELECT id_usuario, nome, email, senha, papel, turma FROM usuario WHERE email = ? AND senha = ?";
        List<Usuario> lista = jdbcTemplate.query(sql, rowMapper, email, senha);
        return lista.stream().findFirst();
    }
}
