package br.uel.avaliacoes.controller;

import br.uel.avaliacoes.dao.AvaliacaoDAO;
import br.uel.avaliacoes.dao.RespostaDAO;
import br.uel.avaliacoes.model.Alternativa;
import br.uel.avaliacoes.model.Avaliacao;
import br.uel.avaliacoes.model.AvaliacaoQuestao;
import br.uel.avaliacoes.model.Questao;
import br.uel.avaliacoes.model.Resposta;
import br.uel.avaliacoes.model.UsuarioAvaliacao;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/avaliacoes")
public class AvaliacaoController {

    private final AvaliacaoDAO avaliacaoDAO;
    private final RespostaDAO respostaDAO;

    public AvaliacaoController(AvaliacaoDAO avaliacaoDAO, RespostaDAO respostaDAO) {
        this.avaliacaoDAO = avaliacaoDAO;
        this.respostaDAO = respostaDAO;
    }

    public static class SubmissaoRequest {
        private Integer idUsuario;
        private List<Resposta> respostas;

        public Integer getIdUsuario() {
            return idUsuario;
        }

        public void setIdUsuario(Integer idUsuario) {
            this.idUsuario = idUsuario;
        }

        public List<Resposta> getRespostas() {
            return respostas;
        }

        public void setRespostas(List<Resposta> respostas) {
            this.respostas = respostas;
        }
    }

