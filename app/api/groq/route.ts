import { GroqAI } from "@/lib/groq-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const data = await req.json()

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