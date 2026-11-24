package br.uel.avaliacoes.model;

public class Alternativa {
    private Integer idAlternativa;
    private Integer idQuestao;
    private String letra;
    private String texto;
    private boolean correta;

    public Alternativa() {
    }

    public Alternativa(Integer idAlternativa, Integer idQuestao, String letra, String texto, boolean correta) {
        this.idAlternativa = idAlternativa;
        this.idQuestao = idQuestao;
        this.letra = letra;
        this.texto = texto;
        this.correta = correta;
    }

    public Integer getIdAlternativa() {
        return idAlternativa;
    }

    public void setIdAlternativa(Integer idAlternativa) {
        this.idAlternativa = idAlternativa;
    }

    public Integer getIdQuestao() {
        return idQuestao;
    }

    public void setIdQuestao(Integer idQuestao) {
        this.idQuestao = idQuestao;
    }

    public String getLetra() {
        return letra;
    }

    public void setLetra(String letra) {
        this.letra = letra;
    }

    public String getTexto() {
        return texto;
    }

    public void setTexto(String texto) {
        this.texto = texto;
    }

    public boolean isCorreta() {
        return correta;
    }

    public void setCorreta(boolean correta) {
        this.correta = correta;
    }
}
