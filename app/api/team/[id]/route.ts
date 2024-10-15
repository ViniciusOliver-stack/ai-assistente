import { db } from "@/lib/db"
import { getSession } from "next-auth/react"
import { NextResponse } from "next/server"

export async function GET(req: Request, {params}: {params: {id: string}}) {
    const {id} = params

    try {
        const team = await db.team.findUnique({
            where: {id},
            include:{
                members: {
                    include: {
                        user: true
                    }
                }
            }
        })

        if(!team) {
            return new Response("Equipe não encontrada", {status: 404})
        }

        return NextResponse.json(team, {status: 200})
    }catch(error){
        console.error("Erro ao obter equipe", error)
        return NextResponse.json({error: "Erro ao obter equipe"}, {status: 500})
    }
}

export async function PUT(req: Request, {params}: {params: {id: string}}) {
    const session = await getSession({req})

    if(!session || !session.user) {
        return NextResponse.json({error: "Usuário não autenticado"}, {status: 401})
    }

    const {id} = params
    const {name, description} = await req.json()

    try{
        //Verifica se o usuário é membro da equipe
        const teamMember = await db.teamMember.findFirst({
            where:{
                teamId: id,
                userId: session.user.id
            }
        })

        if(!teamMember || teamMember.role !== "admin") {
            return NextResponse.json({error: "Acesso negado"}, {status: 403})
        }

        const updatedTeam = await db.team.update({
            where: {id},
            data: {
                name,
                description
            }
        })

        return NextResponse.json(updatedTeam, { status: 200 });
    }catch(error){
        console.error("Erro ao atualizar equipe", error)
        return NextResponse.json({error: "Erro ao atualizar equipe"}, {status: 500})
    }
}

export async function DELETE(req: Request, {params}: {params:  {id: string}}) {
    const session = await getSession({ req });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    const { id } = params;

    try{
        const teamMember = await db.teamMember.findFirst({
            where: {
                teamId: id,
                userId: session.user.id,
            }
        })

        if(!teamMember || teamMember.role !== "admin") {
            return NextResponse.json({error: "Acesso negado"}, {status: 403})
        }

        await db.teamMember.delete({
            where: {id}
        })

        return NextResponse.json({message: "Equipe deletada com sucesso"}, {status: 200})
    } catch(error) {
        console.error("Erro ao deletar equipe", error)
        return NextResponse.json({error: "Erro ao deletar equipe"}, {status: 500})
    }
}