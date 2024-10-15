import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { resend } from "@/lib/resend"
import { getPlanByPrice } from "@/services/stripe/stripe"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    const { selectedTemId, email, role } = await req.json()

    const session = await getServerSession(authOptions)
    
    console.log(selectedTemId, email, role)

    if(!selectedTemId || !email || !role) {
        return NextResponse.json({error:"Dados inválidos"},{status: 400})
    }

    try {
        let user = await db.user.findUnique({where: {email}})

        if(!user) {
            user = await db.user.create({data: {email}})
        }

        //Busca o usuário logado
        const userLoggedIn = await db.user.findUnique({
            where: {
                email: session?.user.email
            },
        })

        // Obtém o plano com base no priceId do Stripe
        const userPlan = getPlanByPrice(userLoggedIn?.stripePriceId as string);

        // Conta o número de membros na equipe correta (baseado no selectedTemId)
        const membersCount = await db.teamMember.count({
            where: { teamId: selectedTemId },  // Aqui usa o selectedTemId
        });

        // Verifica se o limite de membros para o plano foi atingido
        if (membersCount >= userPlan.quota.members) {
            return NextResponse.json({ error: "Limite de membros por equipe atingido para o seu plano" }, { status: 403 });
        }

        const existingMember = await db.teamMember.findUnique({
            where: {
                userId_teamId: {
                    teamId: selectedTemId,
                    userId: user.id
                }
            }
        })

        if(existingMember) {
            return NextResponse.json({error: "Membro já existe na equipe"}, {status: 400})
        }

        await db.teamMember.create({
            data: {
                teamId: selectedTemId,
                userId: user.id,
                role
            }
        })

        const inviteLink = `${process.env.NEXTAUTH_URL}/join-team?teamId=${selectedTemId}`

        await resend.emails.send({
            to: email,
            from: 'vinicius.so.contato@gmail.com',
            subject: 'Convite para ingressar na equipe',
            html: `<p>Você foi convidado para ingressar na equipe como <strong>${role}</strong>. Clique no link abaixo para aceitar o convite:</p>
            <a href="${inviteLink}">Ingressar na equipe</a>`
        })

        return NextResponse.json("Convite enviado com sucesso", {status: 200})

    } catch (error) {
        console.error("Erro ao enviar convite", error)
        return NextResponse.json({error: "Erro ao enviar convite"}, {status: 500})
    }
}