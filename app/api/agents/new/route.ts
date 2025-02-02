//Criação de agentes no Wizard

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if(!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {name, descriptionAgent} = await req.json()

    try {
        //Busca a equipe do usuário
        const userTeam = await db.team.findFirst({
            where: {
                ownerId: session.user.id
            },
            select: {
                id: true
            }
        })

        if(!userTeam) {
            return NextResponse.json({ error: "Crie uma equipe primeiro" }, { status: 400 })
        }

        const newAgent = await db.agent.create({
            data: {
                title: name,
                description: descriptionAgent,
                provider: 'OPENAI',
                team: {
                    connect: {
                        id: userTeam.id
                    }
                }
            }
        })

        return NextResponse.json(newAgent, { status: 201 });
    } catch (error) {
        console.error("Erro ao criar agente:", error);
        return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 }
        );
    }
}