import { db } from "@/lib/db";  // Certifique-se de que o db está configurado corretamente
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { prompt, agentName } = await request.json();

    try {
        const response = await db.promptModels.create({
            data: {
                agentName,
                prompt
            }
        });

        return NextResponse.json({ message: "Criado com sucesso!", response });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Erro ao criar o prompt.", error}, { status: 500 });
    }
}
