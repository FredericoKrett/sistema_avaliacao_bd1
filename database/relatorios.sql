-- Consultas dos relatorios (RF7)

-- Relatorio 1. Media das notas por avaliacao filtrando por periodo e turma
-- usa JOIN, subconsulta, GROUP BY, SUM, AVG, COUNT, HAVING, BETWEEN, IN e ORDER BY
SELECT
    a.id_avaliacao,
    a.titulo,
    a.data_inicio,
    COUNT(DISTINCT ua.id_usuario) AS total_respondentes,
    ROUND(AVG(notas_aluno.nota_total), 2) AS media_notas,
    ROUND(MIN(notas_aluno.nota_total), 2) AS menor_nota,
    ROUND(MAX(notas_aluno.nota_total), 2) AS maior_nota
FROM avaliacao a
INNER JOIN usuario_avaliacao ua ON ua.id_avaliacao = a.id_avaliacao
INNER JOIN usuario u ON u.id_usuario = ua.id_usuario
INNER JOIN (
    SELECT
        r.id_usuario,
        r.id_avaliacao,
        SUM(COALESCE(r.nota_obtida, 0)) AS nota_total
    FROM resposta r
    GROUP BY r.id_usuario, r.id_avaliacao
) notas_aluno ON notas_aluno.id_usuario = ua.id_usuario
             AND notas_aluno.id_avaliacao = ua.id_avaliacao
WHERE ua.data_entrega IS NOT NULL
  AND a.data_inicio BETWEEN '2026-09-01 00:00:00' AND '2026-12-31 23:59:59'
  AND u.turma IN ('TURMA-A', 'TURMA-B')
GROUP BY a.id_avaliacao, a.titulo, a.data_inicio
HAVING COUNT(DISTINCT ua.id_usuario) >= 1
ORDER BY a.data_inicio ASC;

-- Relatorio 2. Notas de um aluno comparadas com a media da turma dele
-- usa JOIN, subconsulta correlacionada, GROUP BY, SUM, AVG e ORDER BY
SELECT
    a.id_avaliacao,
    a.titulo,
    a.data_inicio,
    u.nome AS aluno,
    u.turma,
    ROUND(SUM(COALESCE(r.nota_obtida, 0)), 2) AS nota_aluno,
    ROUND((
        SELECT AVG(sub.nota_total)
        FROM (
            SELECT r2.id_usuario, SUM(COALESCE(r2.nota_obtida, 0)) AS nota_total
            FROM resposta r2
            INNER JOIN usuario u2 ON u2.id_usuario = r2.id_usuario
            WHERE r2.id_avaliacao = a.id_avaliacao
              AND u2.turma = u.turma
            GROUP BY r2.id_usuario
        ) sub
    ), 2) AS media_turma
FROM resposta r
INNER JOIN avaliacao a ON a.id_avaliacao = r.id_avaliacao
INNER JOIN usuario u ON u.id_usuario = r.id_usuario
WHERE u.id_usuario = 3
GROUP BY a.id_avaliacao, a.titulo, a.data_inicio, u.nome, u.turma
ORDER BY a.data_inicio ASC;

-- Relatorio 3. As 10 questoes com mais erros
-- usa JOIN, GROUP BY, COUNT, SUM, RANK, ORDER BY, FETCH FIRST e LIKE
SELECT
    RANK() OVER (ORDER BY
        ROUND(100.0 * SUM(CASE WHEN COALESCE(r.nota_obtida, 0) < aq.valor THEN 1 ELSE 0 END) / COUNT(*), 2) DESC,
        COUNT(*) DESC
    ) AS posicao,
    q.id_questao,
    q.enunciado,
    q.tipo,
    COUNT(*) AS total_respostas,
    SUM(CASE WHEN COALESCE(r.nota_obtida, 0) < aq.valor THEN 1 ELSE 0 END) AS total_erros_ou_parciais,
    ROUND(100.0 * SUM(CASE WHEN COALESCE(r.nota_obtida, 0) < aq.valor THEN 1 ELSE 0 END) / COUNT(*), 2) AS percentual_erro
FROM questao q
INNER JOIN avaliacao_questao aq ON aq.id_questao = q.id_questao
INNER JOIN resposta r ON r.id_avaliacao = aq.id_avaliacao AND r.id_questao = aq.id_questao
WHERE LOWER(q.enunciado) LIKE '%'
GROUP BY q.id_questao, q.enunciado, q.tipo
HAVING COUNT(*) >= 1
ORDER BY percentual_erro DESC, total_respostas DESC
FETCH FIRST 10 ROWS ONLY;

-- Relatorio 4. Alunos que ainda nao entregaram cada avaliacao
-- usa LEFT JOIN, COUNT, GROUP BY e ORDER BY
SELECT
    a.id_avaliacao,
    a.titulo,
    u.id_usuario,
    u.nome AS aluno,
    u.turma,
    CASE
        WHEN ua.data_entrega IS NULL THEN 'PENDENTE'
        ELSE 'ENTREGUE'
    END AS status_entrega,
    COUNT(r.id_resposta) AS questoes_respondidas
FROM usuario_avaliacao ua
INNER JOIN avaliacao a ON a.id_avaliacao = ua.id_avaliacao
INNER JOIN usuario u ON u.id_usuario = ua.id_usuario
LEFT JOIN resposta r ON r.id_usuario = ua.id_usuario AND r.id_avaliacao = ua.id_avaliacao
WHERE ua.data_entrega IS NULL
GROUP BY a.id_avaliacao, a.titulo, u.id_usuario, u.nome, u.turma, ua.data_entrega
ORDER BY a.id_avaliacao ASC, u.turma ASC, u.nome ASC;

-- Relatorio 4. Total de entregues e pendentes para o grafico
SELECT
    a.id_avaliacao,
    a.titulo,
    COUNT(ua.id_usuario) AS total_atribuidos,
    COUNT(ua.data_entrega) AS total_entregues,
    COUNT(ua.id_usuario) - COUNT(ua.data_entrega) AS total_pendentes
FROM avaliacao a
LEFT JOIN usuario_avaliacao ua ON ua.id_avaliacao = a.id_avaliacao
GROUP BY a.id_avaliacao, a.titulo
ORDER BY a.data_inicio ASC;
