import { db } from "@/lib/db"
import { NextResponse } from "next/server"

// GET route to fetch API keys for a team
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const teamId = searchParams.get('teamId')

  if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 })
  }

  try {
      const apiKeys = await db.apiKey.findMany({
          where: {
              teamId: teamId
          }
      })

      return NextResponse.json(apiKeys)
  } catch (error) {
      console.error('Error fetching API keys:', error)
      return NextResponse.json({ error: 'Error fetching API keys' }, { status: 500 })
  }
}

export async function POST(req: Request) {
    const {selectedTeamId, provider, apiKey} = await req.json()

    if (!selectedTeamId || !provider || !apiKey) {
        return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    try {
      const existingKey = await db.apiKey.findFirst({
        where: {
          teamId: selectedTeamId,
          provider: provider
        }
      })

      if(existingKey) {
        return NextResponse.json({ error: 'Chave de API já cadastrada' }, { status: 400 })
      }

      const newApiKey = await db.apiKey.create({
        data: {
          key: apiKey,
          provider: provider,
          team: {
            connect: {
              id: selectedTeamId
            }
          }
        }
      })

      return NextResponse.json(newApiKey, { status: 200 })
    }catch(error) {
        console.error('Erro ao salvar a chave de API:', error)
        return NextResponse.json({ error: 'Erro ao salvar a chave de API' }, { status: 500 })
    }
}