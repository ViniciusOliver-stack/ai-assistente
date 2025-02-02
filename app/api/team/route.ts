import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if(!session || !session.user) {
        return NextResponse.json({error: "Operação não permitida"}, {status: 401})
    }

    const {name, description} = await req.json()

    if(!name) {
        return NextResponse.json({error: "Nome da equipe é obrigatório"}, {status: 400})
    }

    try{
        //Busca o usuário logado
        const user = await db.user.findUnique({
            where: {
                email: session.user.email as string
            },
        })

        if (!user) {
            return NextResponse.json({ error: "Usuário não encontrado!" }, { status: 403 });
        }

        const teamCount = await db.team.count({
            where: { ownerId: user.id },
        });

        if (teamCount >= 1) {
            return NextResponse.json({ error: "Limite de equipes atingido." }, { status: 403 });
        }

        const newTeam = await db.team.create({
            data: {
                name,
                description,
                ownerId: user.id,
                members: {
                    create: {
                        userId: user.id,
                        role: "admin",
                    },
                },
            },
        });

        // Atualizar a quantidade total de equipes do usuário (se estiver rastreando manualmente)
        await db.user.update({
            where: { id: user.id },
            data: { totalTeams: { increment: 1 } },
        });

        revalidatePath("/config/team")

        return NextResponse.json(newTeam, {status: 201})
    }catch(error){
        // console.log(error)
        return NextResponse.json({error: "Erro ao criar equipe"}, {status: 500})
    }
}