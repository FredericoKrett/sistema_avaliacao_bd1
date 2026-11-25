package br.uel.avaliacoes.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.uel.avaliacoes.dao.RelatorioDAO;

@RestController
@RequestMapping("/api/relatorios")
public class RelatorioController {

    private final RelatorioDAO relatorioDAO;

    public RelatorioController(RelatorioDAO relatorioDAO) {
        this.relatorioDAO = relatorioDAO;
    }

    @GetMapping("/1")
    public List<Map<String, Object>> mediaPorAvaliacao(
            @RequestParam(defaultValue = "2000-01-01") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(defaultValue = "2100-12-31") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim,
            @RequestParam(required = false) List<String> turmas) {
        return relatorioDAO.mediaPorAvaliacao(inicio.atStartOfDay(), fim.atTime(23, 59, 59), turmas);
    }

    @GetMapping("/2")
    public List<Map<String, Object>> evolucaoAluno(@RequestParam int idUsuario) {
        return relatorioDAO.evolucaoAluno(idUsuario);
    }
}
