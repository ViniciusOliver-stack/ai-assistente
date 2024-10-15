import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const {userId, newUsername} = await req.json()

        if(!userId || !newUsername) {
            return NextResponse.json({error: "Dados insuficientes"}, {status: 400})
        }

        const updatedUser = await db.user.update({
            where: {
                id: userId
            },
            data: {
                name: newUsername
            }
        })

        return NextResponse.json({ message: "Usuário atualizado com sucesso", user: updatedUser });
    }catch(error) {
        console.error("Erro ao atualizar usuário:", error);
        return NextResponse.json({ error: "Erro ao atualizar usuário" }, { status: 500 });
    }
}