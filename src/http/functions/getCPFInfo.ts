import { FastifyReply, FastifyRequest } from 'fastify'

import dotenv from 'dotenv'

dotenv.config()

const debug: boolean = process.env.NODE_ENV === 'debug' || false

interface GetCPFInfoRequest {
  cpf: string
}

export async function getCPFInfo(request: FastifyRequest, reply: FastifyReply) {
  const { cpf } = request.query as GetCPFInfoRequest

  if (!cpf) {
    return reply.status(200).send({
      succes: false,
      original_status: 400,
      response: {
        error: 'CPF is required',
        timestamp: new Date().toISOString(),
      },
    })
  }

  const url = `https://api.portaldatransparencia.gov.br/api-de-dados/servidores?cpf=${cpf}&pagina=1`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'chave-api-dados': process.env.TOKEN || 'error-key-not-found',
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    console.log(`${new Date().toISOString()} 🔍 [INFO] CPF Request:`, cpf)

    console.log(
      `${new Date().toISOString()} 🔍 [INFO] Response Status:`,
      response.status,
    )
    const data: any = await response.json()
    if (debug) {
      console.log(`${new Date().toISOString()} 🐛[DEBUG] Response Data:`, data)
    }

    if (
      data !== null &&
      data !== undefined &&
      data.length > 0 &&
      data[0] !== undefined
    ) {
      const name: string = (data as any)[0].servidor.pessoa.nome.toUpperCase()
      const situacao: string = (data as any)[0].servidor.situacao.toUpperCase()
      const orgao: string = (
        data as any
      )[0].servidor.orgaoServidorLotacao.nomeOrgaoVinculado.toUpperCase()
      const sigla: string = (
        data as any
      )[0].servidor.orgaoServidorLotacao.sigla.toUpperCase()

      const responseData = {
        CPF: cpf,
        NOME: name,
        SITUACAO: situacao,
        ORGAO: orgao,
        SIGLA: sigla,
      }

      if (debug) {
        console.log(
          `${new Date().toISOString()} ✅ [DEBUG] Response:`,
          responseData,
        )
      }
      return reply.status(200).send({
        success: true,
        original_status: response.status,
        response: responseData,
        timestamp: new Date().toISOString(),
      })
    } else {
      console.log(
        `${new Date().toISOString()} ❌ [INFO] Response: CPF não encontrado`,
      )
      return reply.status(200).send({
        success: true,
        original_status: 404,
        response: {
          message: 'CPF não encontrado na base.',
          timestamp: new Date().toISOString(),
        },
      })
    }
  } catch (error) {
    console.error(`${new Date().toISOString()} ❌ [DEBUG] Error:`, error)
    return reply.status(200).send({
      success: false,
      original_status: 500,
      response: {
        error: 'Erro interno do servidor',
        timestamp: new Date().toISOString(),
      },
    })
  }
}
