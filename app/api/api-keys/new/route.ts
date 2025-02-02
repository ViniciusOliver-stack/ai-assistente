import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if(!session?.user) {
        return new Response("Unauthorized", { status: 401 })
    }

    const {key, provider = "OPENAI"} = await req.json()

    try {
        //Buscar a equipe do usuário
        const userTeam = await db.team.findFirst({
            where: {
                ownerId: session.user.id,
            },
            select: {
                id: true
            }
        })

        if (!userTeam) {
            return NextResponse.json({ error: "Crie uma equipe primeiro" }, { status: 400 });
        }

        //Criar a chave de API
        const newApiKey = await db.apiKey.create({
            data: {
                key,
                provider,
                teamId: userTeam.id
            }
        })

        return NextResponse.json({ 
            ...newApiKey,
            plainKey: key // Mostrar a chave apenas uma vez
          }, { status: 201 });
    } catch (error) {
        console.error("Erro ao criar chave de API:", error);
        return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 }
        );
    }
}