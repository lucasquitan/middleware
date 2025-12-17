import db from './init'
import { Ticket } from './types'

export class TicketRepository {
  /**
   * Cria um novo ticket no banco de dados
   */
  create(ticket: Ticket): Ticket {
    const stmt = db.prepare(`
      INSERT INTO ticket (protocolo, owner, nome, descricao, fila)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(protocolo) DO UPDATE SET
        owner = excluded.owner,
        nome = excluded.nome,
        descricao = excluded.descricao,
        fila = excluded.fila,
        updated_at = CURRENT_TIMESTAMP
    `)

    stmt.run(
      ticket.protocolo,
      ticket.owner,
      ticket.nome,
      ticket.descricao,
      ticket.fila,
    )

    const result = this.findByProtocolo(ticket.protocolo)
    if (!result) {
      throw new Error(
        `Failed to create ticket with protocolo: ${ticket.protocolo}`,
      )
    }
    return result
  }

  /**
   * Busca um ticket pelo protocolo
   */
  findByProtocolo(protocolo: string): Ticket | undefined {
    const stmt = db.prepare('SELECT * FROM ticket WHERE protocolo = ?')
    return stmt.get(protocolo) as Ticket | undefined
  }

  /**
   * Busca tickets por CPF (owner)
   */
  findByOwner(owner: string): Ticket[] {
    const stmt = db.prepare(
      'SELECT * FROM ticket WHERE owner = ? ORDER BY created_at DESC',
    )
    return stmt.all(owner) as Ticket[]
  }

  /**
   * Busca tickets por CPF e protocolo (validação completa)
   */
  findByProtocoloAndOwner(
    protocolo: string,
    owner: string,
  ): Ticket | undefined {
    const stmt = db.prepare(
      'SELECT * FROM ticket WHERE protocolo = ? AND owner = ?',
    )
    return stmt.get(protocolo, owner) as Ticket | undefined
  }

  /**
   * Lista todos os tickets
   */
  findAll(): Ticket[] {
    const stmt = db.prepare('SELECT * FROM ticket ORDER BY created_at DESC')
    return stmt.all() as Ticket[]
  }

  /**
   * Deleta um ticket pelo protocolo
   */
  delete(protocolo: string): boolean {
    const stmt = db.prepare('DELETE FROM ticket WHERE protocolo = ?')
    const result = stmt.run(protocolo)
    return result.changes > 0
  }
}

export const ticketRepository = new TicketRepository()
