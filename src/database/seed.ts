import { ticketRepository } from './ticketRepository'

const tickets = [
  {
    protocolo: '1765392696777',
    owner: '80713245977',
    nome: 'Maria',
    descricao: 'Solicitar Aposentadoria',
    fila: 'SGP_Voz',
  },
  {
    protocolo: '1765392788425',
    owner: '44577744058',
    nome: 'Antônio',
    descricao: 'Solicitar Aposentadoria',
    fila: 'SGP_Voz',
  },
  {
    protocolo: '1765392795637',
    owner: '44577744058',
    nome: 'Antônio',
    descricao: 'Solicitar declaração para ex-servidores e ex-pensionistas',
    fila: 'SGP_Voz',
  },
  {
    protocolo: '1765392822240',
    owner: '44577744058',
    nome: 'Antônio',
    descricao: 'Solicitar Aposentadoria',
    fila: 'SGP_Voz',
  },
  {
    protocolo: '1765392781234',
    owner: '74185296313',
    nome: 'Francisca',
    descricao: 'Incluir nova entrada',
    fila: 'SEGES_Voz',
  },
  {
    protocolo: '1765392768526',
    owner: '74185296313',
    nome: 'Francisca',
    descricao: 'Correção de DARF',
    fila: 'SPU_Voz',
  },
  {
    protocolo: '1765392789856',
    owner: '36925814720',
    nome: 'José',
    descricao: 'Ratificar declaração de imóvel de domínio',
    fila: 'SPU_Voz',
  },
  {
    protocolo: '1765392789874',
    owner: '79846513201',
    nome: 'Paulo',
    descricao: 'Regularizar dívidas',
    fila: 'SEGES_Voz',
  },
]

export function seedDatabase() {
  console.log('🌱 Populando banco de dados com dados iniciais...')

  tickets.forEach((ticket) => {
    ticketRepository.create(ticket)
  })

  console.log(`✅ ${tickets.length} tickets inseridos no banco de dados`)
}
