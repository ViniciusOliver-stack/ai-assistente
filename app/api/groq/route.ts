import { authOptions } from "@/lib/auth";
import { GroqAI } from "@/lib/groq-ai";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const data = await req.json()

    // const session = await getServerSession(authOptions)

    // if(req.method !== "POST" || !session?.user) {
    //     return NextResponse.json({ error: "Ops, verifique novamente a requisição" }, { status: 400 });
    // }

    try {
        const chatCompletion = await GroqAI(data.content, data.agentId) 
        return NextResponse.json({
            content: chatCompletion.choices[0]?.message?.content || ""
        })
    }catch(error) {
        console.error(error)    
        return NextResponse.json({error: "Erro ao conectar com o Groq SDK"}, {status: 500})
    }
}