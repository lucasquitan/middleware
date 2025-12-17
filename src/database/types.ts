// Interface baseada na estrutura de retorno de queryTicketsDetails.ts
export interface Ticket {
  protocolo: string
  owner: string
  nome: string
  descricao: string
  fila: string
  created_at?: string
  updated_at?: string
}
