import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { createInviteEmailHtml } from "@/lib/invite-email"
import { transporter } from "@/lib/mail"
import { getPlanByPrice } from "@/services/stripe/stripe"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    const { selectedTemId, email, role } = await req.json()
    const session = await getServerSession(authOptions)
    
    if(!selectedTemId || !email || !role) {
        return NextResponse.json({error:"Dados inválidos"},{status: 400})
    }

    try {
        let user = await db.user.findUnique({where: {email}})

        if(!user) {
            user = await db.user.create({data: {email}})
        }

        const userLoggedIn = await db.user.findUnique({
            where: {
                email: session?.user.email
            },
        })

        const userPlan = getPlanByPrice(userLoggedIn?.stripePriceId as string);
        const membersCount = await db.teamMember.count({
            where: { teamId: selectedTemId },
        });

        if (membersCount >= userPlan.quota.members) {
            return NextResponse.json({ 
                error: "Limite de membros por equipe atingido para o seu plano" 
            }, { status: 403 });
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
            return NextResponse.json({
                error: "Membro já existe na equipe"
            }, {status: 400})
        }

        await db.teamMember.create({
            data: {
                teamId: selectedTemId,
                userId: user.id,
                role
            }
        })

        const inviteLink = `${process.env.NEXTAUTH_URL}/join-team?teamId=${selectedTemId}`
        
        // Envio do email usando Nodemailer/Mailtrap
        await transporter.sendMail({
            from: '"Sua Empresa" <noreply@suaempresa.com>',
            to: email,
            subject: 'Convite para ingressar na equipe',
            html: createInviteEmailHtml(role, inviteLink)
        });

        return NextResponse.json("Convite enviado com sucesso", {status: 200})

    } catch (error) {
        console.error("Erro ao enviar convite:", error)
        return NextResponse.json({error: "Erro ao enviar convite"}, {status: 500})
    }
}