    @GetMapping
    public List<Avaliacao> listarTodas() {
        return avaliacaoDAO.listarTodas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable int id) {
        return avaliacaoDAO.buscarPorId(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("erro", "Avaliacao nao encontrada.")));
    }

    @PostMapping
    public ResponseEntity<?> criar(@RequestBody Avaliacao avaliacao) {
        try {
            Avaliacao criada = avaliacaoDAO.inserir(avaliacao);
            Avaliacao completa = avaliacaoDAO.buscarPorId(criada.getIdAvaliacao()).orElse(criada);
            return ResponseEntity.status(HttpStatus.CREATED).body(completa);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Erro ao cadastrar avaliacao: " + mensagemLimpa(e)));
        }
    }

    @GetMapping("/{id}/questoes")
    public List<AvaliacaoQuestao> listarQuestoes(@PathVariable int id) {
        return avaliacaoDAO.listarQuestoesDaAvaliacao(id);
    }

    @PostMapping("/{id}/questoes")
    public ResponseEntity<?> adicionarQuestao(@PathVariable int id, @RequestBody Map<String, Object> body) {
        try {
            int idQuestao = ((Number) body.get("idQuestao")).intValue();
            int ordem = ((Number) body.get("ordem")).intValue();
            BigDecimal valor = new BigDecimal(body.get("valor").toString());
            avaliacaoDAO.adicionarQuestao(id, idQuestao, ordem, valor);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("mensagem", "Questao adicionada a avaliacao com sucesso."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Erro ao adicionar questao: " + mensagemLimpa(e)));
        }
    }

    @PutMapping("/{id}/questoes")
    public ResponseEntity<?> substituirQuestoes(@PathVariable int id, @RequestBody JsonNode body) {
        try {
            JsonNode arrayNode = body.isArray() ? body : body.get("questoes");
            if (arrayNode == null || !arrayNode.isArray()) {
                return ResponseEntity.badRequest().body(Map.of("erro", "Lista de questoes invalida."));
            }
            List<AvaliacaoQuestao> lista = new ArrayList<>();
            int ordemPadrao = 1;
            for (JsonNode item : arrayNode) {
                AvaliacaoQuestao aq = new AvaliacaoQuestao();
                aq.setIdAvaliacao(id);
                aq.setIdQuestao(item.get("idQuestao").asInt());
                aq.setOrdem(item.hasNonNull("ordem") ? item.get("ordem").asInt() : ordemPadrao);
                aq.setValor(new BigDecimal(item.get("valor").asText()));
                lista.add(aq);
                ordemPadrao++;
            }
            avaliacaoDAO.substituirQuestoes(id, lista);
            return avaliacaoDAO.buscarPorId(id)
                    .<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(Map.of("erro", "Avaliacao nao encontrada.")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Erro ao atualizar questoes: " + mensagemLimpa(e)));
        }
    }

    @GetMapping("/{id}/usuarios")
    public List<Integer> listarUsuariosAtribuidos(@PathVariable int id) {
        return avaliacaoDAO.listarIdsUsuariosAtribuidos(id);
    }

    @PutMapping("/{id}/usuarios")
    public ResponseEntity<?> substituirUsuarios(@PathVariable int id, @RequestBody JsonNode body) {
        try {
            JsonNode arrayNode = body.isArray()
                    ? body
                    : (body.has("usuarios") ? body.get("usuarios") : body.get("idsUsuarios"));
            if (arrayNode == null || !arrayNode.isArray()) {
                return ResponseEntity.badRequest().body(Map.of("erro", "Lista de usuarios invalida."));
            }
            List<Integer> ids = new ArrayList<>();
            for (JsonNode item : arrayNode) {
                ids.add(item.asInt());
            }
            avaliacaoDAO.substituirUsuarios(id, ids);
            return ResponseEntity.ok(Map.of("usuarios", avaliacaoDAO.listarIdsUsuariosAtribuidos(id)));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("erro", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Erro ao atribuir usuarios: " + mensagemLimpa(e)));
        }
    }

    @PostMapping("/{id}/atribuir-turma")
    public ResponseEntity<?> atribuirTurma(@PathVariable int id, @RequestBody Map<String, String> body) {
        try {
            String turma = body.get("turma");
            avaliacaoDAO.atribuirTurma(id, turma);
            return ResponseEntity.ok(Map.of("usuarios", avaliacaoDAO.listarIdsUsuariosAtribuidos(id)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Erro ao atribuir turma: " + mensagemLimpa(e)));
        }
    }

    @GetMapping("/{id}/prova")
    public ResponseEntity<?> buscarProvaParaAluno(@PathVariable int id, @RequestParam int idAluno) {
        Optional<Avaliacao> optAvaliacao = avaliacaoDAO.buscarPorId(id);
        if (optAvaliacao.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("erro", "Avaliacao nao encontrada."));
        }
        Avaliacao avaliacao = optAvaliacao.get();

        Optional<UsuarioAvaliacao> optAtrib = avaliacaoDAO.buscarAtribuicao(idAluno, id);
        if (optAtrib.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("erro", "Voce nao esta atribuido a esta avaliacao."));
        }
        if (optAtrib.get().getDataEntrega() != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("erro", "Voce ja entregou esta avaliacao."));
        }

        LocalDateTime agora = LocalDateTime.now();
        if (agora.isBefore(avaliacao.getDataInicio()) || agora.isAfter(avaliacao.getDataFim())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("erro", "Esta avaliacao esta fora do horario permitido."));
        }

        List<Map<String, Object>> questoesSemGabarito = new ArrayList<>();
        for (AvaliacaoQuestao aq : avaliacao.getQuestoes()) {
            Questao q = aq.getQuestao();
            List<Map<String, Object>> altsSemCorreta = new ArrayList<>();
            if (q.getAlternativas() != null) {
                for (Alternativa alt : q.getAlternativas()) {
                    Map<String, Object> altMap = new LinkedHashMap<>();
                    altMap.put("idAlternativa", alt.getIdAlternativa());
                    altMap.put("idQuestao", alt.getIdQuestao());
                    altMap.put("letra", alt.getLetra());
                    altMap.put("texto", alt.getTexto());
                    altsSemCorreta.add(altMap);
                }
            }

            Map<String, Object> questaoMap = new LinkedHashMap<>();
            questaoMap.put("idQuestao", q.getIdQuestao());
            questaoMap.put("enunciado", q.getEnunciado());
            questaoMap.put("tipo", q.getTipo());
            questaoMap.put("alternativas", altsSemCorreta);

            Map<String, Object> itemMap = new LinkedHashMap<>();
            itemMap.put("idAvaliacao", aq.getIdAvaliacao());
            itemMap.put("idQuestao", aq.getIdQuestao());
            itemMap.put("ordem", aq.getOrdem());
            itemMap.put("valor", aq.getValor());
            itemMap.put("questao", questaoMap);
            questoesSemGabarito.add(itemMap);
        }

        Map<String, Object> resposta = new LinkedHashMap<>();
        resposta.put("idAvaliacao", avaliacao.getIdAvaliacao());
        resposta.put("titulo", avaliacao.getTitulo());
        resposta.put("descricao", avaliacao.getDescricao());
        resposta.put("dataInicio", avaliacao.getDataInicio());
        resposta.put("dataFim", avaliacao.getDataFim());
        resposta.put("questoes", questoesSemGabarito);
        return ResponseEntity.ok(resposta);
    }

    @PostMapping("/{id}/respostas")
    public ResponseEntity<?> submeterRespostas(@PathVariable int id, @RequestBody SubmissaoRequest request) {
        if (request == null || request.getIdUsuario() == null) {
            return ResponseEntity.badRequest().body(Map.of("erro", "idUsuario e obrigatorio."));
        }

        Optional<Avaliacao> optAvaliacao = avaliacaoDAO.buscarPorId(id);
        if (optAvaliacao.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("erro", "Avaliacao nao encontrada."));
        }
        Avaliacao avaliacao = optAvaliacao.get();

        Optional<UsuarioAvaliacao> optAtrib = avaliacaoDAO.buscarAtribuicao(request.getIdUsuario(), id);
        if (optAtrib.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("erro", "Voce nao esta atribuido a esta avaliacao."));
        }
        if (optAtrib.get().getDataEntrega() != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("erro", "Voce ja entregou esta avaliacao."));
        }

        LocalDateTime agora = LocalDateTime.now();
        if (agora.isBefore(avaliacao.getDataInicio()) || agora.isAfter(avaliacao.getDataFim())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("erro", "Esta avaliacao esta fora do horario permitido."));
        }

        try {
            Map<String, Object> resultado = respostaDAO.registrarRespostasAvaliacao(
                    request.getIdUsuario(),
                    id,
                    request.getRespostas()
            );
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Erro ao registrar respostas: " + mensagemLimpa(e)));
        }
    }

    @GetMapping("/{id}/correcao")
    public List<Map<String, Object>> listarCorrecao(@PathVariable int id) {
        return respostaDAO.listarPendentesCorrecaoPorAvaliacao(id);
    }

    private String mensagemLimpa(Exception e) {
        Throwable causa = e.getCause() != null ? e.getCause() : e;
        return causa.getMessage() != null ? causa.getMessage() : "dados invalidos.";
    }
}
