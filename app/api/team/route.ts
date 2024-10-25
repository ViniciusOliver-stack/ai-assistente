import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPlanByPrice } from "@/services/stripe/stripe";
import { getServerSession } from "next-auth";
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

        if (!user || !user.stripePriceId) {
            return NextResponse.json({ error: "Plano do usuário não encontrado" }, { status: 403 });
        }

        // Obtém o plano com base no priceId do Stripe
        const userPlan = getPlanByPrice(user.stripePriceId);

        const teamCount = await db.team.count({
            where: { ownerId: user.id },
        });

        if (teamCount >= userPlan.quota.teams) {
            return NextResponse.json({ error: "Limite de equipes atingido para o seu plano" }, { status: 403 });
        }

        console.log(name, description)

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

        return NextResponse.json(newTeam, {status: 201})
    }catch(error){
        console.log(error)
        return NextResponse.json({error: "Erro ao criar equipe"}, {status: 500})
    }
}