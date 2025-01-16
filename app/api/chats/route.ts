import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    try {
        const {searchParams} = new URL(request.url)
        const teamId = searchParams.get('teamId')
        const instanceId = searchParams.get('instanceId')
        const agentId = searchParams.get('agentId')

        if(!teamId || !instanceId || !agentId) {
            return NextResponse.json(
                { error: 'Parâmetros obrigatórios faltando' },
                { status: 400 }
            )
        }

        const conversation = await db.conversation.findMany({
            where: {
                instanceWhatsApp: instanceId,
                status: {
                    not: "CLOSED"
                }
            },
            include: {
                participants: true,
                messages: {
                    orderBy: {
                        timestamp: "desc"
                    },
                    take: 1
                }
            }
        })

        //Formata os dados para o formato esperado pelo frontend
        const chats = conversation.map(conversation => {
            const userParticipant = conversation.participants.find(participant => participant.role === 'USER')
            const lastMessage = conversation.messages[0]
            
            let nameUser = ""
            if(lastMessage?.recipientId === "DEFAULT_RECIPIENT") {
                nameUser = lastMessage.sender
            } else {
                nameUser = lastMessage.recipientId
            }

            return {
                id: conversation.id,
                name: nameUser || "Unknown",
                phoneNumber: userParticipant?.participantId,
                lastMessage: lastMessage.text,
                timestamp: lastMessage.timestamp || conversation.lastActivity,
                unreadCount: 0,
                ticketNumber: conversation.ticketNumber,
                status: conversation.status
            }
        })

        return NextResponse.json(chats)
    } catch (error) {
        console.error('Erro ao buscar chats:', error)
        return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
        )
    }
}