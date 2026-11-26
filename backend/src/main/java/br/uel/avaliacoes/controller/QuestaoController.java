package br.uel.avaliacoes.controller;

import br.uel.avaliacoes.dao.QuestaoDAO;
import br.uel.avaliacoes.model.Questao;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/questoes")
public class QuestaoController {

    private final QuestaoDAO questaoDAO;

    public QuestaoController(QuestaoDAO questaoDAO) {
        this.questaoDAO = questaoDAO;
    }

    @GetMapping
    public List<Questao> listarTodas() {
        return questaoDAO.listarTodas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable int id) {
        return questaoDAO.buscarPorId(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("erro", "Questao nao encontrada.")));
    }

    @PostMapping
    public ResponseEntity<?> criar(@RequestBody Questao questao) {
        try {
            Questao criada = questaoDAO.inserir(questao);
            return ResponseEntity.status(HttpStatus.CREATED).body(criada);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Erro ao cadastrar questao: " + mensagemLimpa(e)));
        }
    }

    private String mensagemLimpa(Exception e) {
        Throwable causa = e.getCause() != null ? e.getCause() : e;
        return causa.getMessage() != null ? causa.getMessage() : "dados invalidos.";
    }
}
