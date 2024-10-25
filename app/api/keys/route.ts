import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    const {selectedTemId, provider, apiKey} = await req.json()

    if (!selectedTemId || !provider || !apiKey) {
        return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    try {
        const newApiKey = await db.apiKey.create({
            data: {
              key: apiKey,
              provider: provider,
              team: {
                connect: {
                  id: selectedTemId,
                },
              },
            },
          })
    
        return NextResponse.json(newApiKey, { status: 200 })
    }catch(error) {
        console.error('Erro ao salvar a chave de API:', error)
        return NextResponse.json({ error: 'Erro ao salvar a chave de API' }, { status: 500 })
    }
}