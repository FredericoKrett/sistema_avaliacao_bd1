package br.uel.avaliacoes.model;

import java.math.BigDecimal;

public class Resposta {
    private Integer idResposta;
    private Integer idUsuario;
    private Integer idAvaliacao;
    private Integer idQuestao;
    private Integer idAlternativa;
    private String textoResposta;
    private BigDecimal notaObtida;

    private String nomeUsuario;
    private String tituloAvaliacao;
    private String enunciadoQuestao;
    private BigDecimal valorQuestao;

    public Resposta() {
    }

    public Integer getIdResposta() {
        return idResposta;
    }

    public void setIdResposta(Integer idResposta) {
        this.idResposta = idResposta;
    }

    public Integer getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Integer idUsuario) {
        this.idUsuario = idUsuario;
    }

    public Integer getIdAvaliacao() {
        return idAvaliacao;
    }

    public void setIdAvaliacao(Integer idAvaliacao) {
        this.idAvaliacao = idAvaliacao;
    }

    public Integer getIdQuestao() {
        return idQuestao;
    }

    public void setIdQuestao(Integer idQuestao) {
        this.idQuestao = idQuestao;
    }

    public Integer getIdAlternativa() {
        return idAlternativa;
    }

    public void setIdAlternativa(Integer idAlternativa) {
        this.idAlternativa = idAlternativa;
    }

    public String getTextoResposta() {
        return textoResposta;
    }

    public void setTextoResposta(String textoResposta) {
        this.textoResposta = textoResposta;
    }

    public BigDecimal getNotaObtida() {
        return notaObtida;
    }

    public void setNotaObtida(BigDecimal notaObtida) {
        this.notaObtida = notaObtida;
    }

    public String getNomeUsuario() {
        return nomeUsuario;
    }

    public void setNomeUsuario(String nomeUsuario) {
        this.nomeUsuario = nomeUsuario;
    }

    public String getTituloAvaliacao() {
        return tituloAvaliacao;
    }

    public void setTituloAvaliacao(String tituloAvaliacao) {
        this.tituloAvaliacao = tituloAvaliacao;
    }

    public String getEnunciadoQuestao() {
        return enunciadoQuestao;
    }

    public void setEnunciadoQuestao(String enunciadoQuestao) {
        this.enunciadoQuestao = enunciadoQuestao;
    }

    public BigDecimal getValorQuestao() {
        return valorQuestao;
    }

    public void setValorQuestao(BigDecimal valorQuestao) {
        this.valorQuestao = valorQuestao;
    }
}
