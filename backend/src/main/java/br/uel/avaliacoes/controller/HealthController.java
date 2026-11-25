package br.uel.avaliacoes.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.uel.avaliacoes.dao.HealthDAO;

@RestController
@RequestMapping("/api")
public class HealthController {

    private final HealthDAO healthDAO;

    public HealthController(HealthDAO healthDAO) {
        this.healthDAO = healthDAO;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        try {
            if (healthDAO.bancoConecta()) {
                return ResponseEntity.ok(Map.of("status", "ok", "banco", "conectado"));
            }
            return ResponseEntity.status(503).body(Map.of("status", "erro", "banco", "SELECT 1 nao retornou 1"));
        } catch (Exception e) {
            return ResponseEntity.status(503).body(Map.of("status", "erro", "banco", e.getMessage()));
        }
    }
}
