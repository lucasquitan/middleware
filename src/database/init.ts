import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import LoggerComponent from '../utils/loggerBuilder'

const logger = new LoggerComponent('Database')
const dbPath = path.join(process.cwd(), 'database', 'tickets.db')
const schemaPath = path.join(process.cwd(), 'database', 'schema.sql')

// Garante que o diretório database existe
const dbDir = path.dirname(dbPath)
if (!fs.existsSync(dbDir)) {
  logger.warn('Database directory does not exist, creating...')
  fs.mkdirSync(dbDir, { recursive: true })
  logger.info('Database directory created')
}

// Cria ou conecta ao banco de dados
logger.info('Connecting to database...')
export const db = new Database(dbPath)
logger.info('Database connected')

// Habilita foreign keys
db.pragma('foreign_keys = ON')

// Lê e executa o schema SQL
if (fs.existsSync(schemaPath)) {
  logger.info('Reading schema file...')
  const schema = fs.readFileSync(schemaPath, 'utf-8')
  db.exec(schema)
  logger.info('Database schema initialized successfully')
} else {
  logger.warn('Schema file not found, creating table manually...')

  // Cria a tabela diretamente se o schema.sql não existir
  db.exec(`
    CREATE TABLE IF NOT EXISTS ticket (
      protocolo TEXT PRIMARY KEY,
      owner TEXT NOT NULL,
      nome TEXT NOT NULL,
      descricao TEXT NOT NULL,
      fila TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_ticket_owner ON ticket(owner);
    CREATE INDEX IF NOT EXISTS idx_ticket_fila ON ticket(fila);
  `)
}

// Fecha a conexão ao encerrar o processo
process.on('exit', () => {
  db.close()
})

process.on('SIGINT', () => {
  db.close()
  process.exit(0)
})

export default db
