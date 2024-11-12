import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { clientMessageText, agentId } = await req.json();

        // Verifica se a mensagem do cliente está completa
        if (!clientMessageText) {
            return NextResponse.json({ error: "Mensagem do cliente é obrigatória" }, { status: 400 });
        }

        // Gera resposta da IA
        const response = await fetch("http://localhost:3000/api/groq", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ content: clientMessageText, agentId }),
        })

        const data = await response.json()
        const aiMessage = {
            id: Date.now(),
            text: data.content,
            sender: "ai",
        }

        // Envia resposta via API externa
        await fetch(
            "https://symplus-evolution.3g77fw.easypanel.host/message/sendText/SymplusTalk",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    apikey: "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ",
                },
                body: JSON.stringify({
                    number: "5577988633518",
                    options: {
                        delay: 1200,
                        presence: "composing",
                        linkPreview: true,
                    },
                    textMessage: {
                        text: aiMessage.text,
                    },
                }),
            }
        )

        console.log("Mensagem enviada:", aiMessage);

        return NextResponse.json(aiMessage, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erro ao processar a resposta da IA" }, { status: 500 });
    }
}