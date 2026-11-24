package br.uel.avaliacoes.model;

import java.util.ArrayList;
import java.util.List;

public class Questao {
    private Integer idQuestao;
    private String enunciado;
    private String tipo;
    private List<Alternativa> alternativas = new ArrayList<>();

    public Questao() {
    }

    public Questao(Integer idQuestao, String enunciado, String tipo) {
        this.idQuestao = idQuestao;
        this.enunciado = enunciado;
        this.tipo = tipo;
    }

    public Integer getIdQuestao() {
        return idQuestao;
    }

    public void setIdQuestao(Integer idQuestao) {
        this.idQuestao = idQuestao;
    }

    public String getEnunciado() {
        return enunciado;
    }

    public void setEnunciado(String enunciado) {
        this.enunciado = enunciado;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public List<Alternativa> getAlternativas() {
        return alternativas;
    }

    public void setAlternativas(List<Alternativa> alternativas) {
        this.alternativas = alternativas;
    }
}
