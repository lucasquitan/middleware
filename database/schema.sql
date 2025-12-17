-- Tabela de tickets baseada na estrutura de retorno de queryTicketsDetails.ts
CREATE TABLE IF NOT EXISTS ticket (
  protocolo TEXT PRIMARY KEY,
  owner TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  fila TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhorar performance em consultas comuns
CREATE INDEX IF NOT EXISTS idx_ticket_owner ON ticket(owner);
CREATE INDEX IF NOT EXISTS idx_ticket_fila ON ticket(fila);
