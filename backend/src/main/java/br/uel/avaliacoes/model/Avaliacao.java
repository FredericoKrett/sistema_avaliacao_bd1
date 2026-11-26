package br.uel.avaliacoes.model;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.List;

public class Avaliacao {
    private Integer idAvaliacao;
    private String titulo;
    private String descricao;
    private LocalDateTime dataInicio;
    private LocalDateTime dataFim;
    private Integer idCriador;
    private String nomeCriador;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private List<AvaliacaoQuestao> questoes;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private List<Integer> usuarios;

    public Avaliacao() {
    }

    public Integer getIdAvaliacao() {
        return idAvaliacao;
    }

    public void setIdAvaliacao(Integer idAvaliacao) {
        this.idAvaliacao = idAvaliacao;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public LocalDateTime getDataInicio() {
        return dataInicio;
    }

    public void setDataInicio(LocalDateTime dataInicio) {
        this.dataInicio = dataInicio;
    }

    public LocalDateTime getDataFim() {
        return dataFim;
    }

    public void setDataFim(LocalDateTime dataFim) {
        this.dataFim = dataFim;
    }

    public Integer getIdCriador() {
        return idCriador;
    }

    public void setIdCriador(Integer idCriador) {
        this.idCriador = idCriador;
    }

    public String getNomeCriador() {
        return nomeCriador;
    }

    public void setNomeCriador(String nomeCriador) {
        this.nomeCriador = nomeCriador;
    }

    public List<AvaliacaoQuestao> getQuestoes() {
        return questoes;
    }

    public void setQuestoes(List<AvaliacaoQuestao> questoes) {
        this.questoes = questoes;
    }

    public List<Integer> getUsuarios() {
        return usuarios;
    }

    public void setUsuarios(List<Integer> usuarios) {
        this.usuarios = usuarios;
    }
}
