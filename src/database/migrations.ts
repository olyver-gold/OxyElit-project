export const migrations = `
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS usuarios (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    nome       TEXT    NOT NULL,
    email      TEXT    NOT NULL UNIQUE,
    senha_hash TEXT    NOT NULL,
    papel      TEXT    NOT NULL
                CHECK(papel IN ('admin','fisioterapeuta','tecnico')),
    ativo      INTEGER NOT NULL DEFAULT 1,
    criado_em  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS pacientes (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    nome              TEXT    NOT NULL,
    data_nascimento   TEXT,
    genero            TEXT    CHECK(genero IN ('masculino','feminino','outro')),
    diagnostico       TEXT,
    fisioterapeuta_id INTEGER NOT NULL REFERENCES usuarios(id),
    ativo             INTEGER NOT NULL DEFAULT 1,
    criado_em         TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS prescricoes (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id   INTEGER NOT NULL REFERENCES pacientes(id),
    fr_min        REAL,
    fr_max        REAL,
    ie_inspiracao REAL,
    ie_expiracao  REAL,
    pressao_min   REAL,
    pressao_max   REAL,
    observacoes   TEXT,
    criado_por    INTEGER REFERENCES usuarios(id),
    criado_em     TEXT    NOT NULL DEFAULT (datetime('now')),
    ativa         INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS sessoes (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id       INTEGER NOT NULL REFERENCES pacientes(id),
    fisioterapeuta_id INTEGER NOT NULL REFERENCES usuarios(id),
    prescricao_id     INTEGER REFERENCES prescricoes(id),
    inicio            TEXT    NOT NULL DEFAULT (datetime('now')),
    fim               TEXT,
    duracao_segundos  INTEGER,
    observacoes       TEXT,
    status            TEXT    NOT NULL DEFAULT 'ativa'
                      CHECK(status IN ('ativa','encerrada','cancelada'))
  );

  CREATE TABLE IF NOT EXISTS leituras (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    sessao_id  INTEGER NOT NULL REFERENCES sessoes(id),
    timestamp  TEXT    NOT NULL DEFAULT (datetime('now','subsec')),
    pressao_pa REAL    NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_leituras_sessao
    ON leituras(sessao_id, timestamp);

  CREATE TABLE IF NOT EXISTS ciclos_respiratorios (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    sessao_id     INTEGER NOT NULL REFERENCES sessoes(id),
    timestamp_ini TEXT    NOT NULL,
    ti_segundos   REAL    NOT NULL,
    te_segundos   REAL    NOT NULL,
    pressao_pico  REAL,
    pressao_media REAL,
    atipico       INTEGER DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_ciclos_sessao
    ON ciclos_respiratorios(sessao_id);

  CREATE TABLE IF NOT EXISTS metricas_sessao (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    sessao_id             INTEGER NOT NULL UNIQUE REFERENCES sessoes(id),
    fr_media              REAL,
    fr_desvio_padrao      REAL,
    ie_media              REAL,
    ti_medio              REAL,
    te_medio              REAL,
    pressao_media         REAL,
    pressao_desvio_padrao REAL,
    total_ciclos          INTEGER,
    ciclos_atipicos       INTEGER DEFAULT 0,
    score_evolucao        REAL,
    calculado_em          TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ajustes_valvula (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    sessao_id  INTEGER NOT NULL REFERENCES sessoes(id),
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    timestamp  TEXT    NOT NULL DEFAULT (datetime('now')),
    observacao TEXT
  );
`;