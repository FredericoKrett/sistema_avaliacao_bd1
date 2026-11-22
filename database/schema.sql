DROP TABLE IF EXISTS resposta CASCADE;
DROP TABLE IF EXISTS usuario_avaliacao CASCADE;
DROP TABLE IF EXISTS avaliacao_questao CASCADE;
DROP TABLE IF EXISTS avaliacao CASCADE;
DROP TABLE IF EXISTS alternativa CASCADE;
DROP TABLE IF EXISTS questao CASCADE;
DROP TABLE IF EXISTS usuario CASCADE;
DROP FUNCTION IF EXISTS fn_resposta_nota_max CASCADE;

-- 1. Tabela USUARIO
CREATE TABLE usuario (
    id_usuario SERIAL,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL,
    senha VARCHAR(100) NOT NULL,
    papel VARCHAR(20) NOT NULL,
    turma VARCHAR(30),
    CONSTRAINT pk_usuario PRIMARY KEY (id_usuario),
    CONSTRAINT uq_usuario_email UNIQUE (email),
    CONSTRAINT ck_usuario_papel CHECK (papel IN ('ALUNO', 'PROFESSOR'))
);

-- 2. Tabela QUESTAO (RF1)
CREATE TABLE questao (
    id_questao SERIAL,
    enunciado TEXT NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    CONSTRAINT pk_questao PRIMARY KEY (id_questao),
    CONSTRAINT ck_questao_tipo CHECK (tipo IN ('MULTIPLA_ESCOLHA', 'TEXTO_LIVRE'))
);

-- 3. Tabela ALTERNATIVA (RF1)
CREATE TABLE alternativa (
    id_alternativa SERIAL,
    id_questao INTEGER NOT NULL,
    letra CHAR(1) NOT NULL,
    texto TEXT NOT NULL,
    correta BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT pk_alternativa PRIMARY KEY (id_alternativa),
    CONSTRAINT fk_alternativa_questao FOREIGN KEY (id_questao)
        REFERENCES questao (id_questao) ON DELETE CASCADE,
    CONSTRAINT uq_alternativa_questao_letra UNIQUE (id_questao, letra),
    CONSTRAINT uq_alternativa_questao_id UNIQUE (id_questao, id_alternativa),
    CONSTRAINT ck_alternativa_letra CHECK (letra IN ('A', 'B', 'C', 'D', 'E'))
);

CREATE UNIQUE INDEX uq_alternativa_uma_correta ON alternativa (id_questao) WHERE correta;

-- 4. Tabela AVALIACAO (RF2)
CREATE TABLE avaliacao (
    id_avaliacao SERIAL,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    data_inicio TIMESTAMP NOT NULL,
    data_fim TIMESTAMP NOT NULL,
    id_criador INTEGER NOT NULL,
    CONSTRAINT pk_avaliacao PRIMARY KEY (id_avaliacao),
    CONSTRAINT fk_avaliacao_criador FOREIGN KEY (id_criador)
        REFERENCES usuario (id_usuario) ON DELETE RESTRICT,
    CONSTRAINT ck_avaliacao_datas CHECK (data_fim > data_inicio)
);

-- 5. Tabela AVALIACAO_QUESTAO (RF3 e RF6)
CREATE TABLE avaliacao_questao (
    id_avaliacao INTEGER NOT NULL,
    id_questao INTEGER NOT NULL,
    ordem INTEGER NOT NULL,
    valor NUMERIC(5,2) NOT NULL,
    CONSTRAINT pk_avaliacao_questao PRIMARY KEY (id_avaliacao, id_questao),
    CONSTRAINT fk_aq_avaliacao FOREIGN KEY (id_avaliacao)
        REFERENCES avaliacao (id_avaliacao) ON DELETE CASCADE,
    CONSTRAINT fk_aq_questao FOREIGN KEY (id_questao)
        REFERENCES questao (id_questao) ON DELETE RESTRICT,
    CONSTRAINT uq_aq_avaliacao_ordem UNIQUE (id_avaliacao, ordem),
    CONSTRAINT ck_aq_ordem CHECK (ordem > 0),
    CONSTRAINT ck_aq_valor CHECK (valor > 0)
);

-- 6. Tabela USUARIO_AVALIACAO (RF4)
CREATE TABLE usuario_avaliacao (
    id_usuario INTEGER NOT NULL,
    id_avaliacao INTEGER NOT NULL,
    data_entrega TIMESTAMP,
    CONSTRAINT pk_usuario_avaliacao PRIMARY KEY (id_usuario, id_avaliacao),
    CONSTRAINT fk_ua_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuario (id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_ua_avaliacao FOREIGN KEY (id_avaliacao)
        REFERENCES avaliacao (id_avaliacao) ON DELETE CASCADE
);

-- 7. Tabela RESPOSTA (RF5 e RF6)
CREATE TABLE resposta (
    id_resposta SERIAL,
    id_usuario INTEGER NOT NULL,
    id_avaliacao INTEGER NOT NULL,
    id_questao INTEGER NOT NULL,
    id_alternativa INTEGER,
    texto_resposta TEXT,
    nota_obtida NUMERIC(5,2),
    CONSTRAINT pk_resposta PRIMARY KEY (id_resposta),
    CONSTRAINT fk_resposta_usuario_avaliacao FOREIGN KEY (id_usuario, id_avaliacao)
        REFERENCES usuario_avaliacao (id_usuario, id_avaliacao) ON DELETE CASCADE,
    CONSTRAINT fk_resposta_avaliacao_questao FOREIGN KEY (id_avaliacao, id_questao)
        REFERENCES avaliacao_questao (id_avaliacao, id_questao) ON DELETE CASCADE,
    CONSTRAINT fk_resposta_alternativa FOREIGN KEY (id_questao, id_alternativa)
        REFERENCES alternativa (id_questao, id_alternativa) ON DELETE RESTRICT,
    CONSTRAINT uq_resposta_aluno_questao UNIQUE (id_usuario, id_avaliacao, id_questao),
    CONSTRAINT ck_resposta_nota CHECK (nota_obtida IS NULL OR nota_obtida >= 0),
    CONSTRAINT ck_resposta_conteudo CHECK (id_alternativa IS NULL OR texto_resposta IS NULL)
);

CREATE FUNCTION fn_resposta_nota_max() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.nota_obtida > (SELECT valor FROM avaliacao_questao
                          WHERE id_avaliacao = NEW.id_avaliacao AND id_questao = NEW.id_questao) THEN
        RAISE EXCEPTION 'nota_obtida maior que o valor da questao na avaliacao';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_resposta_nota_max
    BEFORE INSERT OR UPDATE ON resposta
    FOR EACH ROW EXECUTE FUNCTION fn_resposta_nota_max();
