package br.uel.avaliacoes.controller;

import br.uel.avaliacoes.dao.RespostaDAO;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/respostas")
public class RespostaController {

    private final RespostaDAO respostaDAO;

    public RespostaController(RespostaDAO respostaDAO) {
        this.respostaDAO = respostaDAO;
    }

    @PutMapping("/{id}/nota")
    public ResponseEntity<?> atribuirNota(@PathVariable int id, @RequestBody Map<String, Object> body) {
        if (body == null || body.get("notaObtida") == null) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Informe o campo notaObtida."));
        }

        BigDecimal nota;
        try {
            nota = new BigDecimal(body.get("notaObtida").toString());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Nota invalida."));
        }

        if (nota.compareTo(BigDecimal.ZERO) < 0) {
            return ResponseEntity.badRequest().body(Map.of("erro", "A nota nao pode ser negativa."));
        }

        try {
            int atualizadas = respostaDAO.atribuirNotaDiscursiva(id, nota);
            if (atualizadas == 0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("erro", "Resposta nao encontrada."));
            }
            return ResponseEntity.ok(Map.of("idResposta", id, "notaObtida", nota));
        } catch (DataAccessException e) {
            Throwable causa = e.getMostSpecificCause();
            String msg = causa != null && causa.getMessage() != null
                    ? causa.getMessage()
                    : "Nota invalida para esta questao.";
            return ResponseEntity.badRequest().body(Map.of("erro", msg));
        }
    }
}
