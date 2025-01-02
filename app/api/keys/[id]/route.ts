import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PUT(req: Request) {
    const { selectedTeamId, provider, apiKey } = await req.json()
    const keyId = req.url.split('/').pop() // Get the key ID from the URL
  
    if (!selectedTeamId || !provider || !apiKey || !keyId) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }
  
    try {
      const updatedApiKey = await db.apiKey.update({
        where: {
          id: keyId,
          teamId: selectedTeamId,
        },
        data: {
          key: apiKey,
        },
      })
  
      return NextResponse.json(updatedApiKey, { status: 200 })
    } catch (error) {
      console.error('Erro ao atualizar a chave de API:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar a chave de API' },
        { status: 500 }
      )
    }
  }