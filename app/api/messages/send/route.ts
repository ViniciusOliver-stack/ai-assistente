// app/api/messages/send/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { text, phoneNumber, instanceName, conversationId, metadata } = body

    // Criar ou atualizar a conversa
    const conversation = await db.conversation.upsert({
      where: {
        id: conversationId,
      },
      create: {
        status: 'OPEN',
        instanceWhatsApp: instanceName,
        lastActivity: new Date(),
        participants: {
          create: {
            participantId: phoneNumber,
            role: 'ai',
          },
        },
      },
      update: {
        lastActivity: new Date(),
      },
    })

    // Criar a mensagem
    const message = await db.message.create({
      data: {
        conversationId: conversation.id,
        text,
        sender: 'ai',
        recipientId: phoneNumber,
        messageType: 'text',
        status: 'sent',
        metadata,
      },
    })

    return NextResponse.json({ success: true, message })
  } catch (error) {
    console.error('Error saving message:', error)
    return NextResponse.json({ success: false, error: 'Failed to save message' }, { status: 500 })
  }
}