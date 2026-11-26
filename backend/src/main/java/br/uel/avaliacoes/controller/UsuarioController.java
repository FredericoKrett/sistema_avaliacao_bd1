package br.uel.avaliacoes.controller;

import br.uel.avaliacoes.dao.AvaliacaoDAO;
import br.uel.avaliacoes.dao.UsuarioDAO;
import br.uel.avaliacoes.model.Usuario;
import br.uel.avaliacoes.model.UsuarioAvaliacao;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class UsuarioController {

    private final UsuarioDAO usuarioDAO;
    private final AvaliacaoDAO avaliacaoDAO;

    public UsuarioController(UsuarioDAO usuarioDAO, AvaliacaoDAO avaliacaoDAO) {
        this.usuarioDAO = usuarioDAO;
        this.avaliacaoDAO = avaliacaoDAO;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credenciais) {
        String email = credenciais.get("email");
        String senha = credenciais.get("senha");
        if (email == null || email.isBlank() || senha == null || senha.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("erro", "E-mail ou senha incorretos."));
        }
        return usuarioDAO.autenticar(email.trim(), senha)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("erro", "E-mail ou senha incorretos.")));
    }

    @GetMapping("/usuarios")
    public List<Usuario> listarUsuarios(@RequestParam(required = false) String papel) {
        if (papel != null && !papel.isBlank()) {
            return usuarioDAO.listarPorPapel(papel);
        }
        return usuarioDAO.listarTodos();
    }

    @GetMapping("/usuarios/turmas")
    public List<String> listarTurmas() {
        return usuarioDAO.listarTurmas();
    }

    @GetMapping("/alunos/{id}/avaliacoes")
    public List<UsuarioAvaliacao> listarAvaliacoesDoAluno(@PathVariable int id) {
        return avaliacaoDAO.listarAvaliacoesDoAluno(id);
    }
}
