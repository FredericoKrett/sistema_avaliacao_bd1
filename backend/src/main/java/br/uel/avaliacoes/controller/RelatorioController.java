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
import br.uel.avaliacoes.dao.UsuarioDAO;

@RestController
@RequestMapping("/api/relatorios")
public class RelatorioController {

    private final RelatorioDAO relatorioDAO;
    private final UsuarioDAO usuarioDAO;

    public RelatorioController(RelatorioDAO relatorioDAO, UsuarioDAO usuarioDAO) {
        this.relatorioDAO = relatorioDAO;
        this.usuarioDAO = usuarioDAO;
    }

    @GetMapping("/1")
    public List<Map<String, Object>> mediaPorAvaliacao(
            @RequestParam(defaultValue = "2000-01-01") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(defaultValue = "2100-12-31") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim,
            @RequestParam(required = false) List<String> turmas) {
        if (turmas == null || turmas.isEmpty()) {
            turmas = usuarioDAO.listarTurmas();
        }
        return relatorioDAO.mediaPorAvaliacao(inicio.atStartOfDay(), fim.atTime(23, 59, 59), turmas);
    }

    @GetMapping("/2")
    public List<Map<String, Object>> evolucaoAluno(@RequestParam int idUsuario) {
        return relatorioDAO.evolucaoAluno(idUsuario);
    }

    @GetMapping("/3")
    public List<Map<String, Object>> questoesMaisErradas(@RequestParam(required = false) String busca) {
        return relatorioDAO.questoesMaisErradas(busca);
    }

    @GetMapping("/4")
    public Map<String, Object> alunosPendentes(@RequestParam(required = false) Integer idAvaliacao) {
        return Map.of(
                "pendentes", relatorioDAO.alunosPendentes(idAvaliacao),
                "resumo", relatorioDAO.resumoEntregas());
    }
}
