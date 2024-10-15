import { db } from "@/lib/db";
import { getSession } from "next-auth/react";
import { NextResponse } from "next/server";

export async function POST(req: Request, {params}: {params: {id: string}}) {
    const session = await getSession({req})

    if(!session || !session.user) {
        return Response.json({error: "Usuário não autenticado"}, {status: 401})
    }

    const {id} = params
    const {userId, role} = await req.json()

    try{
        const teamMember = await db.teamMember.findFirst({
            where: {
                teamId: id,
                userId: session.user.id,
            }
        })

        if(!teamMember || teamMember.role !== "admin") {
            return Response.json({error: "Acesso negado"}, {status: 403})
        }

        //Verifica se o usuário a ser adicionado já está na equipe

        const existingMember = await db.teamMember.findUnique({
            where: {
                userId_teamId: {
                    userId,
                    teamId: id
                }
            }
        })

        if(existingMember) {
            return Response.json({error: "Usuário já é membro desta equipe"}, {status: 400})
        }

        //Adicionar o membro à equipe

        const newMember = await db.teamMember.create({
            data: {
                userId,
                teamId: id,
                role: role || "member"
            }
        })

        return NextResponse.json(newMember, {status: 201})
    }catch(error) {
        console.error("Erro ao adicionar membro à equipe", error)
        return NextResponse.json({error: "Erro ao adicionar membro à equipe"}, {status: 500})
    }
}

export async function DELETE(req: Request, {params}: {params: {id: string}}) {
    const session = await getSession({ req });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    const { id, userId } = params;

    try {
        //Verifica se o usuário que está removendo é ADM

        const teamMember = await db.teamMember.findFirst({
            where: {
                teamId: id,
                userId: "cm1wzs4um0000txq4xutxniyj",
            }
        })

        if(!teamMember || teamMember.role !== "admin") {
            return NextResponse.json({error: "Acesso negado"}, {status: 403})
        }

        //remove o membro da equipe

        await db.teamMember.delete({
            where: {
                userId_teamId: {
                    userId,
                    teamId: id
                }
            }
        })

        return NextResponse.json({message: "Membro removido com sucesso"}, {status: 200})
    } catch(error) {
        console.error("Erro ao remover membro da equipe", error)
        return NextResponse.json({error: "Erro ao remover membro da equipe"}, {status: 500})
    }
}